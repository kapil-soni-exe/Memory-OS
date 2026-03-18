import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Generate embedding vector for semantic search
export const generateEmbedding = async (text) => {
  try {

    // Guard: prevent empty embedding requests
    if (!text || text.trim().length === 0) {
      return null;
    }

    // Limit text size for embedding models
    const inputText = text.trim().slice(0, 2000);

    const response = await cohere.embed({
      model: "embed-english-v3.0",
      texts: [inputText],
      inputType: "search_document"
    });

    return response.embeddings?.[0] || null;

  } catch (error) {
    console.error("Embedding generation failed:", error.message);
    return null;
  }
};