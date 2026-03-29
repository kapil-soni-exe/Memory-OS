import { Queue } from 'bullmq';
import redisConnection from './redis.js';

export const itemQueue = new Queue('item-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 20,  // Keep only last 20 completed jobs
    removeOnFail: 20,      // Keep only last 20 failed jobs
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
  }
});
