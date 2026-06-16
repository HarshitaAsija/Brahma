import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { Activity, BarChart3, Clock, Database, MessageCircle, Share2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Dashboard() {
  const [researchQuery, setResearchQuery] = useState('');

  const recentProjects = [
    {
      id: 1,
      name: 'Alzheimer\'s Disease Mechanism Study',
      lastModified: '2 hours ago',
      status: 'active',
      progress: 75,
    },
    {
      id: 2,
      name: 'CRISPR-Cas9 Off-Target Analysis',
      lastModified: '1 day ago',
      status: 'completed',
      progress: 100,
    },
    {
      id: 3,
      name: 'COVID-19 Variant Spike Protein Interaction',
      lastModified: '3 days ago',
      status: 'active',
      progress: 45,
    },
  ];

  const stats = [
    {
      label: 'Papers Ingested',
      value: '1,245',
      icon: Database,
      color: 'blue',
    },
    {
      label: 'Genes Indexed',
      value: '18,430',
      icon: User,
      color: 'green',
    },
    {
      label: 'Diseases Indexed',
      value: '2,150',
      icon: Share2,
      color: 'purple',
    },
    {
      label: 'Knowledge Graph Nodes',
      value: '45,620',
      icon: Activity,
      color: 'orange',
    },
    {
      label: 'Knowledge Graph Relationships',
      value: '128,900',
      icon: MessageCircle,
      color: 'red',
    },
  };
  return (
    <div className="space-y-8">
      {/* Header with quick search */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start sm:items-center sm:flex-row">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Research Dashboard
          </div>
          <div className="mt-4 sm:mt-0 sm:flex-1 sm:max-w-xl sm:ml-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search literature, genes, diseases..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Widget A: Research Assistant Chat */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Research Assistant
              </h2>
              <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                New Conversation
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 overflow-y-auto">
                {/* Chat messages */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="ml-3 max-w-xs">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        Hello! I'm your BRAHMA research assistant. How can I help you today?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <div className="ml-3 max-w-xs">
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 inline-block">
                        I need to find recent papers on Alzheimer's disease and APOE4 gene interactions.
                      </p>
                    </div>
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700/50 flex items-center justify-center">
                      <Activity className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                  <div className="ml-3 max-w-xs">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                        I'll help you search for recent literature on Alzheimer's disease and APOE4 interactions. Let me start by querying PubMed and other sources.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 pl-3 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button variant="outline" size="sm" className="px-3">
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget B: Recent Research Projects */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Projects
              </h2>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last modified: {project.lastModified}
                      </p>
                    </div>
                    <Badge
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {project.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs flex justify-between text-gray-500 dark:text-gray-400">
                    <span>{project.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="xs" className="mt-2">
                View All
              </Button>
              <Button size="xs" className="mt-2">
                New Project
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Widget C: Literature Statistics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Literature Statistics
              </h2>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="mb-3 w-10 h-10 rounded-lg flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Widget D: Research Activity Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Research Activity
              </h2>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {researchActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700/50 flex items-center justify-center">
                      {activity.user.includes('Dr.') || activity.user.includes('Prof.') ? (
                        <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Activity className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time} • {activity.user}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="pt-4 text-center">
                <Button variant="outline" size="xs" className="text-xs">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}