"use client";
import React, { useEffect, useRef, useState } from "react";
export default function VidPlayer() {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.4 } // Trigger when 40% of the element is visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section id="video" className="py-20 mt-10 mb-10 px-4 bg-black">
      <div className="max-w-[85rem] mx-auto flex flex-col items-center">
        <div className="text-white text-center max-w-3xl mb-12">
          <h2 className="text-5xl font-bold mb-6">Getting Started</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Take your learning to the next level with Lectura's powerful
            features. Start transforming your study experience today.
          </p>
        </div>

        <div className="w-full flex justify-center max-w-[1200px]" ref={videoRef}>
          <video
        autoPlay
        loop
        muted
        controls
        style={{ width: "80%", border: "2px solid #ccc", borderRadius: "10px" }}
      >
        <source src="/demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
        </div>
      </div>
    </section>
  );
}
