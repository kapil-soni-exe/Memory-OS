import apiClient from "../../../services/apiClient.js";

/**
 * Step 1: Pre-fetch relevant memories for user selection
 * @param {string} prompt - The user's prompt
 */
export const preFetchSources = async (prompt) => {
  const response = await apiClient.post("/composer/pre-fetch", { prompt });
  return response.data;
};

/**
 * Step 2: Synthesize content from SELECTED sources
 * @param {Object} data - Synthesis options (prompt, format, selectedIds, previousContent, instructions)
 */
export const synthesizeContent = async (data) => {
  const response = await apiClient.post("/composer/synthesize", data);
  return response.data;
};
