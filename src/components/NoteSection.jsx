// components/NoteSection.jsx
import { FaTrash } from 'react-icons/fa';

export default function NoteSection({ 
  videoData, 
  handleHeadingChange, 
  handleContentChange, 
  handleDeleteSection 
}) {
  return (
    <div className="space-y-8">
      {videoData.notes.map((section, index) => (
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
              onBlur={(e) => handleContentChange(index, e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: section.content }}
              className="text-gray-300 leading-relaxed whitespace-pre-wrap outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            >
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}