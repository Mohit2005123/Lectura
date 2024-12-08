'use client'

import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ready to Get Started?
        </motion.h2>
        <motion.p
          className="text-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Join thousands of satisfied customers and transform your workflow today.
        </motion.p>
        <motion.button
          className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Up Now
        </motion.button>
      </div>
    </section>
  )
}

