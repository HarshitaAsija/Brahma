/* eslint-disable */
import React from "react";
import { Badge } from "../shared/Badge";
import { Card } from "../shared/Card";
import { ScoreBar } from "../shared/ScoreBar";
import { Sparkles, Save, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "../shared/Button";

export function StudyDesigner() {
  const qualScore = 84;

  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col gap-8 bg-background">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">PCSK9i + ANGPTL3 Blockade in HoFH — Phase II Protocol</h1>
          <div className="flex gap-2">
            <Badge color="success">Draft</Badge>
            <Badge color="primary">Phase II</Badge>
            <Badge color="gray">Adaptive design</Badge>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-4 bg-surface border border-border-light rounded-xl shadow-sm">
          <div className={`text-4xl font-bold tracking-tight leading-none mb-1 ${qualScore > 80 ? "text-success" : "text-warning"}`}>{qualScore}</div>
          <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Quality Score</div>
        </div>
      </div>

      <div className="flex gap-3 mb-2">
        <Button variant="primary" icon={<Save size={16}/>}>Save Protocol</Button>
        <Button variant="outline" icon={<FileText size={16}/>}>Export PDF</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            label: "Objective (PICO)",
            content: "In adults with homozygous familial hypercholesterolemia (HoFH, age ≥18) with documented residual LDLR activity <5%, does combination therapy with evolocumab 420mg/month + evinacumab 15mg/kg/month (Q) versus evinacumab monotherapy (C) reduce LDL-C to <70mg/dL at week 52 (O) as measured by direct enzymatic assay?",
            aiNote: "PICO structure complete. Consider adding time frame for secondary outcomes.",
          },
          {
            label: "Population & Eligibility",
            content: "Inclusion: HoFH confirmed by genetic testing (2 pathogenic LDLR variants) or clinical criteria (LDL-C >500mg/dL untreated); Age 18–70; eGFR ≥45 mL/min/1.73m²; LFTs <3×ULN.\n\nExclusion: Active hepatic disease; Pregnancy/lactation; Prior ANGPTL3 inhibitor exposure; Active CV event in 90 days.",
            aiNote: "Consider adding LDLR residual activity strata (0–2% vs 2–5%) as pre-specified subgroup.",
          },
          {
            label: "Intervention & Comparator",
            content: "Arm A (Combination): Evolocumab 420mg SC Q4W + Evinacumab 15mg/kg IV Q4W\nArm B (Active Control): Evinacumab 15mg/kg IV Q4W + Placebo SC Q4W\nArm C (Add-on): Evolocumab 420mg SC Q4W (in current max-tolerated statin)\n\nBackground therapy: Maximum tolerated statin ± ezetimibe maintained throughout.",
            aiNote: "3-arm design increases power to detect interaction. Adaptive interim at n=60.",
          },
          {
            label: "Primary & Secondary Outcomes",
            content: "Primary: % change in LDL-C from baseline to week 52 (superiority margin: 15% additional reduction)\n\nSecondary: Proportion achieving LDL-C <70mg/dL; ApoB change; Lp(a) change; hsCRP; ASCVD event rate (composite); Safety and tolerability\n\nExploratory: ANGPTL3 levels; Hepatic steatosis (FibroScan); EHR-linked MACE at 5 years",
            aiNote: "Primary endpoint well-powered. Lp(a) endpoint may require separate sub-study power.",
          },
        ].map((section, i) => (
          <Card key={i} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">{section.label}</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line flex-1">
              {section.content}
            </p>
            <div className="bg-accent-light border border-accent/20 rounded-lg p-3 flex gap-2">
              <Sparkles size={14} className="text-accent mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-0.5">AI Suggestion</span>
                <span className="text-xs text-foreground font-medium">{section.aiNote}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Sample Size & Power</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Target N (per arm)", value: "120" },
              { label: "Total enrollment", value: "360" },
              { label: "Power", value: "90% (α=0.05, two-sided)" },
              { label: "Expected dropout", value: "15% at 52 weeks" },
              { label: "SD assumption", value: "28% LDL-C change" },
              { label: "Min detectable diff", value: "15% additional reduction" },
            ].map((row, j) => (
              <div key={j} className="flex justify-between items-center py-1 border-b border-border-light last:border-0">
                <span className="text-xs text-text-muted">{row.label}</span>
                <span className="text-xs font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Statistical Plan</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Primary analysis", value: "mITT" },
              { label: "Model", value: "MMRM, baseline as covariate" },
              { label: "Multiple comparisons", value: "Holm-Bonferroni" },
              { label: "Interim analysis", value: "50% enrollment (n=180)" },
              { label: "Alpha spending", value: "O'Brien-Fleming" },
              { label: "Subgroup analysis", value: "LDLR activity strata" },
            ].map((row, j) => (
              <div key={j} className="flex justify-between items-center py-1 border-b border-border-light last:border-0">
                <span className="text-xs text-text-muted">{row.label}</span>
                <span className="text-xs font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Design Quality Scores</h3>
          
          <div className="flex flex-col gap-4 mb-2 flex-1">
            <ScoreBar value={92} color="success" label="PICO clarity" />
            <ScoreBar value={88} color="success" label="Endpoints" />
            <ScoreBar value={84} color="primary" label="Sample size" />
            <ScoreBar value={79} color="primary" label="Stat plan" />
            <ScoreBar value={71} color="warning" label="Feasibility" />
          </div>
          
          <div className="bg-warning-light border border-warning/20 rounded-lg p-3 flex gap-2">
            <Sparkles size={14} className="text-warning mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-warning uppercase tracking-wider block mb-0.5">Feasibility Note</span>
              <span className="text-xs text-foreground font-medium">Add HoFH registry sites in Netherlands, Canada for feasibility — global HoFH prevalence 1:300,000.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
