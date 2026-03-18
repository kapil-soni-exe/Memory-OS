import express from "express";
import * as resurfaceController from "../controllers/resurface.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Get resurfaced memories (On This Day / Random)
router.get("/", protect, resurfaceController.getResurfaceItems);

export default router;
