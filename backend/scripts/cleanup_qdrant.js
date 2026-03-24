import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Item from "../models/item.model.js";
import qdrant from "../config/qdrant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function cleanup() {
  try {
    console.log("--- STARTING QDRANT CLEANUP ---");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Get all valid Item IDs from MongoDB
    const items = await Item.find({}, "_id");
    const validIds = items.map(item => item._id.toString());
    console.log(`Found ${validIds.length} valid items in MongoDB.`);

    // 2. Fetch all points from Qdrant (scroll)
    let offset = null;
    let orphanCount = 0;
    const collectionName = "items_vectors";

    console.log("Scanning Qdrant for orphans...");

    while (true) {
      const response = await qdrant.scroll(collectionName, {
        limit: 100,
        offset: offset,
        with_payload: true,
        with_vector: false
      });

      const points = response.points;
      if (points.length === 0) break;

      for (const point of points) {
        const itemId = point.payload?.itemId;
        
        if (!itemId || !validIds.includes(itemId)) {
          console.log(`🗑️  Found orphan point: ${point.id} (Item ID: ${itemId || 'N/A'})`);
          await qdrant.delete(collectionName, {
            points: [point.id]
          });
          orphanCount++;
        }
      }

      offset = response.next_page_offset;
      if (!offset) break;
    }

    console.log(`--- CLEANUP COMPLETE ---`);
    console.log(`Total Orphans Removed: ${orphanCount}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup failed:", error.message);
    process.exit(1);
  }
}

cleanup();
