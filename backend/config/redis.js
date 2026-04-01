import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const PRIMARY_URL = process.env.REDIS_URL;
const BACKUP_URL = process.env.BULLMQ_REDIS_URL;
const LOCAL_URL = 'redis://127.0.0.1:6379';

let currentUrl = PRIMARY_URL || BACKUP_URL || LOCAL_URL;
let isUsingBackup = !PRIMARY_URL && !!BACKUP_URL;

console.log(`[Redis] 🚀 Initializing with ${isUsingBackup ? 'Backup' : 'Primary'} provider...`);

const options = {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: true,
  offlineQueueCheckPeriod: 30000,
  keepAlive: 10000,         // Keep connection warm to reduce handshake latency
  connectTimeout: 10000,    // Fail fast if connection is hanging
};

const redisConnection = new Redis(currentUrl, options);

// --- Self-Healing Failover Logic ---
redisConnection.on('error', (err) => {
  const errorMessage = err.message.toLowerCase();
  
  // Detect Upstash Quota/Limit Errors
  const isQuotaError = errorMessage.includes('quota') || 
                       errorMessage.includes('forbidden') || 
                       errorMessage.includes('limit');

  if (isQuotaError && !isUsingBackup && BACKUP_URL) {
    console.warn('\n⚠️  [Redis] Primary (Upstash) reached limit or returned forbidden error.');
    console.warn('🔄  [Redis] AUTOMATIC FAILOVER: Switching to Backup (Render Redis)...');
    
    isUsingBackup = true;
    
    // Disconnect safely and update the connection URL for future attempts
    redisConnection.disconnect();
    
    // We update the connector's internal options so it uses the backup on next connect
    redisConnection.options.host = new URL(BACKUP_URL).hostname;
    redisConnection.options.port = parseInt(new URL(BACKUP_URL).port) || 6379;
    redisConnection.options.password = new URL(BACKUP_URL).password;
    if (BACKUP_URL.startsWith('rediss://')) {
        redisConnection.options.tls = {};
    }

    // Force a fresh connection
    redisConnection.connect().catch(e => {
        console.error('❌ [Redis] Failover to Backup failed:', e.message);
    });
  } else {
    console.error('⚠️  [Redis] Connection error:', err.message);
  }
});

redisConnection.on('connect', () => {
  console.log(`✅ [Redis] Connected successfully (${isUsingBackup ? 'Backup' : 'Primary'})`);
});

export default redisConnection;
