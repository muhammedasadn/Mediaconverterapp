/**
 * Magic Bytes & File Signature Detection
 * High-performance binary header verification to defend against file extension spoofing.
 */

export interface DetectedSignature {
  mime: string;
  extension: string;
  category: 'video' | 'audio' | 'image' | 'unknown';
}

/**
 * Reads binary magic numbers from buffer or Uint8Array to identify real container.
 */
export function detectMagicBytes(buffer: Uint8Array | ArrayBuffer): DetectedSignature {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes.length < 12) {
    return { mime: 'application/octet-stream', extension: 'bin', category: 'unknown' };
  }

  // 1. EBML Header (WebM, MKV): 1A 45 DF A3
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    // Distinguish webm vs mkv by scanning EBML docType string
    const headerStr = new TextDecoder().decode(bytes.slice(0, Math.min(bytes.length, 64)));
    if (headerStr.includes('webm')) {
      return { mime: 'video/webm', extension: 'webm', category: 'video' };
    }
    return { mime: 'video/x-matroska', extension: 'mkv', category: 'video' };
  }

  // 2. ISO Base Media File Format (MP4, MOV, M4A): Offset 4 = "ftyp"
  if (
    bytes[4] === 0x66 && // f
    bytes[5] === 0x74 && // t
    bytes[6] === 0x79 && // y
    bytes[7] === 0x70    // p
  ) {
    const brand = new TextDecoder().decode(bytes.slice(8, 12));
    if (brand.startsWith('M4A') || brand.startsWith('M4B')) {
      return { mime: 'audio/mp4', extension: 'm4a', category: 'audio' };
    }
    if (brand.startsWith('qt  ')) {
      return { mime: 'video/quicktime', extension: 'mov', category: 'video' };
    }
    return { mime: 'video/mp4', extension: 'mp4', category: 'video' };
  }

  // 3. RIFF Header (WAV, WEBP, AVI): 52 49 46 46
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    const format = new TextDecoder().decode(bytes.slice(8, 12));
    if (format === 'WAVE') {
      return { mime: 'audio/wav', extension: 'wav', category: 'audio' };
    }
    if (format === 'WEBP') {
      return { mime: 'image/webp', extension: 'webp', category: 'image' };
    }
    if (format === 'AVI ') {
      return { mime: 'video/x-msvideo', extension: 'avi', category: 'video' };
    }
  }

  // 4. Ogg Vorbis/Opus Container: 4F 67 67 53 ("OggS")
  if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return { mime: 'audio/ogg', extension: 'ogg', category: 'audio' };
  }

  // 5. Free Lossless Audio Codec (FLAC): 66 4C 61 43 ("fLaC")
  if (bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x43) {
    return { mime: 'audio/flac', extension: 'flac', category: 'audio' };
  }

  // 6. MP3 with ID3v2 tag: 49 44 33 ("ID3")
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return { mime: 'audio/mpeg', extension: 'mp3', category: 'audio' };
  }

  // 7. MP3 raw frame sync: FF FB, FF F3, FF F2
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 && (bytes[1] & 0x06) !== 0x08) {
    return { mime: 'audio/mpeg', extension: 'mp3', category: 'audio' };
  }

  // 8. GIF: 47 49 46 38 ("GIF8")
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return { mime: 'image/gif', extension: 'gif', category: 'image' };
  }

  // 9. PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: 'image/png', extension: 'png', category: 'image' };
  }

  // 10. JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg', category: 'image' };
  }

  return { mime: 'application/octet-stream', extension: 'bin', category: 'unknown' };
}

/**
 * Validates whether an incoming file's bytes match expected media types.
 */
export function validateMediaSignature(buffer: Uint8Array | ArrayBuffer): {
  isValidMedia: boolean;
  detected: DetectedSignature;
} {
  const detected = detectMagicBytes(buffer);
  const isValidMedia = detected.category === 'video' || detected.category === 'audio' || detected.category === 'image';

  return { isValidMedia, detected };
}
