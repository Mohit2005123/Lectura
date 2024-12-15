"use client";
import VideoUploadModal from "@/components/dashboard/flashcard_modal";
import { useState } from "react";

const Flashcard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up mb-[4rem]">
        <button
          className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-xl hover:shadow-violet-500/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-lg"
          onClick={() => setIsModalOpen(true)}
        >
          View Flashcards
        </button>
        <VideoUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Flashcard;

// "use client";

// import VideoUploadModal from "@/components/dashboard/flashcard_modal";
// import { AnimatedTestimonialsDemo } from "@/components/dashboard/flashcard_body";
// import { useState } from "react";

// const Flashcard = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up">
//         <button
//           className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-xl hover:shadow-violet-500/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-lg"
//           onClick={() => setIsModalOpen(true)}
//         >
//           Get Started Upload your Video
//         </button>
//         <button
//           className="px-8 py-4 bg-transparent border-2 border-violet-500/50 text-white font-semibold rounded-lg hover:bg-violet-500/20 backdrop-blur-sm transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-lg"
//           onClick={() => setIsNotesModalOpen(true)}
//         >
//           Upload your Notes
//         </button>
//       </div>

//       {/* Example of using modals */}
//       {isModalOpen && (
//         <VideoUploadModal onClose={() => setIsModalOpen(false)} />
//       )}
//       {isNotesModalOpen && (
//         <AnimatedTestimonialsDemo onClose={() => setIsNotesModalOpen(false)} />
//       )}
//     </div>
//   );
// };

// export default Flashcard;
