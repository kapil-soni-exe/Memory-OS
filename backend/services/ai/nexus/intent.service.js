import { generateAnswer } from "./llm.service.js";

/**
 * Check if a query is generic/short (less than 3 words)
 * @param {string} query 
 * @returns {boolean}
 */
export const isGeneric = (query) => {
  return query.trim().split(/\s+/).filter(Boolean).length <= 3;
};

/**
 * Detect user intent using AI for complex queries
 * @param {string} query - The user's input
 * @returns {Promise<"greeting" | "casual" | "question">}
 */
export const detectIntentSmart = async (query) => {
  const normalized = query.toLowerCase().trim();
  
  // Step 1: Obvious string matching
  const obviousGreetings = ["hi", "hello", "hey"];
  const obviousCasuals = ["ok", "thanks"];

  if (obviousGreetings.includes(normalized)) return "greeting";
  if (obviousCasuals.includes(normalized)) return "casual";

  // Step 2: AI Classification for all other queries
  const prompt = `Classify this user query into strictly ONE word: "greeting", "casual", or "question".

Rules:
- "question": Any query seeking information, asking about memories, or mentioning a specific topic/name (even if short).
- "casual": Small talk, "how are you", "ok", "thanks", or vague feedback.
- "greeting": Pure greetings like "hi", "hello".

Query: "${query}"

Output ONLY ONE WORD.
`;

  try {
    const response = await generateAnswer(prompt, "llama-3.1-8b-instant", 0);
    const intent = response.trim().toLowerCase();
    
    if (intent.includes("greeting")) return "greeting";
    if (intent.includes("casual")) return "casual";
    return "question"; // Default fallback
  } catch (error) {
    console.error("Smart Intent Detection Error:", error.message);
    // Fallback to old regex if LLM fails
    const greetingRegex = /^(hi|hello|hey|kaise ho|kya haal hai)\b/i;
    const casualRegex = /^(ok|thanks|nice|good|hmm)\b/i;
    
    if (greetingRegex.test(normalized)) return "greeting";
    if (casualRegex.test(normalized)) return "casual";
    return "question";
  }
};

/**
 * Detect user intent (greeting, casual, or question)
 * @param {string} query - The user's input
 * @returns {"greeting" | "casual" | "question"}
 */
export const detectIntent = (query) => {
  const normalized = query.toLowerCase().trim();
  const greetingRegex = /^(hi|hello|hey|kaise ho|kya haal hai)\b/i;
  const casualRegex = /^(ok|thanks|nice|good|hmm)\b/i;
  
  if (greetingRegex.test(normalized)) return "greeting";
  if (casualRegex.test(normalized)) return "casual";
  return "question";
};
