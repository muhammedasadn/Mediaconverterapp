/**
 * Smart Quality Options Generator & File Size Estimator for Universal Media Converter
 */

export interface VideoQualityOption {
  id: 'original' | '1080p' | '720p' | '480p' | '360p';
  label: string;
  sublabel: string;
  width?: number;
  height?: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  isRecommended?: boolean;
  isStreamCopy?: boolean;
  estimatedBytes: number;
  estimatedFormatted: string;
}

export interface AudioQualityOption {
  id: '320k' | '192k' | '128k' | '64k' | 'm4a_copy' | 'wav' | 'flac';
  format: 'mp3' | 'm4a' | 'wav' | 'flac';
  label: string;
  sublabel: string;
  bitrateKbps: number;
  isRecommended?: boolean;
  isStreamCopy?: boolean;
  estimatedBytes: number;
  estimatedFormatted: string;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = (bytes / Math.pow(1024, i)).toFixed(1);
  return `~${val} ${units[i]}`;
}

/**
 * Calculates accurate media file size with a 5% container overhead margin:
 * bytes = ((videoBitrate + audioBitrate) * 1000 * duration / 8) * 1.05
 */
export function estimateMediaSizeBytes(
  videoBitrateKbps: number,
  audioBitrateKbps: number,
  durationSeconds: number
): number {
  const dur = Math.max(1, durationSeconds);
  const totalBitrateBps = (videoBitrateKbps + audioBitrateKbps) * 1000;
  const rawBytes = (totalBitrateBps * dur) / 8;
  return Math.round(rawBytes * 1.05); // 5% container overhead buffer
}

/**
 * Formulates video quality options.
 * Rule: NEVER upscale beyond source resolution.
 */
export function generateVideoQualityOptions(options: {
  sourceWidth?: number;
  sourceHeight?: number;
  durationSeconds?: number;
  originalSizeBytes?: number;
  sourceCodec?: string;
}): VideoQualityOption[] {
  const {
    sourceWidth = 1920,
    sourceHeight = 1080,
    durationSeconds = 60,
    originalSizeBytes = 50 * 1024 * 1024,
  } = options;

  const results: VideoQualityOption[] = [];

  // 1. Original (Stream Copy)
  results.push({
    id: 'original',
    label: 'Original Source',
    sublabel: 'Lossless Stream Copy (<2s)',
    width: sourceWidth,
    height: sourceHeight,
    videoBitrateKbps: Math.round((originalSizeBytes * 8) / (durationSeconds * 1000)),
    audioBitrateKbps: 192,
    isStreamCopy: true,
    estimatedBytes: originalSizeBytes,
    estimatedFormatted: formatBytes(originalSizeBytes),
  });

  // 2. 1080p FHD (Only if source is at least 1080p)
  if (sourceHeight >= 1080) {
    const est = estimateMediaSizeBytes(3800, 192, durationSeconds);
    results.push({
      id: '1080p',
      label: '1080p FHD',
      sublabel: 'Crisp High-Bitrate',
      width: 1920,
      height: 1080,
      videoBitrateKbps: 3800,
      audioBitrateKbps: 192,
      estimatedBytes: est,
      estimatedFormatted: formatBytes(est),
    });
  }

  // 3. 720p HD (Recommended Default - Only if source is at least 720p)
  if (sourceHeight >= 720) {
    const est = estimateMediaSizeBytes(2000, 128, durationSeconds);
    results.push({
      id: '720p',
      label: '720p HD',
      sublabel: 'Standard Web & Social',
      width: 1280,
      height: 720,
      videoBitrateKbps: 2000,
      audioBitrateKbps: 128,
      isRecommended: true,
      estimatedBytes: est,
      estimatedFormatted: formatBytes(est),
    });
  }

  // 4. 480p SD (Always available if source >= 480p)
  if (sourceHeight >= 480) {
    const est = estimateMediaSizeBytes(900, 96, durationSeconds);
    results.push({
      id: '480p',
      label: '480p SD',
      sublabel: 'Fast Download / Compact',
      width: 854,
      height: 480,
      videoBitrateKbps: 900,
      audioBitrateKbps: 96,
      isRecommended: sourceHeight < 720, // If source is small, 480p is recommended
      estimatedBytes: est,
      estimatedFormatted: formatBytes(est),
    });
  }

  // 5. 360p Mobile (Always available)
  const est360 = estimateMediaSizeBytes(450, 64, durationSeconds);
  results.push({
    id: '360p',
    label: '360p Mobile',
    sublabel: 'Ultra Light / Mobile Data',
    width: 640,
    height: 360,
    videoBitrateKbps: 450,
    audioBitrateKbps: 64,
    estimatedBytes: est360,
    estimatedFormatted: formatBytes(est360),
  });

  return results;
}

