import Item from "../models/item.model.js";
import { generateEmbedding } from "./ai/embeddingService.js";
import qdrant from "../config/qdrant.js";
import mongoose from "mongoose"; // Added for ObjectId casting

// Hybrid search: vector search + keyword search
export const hybridSearch = async (query, userId) => {
  console.log(`[Search Controller] Initiating Hybrid Search: "${query}" | User: ${userId}`);

  // Generate embedding for query
  const queryVector = await generateEmbedding(query, "search_query");

  let vectorItems = [];
  const vectorScoreMap = new Map(); // itemId -> vectorScore

  // 1. Vector search (Qdrant)
  if (queryVector) {
    try {
      const vectorResults = await qdrant.search("items_vectors", {
        vector: queryVector,
        limit: 15, // Provide more candidates for hybrid merging
        filter: {
          must: [
            {
              key: "user",
              match: { value: userId.toString() },
            },
          ],
        },
      });

      console.log(`[Qdrant] Found ${vectorResults.length} raw semantic matches.`);
      console.log("VECTOR RESULTS:", JSON.stringify(vectorResults, null, 2));

      const vectorIds = vectorResults.map(r => {
        const itemId = String(r.payload.itemId).trim(); // 👈 normalize
        vectorScoreMap.set(itemId, r.score);
        return itemId;
      });

      // CRITICAL FIX: Explicitly cast to ObjectIds for Mongoose lookup
      const objectIds = vectorIds.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (e) {
          return null;
        }
      }).filter(id => id !== null);

      if (objectIds.length > 0) {
        vectorItems = await Item.find({
          _id: { $in: objectIds },
        }).lean();
        console.log(`[MongoDB] Successfully retrieved ${vectorItems.length} items from Qdrant IDs.`);
      }
    } catch (qErr) {
      console.error("[Qdrant Search Error]", qErr.message);
    }
  }

  // 2. Keyword search (MongoDB)
  const keywordItems = await Item.find({
    user: userId,
    $text: { $search: query }
  }).limit(10).lean();
  console.log(`[MongoDB] Keyword search found ${keywordItems.length} direct matches.`);


  // Debug Logs for ID Alignment
  console.log("---- VECTOR MAP DEBUG ----");
  vectorScoreMap.forEach((score, id) => {
    console.log("Map ID:", id);
  });

  vectorItems.forEach(item => {
    const id = item._id.toString();
    console.log("Mongo ID:", id, "Score:", vectorScoreMap.get(id));
  });

  // 3. Merge, Score and Filter results
  const combined = [...vectorItems, ...keywordItems].map(item => {
    const itemId = String(item._id).trim();
    const vectorScore = vectorScoreMap.get(itemId) ?? 0;
    
    // Improved Keyword Scoring
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let keywordScore = 0;
    
    if (queryWords.length > 0) {
      let matchPoints = 0;
      const title = item.title?.toLowerCase() || "";
      const content = item.content?.toLowerCase() || "";
      
      queryWords.forEach(word => {
        if (title.includes(word)) matchPoints += 2;
        else if (content.includes(word)) matchPoints += 1;
      });
      keywordScore = matchPoints / (queryWords.length * 2);
    } else {
      const lowerQuery = query.toLowerCase();
      if (item.title?.toLowerCase().includes(lowerQuery)) keywordScore = 1;
      else if (item.content?.toLowerCase().includes(lowerQuery)) keywordScore = 0.5;
    }

    const keywordBoost = keywordScore > 0 ? 0.05 : 0;

    // CALIBRATION: Weight 80% to vectors for Voyage AI precision
    const finalScore = (0.8 * vectorScore) + (0.2 * keywordScore) + keywordBoost;

    // Match Reason for UI
    let matchReason = "";
    if (vectorScore > 0.25 && keywordScore > 0.5) {
      matchReason = "Semantic match + high keyword relevance";
    } else if (vectorScore > 0.20) {
      matchReason = "Semantic similarity";
    } else if (keywordScore > 0) {
      matchReason = "Keyword match";
    }

    return {
      ...item,
      finalScore,
      similarityScore: vectorScore,
      matchReason
    };
  });


  // 4. Remove duplicates and Filter low relevance
  const RELEVANCE_THRESHOLD = 0.05; // Voyage AI optimized threshold
  const uniqueMap = new Map();
  
  combined.forEach(item => {
    if (item.finalScore < RELEVANCE_THRESHOLD) return;

    const key = item.url || item.title || item._id.toString();
    if (!uniqueMap.has(key) || (item.finalScore > uniqueMap.get(key).finalScore)) {
      uniqueMap.set(key, item);
    }
  });

  const sortedResults = Array.from(uniqueMap.values())
    .sort((a, b) => b.finalScore - a.finalScore);

  console.log(`[Search Final] Returning ${sortedResults.length} total results after merging.`);
  return {
    results: sortedResults,
    isFallback: false
  };
};