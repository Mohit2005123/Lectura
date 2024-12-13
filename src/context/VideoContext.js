// 'use client';
// import { createContext, useState, useContext } from "react";

// // Create Context
// const VideoContext = createContext();

// // Context Provider
// export const VideoProvider = ({ children }) => {
//   const [videoData, setVideoData] = useState(null);

//   return (
//     <VideoContext.Provider value={{ videoData, setVideoData }}>
//       {children}
//     </VideoContext.Provider>
//   );
// };

// // Custom Hook
// export const useVideoContext = () => {
//     const context = useContext(VideoContext);
//     console.log('This is the context ');
//     console.log(context);
//     if (!context) {
//       throw new Error("useVideoContext must be used within a VideoProvider");
//     }
//     return context;
//   };
'use client';
import { createContext, useContext, useState, useEffect } from "react";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videoData, setVideoData] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("videoData");
      return savedData ? JSON.parse(savedData) : null;
    }
    return null;
  });

  // Save to localStorage whenever videoData changes
  useEffect(() => {
    if (videoData) {
      localStorage.setItem("videoData", JSON.stringify(videoData));
    }
  }, [videoData]);

  return (
    <VideoContext.Provider value={{ videoData, setVideoData }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
