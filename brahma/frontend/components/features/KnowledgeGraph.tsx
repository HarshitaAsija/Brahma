"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Badge } from "../shared/Badge";
import { Sparkles, Network, ZoomIn, ZoomOut, Filter, Lightbulb } from "lucide-react";

export function KnowledgeGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const nodes = [
    { id: "PCSK9", x: 350, y: 200, type: "gene", r: 22, color: "#2563eb" },
    { id: "LDL-C", x: 220, y: 150, type: "biomarker", r: 18, color: "#06b6d4" },
    { id: "Evolocumab", x: 480, y: 140, type: "drug", r: 20, color: "#10b981" },
    { id: "Alirocumab", x: 500, y: 260, type: "drug", r: 16, color: "#10b981" },
    { id: "FH", x: 200, y: 280, type: "disease", r: 20, color: "#ef4444" },
    { id: "ASCVD", x: 320, y: 340, type: "disease", r: 22, color: "#ef4444" },
    { id: "LDLR", x: 130, y: 200, type: "gene", r: 16, color: "#2563eb" },
    { id: "APOB", x: 160, y: 330, type: "gene", r: 14, color: "#2563eb" },
    { id: "ANGPTL3", x: 440, y: 360, type: "gene", r: 14, color: "#2563eb" },
    { id: "Evinacumab", x: 560, y: 340, type: "drug", r: 14, color: "#10b981" },
    { id: "Inclisiran", x: 610, y: 190, type: "drug", r: 14, color: "#10b981" },
    { id: "FOURIER", x: 350, y: 100, type: "paper", r: 12, color: "#8b5cf6" },
    { id: "ODYSSEY", x: 240, y: 80, type: "paper", r: 12, color: "#8b5cf6" },
    { id: "CV Death", x: 460, y: 420, type: "outcome", r: 16, color: "#f59e0b" },
    { id: "MI", x: 550, y: 420, type: "outcome", r: 14, color: "#f59e0b" },
  ];
  
  const edges: [string, string, number][] = [
    ["PCSK9", "LDL-C", 0.95], ["PCSK9", "Evolocumab", 0.98], ["PCSK9", "Alirocumab", 0.95],
    ["PCSK9", "FOURIER", 0.9], ["PCSK9", "ODYSSEY", 0.88], ["PCSK9", "LDLR", 0.85],
    ["LDL-C", "FH", 0.92], ["LDL-C", "ASCVD", 0.89], ["LDLR", "FH", 0.96],
    ["Evolocumab", "FOURIER", 0.98], ["Alirocumab", "ODYSSEY", 0.97],
    ["FH", "ASCVD", 0.88], ["ASCVD", "CV Death", 0.82], ["ASCVD", "MI", 0.78],
    ["ANGPTL3", "Evinacumab", 0.91], ["ANGPTL3", "FH", 0.65],
    ["PCSK9", "Inclisiran", 0.9], ["APOB", "FH", 0.75], ["Evinacumab", "CV Death", 0.6],
  ];
  
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const typeColors: Record<string, string> = { 
    gene: "bg-primary text-primary border-primary", 
    drug: "bg-success text-success border-success", 
    disease: "bg-danger text-danger border-danger", 
    paper: "bg-accent text-accent border-accent", 
    biomarker: "bg-cyan-500 text-cyan-500 border-cyan-500", 
    outcome: "bg-warning text-warning border-warning" 
  };
  const typeLabels = ["gene", "drug", "disease", "paper", "biomarker", "outcome"];

  return (
    <div className="flex-1 flex overflow-hidden bg-surface">
      {/* Graph Area */}
      <div className="flex-1 relative overflow-hidden bg-background">
        <svg width="100%" height="100%" viewBox="0 0 740 500">
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGrad)" />

          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          {edges.map(([a, b, conf], i) => {
            const na = nodeMap[a];
            const nb = nodeMap[b];
            if (!na || !nb) return null;
            return (
              <line 
                key={i} 
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={conf > 0.85 ? "#94a3b8" : "#cbd5e1"}
                strokeWidth={conf > 0.85 ? 2 : 1}
                strokeDasharray={conf < 0.8 ? "4 4" : "none"}
                opacity={0.6}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <g 
              key={node.id} 
              onMouseEnter={() => setHoveredNode(node.id)} 
              onMouseLeave={() => setHoveredNode(null)} 
              className="cursor-pointer transition-transform duration-200"
              style={{ transformOrigin: `${node.x}px ${node.y}px`, transform: hoveredNode === node.id ? 'scale(1.1)' : 'scale(1)' }}
            >
              {/* Outer halo */}
              <circle cx={node.x} cy={node.y} r={node.r + 8} fill={node.color} opacity={hoveredNode === node.id ? 0.2 : 0.1} />
              {/* Main circle */}
              <circle cx={node.x} cy={node.y} r={node.r} fill="#ffffff" stroke={node.color} strokeWidth="3" />
              {/* Center dot */}
              <circle cx={node.x} cy={node.y} r={node.r - 8} fill={node.color} opacity={0.8} />
              
              <text x={node.x} y={node.y + node.r + 16} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="500">
                {node.id}
              </text>
            </g>
          ))}
          
          {/* Tooltip */}
          {hoveredNode && (() => {
            const n = nodeMap[hoveredNode];
            return (
              <g pointerEvents="none">
                <rect x={n.x - 50} y={n.y - n.r - 40} width={100} height={28} rx={6} fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
                <text x={n.x} y={n.y - n.r - 26} textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="bold">{n.id}</text>
                <text x={n.x} y={n.y - n.r - 16} textAnchor="middle" fontSize="9" fill="#64748b" className="uppercase tracking-wider">{n.type}</text>
              </g>
            );
          })()}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 bg-surface/90 backdrop-blur-sm border border-border-light rounded-xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Entity Types</div>
          <div className="flex flex-col gap-2">
            {typeLabels.map(t => (
              <div key={t} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full border-2 ${typeColors[t].split(' ')[2]} ${typeColors[t].split(' ')[0].replace('bg-', 'bg-').replace('-500', '-100')} bg-opacity-20`} />
                <span className="text-xs text-text-muted capitalize font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-6 left-6 flex bg-surface border border-border-light rounded-lg shadow-sm">
          <button className="p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-l-lg border-r border-border-light"><ZoomIn size={16} /></button>
          <button className="p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-r-lg"><ZoomOut size={16} /></button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[320px] border-l border-border-light bg-surface p-6 overflow-auto flex flex-col gap-8 shrink-0 z-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Selected Node</h3>
            <Badge color="primary">Gene</Badge>
          </div>
          <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-primary mb-4">PCSK9</div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                <span className="text-xs text-text-muted font-medium">Connections</span>
                <span className="text-sm font-bold text-foreground">8 direct</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                <span className="text-xs text-text-muted font-medium">Literature Base</span>
                <span className="text-sm font-bold text-foreground">4,217 papers</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-primary/10">
                <span className="text-xs text-text-muted font-medium">Network Centrality</span>
                <span className="text-sm font-bold text-success">0.97</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-4">Top Relationships</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: "PCSK9 → Evolocumab", val: 98 },
              { label: "PCSK9 → LDLR", val: 85 },
              { label: "LDL-C → ASCVD", val: 89 },
              { label: "ANGPTL3 → FH", val: 65 }
            ].map((rel, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-foreground">{rel.label}</span>
                  <span className={`text-xs font-bold ${rel.val > 85 ? "text-success" : "text-warning"}`}>{rel.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${rel.val > 85 ? "bg-success" : "bg-warning"}`} 
                    style={{ width: `${rel.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent-light border border-accent/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            Missing edge detected: <span className="font-semibold">PCSK9 × NLRP3 inflammasome pathway</span> — 12 papers support an indirect link. Add relationship to graph?
          </p>
        </div>
      </div>
    </div>
  );
}
