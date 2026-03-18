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
            match: { value: userId },
          },
        ],
      },
    });

    if (results && results.length > 0) {
      const bestMatch = results[0];
      
      // Check if the similarity score is above our threshold
      // Qdrant usually returns cosine similarity (-1 to 1) when configured for it
      if (bestMatch.score > 0.5 && bestMatch.payload?.clusterId) {
        console.log(`Matched existing cluster: ${bestMatch.payload.clusterId} with score ${bestMatch.score.toFixed(3)}`);
        return bestMatch.payload.clusterId;
      }
      console.log(`Closest match for user ${userId} was ${bestMatch.score.toFixed(3)}, which is below threshold 0.5`);
    }

    // No similar items found above threshold, create a new cluster
    const newClusterId = uuidv4();
    console.log(`Created new cluster: ${newClusterId}`);
    return newClusterId;

  } catch (error) {
    console.error("Cluster detection error:", error.message);
    return uuidv4(); // Fallback to unique cluster on error
  }
};