/**
 * Formulates audio extraction quality options.
 */
export function generateAudioQualityOptions(options: {
  durationSeconds?: number;
  sourceCodec?: string;
  sourceIsAac?: boolean;
}): AudioQualityOption[] {
  const { durationSeconds = 180, sourceIsAac = false } = options;

  const results: AudioQualityOption[] = [
    {
      id: '320k',
      format: 'mp3',
      label: 'MP3 · 320 kbps',
      sublabel: 'Audiophile High Fidelity',
      bitrateKbps: 320,
      estimatedBytes: estimateMediaSizeBytes(0, 320, durationSeconds),
      estimatedFormatted: formatBytes(estimateMediaSizeBytes(0, 320, durationSeconds)),
    },
    {
      id: '192k',
      format: 'mp3',
      label: 'MP3 · 192 kbps',
      sublabel: 'Standard Clear Audio',
      bitrateKbps: 192,
      isRecommended: true,
      estimatedBytes: estimateMediaSizeBytes(0, 192, durationSeconds),
      estimatedFormatted: formatBytes(estimateMediaSizeBytes(0, 192, durationSeconds)),
    },
    {
      id: '128k',
      format: 'mp3',
      label: 'MP3 · 128 kbps',
      sublabel: 'Compact Web & Podcast',
      bitrateKbps: 128,
      estimatedBytes: estimateMediaSizeBytes(0, 128, durationSeconds),
      estimatedFormatted: formatBytes(estimateMediaSizeBytes(0, 128, durationSeconds)),
    },
    {
      id: '64k',
      format: 'mp3',
      label: 'MP3 · 64 kbps',
      sublabel: 'Speech & Voice Notes',
      bitrateKbps: 64,
      estimatedBytes: estimateMediaSizeBytes(0, 64, durationSeconds),
      estimatedFormatted: formatBytes(estimateMediaSizeBytes(0, 64, durationSeconds)),
    },
  ];

  // If source audio is AAC, offer instantaneous M4A stream copy
  if (sourceIsAac) {
    const aacEst = estimateMediaSizeBytes(0, 192, durationSeconds);
    results.unshift({
      id: 'm4a_copy',
      format: 'm4a',
      label: 'M4A (AAC Stream Copy)',
      sublabel: 'Instant Extraction (<100ms)',
      bitrateKbps: 192,
      isStreamCopy: true,
      isRecommended: true,
      estimatedBytes: aacEst,
      estimatedFormatted: formatBytes(aacEst),
    });
  }

  // Lossless WAV (1411 kbps PCM 16-bit 44.1kHz)
  const wavEst = estimateMediaSizeBytes(0, 1411, durationSeconds);
  results.push({
    id: 'wav',
    format: 'wav',
    label: 'Lossless WAV',
    sublabel: 'Uncompressed Studio Master',
    bitrateKbps: 1411,
    estimatedBytes: wavEst,
    estimatedFormatted: formatBytes(wavEst),
  });

  return results;
}
