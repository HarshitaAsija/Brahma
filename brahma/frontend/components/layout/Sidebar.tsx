import React from "react";
import { 
  LayoutDashboard, 
  Library, 
  Bot, 
  Network, 
  Lightbulb, 
  Telescope, 
  Microscope, 
  Users 
} from "lucide-react";

const navItems = [
  { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { id: "literature", icon: <Library size={20} />, label: "Literature" },
  { id: "assistant", icon: <Bot size={20} />, label: "AI Assistant" },
  { id: "graph", icon: <Network size={20} />, label: "Knowledge Graph" },
  { id: "hypothesis", icon: <Lightbulb size={20} />, label: "Hypotheses" },
  { id: "gaps", icon: <Telescope size={20} />, label: "Research Gaps" },
  { id: "study", icon: <Microscope size={20} />, label: "Study Designer" },
  { id: "collab", icon: <Users size={20} />, label: "Collaboration" },
];

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  return (
    <div className="w-16 bg-surface border-r border-border-light flex flex-col items-center py-4 gap-2 flex-shrink-0 z-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg mb-4 shadow-sm shadow-primary/20">
        B
      </div>
      
      {navItems.map((item) => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            title={item.label}
            className={`w-10 h-10 rounded-xl border-none cursor-pointer flex items-center justify-center transition-all duration-150 ${
              isActive 
                ? "bg-primary-light text-primary shadow-sm ring-1 ring-primary/20" 
                : "bg-transparent text-text-dim hover:text-text-muted hover:bg-surface-hover"
            }`}
          >
            {item.icon}
          </button>
        );
      })}
      
      <div className="flex-1" />
      
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-success mb-2 border-2 border-surface shadow-sm" title="User Profile" />
    </div>
  );
}
