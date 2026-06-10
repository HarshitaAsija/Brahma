'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Motion } from 'framer-motion';
import { MessageCircle, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export default function AIResearchAssistantPage() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hello! I\'m your BRAHMA research assistant. How can I help you with your biomedical research today?',
      isUser: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      content: 'I want to investigate the relationship between APOE4 genotype and Alzheimer\'s disease progression.',
      isUser: true,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    },
    {
      id: 3,
      content: 'Let me search the literature for recent studies on APOE4 and Alzheimer\'s disease...',
      isUser: false,
      timestamp: new Date(Date.now() - 90 * 1000).toISOString(), // 90 seconds ago
      isLoading: true,
    },
  ]);

  const researchThreads = [
    { id: 1, title: 'APOE4 and Alzheimer\'s Disease', updated: 'Today' },
    { id: 2, title: 'CRISPR Therapeutics for Sickle Cell', updated: 'Yesterday' },
    { id: 3, title: 'COVID-19 Long-term Effects', updated: '2 days ago' },
  ];

  const savedConversations = [
    { id: 1, title: 'APOE4 Discussion', date: 'Today' },
    { id: 2, title: 'Cancer Biomarkers Review', date: 'Yesterday' },
    { id: 3, title: 'Neurodegeneration Pathways', date: '3 days ago' },
  ];

  const projects = [
    { id: 1, name: 'Neurodegeneration Project', status: 'Active' },
    { id: 2, name: 'Cancer Genomics Initiative', status: 'Active' },
    { id: 3, name: 'Infectious Disease Surveillance', status: 'Completed' },
  ];

  // Mock evidence and citations
  const evidenceSources = [
    {
      id: 1,
      title: 'APOE4 exacerbates tau-mediated neurodegeneration in mouse models of Alzheimer\'s disease',
      authors: ['Smith, J.', 'Lee, K.'],
      journal: 'Nature',
      year: 2023,
      confidence: 0.92,
    },
    {
      id: 2,
      title: 'Association of APOE4 with cognitive decline in Alzheimer\'s disease',
      authors: ['Johnson, L.', 'Wang, Y.'],
      journal: 'JAMA Neurology',
      year: 2024,
      confidence: 0.88,
    },
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: chatInput,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        content: `I've found 15 relevant papers on APOE4 and Alzheimer's disease. The strongest evidence shows that APOE4 genotype is associated with increased amyloid-beta accumulation and tau phosphorylation. Would you like me to: 1) Generate a hypothesis about the mechanism, 2) Create a knowledge graph visualization, or 3) Summarize the top 5 papers?`,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, aiMessage]);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex-shrink-0 flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            BRAHMA Assistant
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <section>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Research Threads
            </h3>
            <div className="space-y-2">
              {researchThreads.map((thread) => (
                <div key={thread.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Sparkles className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {thread.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {thread.updated}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <Separator className="my-4" />
          <section>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Saved Conversations
            </h3>
            <div className="space-y-2">
              {savedConversations.map((conv) => (
                <div key={conv.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {conv.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <Separator className="my-4" />
          <section>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Projects
            </h3>
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </p>
                    <Badge variant={project.status === 'Active' ? 'secondary' : 'destructive'} className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Research Conversation
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" aria-label="New conversation">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Settings">
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <Motion
              key={message.id}
              initial={{ x: message.isUser ? 20 : -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: message.isUser ? 20 : -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start`}>
                {!message.isUser && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}
                <div className="max-w-xl">
                  <div className="flex items-center space-x-2 mb-1">
                    {!message.isUser && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          BRAHMA Assistant
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    )}
                    {message.isUser && (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          You
                        </p>
                      </>
                    )}
                  </div>
                  <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-w-xs ${
                    message.isUser ? 'ml-auto' : ''
                  }`}>
                    <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                      {message.content}
                    </p>
                    {message.isLoading && (
                      <div className="mt-2 flex h-2 w-20 items-center justify-between">
                        <div className="w-1/3 bg-blue-500 h-0.5 rounded" />
                        <div className="w-1/3 bg-blue-500 h-0.5 rounded" />
                        <div className="w-1/3 bg-blue-500 h-0.5 rounded" />
                      </div>
                    )}
                  </div>
                </div>
                {message.isUser && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
            </Motion>
          ))}
          <div className="absolute bottom-0 left-0 right-0 bottom-[calc(100%+4.5rem)]">
            <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Ask BRAHMA about your research..."
                className="flex-1 pl-3 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="px-4">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex-shrink-0 flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Evidence & Insights
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Evidence Sources */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Supporting Evidence
            </h3>
            {evidenceSources.map((evidence) => (
                <Motion
                  key={evidence.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-col">
                      <CardTitle className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {evidence.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {evidence.authors.join(', ')} • {evidence.journal} • {evidence.year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            This study demonstrates a strong association between APOE4 genotype and Alzheimer\'s disease pathology.
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium">
                              Confidence:
                            </span>
                            <Badge
                              variant={evidence.confidence >= 0.9 ? 'secondary' : evidence.confidence >= 0.8 ? 'default' : 'destructive'}
                            >
                              {(evidence.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Motion>
              ))}
          </div>
          {/* Citations */}
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Citations
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smith J, Lee K. APOE4 exacerbates tau-mediated neurodegeneration in mouse models of Alzheimer\'s disease. Nature. 2023;456(7890):123-135.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Johnson L, Wang Y. Association of APOE4 with cognitive decline in Alzheimer\'s disease. JAMA Neurol. 2024;81(2):145-152.
              </p>
            </div>
          </div>
          {/* Confidence Score */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Analysis Confidence
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Confidence</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Based on 15 sources</span>
                <span>Last updated: 2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}