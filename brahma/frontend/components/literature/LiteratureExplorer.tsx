"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { fetchPapers, extractEntities, fetchPaperEntities } from "../../lib/api";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";
import { Card } from "../shared/Card";
import { Search, Filter, Download } from "lucide-react";
import { PaperDetails } from "./PaperDetails";

export function LiteratureExplorer() {
  const [selectedPaper, setSelectedPaper] = useState(0);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<any[]>([]);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    async function loadPapers() {
      try {
        const data = await fetchPapers();
        const transformed = data.results.map((paper: any) => ({
          id: paper.id,
          title: paper.title,
          authors: Array.isArray(paper.authors) ? paper.authors.join(", ") : String(paper.authors),
          journal: paper.journal,
          year: paper.publication_date ? new Date(paper.publication_date).getFullYear() : "",
          volume: "",
          score: 95,
          type: "Research Paper",
          phase: paper.source || "Database",
          abstract: paper.abstract,
          stats: {
            doi: paper.doi || "N/A",
            pmid: paper.pmid || "N/A",
          },
          evidence: "high",
          citations: 0,
          aiInsight: "Entity extraction pipeline is connected. Run extraction to view biomedical entities.",
        }));
        setPapers(transformed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPapers();
  }, []);

  const paper = papers.length > 0 ? papers[selectedPaper] : null;

  const loadEntities = async (paperId: number) => {
    try {
      const data = await fetchPaperEntities(paperId);
      setEntities(data);
    } catch (err) {
      console.error(err);
      setEntities([]);
    }
  };

  useEffect(() => {
    if (paper?.id) {
      loadEntities(paper.id);
    } else {
      setEntities([]);
    }
  }, [paper?.id]);

  const handleExtract = async () => {
    if (!paper?.id) return;
    try {
      setExtracting(true);
      await extractEntities(paper.id);
      await loadEntities(paper.id);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Filters Sidebar */}
      <div className="w-64 border-r border-border-light bg-surface flex flex-col overflow-auto p-4 gap-6 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input 
            type="text" 
            placeholder="Search literature..." 
            className="w-full bg-surface-hover border border-border-med rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-dim text-foreground"
          />
        </div>

        {[
          { label: "Source Type", opts: ["All Sources", "PubMed / MEDLINE", "bioRxiv / medRxiv", "Cochrane", "ClinicalTrials.gov"] },
          { label: "Study Design", opts: ["All Designs", "RCT", "Meta-analysis", "Cohort Study", "Case-Control"] },
          { label: "Evidence Level", opts: ["All Levels", "Level I (SR/Meta-analysis)", "Level II (RCT)", "Level III (Cohort)"] },
        ].map((section, i) => (
          <div key={i}>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <Filter size={10} /> {section.label}
            </h4>
            <div className="flex flex-col gap-1">
              {section.opts.map((opt, j) => (
                <label key={j} className={`flex items-center gap-2 text-xs p-1.5 rounded-md cursor-pointer transition-colors ${j === 0 ? 'bg-primary-light/50 text-primary font-medium' : 'text-text-muted hover:bg-surface-hover hover:text-foreground'}`}>
                  <input type="radio" name={`filter-${i}`} className="hidden" defaultChecked={j === 0} />
                  <span className={`w-3 h-3 rounded-sm border flex-shrink-0 ${j === 0 ? 'border-primary bg-primary' : 'border-border-med'}`} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Paper List */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto p-6 gap-4 bg-background">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-muted">
            {loading ? "Loading papers..." : `${papers.length} results from database`}
          </span>
          <div className="flex gap-2">
            <Badge color="primary">Semantic search</Badge>
            <Badge color="gray">Sort: Relevance</Badge>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-5 bg-border-light rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-border-light rounded w-1/2 mb-4"></div>
                <div className="flex gap-2"><div className="h-5 bg-border-light rounded w-20"></div></div>
              </Card>
            ))}
          </div>
        ) : (
          papers.map((p, i) => (
            <Card 
              key={p.id} 
              hoverable 
              onClick={() => setSelectedPaper(i)}
              className={`cursor-pointer transition-all duration-200 ${selectedPaper === i ? 'border-primary ring-1 ring-primary shadow-md' : ''}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors">{p.title}</h3>
                  <div className="text-xs text-text-muted truncate">{p.authors}</div>
                </div>
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-xl font-black text-primary leading-none">{p.score}</div>
                  <div className="text-[9px] font-bold text-text-dim tracking-wider uppercase mt-1">Score</div>
                </div>
              </div>
              
              {/* Abstract preview truncated to 3 lines */}
              <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
                {p.abstract}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge color={p.evidence === "high" ? "success" : "warning"}>
                    {p.evidence === "high" ? "High evidence" : "Moderate evidence"}
                  </Badge>
                  <Badge color="primary">{p.type}</Badge>
                </div>
                <div className="text-[10px] text-text-dim font-medium">
                  {p.journal} · {p.year}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paper Details Inspector */}
      <div className="w-[450px] shrink-0">
        <PaperDetails 
          paper={paper} 
          entities={entities} 
          extracting={extracting} 
          onExtract={handleExtract} 
        />
      </div>
    </div>
  );
}
