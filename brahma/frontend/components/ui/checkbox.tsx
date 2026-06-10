import * as React from "react";
import { cn } from "@/lib/utils";

const checkboxVariants = {
  default: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2",
  checked: "bg-primary border-primary",
};

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckboxComponent = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked ?? false}
        className={cn(
          checkboxVariants.default,
          checked ? checkboxVariants.checked : "",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
CheckboxComponent.displayName = "Checkbox";

export { CheckboxComponent as Checkbox, checkboxVariants };