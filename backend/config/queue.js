import { Queue } from 'bullmq';
import redisConnection from './redis.js';

export const itemQueue = new Queue('item-processing', {
  connection: redisConnection
});

console.log('BullMQ initialized: item-processing');
