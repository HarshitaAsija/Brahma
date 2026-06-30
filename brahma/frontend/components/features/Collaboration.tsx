/* eslint-disable */
import React from "react";
import { Badge } from "../shared/Badge";
import { Button } from "../shared/Button";
import { Card } from "../shared/Card";
import { Users, FileText, CheckCircle2, MessageSquare, Plus } from "lucide-react";

export function Collaboration() {
  const activity = [
    { user: "Dr. Elena Rostova", action: "commented on", target: "PCSK9i + ANGPTL3 Blockade Protocol", time: "2 hours ago", initial: "ER" },
    { user: "Dr. James Chen", action: "validated", target: "Hypothesis #42: GLP-1 in PD", time: "5 hours ago", initial: "JC" },
    { user: "System", action: "added 14 new papers to", target: "Shared Workspace: Alzheimer's Biomarkers", time: "1 day ago", initial: "AI" },
    { user: "Dr. Sarah Jenkins", action: "created new workspace", target: "CAR-T Solid Tumors", time: "2 days ago", initial: "SJ" },
  ];

  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col gap-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Collaboration Space</h1>
          <p className="text-sm text-text-muted">Work with your team and AI agents in shared biomedical contexts.</p>
        </div>
        <Button variant="primary" icon={<Plus size={16}/>}>New Workspace</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-foreground">Active Workspaces</h3>
          
          {[
            {
              title: "Cardiometabolic Innovation Group",
              members: 4,
              updates: 12,
              desc: "Focus on FH, PCSK9, ANGPTL3, and novel lipid-lowering targets.",
              tags: ["Cardiology", "Lipidology", "Genetics"],
              docs: 3
            },
            {
              title: "Neurodegeneration Biomarker Taskforce",
              members: 6,
              updates: 3,
              desc: "Evaluating p-tau217, GFAP, and NfL in pre-symptomatic AD.",
              tags: ["Neurology", "Biomarkers", "Alzheimer's"],
              docs: 1
            },
            {
              title: "Oncology Cell Therapy",
              members: 2,
              updates: 0,
              desc: "Evaluating CAR-T persistence mechanisms in solid tumors vs heme.",
              tags: ["Oncology", "CAR-T", "Immunology"],
              docs: 5
            }
          ].map((w, i) => (
            <Card key={i} className="flex flex-col gap-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-lg font-bold text-foreground leading-tight mb-2">{w.title}</h4>
                  <p className="text-sm text-text-muted">{w.desc}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge color={w.updates > 0 ? "primary" : "gray"}>
                    {w.updates} new updates
                  </Badge>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].slice(0, w.members).map(m => (
                      <div key={m} className="w-6 h-6 rounded-full bg-border-med border-2 border-surface flex items-center justify-center text-[8px] font-bold text-surface">
                        U{m}
                      </div>
                    ))}
                    {w.members > 3 && (
                      <div className="w-6 h-6 rounded-full bg-surface-hover border-2 border-surface flex items-center justify-center text-[8px] font-bold text-text-muted">
                        +{w.members - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {w.tags.map((t, j) => (
                  <Badge key={j} color="gray">{t}</Badge>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" icon={<FileText size={14}/>}>
                  {w.docs} Protocols
                </Button>
                <Button variant="outline" size="sm" icon={<CheckCircle2 size={14}/>}>
                  4 Hypotheses
                </Button>
                <Button variant="outline" size="sm" icon={<Users size={14}/>}>
                  Manage Team
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <h3 className="text-sm font-bold text-foreground mb-6">Recent Activity</h3>
            
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border-light" />
              <div className="flex flex-col gap-6 relative">
                {activity.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-surface-hover border-2 border-surface flex items-center justify-center text-[8px] font-bold text-text-muted flex-shrink-0 z-10">
                      {item.initial}
                    </div>
                    <div className="flex-1 mt-0.5">
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-semibold">{item.user}</span> {item.action} <span className="font-medium text-primary">{item.target}</span>
                      </p>
                      <span className="text-xs text-text-muted">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border-light flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground">AI Agents in Workspace</h3>
              {[
                { name: "Literature Monitor", status: "Active", color: "success" },
                { name: "Hypothesis Validator", status: "Idle", color: "gray" },
                { name: "Graph Updater", status: "Active", color: "success" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border-light rounded-lg bg-surface hover:bg-surface-hover transition-colors">
                  <div className="text-sm font-medium text-foreground">{a.name}</div>
                  <Badge color={a.color as any}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
