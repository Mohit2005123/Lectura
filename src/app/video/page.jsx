'use client'
import { useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPath, setVideoPath] = useState("");

  const handleConvert = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl }),
    });

    const data = await response.json();
    if (data.path) {
      setVideoPath(data.path);
    } else {
      alert(data.error || "Something went wrong.");
    }
  };

  return (
    <div className="bg-white">
      <h1>YouTube to MP4 Converter</h1>
      <form onSubmit={handleConvert}>
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
        <button type="submit">Convert and Play</button>
      </form>
      {videoPath && (
        <div style={{ marginTop: "20px" }}>
          <h2>Converted Video:</h2>
          <video controls width="600">
            <source src={videoPath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

