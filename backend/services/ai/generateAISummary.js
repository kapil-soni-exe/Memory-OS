import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const generateAISummary = async (title, content) => {
  try {

    const prompt = `
You are an expert knowledge architect.

Generate a meaningful, high-density executive summary of the following content. 
Focus on the core 'Why' and 'How' rather than just a shallow recap. 

Title:
${title}

Content:
${content.slice(0, 10000)}

Rules:
- return only the summary text
- length: 3 to 6 sentences
- professional but readable tone
- no fluff or meta-talk
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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