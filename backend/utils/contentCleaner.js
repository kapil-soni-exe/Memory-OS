import * as cheerio from "cheerio";

export const cleanContent = (input) => {
  if (!input) return "";

  // agar plain text hai (HTML nahi hai)
  if (!input.includes("<")) {
    return input.trim();
  }

  const $ = cheerio.load(input);

  // unwanted tags remove
  $("script").remove();
  $("style").remove();
  $("figure").remove();
  $("noscript").remove();

  // paragraph text extract
  const paragraphs = $("article p, main p, p")
    .map((i, el) => $(el).text().trim())
    .get()
    .filter((text) => text.length > 50);

  const cleaned = paragraphs.join("\n\n").trim();

  // fallback agar paragraph nahi mile
  if (!cleaned) {
    return $.text().replace(/\s+/g, " ").trim();
  }

  return cleaned;
};