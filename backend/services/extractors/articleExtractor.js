import Mercury from "@postlight/mercury-parser";

export const extractArticle = async (url) => {
  try {

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const html = await response.text();

    const result = await Mercury.parse(url, {
      html
    });

    return {
      title: result.title,
      content: result.content,
      author: result.author,
      image: result.lead_image_url,
      url
    };

  } catch (error) {
    console.error("Mercury extraction error:", error.message);
    return null;
  }
};