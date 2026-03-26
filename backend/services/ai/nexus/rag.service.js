import qdrant from "../../../config/qdrant.js";
import { generateEmbedding } from "../embeddingService.js";
import Item from "../../../models/item.model.js";

/**
 * Core RAG logic: search, ranking, and filtering
 * @param {string} userId - ID of the user
 * @param {string} query - The search query (potentially rewritten)
 * @returns {Promise<Object>} - Ranked memories and metadata
 */
export const queryNexus = async (userId, query) => {
  try {
    // 1. Generate embedding
    const queryVector = await generateEmbedding(query, "search_query");
    let initialMemories = [];

    // 1b. Keyword Fallback (If Embedding fails)
    if (!queryVector) {
      console.log(`[Resilience 2.0] Embedding failed for query: "${query}". Using Text Search Fallback.`);
      initialMemories = await Item.find(
        { $text: { $search: query }, user: userId },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean();

      // Normalize for unified flow
      initialMemories = initialMemories.map(m => ({
        ...m,
        similarityScore: m.score || 0.5, // Map text score to similarity
        matchType: "keyword_resilience"
      }));
    } else {
      // 2. Vector search in Qdrant (Normal Path)
      const searchResults = await qdrant.search("items_vectors", {
        vector: queryVector,
        limit: 15,
        filter: {
          must: [{ key: "user", match: { value: userId.toString() } }],
        },
      });

      const vectorIds = searchResults.map(r => r.payload.itemId);
      const vectorScoresMap = new Map(searchResults.map(r => [r.payload.itemId, r.score]));

      // 3. Keyword Search in MongoDB (Exact Matches for Hybrid)
      const keywordItems = await Item.find(
        { $text: { $search: query }, user: userId },
        { score: { $meta: "textScore" } }
      )
      .limit(5)
      .lean();

      // 4. Fetch full item details for Vector results
      const vectorItems = await Item.find({ _id: { $in: vectorIds } })
        .select("title summary content tags type likes views skips lastAccessedAt createdAt");

      // 5. Merge and Deduplicate
      const allItemsMap = new Map();
      
      // Add Vector Items
      vectorItems.forEach(item => {
        const id = item._id.toString();
        const m = item.toObject ? item.toObject() : item;
        m.similarityScore = vectorScoresMap.get(id) || 0;
        m.matchType = "vector";
        allItemsMap.set(id, m);
      });

      // Add Keyword Items (or update existing)
      keywordItems.forEach(item => {
        const id = item._id.toString();
        if (allItemsMap.has(id)) {
          const existing = allItemsMap.get(id);
          existing.similarityScore = Math.max(existing.similarityScore, 0.6); // Boost for double match
          existing.matchType = "hybrid";
        } else {
          item.similarityScore = (item.score || 0.4);
          item.matchType = "keyword";
          allItemsMap.set(id, item);
        }
      });

      initialMemories = Array.from(allItemsMap.values());
    }

    // 6. Uniform Ranking with Composite Score
    const rankedMemories = initialMemories.map(m => {
      const refDate = m.lastAccessedAt || m.createdAt || new Date();
      const daysAgo = (new Date() - new Date(refDate)) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - (daysAgo / 30));
      const rawImportance = (m.likes || 0) * 2 + (m.views || 0) * 0.2 - (m.skips || 0) * 2;
      const importance = Math.max(0, Math.min(1, rawImportance / 10));

      const matchBoost = m.matchType === "hybrid" ? 0.2 : (m.matchType === "keyword" ? 0.1 : 0);
      m.finalScore = (m.similarityScore * 0.5) + (importance * 0.2) + (recencyScore * 0.1) + matchBoost;
      return m;
    });

    const topMemories = rankedMemories
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 8); // Give Reranker a healthy list

    return {
      allRanked: rankedMemories,
      topMemories,
      isFallback: !queryVector
    };

  } catch (error) {
    console.error("Nexus RAG Query Error:", error.message);
    throw error;
  }
};
