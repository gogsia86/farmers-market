/**
 * Progress Indicator Components
 *
 * Comprehensive progress indicator system with linear, circular, step-based,
 * and agricultural-themed progress displays with seasonal awareness.
 *
 * @module components/loading/ProgressIndicator
 */

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Check, Circle } from "lucide-react";
import * as React from "react";

import type {
  ProgressConfig,
  SeasonalLoadingTheme,
  StepProgressConfig
} from "@/lib/loading/types";
import {
  formatProgress,
  getCurrentSeason,
  getSeasonalColors,
} from "@/lib/loading/utils";
import { cn } from "@/lib/utils";

// ============================================================================
// PROGRESS VARIANTS
// ============================================================================

const progressVariants = cva("relative overflow-hidden", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
    variant: {
      default: "bg-gray-200 dark:bg-gray-700",
      success: "bg-green-100 dark:bg-green-900",
      warning: "bg-amber-100 dark:bg-amber-900",
      error: "bg-red-100 dark:bg-red-900",
      agricultural: "bg-gradient-to-r from-green-100 to-emerald-100",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

const progressBarVariants = cva(
  "h-full transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-600",
        warning: "bg-amber-600",
        error: "bg-red-600",
        agricultural: "bg-gradient-to-r from-green-500 to-emerald-600",
      },
      animated: {
        true: "animate-progress-indeterminate",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  }
);

// ============================================================================
// LINEAR PROGRESS
// ============================================================================

export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<Partial<ProgressConfig>, 'size' | 'variant'>,
  VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  indeterminate?: boolean;
}

/**
 * Linear Progress Indicator
 *
 * @example
 * ```tsx
 * <LinearProgress value={60} showPercentage />
 * <LinearProgress value={80} label="Uploading..." />
 * <LinearProgress indeterminate label="Processing..." />
 * ```
 */
export const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    {
      value = 0,
      max = 100,
      showLabel = false,
      showPercentage = false,
      label,
      indeterminate = false,
      size = "md",
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-2">
            {label && <span className="text-sm font-medium">{label}</span>}
            {showPercentage && !indeterminate && (
              <span className="text-sm text-muted-foreground">
                {formatProgress(percentage)}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(progressVariants({ size, variant }), "rounded-full")}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || "Progress"}
        >
          <div
            className={cn(
              progressBarVariants({ variant, animated: indeterminate }),
              "rounded-full"
            )}
            style={{
              width: indeterminate ? "30%" : `${percentage}%`,
            }}
          />
        </div>
      </div>
    );
  }
);

LinearProgress.displayName = "LinearProgress";

// ============================================================================
// CIRCULAR PROGRESS
// ============================================================================

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<Partial<ProgressConfig>, 'size'> {
  value?: number;
  max?: number;
  size?: number;
  thickness?: number;
  showValue?: boolean;
  label?: string;
  color?: string;
  trackColor?: string;
  indeterminate?: boolean;
}

/**
 * Circular Progress Indicator
 *
 * @example
 * ```tsx
 * <CircularProgress value={75} showValue />
 * <CircularProgress value={50} size={120} thickness={8} />
 * <CircularProgress indeterminate />
 * ```
 */
export const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      value = 0,
      max = 100,
      size = 64,
      thickness = 4,
      showValue = false,
      label,
      color = "currentColor",
      trackColor = "#e5e7eb",
      indeterminate = false,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className={cn(indeterminate && "animate-spin")}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={thickness}
            fill="none"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>

        {/* Center content */}
        {(showValue || label) && !indeterminate && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showValue && (
              <span className="text-sm font-semibold">
                {Math.round(percentage)}%
              </span>
            )}
            {label && (
              <span className="text-xs text-muted-foreground">{label}</span>
            )}
          </div>
        )}

        <span className="sr-only">
          {label || `Progress: ${Math.round(percentage)}%`}
        </span>
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

// ============================================================================
// STEP PROGRESS
// ============================================================================

export interface StepProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  StepProgressConfig {
  variant?: "default" | "simple" | "minimal";
  size?: "sm" | "md" | "lg";
}

/**
 * Step Progress Indicator
 *
 * @example
 * ```tsx
 * <StepProgress
 *   steps={[
 *     { id: '1', label: 'Start', state: 'completed' },
 *     { id: '2', label: 'Process', state: 'active' },
 *     { id: '3', label: 'Finish', state: 'pending' },
 *   ]}
 *   currentStep={1}
 * />
 * ```
 */
