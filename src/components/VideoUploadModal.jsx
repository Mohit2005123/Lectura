import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useVideoContext } from '../context/VideoContext';
import {useRouter} from 'next/navigation';
export default function VideoUploadModal({ isOpen, onClose, onSubmit }) {
  const { setVideoData } = useVideoContext();
  const router=useRouter();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);
  const handleSubmit = async (inputValue) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/generateNotes", { link: inputValue }); // Make a POST request to the API
      setVideoData(response.data); // Store the data in Context
      console.log(response.data);
      router.push('/video-result'); // Redirect to the result page
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-[#1f1f23] text-white rounded-xl shadow-xl w-11/12 max-w-2xl p-8 min-h-[400px]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            {/* Modal Content */}
            <h2 className="text-3xl font-bold mb-6 text-center">Upload Your Video</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const inputValue = e.target.elements.videoInput.value.trim();
                handleSubmit(inputValue);
              }}
              className="space-y-6"
            >
              <div className="mb-6">
                <label htmlFor="videoInput" className="block text-lg font-medium mb-3">
                  Paste the YouTube Video URL:
                </label>
                <input
                  id="videoInput"
                  type="text"
                  placeholder="Enter YouTube video URL"
                  className="w-full px-4 py-4 rounded-xl bg-[#2b2b31] text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  required
                />
              </div>
              {isLoading ? (
                <div className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="ml-3">Processing...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-violet-500/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                >
                  Submit
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}