'use client'

import { motion } from 'framer-motion'

export default function KnowledgeGraphPreviewSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Knowledge Graph Preview
        </h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="relative aspect-w-1 aspect-h-1 rounded-xl overflow-hidden shadow-2xl"
          data-testid="knowledge-graph-preview"
        >
          {/* Simple animated placeholder for knowledge graph */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-medium">
            Interactive Knowledge Graph
          </div>
          <div className="absolute inset-0 pointer-events-none">
            {/* Animated nodes and links would go here */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2 h-2 w-2 bg-white rounded-full"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={[
                { x: -20, y: -20, opacity: 0.6 },
                { x: 20, y: 10, opacity: 0.8 },
                { x: 0, y: -30, opacity: 0.4 },
                { x: 0, y: 0, opacity: 0 }
              ]}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            {/* More nodes */}
          </div>
        </motion.div>
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 max-w-2xl">
          Explore complex biological relationships in an interactive visualization
        </p>
      </div>
    </section>
  )
}