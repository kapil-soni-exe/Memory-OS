import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/user.model.js';
import { askController } from './services/ai/nexus/ask.controller.js';

async function testNexusAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test123@gmail.com' });
    
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("--- STARTING NEXUS MULTI-INTENT TEST ---");

    const testCases = [
      { label: "GREETING", query: "kaise ho" },
      { label: "CASUAL", query: "thanks bro" },
      { label: "QUESTION", query: "What are my notes about Apple?" }
    ];

    for (const test of testCases) {
      console.log(`\n🔹 Testing [${test.label}]: "${test.query}"`);
      
      const req = {
        body: { query: test.query },
        user: { id: user._id }
      };

      const res = {
        status(code) { this.statusCode = code; return this; },
        json(data) { this.data = data; return this; }
      };

      await askController(req, res);

      if (res.statusCode === 200) {
        console.log(`✅ Response: "${res.data.answer}"`);
        if (res.data.sources.length > 0) {
          console.log(`📚 Sources: ${res.data.sources.map(s => s.title).join(", ")}`);
        } else {
          console.log(`ℹ️ No sources (Non-RAG direct response)`);
        }
      } else {
        console.log(`❌ Error (${res.statusCode}):`, res.data.message, res.data.error || "");
      }
    }

    await mongoose.disconnect();
    console.log("\n--- ALL TESTS COMPLETE ---");

  } catch (error) {
    console.error("Test execution failed:", error.message);
  }
}

testNexusAPI();
