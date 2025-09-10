import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useVideoContext } from '../context/VideoContext';

const NotesUploadModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { setVideoData } = useVideoContext();

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setError(null);
    if (!selected) { setFile(null); return; }
    if (!(selected.type === 'application/pdf' || selected.type.startsWith('image/'))) {
      setError('Please select a PDF or image file.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  // Convert PDF pages to images in-browser using pdfjs-dist
  const renderPdfToImages = async (pdfFile) => {
    const pdfjs = await import('pdfjs-dist');
    const { GlobalWorkerOptions, getDocument } = pdfjs;

    // Robust worker initialization across bundlers
    try {
      const worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
      GlobalWorkerOptions.workerPort = worker;
    } catch (_) {
      try {
        const workerUrlMod = await import('pdfjs-dist/build/pdf.worker.mjs?url');
        const workerSrc = workerUrlMod.default || workerUrlMod;
        GlobalWorkerOptions.workerSrc = workerSrc;
      } catch (e2) {
        console.warn('PDF.js worker fallback failed, proceeding without dedicated worker (may be slower).');
      }
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    const images = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxPages = Math.min(pdf.numPages, 10); // safety cap
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      images.push(dataUrl);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return images;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!file) { setError('Please select a file.'); return; }
    setIsLoading(true);
    try {
      let images = [];
      if (file.type === 'application/pdf') {
        images = await renderPdfToImages(file);
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(file);
        });
        images = [dataUrl];
      }

      if (images.length === 0) {
        throw new Error('Could not process the selected file.');
      }

      const response = await axios.post('/api/ocrNotes', { images });
      const payload = response.data;
      const notes = Array.isArray(payload) ? payload : payload?.notes;
      if (!Array.isArray(notes)) {
        throw new Error('Failed to generate notes.');
      }

      setVideoData({ notes, link: null });
      onClose();
      router.push('/video-result');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
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
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1f1f23] text-white rounded-xl shadow-xl w-11/12 max-w-2xl p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center">Upload Your Notes (PDF or Image)</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="file" className="block text-lg font-medium mb-3">Choose a file:</label>
                <input
                  id="file"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-4 rounded-xl bg-[#2b2b31] text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">Handwritten and typed notes supported.</p>
              </div>

              {error && (
                <div className="p-4 text-red-500 bg-red-100/10 rounded-xl text-sm">{error}</div>
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
                  Generate Notes
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotesUploadModal;