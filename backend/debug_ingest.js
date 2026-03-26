import "dotenv/config";
import Item from "./models/item.model.js";
import { generateEmbedding } from "./services/ai/embeddingService.js";
import qdrant from "./config/qdrant.js";
import { detectClusterByEmbedding } from "./services/ai/clusterService.js";
import connectDB from "./config/db.js";
import { v4 as uuidv4 } from "uuid";

async function testIngest() {
  console.log("--- STARTING FULL INGESTION SIMULATION ---");
  await connectDB();

  // Create dummy item
  const item = new Item({
    title: "Diagnostic Test Memory",
    content: "This is a test to verify that the Voyage AI engine (1024-dim) is correctly clustering and indexing in Qdrant.",
    user: "64f1a2b3c4d5e6f7a8b9c0d1", // Dummy User ID
    processingStatus: "pending"
  });
  await item.save();
  console.log(`✅ Item created in MongoDB: ${item._id}`);

  // Simulate Phase 2 (Embedding)
  console.log("1. Generating Embedding (Voyage-3)...");
  const embedding = await generateEmbedding(item.content);
  
  if (!embedding) {
    console.error("❌ Embedding FAILED (is NULL)");
    process.exit(1);
  }
  console.log(`✅ Embedding SUCCESS. Size: ${embedding.length}`);

  // Simulate Phase 2 (Clustering)
  console.log("2. Detecting Cluster...");
  const clusterId = await detectClusterByEmbedding(embedding, item.user.toString());
  console.log(`✅ Cluster Detection SUCCESS. ID: ${clusterId}`);

  // Simulate Qdrant Upsert
  console.log("3. Upserting to Qdrant...");
  const vectorId = uuidv4();
  await qdrant.upsert("items_vectors", {
    points: [{
      id: vectorId,
      vector: embedding,
      payload: {
        itemId: item._id.toString(),
        title: item.title,
        user: item.user.toString(),
        clusterId
      }
    }]
  });
  console.log("✅ Qdrant Upsert SUCCESS.");

  // Update MongoDB
  await Item.findByIdAndUpdate(item._id, {
    vectorId,
    clusterId,
    processingStatus: "completed"
  });
  console.log("✅ MongoDB Item UPDATED with clusterId.");

  console.log("--- TEST COMPLETED SUCCESSFULLY ---");
  process.exit(0);
}

testIngest().catch(err => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
