'use client';

import { Youtube, BookOpen, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel } from './ui/apple-cards-carousel'; // ← your Carousel file

// --- Feature icons and short static cards
const features = [
  {
    icon: <Youtube className="h-10 w-10 text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]" />,
    title: 'Smart Video Learning',
    description:
      'Transform any YouTube video into rich, structured study notes using advanced AI.',
    gradient: 'from-pink-500 via-violet-500 to-blue-500',
  },
  {
    icon: <BookOpen className="h-10 w-10 text-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />,
    title: 'Interactive Study Tools',
    description:
      'Instantly generate flashcards and quizzes tailored to your content.',
    gradient: 'from-yellow-400 via-pink-500 to-violet-500',
  },
  {
    icon: <Brain className="h-10 w-10 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]" />,
    title: 'Performance Insights',
    description:
      'Track your progress with visual analytics powered by AI feedback.',
    gradient: 'from-green-400 via-blue-500 to-violet-500',
  },
];

// --- Variants for animation staggering
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.4 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-28 px-6 bg-gradient-to-b from-[#050505] via-[#0b0015] to-[#000000] text-white overflow-hidden"
    >
      {/* 🌌 Aurora background */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-600/20 via-violet-700/10 to-transparent blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* ✨ Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
            animate={{ y: ['0%', '100%', '0%'], opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 25 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* ✏️ Section heading */}
      <div className="relative text-center mb-24">
        <h2 className="text-5xl md:text-6xl font-extrabold bg-[#9308c5] bg-clip-text text-transparent">
          Powerful Features
        </h2>
      </div>

      {/* 🎬 Animated feature cards */}
      <motion.div
        className="relative grid md:grid-cols-3 gap-12 max-w-7xl mx-auto z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ scale: 1.05 }}
            className="relative rounded-3xl bg-[#0a0a0a]/70 backdrop-blur-xl border border-violet-500/20 p-10 text-center shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:shadow-[0_0_35px_rgba(139,92,246,0.3)] transition-all duration-500"
          >
            <div className="mb-6 flex items-center justify-center">
              <span
                className={`inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-r ${f.gradient} shadow-[0_0_25px_rgba(167,139,250,0.3)] group-hover:scale-110 transition-transform duration-500`}
              >
                {f.icon}
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">
              {f.title}
            </h3>
            <p className="text-gray-400 leading-relaxed">{f.description}</p>
            <motion.div
              className={`mt-8 h-[2px] w-0 mx-auto bg-gradient-to-r ${f.gradient} rounded-full`}
              whileInView={{ width: '70%' }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 🪩 Fancy vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,black_100%)]" />

      {/* 🌀 Integrated Apple-style Carousel */}
      <div className="flex justify-center items-center pt-16">
        <Carousel
          items={[
            {
              category: 'AI Learning',
              title: 'YouTube → Study Notes',
              src: '/step-1/4.jpg',
              content: (
                <div className="text-neutral-600 dark:text-neutral-200 space-y-4">
                  <p>
                    Convert long YouTube lectures into clean structured notes using AI.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Auto topic extraction</li>
                    <li>Smart note segmentation</li>
                    <li>Context summarization</li>
                  </ul>
                </div>
              ),
            },
            {
              category: 'Interactive Tools',
              title: 'Flashcards & Quizzes',
              src: '/step-2/2.jpg',
              content: (
                <div className="text-neutral-600 dark:text-neutral-200 space-y-4">
                  <p>
                    Auto-generate flashcards and adaptive quizzes for your notes.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Instant question generation</li>
                    <li>Review progress tracking</li>
                    <li>Difficulty-based learning</li>
                  </ul>
                </div>
              ),
            },
            {
              category: 'Analytics',
              title: 'Performance Insights',
              src: '/step-3/4.jpg',
              content: (
                <div className="text-neutral-600 dark:text-neutral-200 space-y-4">
                  <p>
                    Visualize your learning with detailed progress analytics.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>AI-driven analytics</li>
                    <li>Goal tracking and reminders</li>
                    <li>Smart revision suggestions</li>
                  </ul>
                </div>
              ),
            },
            {
              category: 'Test Yourself',
              title: 'Practice Quizzes',
              src: '/step-3/2.jpg',
              content: (
                <div className="text-neutral-600 dark:text-neutral-200 space-y-4">
                  <p>
                    Auto-generate flashcards and adaptive quizzes for your notes.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Instant question generation</li>
                    <li>Review progress tracking</li>
                    <li>Difficulty-based learning</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
