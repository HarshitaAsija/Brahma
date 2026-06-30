'use client'

import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold text-white">
            Ready to Accelerate Your Research?
          </h2>
          <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
            Start your biomedical discovery journey today with BRAHMA\'s intelligent agents
          </p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg transition-transform"
        >
          Start Research
        </motion.button>
      </div>
    </section>
  )
}