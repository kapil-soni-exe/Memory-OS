import { Redis } from "@upstash/redis";
import { queryNexus } from "../services/ai/nexus/rag.service.js";
import { generateAnswer } from "../services/ai/nexus/llm.service.js";
import { rewriteQuery } from "../services/ai/nexus/rewrite.service.js";
import { rerankMemories } from "../services/ai/nexus/rerank.service.js";
import dotenv from "dotenv";

dotenv.config();

const localCache = new Map(); // Global in-memory fallback
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

/**
 * Step 1: Pre-fetch relevant memories for user selection
 */
export const preFetchSources = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = typeof req.user === 'object' ? req.user.id : req.user;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // 1. Always Rewrite first to capture true Search Intent
    const searchQuery = await rewriteQuery(prompt);

    // 2. Check Cache based on INTENT (Search Query)
    const cacheKey = `composer:prefetch:${userId}:${searchQuery.trim().toLowerCase()}`;
    let cachedResults = null;
    
    try {
      if (redis) cachedResults = await redis.get(cacheKey);
      else cachedResults = localCache.get(cacheKey);
    } catch (e) { console.warn("Cache Lookup Error:", e); }

    if (cachedResults) {
      return res.status(200).json({ sources: cachedResults, cached: true, intent: searchQuery });
    }

    // 3. If not cached, proceed with Nexus Retrieval
    // QUALITY FOCUS: We use LLM-reranking even in pre-fetch to ensure maximum relevance. 
    // Accuracy is prioritized over raw speed here.
    const { topMemories: initialMemories } = await queryNexus(userId, searchQuery);
    
    // We rerank a smaller elite set (top 5) to keep latency manageable (~4-5s) while staying accurate
    const topMemories = await rerankMemories(prompt, initialMemories.slice(0, 5));

    const sources = topMemories.map((m, i) => ({
      id: i + 1,
      itemId: m._id,
      title: m.title,
      text: m.content || m.summary,
      source: m.type || "memory"
    }));

    // 4. Store in Cache for 10 minutes
    try {
      if (redis) await redis.set(cacheKey, sources, { ex: 600 });
      else localCache.set(cacheKey, sources);
    } catch (e) { console.warn("Cache Storage Error:", e); }

    res.status(200).json({ sources, cached: false, intent: searchQuery });
  } catch (error) {
    console.error("Pre-fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch sources" });
  }
};

/**
 * Step 2: Synthesize content from SELECTED sources
 */
