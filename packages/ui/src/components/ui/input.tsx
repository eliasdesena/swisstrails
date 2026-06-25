import * as React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, suffix, error, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-11 bg-trail-800 border border-stone-800 rounded-xl text-sm text-fg placeholder:text-fg-subtle",
            "px-4 outline-none transition-all duration-150",
            "hover:border-stone-700",
            "focus:border-alpine-600 focus:ring-2 focus:ring-alpine-900/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-10",
            suffix && "pr-10",
            error && "border-red-700 focus:border-red-600 focus:ring-red-900/50",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-subtle">
            {suffix}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
