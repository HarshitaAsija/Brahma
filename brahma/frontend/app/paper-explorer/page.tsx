'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PaperExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedJournal, setSelectedJournal] = useState('All Journals');
  const [selectedAccess, setSelectedAccess] = useState('All Access');
  const [sortBy, setSortBy] = useState('Relevance');
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const years = ['All Years', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];
  const journals = ['All Journals', 'Nature', 'Science', 'Cell', 'NEJM', 'Lancet', 'JAMA', 'PLOS Biology', 'Cell Reports'];
  const accessTypes = ['All Access', 'Open Access', 'Subscription Required'];

  // Mock data for papers
  const mockPapers = [
    {
      id: 1,
      title: 'APOE4 genotype influences amyloid-beta clearance in Alzheimer\'s disease',
      authors: ['Smith, J.', 'Doe, A.', 'Johnson, L.', 'Brown, K.'],
      journal: 'Nature Neuroscience',
      year: 2024,
      abstract: 'We investigated the role of APOE4 in amyloid-beta clearance using longitudinal PET imaging and CSF biomarkers in a cohort of 500 patients with mild cognitive impairment...',
      doi: '10.1038/s41593-024-01623-4',
      pmid: '38456789',
      citationCount: 12,
      accessType: 'Open Access',
      keywords: ['APOE4', 'amyloid-beta', 'clearance', 'Alzheimer\'s disease', 'PET imaging'],
    },
    {
      id: 2,
      title: 'BRCA1 mutations and genomic instability in triple-negative breast cancer',
      authors: ['Williams, K.', 'Brown, M.', 'Davis, R.'],
      journal: 'Cell Reports',
      year: 2023,
      abstract: 'Triple-negative breast cancer (TNBC) exhibits high genomic instability due to defective DNA repair mechanisms. We performed whole-genome sequencing on 200 TNBC tumors...',
      doi: '10.1016/j.celrep.2023.112834',
      pmid: '37890123',
      citationCount: 8,
      accessType: 'Subscription Required',
      keywords: ['BRCA1', 'triple-negative breast cancer', 'genomic instability', 'DNA repair'],
    },
    {
      id: 3,
      title: 'SARS-CoV-2 spike protein interactions with ACE2 receptor variants',
      authors: ['Chen, L.', 'Wang, Y.', 'Zhang, Q.'],
      journal: 'Science',
      year: 2024,
      abstract: 'The SARS-CoV-2 spike protein binds to the ACE2 receptor with high affinity, facilitating viral entry into host cells. We used cryo-EM to determine the structure of the spike-ACE2 complex...',
      doi: '10.1126/science.adk1234',
      pmid: '38123456',
      citationCount: 25,
      accessType: 'Open Access',
      keywords: ['SARS-CoV-2', 'spike protein', 'ACE2', 'viral entry', 'cryo-EM'],
    },
    {
      id: 4,
      title: 'The role of neuroinflammation in Alzheimer\'s disease progression',
      authors: ['Taylor, S.', 'Miller, J.'],
      journal: 'Lancet Neurology',
      year: 2023,
      abstract: 'Neuroinflammation is a key feature of Alzheimer\'s disease pathology, contributing to neuronal loss and cognitive decline. We reviewed the current evidence on microglial activation...',
      doi: '10.1016/S1474-4422(23)00123-4',
      pmid: '37567890',
      citationCount: 18,
      accessType: 'Subscription Required',
      keywords: ['neuroinflammation', 'Alzheimer\'s disease', 'microglia', 'cytokines', 'cognitive decline'],
    },
  ];

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPapers(mockPapers);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Paper Explorer
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl text-center">
          Advanced publication explorer with semantic search, citation networks, and AI-powered insights.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Search Box */}
        <div className="col-span-full md:col-span-2">
          <div className="flex space-x-3">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by keyword, title, author, DOI, PMID..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch} className="px-6">
              Search
            </Button>
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <Label htmlFor="year-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Year
          </Label>
          <Select defaultValue="All Years" onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder={selectedYear} />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Journal Filter */}
        <div>
          <Label htmlFor="journal-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Journal
          </Label>
          <Select defaultValue="All Journals" onValueChange={setSelectedJournal}>
            <SelectTrigger>
              <SelectValue placeholder={selectedJournal} />
            </SelectTrigger>
            <SelectContent>
              {journals.map((journal) => (
                <SelectItem key={journal} value={journal}>
                  {journal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Access Type Filter */}
        <div>
          <Label htmlFor="access-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Access Type
          </Label>
          <Select defaultValue="All Access" onValueChange={setSelectedAccess}>
            <SelectTrigger>
              <SelectValue placeholder={selectedAccess} />
            </SelectTrigger>
            <SelectContent>
              {accessTypes.map((access) => (
                <SelectItem key={access} value={access}>
                  {access}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <Label htmlFor="sort-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Sort By
          </Label>
          <Select defaultValue="Relevance" onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder={sortBy} />
            </SelectTrigger>
            <SelectContent>
              ['Relevance', 'Date (Newest)', 'Date (Oldest)', 'Citation Count'].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4">
        <Button variant="outline" size="xs">
          Export Results
        </Button>
        <Button variant="outline" size="xs">
          Save Search
        </Button>
        <Button className="ml-2">
          New Search
        </Button>
      </div>

      {/* Papers List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Loading papers...
              </span>
            </div>
          </div>
        ) : papers.length > 0 ? (
          <div className="space-y-4">
            {papers.map((paper) => (
              <motion.div
                key={paper.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {paper.title}
                        </h2>
                        <div className="flex items-center space-x-2 text-sm">
                          <Badge variant={paper.accessType === 'Open Access' ? 'secondary' : 'destructive'} className="px-2 py-0.5">
                            {paper.accessType}
                          </Badge>
                          <Badge variant="outline" className="px-2 py-0.5">
                            {paper.citationCount} Citations
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {paper.authors.join(', ')} • {paper.journal} • {paper.year}
                      </p>
                      {paper.doi && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          DOI: {paper.doi}
                        </p>
                      )}
                      {paper.pmid && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          PMID: {paper.pmid}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Button variant="outline" size="xs" className="flex items-center space-x-1">
                        Save to Workspace
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7.4a5.88 5.88 0 00-1.6-2.1l-.4-.6a2 2 0 00-.6-.6 2 2 0 00-2 2v12.2a2 2 0 002 2h7.2A2 2 0 0017 14.4l.4-.6a5.88 5.88 0 001.6-2.1l-1.6-2.1a5.88 5.88 0 00-2.1-1.6z" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="xs" className="flex items-center space-x-1">
                        Export Citation
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 012 2h2a2 2 0 012-2M9 5a2 2 0 002-2h2a2 2 0 002 2" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="xs" className="flex items-center space-x-1">
                        View Abstract
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                      {paper.abstract}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {paper.keywords.map((keyword) => (
                        <span key={keyword} className="bg-gray-200 dark:bg-gray-700 text-xs font-medium px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center space-x-3">
                      <Button className="flex items-center space-x-2">
                        View Full Text
                      </Button>
                      <Button variant="outline" className="flex items-center space-x-2">
                        Find Related Papers
                      </Button>
                      <Button variant="outline" className="flex items-center space-x-2">
                        Analyze Citations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No papers found. Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>

      {/* Citation Network Preview (placeholder) */}
      <div className="mt-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Citation Network Analysis
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore how papers cite each other to identify influential research and emerging trends.
            </p>
            <div className="kg-container">
              <div className="relative w-full h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Citation Network
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    Interactive visualization of paper citations and references.
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline">
                      Explore Network
                    </Button>
                    <Button className="ml-2">
                      Export as PNG
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}