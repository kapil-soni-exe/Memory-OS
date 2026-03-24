import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 30000, // 30 second timeout
  maxRetries: 3    // Built-in OpenAI retry logic
});

/**
 * Generate a response using the Groq API
 * @param {string} prompt - Final formatted prompt
 * @param {string} model - Model ID (default: llama-3.3-70b-versatile)
 * @param {number} temperature - Generation temperature (default: 0.3)
 * @returns {Promise<string>}
 */
export const generateAnswer = async (prompt, model = "llama-3.3-70b-versatile", temperature = 0.3) => {
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: temperature
    });

    return response.choices?.[0]?.message?.content?.trim() || "The Nexus is silent. Please try again.";
  } catch (error) {
    console.error("Groq API Error:", error.message);
    if (error.message.includes("ECONNRESET")) {
      return "The connection to the Nexus was lost. Let me try once more...";
    }
    throw error;
  }
};

export default client;
