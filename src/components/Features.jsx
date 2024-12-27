'use client';
import { Youtube, BookOpen, Brain } from 'lucide-react'

const features = [
  {
    icon: <Youtube className="h-6 w-6 text-violet-600" />,
    title: 'Smart Video Learning',
    description: 'Convert YouTube videos to study notes with AI.'
  },
  {
    icon: <BookOpen className="h-6 w-6 text-violet-600" />,
    title: 'Interactive Study Tools',
    description: 'Create flashcards and quizzes instantly.'
  },
  {
    icon: <Brain className="h-6 w-6 text-violet-600" />,
    title: 'Performance Insights',
    description: 'Track progress with AI-powered analysis.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20  px-4 bg-black">
      <h2 className="text-5xl font-bold text-center text-white mb-12">Powerful Features</h2>
      <div className="grid  text-white md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="mb-4 inline-block p-3 bg-purple-500 rounded-full">
              {feature.icon}
            </div>
            <h3 className="text-xl animate- font-semibold  mb-2">{feature.title}</h3>
            <p className="text-white  animate-">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


