"use client";

/**
 * 🎴 UNIFIED CARD COMPONENT
 * Consolidated Card and AgriculturalCard into single component with variants
 *
 * Variants:
 * - default: Standard white card (general purpose)
 * - agricultural: Farm/product themed card with earth tones
 * - divine: Premium gradient card for special features
 * - outline: Border-only card for minimal design
 *
 * Features:
 * - Interactive hover states
 * - Consistent padding and spacing
 * - Composable sub-components
 * - Full TypeScript support
 *
 * Reference: DESIGN_SYSTEM_ANALYSIS.md - Card Component Section
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "agricultural" | "divine" | "outline";
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  variant = "default",
  interactive = false,
  onClick,
}: CardProps) {
  const isClickable = onClick || interactive;

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        {
          // Default variant - Standard white card
          "bg-white shadow-md": variant === "default",

          // Agricultural variant - Farm/product themed
          "bg-agricultural-50 border-2 border-agricultural-200 shadow-md":
            variant === "agricultural",

          // Divine variant - Premium gradient
          "bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg border border-purple-200":
            variant === "divine",

          // Outline variant - Border only
          "bg-white border-2 border-gray-200 shadow-sm": variant === "outline",

          // Interactive states
          "cursor-pointer transition-shadow duration-300": isClickable,
          "hover:shadow-lg": isClickable && variant === "default",
          "hover:shadow-xl hover:border-agricultural-400":
            isClickable && variant === "agricultural",
          "hover:shadow-xl hover:border-purple-300":
            isClickable && variant === "divine",
          "hover:shadow-md hover:border-gray-300":
            isClickable && variant === "outline",
        },
        className,
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

// Alias for compatibility with shadcn/ui naming
export const CardContent = CardBody;

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("px-6 py-4 bg-gray-50 border-t border-gray-200", className)}
    >
      {children}
    </div>
  );
}

// Backward compatibility exports
export const AgriculturalCard = Card;
export const AgriculturalCardHeader = CardHeader;
export const AgriculturalCardBody = CardBody;
export const AgriculturalCardFooter = CardFooter;
