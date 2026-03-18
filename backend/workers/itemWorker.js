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

/**
 * Background Worker for Item Processing
 * Handles:
 * 1. AI Content Enrichment (Tags/Summary)
 * 2. Semantic Embedding Generation
 * 3. Qdrant Vector DB Indexing
 * 4. Cluster Detection & Topic Linkage
 */
const itemWorker = new Worker('item-processing', async (job) => {
  const { itemId, userId } = job.data;
  console.log(`[Worker] Processing item: ${itemId} for user: ${userId}`);

  try {
    const item = await Item.findById(itemId);
    if (!item) throw new Error("Item not found");

    // --- PHASE 1: AI Enrichment ---
    // Extracting core topics and generating a concise summary
    const aiContent = item.content.slice(0, 2000);
    const [tagsResult, summaryResult] = await Promise.all([
      generateTagsForContent(item.title, aiContent),
      item.content.length > 50
        ? generateAISummary(item.title, aiContent)
        : ""
    ]);

    // --- PHASE 2: Vector Search Integration ---
    // Preparing text for the embedding model (Combining title, summary, and tags)
    const embeddingText = `
${item.title}
${summaryResult || ""}
${(tagsResult || []).join(" ")}
`;
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
            summary: summaryResult,
            user: userId,
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
        tags: tagsResult || []
      }).catch(err => console.error("[Worker] Topic sync error:", err.message));
    }

    // --- PHASE 3: DB Finalization ---
    // Mark item as 'completed' so it displays correctly on the frontend
    await Item.findByIdAndUpdate(itemId, {
      tags: tagsResult || [],
      summary: summaryResult || "",
      vectorId,
      clusterId,
      relatedItems: relatedIds,
      processingStatus: "completed"
    });

    console.log(`[Worker] Item processed successfully: ${itemId}`);
  } catch (error) {
    console.error(`[Worker] Error processing item ${itemId}:`, error.message);
    await Item.findByIdAndUpdate(itemId, { processingStatus: "failed" });
    throw error; // Allows BullMQ to handle retries
  }
}, {
  connection: redisConnection,
  concurrency: 3
});

console.log('BullMQ Worker started: item-processing');

export default itemWorker;
