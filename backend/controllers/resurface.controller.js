import * as resurfaceService from "../services/resurface.service.js";

/**
 * Controller to handle memory resurfacing request
 */
export async function getResurfaceItems(req, res) {
  try {
    const userId = req.user;
    
    const items = await resurfaceService.getResurfaceItems(userId);
    
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
