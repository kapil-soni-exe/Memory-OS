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
          content: `
Rewrite the user query into a standalone, descriptive search query for a vector database.
${contextPrefix ? `Account for the following context if the current query is vague or uses pronouns:\n${contextPrefix}` : ""}

Rules:
- Language: Maintain the same language/dialect as the user (e.g., if they ask in Hinglish, respond with a Hinglish-friendly search query).
- Length: Keep it SHORT (max 10-12 words)
- Purpose: Focus on key semantic entities and topics.
- DO NOT explain or add meta-commentary.
- Return ONLY the rewritten query.
`
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
