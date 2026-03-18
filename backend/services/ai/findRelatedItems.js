import qdrant from "../../config/qdrant.js";

export const findRelatedItems = async (vector, userId, currentItemId) => {
  try {

    const results = await qdrant.search("items_vectors", {
      vector,
      limit: 3, // top 3 related memories
      filter: {
        must: [
          {
            key: "user",
            match: { value: userId },
          },
        ],
      },
    });

    // Extract itemIds
    const relatedIds = results
      .map(r => r.payload.itemId)
      .filter(id => id !== currentItemId);

    return relatedIds;

  } catch (error) {

    console.error("Related items search error:", error.message);
    return [];

  }
};