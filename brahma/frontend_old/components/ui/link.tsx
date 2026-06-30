import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const linkVariants = {
  default: "text-primary hover:text-primary/80 transition-colors",
  hover: "text-primary hover:text-primary/80 transition-colors underline",
  muted: "text-muted-foreground hover:text-muted-foreground/80 transition-colors",
};

interface LinkProps extends React.LinkHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof linkVariants;
  className?: string;
}

const LinkComponent = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({
    className,
    variant = "default",
    ...props
  }, ref) => {
    return (
      <Link
        ref={ref}
        {...props}
        className={cn(linkVariants[variant], className)}
      >
        {props.children}
      </Link>
    );
  }
);
LinkComponent.displayName = "Link";

export { LinkComponent as Link, linkVariants };