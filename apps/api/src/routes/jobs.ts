import { FastifyPluginAsync } from 'fastify';
import { ConversionRequestSchema, JobStatusResponse } from '@universal/job-contracts';
import { randomUUID } from 'crypto';

export const jobRoutes: FastifyPluginAsync = async (fastify) => {
  // In-memory job state store for development (replaced by Redis in Phase 3)
  const jobStore = new Map<string, JobStatusResponse>();

  fastify.post('/jobs', async (request, reply) => {
    const parseResult = ConversionRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid conversion request payload',
          details: parseResult.error.issues,
        },
      });
    }

    const conversionReq = parseResult.data;
    const jobId = conversionReq.id || randomUUID();

    const initialJobStatus: JobStatusResponse = {
      jobId,
      status: 'queued',
      progressPercent: 0,
      stage: 'Preparing transcode pipeline',
      engineUsed: conversionReq.enginePreference === 'device' ? 'device' : 'cloud',
    };

    jobStore.set(jobId, initialJobStatus);

    return reply.status(202).send({
      success: true,
      data: initialJobStatus,
    });
  });

  fastify.get('/jobs/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = jobStore.get(jobId);

    if (!job) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job ${jobId} does not exist or has expired.`,
        },
      });
    }

    return reply.send({
      success: true,
      data: job,
    });
  });
};
