import React from "react";

interface ScoreBarProps {
  value: number;
  label?: string;
  color?: "primary" | "success" | "warning" | "danger" | "accent";
  className?: string;
}

export function ScoreBar({ value, label, color = "primary", className = "" }: ScoreBarProps) {
  const colorBgClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    accent: "bg-accent",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && <span className="text-xs font-medium text-text-muted w-20 flex-shrink-0">{label}</span>}
      <div className="flex-1 h-2 bg-surface-hover border border-border-light rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colorBgClasses[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-muted w-8 text-right">{value}%</span>
    </div>
  );
}
