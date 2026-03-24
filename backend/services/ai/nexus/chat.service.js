import { generateAnswer } from "./llm.service.js";

// Simple In-Memory Chat History (Max 5 items)
let chatHistory = [];

/**
 * Add a message to the session history
 * @param {'user' | 'assistant'} role 
 * @param {string} content 
 */
export const addMessage = (role, content) => {
  chatHistory.push({ role, content });
  if (chatHistory.length > 5) {
    chatHistory.shift();
  }
};

/**
 * Get current session history
 * @returns {Array}
 */
export const getHistory = () => {
  return [...chatHistory];
};

/**
 * Handle non-RAG conversational turns (greetings, acknowledgments)
 * @param {string} query - The user input
 * @returns {Promise<string>} - Conversational response
 */
export const handleGeneralChat = async (query) => {
  try {
    const history = getHistory();
    const historyText = history.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join("\n");

    const systemPrompt = `
You are memoryOS, a super friendly and chill assistant. 

Requirements:
- NEVER explain what the user's message means
- NEVER translate or define words
- NEVER act like a teacher
- ALWAYS respond like a human friend
- Match the user's tone and language (English or Hinglish)
- Keep response short (1 line max)
- Use casual tone

Examples:
User: hi
→ Hey! kya scene hai 😄
User: hi bhai
→ kya haal hai bhai 😄
User: kaise ho
→ badiya bhai, tu bata 😄
User: ok
→ 👍
User: thanks
→ anytime bro 🤝
`.trim();

    const prompt = `${systemPrompt}\n\nChat History:\n${historyText}\n\nCurrent Input: ${query}`;
    
    return await generateAnswer(prompt, "llama-3.3-70b-versatile", 0.7);
  } catch (error) {
    console.error("General Chat Error:", error.message);
    return "I'm here, but feeling a bit quiet. What's up?";
  }
};
