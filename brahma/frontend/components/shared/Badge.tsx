import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "primary" | "success" | "warning" | "danger" | "accent" | "gray";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, color = "primary", size = "sm", className = "" }: BadgeProps) {
  const colorClasses = {
    primary: "bg-primary-light text-primary border-primary/20",
    success: "bg-success-light text-success border-success/20",
    warning: "bg-warning-light text-warning border-warning/20",
    danger: "bg-danger-light text-danger border-danger/20",
    accent: "bg-accent-light text-accent border-accent/20",
    gray: "bg-surface-hover text-text-muted border-border-med",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full whitespace-nowrap ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
