'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Motion } from 'framer-motion';
import { useState } from 'react';

export default function HypothesisGeneratorPage() {
  const [researchTopic, setResearchTopic] = useState('');
  const [disease, setDisease] = useState('');
  const [gene, setGene] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hypotheses, setHypotheses] = useState([]);
  const [generatedAt, setGeneratedAt] = useState('');

  const diseases = [
    'Alzheimer\'s Disease',
    'Parkinson\'s Disease',
    'Cancer',
    'Diabetes',
    'COVID-19',
    'HIV',
    'Malaria',
    'Tuberculosis',
  ];

  const genes = [
    'APOE',
    'APP',
    'PSEN1',
    'PSEN2',
    'BRCA1',
    'BRCA2',
    'TP53',
    'EGFR',
    'KRAS',
    'HER2',
  ];

  // Mock hypothesis generation
  const handleGenerateHypotheses = () => {
    if (!researchTopic && !disease && !gene && !keywords) {
      alert('Please enter at least one search parameter');
      return;
    }

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const generatedHypotheses = [
        {
          id: 1,
          content: `The ${gene || 'target gene'} mediates the relationship between ${disease || 'the disease'} and ${researchTopic || 'the research topic'} through modulation of ${keywords || 'key pathways'}.`,
          confidence: 0.82 + Math.random() * 0.15, // Random confidence between 0.82 and 0.97
          evidence: [
            {
              id: 1,
              title: `Role of ${gene || 'target gene'} in ${disease || 'disease'} pathogenesis`,
              authors: ['Smith, J.', 'Lee, K.'],
              journal: 'Nature',
              year: 2023,
              relevance: 0.94,
            },
            {
              id: 2,
              title: `${keywords || 'Target pathway'} dysregulation in ${disease || 'disease'}`,
              authors: ['Johnson, L.', 'Wang, Y.'],
              journal: 'Cell',
              year: 2024,
              relevance: 0.88,
            },
          ],
          relatedPublications: [
            {
              id: 1,
              title: `Comprehensive review of ${gene || 'target gene'} functions`,
              authors: ['Brown, M.'],
              journal: 'Annual Review of Biochemistry',
              year: 2022,
            },
            {
              id: 2,
              title: `${disease || 'Disease'}: Mechanisms and Therapeutic Approaches`,
              authors: ['Davis, R.'],
              journal: 'Lancet',
              year: 2023,
            },
          ],
        },
        {
          id: 2,
          content: `Epigenetic modifications of ${gene || 'target gene'} promoters contribute to ${disease || 'disease'} susceptibility in individuals with specific ${keywords || 'genetic backgrounds'}.`,
          confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75 and 0.95
          evidence: [
            {
              id: 3,
              title: `Epigenetic regulation of ${gene || 'target gene'} in ${disease || 'disease'}`,
              authors: ['Chen, L.', 'Wang, Q.'],
              journal: 'Cell Reports',
              year: 2024,
              relevance: 0.91,
            },
          ],
          relatedPublications: [
            {
              id: 3,
              title: `Epigenetics of ${disease || 'disease'}`,
              authors: ['Taylor, S.'],
              journal: 'Nature Reviews Genetics',
              year: 2023,
            },
          ],
        },
      ];

      setHypotheses(generatedHypotheses);
      setGeneratedAt(new Date().toLocaleString());
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Hypothesis Generator
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl text-center">
          Generate novel research hypotheses based on your input parameters using AI-powered literature analysis.
        </p>
      </div>

      {/* Input Section */}
      <Motion
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Research Parameters
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Research Topic */}
              <div>
                <Label htmlFor="research-topic" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Research Topic (optional)
                </Label>
                <Input
                  id="research-topic"
                  type="text"
                  placeholder="Enter your research topic or question..."
                  className="mt-1 block w-full"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                />
              </div>

              {/* Disease */}
              <div>
                <Label htmlFor="disease" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Disease
                </Label>
                <Select defaultValue="Select a disease" onValueChange={setDisease}>
                  <SelectTrigger>
                    <SelectValue placeholder={disease} />
                  </SelectTrigger>
                  <SelectContent>
                    {diseases.map((diseaseOption) => (
                      <SelectItem key={diseaseOption} value={diseaseOption}>
                        {diseaseOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gene */}
              <div>
                <Label htmlFor="gene" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Gene
                </Label>
                <Select defaultValue="Select a gene" onValueChange={setGene}>
                  <SelectTrigger>
                    <SelectValue placeholder={gene} />
                  </SelectTrigger>
                  <SelectContent>
                    {genes.map((geneOption) => (
                      <SelectItem key={geneOption} value={geneOption}>
                        {geneOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Keywords */}
              <div>
                <Label htmlFor="keywords" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Keywords (optional)
                </Label>
                <Input
                  id="keywords"
                  type="text"
                  placeholder="Enter relevant keywords or pathways..."
                  className="mt-1 block w-full"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={handleGenerateHypotheses} className="w-64" disabled={isGenerating}>
                {isGenerating ? 'Generating Hypotheses...' : 'Generate Hypotheses'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Motion>

      {/* Output Section */}
      {hypotheses.length > 0 && (
        <Motion
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Generated Hypotheses
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Generated at: {generatedAt}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {hypotheses.map((hypothesis, index) => (
                <Motion
                  key={hypothesis.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Research Hypothesis #{index + 1}
                      </h3>
                      <Badge
                        variant={hypothesis.confidence >= 0.9 ? 'secondary' : hypothesis.confidence >= 0.8 ? 'default' : 'destructive'}
                      >
                        {(hypothesis.confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {hypothesis.content}
                      </p>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Supporting Evidence
                        </h3>
                        <div className="space-y-3">
                          {hypothesis.evidence.map((evidence, evIndex) => (
                                            <div
                                              key={evidence.id}
                                              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                  {evidence.title}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                  {evidence.authors.join(', ')} • {evidence.journal} • {evidence.year}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                  Relevance: {(evidence.relevance * 100).toFixed(0)}%
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Related Publications
                        </h3>
                        <div className="space-y-2">
                          {hypothesis.relatedPublications.map((pub, pubIndex) => (
                                            <div
                                              key={pub.id}
                                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                              <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                {pub.title}
                                              </p>
                                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {pub.authors.join(', ')} • {pub.journal} • {pub.year}
                                              </p>
                                            </div>
                                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-3">
                        <Button variant="outline" size="xs" className="flex items-center space-x-1">
                          Save to Workspace
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7.4a5.88 5.88 0 00-1.6-2.1l-.4-.6a2 2 0 00-.6-.6 2 2 0 00-2 2v12.2a2 2 0 002 2h7.2A2 2 0 0017 14.4l.4-.6a5.88 5.88 0 001.6-2.1l-1.6-2.1a5.88 5.88 0 00-2.1-1.6z" />
                          </svg>
                        </Button>
                        <Button variant="outline" size="xs" className="flex items-center space-x-1">
                          Export Hypothesis
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 012-2M9 5a2 2 0 002-2h2a2 2 0 002 2" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Motion>
              ))}
            </CardContent>
          </Card>
        </Motion>
      )}
    </div>
  );
}