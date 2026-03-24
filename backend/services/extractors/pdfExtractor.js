import axios from "axios";
import { createRequire } from "module";
import fs from "fs-extra";

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

    const data = await pdfParse(buffer);
    const content = data.text.replace(/\s+/g, " ").trim().slice(0, 10000);

    const title = typeof source === "string" ? source.split(/[\/\\]/).pop().replace(".pdf", "") : "Uploaded PDF";

    return {
      title: title || "Untitled PDF",
      content: content || "Empty PDF",
      url: typeof source === "string" && source.startsWith("http") ? source : null,
      type: "pdf",
      source: "manual"
    };

  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return null;
  }
};