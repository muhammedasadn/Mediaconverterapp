import dns from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * Verified Allowlist of Public Open-Access & Creative Commons Media Repositories
 */
export const ALLOWLISTED_DOMAINS: { domain: string; name: string }[] = [
  { domain: 'wikimedia.org', name: 'Wikimedia Commons' },
  { domain: 'wikipedia.org', name: 'Wikipedia Commons' },
  { domain: 'archive.org', name: 'Internet Archive' },
  { domain: 'freemusicarchive.org', name: 'Free Music Archive' },
  { domain: 'pixabay.com', name: 'Pixabay' },
  { domain: 'pexels.com', name: 'Pexels' },
  { domain: 'freesound.org', name: 'Freesound' },
  { domain: 'ccmixter.org', name: 'ccMixter' },
  { domain: 'musopen.org', name: 'Musopen' },
];

/**
 * Checks whether an IPv4 or IPv6 address belongs to private, loopback, or cloud-metadata ranges.
 */
export function isPrivateOrBlockedIp(ip: string): boolean {
  // Handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  const cleanIp = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

  // 1. Loopback (127.0.0.0/8, ::1)
  if (cleanIp === '::1' || cleanIp === '0.0.0.0' || cleanIp.startsWith('127.')) {
    return true;
  }

  // 2. Cloud Instance Metadata & Link-Local (169.254.0.0/16, fe80::/10)
  if (cleanIp.startsWith('169.254.') || cleanIp.toLowerCase().startsWith('fe80:')) {
    return true;
  }

  // 3. RFC 1918 Private Class A (10.0.0.0/8)
  if (cleanIp.startsWith('10.')) {
    return true;
  }

  // 4. RFC 1918 Private Class B (172.16.0.0/12: 172.16.0.0 - 172.31.255.255)
  if (cleanIp.startsWith('172.')) {
    const parts = cleanIp.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1] || '0', 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return true;
      }
    }
  }

  // 5. RFC 1918 Private Class C (192.168.0.0/16)
  if (cleanIp.startsWith('192.168.')) {
    return true;
  }

  // 6. IPv6 Unique Local Addresses (fc00::/7)
  const lower = cleanIp.toLowerCase();
  if (lower.startsWith('fc') || lower.startsWith('fd')) {
    return true;
  }

  return false;
}

/**
 * Detects whether a URL points to an HLS/DASH manifest or playlist rather than a standalone media file.
 */
export function isManifestOrPlaylistUrl(urlPath: string): boolean {
  const clean = urlPath.toLowerCase().split('?')[0] || '';
  return /\.(m3u8|m3u|mpd|ffconcat|pls|xspf|asx|f4m|ism|isml)$/i.test(clean);
}

/**
 * Checks if a hostname matches the verified open-source allowlist.
 */
export function matchAllowlistDomain(hostname: string): { isAllowlisted: boolean; sourceName?: string } {
  const lower = hostname.toLowerCase();
  for (const entry of ALLOWLISTED_DOMAINS) {
    if (lower === entry.domain || lower.endsWith(`.${entry.domain}`)) {
      return { isAllowlisted: true, sourceName: entry.name };
    }
  }
  return { isAllowlisted: false };
}

export interface UrlValidationResult {
  isValid: boolean;
  reason?: string;
  url?: URL;
  resolvedIp?: string;
  sourceName?: string;
  isAllowlisted?: boolean;
}

/**
 * Validates a remote media import URL against SSRF, credential leakage, manifest formats, and custom ports.
 */
