import mongoose from "mongoose";
import { QdrantClient } from "@qdrant/js-client-rest";
import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./.env") });

async function deepClean() {
  console.log("🧹 Starting Deep Clean of MemoryOS Brain...");

  try {
    // 1. MongoDB Clean
    console.log("📍 Cleaning MongoDB 'items' collection...");
    await mongoose.connect(process.env.MONGO_URI);
    const Item = mongoose.model("Item", new mongoose.Schema({})); 
    const mongoResult = await Item.collection.deleteMany({});
    console.log(`✅ MongoDB Cleared: ${mongoResult.deletedCount} items removed.`);

    // 2. Qdrant Reset
    console.log("📍 Re-initializing Qdrant 'items_vectors'...");
    const qdrant = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY
    });
    
    // Delete existing
    try {
      await qdrant.deleteCollection("items_vectors");
      console.log("🗑️ Qdrant Collection Deleted.");
    } catch (e) {
      console.log("ℹ️ Collection didn't exist or already deleted.");
    }

    // Create New with 1024 Dimensions (Mixedbread Large)
    await qdrant.createCollection("items_vectors", {
      vectors: {
        size: 1024,
        distance: "Cosine"
      }
    });
    console.log("✅ Qdrant Collection Re-created (1024 Dims).");

    // 3. Redis Flush
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
