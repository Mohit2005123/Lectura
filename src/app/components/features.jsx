'use client'
import { motion } from 'framer-motion'
import { Lightbulb, Zap, Shield } from 'lucide-react'

const features = [
  { icon: Lightbulb, title: 'Notes', description: 'Genearation of flash cards and summmarized notes in pdf format.' },
  { icon: Zap, title: 'Learning', description: 'Personalized learning pathways with the help of quiz.' },
  { icon: Shield, title: 'AI', description: 'AI supported Video to text generation' },
]

export default function Features() {
  return (
    <section className="py-20 bg-white bg-opacity-10 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white bg-opacity-20 p-6 rounded-lg backdrop-blur-lg"
            >
              <feature.icon className="w-12 h-12 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
              <p className="text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

