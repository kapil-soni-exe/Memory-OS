import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Item from '../models/item.model.js';
import { extractKnowledge } from '../services/ai/nexus/knowledgeExtractor.js';
import { generateTagsForContent } from "../services/ai/tag/tagGenerator.js";
import { generateAISummary } from "../services/ai/generateAISummary.js";
import { generateEmbedding } from "../services/ai/embeddingService.js";

async function testWorkerLogic() {
  try {
    console.log("--- STARTING WORKER LOGIC TEST ---");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Pick a sample item
    const item = await Item.findOne({ 
      content: { $exists: true, $ne: "" } 
    });
    if (!item) {
      console.log("No items found with content. Please save an item first.");
      return;
    }

    console.log(`Testing with Item: ${item.title} (${item._id})`);

    // --- MANUALLY EMULATE WORKER LOGIC ---
    
    // 1. Extraction (with Fallback)
    const aiContent = item.content.slice(0, 2000);
    let summary, tags, entities, relationships;

    console.log("1. Running Structured Knowledge Extraction...");
    try {
      const knowledge = await extractKnowledge(item.title, aiContent);
      summary = knowledge.summary;
      tags = knowledge.tags;
      entities = knowledge.entities;
      relationships = knowledge.relationships;
      console.log("   ✅ Extraction Success");
    } catch (err) {
      console.log(`   ⚠️ Extraction failed, using fallback: ${err.message}`);
      [tags, summary] = await Promise.all([
        generateTagsForContent(item.title, aiContent),
        item.content.length > 50 ? generateAISummary(item.title, aiContent) : ""
      ]);
      entities = [];
      relationships = [];
    }

    // 2. Embedding Text Construction
    console.log("2. Building Embedding Text...");
    const embeddingText = `
Title: ${item.title}

Summary:
${summary}

Tags:
${(tags || []).join(", ")}

Entities:
${(entities || []).join(", ")}

Relationships:
${(relationships || [])
  .map(r => `${r.source} ${r.relation} ${r.target}`)
  .join(". ")
}
`.trim();

    console.log("--- EMBEDDING TEXT PREVIEW ---");
    console.log(embeddingText);
    console.log("------------------------------");

    // 3. Generate Embedding
    console.log("3. Generating Embedding...");
    const embedding = await generateEmbedding(embeddingText);
    if (embedding) {
      console.log(`   ✅ Embedding Success (Size: ${embedding.length})`);
    } else {
      console.log("   ❌ Embedding Failed");
    }

    await mongoose.disconnect();
    console.log("--- TEST COMPLETE ---");

  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

testWorkerLogic();
