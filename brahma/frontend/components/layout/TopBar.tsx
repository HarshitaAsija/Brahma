import React from "react";
import { Search, Bell } from "lucide-react";
import { Badge } from "../shared/Badge";

interface TopBarProps {
  page: string;
}

export function TopBar({ page }: TopBarProps) {
  const pageLabelMap: Record<string, string> = {
    dashboard: "Dashboard",
    literature: "Literature Explorer",
    assistant: "AI Research Assistant",
    graph: "Knowledge Graph",
    hypothesis: "Hypotheses Generator",
    gaps: "Research Gaps",
    study: "Study Designer",
    collab: "Collaboration Space",
  };

  const pageLabel = pageLabelMap[page] || "Dashboard";

  return (
    <div className="h-14 bg-surface border-b border-border-light flex items-center px-6 gap-4 flex-shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-muted tracking-wider uppercase">BRAHMA</span>
        <span className="text-border-med font-light">/</span>
        <span className="text-sm font-semibold text-foreground">{pageLabel}</span>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-3 bg-surface-hover border border-border-med rounded-lg px-3 py-1.5 w-80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Search size={14} className="text-text-dim" />
        <input 
          type="text" 
          placeholder="Search literature, entities, hypotheses..." 
          className="bg-transparent border-none outline-none text-xs text-foreground w-full placeholder:text-text-dim"
        />
        <span className="ml-auto text-[10px] text-text-muted font-medium bg-border-light/50 border border-border-med rounded px-1.5 py-0.5 whitespace-nowrap">
          ⌘K
        </span>
      </div>
      
      <div className="flex items-center gap-4 ml-2">
        <div className="relative cursor-pointer text-text-muted hover:text-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-danger border border-surface" />
        </div>
        
        <Badge color="accent" className="hidden md:inline-flex shadow-sm">
          3 agents running
        </Badge>
        
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-surface border border-border-light cursor-pointer">
          AK
        </div>
      </div>
    </div>
  );
}
