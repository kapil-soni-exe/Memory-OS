import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { queryNexus } from './services/ai/nexusChat.service.js';
import { User } from './models/user.model.js';

async function testNexusRanking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test123@gmail.com' });
    
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("--- Testing Nexus Ranking ---");
    const result = await queryNexus(user._id, "Tell me about tech trends");
    
    console.log("\nAI Answer:");
    console.log(result.answer);

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

testNexusRanking();
