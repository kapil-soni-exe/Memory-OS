import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function findDBs() {
  try {
    const client = await mongoose.connect(process.env.MONGO_URI);
    const admin = client.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log("Databases in cluster:", dbs.databases.map(d => d.name));
    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

findDBs();
