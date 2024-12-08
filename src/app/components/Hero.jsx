'use client'
import { motion } from 'framer-motion'
export default function Hero() {
  return (
    <section className="h-screen flex items-center  justify-around text-white">
      <div className='flex flex-col gap-6'>
        <motion.button
          className="bg-white  text-purple-700 px-6 -right-10 py-3 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          Upload Video
        </motion.button>
        <motion.button
          className="bg-white  text-purple-700 px-6 -right-10 py-3 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          Upload Notes
        </motion.button>
        <div className='flex flex-col '>
        <span className=' text-blue-200 text-xl underline mx-auto'>Already Signed up?</span>
        <motion.button
          className="bg-white  text-purple-700 px-6 -right-10 py-3 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          Click to view Dashboard
        </motion.button>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-bold mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        >
          Welcome to Our Amazing Product
        </motion.h1>
        <motion.p
          className="text-xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Experience the future of learning with assistance of AI
        </motion.p>
        <motion.button
          className="bg-white text-purple-700 px-6 py-3 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </section>
  )
}