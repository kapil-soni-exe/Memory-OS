import express from "express";
import * as resurfaceController from "../controllers/resurface.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Get resurfaced memories (On This Day / Random)
router.get("/", protect, resurfaceController.getResurfaceItems);

// Record interactions (views, likes, skips) for scoring engine
router.post("/:itemId/interact", protect, resurfaceController.interactItem);

export default router;
