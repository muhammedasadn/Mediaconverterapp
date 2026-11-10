import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { ConversionRequest } from '@universal/job-contracts';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

export const conversionQueue = new Queue<ConversionRequest>('conversion-jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // keep for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // keep for 24 hours
    },
  },
});
