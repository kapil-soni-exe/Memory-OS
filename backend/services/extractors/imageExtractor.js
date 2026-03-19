import Tesseract from "tesseract.js";

/**
 * Extracts text from an image using OCR.
 * @param {string} source - URL or local file path.
 * @returns {Object} - Extracted data.
 */
export const extractImage = async (source) => {
  try {
    const { data: { text } } = await Tesseract.recognize(source, 'eng');

    const cleanText = text.replace(/\s+/g, " ").trim();

    return {
      title: "Image Capture",
      content: cleanText || "No text found in image.",
      image: source,
      url: source,
      type: "image",
      source: "manual"
    };

  } catch (error) {
    console.error("Image extraction error:", error.message);
    return {
      title: "Image Capture",
      content: "Could not extract text from this image.",
      image: source,
      url: source,
      type: "image",
      source: "manual"
    };
  }
};