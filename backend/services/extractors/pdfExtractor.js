import axios from "axios";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractPDF = async (url) => {
  try {

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
    "User-Agent": "Mozilla/5.0"
  }
    });

    const buffer = Buffer.from(response.data);

    const data = await pdfParse(buffer);

    let text = data.text.replace(/\s+/g, " ").trim();

    text = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 30)
      .join(" ");

    const content = text.slice(0, 8000);

    const title = url.split("/").pop().replace(".pdf", "");

    return {
      title,
      content,
      url,
      type: "pdf"
    };

  } catch (error) {

    console.log("PDF extraction error:", error.message);
    return null;

  }
};