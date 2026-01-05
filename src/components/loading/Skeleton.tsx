/**
 * Skeleton Component
 *
 * Base skeleton loading component with multiple variants and animations.
 * Supports text, circular, rectangular, and custom shapes with pulse,
 * wave, and shimmer animations.
 *
 * @module components/loading/Skeleton
 */

"use client";

import { cva } from "class-variance-authority";
import * as React from "react";

import {
  DEFAULT_SKELETON_CONFIG
} from "@/lib/loading/types";
import { cn } from "@/lib/utils";

// ============================================================================
// SKELETON VARIANTS
// ============================================================================

const skeletonVariants = cva("relative overflow-hidden", {
  variants: {
    variant: {
      text: "h-4 w-full rounded",
      circular: "rounded-full aspect-square",
      rectangular: "w-full rounded-sm",
      rounded: "w-full rounded-lg",
      avatar: "rounded-full w-10 h-10",
      card: "w-full h-48 rounded-lg",
      thumbnail: "w-24 h-24 rounded-md",
    },
    animation: {
      pulse: "animate-pulse",
      wave: "animate-wave",
      shimmer: "animate-shimmer",
      none: "",
    },
  },
  defaultVariants: {
    variant: "rectangular",
    animation: "pulse",
  },
});

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

// Define animation type to match cva variants
type SkeletonAnimationType = "pulse" | "wave" | "shimmer" | "none";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Appearance
  variant?: "text" | "circular" | "rectangular" | "rounded" | "avatar" | "card" | "thumbnail";
  animation?: SkeletonAnimationType;

  // Dimensions
  width?: string | number;
  height?: string | number;

  // Multiple skeletons
  count?: number;

  // Styling
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string | number;
  speed?: number;

  // Accessibility
  "aria-label"?: string;
}

/**
 * Base Skeleton component
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton variant="text" count={3} />
 *
 * // Avatar skeleton
 * <Skeleton variant="avatar" />
 *
 * // Custom size
 * <Skeleton width={200} height={100} />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "rectangular",
      animation = "pulse",
      width,
      height,
      count = 1,
      baseColor,
      highlightColor,
      borderRadius,
      speed,
      className,
      style,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    // Build inline styles
    const inlineStyles: React.CSSProperties = {
      ...style,
      width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
      height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
      backgroundColor: baseColor || DEFAULT_SKELETON_CONFIG.baseColor,
      borderRadius: borderRadius || DEFAULT_SKELETON_CONFIG.borderRadius,
      ...(speed && {
        animationDuration: `${speed}s`,
      }),
    };

    // Generate multiple skeletons if count > 1
    if (count > 1) {
      const animationValue: SkeletonAnimationType = (animation || "pulse") as SkeletonAnimationType;

      return (
        <div className="space-y-2" role="status" aria-label={ariaLabel || "Loading"}>
          {Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              ref={index === 0 ? ref : undefined}
              className={cn(skeletonVariants({ variant, animation: animationValue }), className)}
              style={inlineStyles}
              {...props}
            />
          ))}
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    const animationValue: SkeletonAnimationType = (animation || "pulse") as SkeletonAnimationType;

    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel || "Loading"}
        className={cn(skeletonVariants({ variant, animation: animationValue }), className)}
        style={inlineStyles}
        {...props}
      >
        {animation === "shimmer" && (
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer-sweep"
            style={{
              background: `linear-gradient(90deg, transparent, ${highlightColor || DEFAULT_SKELETON_CONFIG.highlightColor
                }, transparent)`,
            }}
          />
        )}
        {animation === "wave" && (
          <div
            className="absolute inset-0 -translate-x-full animate-wave-sweep"
            style={{
              background: `linear-gradient(90deg, transparent, ${highlightColor || DEFAULT_SKELETON_CONFIG.highlightColor
                }, transparent)`,
            }}
          />
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";

// ============================================================================
// SPECIALIZED SKELETON COMPONENTS
// ============================================================================

/**
 * Text Skeleton - Multiple lines of text
 */
export interface TextSkeletonProps extends Omit<SkeletonProps, "variant"> {
  lines?: number;
  lastLineWidth?: string | number;
}

export const TextSkeleton = React.forwardRef<HTMLDivElement, TextSkeletonProps>(
  ({ lines = 3, lastLineWidth = "80%", className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? lastLineWidth : "100%"}
            {...props}
          />
        ))}
      </div>
    );
  }
);

