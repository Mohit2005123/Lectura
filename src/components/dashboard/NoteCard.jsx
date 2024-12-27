import React from 'react';
import { BookOpen, Library, Brain, Trash2 } from 'lucide-react';

const NoteCard = ({ title, content, onClick, onFlashcardClick, onQuizClick, onDelete }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm border border-slate-700/50 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all duration-300 h-[500px] flex flex-col">
      <div className="flex-grow">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-sky-200 to-indigo-200 bg-clip-text text-transparent mb-6 tracking-tight">
          {title}
        </h3>
        <div className="space-y-4">
          {content.slice(0, 3).map((item, index) => (
            <p
              key={index}
              className="text-slate-300 text-base font-medium flex items-center group hover:text-slate-100 transition-colors duration-200"
            >
              <span className="mr-3 h-1.5 w-1.5 rounded-full bg-sky-400 group-hover:bg-sky-300 transition-colors duration-200" />
              {item.heading}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={onClick}
          className="col-span-2 px-4 py-3.5 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-2xl
           hover:from-indigo-600 hover:to-sky-600 transition-all duration-300
           font-semibold text-sm flex items-center justify-center space-x-2
           hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
        >
          <BookOpen size={18} className="mr-2" />
          <span>View Notes</span>
        </button>
        
        <button
          onClick={onFlashcardClick}
          className="px-4 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl
           hover:from-violet-600 hover:to-indigo-600 transition-all duration-300
           font-semibold text-sm flex items-center justify-center space-x-2
           hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98]"
        >
          <Library size={18} className="mr-2" />
          <span>Flashcards</span>
        </button>

        <button
          onClick={onQuizClick}
          className="px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl
           hover:from-emerald-600 hover:to-teal-600 transition-all duration-300
           font-semibold text-sm flex items-center justify-center space-x-2
           hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          <Brain size={18} className="mr-2" />
          <span>Quiz</span>
        </button>

        <button
          onClick={onDelete}
          className="col-span-2 px-4 py-3 bg-slate-800 text-slate-300 rounded-2xl
           hover:bg-slate-700 hover:text-white transition-all duration-300
           font-medium text-sm flex items-center justify-center space-x-2
           border border-slate-700 hover:border-slate-600
           active:scale-[0.98]"
        >
          <Trash2 size={18} className="mr-2 text-red-500" />
          <span>Delete Note</span>
        </button>
      </div>
    </div>
  );
};

export default NoteCard;