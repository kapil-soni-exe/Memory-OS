import express from "express"
import { registerUser,loginUser,logoutUser,getMe } from "../controllers/auth.controller.js"
const router = express.Router()
import protect from "../middleware/auth.middleware.js"

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.get("/me", protect, getMe)

export default router