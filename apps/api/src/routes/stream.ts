import { FastifyPluginAsync } from 'fastify';
import { conversionQueue, redisConnection } from '../queue';
import { JobStatusResponse } from '@universal/job-contracts';

export const streamRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/jobs/:jobId/stream', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');

    // Initial message
    reply.raw.write(`data: ${JSON.stringify({ status: 'connected', jobId })}\n\n`);

    // Poll BullMQ job status or listen to Redis channel
    const interval = setInterval(async () => {
      try {
        const job = await conversionQueue.getJob(jobId);
        if (!job) {
          reply.raw.write(
            `data: ${JSON.stringify({
              jobId,
              status: 'queued',
              progressPercent: 0,
              stage: 'Waiting in cloud queue...',
              engineUsed: 'cloud',
            })}\n\n`
          );
          return;
        }

        const state = await job.getState();
        const progress = (job.progress as number) || 0;

        const response: JobStatusResponse = {
          jobId,
          status: state === 'completed' ? 'completed' : state === 'failed' ? 'failed' : 'converting',
          progressPercent: progress,
          stage: state === 'completed' ? 'Finished' : `Transcoding stream (${progress}%)`,
          engineUsed: 'cloud',
          downloadUrl: state === 'completed' ? `/api/jobs/${jobId}/download` : undefined,
        };

        reply.raw.write(`data: ${JSON.stringify(response)}\n\n`);

        if (state === 'completed' || state === 'failed') {
          clearInterval(interval);
          reply.raw.end();
        }
      } catch (err) {
        clearInterval(interval);
        reply.raw.end();
      }
    }, 1000);

    request.raw.on('close', () => {
      clearInterval(interval);
    });
  });
};
