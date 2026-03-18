import ytdl from "@distube/ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";

export const extractYoutube = async (url) => {
  try {

    const info = await ytdl.getBasicInfo(url);
    const video = info.videoDetails;

    let transcriptText = "";

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(video.videoId);
      transcriptText = transcript.map(t => t.text).join(" ");
    } catch (err) {
      console.log("Transcript not available");
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

    console.log("Youtube extraction error:", error.message);
    return null;

  }
};