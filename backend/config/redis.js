import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = new Redis(
  process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  { maxRetriesPerRequest: null }
);

redisConnection.on('connect', () => {
  console.log('✅ [Redis] Connected successfully');
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redisConnection;
