import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const generateAITags = async (title, content, keywords = []) => {

  const prompt = `
Generate 5 topic tags for this article.

Title:
${title}

Content:
${content.slice(0,400)}

Keywords:
${keywords.join(", ")}

Rules:
- return ONLY comma separated tags
- no explanation
- lowercase
- max 2 words each
`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  const result = response?.choices?.[0]?.message?.content || "";

  return result
    .replace(/\n/g, "")
    .split(",")
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .slice(0,5);
};