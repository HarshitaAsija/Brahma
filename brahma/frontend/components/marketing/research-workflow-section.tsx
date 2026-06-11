'use client'

import { motion } from 'framer-motion'

export default function ResearchWorkflowSection() {
  const steps = [
    {
      number: 1,
      title: 'Search Literature',
      description:
        'Find relevant papers across millions of biomedical publications.',
    },
    {
      number: 2,
      title: 'Generate Hypotheses',
      description:
        'Let AI suggest novel research directions based on patterns in the data.',
    },
    {
      number: 3,
      title: 'Explore Relationships',
      description:
        'Visualize and analyze connections between genes, diseases, drugs, and pathways.',
    },
    {
      number: 4,
      title: 'Collaborate & Publish',
      description:
        'Work with your team and AI agents to refine ideas and prepare manuscripts.',
    },
  ]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          The BRAHMA Research Workflow
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: step.number * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-full">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}