// TODO: Implement select component properly
// For now, creating a basic version to unblock development
import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// This is a simplified version - in a real app, you'd use @radix-ui/react-select
const Select = React.forwardRef<
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
  },
  HTMLDivElement
>(({ className, value, onValueChange, placeholder, children, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  };

  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      {...props}
    >
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
          className
        )}
      />
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>(({ className, children, ...props }, ref) => (
  <span ref={ref} className={cn("text-sm font-medium", className)} {...props}>
    {children}
  </span>
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 mt-2 max-h-60 w-full overflow-hidden rounded-md border bg-popover p-1 text-sm shadow-lg",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    )}
    {...props}
  />
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
  },
  HTMLDivElement
>(({ className, value, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};