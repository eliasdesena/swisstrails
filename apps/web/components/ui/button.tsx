"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "transition-all duration-200 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpine-400 focus-visible:ring-offset-2 focus-visible:ring-offset-trail-950",
    "disabled:opacity-40 disabled:pointer-events-none",
    "whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        gold: [
          "bg-gold-400 text-trail-950 font-semibold",
          "hover:bg-gold-300 hover:shadow-[0_0_28px_rgba(245,184,40,0.35)]",
          "active:bg-gold-500 active:scale-[0.98]",
        ].join(" "),
        alpine: [
          "bg-alpine-400 text-trail-950 font-semibold",
          "hover:bg-alpine-300 hover:shadow-[0_0_28px_rgba(81,94,255,0.35)]",
          "active:bg-alpine-500 active:scale-[0.98]",
        ].join(" "),
        outline: [
          "border border-stone-700 bg-transparent text-stone-200",
          "hover:bg-trail-800 hover:border-stone-500 hover:text-fg",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "bg-transparent text-fg-muted",
          "hover:bg-trail-800 hover:text-fg",
          "active:scale-[0.98]",
        ].join(" "),
        glass: [
          "bg-trail-800/60 backdrop-blur-sm border border-stone-800 text-fg",
          "hover:bg-trail-700/80 hover:border-stone-700",
          "active:scale-[0.98]",
        ].join(" "),
        danger: [
          "bg-red-900 text-red-200 border border-red-800",
          "hover:bg-red-800 hover:text-red-100",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
