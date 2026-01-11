/**
 * 🌟 Textarea Component - Divine Multi-line Input
 * Reusable textarea component with variants and accessibility
 * Following: 08_UX_DESIGN_CONSCIOUSNESS
 */

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-vertical",
  {
    variants: {
      variant: {
        default: "border-gray-300 hover:border-gray-400 focus:border-blue-500",
        error: "border-red-500 focus:border-red-600 focus:ring-red-500",
        success: "border-green-500 focus:border-green-600 focus:ring-green-500",
        agricultural:
          "border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
