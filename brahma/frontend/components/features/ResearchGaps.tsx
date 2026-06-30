/* eslint-disable */
import React from "react";
import { Stat } from "../shared/Stat";
import { Card } from "../shared/Card";
import { Badge } from "../shared/Badge";
import { FileText, TrendingUp, Sparkles, Network } from "lucide-react";

export function ResearchGaps() {
  const gaps = [
    { id: 1, title: "SGLT2 Inhibitors in Pediatric CKD", importance: 97, papers: 0, why: "All major SGLT2i trials excluded patients under 18. Pediatric CKD is rising globally (+14%/decade). Mechanism is age-independent.", impact: "High", area: "Nephrology", suggestion: "Phase II safety/PK trial, age 8–17, eGFR 15–45, n=180" },
    { id: 2, title: "GLP-1 Agonists + Neurodegeneration in T2DM", importance: 91, papers: 12, why: "GLP-1 receptors expressed in substantia nigra and hippocampus. Semaglutide reduces α-synuclein in rodents. No human RCT in T2DM + PD population.", impact: "Very High", area: "Neurology", suggestion: "Liraglutide RCT in early PD + T2DM comorbidity, n=520, 3-year MDS-UPDRS endpoint" },
    { id: 3, title: "CAR-T Cell Persistence Predictors in Solid Tumors", importance: 88, papers: 4, why: "CAR-T succeeds in heme malignancies but fails in solid tumors. Tumor microenvironment immunosuppression is likely. CAR-T persistence <1% at 3 months in NSCLC trials.", impact: "High", area: "Oncology", suggestion: "Multiomics: scRNA-seq + TCR sequencing in pre/post CAR-T solid tumor biopsies, n=60" },
    { id: 4, title: "Racial Disparities in FH Diagnosis Rate", importance: 85, papers: 8, why: "Dutch Lipid Clinic Network criteria biased toward European ancestry. African-American and South Asian FH likely misdiagnosed by 40–60%. No population-based genomic screening cohort.", impact: "High", area: "Cardiology", suggestion: "Genomic + LDL-C screening in NHANES-linked cohort, targeted FH panel in non-European ancestry" },
    { id: 5, title: "Long-COVID Cognitive Impairment Mechanisms", importance: 83, papers: 27, why: "Cognitive impairment in 15–30% of Long-COVID patients at 12 months. Microglial activation, spike protein persistence, and autoantibody hypotheses unproven in human studies.", impact: "Very High", area: "Neurology", suggestion: "CSF proteomics + brain PET imaging (microglial activation) in Long-COVID cognitive impairment, n=200" },
  ];

  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col gap-8 bg-background">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Research Gaps</h1>
        <p className="text-sm text-text-muted">Unexplored biomedical domains identified by analyzing 284,000+ papers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat label="Total Gaps Identified" value="1,204" color="warning" delta={5} />
        <Stat label="High Impact Gaps" value="287" color="danger" />
        <Stat label="Zero-paper Gaps" value="143" color="accent" sub="No existing literature" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Top Priority Research Gaps</h3>
            <span className="text-xs text-text-muted font-medium">Ranked by AI importance score</span>
          </div>
          
          {gaps.map((gap, i) => (
            <Card key={i} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge color="warning">Gap #{gap.id}</Badge>
                    <Badge color={gap.papers === 0 ? "danger" : gap.papers < 10 ? "warning" : "gray"}>
                      {gap.papers === 0 ? "Zero evidence" : `${gap.papers} papers`}
                    </Badge>
                    <Badge color="gray">{gap.area}</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-foreground">{gap.title}</h4>
                </div>
                <div className="flex flex-col items-center justify-center w-24 flex-shrink-0 border-l border-border-light pl-4 ml-4">
                  <div className="text-3xl font-bold text-warning leading-none">{gap.importance}</div>
                  <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-2">Importance</div>
                </div>
              </div>
              
              <p className="text-sm text-text-muted leading-relaxed">
                {gap.why}
              </p>
              
              <div className="bg-accent-light border border-accent/20 rounded-lg p-4 flex gap-3">
                <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Suggested Study Design</span>
                  <span className="text-sm text-foreground font-medium">{gap.suggestion}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="xl:col-span-1 flex flex-col gap-8">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Network size={16} /> Gap Clusters by Specialty
            </div>
            
            <div className="flex flex-col gap-3">
              {[
                { label: "Neurology", count: 298, color: "bg-accent", border: "border-accent" },
                { label: "Oncology", count: 234, color: "bg-danger", border: "border-danger" },
                { label: "Cardiology", count: 187, color: "bg-warning", border: "border-warning" },
                { label: "Nephrology", count: 143, color: "bg-primary", border: "border-primary" },
                { label: "Endocrinology", count: 89, color: "bg-success", border: "border-success" },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-foreground">{c.label}</span>
                    <span className="text-xs text-text-muted font-medium">{c.count} gaps</span>
                  </div>
                  <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.color}`} style={{ width: `${(c.count / 300) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <TrendingUp size={16} /> Emerging Topics
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { label: "GLP-1 + Neurodegeneration", trend: "+847% citations", color: "text-success", bg: "bg-success-light" },
                { label: "Senolytic Therapy + Aging", trend: "+523%", color: "text-accent", bg: "bg-accent-light" },
                { label: "Long-COVID Mechanisms", trend: "+394%", color: "text-warning", bg: "bg-warning-light" },
                { label: "CRISPR Base Editing Safety", trend: "+312%", color: "text-primary", bg: "bg-primary-light" },
              ].map((t, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-border-light bg-surface hover:bg-surface-hover transition-colors">
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${t.color} ${t.bg}`}>{t.trend}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
