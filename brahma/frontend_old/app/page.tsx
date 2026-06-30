"use client";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  return (
    <>
      {/* Animated Background */}
      <div className="anime-bg" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-gray-50">
              Accelerate Biomedical Discovery with AI
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-gray-600 md:text-xl lg:text-2xl dark:text-gray-400">
              Search literature, generate hypotheses, explore biological relationships, and collaborate with intelligent biomedical agents.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4">
              <Button className="mb-4 sm:mb-0">Start Research</Button>
              <Button variant="outline" className="mb-4 sm:mb-0">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo Preview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            See BRAHMA in Action
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Demo Card 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Literature Ingestion</CardTitle>
                  <CardDescription>
                    Seamlessly import papers from PubMed, PMC, bioRxiv, medRxiv, and PDFs with GROBID extraction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for demo visualization */}
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Demo Preview
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Demo Card 2 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>AI Research Assistant</CardTitle>
                  <CardDescription>
                    Chat with AI agents to analyze evidence, generate summaries, and build hypotheses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Demo Preview
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Demo Card 3 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Knowledge Graph</CardTitle>
                  <CardDescription>
                    Visualize and explore gene-disease-drug relationships in an interactive knowledge graph.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Demo Preview
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Powerful Features for Biomedical Research
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Semantic Search</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Find relevant papers using AI-powered semantic understanding, not just keywords.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Evidence Extraction</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Automatically extract key findings, methodologies, and conclusions from research papers.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-4 1v10m-6 0a6 6 0 0112 0c0-2-2-4-4-4s-2 2-2 4" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Hypothesis Generation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate novel research hypotheses based on literature patterns and biological relationships.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.5 0-3 .367-3.81 1.018a4.002 4.002 0 00-.579 2.18l-.002.007a4.002 4.002 0 01-1.012 1.5A4.002 4.002 0 009.18 15.01a4.002 4.002 0 01-1.11.308A4 4 0 003 12c0-2.21 1.35-4.16 3.23-5.03l1.06-.39a2 2 0 012 .62v1.59a2 2 0 002 1.59l.818.308a2 2 0 011.958.036c2.21 0 4.16-1.35 5.03-3.23l1.06-.39a2 2 0 002-.62v-1.59a2 2 0 01-2-1.59z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Collaborative Workspace</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Work with your team in real-time shared workspaces with version control and commenting.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Specialized AI Research Agents
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Agent 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Literature Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Find & Analyze Papers
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Search across millions of biomedical papers, extract key insights, and generate summaries.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• PubMed, PMC, preprint servers</li>
                    <li>• PDF processing with GROBID</li>
                    <li>• Citation network analysis</li>
                    <li>• AI-powered summarization</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent 2 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Hypothesis Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Generate Research Hypotheses
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Propose novel hypotheses based on literature gaps and biological pathways.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Disease-gene association</li>
                    <li>• Pathway analysis</li>
                    <li>• Drug repurposing opportunities</li>
                    <li>• Experimental design suggestions</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent 3 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Knowledge Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Build & Explore Knowledge Graphs
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Discover relationships between genes, diseases, drugs, and pathways.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Entity recognition & linking</li>
                    <li>• Relationship extraction</li>
                    <li>• Graph visualization</li>
                    <li>• Pathway enrichment analysis</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Knowledge Graph Preview */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Interactive Knowledge Graph Visualization
          </h2>
          <div className="kg-container">
            {/* This would be replaced with actual Cytoscape.js visualization */}
            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
              Knowledge Graph Preview
            </div>
          </div>
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Explore complex biological relationships in an intuitive, interactive graph interface.
          </p>
        </div>
      </section>

      {/* Research Workflow */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Streamlined Research Workflow
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-bold">1</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Discover</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Search and ingest relevant biomedical literature from multiple sources.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-bold">2</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Analyze</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Extract evidence, identify patterns, and generate hypotheses with AI assistance.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-bold">3</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Validate</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Build knowledge graphs to visualize relationships and validate findings.
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4 w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-bold">4</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Collaborate</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Share workspaces, discuss findings, and co-author research papers with your team.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Trusted by Researchers Worldwide
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border-none bg-gray-50 dark:bg-gray-800">
                <CardContent>
                  <p className="italic text-gray-600 dark:text-gray-300">
                    "BRAHMA has transformed our literature review process, reducing weeks of work to days."
                  </p>
                  <p className="mt-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    — Dr. Sarah Chen, Lead Bioinformatician
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full border-none bg-gray-50 dark:bg-gray-800">
                <CardContent>
                  <p className="italic text-gray-600 dark:text-gray-300">
                    "The AI agents have helped us discover novel gene-disease associations we would have missed."
                  </p>
                  <p className="mt-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    — Prof. Michael Rodriguez, Principal Investigator
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full border-none bg-gray-50 dark:bg-gray-800">
                <CardContent>
                  <p className="italic text-gray-600 dark:text-gray-300">
                    "The knowledge graph visualization has become an essential tool for our team meetings."
                  </p>
                  <p className="mt-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    — Dr. Amina Patel, Senior Research Scientist
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Accelerate Your Research?</h2>
          <p className="mb-8 text-lg leading-relaxed">
            Join thousands of researchers who are already using BRAHMA to make breakthrough discoveries faster.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4">
            <Button className="mb-4 sm:mb-0 bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button variant="outline" className="mb-4 sm:mb-0">
              Request Demo
            </Button>
          </div>
          <p className="mt-8 text-sm text-white/80">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>
    </>
  );
}
