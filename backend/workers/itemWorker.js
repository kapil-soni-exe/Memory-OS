import { Worker } from 'bullmq';
import redisConnection from '../config/redis.js';
import Item from "../models/item.model.js";
import { generateTagsForContent } from "../services/ai/tag/tagGenerator.js";
import { generateAISummary } from "../services/ai/generateAISummary.js";
import { generateEmbedding } from "../services/ai/embeddingService.js";
import { v4 as uuidv4 } from "uuid";
import qdrant from "../config/qdrant.js"
import { detectClusterByEmbedding } from "../services/ai/clusterService.js";
import { findRelatedItems } from "../services/ai/findRelatedItems.js";
import { handleTopic } from "../services/topic.service.js";

import { extractKnowledge } from "../services/ai/nexus/knowledgeExtractor.js";

/**
 * Background Worker for Item Processing
 * Handles:
 * 1. AI Content Enrichment (Structured Knowledge: Tags/Summary/Entities/Relationships)
 * 2. Semantic Embedding Generation (Knowledge-Centric)
 * 3. Qdrant Vector DB Indexing
 * 4. Cluster Detection & Topic Linkage
 */
const itemWorker = new Worker('item-processing', async (job) => {
  const { itemId, userId } = job.data;
  console.log(`[Worker] Picking up job ${job.id} for item ${itemId}...`);

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      console.warn(`[Worker] Job ${job.id} skipped: Item ${itemId} not found`);
      return;
    }

    console.log(`[Worker] 🧠 Processing: "${item.title}" (${item.type}) for user ${userId}`);

    // --- PHASE 1: Structured Knowledge Extraction (with Fallback) ---
    console.log(`[Worker] ✨ Extracting AI Knowledge for item ${itemId}...`);
    const aiContent = (item.content || item.title || "").slice(0, 10000); 
    let summary, tags, entities, relationships, nuggets;

    try {
      const knowledge = await extractKnowledge(item.title, aiContent, {
        type: item.type,
        author: item.author,
        metadata: item.metadata
      });
      summary = knowledge.summary;
      tags = knowledge.tags;
      entities = knowledge.entities;
      relationships = knowledge.relationships;
      nuggets = knowledge.nuggets;
    } catch (err) {
      console.error(`[Worker] Knowledge extraction failed, using fallback: ${err.message}`);
      const fallbackContent = aiContent || item.title || "";
      [tags, summary] = await Promise.all([
        generateTagsForContent(item.title, fallbackContent),
        fallbackContent.length > 50 ? generateAISummary(item.title, fallbackContent) : ""
      ]);
      entities = [];
      relationships = [];
      nuggets = [];
    }

    // --- PHASE 2: Knowledge-Centric Embedding ---
    // Structured format ensures the vector captures the core semantic essence
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

    let vectorId = null;
    let clusterId = null;
    let relatedIds = [];

    if (embedding) {
      vectorId = uuidv4();

      // Smart Clustering: Groups similar memories based on spatial distance
      clusterId = await detectClusterByEmbedding(embedding, userId);

      // Indexing in Qdrant for fast semantic retrieval
      await qdrant.upsert("items_vectors", {
        points: [{
          id: vectorId,
          vector: embedding,
          payload: {
            itemId: item._id.toString(),
            title: item.title,
            summary: summary,
            user: userId.toString(),
            clusterId
          },
        }],
      });

      // Semantic Relationship: Find top 5 related items in the "Memory Galaxy"
      relatedIds = await findRelatedItems(embedding, userId, item._id.toString());

      // Topic Engine Sync: Updates or creates a human-readable topic 
      handleTopic({
        userId,
        clusterId,
        itemId: item._id,
        tags: tags || [],
        embedding
      }).catch(err => console.error("[Worker] Topic sync error:", err.message));
    }

    // --- PHASE 3: DB Finalization ---
    // Mark item as 'completed' so it displays correctly on the frontend
    await Item.findByIdAndUpdate(itemId, {
      tags: tags || [],
      summary: summary || "",
      entities: entities || [],
      relationships: relationships || [],
      nuggets: nuggets || [],
      vectorId,
      clusterId,
      relatedItems: relatedIds,
      processingStatus: "completed"
    });

    console.log(`[Worker] ✅ Success: "${item.title}" processing complete.`);

    // (Log removed for production)
  } catch (error) {
    console.error(`[Worker] Error processing item ${itemId}:`, error.message);
    await Item.findByIdAndUpdate(itemId, { processingStatus: "failed" });
    throw error; // Allows BullMQ to handle retries
  }
}, {
  connection: redisConnection,
  concurrency: 1,           // Single processing to save Redis resources
  drainDelay: 5,            // Balanced: Wait 5s before polling (Best UX vs Request ratio)
  stalledInterval: 60000,   // Check stalled jobs every 60s
  lockDuration: 300000,     // 5 minute lock - massive reduction in heartbeats
  lockRenewTime: 120000,    // 2 minute renewal - saves thousands of writes
});

console.log('✅ [Worker] Background processor started and ready');

export default itemWorker;
