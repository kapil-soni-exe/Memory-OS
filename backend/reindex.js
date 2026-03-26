import "dotenv/config";
import connectDB from "./config/db.js";
import Item from "./models/item.model.js";
import { generateEmbedding } from "./services/ai/embeddingService.js";
import qdrant from "./config/qdrant.js";
import { detectClusterByEmbedding } from "./services/ai/clusterService.js";
import { v4 as uuidv4 } from "uuid";

async function reindex() {
  console.log("--- BATCH RE-INDEXING STARTING (Voyage-3) ---");
  await connectDB();

  const pendingItems = await Item.find({ processingStatus: { $ne: "completed" } });
  console.log(`Found ${pendingItems.length} items to re-index.`);

  for (const item of pendingItems) {
    try {
      console.log(`Processing: ${item.title}...`);
      const embedding = await generateEmbedding(item.content);
      
      if (!embedding) {
        console.warn(`[!] Skipping ${item.title}: Embedding null`);
        continue;
      }

      const clusterId = await detectClusterByEmbedding(embedding, item.user.toString());
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

      await Item.findByIdAndUpdate(item._id, {
        vectorId,
        clusterId,
        processingStatus: "completed"
      });

      console.log(`[+] Success: ${item.title} -> Cluster ${clusterId}`);
    } catch (err) {
      console.error(`[-] Failed: ${item.title}: ${err.message}`);
    }
  }

  console.log("--- RE-INDEXING FINISHED ---");
  process.exit(0);
}

reindex();
