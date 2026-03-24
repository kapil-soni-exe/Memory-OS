import { detectIntentSmart, isGeneric } from "./intent.service.js";
import { addMessage, handleGeneralChat } from "./chat.service.js";
import { rewriteQuery } from "./rewrite.service.js";
import { queryNexus } from "./rag.service.js";
import { buildContext } from "./contextBuilder.js";
import { buildPrompt } from "./prompt.service.js";
import { generateAnswer } from "./llm.service.js";

/**
 * Extract unique [Memory X] indexes from the answer
 * @param {string} answer 
 * @returns {number[]} Array of 1-based memory indexes
 */
const extractUsedMemories = (answer) => {
  const regex = /\[Memory\s+(\d+)\]/gi;
  const matches = [...answer.matchAll(regex)];
  return [...new Set(matches.map(m => parseInt(m[1], 10)))];
};

/**
 * Nexus AI Chat Controller (Modular Entry Point)
 */
export const askController = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const userId = typeof req.user === 'object' ? req.user.id : req.user;

    // 1. Store user query in history
    addMessage("user", query);

    // 2. Intent Detection (Smart)
    const intent = await detectIntentSmart(query);

    // 3. Routing
    if (intent === "greeting" || intent === "casual") {
      // General Conversational Path
      const chatResponse = await handleGeneralChat(query);
      addMessage("assistant", chatResponse);
      
      return res.status(200).json({
        answer: chatResponse,
        sources: []
      });
    }

    // 4. RAG Path (For Questions)
    // 4a. Adaptive Retrieval: Rewrite vague queries
    const finalQuery = isGeneric(query) ? await rewriteQuery(query) : query;

    // 4b. Perform Search and Ranking
    const { topMemories } = await queryNexus(userId, finalQuery);

    // 4c. Handle empty results
    if (topMemories.length === 0) {
      const fallback = "I couldn't find anything relevant in your saved items.";
      addMessage("assistant", fallback);
      return res.status(200).json({
        answer: fallback,
        sources: []
      });
    }

    // 4d. Build context and prompt
    const contextText = buildContext(topMemories);
    const finalPrompt = buildPrompt(query, contextText);

    // 4e. Generate final grounded answer
    const answer = await generateAnswer(finalPrompt);

    // 4f. Extract actually used citations
    const usedIndexes = extractUsedMemories(answer);
    const usedSources = topMemories.filter((m, idx) => usedIndexes.includes(idx + 1));

    // 5. Cleanup and Response
    addMessage("assistant", answer);

    return res.status(200).json({
      answer,
      sources: usedSources.length > 0 ? usedSources.map(m => ({
        _id: m._id,
        title: m.title,
        type: m.type
      })) : topMemories.map(m => ({
        _id: m._id,
        title: m.title,
        type: m.type
      }))
    });

  } catch (error) {
    console.error("Nexus Chat Controller Error:", error.message);
    return res.status(500).json({ 
      message: "Something went wrong in the Nexus.",
      error: error.message 
    });
  }
};
