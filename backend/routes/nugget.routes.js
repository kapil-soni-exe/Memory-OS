import express from "express"
import { getNuggetFeed } from "../controllers/nugget.controller.js"
import protect from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/feed", protect, getNuggetFeed)

export default router
