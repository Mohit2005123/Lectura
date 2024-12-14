'use client';
import { useVideoContext } from '../../context/VideoContext';
import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { FaDownload, FaFilePdf } from 'react-icons/fa';
import Navbar from '../../components/landingpage/Navbar';

export default function VideoPage() {
  const { videoData } = useVideoContext();
  const contentRef = useRef(null);
  const hiddenContentRef = useRef(null);

  if (!videoData || videoData.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center p-8 bg-black rounded-lg shadow-lg border border-gray-800">
            <FaFilePdf className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-white">No video data available. Please upload a video first.</p>
          </div>
        </div>
      </>
    );
  }

  const handleDownload = () => {
    // Create a temporary copy of the content for PDF generation
    const clonedContent = contentRef.current.cloneNode(true);
    clonedContent.classList.add('pdf-mode');

    // Append the cloned content to a hidden container
    hiddenContentRef.current.innerHTML = ''; // Clear previous content
    hiddenContentRef.current.appendChild(clonedContent);

    const opt = {
      margin: 1,
      filename: 'video-analysis.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(clonedContent)
      .save()
      .finally(() => {
        // Ensure the hidden content is cleared after generation
        hiddenContentRef.current.innerHTML = '';
      });
  };

  return (
    <>
      <style jsx>{`
        .pdf-mode {
          background-color: white !important;
          color: black !important;
        }
        
        .pdf-mode h2 {
          color: black !important;
        }
        
        .pdf-mode p {
          color: #374151 !important;
        }
        
        .pdf-mode span {
          background-color: #dbeafe !important;
          color: #2563eb !important;
        }
      `}</style>

      <Navbar />
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Generated Notes
            </h1>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FaDownload />
              Download PDF
            </button>
          </div>

          {/* Main Content */}
          <div
            ref={contentRef}
            className="bg-black rounded-xl shadow-lg p-8 mb-8 border border-gray-800"
          >
            {/* PDF-like content */}
            <div className="space-y-8">
              {videoData.map((section, index) => (
                <div 
                  key={index}
                  className="pb-6 border-b border-gray-700 last:border-0"
                >
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-900 text-blue-200 rounded-full text-sm">
                      {index + 1}
                    </span>
                    {section.heading}
                  </h2>
                  <div className="pl-10">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm">
            Generated by Lectura • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Hidden container for generating PDF */}
      <div
        ref={hiddenContentRef}
        className="hidden"
        style={{ position: 'absolute', top: 0, left: 0 }}
      ></div>
    </>
  );
}
