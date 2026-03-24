import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Item from "./models/item.model.js";
import { queryNexus } from "./services/ai/nexus/rag.service.js";
import { generateAnswer } from "./services/ai/nexus/llm.service.js";
import { buildContext } from "./services/ai/nexus/contextBuilder.js";
import { buildPrompt } from "./services/ai/nexus/prompt.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function runTest() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a user ID
    const someItem = await Item.findOne();
    const userId = someItem?.user || new mongoose.Types.ObjectId();
    console.log(`Using User ID: ${userId}`);

    const url = "https://www.geeksforgeeks.org/web-tech/json-web-token-jwt/";

    console.log(`Step 1: Ensuring article is saved...`);
    let item = await Item.findOne({ url });
    
    if (!item) {
        console.log("Item not found. Creating manual entry for test...");
        item = await Item.create({
            user: userId,
            url,
            title: "JSON Web Token (JWT) - GeeksforGeeks",
            content: "A JSON Web Token (JWT) consists of three parts as a string, separated by dots (.). These parts are: 1. Header: Typically consists of two parts: the type of the token (JWT) and the hashing algorithm being used (e.g., HMAC SHA256 or RSA). 2. Payload: Contains the claims, which are statements about an entity (typically, the user) and additional data. 3. Signature: To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.",
            type: "article",
            processingStatus: "completed"
        });
    }

    const query = "What are the three parts of a JSON Web Token (JWT) and what does each part contain?";
    console.log(`Step 2: Querying Nexus with: "${query}"`);

    const { topMemories } = await queryNexus(userId, query);
    console.log(`Found ${topMemories.length} relevant memories.`);

    const context = buildContext(topMemories);
    const prompt = buildPrompt(query, context);
    
    console.log("Step 3: Generating Answer...");
    const answer = await generateAnswer(prompt);
    
    console.log("\n--- NEXUS ANSWER ---");
    console.log(answer);
    console.log("--------------------\n");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
