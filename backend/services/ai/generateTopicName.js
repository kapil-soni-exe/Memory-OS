import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export default async function generateTopicName(items = []) {
  try {
    if (!items || !items.length) return "General";

    // Extract summaries to give context to the AI
    const summaries = items
      .map(item => item.summary || item.title || "")
      .filter(Boolean);

    // If no text context exists, fallback to frequency logic or General
    if (summaries.length === 0) return "General";

    const prompt = `
You are an expert content organizer and taxonomist.

Based on the summaries of the following related memories, generate a single, highly descriptive, and concise topic title that unifies them.

Memory Summaries:
${summaries.slice(0, 10).map((s, i) => `[${i + 1}] ${s}`).join("\n")}

Rules:
- 2 to 4 words maximum
- Capitalize the title (e.g., "Web Automation Scripts")
- Return ONLY the title, no quotes, no explanations.
`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const topicTitle = response?.choices?.[0]?.message?.content
      ?.replace(/\n/g, " ")
      ?.replace(/["']/g, "")
      ?.trim();

    return topicTitle || "General";

  } catch (error) {
    console.error("Topic AI generation error:", error.message);
    
    // Fallback: Just return the first tag found if AI fails
    for (const item of items) {
      if (item.tags && item.tags.length > 0) {
        return item.tags[0].charAt(0).toUpperCase() + item.tags[0].slice(1);
      }
    }
    
    return "General";
  }
}