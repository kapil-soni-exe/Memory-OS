import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import itemRoutes from "./routes/item.routes.js"
import searchRoutes from "./routes/search.routes.js"
import topicRoutes from "./routes/topic.routes.js"
import resurfaceRoutes from "./routes/resurface.routes.js"
import nexusRoutes from "./routes/nexus.routes.js"
import nuggetRoutes from "./routes/nugget.routes.js"
import composerRoutes from "./routes/composer.routes.js"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import { authRateLimiter, globalRateLimiter } from "./middleware/rateLimit.middleware.js"
import path from "path"
import { fileURLToPath } from "url"
import errorMiddleware from "./middleware/error.middleware.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Security Headers with permissive CSP for extension compatibility
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://memory-os.onrender.com", "https://*.vercel.app"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      upgradeInsecureRequests: [],
    },
  },
}))
app.use(compression())

// Professional Request Logging
// Professional Request Logging (Only in dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Global API Rate Limiting
app.use(globalRateLimiter)

app.use(express.json())
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  FRONTEND_URL,
  FRONTEND_URL.replace(/\/$/, ""),       // without trailing slash
  FRONTEND_URL.replace(/\/$/, "") + "/", // with trailing slash
  "http://localhost:5173",               // always allow local dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}))
app.use(cookieParser())

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Specific Rate Limiting for Auth
// app.use("/api/auth", authRateLimiter)
app.use("/api/auth",authRateLimiter ,authRoutes);

// Render Heartbeat & Liveness Probe
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
});

app.use("/api/items", itemRoutes);
app.use("/api/search", searchRoutes)
app.use("/api/topics", topicRoutes)
app.use("/api/resurface", resurfaceRoutes)
app.use("/api/nexus", nexusRoutes)
app.use("/api/nuggets", nuggetRoutes)
app.use("/api/composer", composerRoutes)

// Error Handling Middleware (MUST be last)
app.use(errorMiddleware)


export default app