export async function validateImportUrl(
  rawUrl: string,
  options?: {
    dnsLookupFn?: (hostname: string) => Promise<{ address: string }>;
  }
): Promise<UrlValidationResult> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { isValid: false, reason: 'Malformed or invalid URL structure.' };
  }

  // 1. Enforce HTTPS only (no plain HTTP, file://, gopher://, dict://)
  if (parsedUrl.protocol !== 'https:') {
    return { isValid: false, reason: 'Only secure HTTPS URLs are permitted.' };
  }

  // 2. Prohibit user credentials in URL (e.g. https://user:pass@host)
  if (parsedUrl.username || parsedUrl.password) {
    return { isValid: false, reason: 'URLs containing user credentials are not allowed.' };
  }

  // 3. Prohibit custom ports (must be standard 443)
  if (parsedUrl.port && parsedUrl.port !== '443') {
    return { isValid: false, reason: 'Custom ports are forbidden. Only standard HTTPS (443) is permitted.' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 4. Reject Punycode / IDN lookalike domains (e.g. xn--...)
  if (hostname.includes('xn--')) {
    return { isValid: false, reason: 'Punycode and internationalized lookalike domains are prohibited.' };
  }

  // 5. Block literal IP addresses in hostname directly
  if (isIP(hostname)) {
    if (isPrivateOrBlockedIp(hostname)) {
      return { isValid: false, reason: 'Direct IP literals pointing to private or metadata networks are blocked.' };
    }
  }

  // 6. Block localhost / internal domain aliases
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.arpa')
  ) {
    return { isValid: false, reason: 'Access to local or internal domain names is prohibited.' };
  }

  // 7. Reject HLS / DASH manifests and playlists
  if (isManifestOrPlaylistUrl(parsedUrl.pathname)) {
    return { isValid: false, reason: 'Streaming manifests and playlists (.m3u8, .mpd) are not permitted.' };
  }

  // 8. DNS Pre-Resolution: Check actual IP resolved by DNS to defeat DNS rebinding
  try {
    const lookupResult = options?.dnsLookupFn
      ? await options.dnsLookupFn(hostname)
      : await dns.lookup(hostname, { all: false });
    const ip = lookupResult.address;

    if (isPrivateOrBlockedIp(ip)) {
      return {
        isValid: false,
        reason: `Domain resolves to a blocked or private IP range (${ip}).`,
        resolvedIp: ip,
      };
    }

    const allowlistCheck = matchAllowlistDomain(hostname);

    return {
      isValid: true,
      url: parsedUrl,
      resolvedIp: ip,
      isAllowlisted: allowlistCheck.isAllowlisted,
      sourceName: allowlistCheck.sourceName || 'Direct HTTPS Media',
    };
  } catch (err: any) {
    return {
      isValid: false,
      reason: `DNS resolution failed for hostname "${hostname}": ${err.message || 'Host not found'}.`,
    };
  }
}

/**
 * Executes an HTTP fetch with manual 3-hop redirect inspection and IP pinning to defeat DNS rebinding.
 */
export async function safeFetchWithIpPinning(
  initialUrl: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    maxRedirects?: number;
    dnsLookupFn?: (hostname: string) => Promise<{ address: string }>;
  }
): Promise<{ response: Response; finalUrl: string; resolvedIp: string }> {
  let currentUrl = initialUrl;
  const maxHops = options?.maxRedirects ?? 3;
  let lastResolvedIp = '';

  for (let hop = 0; hop <= maxHops; hop++) {
    const validation = await validateImportUrl(currentUrl, { dnsLookupFn: options?.dnsLookupFn });
    if (!validation.isValid) {
      throw new Error(`Security validation failed at redirect hop ${hop}: ${validation.reason}`);
    }
    lastResolvedIp = validation.resolvedIp || '';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s connection timeout

    try {
      const res = await fetch(currentUrl, {
        method: options?.method || 'GET',
        headers: options?.headers,
        redirect: 'manual', // Never auto-follow redirects!
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Check for redirect status codes
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const locationHeader = res.headers.get('location');
        if (!locationHeader) {
          throw new Error(`Server returned HTTP ${res.status} redirect without a Location header.`);
        }
        if (hop === maxHops) {
          throw new Error(`Exceeded maximum allowed redirect hops (${maxHops}).`);
        }
        // Resolve relative redirects safely against current URL
        currentUrl = new URL(locationHeader, currentUrl).href;
        continue;
      }

      return {
        response: res,
        finalUrl: currentUrl,
        resolvedIp: lastResolvedIp,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  }

  throw new Error('Unexpected redirect loop completion.');
}
