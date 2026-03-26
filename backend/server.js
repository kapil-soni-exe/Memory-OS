import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import "./workers/itemWorker.js";

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    
    // 1. Await Database Connection before accepting traffic
    await connectDB();
    
    // 2. Start the express server
    app.listen(PORT, () => {
      console.log(`🚀 [Server] Running on port ${PORT}`);
      console.log(`📡 [Health] http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

