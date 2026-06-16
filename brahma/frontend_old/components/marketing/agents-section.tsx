'use client'

import { motion } from 'framer-motion'

export default function AgentsSection() {
  const agents = [
    {
      name: 'Literature Agent',
      description:
        'Searches and summarizes relevant biomedical literature.',
    },
    {
      name: 'Hypothesis Agent',
      description:
        'Generates and evaluates research hypotheses.',
    },
    {
      name: 'Knowledge Graph Agent',
      description:
        'Builds and navigates biological knowledge graphs.',
    },
    {
      name: 'Experiment Design Agent',
      description:
        'Assists in designing experiments and interpreting results.',
    },
  ]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          AI Agents Ready to Assist
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4 h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                {/* Placeholder for icon */}
                {agent.name.charAt(0)}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-center">{agent.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {agent.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}