"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
    "transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpine-400 focus-visible:ring-offset-2 focus-visible:ring-offset-trail-950",
    "disabled:opacity-40 disabled:pointer-events-none",
    "whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        gold: [
          "bg-gold-400 text-trail-950 font-semibold",
          "hover:bg-gold-300",
          "active:bg-gold-500 active:scale-[0.99]",
        ].join(" "),
        alpine: [
          "bg-alpine-600 text-white font-semibold",
          "hover:bg-alpine-500",
          "active:bg-alpine-700 active:scale-[0.99]",
        ].join(" "),
        outline: [
          "border border-stone-800 bg-transparent text-stone-400",
          "hover:bg-trail-800 hover:text-fg",
          "active:scale-[0.99]",
        ].join(" "),
        ghost: [
          "bg-transparent text-stone-500",
          "hover:text-fg-muted",
          "active:scale-[0.99]",
        ].join(" "),
        glass: [
          "bg-trail-800/60 backdrop-blur-sm border border-stone-900 text-fg",
          "hover:bg-trail-700/80",
          "active:scale-[0.99]",
        ].join(" "),
        danger: [
          "bg-red-900 text-red-300",
          "hover:bg-red-800",
          "active:scale-[0.99]",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3.5 text-sm",
        md: "h-9 px-5 text-sm",
        lg: "h-11 px-7 text-sm",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-11 w-11",
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
