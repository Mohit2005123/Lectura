import { cn } from "@/lib/utils";
import {
  IconBook2,
  IconBrain,
  IconVideo,
  IconCards,
  IconFileText,
  IconSparkles,
  IconRocket,
  IconMessage2,
} from "@tabler/icons-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "AI-Powered Learning Assistant",
      description:
        "Lectura transforms any YouTube video or lecture into structured notes, flashcards, and summaries — powered by cutting-edge LLMs like Groq and Sarvam AI.",
      icon: <IconBrain />,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      title: "Smart YouTube → Notes Conversion",
      description:
        "Simply paste a YouTube link. Lectura transcribes, chunks, and summarizes key insights automatically — saving you hours of manual note-taking.",
      icon: <IconVideo />,
      gradient: "from-pink-500 to-orange-400",
    },
    {
      title: "Flashcards & Auto-Generated Quizzes",
      description:
        "Turn your lectures into bite-sized flashcards and adaptive quizzes using NLP-based keyword extraction and Bloom’s taxonomy-inspired logic.",
      icon: <IconCards />,
      gradient: "from-emerald-400 to-green-600",
    },
    {
      title: "PDF & Markdown Export",
      description:
        "Export your AI-generated notes, flashcards, or summaries into clean, professional PDFs or Markdown documents with one click.",
      icon: <IconFileText />,
      gradient: "from-sky-400 to-blue-600",
    },
    {
      title: "Personalized Learning Dashboard",
      description:
        "Track your learning history, topics mastered, and time spent per concept with a visually engaging AI dashboard built using Next.js & Chart.js.",
      icon: <IconBook2 />,
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      title: "Real-Time AI Chat Assistant",
      description:
        "Ask concept-specific questions directly on your notes page — Lectura’s RAG-powered chatbot answers using video context and web-verified sources.",
      icon: <IconMessage2 />,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      title: "Optical Character Recognition(OCR)",
      description:
        "Users can convert the handwritten and typed PDF notes into structured notes and can interact with the chatbot,generate mindmaps,flashcards and practice quizzes.",
      icon: <IconRocket />,
      gradient: "from-red-400 to-pink-500",
    },
    {
      title: "MindMaps",
      description:
        "Users can create mindmaps from their generated notes using AI which give quick overview of notes.",
      icon: <IconSparkles />,
      gradient: "from-teal-400 to-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({ title, description, icon, index, gradient }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature transition-all duration-300 dark:border-neutral-800 hover:shadow-[0_0_25px_-10px_rgba(59,130,246,0.5)] rounded-xl hover:scale-[1.02]",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 ? (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-900 to-transparent pointer-events-none" />
      ) : (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-900 to-transparent pointer-events-none" />
      )}

      <div className="mb-4 relative z-10 px-10 text-black dark:text-neutral-200">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 shadow-inner group-hover/feature:scale-110 transition-transform duration-200">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
            {icon}
          </span>
        </div>
      </div>

      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span
          className={`group-hover/feature:translate-x-2 transition duration-200 inline-block text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
        >
          {title}
        </span>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs relative z-10 px-10 leading-relaxed group-hover/feature:text-neutral-800 dark:group-hover/feature:text-neutral-200 transition-colors duration-200">
        {description}
      </p>
    </div>
  );
};
