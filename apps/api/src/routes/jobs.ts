import { FastifyPluginAsync } from 'fastify';
import { ConversionRequestSchema, JobStatusResponse } from '@universal/job-contracts';
import { conversionQueue } from '../queue';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'temp_uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const jobRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. Streaming Chunked Upload directly to disk/storage
  fastify.post('/jobs/upload', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        success: false,
        error: { code: 'NO_FILE', message: 'No file was provided in the upload request' },
      });
    }

    const fileId = randomUUID();
    const safeFilename = `${fileId}_${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const destinationPath = path.join(UPLOAD_DIR, safeFilename);

    await pipeline(data.file, fs.createWriteStream(destinationPath));

    return reply.status(201).send({
      success: true,
      data: {
        fileId,
        filename: safeFilename,
        originalName: data.filename,
        mimeType: data.mimetype,
      },
    });
  });

  // 2. Submit conversion job to BullMQ queue
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

    // Push job to BullMQ queue
    await conversionQueue.add('convert', conversionReq, { jobId });

    const initialStatus: JobStatusResponse = {
      jobId,
      status: 'queued',
      progressPercent: 0,
      stage: 'Queued in Cloud Turbo cluster',
      engineUsed: 'cloud',
    };

    return reply.status(202).send({
      success: true,
      data: initialStatus,
    });
  });

  // 3. Cancel job
  fastify.post('/jobs/:jobId/cancel', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = await conversionQueue.getJob(jobId);

    if (job) {
      await job.remove();
      return reply.send({ success: true, message: `Job ${jobId} cancelled.` });
    }

    return reply.status(404).send({ success: false, error: { message: 'Job not found' } });
  });

  // 4. Retry job
  fastify.post('/jobs/:jobId/retry', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = await conversionQueue.getJob(jobId);

    if (job) {
      await job.retry();
      return reply.send({ success: true, message: `Job ${jobId} re-queued.` });
    }

    return reply.status(404).send({ success: false, error: { message: 'Job not found' } });
  });

  // 5. Download converted file
  fastify.get('/jobs/:jobId/download', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = await conversionQueue.getJob(jobId);

    if (!job || !job.returnvalue) {
      return reply.status(404).send({ success: false, error: { message: 'File not ready or expired.' } });
    }

    const outputPath = path.join(UPLOAD_DIR, `output_${jobId}.${job.data.targetFormat}`);
    if (fs.existsSync(outputPath)) {
      return reply.sendFile(`output_${jobId}.${job.data.targetFormat}`, UPLOAD_DIR);
    }

    return reply.status(404).send({ success: false, error: { message: 'Output file missing.' } });
  });
};
