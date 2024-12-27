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

        <div className="w-full max-w-[900px]" ref={videoRef}>
          <iframe
            src={`https://www.youtube.com/embed/bTnmMc7hHEQ?autoplay=${
              isVisible ? 1 : 0
            }&mute=1&cc_load_policy=0`}
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