export const synthesizeFromMemory = async (req, res) => {
  try {
    const { prompt, format, selectedIds, previousContent, instructions } = req.body;
    const userId = typeof req.user === 'object' ? req.user.id : req.user;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let topMemories = [];
    if (selectedIds && selectedIds.length > 0) {
      const Item = (await import("../models/item.model.js")).default;
      const unorderedMemories = await Item.find({ _id: { $in: selectedIds }, user: userId }).lean();
      
      // Preserve User's Selection Order
      topMemories = selectedIds.map(id => unorderedMemories.find(m => m._id.toString() === id)).filter(Boolean);
    } else {
      const searchQuery = await rewriteQuery(prompt);
      const { topMemories: initialMemories } = await queryNexus(userId, searchQuery);
      topMemories = await rerankMemories(prompt, initialMemories);
    }

    if (!topMemories || topMemories.length === 0) {
      return res.status(200).json({ 
        content: "I couldn't find any relevant memories in your Second Brain to synthesize this draft. Try saving some more notes first!",
        sources: [] 
      });
    }

    // 2. Identify if this is a stylistic refinement (token saver)
    const isPureRefinement = !!previousContent && 
                             (instructions?.toLowerCase().includes("improve") || 
                              instructions?.toLowerCase().includes("shorten") ||
                              instructions?.toLowerCase().includes("simpler"));

    // 3. Define the system instructions based on the requested format
    let formatInstruction = "";
    switch (format) {
      case 'LinkedIn':
        formatInstruction = `Create a high-impact LinkedIn post. 
        - Start with a compelling hook. 
        - Use ample whitespace and line breaks. 
        - Use 2-3 relevant emojis. 
        - End with 2-3 hashtags. 
        - Tone: Professional but human/accessible.`;
        break;
      case 'Blog':
        formatInstruction = `Create a professional Deep-Dive Blog post. 
        - Include an H1 Title, H2 Subheadings, and H3 subsections where appropriate.
        - Start with a strong introduction and end with a 'Key Takeaways' summary.
        - Tone: Informative, authoritative, and engaging.`;
        break;
      case 'Ideas':
        formatInstruction = `Provide a brainstormed list of 5 creative ideas or strategic angles.
        - Use a bolded title for each idea followed by a one-sentence summary and a brief execution point.
        - Number the ideas for clarity.
        - Tone: Innovative and concise.`;
        break;
      case 'Notes':
      default:
        formatInstruction = `Create perfectly structured Study/Research Notes. 
        - Use a clear hierarchy with Bold Headings.
        - Include 'Executive Summary' at the top and 'Definitions' or 'Core Concepts' below.
        - Use hierarchical bullet points for dense information.
        - Tone: Precise, analytical, and organized.`;
        break;
    }

    // 3. Construct Secure Message Structure
    const systemPrompt = `You are the 'Senior Knowledge Architect' for MemoryOS Creation Studio.
YOUR MISSION: Transform fragmented memories into a cohesive, world-class narrative.

CORE DIRECTIVES:
1. NARRATIVE SYNTHESIS: Do NOT simply list sources. Blend information from all sources into a professional, logically flowing document.
2. CITATION MASTERY: Cite specific facts with [1], [2], etc. accurately. Cite distinct sources separately; do NOT use [1] for everything if other sources apply.
3. OUTPUT PURITY: Provide ONLY the synthesized content.
   - NO "References" or "Sources" section at the end.
   - NO conversational filler (e.g., "Here is your post").
   - NO bibliography tags.
4. GROUNDING: USE ONLY the provided source IDs [1], [2], etc. Do NOT hallucinate IDs that are not present in <MEMORY_SOURCES>.
5. PERSISTENCE: Maintain existing citation tags [x] from the DRAFT during refinements.
6. STRICTURE: If only one source is provided, use ONLY [1].`;

    const userMessageContent = `
${isPureRefinement ? "REFINE & POLISH THIS DRAFT:" : "CREATE A NEW SYNTHESIS FROM THESE MEMORIES:"}

${previousContent ? `
<CURRENT_DRAFT>
${previousContent}
</CURRENT_DRAFT>
REFINEMENT INSTRUCTION: ${instructions || "Improve the structure and clarity."}
` : `
GOAL: ${prompt}
`}

ESTABLISHED FORMAT: ${formatInstruction}

${isPureRefinement ? `
NOTE: Grounding tags [1, 2, ...] are in the draft. Preserve them accurately.` : `
<MEMORY_SOURCES>
${topMemories.map((m, i) => `[ID ${i + 1}]: ${m.title}\nCONTENT: ${m.content || m.summary}`).join("\n\n---\n\n")}
</MEMORY_SOURCES>
`}

FINAL COMMAND: Synthesize a high-quality, professional piece. 
CRITICAL: ONLY use citation IDs that exist in the <MEMORY_SOURCES> block above. If you only see [ID 1], you must only use [1]. Do NOT include a references list.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessageContent }
    ];

    // 4. Model Tiering
    const modelToUse = isPureRefinement ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
    const synthesizedContent = await generateAnswer(messages, modelToUse, 0.5);

    if (synthesizedContent.startsWith("RATE_LIMIT_EXCEEDED")) {
      return res.status(429).json({ 
        error: "Nexus is cooling down. Please wait 10s.",
        retryAfter: 15
      });
    }

    // 5. Hardened Citation Extraction
    const citationRegex = /\[(\d+)\]/g;
    const matches = [...synthesizedContent.matchAll(citationRegex)];
    
    // Map memories for easy lookup
    const allSources = topMemories.map((m, i) => ({
      id: i + 1,
      itemId: m._id,
      title: m.title,
      text: m.content || m.summary,
      source: m.type || "memory"
    }));

    // Identify which sources are actually referenced
    const usedIndexes = [...new Set(matches.map(m => parseInt(m[1], 10)))];
    const usedSources = allSources.filter(s => usedIndexes.includes(s.id));

    // Fallback logic: High-precision fallback
    // 1. If AI cited, we trust its citations.
    // 2. If AI failed to cite but we're in SYNTHESIS: Return only the Top 3 (most relevant).
    // 3. If AI failed to cite in REFINEMENT: Return the original list (assuming it kept the info).
    let finalSources = usedSources;
    if (usedSources.length === 0) {
      finalSources = isPureRefinement ? allSources : allSources.slice(0, 3);
    }

    res.status(200).json({
      content: synthesizedContent,
      sources: finalSources
    });

  } catch (error) {
    console.error("Second Draft Synthesis Error:", error);
    res.status(500).json({ error: "Failed to synthesize draft from memory" });
  }
};