export const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  (
    {
      steps,
      currentStep,
      orientation = "horizontal",
      showLabels = true,
      variant = "default",
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: { circle: "w-6 h-6 text-xs", text: "text-xs", line: "h-0.5" },
      md: { circle: "w-8 h-8 text-sm", text: "text-sm", line: "h-1" },
      lg: { circle: "w-10 h-10 text-base", text: "text-base", line: "h-1.5" },
    };

    const { circle, text, line } = sizeClasses[size];

    const isVertical = orientation === "vertical";

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          isVertical ? "flex-col" : "flex-row items-center",
          className
        )}
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={0}
        aria-valuemax={steps.length - 1}
        {...props}
      >
        {steps.map((step: any, index: any) => (
          <React.Fragment key={step.id}>
            {/* Step item */}
            <div
              className={cn(
                "flex",
                isVertical ? "flex-row items-start" : "flex-col items-center"
              )}
            >
              {/* Circle indicator */}
              <div
                className={cn(
                  circle,
                  "rounded-full flex items-center justify-center font-medium transition-all",
                  step.state === "completed" &&
                  "bg-green-600 text-white border-2 border-green-600",
                  step.state === "active" &&
                  "bg-primary text-white border-2 border-primary ring-4 ring-primary/20",
                  step.state === "error" &&
                  "bg-red-600 text-white border-2 border-red-600",
                  step.state === "pending" &&
                  "bg-gray-200 text-gray-500 border-2 border-gray-300"
                )}
              >
                {step.state === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <div
                  className={cn(
                    "flex flex-col",
                    isVertical ? "ml-3 mb-4" : "mt-2 text-center"
                  )}
                >
                  <span
                    className={cn(
                      text,
                      "font-medium",
                      step.state === "active" && "text-primary",
                      step.state === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "transition-all",
                  isVertical
                    ? "w-0.5 h-12 ml-4"
                    : cn("flex-1 min-w-[32px]", line),
                  index < currentStep
                    ? "bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

StepProgress.displayName = "StepProgress";

// ============================================================================
// AGRICULTURAL PROGRESS
// ============================================================================

export interface AgriculturalProgressProps
  extends Omit<LinearProgressProps, "variant"> {
  season?: SeasonalLoadingTheme;
  stage?: "PLANTING" | "GROWING" | "HARVESTING" | "PROCESSING";
}

/**
 * Agricultural-themed Progress Indicator
 *
 * @example
 * ```tsx
 * <AgriculturalProgress
 *   value={75}
 *   stage="GROWING"
 *   showPercentage
 * />
 * ```
 */
export const AgriculturalProgress = React.forwardRef<
  HTMLDivElement,
  AgriculturalProgressProps
>(
  (
    {
      value = 0,
      max = 100,
      season,
      stage,
      showLabel = true,
      showPercentage = true,
      label,
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const currentSeason = season || getCurrentSeason();
    const colors = getSeasonalColors(currentSeason);

    const stageMessages = {
      PLANTING: "Planting seeds...",
      GROWING: "Growing and nurturing...",
      HARVESTING: "Harvesting results...",
      PROCESSING: "Processing harvest...",
    };

    const displayLabel = label || (stage ? stageMessages[stage] : "Progress");
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Circle
                className="w-3 h-3 animate-pulse"
                style={{ color: colors.primary }}
                fill={colors.primary}
              />
              <span className="text-sm font-medium">{displayLabel}</span>
            </div>
            {showPercentage && (
              <span
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                {formatProgress(percentage)}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(progressVariants({ size }), "rounded-full")}
          style={{
            background: `linear-gradient(to right, ${colors.secondary}20, ${colors.primary}20)`,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={displayLabel}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              `bg-gradient-to-r ${colors.gradient}`
            )}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        {/* Seasonal indicator */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground capitalize">
            {currentSeason.toLowerCase()} Season
          </span>
          {stage && (
            <span className="text-xs text-muted-foreground">{stage}</span>
          )}
        </div>
      </div>
    );
  }
);

AgriculturalProgress.displayName = "AgriculturalProgress";

// ============================================================================
// PROGRESS RING (Compact Circular)
// ============================================================================

export interface ProgressRingProps extends CircularProgressProps {
  strokeWidth?: number;
  showAnimation?: boolean;
}

/**
 * Progress Ring - Compact circular progress
 *
 * @example
 * ```tsx
 * <ProgressRing value={85} size={48} showValue />
 * ```
 */
export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value = 0,
      max = 100,
      size = 48,
      strokeWidth = 4,
      showValue = true,
      showAnimation = true,
      color,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color || "currentColor"}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              showAnimation && "transition-all duration-500 ease-out",
              !color && "text-primary"
            )}
          />
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";

// ============================================================================
// MULTI-PROGRESS (Stacked Progress Bars)
// ============================================================================

export interface MultiProgressSegment {
  id: string;
  value: number;
  label?: string;
  color?: string;
}

export interface MultiProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: MultiProgressSegment[];
  total?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLegend?: boolean;
}

/**
 * Multi-segment Progress Indicator
 *
 * @example
 * ```tsx
 * <MultiProgress
 *   segments={[
 *     { id: '1', value: 30, label: 'Vegetables', color: '#10b981' },
 *     { id: '2', value: 50, label: 'Fruits', color: '#f59e0b' },
 *     { id: '3', value: 20, label: 'Herbs', color: '#3b82f6' },
 *   ]}
 *   showLegend
 * />
 * ```
 */
export const MultiProgress = React.forwardRef<HTMLDivElement, MultiProgressProps>(
  (
    {
      segments,
      total,
      size = "md",
      showLegend = false,
      className,
      ...props
    },
    ref
  ) => {
    const maxValue = total || segments.reduce((sum: any, seg: any) => sum + seg.value, 0);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div
          className={cn(progressVariants({ size }), "flex rounded-full")}
          role="progressbar"
          aria-label="Multi-segment progress"
        >
          {segments.map((segment: any, index: any) => {
            const percentage = (segment.value / maxValue) * 100;
            return (
              <div
                key={segment.id}
                className={cn(
                  "h-full transition-all duration-300",
                  index === 0 && "rounded-l-full",
                  index === segments.length - 1 && "rounded-r-full"
                )}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: segment.color || "#3b82f6",
                }}
                title={segment.label}
              />
            );
          })}
        </div>

        {showLegend && (
          <div className="flex flex-wrap gap-3 mt-3">
            {segments.map((segment: any) => (
              <div key={segment.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color || "#3b82f6" }}
                />
                <span className="text-xs text-muted-foreground">
                  {segment.label}: {segment.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MultiProgress.displayName = "MultiProgress";

// ============================================================================
// EXPORTS
// ============================================================================

export default LinearProgress;
