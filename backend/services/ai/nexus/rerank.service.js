import client from "./llm.service.js";

/**
 * Rerank retrieved memories using a fast LLM pass
 * @param {string} query - The user's original query
 * @param {Array} memories - Top 5-10 memories from hybrid search
 * @returns {Promise<Array>} - Reranked and filtered memories
 */
export const rerankMemories = async (query, memories) => {
  if (!memories || memories.length <= 1) return memories;

  try {
    const memoryList = memories.map((m, i) => `[${i}] Title: ${m.title}\nSummary: ${m.summary}\n`).join("\n");

    const prompt = `You are a Retrieval Ranker. Which of these memories are actually RELEVANT to the user's query?

Query: "${query}"

Memories:
${memoryList}

Rules:
1. Return ONLY a comma-separated list of the indexes [0, 1, 2...] of the most relevant memories.
2. Order them by relevance (best first).
3. If NONE are relevant, return "NONE".
4. Max 3 indexes.

Output:`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // High speed, low cost for reranking
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const result = response.choices[0].message.content.trim();
    if (result === "NONE") return [];

    const indexes = result.split(",")
      .map(s => parseInt(s.trim().replace(/[\[\]]/g, ''), 10))
      .filter(n => !isNaN(n) && n >= 0 && n < memories.length);

    // Return the memories in the new ranked order
    return indexes.map(idx => memories[idx]);

  } catch (error) {
    console.error("Reranking failed, falling back to original order:", error.message);
    return memories.slice(0, 3);
  }
};
