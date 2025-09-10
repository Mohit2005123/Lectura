'use client';
import { FaProjectDiagram, FaTimes } from 'react-icons/fa';
import MindMapVisualization from './MindMapVisualization';

const MindMapModal = ({ isOpen, onClose, mindMapData, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col border-2 border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <FaProjectDiagram className="text-white text-sm" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Mind Map: {title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-3xl font-light transition-colors duration-200 hover:bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mindMapData && (
            <div className="h-full overflow-auto">
              <MindMapVisualization data={mindMapData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMapModal;
