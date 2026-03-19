import express from "express"
import protect from "../middleware/auth.middleware.js"

import { saveItem, getAllItems, getItem, deleteItem, updateItem } from "../controllers/item.controller.js"
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/save", protect, upload.single("file"), saveItem);
router.get("/", protect, getAllItems);
router.get("/:id", protect, getItem);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

export default router;
