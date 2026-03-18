import { hybridSearch } from "../services/search.service.js";

// Search saved items using hybrid search (vector + keyword)
export const searchItems = async (req, res) => {
  try {

    const { q } = req.query;

    // Validate query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const query = q.trim();

    // Perform hybrid search
    const results = await hybridSearch(query, req.user);

    res.json({
      query,
      results
    });

  } catch (error) {

    console.error("Search error:", error.message);

    res.status(500).json({
      message: "Search failed"
    });
  }
};