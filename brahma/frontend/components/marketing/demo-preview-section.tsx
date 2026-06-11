'use client'

import { motion } from 'framer-motion'

export default function DemoPreviewSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          See BRAHMA in Action
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl"
        >
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          >
            <source src="/demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-sm">
            Demo Video Placeholder
          </div>
        </motion.div>
      </div>
    </section>
  )
}