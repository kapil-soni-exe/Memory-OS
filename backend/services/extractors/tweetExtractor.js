import axios from "axios";

export const extractTweet = async (url) => {
  try {

    const api = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;

    const response = await axios.get(api, { timeout: 10000 });

    const html = response.data.html;

    // tweet text
    const text = html
      .replace(/<[^>]+>/g, "")
      .replace(/pic\.twitter\.com\/\S+/g, "")
      .replace(/&mdash;/g, "-")
      .replace(/\s+/g, " ")
      .trim();

    // image extract
    const imageMatch = html.match(/src="([^"]+)"/);
    const image = imageMatch ? imageMatch[1] : null;

    return {
      title: "Tweet",
      content: text,
      author: response.data.author_name,
      image,
      url,
      type: "tweet"
    };

  } catch (error) {
    console.error("Tweet extraction error:", error.message);
    return null;
  }
};