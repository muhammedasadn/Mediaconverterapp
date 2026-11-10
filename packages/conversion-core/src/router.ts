import type { ConversionRequest } from '@universal/job-contracts';
import { getFormatById } from '@universal/format-registry';

export interface RouteDecision {
  engine: 'device' | 'cloud';
  reason: string;
  isOverride: boolean;
  canUseDevice: boolean;
  canUseCloud: boolean;
}

export function evaluateHybridRouting(
  fileSizeBytes: number,
  request: ConversionRequest,
  options?: {
    isOnline?: boolean;
    isMobile?: boolean;
    availableMemoryMb?: number;
    cloudEngineEnabled?: boolean;
  }
): RouteDecision {
  const isOnline = options?.isOnline ?? (typeof navigator !== 'undefined' ? navigator.onLine : true);
  const isMobile =
    options?.isMobile ??
    (typeof navigator !== 'undefined'
      ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      : false);

  const env = typeof globalThis !== 'undefined' ? (globalThis as any).process?.env : undefined;
  const cloudEngineEnabled =
    options?.cloudEngineEnabled ??
    (env ? env.NEXT_PUBLIC_CLOUD_ENGINE_ENABLED !== 'false' && env.CLOUD_ENGINE_ENABLED !== 'false' : true);

  const targetFormatDef = getFormatById(request.targetFormat);
  const targetCodec = request.video?.codec || targetFormatDef?.defaultVideoCodec;

  // Codecs requiring heavy CPU/multithreading that exceed browser wasm capabilities
  const requiresCloudCodec = ['libx265', 'libaom-av1', 'prores', 'hevc'].includes(targetCodec || '');

  // File size thresholds (in Megabytes)
  const fileSizeMb = fileSizeBytes / (1024 * 1024);
  const deviceMaxMb = isMobile ? 35 : 100; // Stricter cap on mobile to prevent Safari WebKit OOM

  const canUseDevice = !requiresCloudCodec && fileSizeMb <= (isMobile ? 50 : 250);
  const canUseCloud = isOnline && cloudEngineEnabled;

  // 1. Check explicit user preference override
  if (request.enginePreference === 'device') {
    return {
      engine: 'device',
      reason: 'Enforced by manual "Device Only" preference.',
      isOverride: true,
      canUseDevice: true,
      canUseCloud,
    };
  }

  if (request.enginePreference === 'cloud') {
    if (!isOnline || !cloudEngineEnabled) {
      return {
        engine: 'device',
        reason: !cloudEngineEnabled
          ? 'Cloud cluster is offline or disabled. Processing on device.'
          : 'Cloud selected but device is offline. Running on device.',
        isOverride: true,
        canUseDevice: true,
        canUseCloud: false,
      };
    }
    return {
      engine: 'cloud',
      reason: 'Enforced by manual "Cloud Turbo" preference.',
      isOverride: true,
      canUseDevice,
      canUseCloud: true,
    };
  }

  // 2. Offline or Cloud-Disabled guard
  if (!isOnline || !cloudEngineEnabled) {
    return {
      engine: 'device',
      reason: !cloudEngineEnabled
        ? 'Cloud cluster offline. Processing 100% on device with zero external latency.'
        : 'Offline mode active. Processing 100% on device.',
      isOverride: false,
      canUseDevice: true,
      canUseCloud: false,
    };
  }

  // 3. Codec complexity check
  if (requiresCloudCodec) {
    return {
      engine: 'cloud',
      reason: `Codec "${targetCodec}" requires advanced multi-core cloud encoding for optimal compression.`,
      isOverride: false,
      canUseDevice: false,
      canUseCloud: true,
    };
  }

  // 4. File size & memory pressure check
  if (fileSizeMb > deviceMaxMb) {
    return {
      engine: 'cloud',
      reason: isMobile
        ? `File size (${fileSizeMb.toFixed(1)}MB) exceeds mobile device memory budget. Cloud turbo selected to save battery.`
        : `File size (${fileSizeMb.toFixed(1)}MB) optimized for high-speed cloud cluster encoding.`,
      isOverride: false,
      canUseDevice,
      canUseCloud: true,
    };
  }

  // 5. Default: Fast & Private Device Engine
  return {
    engine: 'device',
    reason: 'Instant on-device conversion. 100% private — your file never leaves your browser.',
    isOverride: false,
    canUseDevice: true,
    canUseCloud: true,
  };
}
