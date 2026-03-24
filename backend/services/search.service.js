import Item from "../models/item.model.js";
import { generateEmbedding } from "./ai/embeddingService.js";
import qdrant from "../config/qdrant.js";

// Hybrid search: vector search + keyword search
export const hybridSearch = async (query, userId) => {

  // Generate embedding for query
  const queryVector = await generateEmbedding(query, "search_query");

  let vectorItems = [];
  const vectorScoreMap = new Map(); // itemId -> vectorScore

  // -----------------------------
  // Vector search (Qdrant)
  // -----------------------------
  if (queryVector) {
    const vectorResults = await qdrant.search("items_vectors", {
      vector: queryVector,
      limit: 10, // Increased limit for better hybrid re-ranking
      filter: {
        must: [
          {
            key: "user",
            match: { value: userId },
          },
        ],
      },
    });

    const vectorIds = vectorResults.map(r => {
      const itemId = r.payload.itemId;
      vectorScoreMap.set(itemId, r.score); // 1. Extract similarity score
      return itemId;
    });

    if (vectorIds.length > 0) {
      vectorItems = await Item.find({
        _id: { $in: vectorIds },
      }).lean();
    }
  }

  // -----------------------------
  // Keyword search (MongoDB)
  // -----------------------------
  const keywordItems = await Item.find({
    user: userId,
    $text: { $search: query }
  }).limit(10).lean();


  // -----------------------------
  // Merge, Score and Filter results
  // -----------------------------
  const combined = [...vectorItems, ...keywordItems].map(item => {
    const itemId = item._id.toString();
    const vectorScore = vectorScoreMap.get(itemId) || 0;
    
    // 1. Improved Keyword Scoring: Partial matches + Weighting
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let keywordScore = 0;
    
    if (queryWords.length > 0) {
      let matchPoints = 0;
      const title = item.title?.toLowerCase() || "";
      const content = item.content?.toLowerCase() || "";
      
      queryWords.forEach(word => {
        // Title matches are more important (2.0 weight)
        if (title.includes(word)) matchPoints += 2;
        // Content matches (1.0 weight)
        else if (content.includes(word)) matchPoints += 1;
      });

      // Normalize keywordScore between 0 and 1
      // (Max possible points = queryWords.length * 2)
      keywordScore = matchPoints / (queryWords.length * 2);
    } else {
      // Fallback for very short queries
      const lowerQuery = query.toLowerCase();
      if (item.title?.toLowerCase().includes(lowerQuery)) keywordScore = 1;
      else if (item.content?.toLowerCase().includes(lowerQuery)) keywordScore = 0.5;
    }

    // 2. Prevent Zero-Score Results: Boost for keyword matches
    const keywordBoost = keywordScore > 0 ? 0.05 : 0;

    // 3. Compute finalScore: (0.7 * vectorScore) + (0.3 * keywordScore) + boost
    const finalScore = (0.7 * vectorScore) + (0.3 * keywordScore) + keywordBoost;

    // 4. Generate Match Reason for Explainability (Minimalist)
    let matchReason = "";
    if (vectorScore > 0.4 && keywordScore > 0.5) {
      matchReason = "Semantic match + high keyword relevance";
    } else if (vectorScore > 0.4) {
      matchReason = "Semantic similarity";
    } else if (keywordScore > 0) {
      matchReason = "Keyword match";
    }

    return {
      ...item,
      finalScore,
      similarityScore: vectorScore, // Expose raw similarity for precise filtering
      matchReason // Attach reason
    };
  });


  // -----------------------------
  // Remove duplicates and Filter low relevance
  // -----------------------------
  const RELEVANCE_THRESHOLD = 0.2; // 🔥 Configurable threshold for quality
  const uniqueMap = new Map();
  combined.forEach(item => {
    // 4. Filtering: Only keep results with decent relevance
    if (item.finalScore < RELEVANCE_THRESHOLD) return;

    const key = item.url || item.title || item._id.toString();
    if (!uniqueMap.has(key) || (item.finalScore > uniqueMap.get(key).finalScore)) {
      uniqueMap.set(key, item);
    }
  });

  // 5. Sort DESC
  const sortedResults = Array.from(uniqueMap.values())
    .sort((a, b) => b.finalScore - a.finalScore);

  return sortedResults;
};