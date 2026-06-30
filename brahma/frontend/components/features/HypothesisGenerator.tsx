"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Badge } from "../shared/Badge";
import { Card } from "../shared/Card";
import { Button } from "../shared/Button";
import { Lightbulb, CheckCircle2, AlertTriangle, Sparkles, ChevronRight, ListChecks } from "lucide-react";

export function HypothesisGenerator() {
  const [selected, setSelected] = useState(0);
  
  const hypotheses = [
    {
      id: 0,
      status: "active",
      title: "PCSK9 Inhibition + ANGPTL3 Blockade Synergy in Homozygous FH",
      rationale: "HoFH patients (<1% LDLR activity) respond poorly to PCSK9 inhibitors. ANGPTL3 inhibitors act via LPL pathway, independent of LDLR. Dual blockade may achieve additive LDL-C reduction exceeding 80%, with potential ASCVD risk reduction beyond LDL-lowering via ANGPTL3's pleiotropic vascular effects.",
      supporting: ["Evinacumab achieves 47% LDL-C reduction in HoFH (ELIPSE HoFH trial, n=65)", "Evolocumab reduces MACE 15% in FH (FOURIER-OLE)", "ANGPTL3 KO mice show 40% reduction in atherosclerotic plaque area"],
      contradicting: ["HoFH residual LDLR activity <5%: limited PCSK9 substrate — may reduce evolocumab efficacy (Raal et al., Circulation 2021)"],
      novelty: 89, feasibility: 74, impact: 94,
      tags: ["FH", "PCSK9", "ANGPTL3", "RCT candidate"],
    },
    {
      id: 1,
      status: "validated",
      title: "p-tau217 + GFAP Combined Plasma Biomarker Panel for Pre-Symptomatic AD Detection",
      rationale: "p-tau217 outperforms p-tau181 for amyloid prediction (AUC 0.94 BioFINDER-2). GFAP reflects astrocytic neuroinflammation, an independent AD pathway. Combined panel may improve specificity in non-amnestic MCI variants where p-tau217 alone is suboptimal.",
      supporting: ["p-tau217 AUC 0.94 for amyloid prediction (BioFINDER-2, Nat Neurosci 2024)", "GFAP independent predictor: HR 2.8 for dementia conversion (UK Biobank n=12,000)", "Combined p-tau217+GFAP AUC 0.97 in single-center pilot (n=320)"],
      contradicting: ["GFAP elevation non-specific: elevated in TDP-43 proteinopathy, VCI (Zetterberg et al. 2023)", "Commercial GFAP assay CV >8% at low concentrations — analytical noise concern"],
      novelty: 76, feasibility: 88, impact: 91,
      tags: ["Alzheimer's", "Biomarker", "p-tau217", "GFAP"],
    },
    {
      id: 2,
      status: "active",
      title: "Early CAR-T Therapy (3rd Line) vs Late-Line (≥5th Line) in RRMM",
      rationale: "Real-world CAR-T data shows median PFS 12.4 months overall, but line of therapy is a strong predictor. Patients receiving CAR-T earlier (3rd line) may have better tumor microenvironment, higher CAR-T persistence, and superior bone marrow reserve.",
      supporting: ["Registry: ORR 84% cilta-cel vs 73% ide-cel; earlier use correlates with PFS (JCO 2024)", "Mouse model: CAR-T earlier → 3.2x longer persistence in MM xenograft"],
      contradicting: ["MAIA trial: lenalidomide + dara remains superior frontline, questioning early CAR-T cost-benefit"],
      novelty: 82, feasibility: 67, impact: 88,
      tags: ["CAR-T", "Myeloma", "BCMA", "Phase III candidate"],
    },
    {
      id: 3,
      status: "gap",
      title: "SGLT2i Nephroprotection in Pediatric CKD Stages 3b–4: Safety and Efficacy",
      rationale: "SGLT2 inhibitors reduce CKD progression 30–40% in adults. Pediatric CKD data is absent from all major trials. Mechanism should operate similarly in children. Critical evidence gap with high prevalence of pediatric CKD in low-income countries.",
      supporting: ["EMPA-KIDNEY: eGFR decline reduced 28% in adults with eGFR 20–45 (n=6,609)", "Pediatric SGLT2 off-label use growing 12%/year (FDA adverse event database)"],
      contradicting: ["Growth plate safety signal in rodent models at supratherapeutic doses", "Euglycemic DKA risk unknown in pediatric T1DM overlap"],
      novelty: 94, feasibility: 58, impact: 97,
      tags: ["SGLT2i", "Pediatrics", "CKD", "Critical gap"],
    },
  ];

  const h = hypotheses[selected];
  
  const statusConfig: Record<string, { color: any, icon: any, label: string }> = {
    active: { color: "primary", icon: <Sparkles size={12} />, label: "Active Analysis" },
    validated: { color: "success", icon: <CheckCircle2 size={12} />, label: "Validated" },
    gap: { color: "warning", icon: <AlertTriangle size={12} />, label: "Critical Gap" }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* List Sidebar */}
      <div className="w-[320px] border-r border-border-light bg-surface flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-border-light flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Hypothesis Pipeline</h3>
          <Button size="sm" variant="outline" className="text-xs py-1 px-2 h-7" icon={<Lightbulb size={12}/>}>
            Generate
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
          {hypotheses.map((item, i) => (
            <Card 
              key={i} 
              hoverable
              onClick={() => setSelected(i)}
              className={`cursor-pointer p-4 transition-all duration-200 ${selected === i ? "border-primary ring-1 ring-primary shadow-md" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge color={statusConfig[item.status].color} className="flex items-center gap-1">
                  {statusConfig[item.status].icon} {statusConfig[item.status].label}
                </Badge>
                <div className="text-[10px] font-bold text-text-dim tracking-widest uppercase">
                  Impact: <span className="text-primary text-xs">{item.impact}</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-foreground leading-snug mb-3">{item.title}</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 2).map((t, j) => (
                  <Badge key={j} color="gray" size="sm">{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Details Area */}
      <div className="flex-1 overflow-auto p-8 flex flex-col gap-6 bg-background">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge color={statusConfig[h.status].color} className="flex items-center gap-1">
                {statusConfig[h.status].icon} {statusConfig[h.status].label}
              </Badge>
              {h.tags.map((t, i) => (
                <Badge key={i} color="gray">{t}</Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{h.title}</h1>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary">Validate Evidence</Button>
            <Button variant="secondary">Refine</Button>
            <Button variant="primary" icon={<ListChecks size={16}/>}>Generate Study</Button>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Novelty Score", val: h.novelty, color: "text-accent", bg: "bg-accent", border: "border-accent", sub: "vs existing literature" },
            { label: "Feasibility Score", val: h.feasibility, color: "text-primary", bg: "bg-primary", border: "border-primary", sub: "resources & timeline" },
            { label: "Potential Impact", val: h.impact, color: "text-success", bg: "bg-success", border: "border-success", sub: "clinical & scientific" },
          ].map((s, i) => (
            <Card key={i} className="flex flex-col">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{s.label}</div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className={`text-4xl font-bold tracking-tight ${s.color}`}>{s.val}</span>
                <span className="text-sm font-semibold text-text-dim">/100</span>
              </div>
              <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${s.bg}`} style={{ width: `${s.val}%` }} />
              </div>
              <div className="text-xs text-text-muted font-medium">{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Rationale */}
        <Card className="p-6 bg-surface border-border-light">
          <div className="text-xs font-bold text-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-accent" /> Scientific Rationale
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {h.rationale}
          </p>
        </Card>

        {/* Evidence columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-success" />
              <h3 className="text-sm font-bold text-foreground">Supporting Evidence</h3>
            </div>
            {h.supporting.map((s, i) => (
              <div key={i} className="bg-success-light border border-success/20 p-4 rounded-xl shadow-sm text-sm text-foreground leading-relaxed">
                {s}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-danger" />
              <h3 className="text-sm font-bold text-foreground">Contradicting Evidence</h3>
            </div>
            {h.contradicting.map((s, i) => (
              <div key={i} className="bg-danger-light border border-danger/20 p-4 rounded-xl shadow-sm text-sm text-foreground leading-relaxed">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
