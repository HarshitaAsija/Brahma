import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Motion } from 'framer-motion';
import { useState } from 'react';

export default function ResearchWorkspacePage() {
  const [tabValue, setTabValue] = useState('notes');
  const [notesContent, setNotesContent] = useState('# My Research Notes\n\n## Introduction\n\nThis is a sample research note.');
  const [literatureQuery, setLiteratureQuery] = useState('');
  const [hypothesisInput, setHypothesisInput] = useState('');
  const [aiDiscussion, setAiDiscussion] = useState('');

  // Mock data for each tab
  const mockLiterature = [
    {
      id: 1,
      title: 'APOE4 genotype influences amyloid-beta clearance in Alzheimer\'s disease',
      authors: ['Smith, J.', 'Doe, A.', 'Johnson, L.'],
      journal: 'Nature Neuroscience',
      year: 2024,
    },
    {
      id: 2,
      title: 'BRCA1 mutations and genomic instability in triple-negative breast cancer',
      authors: ['Williams, K.', 'Brown, M.'],
      journal: 'Cell Reports',
      year: 2023,
    },
  ];

  const mockHypotheses = [
    {
      id: 1,
      content: 'APOE4 genotype leads to reduced amyloid-beta clearance efficiency, resulting in increased amyloid plaque accumulation in Alzheimer\'s disease.',
      confidence: 0.85,
    },
    {
      id: 2,
      content: 'Therapeutic upregulation of LDL receptor-related protein 1 (LRP1) could compensate for APOE4-related clearance deficits.',
      confidence: 0.72,
    },
  ];

  const mockAiDiscussion = [
    {
      id: 1,
      content: 'Based on the literature, APOE4 appears to impair amyloid-beta clearance through multiple mechanisms including reduced LRP1 expression and increased heparan sulfate proteoglycan binding.',
      isUser: false,
    },
    {
      id: 2,
      content: 'Would you like me to design an experiment to test the LRP1 upregulation hypothesis?',
      isUser: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Research Workspace
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl text-center">
          A flexible workspace to organize your research notes, literature, hypotheses, and AI-assisted discussions.
        </p>
      </div>

      {/* Tabs */}
      <Motion
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="notes" className="w-space">
          <TabsList className="grid w-full grid-cols-5 border-b">
            <TabsTrigger value="notes" className="flex h-10 w-full items-center justify-between text-sm font-medium transition-all border-b-2 hover:border-indigo-500 hover:text-indigo-600">
              Notes
            </TabsTrigger>
            <TabsTrigger value="literature" className="flex h-10 w-full items-center justify-between text-sm font-medium transition-all border-b-2 hover:border-indigo-500 hover:text-indigo-600">
              Literature
            </TabsTrigger>
            <TabsTrigger value="knowledge-graph" className="flex h-10 w-full items-center justify-between text-sm font-medium transition-all border-b-2 hover:border-indigo-500 hover:text-indigo-600">
              Knowledge Graph
            </TabsTrigger>
            <TabsTrigger value="hypotheses" className="flex h-10 w-full items-center justify-between text-sm font-medium transition-all border-b-2 hover:border-indigo-500 hover:text-indigo-600">
              Hypotheses
            </TabsTrigger>
            <TabsTrigger value="ai-discussions" className="flex h-10 w-full items-center justify-between text-sm font-medium transition-all border-b-2 hover:border-indigo-500 hover:text-indigo-600">
              AI Discussions
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="pt-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex-1 min-h-[300px]">
                <label className="sr-only" htmlFor="notes-editor">
                  Notes Editor
                </label>
                <Textarea
                  id="notes-editor"
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Start writing your research notes here..."
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" size="xs">
                  Export Notes
                </Button>
                <Button className="xs">
                  Save Notes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Literature Tab */}
          <TabsContent value="literature" className="pt-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Search literature in workspace..."
                  className="flex-1 pl-3 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={literatureQuery}
                  onChange={(e) => setLiteratureQuery(e.target.value)}
                />
                <Button variant="outline" size="xs">
                  Search
                </Button>
              </div>
              <div className="flex-1 min-h-[300px] space-y-3 overflow-y-auto">
                {mockLiterature.map((paper) => (
                  <Motion
                    key={paper.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {paper.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {paper.authors.join(', ')} • {paper.journal} • {paper.year}
                        </p>
                        <div className="flex items-center space-x-3">
                          <Button variant="outline" size="xs" className="flex items-center space-x-1">
                            Read Abstract
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </Button>
                          <Button variant="outline" size="xs" className="flex items-center space-x-1">
                            Save to Notes
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7.4a5.88 5.88 0 00-1.6-2.1l-.4-.6a2 2 0 00-.6-.6 2 2 0 00-2 2v12.2a2 2 0 002 2h7.2A2 2 0 0017 14.4l.4-.6a5.88 5.88 0 001.6-2.1l-1.6-2.1a5.88 5.88 0 00-2.1-1.6z" />
                            </svg>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Motion>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="knowledge-graph" className="pt-4">
            <div className="kg-container">
              <div className="relative w-full h-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Knowledge Graph Preview
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    Interactive knowledge graph showing relationships between entities in your workspace.
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline">
                      View Full Graph
                    </Button>
                    <Button className="ml-2">
                      Export as PNG
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Hypotheses Tab */}
          <TabsContent value="hypotheses" className="pt-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter a new hypothesis..."
                  className="flex-1 pl-3 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={hypothesisInput}
                  onChange={(e) => setHypothesisInput(e.target.value)}
                />
                <Button onClick={() => {
                  // Add hypothesis logic would go here
                  console.log('Adding hypothesis:', hypothesisInput);
                  setHypothesisInput('');
                }}>
                  Add Hypothesis
                </Button>
              </div>
              <div className="flex-1 min-h-[300px] space-y-3 overflow-y-auto">
                {mockHypotheses.map((hypothesis) => (
                  <Motion
                    key={hypothesis.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          Research Hypothesis
                        </h3>
                        <Badge
                          variant={hypothesis.confidence >= 0.9 ? 'secondary' : hypothesis.confidence >= 0.8 ? 'default' : 'destructive'}
                        >
                          {(hypothesis.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </CardHeader>
                      <CardContent className="mt-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {hypothesis.content}
                        </p>
                        <div className="mt-3 flex items-center space-x-3">
                          <Button variant="outline" size="xs" className="flex items-center space-x-1">
                            Test with Literature
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </Button>
                          <Button variant="outline" size="xs" className="flex items-center space-x-1">
                            Save to Notes
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7.4a5.88 5.88 0 00-1.6-2.1l-.4-.6a2 2 0 00-.6-.6 2 2 0 00-2 2v12.2a2 2 0 002 2h7.2A2 2 0 0017 14.4l.4-.6a5.88 5.88 0 001.6-2.1l-1.6-2.1a5.88 5.88 0 00-2.1-1.6z" />
                            </svg>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Motion>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AI Discussions Tab */}
          <TabsContent value="ai-discussions" className="pt-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex-1 min-h-[300px] space-y-3 overflow-y-auto">
                {mockAiDiscussion.map((discussion, index) => (
                  <Motion
                    key={discussion.id}
                    initial={{ x: discussion.isUser ? 20 : -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: discussion.isUser ? 20 : -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`flex ${discussion.isUser ? 'justify-end' : 'justify-start'} items-start space-y-2`}>
                      {!discussion.isUser && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.5 0-3 .367-3.81 1.018a4.002 4.002 0 00-.579 2.18l-.002.007a4.002 4.002 0 01-1.012 1.5A4.002 4.002 0 009.18 15.01a4.002 4.002 0 01-1.11.308A4 4 0 003 12c0-2.21 1.35-4.16 3.23-5.03l1.06-.39a2 2 0 012 .62v1.59a2 2 0 002 1.59l.818.308a2 2 0 011.958.036c2.21 0 4.16-1.35 5.03-3.23l1.06-.39a2 2 0 002-.62v-1.59a2 2 0 01-2-1.59z" />
                          </svg>
                        </div>
                      )}
                      <div className="max-w-xl">
                        <div className="flex items-center space-x-2 mb-1">
                          {!discussion.isUser && (
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                BRAHMA Assistant
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          )}
                          {discussion.isUser && (
                            <>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                You
                              </p>
                            </>
                          )}
                        </div>
                        <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-w-xs ${
                          discussion.isUser ? 'ml-auto' : ''
                        }`}>
                          <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                            {discussion.content}
                          </p>
                        </div>
                      </div>
                      {discussion.isUser && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M9 12V3m0 0L3 3m0 0l-3 6m0 0l3 6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Motion>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="text"
                  placeholder="Ask BRAHMA about your research..."
                  className="flex-1 pl-3 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={aiDiscussion}
                  onChange={(e) => setAiDiscussion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && {
                    // Send message logic would go here
                    console.log('Sending message:', aiDiscussion);
                    setAiDiscussion('');
                  }}
                />
                <Button onClick={() => {
                  // Send message logic would go here
                  console.log('Sending message:', aiDiscussion);
                  setAiDiscussion('');
                }}>
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Motion>
    </div>
  );
}