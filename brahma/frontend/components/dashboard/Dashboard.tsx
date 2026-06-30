/* eslint-disable */
import React from "react";
import { Stat } from "../shared/Stat";
import { Card } from "../shared/Card";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";
import { 
  Upload, 
  Lightbulb, 
  Bot, 
  Network, 
  ChevronRight,
  Activity,
  AlertCircle,
  TrendingUp,
  FileText
} from "lucide-react";

export function Dashboard() {
  const activityItems = [
    { type: "discovery", color: "success", icon: <Activity size={12} />, text: "PCSK9 inhibitor resistance mechanism identified via 3 new RCTs", time: "2m ago" },
    { type: "contradiction", color: "danger", icon: <AlertCircle size={12} />, text: "Contradictory outcomes detected: IL-6 blockade in heart failure", time: "18m ago" },
    { type: "trend", color: "accent", icon: <TrendingUp size={12} />, text: "Emerging: GLP-1 agonists showing neuroprotective effects — 47 papers in 30 days", time: "1h ago" },
    { type: "gap", color: "warning", icon: <FileText size={12} />, text: "Underexplored: SGLT2i + CKD in pediatric cohorts — 0 RCTs identified", time: "2h ago" },
    { type: "discovery", color: "primary", icon: <Activity size={12} />, text: "New entity cluster: SOD1, TDP-43, FUS co-aggregation in ALS", time: "3h ago" },
    { type: "suggestion", color: "accent", icon: <Lightbulb size={12} />, text: "Study design suggested: Phase II adaptive design for PD-L1 × KRAS combo", time: "4h ago" },
  ];

  const recentPapers = [
    { title: "PCSK9 Inhibition in Statin-Resistant Hypercholesterolemia: A 5-Year Follow-Up", journal: "NEJM", year: 2024, score: 97, tag: "RCT", color: "primary" },
    { title: "Tau Phosphorylation Dynamics in Early Alzheimer's: CSF Biomarker Correlates", journal: "Nature Neuroscience", year: 2024, score: 94, tag: "Cohort", color: "success" },
    { title: "CRISPR-Cas9 Off-Target Editing in Hematopoietic Stem Cells: Safety Profile", journal: "Nature Medicine", year: 2024, score: 91, tag: "Safety", color: "accent" },
    { title: "GLP-1 Receptor Agonists and Cardiovascular Outcomes in T2DM + CKD", journal: "Lancet", year: 2024, score: 89, tag: "Meta-analysis", color: "warning" },
  ];

  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary-light border-primary/20",
    success: "text-success bg-success-light border-success/20",
    danger: "text-danger bg-danger-light border-danger/20",
    warning: "text-warning bg-warning-light border-warning/20",
    accent: "text-accent bg-accent-light border-accent/20",
  };

  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col gap-8 bg-background">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Research Dashboard</h1>
        <p className="text-sm text-text-muted">Welcome back. Here is the latest intelligence from your biomedical corpus.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="Papers Ingested" value="284,917" delta={12} color="primary" />
        <Stat label="Entities Found" value="1.2M" delta={8} color="success" />
        <Stat label="Hypotheses" value="347" delta={23} color="accent" />
        <Stat label="Graph Nodes" value="4.8M" color="cyan" />
        <Stat label="Research Gaps" value="1,204" delta={5} color="warning" />
        <Stat label="Contradictions" value="89" color="danger" sub="Flagged for review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main area (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Recent papers */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Recently Indexed Papers</h3>
                <p className="text-xs text-text-muted">{recentPapers.length} new today</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary-light">
                Open explorer <ChevronRight size={14} />
              </Button>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentPapers.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border-light bg-surface hover:border-border-med transition-colors cursor-pointer group">
                  <div className={`w-1 h-10 rounded-full ${colorMap[p.color].split(' ')[0].replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{p.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{p.journal} · {p.year}</div>
                  </div>
                  <Badge color={p.color as any}>{p.tag}</Badge>
                  <div className="flex flex-col items-end justify-center w-12 border-l border-border-light pl-4">
                    <div className="text-lg font-bold text-primary">{p.score}</div>
                    <div className="text-[9px] text-text-dim uppercase tracking-wider font-semibold">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 border-dashed bg-surface hover:border-primary hover:text-primary">
              <Upload size={20} className="text-primary" />
              <span className="text-xs font-medium">Import Literature</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-surface">
              <Lightbulb size={20} className="text-accent" />
              <span className="text-xs font-medium">New Hypothesis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-surface">
              <Bot size={20} className="text-success" />
              <span className="text-xs font-medium">AI Workspace</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-surface">
              <Network size={20} className="text-warning" />
              <span className="text-xs font-medium">Build Graph</span>
            </Button>
          </div>
        </div>

        {/* Activity feed (1 col) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Activity Timeline</h3>
                <p className="text-xs text-text-muted">Live updates</p>
              </div>
            </div>
            
            <div className="relative flex-1">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border-light" />
              <div className="flex flex-col gap-6 relative">
                {activityItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-surface ${colorMap[item.color]}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 mt-0.5">
                      <p className="text-sm text-foreground leading-snug mb-1">{item.text}</p>
                      <span className="text-xs text-text-dim font-medium">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
