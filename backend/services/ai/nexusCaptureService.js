import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Classifies raw text into a specific MemoryOS type and extracts a title.
 */
export const classifyNexusCapture = async (content) => {
  try {
    const prompt = `
You are a part of MemoryOS, a high-end personal knowledge galaxy.
Analyze the following raw text captured by the user and classify it into one of the following types:
- "thought": A general idea, reflection, or fleeting note.
- "book": A mention of a book, a reading goal, or a book summary.
- "task": An actionable item, a goal, or something to do.
- "quote": A famous saying or a specific line from someone.
- "code": A snippet of programming code or a technical instruction.
- "note": If none of the above fit perfectly.

Also, generate a concise, premium title for this entry.

Content:
"${content.slice(0, 1000)}"

Rules:
- Return ONLY a JSON object.
- Format: { "type": "type_here", "title": "title_here" }
- No explanations.
`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response?.choices?.[0]?.message?.content || "{}");
    
    return {
      type: result.type || "thought",
      title: result.title || "Untitled Thought",
      content: content,
      source: "manual"
    };

  } catch (error) {
    console.error("Nexus Capture Classification Error:", error.message);
    return {
      type: "thought",
      title: "New Thought",
      content: content,
      source: "manual"
    };
  }
};
