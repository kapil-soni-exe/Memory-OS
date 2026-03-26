import redisConnection from "../../../config/redis.js";
import crypto from 'crypto';

/**
 * AI Response Cache Service
 * Stores LLM answers and sources for a specific user query to reduce latency and cost.
 */

// TTL: 24 hours (86400 seconds)
const CACHE_TTL = 86400;

/**
 * Generate a deterministic key based on the user and query
 */
const generateKey = (userId, query) => {
    const hash = crypto.createHash('md5').update(query.trim().toLowerCase()).digest('hex');
    return `nexus:cache:${userId}:${hash}`;
};

/**
 * Get cached response
 */
export const getCachedResponse = async (userId, query) => {
    try {
        const key = generateKey(userId, query);
        const cached = await redisConnection.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch (err) {
        console.error("[Cache] Get error:", err.message);
        return null;
    }
};

/**
 * Save response to cache
 */
export const setCachedResponse = async (userId, query, responseData) => {
    try {
        const key = generateKey(userId, query);
        await redisConnection.set(
            key, 
            JSON.stringify(responseData), 
            'EX', 
            CACHE_TTL
        );
    } catch (err) {
        console.error("[Cache] Set error:", err.message);
    }
};
