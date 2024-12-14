'use client';
import { useVideoContext } from '../../context/VideoContext';

export default function VideoPage() {
  const { videoData } = useVideoContext();
  console.log(videoData);
  
  if (!videoData || videoData.length === 0) {
    return <p>No video data available. Please upload a video first.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Video Analysis Results</h1>
      {videoData.map((section, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
          <p className="text-gray-700">{section.content}</p>
        </div>
      ))}
    </div>
  );
}

