import { Image1 } from "./Image1"
import NoteUploadModal from "./NoteUploadModal"
import VideoUploadModal from "./VideoUploadModal"
export default function Hero() {
  return (
    <section className="min-h-screen relative flex flex-col items-center justify-center bg-[#0f0f11] px-4 py-16 pt-40 md:pt-48">
      {/* Background with improved gradient and animation */}
      <div className="absolute inset-0 opacity-25 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/40 via-black/60 to-black/80 z-10" />
        <Image1 className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000" />
      </div>
      
      {/* Content with enhanced animations and spacing */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 text-center">
        <h1 className="text-4xl md:text-6xl text-white font-bold mb-4 leading-tight animate-fade-in-up tracking-tight flex flex-col items-center gap-2">
          Transform YouTube Videos into
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
            Interactive Study Materials
          </span>     
        </h1>

        <div className="my-4 transform hover:scale-105 transition-all duration-300">
          <span className="text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-green-400 font-bold animate-pulse">
            AI-POWERED LEARNING ASSISTANT
          </span>
        </div>

        <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Convert any YouTube video into comprehensive notes, flashcards, and quizzes. 
          <span className="block mt-1 text-gray-400">
            Study smarter with AI-powered content analysis and personalized learning tools.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up">
          <NoteUploadModal />
          <VideoUploadModal />
        </div>
      </div>
    </section>
  )
}
