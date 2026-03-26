import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./.env") });

async function deepClean() {
  console.log("🧹 [v3.0] Starting Native Deep Clean...");

  try {
    // 1. MongoDB Clean
    console.log("📍 Cleaning MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    const mongoResult = await mongoose.connection.db.collection('items').deleteMany({});
    console.log(`✅ MongoDB Cleared: ${mongoResult.deletedCount} items.`);

    // 2. Qdrant Reset (Native REST)
    console.log("📍 Re-initializing Qdrant Collections...");
    const qBase = process.env.QDRANT_URL;
    const qKey = process.env.QDRANT_API_KEY;
    
    // Delete
    await fetch(`${qBase}/collections/items_vectors`, {
      method: 'DELETE',
      headers: { 'api-key': qKey }
    });
    console.log("🗑️ Qdrant Collection Purged.");

    // Create (1024 dims)
    const qResp = await fetch(`${qBase}/collections/items_vectors`, {
      method: 'PUT',
      headers: { 'api-key': qKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vectors: { size: 1024, distance: "Cosine" }
      })
    });
    const qData = await qResp.json();
    console.log("✅ Qdrant Re-created:", qData.status);

    // 3. Redis Flush (Upstash REST)
    console.log("📍 Flushing Upstash Redis...");
    const rUrl = process.env.UPSTASH_REDIS_REST_URL;
    const rToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    const rResp = await fetch(`${rUrl}/flushall`, {
      headers: { Authorization: `Bearer ${rToken}` }
    });
    const rData = await rResp.json();
    console.log("✅ Redis Flushed:", rData.result);

    console.log("\n✨ SYSTEM IS NOW FRESH & READY! ✨");
    process.exit(0);

  } catch (err) {
    console.error("❌ Deep Clean v3 Failed:", err.message);
    process.exit(1);
  }
}

deepClean();
