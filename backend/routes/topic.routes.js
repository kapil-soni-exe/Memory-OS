import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getAllTopics, getTopicById, deleteTopic } from "../controllers/topic.controller.js";

const router = express.Router();

router.get("/", protect, getAllTopics);
router.get("/:id", protect, getTopicById);
router.delete("/:id", protect, deleteTopic);

export default router;
