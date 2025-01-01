import { spawn } from "child_process"; // Use spawn for better stream handling
import ffmpeg from "fluent-ffmpeg";
import path from "path";

export const POST = async (req) => {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "Video URL is required." }), { status: 400 });
    }

    const outputFilePath = path.resolve("./public", "video_converted.mp4");

    // Step 1: Spawn yt-dlp to stream video and audio directly
    const ytDlpProcess = spawn("yt-dlp", [
      "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4", // Select the best video and audio
      "-o", "-", // Output to stdout (stream)
      videoUrl
    ]);

    // Step 2: Pipe yt-dlp output to FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(ytDlpProcess.stdout) // Input comes from yt-dlp's stdout stream
        .inputFormat("mp4") // Specify input format as mp4
        .output(outputFilePath)
        .on("end", () => {
          console.log("Conversion finished successfully!");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg Error:", err);
          reject(err);
        })
        .run();
    });

    return new Response(
      JSON.stringify({ message: "Conversion successful!", path: "/video_converted.mp4" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error." }),
      { status: 500 }
    );
  }
};




