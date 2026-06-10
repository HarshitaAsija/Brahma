import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function KnowledgeGraphPage() {
  const [searchNode, setSearchNode] = useState('');
  const [selectedNodeType, setSelectedNodeType] = useState('All Types');
  const [selectedRelationship, setSelectedRelationship] = useState('All Relationships');
  const [graphData, setGraphData] = useState(null); // Would be populated with Cytoscape data

  const nodeTypes = ['All Types', 'Gene', 'Disease', 'Drug', 'Protein', 'Pathway', 'Publication'];
  const relationships = ['All Relationships', 'interacts_with', 'regulates', 'associated_with', 'treats', 'causes', 'expresses'];

  // Mock data for nodes and edges (would be used to initialize Cytoscape)
  const mockNodes = [
    { data: { id: 'gene1', label: 'APOE', type: 'Gene' } },
    { data: { id: 'gene2', label: 'APP', type: 'Gene' } },
    { data: { id: 'disease1', label: 'Alzheimer\'s Disease', type: 'Disease' } },
    { data: { id: 'drug1', label: 'Donepezil', type: 'Drug' } },
    { data: { id: 'protein1', label: 'Amyloid-beta', type: 'Protein' } },
    { data: { id: 'pathway1', label: 'Amyloid Processing Pathway', type: 'Pathway' } },
    { data: { id: 'pub1', label: 'Smith et al. 2023', type: 'Publication' } },
  ];

  const mockEdges = [
    { data: { id: 'e1', source: 'gene1', target: 'protein1', label: 'expresses' } },
    { data: { id: 'e2', source: 'gene2', target: 'protein1', label: 'expresses' } },
    { data: { id: 'e3', source: 'protein1', target: 'disease1', label: 'associated_with' } },
    { data: { id: 'e4', source: 'drug1', target: 'protein1', label: 'inhibits' } },
    { data: { id: 'e5', source: 'pathway1', target: 'protein1', label: 'regulates' } },
    { data: { id: 'e6', source: 'pub1', target: 'gene1', label: 'mentions' } },
    { data: { id: 'e7', source: 'pub1', target: 'disease1', label: 'studies' } },
  ];

  const handleSearchNode = () => {
    // In a real app, this would filter the graph or search for a node
    alert('Searching for node: ' + searchNode);
  };

  const handleApplyFilters = () => {
    // In a real app, this would filter the graph based on selected types and relationships
    alert('Applying filters: Node Type=' + selectedNodeType + ', Relationship=' + selectedRelationship);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Knowledge Graph Visualization
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl text-center">
          Explore and interact with biomedical knowledge graphs to discover relationships between genes, diseases, drugs, and more.
        </p>
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Search Node */}
        <div>
          <Label htmlFor="node-search" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Search Node
          </Label>
          <div className="mt-2 flex space-x-2">
            <Input
              id="node-search"
              type="text"
              placeholder="Enter gene, disease, drug name..."
              className="flex-1"
              value={searchNode}
              onChange={(e) => setSearchNode(e.target.value)}
            />
            <Button onClick={handleSearchNode} className="px-4">
              Search
            </Button>
          </div>
        </div>

        {/* Node Type Filter */}
        <div>
          <Label htmlFor="node-type-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Node Type
          </Label>
          <Select defaultValue="All Types" onValueChange={setSelectedNodeType}>
            <SelectTrigger>
              <SelectValue placeholder={selectedNodeType} />
            </SelectTrigger>
            <SelectContent>
              {nodeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Relationship Filter */}
        <div>
          <Label htmlFor="relationship-filter" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Relationship Type
          </Label>
          <Select defaultValue="All Relationships" onValueChange={setSelectedRelationship}>
            <SelectTrigger>
              <SelectValue placeholder={selectedRelationship} />
            </SelectTrigger>
            <SelectContent>
              {relationships.map((rel) => (
                <SelectItem key={rel} value={rel}>
                  {rel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row md:justify-end gap-3">
        <Button variant="outline" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        <Button className="ml-2">
          Export Graph
        </Button>
        <Button variant="destructive">
          Clear Selection
        </Button>
      </div>

      {/* Knowledge Graph Visualization */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="kg-container">
          {/* This container would be used by Cytoscape.js to render the graph */}
          <div className="relative w-full h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.5 0-3 .367-3.81 1.018a4.002 4.002 0 00-.579 2.18l-.002.007a4.002 4.002 0 01-1.012 1.5A4.002 4.002 0 009.18 15.01a4.002 4.002 0 01-1.11.308A4 4 0 003 12c0-2.21 1.35-4.16 3.23-5.03l1.06-.39a2 2 0 012 .62v1.59a2 2 0 002 1.59l.818.308a2 2 0 011.958.036c2.21 0 4.16-1.35 5.03-3.23l1.06-.39a2 2 0 002-.62v-1.59a2 2 0 01-2-1.59z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Knowledge Graph
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                Interactive visualization of biomedical relationships. Nodes represent genes, diseases, drugs, proteins, pathways, and publications. Edges represent relationships such as interactions, regulations, and associations.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="xs" className="flex items-center space-x-1">
                  Center Graph
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L14 8l-4 4 4 4-4-4zm6 0l-1.586-1.586a2 2 0 00-2.828 0L6 8l-4 4 4 4-4-4z" />
                  </svg>
                </Button>
                <Button variant="outline" size="xs" className="flex items-center space-x-1">
                  Fit to Screen
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h.01M12 13h.01M12 9h.01M21 12h.01M17 17h.01M17 7h.01M5 21h.01M5 17h.01M3 12h.01M3 8h.01" />
                  </svg>
                </Button>
                <Button variant="outline" size="xs" className="flex items-center space-x-1">
                  Expand Neighborhood
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M9 12V3m0 0L3 3m0 0l-3 6m0 0l3 6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Node Information Panel (appears when a node is selected) */}
      <div className="mt-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Node Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a node from the graph to view detailed information, including related publications, connected genes/proteins, and associated diseases.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Connections
              </h3>
              <div className="space-y-2">
                <p className="flex items-center space-x-2 text-sm">
                  <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded"></span>
                  <span>Gene: APOE (3 connections)</span>
                </p>
                <p className="flex items-center space-x-2 text-sm">
                  <span className="flex-shrink-0 w-3 h-3 bg-green-500 rounded"></span>
                  <span>Disease: Alzheimer\'s Disease (5 connections)</span>
                </p>
                <p className="flex items-center space-x-2 text-sm">
                  <span className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded"></span>
                  <span>Drug: Donepezil (2 connections)</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}