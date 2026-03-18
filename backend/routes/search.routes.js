import express from "express"
import { searchItems } from "../controllers/search.controller.js"
import protect from "../middleware/auth.middleware.js"
const router = express.Router()

router.get("/", protect, searchItems)

export default router