import qdrant from "../../config/qdrant.js";
import { v4 as uuidv4 } from "uuid";

export const detectClusterByEmbedding = async (embedding, userId) => {
  try {
    if (!embedding || !userId) {
      return uuidv4(); // Fallback to unique cluster
    }

    // Search for the most semantically similar item belonging to the user
    const results = await qdrant.search("items_vectors", {
      vector: embedding,
      limit: 1, // We only need the top match to determine the cluster
      filter: {
        must: [
          {
            key: "user",
            match: { value: userId.toString() },
          },
        ],
      },
    });

    if (results && results.length > 0) {
      const bestMatch = results[0];
      
      // Check if the score is above threshold (0.78 for broader clustering)
      if (bestMatch.score > 0.78 && bestMatch.payload?.clusterId) {
        return bestMatch.payload.clusterId;
      }
    }

    // No similar items found above threshold, create a new cluster
    const newClusterId = uuidv4();
    return newClusterId;

  } catch (error) {
    console.error("Cluster detection error:", error.message);
    return uuidv4(); // Fallback to unique cluster on error
  }
};