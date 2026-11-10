/**
 * Accurate Target Size Bitrate Calculator & Auto-Downscale Logic
 */

export interface BitrateCalculationParams {
  targetBytes: number;
  durationSeconds: number;
  audioBitrateKbps?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  fps?: number;
}

export interface BitrateCalculationResult {
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  recommendedWidth: number;
  recommendedHeight: number;
  isDownscaled: boolean;
  bitsPerPixel: number;
}

/**
 * Calculates video bitrate using target size with 5% container overhead subtraction.
 * Automatically steps down resolution if bits-per-pixel drops below the visual quality threshold.
 */
export function calculateTargetBitrate(params: BitrateCalculationParams): BitrateCalculationResult {
  const {
    targetBytes,
    durationSeconds,
    audioBitrateKbps = 128,
    sourceWidth = 1920,
    sourceHeight = 1080,
    fps = 30,
  } = params;

  const validDuration = Math.max(1, durationSeconds);

  // 1. Deduct 5% container overhead safety buffer (moov atom, packet headers, metadata)
  const safeTargetBytes = targetBytes * 0.95;
  const totalTargetBits = safeTargetBytes * 8;
  const totalBudgetKbps = Math.floor(totalTargetBits / validDuration / 1000);

  // 2. Allocate video vs audio bitrate
  let videoBitrateKbps = Math.max(64, totalBudgetKbps - audioBitrateKbps);

  let recommendedWidth = sourceWidth;
  let recommendedHeight = sourceHeight;
  let isDownscaled = false;

  // 3. Bits-Per-Pixel (BPP) check: BPP = (Bitrate * 1000) / (Width * Height * FPS)
  const calculateBpp = (w: number, h: number, kbps: number) => {
    return (kbps * 1000) / (w * h * fps);
  };

  let bpp = calculateBpp(recommendedWidth, recommendedHeight, videoBitrateKbps);

  // If BPP < 0.07 at 1080p, step down to 720p to preserve visual sharpness
  if (bpp < 0.07 && recommendedHeight > 720) {
    recommendedWidth = 1280;
    recommendedHeight = 720;
    isDownscaled = true;
    bpp = calculateBpp(recommendedWidth, recommendedHeight, videoBitrateKbps);
  }

  // If still < 0.07 at 720p, step down to 480p
  if (bpp < 0.07 && recommendedHeight > 480) {
    recommendedWidth = 854;
    recommendedHeight = 480;
    isDownscaled = true;
    bpp = calculateBpp(recommendedWidth, recommendedHeight, videoBitrateKbps);
  }

  return {
    videoBitrateKbps,
    audioBitrateKbps,
    recommendedWidth,
    recommendedHeight,
    isDownscaled,
    bitsPerPixel: Number(bpp.toFixed(4)),
  };
}

/**
 * Checks whether the source file is already smaller than or equal to the target size.
 */
export function shouldSkipCompression(
  sourceBytes: number,
  targetBytes: number
): { skip: boolean; reason?: string } {
  if (sourceBytes <= targetBytes) {
    return {
      skip: true,
      reason: 'Source file is already smaller than target size. Original returned to prevent quality loss.',
    };
  }
  return { skip: false };
}
