import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Item from '../models/item.model.js';
import { extractKnowledge } from '../services/ai/nexus/knowledgeExtractor.js';
import { generateEmbedding } from '../services/ai/embeddingService.js';
import qdrant from '../config/qdrant.js';

async function migrate() {
  try {
    console.log("--- STARTING KNOWLEDGE MIGRATION ---");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Process all items to ensure they match the latest structured format
    const items = await Item.find({});

    console.log(`Found ${items.length} items to upgrade.`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`[${i + 1}/${items.length}] Upgrading: ${item.title}`);

      try {
        // 1. Extract Knowledge
        const aiContent = (item.content || "").slice(0, 2000);
        if (!aiContent) {
          console.log(`   ⚠️ Skipping (No content)`);
          continue;
        }
        const knowledge = await extractKnowledge(item.title, aiContent);
        const { summary, tags, entities, relationships } = knowledge;

        // 2. Generate New Embedding
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

        const embedding = await generateEmbedding(embeddingText);

        if (embedding) {
          // 3. Update Qdrant
          const vectorId = item.vectorId || uuidv4();
          await qdrant.upsert("items_vectors", {
            points: [{
              id: vectorId,
              vector: embedding,
              payload: {
                itemId: item._id.toString(),
                title: item.title,
                summary: summary,
                user: item.user.toString(),
                clusterId: item.clusterId
              },
            }],
          });

          // 4. Update MongoDB
          item.summary = summary || item.summary;
          item.tags = tags || item.tags;
          item.entities = entities || [];
          item.relationships = relationships || [];
          item.vectorId = vectorId;
          await item.save();

          console.log(`   ✅ Success`);
        } else {
          console.log(`   ⚠️ Skipping (Embedding generation failed)`);
        }

      } catch (err) {
        console.error(`   ❌ Failed to process ${item._id}:`, err.message);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("--- MIGRATION COMPLETE ---");
    await mongoose.disconnect();

  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
