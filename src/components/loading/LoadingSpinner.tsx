/**
 * Loading Spinner Components
 *
 * Collection of loading spinner variants including default, dots, bars,
 * circle, pulse, and agricultural-themed spinners with seasonal awareness.
 *
 * @module components/loading/LoadingSpinner
 */

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Wheat } from "lucide-react";
import * as React from "react";

import type {
  SeasonalLoadingTheme,
  SpinnerConfig,
  SpinnerSize,
  SpinnerVariant,
} from "@/lib/loading/types";
import {
  getCurrentSeason,
  getSeasonalColors,
} from "@/lib/loading/utils";
import { cn } from "@/lib/utils";

// ============================================================================
// SPINNER VARIANTS
// ============================================================================

const spinnerVariants = cva(
  "inline-block animate-spin",
  {
    variants: {
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
      },
      color: {
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        muted: "text-muted-foreground",
        success: "text-green-600",
        warning: "text-amber-600",
        error: "text-red-600",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
);

// ============================================================================
// BASE LOADING SPINNER
// ============================================================================

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Partial<SpinnerConfig>,
  Omit<VariantProps<typeof spinnerVariants>, "color"> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  color?: string;
  label?: string;
  showLabel?: boolean;
}

/**
 * Base Loading Spinner component
 *
 * @example
 * ```tsx
 * <LoadingSpinner variant="default" size="md" />
 * <LoadingSpinner variant="dots" label="Loading..." showLabel />
 * <LoadingSpinner variant="agricultural" />
 * ```
 */
export const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  LoadingSpinnerProps
>(
  (
    {
      variant = "default",
      size = "md",
      color,
      speed = 1,
      label = "Loading...",
      showLabel = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const spinnerStyle: React.CSSProperties = {
      ...style,
      animationDuration: `${speed}s`,
      ...(color && { color }),
    };

    const renderSpinner = () => {
      switch (variant) {
        case "default":
          return (
            <Loader2
              className={cn(spinnerVariants({ size }), className)}
              style={spinnerStyle}
            />
          );

        case "dots":
          return <DotsSpinner size={size} color={color} speed={speed} />;

        case "bars":
          return <BarsSpinner size={size} color={color} speed={speed} />;

        case "circle":
          return <CircleSpinner size={size} color={color} speed={speed} />;

        case "pulse":
          return <PulseSpinner size={size} color={color} speed={speed} />;

        case "agricultural":
          return <AgriculturalSpinner size={size} speed={speed} />;

        default:
          return (
            <Loader2
              className={cn(spinnerVariants({ size }), className)}
              style={spinnerStyle}
            />
          );
      }
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {renderSpinner()}
        {showLabel && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// ============================================================================
// DOTS SPINNER
// ============================================================================

interface DotsSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  speed?: number;
}

function DotsSpinner({
  size = "md",
  color = "currentColor",
  speed = 1,
}: DotsSpinnerProps) {
  const sizeMap = {
    xs: { dot: 2, gap: 1 },
    sm: { dot: 3, gap: 1.5 },
    md: { dot: 4, gap: 2 },
    lg: { dot: 6, gap: 3 },
    xl: { dot: 8, gap: 4 },
  };

  const { dot, gap } = sizeMap[size];

  return (
    <div className="flex items-center" style={{ gap: `${gap}px` }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="rounded-full animate-bounce"
          style={{
            width: `${dot}px`,
            height: `${dot}px`,
            backgroundColor: color,
            animationDelay: `${index * 0.15}s`,
            animationDuration: `${speed}s`,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// BARS SPINNER
// ============================================================================

interface BarsSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  speed?: number;
}

function BarsSpinner({
  size = "md",
  color = "currentColor",
  speed = 1,
}: BarsSpinnerProps) {
  const sizeMap = {
    xs: { height: 12, width: 2, gap: 1.5 },
    sm: { height: 16, width: 3, gap: 2 },
    md: { height: 24, width: 4, gap: 2.5 },
    lg: { height: 32, width: 5, gap: 3 },
    xl: { height: 48, width: 6, gap: 4 },
  };

  const { height, width, gap } = sizeMap[size];

  return (
    <div className="flex items-center" style={{ gap: `${gap}px` }}>
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="rounded-sm animate-pulse"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: color,
            animationDelay: `${index * 0.1}s`,
            animationDuration: `${speed}s`,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// CIRCLE SPINNER
// ============================================================================

interface CircleSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  speed?: number;
}

function CircleSpinner({
  size = "md",
  color = "currentColor",
  speed = 1,
}: CircleSpinnerProps) {
  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 32,
    lg: 40,
    xl: 56,
  };

  const dimension = sizeMap[size];
  const strokeWidth = Math.max(2, dimension / 10);

  return (
    <svg
      className="animate-spin"
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill="none"
      style={{ animationDuration: `${speed}s` }}
    >
      <circle
        className="opacity-25"
        cx={dimension / 2}
        cy={dimension / 2}
        r={(dimension - strokeWidth) / 2}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        className="opacity-75"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        d={`M ${dimension / 2} ${strokeWidth / 2} a ${(dimension - strokeWidth) / 2
          } ${(dimension - strokeWidth) / 2} 0 0 1 0 ${dimension - strokeWidth}`}
      />
    </svg>
  );
};

// ============================================================================
// PULSE SPINNER
// ============================================================================

interface PulseSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  speed?: number;
}

function PulseSpinner({
  size = "md",
  color = "currentColor",
  speed = 1,
}: PulseSpinnerProps) {
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const dimension = sizeMap[size];

  return (
    <div className="relative" style={{ width: dimension, height: dimension }}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            backgroundColor: color,
            opacity: 0.2 - index * 0.05,
            animationDelay: `${index * 0.2}s`,
            animationDuration: `${speed * 1.5}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: color,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

// ============================================================================
// AGRICULTURAL SPINNER
// ============================================================================

interface AgriculturalSpinnerProps {
  size?: SpinnerSize;
  speed?: number;
  season?: SeasonalLoadingTheme;
}

function AgriculturalSpinner({
  size = "md",
  speed = 1,
  season,
}: AgriculturalSpinnerProps) {
  const currentSeason = season || getCurrentSeason();
  const colors = getSeasonalColors(currentSeason);

  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 32,
    lg: 40,
    xl: 56,
  };

  const dimension = sizeMap[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Rotating wheat icon */}
      <Wheat
        className="animate-spin"
        size={dimension}
        style={{
          color: colors.primary,
          animationDuration: `${speed * 2}s`,
        }}
      />

      {/* Seasonal pulse effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-20",
          `bg-gradient-to-br ${colors.gradient}`
        )}
        style={{
          animationDuration: `${speed * 2}s`,
        }}
      />
    </div>
  );
};

// ============================================================================
// CENTERED LOADING SPINNER
// ============================================================================

export interface CenteredLoadingSpinnerProps extends LoadingSpinnerProps {
  fullScreen?: boolean;
  backdrop?: boolean;
  message?: string;
}

/**
 * Centered Loading Spinner
 *
 * Displays a spinner centered in its container or full screen
 *
 * @example
 * ```tsx
 * <CenteredLoadingSpinner fullScreen message="Loading data..." />
 * ```
 */
export const CenteredLoadingSpinner = React.forwardRef<
  HTMLDivElement,
  CenteredLoadingSpinnerProps
>(
  (
    {
      fullScreen = false,
      backdrop = false,
      message,
      variant = "default",
      size = "lg",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4",
          fullScreen && "fixed inset-0 z-50",
          !fullScreen && "w-full h-full min-h-[200px]",
          backdrop && "bg-black/20 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <LoadingSpinner variant={variant} size={size} />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }
);

CenteredLoadingSpinner.displayName = "CenteredLoadingSpinner";

// ============================================================================
// INLINE LOADING SPINNER
// ============================================================================

export interface InlineLoadingSpinnerProps extends LoadingSpinnerProps {
  text?: string;
  position?: "left" | "right";
}

/**
 * Inline Loading Spinner
 *
 * Displays a spinner inline with text
 *
 * @example
 * ```tsx
 * <InlineLoadingSpinner text="Loading..." position="left" />
 * ```
 */
export const InlineLoadingSpinner = React.forwardRef<
  HTMLDivElement,
  InlineLoadingSpinnerProps
>(
  (
    {
      text,
      position = "left",
      variant = "default",
      size = "sm",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2",
          position === "right" && "flex-row-reverse",
          className
        )}
        {...props}
      >
        <LoadingSpinner variant={variant} size={size} />
        {text && <span className="text-sm">{text}</span>}
      </div>
    );
  }
);

InlineLoadingSpinner.displayName = "InlineLoadingSpinner";

// ============================================================================
// BUTTON LOADING SPINNER
// ============================================================================

export interface ButtonLoadingSpinnerProps extends LoadingSpinnerProps {
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * Button Loading Spinner
 *
 * Spinner designed for use inside buttons
 *
 * @example
 * ```tsx
 * <button disabled={isLoading}>
 *   <ButtonLoadingSpinner isLoading={isLoading}>
 *     Submit
 *   </ButtonLoadingSpinner>
 * </button>
 * ```
 */
export const ButtonLoadingSpinner = React.forwardRef<
  HTMLDivElement,
  ButtonLoadingSpinnerProps
>(
  (
    {
      isLoading = true,
      children,
      variant = "default",
      size = "sm",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("inline-flex items-center gap-2", className)}>
        {isLoading && <LoadingSpinner variant={variant} size={size} {...props} />}
        {children && <span>{children}</span>}
      </div>
    );
  }
);

ButtonLoadingSpinner.displayName = "ButtonLoadingSpinner";

// ============================================================================
// OVERLAY LOADING SPINNER
// ============================================================================

export interface OverlayLoadingSpinnerProps extends CenteredLoadingSpinnerProps {
  transparent?: boolean;
  blur?: boolean;
}

/**
 * Overlay Loading Spinner
 *
 * Displays a spinner as an overlay on top of content
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <YourContent />
 *   {isLoading && <OverlayLoadingSpinner />}
 * </div>
 * ```
 */
export const OverlayLoadingSpinner = React.forwardRef<
  HTMLDivElement,
  OverlayLoadingSpinnerProps
>(
  (
    {
      transparent = false,
      blur = true,
      message,
      variant = "default",
      size = "lg",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 z-40 flex flex-col items-center justify-center gap-4",
          !transparent && "bg-white/80 dark:bg-gray-900/80",
          blur && "backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <LoadingSpinner variant={variant} size={size} />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }
);

OverlayLoadingSpinner.displayName = "OverlayLoadingSpinner";

// ============================================================================
// EXPORTS
// ============================================================================

export default LoadingSpinner;
