import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  const PORT = process.env.PORT || 3000;

  // 1. Start the express server IMMEDIATELY
  // This tells Render the app is healthy and stops the "Loading" screen
  app.listen(PORT, () => {
    console.log(`🚀 [Server] Running on port ${PORT}`);
    console.log(`📡 [Health] http://localhost:${PORT}/api/health`);
    
    // 2. Connect to Database in the background
    connectDB()
      .then(() => {
        // 3. Start background worker only after DB is ready
        return import("./workers/itemWorker.js");
      })
      .then(() => {
        console.log("✅ [Worker] Background processor loaded");
      })
      .catch((err) => {
        console.error("⚠️ [Startup Warning] Partial initialization failed:", err.message);
      });
  });
};

startServer();



