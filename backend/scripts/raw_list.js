import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function listAll() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Guess collection name (item or items)
    const items = await mongoose.connection.db.collection("items").find({}).project({ title: 1, user: 1 }).toArray();
    console.log(`Found ${items.length} items in 'items' collection.`);
    items.forEach(i => console.log(`- ${i.title} (${i._id})`));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

listAll();
