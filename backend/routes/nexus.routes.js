import express from "express";
import { chatWithNexus } from "../controllers/nexus.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Nexus AI RAG Chat
router.post("/chat", protect, chatWithNexus);

export default router;
