import { getHistory } from "./chat.service.js";
import client from "./llm.service.js";

/**
 * Rewrite user query into a self-contained search query using last user context
 * @param {string} query - The current user query
 * @returns {Promise<string>} - The rewritten query
 */
export const rewriteQuery = async (query) => {
  try {
    const history = getHistory();
    // Get the last user message for context (to resolve "What about X?")
    const lastUserMsg = history.filter(m => m.role === 'user').pop();
    const contextPrefix = lastUserMsg ? `Context: Last user message was "${lastUserMsg.content}"` : "";

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Rewrite the user query into a standalone, highly descriptive search query for a vector and keyword database.
${contextPrefix ? `Account for the following conversation context if needed:\n${contextPrefix}` : ""}

Strict Rules:
1. Language (Bilingual Retrieval): For Hinglish/slang, include BOTH the original word AND the English expansion (e.g., "khana" -> "khana food meals", "paisa" -> "paisa money finance"). This ensures keyword search hits original notes while vector search hits semantic topics.
2. Content: Include specific names, technical terms, and intended topics.
3. Format: Return ONLY the rewritten query string. No meta-commentary.
4. Expansion: If the query is "Tell me about X", expand it to "Detailed information and notes regarding the topic of X".

Output:`
        },
        { role: "user", content: query }
      ],
      temperature: 0.1,
    });

    const rewritten = response.choices[0].message.content.trim();
    return rewritten.replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Query Rewriting failed:", error.message);
    return query; // Fallback to original
  }
};
