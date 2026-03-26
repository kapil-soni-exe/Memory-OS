import ytdl from "@distube/ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";

export const extractYoutube = async (url) => {
  try {

    const info = await ytdl.getBasicInfo(url);
    const video = info.videoDetails;

    let transcriptText = "";
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      // Create a timestamped transcript for the LLM
      // e.g. [00:15] hello world [00:22] how are you...
      transcriptText = transcript.map(t => {
        const minutes = Math.floor(t.offset / 60000);
        const seconds = Math.floor((t.offset % 60000) / 1000);
        const timeStr = `[${minutes}:${seconds < 10 ? '0' : ''}${seconds}]`;
        return `${timeStr} ${t.text}`;
      }).join(" ");
    } catch (err) {
      // Transcript might not be available
    }

    const description = video.description?.trim() || "";

    const content =
      transcriptText ||
      `${video.title} ${description}`.trim() ||
      video.title;

    const image =
      video.thumbnails?.sort((a, b) => b.width - a.width)?.[0]?.url;

    return {
      title: video.title,
      content,
      author: video.author.name,
      image,
      url,
      type: "youtube"
    };

  } catch (error) {
    console.error("Youtube extraction error:", error.message);
    return null;
  }
};