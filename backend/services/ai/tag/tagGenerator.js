import { generateAITags } from "./aiTagService.js";
import { extractKeywords } from "./keywordExtractor.js";

export const generateTagsForContent = async (title, content) => {
    const keywords = extractKeywords(content);
    const tags = await generateAITags(title, content, keywords);
    return tags;
}