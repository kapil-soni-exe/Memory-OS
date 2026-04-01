import { Queue } from 'bullmq';
import redisConnection from './redis.js';

export const itemQueue = new Queue('item-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true, // Immediate cleanup: Massive request savings
    removeOnFail: true,     // Immediate cleanup: Massive request savings 
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
  }
});
