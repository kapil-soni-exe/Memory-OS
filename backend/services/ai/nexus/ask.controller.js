import { detectIntentSmart, isGeneric } from "./intent.service.js";
import { addMessage, handleGeneralChat } from "./chat.service.js";
import { rewriteQuery } from "./rewrite.service.js";
import { queryNexus } from "./rag.service.js";
import { buildContext } from "./contextBuilder.js";
import { buildPrompt } from "./prompt.service.js";
import { generateAnswer } from "./llm.service.js";
import { rerankMemories } from "./rerank.service.js";

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

import { getCachedResponse, setCachedResponse } from "./cache.service.js";

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

    // 1. Check Cache first (Optimization Phase 1)
    const cached = await getCachedResponse(userId, query);
    if (cached) {
      console.log(`[Cache] HIT for user ${userId}: ${query.slice(0, 20)}...`);
      return res.status(200).json({
        ...cached,
        _cached: true
      });
    }
    console.log(`[Cache] MISS for user ${userId}: ${query.slice(0, 20)}...`);

    // 2. Intent Detection (Smart)
    const intent = await detectIntentSmart(query);

    // 3. Routing
    if (intent === "greeting" || intent === "casual") {
      const chatResponse = await handleGeneralChat(query);
      const responseJSON = { answer: chatResponse, sources: [] };

      // Save to cache even for casual chat
      await setCachedResponse(userId, query, responseJSON);

      return res.status(200).json(responseJSON);
    }

    // 4. RAG Path (For Questions)
    // 4a. Adaptive Retrieval: Rewrite vague queries
    const finalQuery = isGeneric(query) ? await rewriteQuery(query) : query;

    // 4b. Perform Search and Ranking
    const { topMemories: initialMemories, isFallback } = await queryNexus(userId, finalQuery);

    // 4c. Phase 3: AI Reranking (Context Filtering)
    const topMemories = await rerankMemories(query, initialMemories);

    // 4d. Build context and prompt
    const contextText = topMemories.length > 0 ? buildContext(topMemories) : "";
    const finalPrompt = buildPrompt(query, contextText);

    // 4e. Generate final grounded answer
    const answer = await generateAnswer(finalPrompt);

    // 4f. Extract actually used citations
    const usedIndexes = extractUsedMemories(answer);
    const usedSources = topMemories.filter((m, idx) => usedIndexes.includes(idx + 1));

    // 5. Cleanup and Response
    addMessage("assistant", answer);

    const responseJSON = {
      answer,
      isFallback,
      sources: usedSources.length > 0 ? usedSources.map(m => ({
        _id: m._id,
        title: m.title,
        type: m.type
      })) : topMemories.map(m => ({
        _id: m._id,
        title: m.title,
        type: m.type
      }))
    };

    // 6. Save to Cache for future reuse
    await setCachedResponse(userId, query, responseJSON);

    return res.status(200).json(responseJSON);

  } catch (error) {
    console.error("Nexus Chat Controller Error:", error.message);
    return res.status(500).json({
      message: "Something went wrong in the Nexus.",
      error: error.message
    });
  }
};
