"use client";
import React, { useState } from "react";
import { Sidebar } from "./layout/Sidebar";
import { TopBar } from "./layout/TopBar";
import { Dashboard } from "./dashboard/Dashboard";
import { LiteratureExplorer } from "./literature/LiteratureExplorer";
import { AIAssistant } from "./assistant/AIAssistant";
import { KnowledgeGraph } from "./features/KnowledgeGraph";
import { HypothesisGenerator } from "./features/HypothesisGenerator";
import { ResearchGaps } from "./features/ResearchGaps";
import { StudyDesigner } from "./features/StudyDesigner";
import { Collaboration } from "./features/Collaboration";

export default function BrahmaApp() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "literature":
        return <LiteratureExplorer />;
      case "assistant":
        return <AIAssistant />;
      case "graph":
        return <KnowledgeGraph />;
      case "hypothesis":
        return <HypothesisGenerator />;
      case "gaps":
        return <ResearchGaps />;
      case "study":
        return <StudyDesigner />;
      case "collab":
        return <Collaboration />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar page={activePage} />
        {renderPage()}
      </div>
    </div>
  );
}
