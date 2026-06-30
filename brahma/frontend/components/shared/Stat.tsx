import React from "react";
import { Card } from "./Card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number;
  color?: "primary" | "success" | "warning" | "danger" | "accent" | "cyan";
  className?: string;
}

export function Stat({ label, value, sub, delta, color = "primary", className = "" }: StatProps) {
  const colorClasses = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    accent: "text-accent",
    cyan: "text-cyan-500", // Using a raw tailwind class for cyan if needed, else we map to a similar variable.
  };

  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="text-[11px] text-text-muted mb-1.5 uppercase tracking-wider font-semibold">
        {label}
      </div>
      <div className={`text-3xl font-bold tracking-tight mb-1 ${colorClasses[color]}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-text-dim mt-1">{sub}</div>}
      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${delta > 0 ? "text-success" : "text-danger"}`}>
          {delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(delta)}% this week</span>
        </div>
      )}
    </Card>
  );
}
