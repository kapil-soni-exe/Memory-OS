/**
 * Build a structured context string from retrieved memories for the LLM
 * @param {Array} memories - Array of memory objects from search
 * @returns {string} - Formatted context string
 */
export const buildContext = (memories) => {
  if (!memories || memories.length === 0) return "No relevant memories found.";

  return memories.map((m, idx) => {
    // Priority: summary + first 3 significant lines of text
    const summary = m.summary || "";
    const content = m.cleanedText || m.content || "";
    const primaryLines = content
      .split("\n")
      .filter(l => l.trim().length > 10)
      .slice(0, 3)
      .join(" ");
    
    const synthesized = `${summary} ${primaryLines}`.trim();

    return `
[Memory ${idx + 1}]
Title: ${m.title}
Summary: ${m.summary || content.slice(0, 200)}
Content Extract: ${content.slice(0, 1500)}
`;
  }).join("\n---\n");
};
