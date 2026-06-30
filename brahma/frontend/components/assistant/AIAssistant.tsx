"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Card } from "../shared/Card";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";
import { Send, Bot, User, Sparkles, BookOpen, AlertTriangle } from "lucide-react";

export function AIAssistant() {
  const [input, setInput] = useState("");
  
  const messages = [
    {
      role: "user",
      content: "What is the current evidence for PCSK9 inhibitors in statin-intolerant patients with familial hypercholesterolemia? Include effect sizes and major trials."
    },
    {
      role: "assistant",
      content: null,
      structured: {
        summary: "PCSK9 inhibitors demonstrate strong, consistent cardiovascular benefit in statin-intolerant FH patients, supported by Level I evidence from three major RCTs encompassing 58,000+ participants.",
        keyFindings: [
          { text: "Evolocumab reduces major adverse cardiovascular events by 15% (HR 0.85, 95% CI 0.79–0.92) in FOURIER-OLE at 5 years", source: "FOURIER-OLE, NEJM 2024", type: "success" },
          { text: "Alirocumab achieves 24% all-cause mortality reduction in post-ACS patients", source: "ODYSSEY OUTCOMES, Lancet 2018", type: "success" },
          { text: "Mean LDL-C reduction of 59% maintained at 5 years with evolocumab 140mg Q2W", source: "FOURIER 5yr follow-up 2024", type: "primary" },
          { text: "Inclisiran (siRNA) shows non-inferior LDL-C reduction: ORION-3 trial 52% reduction at 18 months", source: "ORION-3, NEJM 2020", type: "primary" },
          { text: "NNT = 67 over 5 years to prevent one MACE in high-risk statin-intolerant FH patients", source: "Pooled analysis, JACC 2023", type: "warning" },
        ],
        gaps: ["No head-to-head evolocumab vs alirocumab RCT in pure FH cohort", "Long-term cognitive safety data beyond 7 years lacking", "Pediatric FH (age 10–17) outcomes data sparse"],
        recommendation: "Consider expanding current hypothesis: PCSK9 inhibition + inclisiran combination vs monotherapy in FH patients with residual LDLR activity (>20%).",
      }
    },
    {
      role: "user",
      content: "Generate a hypothesis based on this evidence. What's the most promising unexplored question?"
    },
    {
      role: "assistant",
      content: null,
      structured: {
        hypothesis: true,
        title: "PCSK9 Inhibition + ANGPTL3 Blockade Synergy in Homozygous FH",
        rationale: "Homozygous FH patients with <1% LDLR activity respond poorly to PCSK9 inhibitors alone. ANGPTL3 inhibitors (evinacumab) work via an LDLR-independent mechanism (LPL pathway). Dual blockade may achieve >80% LDL-C reduction in HoFH — a population with near-universal premature ASCVD.",
        noveltyScore: 89,
        feasibilityScore: 74,
        impactScore: 94,
        nextStep: "Design Phase II adaptive dose-finding trial: evinacumab 15mg/kg/month + evolocumab 420mg/month in HoFH (n=120). Primary endpoint: LDL-C <70mg/dL at 52 weeks.",
      }
    },
  ];

  const evidenceSources = [
    { title: "FOURIER-OLE", journal: "NEJM 2024", score: 97, type: "RCT" },
    { title: "ODYSSEY OUTCOMES", journal: "Lancet 2018", score: 95, type: "RCT" },
    { title: "ORION-3", journal: "NEJM 2020", score: 88, type: "RCT" },
    { title: "JACC Pooled Analysis", journal: "JACC 2023", score: 84, type: "Meta-analysis" },
    { title: "HoFH Registry 2023", journal: "ATVB 2023", score: 76, type: "Registry" },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto p-8 flex flex-col gap-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === "user" ? "bg-primary text-white" : "bg-gradient-to-br from-primary to-accent text-white"
              }`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                
                {msg.role === "user" ? (
                  <div className="bg-surface border border-border-light shadow-sm rounded-2xl rounded-tr-sm px-5 py-3 text-sm text-foreground leading-relaxed">
                    {msg.content}
                  </div>
                ) : msg.structured?.hypothesis ? (
                  <Card className="w-full bg-surface border-accent/30 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-accent">
                      <Sparkles size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">AI-Generated Hypothesis</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{msg.structured.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed mb-6">{msg.structured.rationale}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { label: "Novelty", val: msg.structured.noveltyScore, color: "text-accent" },
                        { label: "Feasibility", val: msg.structured.feasibilityScore, color: "text-primary" },
                        { label: "Impact", val: msg.structured.impactScore, color: "text-success" },
                      ].map((s, j) => (
                        <div key={j} className="bg-surface-hover rounded-lg p-3 border border-border-light text-center">
                          <div className="text-xs text-text-muted mb-1 font-medium">{s.label}</div>
                          <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-primary-light border-l-4 border-primary rounded-r-lg p-3 flex gap-3">
                      <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-primary text-sm block mb-1">Suggested Next Step</span>
                        <span className="text-sm text-foreground leading-relaxed">{msg.structured.nextStep}</span>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-text-muted font-medium ml-1">
                      BRAHMA <span className="w-1 h-1 rounded-full bg-border-med" /> Evidence synthesis
                    </div>
                    <Card className="rounded-tl-sm bg-surface">
                      <p className="text-sm font-medium text-foreground leading-relaxed mb-6">{msg.structured?.summary}</p>
                      
                      <div className="flex flex-col gap-3 mb-6">
                        {msg.structured?.keyFindings?.map((f: any, j: number) => (
                          <div key={j} className={`flex gap-3 p-3 rounded-lg border-l-4 bg-surface-hover ${
                            f.type === "success" ? "border-success" : f.type === "warning" ? "border-warning" : "border-primary"
                          }`}>
                            <div className="flex-1">
                              <p className="text-sm text-foreground mb-1 leading-snug">{f.text}</p>
                              <span className="text-xs text-text-muted flex items-center gap-1">
                                <BookOpen size={12} /> {f.source}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {msg.structured?.gaps && (
                        <div className="bg-warning-light rounded-lg p-4 border border-warning/20">
                          <div className="flex items-center gap-2 mb-2 text-warning font-semibold text-xs uppercase tracking-wider">
                            <AlertTriangle size={14} /> Research Gaps Identified
                          </div>
                          <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                            {msg.structured?.gaps?.map((g: string, j: number) => (
                              <li key={j}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-border-light bg-surface z-10">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                value={input} 
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about any disease, drug, gene, mechanism, or clinical trial…"
                className="w-full bg-surface-hover border border-border-med rounded-xl py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-text-dim"
              />
              <Button 
                variant="primary" 
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {["Summarize current evidence", "Find contradictions", "Suggest next study", "Compare treatments", "Identify gaps"].map((s, i) => (
              <Badge key={i} color="gray" className="cursor-pointer hover:bg-border-light hover:text-foreground transition-colors py-1.5 px-3 text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Panel */}
      <div className="w-[340px] border-l border-border-light bg-surface overflow-auto p-6 flex flex-col gap-8 shrink-0">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Evidence Sources</h3>
            <span className="text-xs text-primary font-medium bg-primary-light px-2 py-0.5 rounded-full">5 active</span>
          </div>
          
          <div className="flex flex-col gap-3">
            {evidenceSources.map((s, i) => (
              <Card key={i} className="p-3">
                <div className="text-sm font-semibold text-foreground mb-1 truncate">{s.title}</div>
                <div className="text-xs text-text-muted mb-3 flex items-center gap-1"><BookOpen size={12}/> {s.journal}</div>
                <div className="flex justify-between items-center">
                  <Badge color="primary">{s.type}</Badge>
                  <span className="text-sm font-bold text-primary">{s.score}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-4">Reasoning Trace</h3>
          <div className="flex flex-col gap-3">
            {[
              { text: "Retrieved 847 papers matching PCSK9 × FH query", color: "primary" },
              { text: "Filtered to RCT/meta-analysis, n≥500", color: "success" },
              { text: "Extracted effect sizes, CIs, endpoints", color: "accent" },
              { text: "Identified 3 unresolved gaps in synthesis", color: "warning" },
            ].map((step, i) => (
              <div key={i} className={`text-xs text-foreground p-2.5 rounded-md border-l-4 bg-surface-hover ${
                step.color === "primary" ? "border-primary" : step.color === "success" ? "border-success" : step.color === "warning" ? "border-warning" : "border-accent"
              }`}>
                <span className="font-semibold mr-1">{i + 1}.</span> {step.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
