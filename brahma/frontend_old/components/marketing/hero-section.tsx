'use client'

import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 pt-20 pb-16 md:pb-24 lg:pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Accelerate Biomedical Discovery with AI
        </h1>
        <p className="mt-4 text-xl text-white/90 max-w-2xl">
          Search literature, generate hypotheses, explore biological relationships, and collaborate with intelligent biomedical agents.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 from-indigo-600 to-purple-600 hover:from-blue-500 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-transform"
          >
            Start Research
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 sm:flex-none px-6 py-3 border border-white/20 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg transition-transform"
          >
            Watch Demo
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}