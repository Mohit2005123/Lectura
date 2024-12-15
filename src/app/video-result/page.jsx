'use client';
import { useVideoContext } from '../../context/VideoContext';
import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { FaDownload, FaFilePdf, FaTrash } from 'react-icons/fa';
import Navbar from '../../components/landingpage/Navbar';

export default function VideoPage() {
  const { videoData, setVideoData } = useVideoContext();
  const contentRef = useRef(null);
  const hiddenContentRef = useRef(null);

  const handleHeadingChange = (index, newHeading) => {
    const updatedData = [...videoData];
    updatedData[index] = { ...updatedData[index], heading: newHeading };
    setVideoData(updatedData);
  };

  const handleContentChange = (index, newContent) => {
    const updatedData = [...videoData];
    updatedData[index] = { ...updatedData[index], content: newContent };
    setVideoData(updatedData);
  };

  const handleAddNewSection = () => {
    const newSection = {
      heading: "New Section",
      content: "Add your content here..."
    };
    setVideoData([...videoData, newSection]);
  };

  const handleDeleteSection = (indexToDelete) => {
    const updatedData = videoData.filter((_, index) => index !== indexToDelete);
    setVideoData(updatedData);
  };

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
        hiddenContentRef.current.innerHTML = '';
      });
  };

  return (
    <>
      <style jsx>{`
        .pdf-mode {
          background-color: white !important;
          color: black !important;
          padding: 20px !important;
        }
        
        .pdf-mode h2 {
          color: black !important;
          font-weight: bold !important;
        }
        
        .pdf-mode div[contenteditable] {
          color: black !important;
        }
        
        .pdf-mode .text-gray-300 {
          color: #1f2937 !important;
        }
        
        .pdf-mode span.w-8 {
          background-color: #1e40af !important;
          color: white !important;
        }
        
        .pdf-mode .border-gray-700 {
          border-color: #e5e7eb !important;
        }
        
        .pdf-mode .border-gray-800 {
          border-color: #d1d5db !important;
        }
      `}</style>

      <Navbar />
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section - now only with Download button */}
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
            className="bg-black rounded-xl shadow-lg p-8 mb-4 border border-gray-800"
          >
            <div className="space-y-8">
              {videoData.map((section, index) => (
                <div 
                  key={index}
                  className="pb-6 border-b border-gray-700 last:border-0 relative group"
                >
                  <div className="absolute right-0 top-0">
                    <button
                      onClick={() => handleDeleteSection(index)}
                      className="text-red-500 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Delete section"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-900 text-blue-200 rounded-full text-sm">
                      {index + 1}
                    </span>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleHeadingChange(index, e.target.textContent)}
                      className="outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 w-full"
                    >
                      {section.heading}
                    </div>
                  </h2>
                  <div className="pl-10">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentChange(index, e.target.textContent)}
                      className="text-gray-300 leading-relaxed whitespace-pre-wrap outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                    >
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Section button moved to bottom */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleAddNewSection}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 text-lg"
            >
              + Add New Section
            </button>
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
