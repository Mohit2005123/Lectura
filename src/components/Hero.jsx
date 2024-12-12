import { Image1 } from "./Image1"
export default function Hero() {
  return (
    <section className="min-h-screen relative flex flex-col items-center justify-center bg-[#0f0f11] px-4 py-16 pt-40 md:pt-48">
      {/* Background with improved gradient */}
      <div className="absolute inset-0 opacity-30 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/50 via-black/70 to-black/90 z-10" />
        <Image1 className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000" />
      </div>
      
      {/* Content with enhanced animations */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-center">
        <h1 className="text-4xl md:text-7xl text-white font-bold mb-4 leading-tight animate-fade-in-up tracking-tight flex flex-col items-center gap-3 text-shadow-lg">
          Transform YouTube Videos into
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400">
            Interactive Study Materials
          </span>     
        </h1>

        <div className="my-6 transform hover:scale-105 transition-all duration-300">
          <span className="text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-green-400 font-bold animate-pulse-slow">
            AI-POWERED LEARNING ASSISTANT
          </span>
        </div>

        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in text-shadow-sm">
          Convert any YouTube video into comprehensive notes, flashcards, and quizzes. 
          <span className="block mt-2 text-gray-300">
            Study smarter with AI-powered content analysis and personalized learning tools.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up">
          <button className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-xl hover:shadow-violet-500/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-lg">
            Get Started Free
          </button>
          <button className="px-8 py-4 bg-transparent border-2 border-violet-500/50 text-white font-semibold rounded-lg hover:bg-violet-500/20 backdrop-blur-sm transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 text-lg">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  )
}
