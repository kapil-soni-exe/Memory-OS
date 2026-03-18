import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import itemRoutes from "./routes/item.routes.js"
import searchRoutes from "./routes/search.routes.js"
import topicRoutes from "./routes/topic.routes.js"
import resurfaceRoutes from "./routes/resurface.routes.js"
import nexusRoutes from "./routes/nexus.routes.js"
import helmet from "helmet"
import morgan from "morgan"
import { authRateLimiter, globalRateLimiter } from "./middleware/rateLimit.middleware.js"
import errorMiddleware from "./middleware/error.middleware.js"
 
const app = express()

// Security Headers
app.use(helmet())

// Professional Request Logging
// Professional Request Logging (Only in dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Global API Rate Limiting
app.use(globalRateLimiter)

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))
app.use(cookieParser())

// Specific Rate Limiting for Auth
app.use("/api/auth", authRateLimiter)
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/topics", topicRoutes)
app.use("/api/resurface", resurfaceRoutes)
app.use("/api/nexus", nexusRoutes)

// Error Handling Middleware (MUST be last)
app.use(errorMiddleware)


export default app