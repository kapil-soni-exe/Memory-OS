import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from the backend root regardless of CWD
dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Extracts structured knowledge from raw content using LLM.
 * @param {string} title - The title of the content.
 * @param {string} content - The raw text content.
 * @param {Object} context - Optional context like type, metadata, author.
 * @returns {Promise<Object>} - { summary, tags, entities, relationships }
 */
export const extractKnowledge = async (title, content, context = {}) => {
  try {
    const contentLength = content?.length || 0;
    const { type, author, metadata } = context;
    
    // 1. Content Throttling: Skip API for tiny notes
    if (contentLength < 50 && type !== 'image') {
      return {
        summary: `A short note about ${title || 'this topic'}.`,
        tags: ["quick-note"],
        entities: [],
        relationships: [],
        nuggets: [{ text: `Saved a quick note: ${title || 'Empty'}`, category: "Quick Note" }]
      };
    }

    // 2. Conditional Extraction: Only extract complex data for longer content
    const isDetailed = contentLength > 500;
    const model = "llama-3.3-70b-versatile";

    const contextStr = `
TYPE: ${type || 'unknown'}
AUTHOR: ${author || 'unknown'}
METADATA: ${metadata ? JSON.stringify(metadata) : 'none'}
`.trim();

    const prompt = `
You are an expert knowledge architect and information synthesizer.

${contextStr}
TITLE: ${title}
CONTENT: ${content}

GOAL: Extract a high-value, meaningful "Executive Summary" and structured insights from this content.

RULES:
1. SUMMARY: Write a sophisticated 3-6 sentence executive summary. Do not just recap; highlight the core argument, the most unique insight, and why this is valuable.
2. NUGGETS: Extract 3-7 "Knowledge Nuggets". Each nugget must be a punchy, stand-alone insight (max 180 chars).
3. If the CONTENT contains timestamps like [m:ss], use them to determine the "startTime" (in total seconds) for each nugget.
4. Extract and return ONLY valid JSON:
{
  "summary": "The structured executive summary text",
  "tags": ["3-5 precise, hierarchical tags"],
  "nuggets": [
    { 
      "text": "The insight text...", 
      "category": "Insight|Action|Fact",
      "startTime": 45 
    }
  ]${isDetailed ? `,
  "entities": ["key names, organizations, concepts"],
  "relationships": [{ "source": "A", "relation": "connection", "target": "B" }]` : ""}
}
`.trim();

    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const resultText = response.choices?.[0]?.message?.content || "{}";
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Knowledge Extraction Error:", error.message);
    return {
      summary: "",
      tags: [],
      entities: [],
      relationships: [],
      nuggets: []
    };
  }
};
