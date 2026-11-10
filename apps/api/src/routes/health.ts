import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      engine: 'Fastify High-Throughput Node.js',
    };
  });
};
