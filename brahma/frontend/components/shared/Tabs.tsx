"use client";
import React, { useState } from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex space-x-1 border-b border-border-light overflow-x-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-foreground hover:border-border-med"
              }`}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4 flex-1">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}
