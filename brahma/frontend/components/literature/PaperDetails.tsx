/* eslint-disable */
import React from "react";
import { Badge } from "../shared/Badge";
import { Tabs } from "../shared/Tabs";
import { Button } from "../shared/Button";
import { Sparkles, Download, FileText, Users, Network, Link as LinkIcon, RefreshCw } from "lucide-react";

interface PaperDetailsProps {
  paper: any;
  entities: any[];
  extracting: boolean;
  onExtract: () => void;
}

export function PaperDetails({ paper, entities, extracting, onExtract }: PaperDetailsProps) {
  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted">
        <FileText size={48} className="text-border-med mb-4" />
        <p>Select a paper to view details</p>
      </div>
    );
  }

  const tabItems = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Abstract</h3>
            <p className="text-sm text-foreground leading-relaxed">
              {paper.abstract}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(paper.stats || {}).map(([k, v]) => (
              <div key={k} className="bg-surface-hover rounded-lg p-3 border border-border-light">
                <div className="text-xs text-text-muted uppercase mb-1">{k}</div>
                <div className="text-sm font-semibold text-foreground">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "entities",
      label: "Entities",
      content: (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Extracted Entities</h3>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onExtract} 
              isLoading={extracting}
              icon={<RefreshCw size={14} />}
            >
              Run Extraction
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {entities.length > 0 ? (
              entities.map((entity) => (
                <Badge
                  key={entity.entity_id}
                  color={
                    entity.entity_type === "Gene"
                      ? "primary"
                      : entity.entity_type === "Disease"
                      ? "success"
                      : entity.entity_type === "Drug"
                      ? "warning"
                      : "accent"
                  }
                >
                  {entity.canonical_name}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-text-muted italic py-4">
                No entities extracted yet. Click "Run Extraction" to analyze the paper.
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: "ai-insight",
      label: "AI Insight",
      icon: <Sparkles size={14} className="text-accent" />,
      content: (
        <div className="bg-accent-light border border-accent/20 rounded-xl p-5 shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Brahma Synthesis</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {paper.aiInsight || "AI insight is currently generating based on the paper's full text and extracted entities. Please check back in a few seconds."}
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border-light">
      <div className="p-6 border-b border-border-light">
        <h2 className="text-xl font-bold text-foreground leading-tight mb-2">
          {paper.title}
        </h2>
        <div className="text-sm text-text-muted mb-3 flex items-center gap-2">
          <Users size={14} /> {paper.authors}
        </div>
        <div className="text-sm font-medium text-text-dim mb-4">
          {paper.journal} · {paper.year}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge color={paper.evidence === "high" ? "success" : "warning"}>
            {paper.evidence === "high" ? "High evidence" : "Moderate evidence"}
          </Badge>
          <Badge color="primary">{paper.type}</Badge>
          <Badge color="gray">{paper.phase}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" icon={<Download size={14} />}>
            Download PDF
          </Button>
          <Button size="sm" variant="outline" icon={<LinkIcon size={14} />}>
            Source
          </Button>
          <Button size="sm" variant="outline" icon={<Network size={14} />}>
            Graph
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pt-2">
        <Tabs items={tabItems} defaultTab="overview" />
      </div>
    </div>
  );
}
