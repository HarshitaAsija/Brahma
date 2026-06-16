import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
};

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"div"> {
  variant?: keyof typeof badgeVariants;
}

const Badge = React.forwardRef<
  HTMLSpanElement,
  BadgeProps
>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
      badgeVariants[variant],
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };