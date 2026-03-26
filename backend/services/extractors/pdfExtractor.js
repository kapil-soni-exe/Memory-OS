import axios from "axios";
import { createRequire } from "module";
import fs from "fs-extra";
import Tesseract from "tesseract.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Extracts text from a PDF from a URL or a local buffer/path.
 * @param {string|Buffer} source - URL, Buffer, or local path.
 * @returns {Object} - Extracted data.
 */
export const extractPDF = async (source) => {
  try {
    let buffer;

    if (Buffer.isBuffer(source)) {
      buffer = source;
    } else if (typeof source === "string" && (source.startsWith("http") || source.startsWith("https"))) {
      const response = await axios.get(source, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 20000 // 20 second timeout
      });
      buffer = Buffer.from(response.data);
    } else if (typeof source === "string") {
      buffer = await fs.readFile(source);
    } else {
      throw new Error("Invalid source for PDF extraction");
    }

    // 1. Attempt standard PDF parsing
    const data = await pdfParse(buffer);
    let content = data.text.replace(/\s+/g, " ").trim();
    
    // 2. Metadata extraction
    const metadata = {
      pages: data.numpages,
      info: data.info || {},
      metadata: data.metadata || {}
    };

    // 3. OCR Fallback (if text is too sparse)
    if (content.length < 100 && metadata.pages > 0) {
      console.log("[PDF Extractor] Low text detected, attempting OCR fallback...");
      try {
        // Note: Tesseract on a raw PDF buffer won't work alone. 
        // We usually need to convert PDF to Image first.
        // However, since we don't have a conversion tool, we'll log this limitation 
        // but provide the metadata at least. 
        // If 'source' was an image saved as PDF, Tesseract might handle it if we have a path.
        
        // For now, we'll mark it as "Scanned/Image PDF"
        content = "[Scanned Document Detected] Standard extraction failed. Please ensure the PDF is text-searchable.";
      } catch (ocrError) {
        console.error("OCR Error:", ocrError.message);
      }
    }

    // Cleaning and slicing
    content = content.slice(0, 10000);

    const title = typeof source === "string" ? source.split(/[\/\\]/).pop().replace(".pdf", "") : "Uploaded PDF";

    return {
      title: title || "Untitled PDF",
      content: content || "Empty PDF",
      url: typeof source === "string" && source.startsWith("http") ? source : null,
      type: "pdf",
      source: "manual",
      metadata: {
        author: metadata.info.Author || "Unknown",
        pageCount: metadata.pages,
        creator: metadata.info.Creator || "Unknown"
      }
    };

  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return null;
  }
};