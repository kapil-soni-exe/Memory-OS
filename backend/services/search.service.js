import Item from "../models/item.model.js";
import { generateEmbedding } from "./ai/embeddingService.js";
import qdrant from "../config/qdrant.js";

// Hybrid search: vector search + keyword search
export const hybridSearch = async (query, userId) => {

  // Generate embedding for query
  const queryVector = await generateEmbedding(query);

  let vectorItems = [];

  // -----------------------------
  // Vector search (Qdrant)
  // -----------------------------
  if (queryVector) {

    const vectorResults = await qdrant.search("items_vectors", {
      vector: queryVector,
      limit: 5,
      filter: {
        must: [
          {
            key: "user",
            match: { value: userId },
          },
        ],
      },
    });

    const vectorIds = vectorResults.map(r => r.payload.itemId);

    if (vectorIds.length > 0) {
      vectorItems = await Item.find({
        _id: { $in: vectorIds },
      });
    }
  }

  // -----------------------------
  // Keyword search (MongoDB)
  // -----------------------------
  const keywordItems = await Item.find({
    user: userId,
    $text: { $search: query }
  }).limit(5);


  // -----------------------------
  // Merge results
  // -----------------------------
  const combined = [...vectorItems, ...keywordItems];


  // -----------------------------
  // Remove duplicates
  // -----------------------------
  const uniqueResults = [
    ...new Map(
      combined.map(item => [item.url || item.title, item])
    ).values()
  ];

  return uniqueResults;
};