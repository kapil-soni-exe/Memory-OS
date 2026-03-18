import { extractArticle } from "./extractors/articleExtractor.js";
import { extractYoutube } from "./extractors/youtubeExtractor.js";
import { extractTweet } from "./extractors/tweetExtractor.js";
import { extractPDF } from "./extractors/pdfExtractor.js";
import { extractImage } from "./extractors/imageExtractor.js";


// Map content type → extractor function
const extractorMap = {
  video: extractYoutube,
  tweet: extractTweet,
  pdf: extractPDF,
  image: extractImage,
  article: extractArticle,
};


// Route URL to the correct extractor
export const extractContentFromUrl = async (url, type) => {
  try {

    // Select extractor based on type
    const extractor = extractorMap[type] || extractorMap.article;

    return await extractor(url);

  } catch (error) {

    console.error("Extractor router error:", error.message);

    return null;
  }
};