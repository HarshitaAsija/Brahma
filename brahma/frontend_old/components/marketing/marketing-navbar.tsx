'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function MarketingNavbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 flex flex-col items-start md:flex-row md:justify-between md:items-center py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-3 mb-4 md:mb-0"
        >
          <span className="text-2xl font-bold text-blue-600">BRAHMA</span>
        </motion.div>
        <div className="hidden md:flex space-x-6">
          <motion.a
            href="#features"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            Features
          </motion.a>
          <motion.a
            href="#agents"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            AI Agents
          </motion.a>
          <motion.a
            href="#knowledge-graph"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            Knowledge Graph
          </motion.a>
          <motion.a
            href="#workflow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            Research Workflow
          </motion.a>
        </div>
      </div>
    </nav>
  )
}