import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Item from "../models/item.model.js";
import qdrant from "../config/qdrant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Item.countDocuments();
    console.log(`DB Count: ${count}`);
    
    const collections = await qdrant.getCollections();
    console.log("Qdrant Collections:", JSON.stringify(collections, null, 2));

    const info = await qdrant.getCollection("items_vectors");
    console.log("Collection Info:", JSON.stringify(info, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

verify();
