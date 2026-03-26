const mongoose = require('mongoose');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { createClient } = require('redis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './.env') });

async function deepClean() {
  console.log("🧹 [CJS] Starting Deep Clean of MemoryOS Brain...");

  try {
    // 1. MongoDB Clean
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not found in env");
    console.log("📍 Cleaning MongoDB 'items' collection...");
    await mongoose.connect(process.env.MONGO_URI);
    const mongoResult = await mongoose.connection.db.collection('items').deleteMany({});
    console.log(`✅ MongoDB Cleared: ${mongoResult.deletedCount} items removed.`);

    // 2. Qdrant Reset
    if (!process.env.QDRANT_URL) throw new Error("QDRANT_URL not found in env");
    console.log("📍 Re-initializing Qdrant 'items_vectors'...");
    const qdrant = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY
    });
    
    try {
      await qdrant.deleteCollection("items_vectors");
      console.log("🗑️ Qdrant Collection Deleted.");
    } catch (e) {
      console.log("ℹ️ Collection didn't exist or already deleted.");
    }

    await qdrant.createCollection("items_vectors", {
      vectors: { size: 1024, distance: "Cosine" }
    });
    console.log("✅ Qdrant Collection Re-created (1024 Dims).");

    // 3. Redis Flush
    if (!process.env.REDIS_URL) throw new Error("REDIS_URL not found in env");
    console.log("📍 Flushing Upstash Redis Cache...");
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();
    await redis.flushAll();
    console.log("✅ Redis Flushed.");

    console.log("\n✨ SYSTEM DEEP CLEAN COMPLETE! ✨");
    process.exit(0);

  } catch (err) {
    console.error("❌ Cleanup Failed:", err.message);
    process.exit(1);
  }
}

deepClean();
