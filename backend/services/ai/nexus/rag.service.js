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
    if (!queryVector) return { memories: [], topMemories: [] };

    // 2. Vector search in Qdrant
    const searchResults = await qdrant.search("items_vectors", {
      vector: queryVector,
      limit: 10, // Increased from 5 for better recall
      filter: {
        must: [{ key: "user", match: { value: userId.toString() } }],
      },
    });

    const itemIds = searchResults.map(r => r.payload.itemId);
    const scoresMap = new Map(searchResults.map(r => [r.payload.itemId, r.score]));

    // 3. Fetch full item details from MongoDB
    const memories = await Item.find({ _id: { $in: itemIds } })
      .select("title summary content tags type likes views skips lastAccessedAt createdAt");

    const SIMILARITY_THRESHOLD = 0.3; // Lowered from 0.4 for better accessibility (esp. for Hinglish)

    // 4. Rank memories with composite score (Similarity + Importance + Recency)
    const rankedMemories = itemIds
      .map(id => {
        const m = memories.find(m => m._id.toString() === id);
        if (!m) return null;
        
        // Importance score
        const rawImportance = (m.likes || 0) * 2 + (m.views || 0) * 0.2 - (m.skips || 0) * 2;
        m.importance = Math.max(0, Math.min(1, rawImportance / 10));
        
        // Similarity score
        m.similarityScore = scoresMap.get(id);
        
        // Recency score
        const refDate = m.lastAccessedAt || m.createdAt || new Date();
        const daysAgo = (new Date() - new Date(refDate)) / (1000 * 60 * 60 * 24);
        m.recencyScore = Math.max(0, 1 - (daysAgo / 30));

        // Final weighted score
        m.finalScore = (m.similarityScore * 0.5) + (m.importance * 0.3) + (m.recencyScore * 0.2);

        return m;
      })
      .filter(Boolean);

    // 5. Filter and filter fallback
    const filteredMemories = rankedMemories.filter(m => m.similarityScore >= SIMILARITY_THRESHOLD);
    const finalCandidates = filteredMemories.length >= 2 ? filteredMemories : rankedMemories;

    // 6. Final re-rank and pick top 3
    const topMemories = finalCandidates
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 3);

    return {
      allRanked: rankedMemories,
      topMemories
    };

  } catch (error) {
    console.error("Nexus RAG Query Error:", error.message);
    throw error;
  }
};
