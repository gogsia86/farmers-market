"use client";

/**
 * SCROLL AREA COMPONENT
 * Simple scroll area wrapper for AI components
 */

import * as React from "react";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-auto ${className}`}
        {...props}
      >
        <div data-radix-scroll-area-viewport className="h-full w-full">
          {children}
        </div>
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
