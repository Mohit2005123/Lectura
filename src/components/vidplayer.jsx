import React from "react";

export default function VidPlayer() {
  return (
    <section id="video" className="py-20 mt-10 mb-10 px-4 bg-black">
      <div className="max-w-[85rem] mx-auto flex flex-col items-center">
        {/* Content Section */}
        <div className="text-white text-center max-w-3xl mb-12">
          <h2 className="text-5xl font-bold mb-6">
            Getting Started
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Take your learning to the next level with Lectura's powerful features.
            Start transforming your study experience today.
          </p>
        </div>

        {/* Video Section */}
        <div className="w-full max-w-[900px]">
          <iframe
            src="https://www.youtube.com/embed/bTnmMc7hHEQ"
            title="How to Use the Application"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg border border-gray-300 w-full aspect-video"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
