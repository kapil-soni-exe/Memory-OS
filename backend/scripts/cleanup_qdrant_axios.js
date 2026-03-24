import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import Item from "../models/item.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function cleanup() {
  try {
    console.log("--- STARTING QDRANT CLEANUP (AXIOS) ---");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Get all valid Item IDs from MongoDB
    const items = await Item.find({}, "_id");
    const validIds = items.map(item => item._id.toString());
    console.log(`Found ${validIds.length} valid items in MongoDB.`);

    const qdrantUrl = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;
    const collectionName = "items_vectors";

    // 2. Fetch all points from Qdrant via REST
    console.log("Fetching points from Qdrant...");
    
    // Using a simple scroll request via axios
    const response = await axios.post(`${qdrantUrl}/collections/${collectionName}/points/scroll`, 
      {
        limit: 100,
        with_payload: true,
        with_vector: false
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    const points = response.data.result.points;
    console.log(`Found ${points.length} points in Qdrant.`);

    let orphans = [];
    for (const point of points) {
      const itemId = point.payload?.itemId;
      if (!itemId || !validIds.includes(itemId)) {
        orphans.push(point.id);
        console.log(`🗑️  Marked orphan: ${point.id} (Item ID: ${itemId || 'N/A'})`);
      }
    }

    if (orphans.length > 0) {
      console.log(`Deleting ${orphans.length} orphans...`);
      await axios.post(`${qdrantUrl}/collections/${collectionName}/points/delete`, 
        {
          points: orphans
        },
        {
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Orphans deleted successfully.");
    } else {
      console.log("No orphans found.");
    }

    console.log("--- CLEANUP COMPLETE ---");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup failed:", error.response?.data || error.message);
  }
}

cleanup();
