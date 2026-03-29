import * as resurfaceService from "../services/resurface.service.js";

/**
 * Controller to handle memory resurfacing request
 */
export async function getResurfaceItems(req, res) {
  try {
    const userId = req.user;
    const { contextTags } = req.query;

    // Convert comma-separated string to array if exists
    const tags = contextTags ? contextTags.split(',') : [];

    const items = await resurfaceService.getResurfaceItems(userId, { contextTags: tags });

    return res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    console.error("Resurface controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resurface memories",
      error: error.message
    });
  }
}

/**
 * Controller to record user interaction with an item
 */
export async function interactItem(req, res) {
  try {
    const { itemId } = req.params;
    const { action } = req.body; // "view", "like", "skip"

    await resurfaceService.logInteraction(itemId, action);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Interact controller error:", error);
    return res.status(500).json({ success: false });
  }
}
