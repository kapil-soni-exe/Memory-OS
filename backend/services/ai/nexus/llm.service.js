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
export const generateAnswer = async (promptOrMessages, model = "llama-3.3-70b-versatile", temperature = 0.3) => {
  try {
    let messages = [];
    
    if (Array.isArray(promptOrMessages)) {
      messages = promptOrMessages;
    } else {
      messages = [{ role: "user", content: promptOrMessages }];
    }

    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature
    });

    return response.choices?.[0]?.message?.content?.trim() || "The Nexus is silent. Please try again.";
  } catch (error) {
    if (error.status === 429) {
      return "RATE_LIMIT_EXCEEDED: The Nexus is currently throttled (Free Tier). Please wait 10-15 seconds before your next request.";
    }
    if (error.message.includes("ECONNRESET")) {
      return "CONNECTION_LOST: The connection was interrupted. Let me try once more...";
    }
    throw error;
  }
};

export default client;
