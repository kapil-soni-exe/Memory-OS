import OpenAI from "openai";
import qdrant from "../../config/qdrant.js";
import { generateEmbedding } from "./embeddingService.js";
import Item from "../../models/item.model.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Nexus RAG Chat Service
 * 1. Embed query
 * 2. Search Qdrant for relevant memories
 * 3. Fetch full context from MongoDB
 * 4. Generate AI response with Citations
 */
export const queryNexus = async (userId, query) => {
  try {
    const isGreeting = /^(hi|hello|hey|hola|yo|howdy|sup|greetings)(\s|$)/i.test(query.trim());

    // 1. Generate Embedding for the query (using search_query for better accuracy)
    const queryVector = await generateEmbedding(query);
    
    // 2. Search Qdrant for Top 5 relevant memories
    let memories = [];
    if (queryVector) {
      const searchResults = await qdrant.search("items_vectors", {
        vector: queryVector,
        limit: 5,
        filter: {
          must: [{ key: "user", match: { value: userId.toString() } }],
        },
      });

      const itemIds = searchResults.map(r => r.payload.itemId);
      memories = await Item.find({ _id: { $in: itemIds } })
        .select("title summary content tags type createdAt");
    }

    // 3. Construct AI Prompt
    const contextText = memories.map((m, idx) => `
[Memory: ${m.title}]
ID: ${m._id}
Summary: ${m.summary || m.content.slice(0, 200)}
`).join("\n---\n");

    const systemPrompt = `
You are "MemoryOS Buddy", the user's cool digital companion for their MemoryOS.

YOUR VIBE:
- Casual, friendly, and helpful. Like a buddy who's also a genius at remembering things.
- Talk in simple, natural English. No robotic jargon.
- If the user just says "hi" or "hello", be a sport and reply with a warm, casual greeting and maybe a small "how can I help?"

YOUR ROLE:
- You help the user find what they've saved in their Knowledge Galaxy.
- If you find relevant memories, talk about them naturally. 
- If you don't find anything specific, just say so in a chill way and ask if they want to talk about something else.
- **IMPORTANT**: If the user is just greeting you, prioratize being a friendly buddy over listing memories.

CONTEXT FROM USER'S SAVED ITEMS:
${contextText || "No saved items match this query yet."}

ADDITIONAL GUIDELINES:
- Use line breaks for readability.
- When referring to a specific item, you can mention its title.
- Keep responses short and snappy.
`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.8,
    });

    const answer = response.choices?.[0]?.message?.content || "The Nexus is silent. Please try again.";

    return {
      answer,
      sources: memories.map(m => ({
        id: m._id,
        title: m.title,
        type: m.type
      }))
    };

  } catch (error) {
    console.error("Nexus Query Error:", error.message);
    throw error;
  }
};
