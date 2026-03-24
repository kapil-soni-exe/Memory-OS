import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Item from "../models/item.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function list() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await Item.find({}, "title user createdAt");
    console.log(`Found ${items.length} items:`);
    items.forEach(item => {
      console.log(`- ${item.title} (User: ${item.user}, Created: ${item.createdAt})`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error("List failed:", error.message);
  }
}

list();
