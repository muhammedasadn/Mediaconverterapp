import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { healthRoutes } from './routes/health';
import { jobRoutes } from './routes/jobs';
import { streamRoutes } from './routes/stream';

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
    genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
  });

  // Security Headers
  await server.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS Configuration
  await server.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
  });

  // Multipart Streaming for File Uploads (up to 2GB)
  await server.register(multipart, {
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, // 2GB
    },
  });

  // Global Error Handler
  server.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected server error occurred',
      },
    });
  });

  // Register API Routes
  await server.register(healthRoutes, { prefix: '/api' });
  await server.register(jobRoutes, { prefix: '/api' });
  await server.register(streamRoutes, { prefix: '/api' });

  return server;
}

async function start() {
  const server = await buildServer();

  // Graceful Shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      server.log.info(`Received ${signal}. Shutting down gracefully...`);
      await server.close();
      process.exit(0);
    });
  }

  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`🚀 Fastify High-Performance API running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  start();
}
