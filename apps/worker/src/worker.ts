import { Worker, Job } from 'bullmq';
import { ConversionRequest, JobStatusResponse } from '@universal/job-contracts';
import { runFFmpegProcess } from './ffmpeg-runner';
import { startAutoCleaner } from './cleaner';
import path from 'path';
import fs from 'fs';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const WORKING_DIR = process.env.WORKING_DIR || path.join(process.cwd(), 'temp_uploads');
if (!fs.existsSync(WORKING_DIR)) {
  fs.mkdirSync(WORKING_DIR, { recursive: true });
}

export function startWorker() {
  console.log('⚡ Initializing Native Hardware-Accelerated FFmpeg BullMQ Worker...');

  // Start background auto-cleanup service (purges files older than 1 hour)
  startAutoCleaner(WORKING_DIR, 3600 * 1000);

  const worker = new Worker<ConversionRequest, JobStatusResponse>(
    'conversion-jobs',
    async (job: Job<ConversionRequest>) => {
      console.log(`[Worker] Started processing job ${job.id} (${job.data.inputFilename})`);

      const inputPath = path.join(WORKING_DIR, job.data.inputFilename);
      const outputPath = path.join(WORKING_DIR, `output_${job.data.id}.${job.data.targetFormat}`);

      await job.updateProgress(10);

      await runFFmpegProcess(
        inputPath,
        outputPath,
        job.data,
        60, // estimated duration default
        async (progress: { progressPercent: number }) => {
          await job.updateProgress(progress.progressPercent);
        }
      );

      await job.updateProgress(100);

      return {
        jobId: job.data.id,
        status: 'completed',
        progressPercent: 100,
        stage: 'Finished',
        engineUsed: 'cloud',
        downloadUrl: `/api/jobs/${job.data.id}/download`,
      };
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: Number(process.env.CONCURRENCY) || 4,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

if (process.argv[1] && process.argv[1].endsWith('worker.ts')) {
  startWorker();
}
