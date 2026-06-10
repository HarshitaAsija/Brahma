'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Motion } from 'framer-motion';
import { useState } from 'react';

export default function LiteratureIngestionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedJournal, setSelectedJournal] = useState('All Journals');
  const [selectedDisease, setSelectedDisease] = useState('All Diseases');
  const [selectedGene, setSelectedGene] = useState('All Genes');
  const [selectedAuthor, setSelectedAuthor] = useState('All Authors');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [papers, setPapers] = useState([]);

  const years = ['All Years', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
  const journals = ['All Journals', 'Nature', 'Science', 'Cell', 'NEJM', 'Lancet', 'JAMA'];
  const diseases = ['All Diseases', 'Alzheimer\'s Disease', 'Cancer', 'Diabetes', 'COVID-19'];
  const genes = ['All Genes', 'APOE', 'BRCA1', 'BRCA2', 'TP53', 'EGFR'];
  const authors = ['All Authors', 'Smith, J.', 'Doe, A.', 'Johnson, L.', 'Williams, K.'];

  // Mock data for papers
  const mockPapers = [
    {
      id: 1,
      title: 'APOE4 genotype influences amyloid-beta clearance in Alzheimer\'s disease',
      authors: ['Smith, J.', 'Doe, A.', 'Johnson, L.'],
      journal: 'Nature Neuroscience',
      year: 2024,
      abstract: 'We investigated the role of APOE4 in amyloid-beta clearance using PET imaging and CSF biomarkers in a cohort of 500 patients...',
      citationCount: 12,
      status: 'ingested',
    },
    {
      id: 2,
      title: 'BRCA1 mutations and genomic instability in triple-negative breast cancer',
      authors: ['Williams, K.', 'Brown, M.'],
      journal: 'Cell Reports',
      year: 2023,
      abstract: 'Triple-negative breast cancer (TNBC) exhibits high genomic instability. We characterized the molecular landscape...',
      citationCount: 8,
      status: 'ingested',
    },
    {
      id: 3,
      title: 'SARS-CoV-2 spike protein interactions with ACE2 receptor variants',
      authors: ['Chen, L.', 'Wang, Y.'],
      journal: 'Science',
      year: 2024,
      abstract: 'The SARS-CoV-2 spike protein binds to the ACE2 receptor with high affinity. We mapped the interaction interface...',
      citationCount: 25,
      status: 'processing',
    },
  ];

  const handleSearch = () => {
    // In a real app, this would call the API
    setPapers(mockPapers);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 100));
        if (uploadProgress >= 90) {
          clearInterval(interval);
          setIsUploading(false);
          // Simulate processing completion
          setTimeout(() => {
            setPapers([...mockPapers, {
              id: 4,
              title: file.name.replace('.pdf', ''),
              authors: ['User Upload'],
              journal: 'User Upload',
              year: new Date().getFullYear(),
              abstract: 'PDF content extracted via GROBID. Full text available for analysis.',
              citationCount: 0,
              status: 'ingested',
            }]);
          }, 1000);
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Literature Ingestion
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl text-center">
          Search and import biomedical literature from multiple sources including PubMed, PMC, bioRxiv, medRxiv, and PDF uploads.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Box */}
        <div className="col-span-full md:col-span-2">
          <div className="flex space-x-3">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Enter keywords, gene names, disease terms..."
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

        {/* Disease Filter */}
        <div>
          <Label htmlFor="disease-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Disease
          </Label>
          <Select defaultValue="All Diseases" onValueChange={setSelectedDisease}>
            <SelectTrigger>
              <SelectValue placeholder={selectedDisease} />
            </SelectTrigger>
            <SelectContent>
              {diseases.map((disease) => (
                <SelectItem key={disease} value={disease}>
                  {disease}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gene Filter */}
        <div>
          <Label htmlFor="gene-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Gene
          </Label>
          <Select defaultValue="All Genes" onValueChange={setSelectedGene}>
            <SelectTrigger>
              <SelectValue placeholder={selectedGene} />
            </SelectTrigger>
            <SelectContent>
              {genes.map((gene) => (
                <SelectItem key={gene} value={gene}>
                  {gene}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Author Filter */}
        <div>
          <Label htmlFor="author-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Author
          </Label>
          <Select defaultValue="All Authors" onValueChange={setSelectedAuthor}>
            <SelectTrigger>
              <SelectValue placeholder={selectedAuthor} />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Button and File Upload */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <Button onClick={handleSearch} className="w-full lg:w-auto">
          Search Literature
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10" title="Upload PDF">
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M5 10h14" />
            </svg>
          </Button>
          {isUploading && (
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full`} style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploadProgress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {papers.length > 0 ? (
          papers.map((paper) => (
            <Motion
              key={paper.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium line-clamp-2">
                      {paper.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {paper.authors.join(', ')} • {paper.journal} • {paper.year}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge variant={paper.status === 'ingested' ? 'secondary' : 'destructive'} className="px-2 py-0.5">
                      {paper.status === 'ingested' ? 'Ingested' : 'Processing'}
                    </Badge>
                    <Badge variant="outline" className="px-2 py-0.5">
                      {paper.citationCount} Citations
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="mt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {paper.abstract}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="xs" className="flex items-center space-x-1">
                      Save to Workspace
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7.4a5.88 5.88 0 00-1.6-2.1l-.4-.6a2 2 0 00-.6-.6 2 2 0 00-2 2v12.2a2 2 0 002 2h7.2A2 2 0 0017 14.4l.4-.6a5.88 5.88 0 001.6-2.1l-1.6-2.1a5.88 5.88 0 00-2.1-1.6z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="xs" className="flex items-center space-x-1">
                      View Details
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="xs" className="flex items-center space-x-1">
                      Export Citation
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 012-2M9 5a2 2 0 002-2h2a2 2 0 002 2" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Motion>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No papers found. Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}