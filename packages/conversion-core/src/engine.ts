import { ConversionRequest, JobStatusResponse } from '@universal/job-contracts';
import { MediaProbeResult } from '@universal/format-registry';

export interface ConversionProgress {
  progressPercent: number; // 0 to 100
  timecodeSeconds?: number;
  durationSeconds?: number;
  currentFps?: number;
  stage: string;
}

export interface ConversionResult {
  outputBlob: Blob;
  outputFilename: string;
  outputSizeBytes: number;
  durationSeconds?: number;
  engineUsed: 'device' | 'cloud';
}

export interface MediaEngine {
  readonly name: 'device' | 'cloud';
  isSupported(): Promise<boolean>;
  probe(file: File | Blob): Promise<MediaProbeResult>;
  convert(
    file: File | Blob,
    request: ConversionRequest,
    onProgress: (progress: ConversionProgress) => void
  ): Promise<ConversionResult>;
  cancel(jobId: string): Promise<void>;
}
