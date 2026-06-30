import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border-light rounded-xl p-4 shadow-sm transition-all duration-200 ${
        hoverable ? "hover:shadow-md hover:border-border-med" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
