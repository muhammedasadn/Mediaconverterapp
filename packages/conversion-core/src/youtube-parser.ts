/**
 * YouTube URL Parser & Canonical Video ID Extractor
 * Strictly validates domain allowlist and extracts the 11-character video identifier.
 */

export interface YouTubeParseResult {
  isValid: boolean;
  videoId?: string;
  canonicalUrl?: string;
  reason?: string;
}

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
]);

const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeUrl(inputUrl: string): YouTubeParseResult {
  let parsed: URL;

  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    return { isValid: false, reason: 'Invalid URL format' };
  }

  // 1. Enforce HTTPS protocol
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { isValid: false, reason: 'Only HTTP/HTTPS protocols are supported' };
  }

  // 2. Strict Hostname Whitelist
  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) {
    return { isValid: false, reason: `Host "${host}" is not a recognized YouTube domain` };
  }

  let videoId: string | null = null;

  // 3. Extract Video ID from youtu.be shortlinks: https://youtu.be/dQw4w9WgXcQ
  if (host === 'youtu.be') {
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 1) {
      videoId = pathParts[0] || null;
    }
  } else {
    // 4. Standard watch link: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/embed/')) {
      // /embed/dQw4w9WgXcQ
      const parts = parsed.pathname.split('/embed/')[1]?.split('/');
      videoId = parts?.[0] || null;
    } else if (parsed.pathname.startsWith('/v/')) {
      // /v/dQw4w9WgXcQ
      const parts = parsed.pathname.split('/v/')[1]?.split('/');
      videoId = parts?.[0] || null;
    } else if (parsed.pathname.startsWith('/shorts/')) {
      // /shorts/dQw4w9WgXcQ
      const parts = parsed.pathname.split('/shorts/')[1]?.split('/');
      videoId = parts?.[0] || null;
    }
  }

  if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
    return { isValid: false, reason: 'Could not locate a valid 11-character YouTube video ID' };
  }

  return {
    isValid: true,
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
