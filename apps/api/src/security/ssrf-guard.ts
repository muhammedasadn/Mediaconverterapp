import dns from 'node:dns/promises';
import { isIP } from 'node:net';

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

export interface UrlValidationResult {
  isValid: boolean;
  reason?: string;
  url?: URL;
  resolvedIp?: string;
}

/**
 * Validates a remote media import URL against SSRF, credential leakage, and custom ports.
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

  // 4. Block literal IP addresses in hostname directly
  if (isIP(hostname)) {
    if (isPrivateOrBlockedIp(hostname)) {
      return { isValid: false, reason: 'Direct IP literals pointing to private or metadata networks are blocked.' };
    }
  }

  // 5. Block localhost / internal domain aliases
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { isValid: false, reason: 'Access to local or internal domain names is prohibited.' };
  }

  // 6. DNS Pre-Resolution: Check actual IP resolved by DNS to defeat DNS rebinding
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

    return { isValid: true, url: parsedUrl, resolvedIp: ip };
  } catch (err: any) {
    return {
      isValid: false,
      reason: `DNS resolution failed for hostname "${hostname}": ${err.message || 'Host not found'}.`,
    };
  }
}
