import React from 'react';

const NoteCard = ({ title, content, onClick, onFlashcardClick, onQuizClick }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all duration-300 h-[450px] flex flex-col">
      <div className="flex-grow">
        <h3 className="text-2xl font-extrabold text-white mb-4 tracking-tight">{title}</h3>
        <div className="space-y-3">
          {content.slice(0, 3).map((item, index) => (
            <p 
              key={index} 
              className="text-gray-300 text-base font-medium line-clamp-1 flex items-center"
            >
              <span className="mr-2 text-cyan-400">•</span>
              {item.heading}
            </p>
          ))}
        </div>
      </div>
      <div className="space-y-3 mt-4">
        <button
          onClick={onClick}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl
           hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-xl
           font-semibold text-base flex items-center justify-center space-x-2 
           hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>View Notes</span>
        </button>
        <button
          onClick={onFlashcardClick}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl
           hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl
           font-semibold text-base flex items-center justify-center space-x-2
           hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Flashcards</span>
        </button>
        <button
          onClick={onQuizClick}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl
           hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl
           font-semibold text-base flex items-center justify-center space-x-2
           hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Generate Quiz</span>
        </button>
      </div>
    </div>
  );
};

export default NoteCard;