'use client'

import { motion } from 'framer-motion'

export default function FeaturesSection() {
  const features = [
    {
      title: 'Literature Search & Analysis',
      description:
        'Search, filter, and analyze biomedical literature from PubMed, PMC, bioRxiv, and medRxiv.',
    },
    {
      title: 'AI-Powered Hypothesis Generation',
      description:
        'Generate novel biomedical research hypotheses with supporting evidence and confidence scoring.',
    },
    {
      title: 'Interactive Knowledge Graph Exploration',
      description:
        'Visualize relationships between genes, diseases, proteins, drugs, pathways, and publications.',
    },
    {
      title: 'Collaborative AI Research Agents',
      description:
        'Work with specialized AI agents for literature review, evidence synthesis, hypothesis generation, and research planning.',
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Powerful Features for Biomedical Research
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {/* Placeholder for icon */}
                {feature.title.charAt(0)}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}