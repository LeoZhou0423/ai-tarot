import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-tarot-purple/30 bg-tarot-dark/50 px-4 py-3 text-tarot-light placeholder:text-tarot-light/40 focus-visible:outline-none focus-visible:border-tarot-gold/50 focus-visible:ring-2 focus-visible:ring-tarot-gold/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
