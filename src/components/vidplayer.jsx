import React from "react";

export default function VidPlayer() {
  return (
    <section id="video" className="py-20 mt-10 mb-10 px-4 bg-black">
      <div className="max-w-[75rem] mx-auto grid lg:grid-cols-2 items-center gap-12">
        {/* Left Section - Content */}
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-6">
            How to Use the Application
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            This video is a short tutorial on how to use the application
            effectively. Follow along to understand its key features and
            functionalities.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Learn how to get started, navigate the interface, and make the most
            of this tool to simplify your tasks and boost productivity.
          </p>
        </div>

        {/* Right Section - Video */}
        <div className="mx-auto lg:mx-0 w-full" style={{ maxWidth: "620px" }}>
          <iframe
            src="https://www.youtube.com/embed/bTnmMc7hHEQ"
            title="How to Use the Application"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg border border-gray-300 w-full"
            style={{ height: "350px" }} // Adjust height explicitly
          ></iframe>
        </div>
      </div>
    </section>
  );
}
