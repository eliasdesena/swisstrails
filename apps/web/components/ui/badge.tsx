import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded font-medium text-xs transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.06] text-stone-400",
        alpine: "bg-alpine-900/60 text-alpine-300",
        gold: "bg-gold-950 text-gold-300",
        outline: "border border-stone-800 text-stone-500 bg-transparent",
        success: "bg-green-950/60 text-green-400",
        error: "bg-red-950/60 text-red-400",
        info: "bg-blue-950/60 text-blue-400",
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
