import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = new Redis(
  // Priority: Render Redis (deployed) > Upstash (at limit) > local
  process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  { 
    maxRetriesPerRequest: null,
    lazyConnect: true,          // Don't connect immediately on import
    enableOfflineQueue: false,  // Don't queue commands when disconnected
  }
);

redisConnection.on('connect', () => {
  console.log('✅ [Redis] Connected successfully');
});

redisConnection.on('error', (err) => {
  // Log but don't crash the process
  console.error('⚠️ [Redis] Connection error (background processing may be unavailable):', err.message);
});

export default redisConnection;
