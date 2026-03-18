export const detectContentType = (url, providedType, content = "") => {
  // If user explicitly chose a type (other than auto), use it
  if (providedType && providedType !== "auto") return providedType;

  // Manual entry detection (no URL)
  if (!url) {
    // If it's long, call it an article, otherwise a note
    return content.trim().length > 500 ? "article" : "note";
  }

  // URL based detection
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return "video";
  }

  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    return "tweet";
  }

  if (lowerUrl.endsWith(".pdf")) {
    return "pdf";
  }

  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return "image";
  }

  return "article";
};