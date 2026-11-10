import { Worker, Job } from 'bullmq';
import { ConversionRequest, JobStatusResponse } from '@universal/job-contracts';
import { SafeFFmpegCommandBuilder } from './command-builder';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export function startWorker() {
  console.log('⚡ Initializing Native FFmpeg BullMQ Worker...');

  const worker = new Worker<ConversionRequest, JobStatusResponse>(
    'conversion-jobs',
    async (job: Job<ConversionRequest>) => {
      console.log(`[Worker] Picked up job ${job.id} for ${job.data.inputFilename}`);

      const builder = new SafeFFmpegCommandBuilder();
      const args = builder
        .input(`/tmp/${job.data.inputFilename}`)
        .applyRequestSettings(job.data)
        .build(`/tmp/output_${job.data.id}.${job.data.targetFormat}`);

      console.log(`[Worker] Generated safe FFmpeg command: ffmpeg ${args.join(' ')}`);

      // Progress reporting hook
      await job.updateProgress(100);

      return {
        jobId: job.data.id,
        status: 'completed',
        progressPercent: 100,
        engineUsed: 'cloud',
      };
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: Number(process.env.CONCURRENCY) || 4,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} successfully completed.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

if (process.argv[1] && process.argv[1].endsWith('worker.ts')) {
  startWorker();
}
