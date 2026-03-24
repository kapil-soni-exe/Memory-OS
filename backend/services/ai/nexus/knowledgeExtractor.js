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
 * @param {string} content - The raw text content (first 2000 chars).
 * @returns {Promise<Object>} - { summary, tags, entities, relationships }
 */
export const extractKnowledge = async (title, content) => {
  try {
    const contentLength = content?.length || 0;
    
    // 1. Content Throttling: Skip API for tiny notes
    if (contentLength < 50) {
      return {
        summary: `A short note about ${title || 'this topic'}.`,
        tags: ["quick-note"],
        entities: [],
        relationships: []
      };
    }

    // 2. Conditional Extraction: Only extract complex data for longer content
    const isDetailed = contentLength > 500;
    const model = isDetailed ? "llama-3.1-8b-instant" : "llama-3.1-8b-instant"; // Using 8B for both for now to save costs, can switch to 70B for detailed if desired.

    const prompt = `
You are an expert knowledge extraction system.

TITLE: ${title}
CONTENT: ${content}

Extract and return ONLY valid JSON:
{
  "summary": "A concise 3-4 sentence summary of the core idea",
  "tags": ["3-5 high-level topics"]${isDetailed ? `,
  "entities": ["key names, organizations, concepts"],
  "relationships": [{ "source": "A", "relation": "connection", "target": "B" }]` : ""}
}

RULES:
- Do not add extra text
- Output ONLY valid JSON
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
      relationships: []
    };
  }
};
