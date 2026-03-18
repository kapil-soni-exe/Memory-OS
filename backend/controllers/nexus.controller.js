import { queryNexus } from "../services/ai/nexusChat.service.js";

/**
 * Controller to handle Nexus AI Chat requests
 */
export const chatWithNexus = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user; // String ID from protect middleware

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    const result = await queryNexus(userId, query);

    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources
    });

  } catch (error) {
    console.error("Nexus Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "The Nexus is temporarily offline",
      error: error.message
    });
  }
};
