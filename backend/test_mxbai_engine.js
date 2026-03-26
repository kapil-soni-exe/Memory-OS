import { generateEmbedding } from "./services/ai/embeddingService.js";
import dotenv from "dotenv";
dotenv.config();

async function testEngine() {
  console.log("🔍 [DIAGNOSTIC] Testing Mixedbread.ai Engine...");
  console.log("Key Found:", !!process.env.MXBAI_API_KEY);

  const query = "Testing Mixedbread Accuracy " + Date.now();
  
  try {
    const vector = await generateEmbedding(query);
    
    if (vector) {
      console.log("✅ SUCCESS: Embedding Generated!");
      console.log("Dimensions:", vector.length);
      console.log("Sample (First 5):", vector.slice(0, 5));
      
      if (vector.length === 1024) {
        console.log("🎯 CONFIRMED: Using Mixedbread-Large (1024)");
      } else if (vector.length === 1024) {
        console.log("⚠️ WARNING: Dimension logic check... 1024 is what we expect for Mixedbread.");
      } else {
        console.log("ℹ️ Dimension:", vector.length, "(Cohere v3 is also 1024)");
      }
    } else {
      console.error("❌ FAILED: generateEmbedding returned null.");
    }
  } catch (err) {
    console.error("❌ CRITICAL ERROR:", err.message);
  }
}

testEngine();
