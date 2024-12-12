// 'use client';

// import { motion } from 'framer-motion';
// import { useState } from 'react';
// import { FileUpload } from '@/components/ui/file-upload';

// export default function NotesUploadModal({ isOpen, onClose, onSubmit }) {
//   const [file, setFile] = useState(null);

//   const handleFileChange = (uploadedFile) => {
//     setFile(uploadedFile);
//   };

//   const handleSubmit = () => {
//     if (file) {
//       onSubmit(file);
//       setFile(null); // Reset file after submission
//     }
//   };

//   return (
//     isOpen && (
//       <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/70">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.8 }}
//           transition={{ duration: 0.3, ease: 'easeInOut' }}
//           className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 relative"
//         >
//           {/* Modal Header */}
//           <div className="flex justify-between items-center mb-4">
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 focus:outline-none"
//             >
//               ✕
//             </button>
//           </div>

//           {/* File Upload Component */}
//           <FileUpload onChange={handleFileChange} />

//           {/* Actions */}
//           <div className="mt-6 flex justify-end gap-4">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={!file}
//               className={`px-4 py-2 rounded-lg text-white focus:outline-none ${
//                 file
//                   ? 'bg-violet-600 hover:bg-violet-700'
//                   : 'bg-gray-400 cursor-not-allowed'
//               }`}
//             >
//               Submit
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     )
//   );
// }

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';

export default function NotesUploadModal({ isOpen, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const modalRef = useRef(null);

  const handleFileChange = (uploadedFile) => {
    setFile(uploadedFile);
  };

  const handleSubmit = () => {
    if (file) {
      onSubmit(file);
      setFile(null); // Reset file after submission
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-black rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 relative border border-neutral-800"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Upload Notes</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white focus:outline-none transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* File Upload Component */}
          <div className="mb-6">
            <FileUpload onChange={handleFileChange} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file}
              className={`px-4 py-2 rounded-lg focus:outline-none transition-colors ${
                file
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}