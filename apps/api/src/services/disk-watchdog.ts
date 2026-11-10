import fs from 'fs';
import path from 'path';

export interface DiskStats {
  totalBytes: number;
  freeBytes: number;
  availableBytes: number;
  freePercent: number;
  isAcceptingJobs: boolean;
  minFreePercentThreshold: number;
}

const MIN_FREE_PERCENT = 15; // Reject new jobs if free space drops below 15%

export function getDiskStats(targetDir?: string): DiskStats {
  const checkPath = targetDir || process.env.UPLOAD_DIR || path.join(process.cwd(), 'temp_uploads');

  try {
    if (!fs.existsSync(checkPath)) {
      fs.mkdirSync(checkPath, { recursive: true });
    }

    if (typeof fs.statfsSync === 'function') {
      const stats = fs.statfsSync(checkPath);
      const totalBytes = stats.blocks * stats.bsize;
      const freeBytes = stats.bfree * stats.bsize;
      const availableBytes = stats.bavail * stats.bsize;
      const freePercent = totalBytes > 0 ? (availableBytes / totalBytes) * 100 : 100;

      return {
        totalBytes,
        freeBytes,
        availableBytes,
        freePercent: Math.round(freePercent * 10) / 10,
        isAcceptingJobs: freePercent >= MIN_FREE_PERCENT,
        minFreePercentThreshold: MIN_FREE_PERCENT,
      };
    }
  } catch (err) {
    console.warn('[DiskWatchdog] Unable to query filesystem statfs:', err);
  }

  // Fallback safe assumption if statfs is unavailable
  return {
    totalBytes: 100 * 1024 * 1024 * 1024,
    freeBytes: 50 * 1024 * 1024 * 1024,
    availableBytes: 50 * 1024 * 1024 * 1024,
    freePercent: 50,
    isAcceptingJobs: true,
    minFreePercentThreshold: MIN_FREE_PERCENT,
  };
}

export function assertDiskCapacity(targetDir?: string): void {
  const stats = getDiskStats(targetDir);
  if (!stats.isAcceptingJobs) {
    const error = new Error(
      `Cluster storage high utilization guard: Free disk is ${stats.freePercent}% (minimum ${MIN_FREE_PERCENT}% required). Service is temporarily busy; please use on-device conversion or retry shortly.`
    );
    (error as any).statusCode = 503;
    (error as any).code = 'STORAGE_CAPACITY_LIMIT';
    throw error;
  }
}
