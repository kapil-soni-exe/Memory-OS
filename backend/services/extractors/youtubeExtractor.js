import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

export const extractYoutube = async (url) => {
  console.log(`[Youtube] Starting extraction for: ${url}`);
  
  let videoData = {
    title: "YouTube Video",
    author: "Unknown Creator",
    image: "",
    url: url,
    type: "youtube"
  };

  // Attempt to get ID for failsafe title
  const videoId = url.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([^&?#\s]+)/)?.[1];
  if (videoId) {
    videoData.title = `YouTube Video (${videoId})`;
  }

  // 1. Fetch Metadata via OEmbed
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      timeout: 5000
    });
    
    if (response.data) {
      videoData.title = response.data.title || videoData.title;
      videoData.author = response.data.author_name || videoData.author;
      videoData.image = response.data.thumbnail_url || "";
    }
  } catch (metaErr) {
    console.warn(`[Youtube] Metadata fetch failed: ${metaErr.message}`);
  }

  // 2. Fetch Transcript
  let transcriptText = "";
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    if (transcript && transcript.length > 0) {
      transcriptText = transcript.map(t => {
        const offsetInSeconds = t.offset > 1000000 ? t.offset / 1000 : t.offset;
        const minutes = Math.floor(offsetInSeconds / 60);
        const seconds = Math.floor(offsetInSeconds % 60);
        return `[${minutes}:${seconds < 10 ? '0' : ''}${seconds}] ${t.text}`;
      }).slice(0, 300).join(" ");
    }
  } catch (err) {
    console.warn(`[Youtube] Transcript fetch failed: ${err.message}`);
  }

  // Final content assembly
  const content = transcriptText || `Video Title: ${videoData.title}\nAuthor: ${videoData.author}\n(Transcript currently unavailable)`;

  console.log(`[Youtube] Extraction complete: ${videoData.title}`);

  return {
    ...videoData,
    content: content
  };
};