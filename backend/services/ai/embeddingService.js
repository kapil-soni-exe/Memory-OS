import dotenv from "dotenv";
dotenv.config();

import redisConnection from "../../config/redis.js";
import crypto from 'crypto';

// Voyage AI is our Single Stable Primary Engine (1024 Dims)
const VOYAGE_KEY = process.env.VOYAGE_API_KEY;

// Cache TTL: 7 Days
const CACHE_TTL = 604800;

/**
 * Generate embedding vector using Voyage AI (Production Stability)
 * @param {string} text - Input text
 * @param {string} inputType - "query" or "document" (Voyage style)
 * @returns {Promise<Array|null>} - 1024-dimension vector
 */
export const generateEmbedding = async (text, inputType = "document") => {
  try {
    if (!text || text.trim().length === 0) return null;

    const inputText = text.trim().slice(0, 4000); // Voyage supports larger context

    // 1. Check Cache (Optional)
    let cacheKey;
    try {
      const hash = crypto.createHash('md5').update(`${inputText}:${inputType}`).digest('hex');
      cacheKey = `embedding:cache:${hash}`;
      const cached = await redisConnection.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (redisErr) {
      console.warn(`[Redis] Cache lookup skipped: ${redisErr.message}`);
    }

    // 2. Direct Voyage AI Call
    console.log(`[Voyage AI] Generating embedding for: "${inputText.slice(0, 30)}..."`);
    
    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOYAGE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: [inputText],
        model: "voyage-3",
        input_type: inputType === "search_query" ? "query" : "document"
      })
    });

    if (response.ok) {
      const data = await response.json();
      const embedding = data.data?.[0]?.embedding || null;
      
      if (embedding && embedding.length === 1024) {
        // Save to Cache (Optional)
        try {
          await redisConnection.set(cacheKey, JSON.stringify(embedding), 'EX', CACHE_TTL);
        } catch (setErr) {
          console.warn(`[Redis] Cache set skipped: ${setErr.message}`);
        }
        return embedding;
      } else {
        console.error("[Voyage AI] Dimension Mismatch or Empty Result");
      }
    } else {
      const err = await response.text();
      console.error(`[Voyage AI] API Error (${response.status}):`, err);
    }

    return null; // Triggers Resilience 2.0 (Keywords)

  } catch (error) {
    console.error("[Voyage AI] Critical Failure:", error.message);
    return null;
  }
};