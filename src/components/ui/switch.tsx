// ============================================
// SWITCH UI COMPONENT
// ============================================
// Simple toggle switch component without external dependencies
// Follows divine agricultural patterns with type safety

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent transition-colors",
            "peer-checked:bg-primary peer-unchecked:bg-input",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute left-0 block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            "peer-checked:translate-x-5 peer-unchecked:translate-x-0",
          )}
        />
      </label>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
