'use client';
import { FaProjectDiagram, FaTimes } from 'react-icons/fa';
import HorizontalMindMapVisualization from './VerticalMindMapVisualization';
import { useRef } from 'react';

const MindMapModal = ({ isOpen, onClose, mindMapData, title }) => {
  const vizRef = useRef(null);
  if (!isOpen) return null;

  const handleFitWidth = () => {
    if (vizRef.current && typeof vizRef.current.fitToWidth === 'function') {
      vizRef.current.fitToWidth();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <FaProjectDiagram className="text-white text-sm" />
            </div>
            <h2 className="text-2xl font-bold text-white">Mind Map: {title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFitWidth}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 shadow-sm transition-colors"
            >
              Fit to View
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl font-light transition-colors duration-200 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-900">
          {mindMapData && (
            <div className="h-full">
              <HorizontalMindMapVisualization ref={vizRef} data={mindMapData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMapModal;
