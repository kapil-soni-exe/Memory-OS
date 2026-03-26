import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

export const extractYoutube = async (url) => {
  try {
    // 1. Fetch Metadata via OEmbed (Much more stable than ytdl-core on Render/Vercel)
    let videoData = {
      title: "YouTube Video",
      author: "Unknown Creator",
      image: "",
      description: ""
    };

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await axios.get(oembedUrl);
      if (response.data) {
        videoData = {
          title: response.data.title || "YouTube Video",
          author: response.data.author_name || "Unknown Creator",
          image: response.data.thumbnail_url || ""
        };
      }
    } catch (metaErr) {
      console.warn("[Youtube] OEmbed metadata fetch failed:", metaErr.message);
      // Fallback: try to guess title from URL if possible
    }

    // 2. Fetch Transcript
    let transcriptText = "";
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      transcriptText = transcript.map(t => {
        const offsetInSeconds = t.offset > 1000000 ? t.offset / 1000 : t.offset;
        const minutes = Math.floor(offsetInSeconds / 60);
        const seconds = Math.floor(offsetInSeconds % 60);
        return `[${minutes}:${seconds < 10 ? '0' : ''}${seconds}] ${t.text}`;
      }).slice(0, 300).join(" ");
    } catch (err) {
      console.warn("[Youtube] Transcript fetch failed:", err.message);
    }

    const content = transcriptText || `Video Title: ${videoData.title}\nAuthor: ${videoData.author}\n(No transcript available)`;

    return {
      title: videoData.title,
      content: content,
      author: videoData.author,
      image: videoData.image,
      url: url,
      type: "youtube"
    };

  } catch (error) {
    console.error("[Youtube] Global extraction error:", error.message);
    return null;
  }
};