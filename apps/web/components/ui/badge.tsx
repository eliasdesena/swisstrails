import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium text-xs transition-colors",
  {
    variants: {
      variant: {
        default: "bg-trail-800 text-fg-muted border border-stone-800",
        alpine: "bg-alpine-900 text-alpine-300 border border-alpine-800",
        gold: "bg-gold-950 text-gold-300 border border-gold-900",
        outline: "border border-stone-700 text-fg-muted bg-transparent",
        success: "bg-green-950 text-green-300 border border-green-900",
        error: "bg-red-950 text-red-300 border border-red-900",
        info: "bg-blue-950 text-blue-300 border border-blue-900",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
