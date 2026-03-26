import Item from "../models/item.model.js";

/**
 * Aggregates nuggets from all items for the user and returns them as a feed.
 * Logic:
 * 1. Find all items with nuggets for the user.
 * 2. Flatten nuggets into a single list.
 * 3. Add item metadata (title, id) to each nugget for context.
 * 4. Shuffle/Sort based on recency or randomized for discovery.
 */
export const getNuggetFeed = async (req, res) => {
  try {
    const userId = req.user;

    // Fetch items that have nuggets
    const items = await Item.find({
      user: userId,
      "nuggets.0": { $exists: true }
    })
    .select("title nuggets createdAt type image url")
    .sort({ updatedAt: -1 })
    .lean();

    // Grouping is already implicit in the 'items' structure
    // We just need to simplify the response for the "Stories" UI
    const stories = items.map(item => ({
      itemId: item._id,
      title: item.title,
      type: item.type,
      image: item.image,
      url: item.url,
      nuggets: item.nuggets,
      lastUpdated: item.updatedAt
    }));

    res.json({
      success: true,
      count: stories.length,
      stories: stories.slice(0, 20) // Top 20 items with stories
    });

  } catch (error) {
    console.error("Error fetching nugget stories:", error.message);
    res.status(500).json({
      message: "Failed to fetch memory stories"
    });
  }
};
