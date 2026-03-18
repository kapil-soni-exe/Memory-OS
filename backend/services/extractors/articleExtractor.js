import Mercury from "@postlight/mercury-parser";

export const extractArticle = async (url) => {
  try {

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

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

    console.log("Mercury extraction error:", error.message);

    return null;

  }
};