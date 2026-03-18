import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const generateAISummary = async (title, content) => {
  try {

    const prompt = `
You are an expert article summarizer.

Summarize the following article in exactly 2 concise sentences.

Title:
${title}

Content:
${content.slice(0,1500)}

Rules:
- return only the summary
- exactly 2 sentences
- simple language
- no bullet points
- no explanations
`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    return response?.choices?.[0]?.message?.content
  ?.replace(/\n/g, " ")
  ?.trim() || "";

  } catch (error) {
    console.error("AI Summary Error:", error);
    return "";
  }
};