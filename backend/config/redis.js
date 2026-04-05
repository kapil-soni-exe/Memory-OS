import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const RENDER_REDIS_URL = process.env.BULLMQ_REDIS_URL;
const UPSTASH_REDIS_URL = process.env.REDIS_URL;
const LOCAL_URL = 'redis://127.0.0.1:6379';

// Prioritize Render Redis over Upstash now that Upstash hit its limit
let currentUrl = RENDER_REDIS_URL || UPSTASH_REDIS_URL || LOCAL_URL;
let isUsingBackup = !RENDER_REDIS_URL && !!UPSTASH_REDIS_URL;

console.log(`[Redis] 🚀 Initializing with ${isUsingBackup ? 'Upstash' : 'Render'} provider...`);

const options = {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: true,
  offlineQueueCheckPeriod: 30000,
  keepAlive: 10000,         
  connectTimeout: 15000,    // Increased timeout for Render internal networking
};

// Automatically enable TLS if rediss:// is used
if (currentUrl.startsWith('rediss://')) {
    options.tls = { rejectUnauthorized: false }; // Required for many hosted Redis providers
}

const redisConnection = new Redis(currentUrl, options);

// --- Self-Healing Failover Logic ---
redisConnection.on('error', (err) => {
  const errorMessage = err.message.toLowerCase();
  
  // Failover condition: Quota reached, connection refused, or forbidden
  const shouldFailover = errorMessage.includes('quota') || 
                         errorMessage.includes('forbidden') || 
                         errorMessage.includes('limit') ||
                         errorMessage.includes('econnrefused');

  if (shouldFailover && !isUsingBackup && UPSTASH_REDIS_URL) {
    console.warn('\n⚠️  [Redis] Main provider failure. Switching to Backup...');
    
    isUsingBackup = true;
    
    // Update connection settings for the backup
    const backupUrl = new URL(UPSTASH_REDIS_URL);
    redisConnection.options.host = backupUrl.hostname;
    redisConnection.options.port = parseInt(backupUrl.port) || 6379;
    redisConnection.options.password = decodeURIComponent(backupUrl.password);
    
    if (UPSTASH_REDIS_URL.startsWith('rediss://')) {
        redisConnection.options.tls = { rejectUnauthorized: false };
    }

    // Force a fresh connection
    redisConnection.disconnect();
    redisConnection.connect().catch(e => {
        console.error('❌ [Redis] Failover failed:', e.message);
    });
  } else {
    console.error('⚠️  [Redis] Connection error:', err.message);
  }
});

redisConnection.on('connect', () => {
  console.log(`✅ [Redis] Connected successfully (${isUsingBackup ? 'Backup' : 'Main'})`);
});

export default redisConnection;