TextSkeleton.displayName = "TextSkeleton";

/**
 * Avatar Skeleton with optional label
 */
export interface AvatarSkeletonProps extends Omit<SkeletonProps, "variant"> {
  size?: number;
  showLabel?: boolean;
  labelWidth?: string | number;
}

export const AvatarSkeleton = React.forwardRef<HTMLDivElement, AvatarSkeletonProps>(
  ({ size = 40, showLabel = false, labelWidth = 100, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center gap-3", className)}>
        <Skeleton variant="circular" width={size} height={size} {...props} />
        {showLabel && (
          <div className="flex-1">
            <Skeleton variant="text" width={labelWidth} height={16} {...props} />
          </div>
        )}
      </div>
    );
  }
);

AvatarSkeleton.displayName = "AvatarSkeleton";

/**
 * Card Skeleton - Complete card layout
 */
export interface CardSkeletonProps extends Omit<SkeletonProps, "variant"> {
  showImage?: boolean;
  imageHeight?: number;
  showAvatar?: boolean;
  textLines?: number;
}

export const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  (
    {
      showImage = true,
      imageHeight = 200,
      showAvatar = false,
      textLines = 3,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-lg border border-gray-200 bg-white p-4", className)}
      >
        {showImage && (
          <Skeleton
            variant="rectangular"
            height={imageHeight}
            className="mb-4"
            {...props}
          />
        )}

        {showAvatar && <AvatarSkeleton showLabel className="mb-4" {...props} />}

        <div className="space-y-3">
          <Skeleton variant="text" width="60%" height={20} {...props} />
          <TextSkeleton lines={textLines} {...props} />
        </div>
      </div>
    );
  }
);

CardSkeleton.displayName = "CardSkeleton";

/**
 * List Skeleton - Multiple list items
 */
export interface ListSkeletonProps extends Omit<SkeletonProps, "variant"> {
  items?: number;
  showAvatar?: boolean;
  textLines?: number;
}

export const ListSkeleton = React.forwardRef<HTMLDivElement, ListSkeletonProps>(
  ({ items = 5, showAvatar = true, textLines = 2, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {Array.from({ length: items }, (_, index) => (
          <div key={index} className="flex items-start gap-3">
            {showAvatar && (
              <Skeleton variant="circular" width={40} height={40} {...props} />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" height={16} {...props} />
              <TextSkeleton lines={textLines} {...props} />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ListSkeleton.displayName = "ListSkeleton";

/**
 * Table Skeleton - Table rows
 */
export interface TableSkeletonProps extends Omit<SkeletonProps, "variant"> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton = React.forwardRef<HTMLTableElement, TableSkeletonProps>(
  ({ rows = 5, columns = 4, showHeader = true, className, ...props }, ref) => {
    return (
      <table ref={ref} className={cn("w-full", className)}>
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <Skeleton variant="text" width="80%" height={16} {...props} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton variant="text" height={16} {...props} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
);

TableSkeleton.displayName = "TableSkeleton";

/**
 * Grid Skeleton - Grid of items
 */
export interface GridSkeletonProps extends Omit<SkeletonProps, "variant"> {
  items?: number;
  columns?: number;
  itemHeight?: number;
}

export const GridSkeleton = React.forwardRef<HTMLDivElement, GridSkeletonProps>(
  ({ items = 6, columns = 3, itemHeight = 200, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-4", `grid-cols-${columns}`, className)}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: items }, (_, index) => (
          <Skeleton
            key={index}
            variant="card"
            height={itemHeight}
            {...props}
          />
        ))}
      </div>
    );
  }
);

GridSkeleton.displayName = "GridSkeleton";

// ============================================================================
// SKELETON GROUP COMPONENT
// ============================================================================

/**
 * SkeletonGroup - Wrapper for multiple skeleton variants
 */
export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: "vertical" | "horizontal" | "grid";
  gap?: number;
}

export const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ layout = "vertical", gap = 4, className, children, ...props }, ref) => {
    const layoutClasses = {
      vertical: "flex flex-col",
      horizontal: "flex flex-row",
      grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };

    const gapClass = `gap-${gap}`;

    return (
      <div
        ref={ref}
        className={cn(layoutClasses[layout], gapClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SkeletonGroup.displayName = "SkeletonGroup";

// ============================================================================
// EXPORTS
// ============================================================================

export default Skeleton;
