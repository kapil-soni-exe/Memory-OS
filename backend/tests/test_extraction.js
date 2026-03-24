import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { extractKnowledge } from "../services/ai/nexus/knowledgeExtractor.js";

async function testExtraction() {
  const title = "The Future of AI Agents: How Autonomous Systems Will Change Work";
  const content = `
    Artificial Intelligence is evolving from passive assistants to active agents. 
    These autonomous systems can now perform complex tasks like booking travel, 
    writing code, and managing calendars without human intervention. 
    Companies like OpenAI, Anthropic, and Google are leading this shift. 
    The impact on the global workforce will be significant, requiring new skills 
    and potentially displacing certain administrative roles while creating new 
    opportunities in AI orchestration.
  `;

  console.log("--- STARTING KNOWLEDGE EXTRACTION TEST ---");
  console.log("Title:", title);

  try {
    const result = await extractKnowledge(title, content);
    console.log("\n✅ Extracted Structured Knowledge:");
    console.log(JSON.stringify(result, null, 2));

    const requiredKeys = ["summary", "tags", "entities", "relationships"];
    const missingKeys = requiredKeys.filter(key => !(key in result));

    if (missingKeys.length === 0) {
      console.log("\n✨ Validation Passed: All required fields present.");
    } else {
      console.log("\n❌ Validation Failed: Missing keys:", missingKeys.join(", "));
    }

  } catch (error) {
    console.error("\n❌ Test failed with error:", error.message);
  }
}

testExtraction();
