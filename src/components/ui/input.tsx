/**
 * 🌟 Input Component - Divine Form Field
 * Reusable input component with variants and accessibility
 * Following: 08_UX_DESIGN_CONSCIOUSNESS
 */

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const inputVariants = cva(
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-gray-400 focus:border-blue-500",
        error: "border-red-500 focus:border-red-600 focus:ring-red-500",
        success: "border-green-500 focus:border-green-600 focus:ring-green-500",
        agricultural: "border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-green-500",
      },
      inputSize: {
        sm: "h-8 text-xs px-2",
        default: "h-10",
        lg: "h-12 text-base px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
