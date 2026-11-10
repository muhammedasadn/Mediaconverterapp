import { FastifyPluginAsync } from 'fastify';
import { checkRedisHealth } from '../queue';
import { getDiskStats } from '../services/disk-watchdog';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Liveness Probe — Lightweight check indicating Fastify event loop is responsive
  fastify.get('/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      engine: 'Fastify High-Throughput Node.js',
    };
  });

  // Readiness Probe — Validates upstream dependencies (Redis & Disk Storage)
  fastify.get('/ready', async (request, reply) => {
    const isRedisReady = await checkRedisHealth();
    const diskStats = getDiskStats();

    const isSystemReady = isRedisReady && diskStats.isAcceptingJobs;

    const responsePayload = {
      status: isSystemReady ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        redis: isRedisReady ? 'connected' : 'unreachable',
        storage: {
          status: diskStats.isAcceptingJobs ? 'healthy' : 'capacity_warning',
          freePercent: diskStats.freePercent,
          availableGb: Math.round((diskStats.availableBytes / (1024 * 1024 * 1024)) * 10) / 10,
        },
      },
    };

    if (!isSystemReady) {
      reply.status(503).send(responsePayload);
      return;
    }

    return responsePayload;
  });
};
