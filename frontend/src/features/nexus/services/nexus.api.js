import apiClient from "../../../services/apiClient";

/**
 * Chat with the Nexus AI
 * @param {string} query - The user's question
 * @returns {Promise<Object>} - The AI answer and sources
 */
export const chatWithNexus = async (query) => {
  const response = await apiClient.post('/nexus/ask', { query });
  return response.data;
};
