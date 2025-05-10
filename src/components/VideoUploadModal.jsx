import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useVideoContext } from '../context/VideoContext';
import {useRouter} from 'next/navigation';

export default function VideoUploadModal({ isOpen, onClose, onSubmit }) {
  const { setVideoData } = useVideoContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputValue = e.target.elements.videoInput.value.trim();
    const language = e.target.elements.language.value;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        "https://lectura-transcripto-api.onrender.com/api/generate",
        { 
          link: inputValue,
          language: language 
        }
      );
      
      if (response.data) {
        setVideoData(response.data);
        router.push('/video-result');
        onClose();
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setError(
        error.response?.data?.message || 
        error.message || 
        "Failed to process video. Please try again."
      );
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
              onSubmit={handleSubmit}
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
              <div className="mb-6">
                <label htmlFor="language" className="block text-lg font-medium mb-3">
                  Select Language:
                </label>
                <select
                  id="language"
                  className="w-full px-4 py-4 rounded-xl bg-[#2b2b31] text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  required
                >
                  <option value="">Select a language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bn">Bengali</option>
                  <option value="te">Telugu</option>
                  <option value="mr">Marathi</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="ur">Urdu</option>
                  <option value="or">Odia</option>
                  <option value="as">Assamese</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
              {error && (
                <div className="p-4 text-red-500 bg-red-100/10 rounded-xl text-sm">
                  {error}
                </div>
              )}
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