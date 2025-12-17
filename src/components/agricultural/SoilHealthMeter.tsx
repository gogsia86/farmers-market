"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Leaf,
  Droplets,
  Beaker,
  Activity,
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES - Divine Agricultural Type System
// ============================================================================

export type SoilHealthStatus =
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "CRITICAL";

export interface SoilMetric {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimal: { min: number; max: number };
  icon?: React.ElementType;
}

export interface SoilHealthData {
  ph: number;
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  organicMatter: number; // percentage
  moisture: number; // percentage
  temperature?: number; // Celsius
  lastTested: Date;
  recommendations?: string[];
}

export interface SoilHealthMeterProps {
  /** Soil health data */
  data: SoilHealthData;
  /** Display variant */
  variant?: "default" | "compact" | "detailed";
  /** Show recommendations */
  showRecommendations?: boolean;
  /** Show individual metrics */
  showMetrics?: boolean;
  /** Custom className */
  className?: string;
  /** Animated transitions */
  animated?: boolean;
  /** On metric click handler */
  onMetricClick?: (metric: string) => void;
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
}

// ============================================================================
// CONFIGURATIONS - Biodynamic Consciousness
// ============================================================================

const STATUS_CONFIG: Record<SoilHealthStatus, StatusConfig> = {
  EXCELLENT: {
    label: "Excellent",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    icon: CheckCircle,
    description: "Optimal soil conditions for plant growth",
  },
  GOOD: {
    label: "Good",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-400",
    icon: CheckCircle,
    description: "Healthy soil with minor improvements possible",
  },
  FAIR: {
    label: "Fair",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    icon: AlertTriangle,
    description: "Adequate soil health, improvements recommended",
  },
  POOR: {
    label: "Poor",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-400",
    icon: AlertTriangle,
    description: "Below optimal conditions, action needed",
  },
  CRITICAL: {
    label: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    icon: XCircle,
    description: "Immediate intervention required",
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateSoilHealth(data: SoilHealthData): {
  status: SoilHealthStatus;
  score: number;
} {
  let totalScore = 0;
  let metrics = 0;

  // pH score (optimal: 6.0-7.0)
  const phScore =
    data.ph >= 6.0 && data.ph <= 7.0
      ? 100
      : data.ph >= 5.5 && data.ph <= 7.5
        ? 80
        : data.ph >= 5.0 && data.ph <= 8.0
          ? 60
          : data.ph >= 4.5 && data.ph <= 8.5
            ? 40
            : 20;
  totalScore += phScore;
  metrics++;

  // NPK scores (simplified ranges)
  const nScore =
    data.nitrogen >= 20 && data.nitrogen <= 50
      ? 100
      : data.nitrogen >= 10 && data.nitrogen <= 70
        ? 70
        : 40;
  totalScore += nScore;
  metrics++;

  const pScore =
    data.phosphorus >= 30 && data.phosphorus <= 60
      ? 100
      : data.phosphorus >= 15 && data.phosphorus <= 80
        ? 70
        : 40;
  totalScore += pScore;
  metrics++;

  const kScore =
    data.potassium >= 150 && data.potassium <= 250
      ? 100
      : data.potassium >= 100 && data.potassium <= 300
        ? 70
        : 40;
  totalScore += kScore;
  metrics++;

  // Organic matter score (optimal: 3-6%)
  const omScore =
    data.organicMatter >= 3 && data.organicMatter <= 6
      ? 100
      : data.organicMatter >= 2 && data.organicMatter <= 8
        ? 70
        : 40;
  totalScore += omScore;
  metrics++;

  // Moisture score (optimal: 40-60%)
  const moistScore =
    data.moisture >= 40 && data.moisture <= 60
      ? 100
      : data.moisture >= 30 && data.moisture <= 70
        ? 70
        : 40;
  totalScore += moistScore;
  metrics++;

  const avgScore = totalScore / metrics;

  const status: SoilHealthStatus =
    avgScore >= 90
      ? "EXCELLENT"
      : avgScore >= 75
        ? "GOOD"
        : avgScore >= 60
          ? "FAIR"
          : avgScore >= 40
            ? "POOR"
            : "CRITICAL";

  return { status, score: Math.round(avgScore) };
}

function getMetricStatus(
  value: number,
  optimal: { min: number; max: number },
): {
  status: "optimal" | "acceptable" | "suboptimal";
  icon: React.ElementType;
  color: string;
} {
  if (value >= optimal.min && value <= optimal.max) {
    return { status: "optimal", icon: CheckCircle, color: "text-green-600" };
  }
  const buffer = (optimal.max - optimal.min) * 0.3;
  if (value >= optimal.min - buffer && value <= optimal.max + buffer) {
    return { status: "acceptable", icon: Minus, color: "text-yellow-600" };
  }
  return {
    status: "suboptimal",
    icon: AlertTriangle,
    color: "text-orange-600",
  };
}

function getMetrics(data: SoilHealthData): SoilMetric[] {
  return [
    {
      label: "pH Level",
      value: data.ph,
      unit: "pH",
      min: 4.0,
      max: 9.0,
      optimal: { min: 6.0, max: 7.0 },
      icon: Beaker,
    },
    {
      label: "Nitrogen (N)",
      value: data.nitrogen,
      unit: "ppm",
      min: 0,
      max: 100,
      optimal: { min: 20, max: 50 },
      icon: Activity,
    },
    {
      label: "Phosphorus (P)",
      value: data.phosphorus,
      unit: "ppm",
      min: 0,
      max: 100,
      optimal: { min: 30, max: 60 },
      icon: Activity,
    },
    {
      label: "Potassium (K)",
      value: data.potassium,
      unit: "ppm",
      min: 0,
      max: 400,
      optimal: { min: 150, max: 250 },
      icon: Activity,
    },
    {
      label: "Organic Matter",
      value: data.organicMatter,
      unit: "%",
      min: 0,
      max: 15,
      optimal: { min: 3, max: 6 },
      icon: Leaf,
    },
    {
      label: "Moisture",
      value: data.moisture,
      unit: "%",
      min: 0,
      max: 100,
      optimal: { min: 40, max: 60 },
      icon: Droplets,
    },
  ];
}

// ============================================================================
// METRIC BAR COMPONENT
// ============================================================================

function MetricBar({ metric }: { metric: SoilMetric }) {
  const percentage =
    ((metric.value - metric.min) / (metric.max - metric.min)) * 100;
  const optimalStart =
    ((metric.optimal.min - metric.min) / (metric.max - metric.min)) * 100;
  const optimalEnd =
    ((metric.optimal.max - metric.min) / (metric.max - metric.min)) * 100;
  const status = getMetricStatus(metric.value, metric.optimal);
  const Icon = metric.icon || Activity;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700">
            {metric.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-gray-900">
            {metric.value.toFixed(1)} {metric.unit}
          </span>
          <StatusIcon
            className={cn("h-4 w-4", status.color)}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Bar visualization */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Optimal range indicator */}
        <div
          className="absolute top-0 h-full bg-green-100"
          style={{
            left: `${optimalStart}%`,
            width: `${optimalEnd - optimalStart}%`,
          }}
        />
        {/* Value indicator */}
        <div
          className={cn(
            "absolute top-0 h-full transition-all duration-500",
            status.status === "optimal"
              ? "bg-green-500"
              : status.status === "acceptable"
                ? "bg-yellow-500"
                : "bg-orange-500",
          )}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{metric.min}</span>
        <span className="text-green-600">
          Optimal: {metric.optimal.min}-{metric.optimal.max}
        </span>
        <span>{metric.max}</span>
      </div>
    </div>
  );
}

// ============================================================================
// SOIL HEALTH METER COMPONENT - Divine Implementation
// ============================================================================

export function SoilHealthMeter({
  data,
  variant = "default",
  showRecommendations = true,
  showMetrics = true,
  className,
  animated = true,
  onMetricClick,
}: SoilHealthMeterProps) {
  const { status, score } = calculateSoilHealth(data);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const metrics = getMetrics(data);

  // Compact variant - minimal display
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 px-4 py-2 rounded-lg border",
          config.bgColor,
          config.borderColor,
          animated && "transition-all duration-300",
          className,
        )}
        role="region"
        aria-label={`Soil health: ${config.label}`}
      >
        <StatusIcon
          className={cn("h-5 w-5", config.color)}
          aria-hidden="true"
        />
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{score}</span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          <p className={cn("text-xs font-medium", config.color)}>
            {config.label}
          </p>
        </div>
      </div>
    );
  }

  // Detailed variant - comprehensive display
  if (variant === "detailed") {
    return (
      <div
        className={cn(
          "rounded-lg border bg-white shadow-lg overflow-hidden",
          config.borderColor,
          className,
        )}
        role="region"
        aria-label="Detailed soil health analysis"
      >
        {/* Header */}
        <div className={cn("p-6 border-b", config.bgColor)}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Soil Health Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Last tested: {data.lastTested.toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  {score}
                </span>
                <span className="text-lg text-gray-500">/ 100</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 justify-end",
                  config.color,
                )}
              >
                <StatusIcon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-semibold">{config.label}</span>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
                score >= 90
                  ? "bg-green-500"
                  : score >= 75
                    ? "bg-green-400"
                    : score >= 60
                      ? "bg-yellow-500"
                      : score >= 40
                        ? "bg-orange-500"
                        : "bg-red-500",
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{config.description}</p>
        </div>

        {/* Individual metrics */}
        {showMetrics && (
          <div className="p-6 space-y-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Individual Metrics
            </h4>
            {metrics.map((metric, index) => (
              <div
                key={index}
                onClick={() => onMetricClick?.(metric.label)}
                className={cn(
                  onMetricClick &&
                    "cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg",
                  animated && "transition-colors",
                )}
              >
                <MetricBar metric={metric} />
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {showRecommendations &&
          data.recommendations &&
          data.recommendations.length > 0 && (
            <div className="border-t border-gray-200 bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <Info
                  className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Recommendations
                  </h4>
                  <ul className="space-y-1.5">
                    {data.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="text-sm text-blue-800 flex items-start gap-2"
                      >
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  // Default variant - balanced display
  return (
    <div
      className={cn(
        "rounded-lg border bg-white shadow-sm overflow-hidden",
        config.borderColor,
        className,
      )}
      role="region"
      aria-label="Soil health meter"
    >
      {/* Summary */}
      <div className={cn("p-4", config.bgColor)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", "bg-white/50")}>
              <StatusIcon
                className={cn("h-6 w-6", config.color)}
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Soil Health
              </h3>
              <p className={cn("text-xs font-medium", config.color)}>
                {config.label} Condition
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{score}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-700",
              score >= 90
                ? "bg-green-500"
                : score >= 75
                  ? "bg-green-400"
                  : score >= 60
                    ? "bg-yellow-500"
                    : score >= 40
                      ? "bg-orange-500"
                      : "bg-red-500",
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Quick metrics */}
      {showMetrics && (
        <div className="p-4 grid grid-cols-2 gap-3">
          {metrics.slice(0, 4).map((metric, index) => {
            const status = getMetricStatus(metric.value, metric.optimal);
            const Icon = metric.icon || Activity;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 p-2 rounded border border-gray-200",
                  onMetricClick && "cursor-pointer hover:bg-gray-50",
                  animated && "transition-colors",
                )}
                onClick={() => onMetricClick?.(metric.label)}
              >
                <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">
                    {metric.label}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {metric.value.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">{metric.unit}</span>
                  </div>
                </div>
                <status.icon
                  className={cn("h-3.5 w-3.5", status.color)}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Footer info */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <p className="text-xs text-gray-600">
          Last tested: {data.lastTested.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { calculateSoilHealth, getMetricStatus, getMetrics };

// ============================================================================
// DISPLAY NAME - For React DevTools
// ============================================================================

SoilHealthMeter.displayName = "SoilHealthMeter";

// ============================================================================
// EXPORTS
// ============================================================================

export default SoilHealthMeter;
