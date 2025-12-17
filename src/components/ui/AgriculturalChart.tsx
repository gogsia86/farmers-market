/**
 * 🌾 AGRICULTURAL CHART - Lightweight SVG Chart System
 *
 * Divine chart components with agricultural consciousness and seasonal awareness.
 * Pure SVG implementation - no external dependencies for maximum performance.
 *
 * FEATURES:
 * - Line Chart (trends over time)
 * - Bar Chart (comparisons)
 * - Pie Chart (proportions)
 * - Area Chart (cumulative data)
 * - Seasonal color schemes
 * - Responsive design
 * - Accessibility support
 * - Tooltips and legends
 * - Agricultural consciousness
 *
 * USAGE:
 * ```tsx
 * <LineChart
 *   data={salesData}
 *   xKey="date"
 *   yKey="revenue"
 *   title="Monthly Revenue"
 *   season="SPRING"
 * />
 * ```
 *
 * DIVINE PATTERN:
 * - Quantum-aware SVG rendering
 * - Biodynamic color palettes
 * - Agricultural consciousness integration
 * - Performance-optimized calculations
 */

"use client";

import React, { useMemo } from "react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
export type ChartTheme = "light" | "dark" | "agricultural";

export interface ChartDataPoint {
  [key: string]: string | number | Date;
}

export interface BaseChartProps {
  /** Chart data array */
  data: ChartDataPoint[];
  /** Chart width (responsive if not provided) */
  width?: number;
  /** Chart height */
  height?: number;
  /** Chart title */
  title?: string;
  /** Agricultural season for color scheme */
  season?: Season;
  /** Chart theme */
  theme?: ChartTheme;
  /** Show legend */
  showLegend?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Agricultural consciousness level */
  consciousness?: "DIVINE" | "QUANTUM" | "BIODYNAMIC";
}

export interface LineChartProps extends BaseChartProps {
  /** X-axis data key */
  xKey: string;
  /** Y-axis data key */
  yKey: string;
  /** Line color */
  color?: string;
  /** Show data points */
  showPoints?: boolean;
  /** Smooth curve */
  smooth?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  /** X-axis data key (categories) */
  xKey: string;
  /** Y-axis data key (values) */
  yKey: string;
  /** Bar color */
  color?: string;
  /** Horizontal bars */
  horizontal?: boolean;
}

export interface PieChartProps extends Omit<BaseChartProps, "showGrid"> {
  /** Label key */
  labelKey: string;
  /** Value key */
  valueKey: string;
  /** Show percentages */
  showPercentages?: boolean;
  /** Inner radius (for donut chart) */
  innerRadius?: number;
}

export interface AreaChartProps extends BaseChartProps {
  /** X-axis data key */
  xKey: string;
  /** Y-axis data key */
  yKey: string;
  /** Area color */
  color?: string;
  /** Fill opacity */
  fillOpacity?: number;
}

// ============================================================================
// SEASONAL COLOR SCHEMES
// ============================================================================

const SEASONAL_COLORS = {
  SPRING: {
    primary: "#10b981", // green-500
    secondary: "#34d399", // green-400
    tertiary: "#6ee7b7", // green-300
    background: "#d1fae5", // green-100
    text: "#065f46", // green-900
  },
  SUMMER: {
    primary: "#f59e0b", // amber-500
    secondary: "#fbbf24", // amber-400
    tertiary: "#fcd34d", // amber-300
    background: "#fef3c7", // amber-100
    text: "#78350f", // amber-900
  },
  FALL: {
    primary: "#f97316", // orange-500
    secondary: "#fb923c", // orange-400
    tertiary: "#fdba74", // orange-300
    background: "#ffedd5", // orange-100
    text: "#7c2d12", // orange-900
  },
  WINTER: {
    primary: "#3b82f6", // blue-500
    secondary: "#60a5fa", // blue-400
    tertiary: "#93c5fd", // blue-300
    background: "#dbeafe", // blue-100
    text: "#1e3a8a", // blue-900
  },
};

const AGRICULTURAL_PALETTE = [
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#84cc16", // lime-500
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSeasonalColors(season: Season = "SPRING") {
  return SEASONAL_COLORS[season];
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

function generatePath(
  points: [number, number][],
  smooth: boolean = false,
): string {
  if (points.length === 0) return "";

  if (!smooth) {
    const [start, ...rest] = points;
    return `M ${start[0]},${start[1]} ${rest.map((p) => `L ${p[0]},${p[1]}`).join(" ")}`;
  }

  // Smooth curve using quadratic bezier
  const path = [`M ${points[0][0]},${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    path.push(`Q ${x1},${y1} ${mx},${my}`);
    path.push(`Q ${x2},${y2} ${x2},${y2}`);
  }
  return path.join(" ");
}

// ============================================================================
// LINE CHART COMPONENT
// ============================================================================

export function LineChart({
  data,
  xKey,
  yKey,
  width,
  height = 300,
  title,
  season = "SPRING",
  theme = "agricultural",
  showLegend = true,
  showGrid = true,
  showPoints = true,
  smooth = false,
  color,
  className = "",
  consciousness = "DIVINE",
}: LineChartProps) {
  const colors = getSeasonalColors(season);
  const lineColor = color || colors.primary;

  const { points, xLabels, yLabels, maxY, minY } = useMemo(() => {
    const values = data.map((d) => Number(d[yKey]));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    // Chart dimensions
    const padding = { top: 40, right: 20, bottom: 50, left: 60 };
    const chartWidth = (width || 600) - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate points
    const pts: [number, number][] = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((Number(d[yKey]) - min) / range) * chartHeight;
      return [x, y];
    });

    // X-axis labels
    const xLbls = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      return { x, label: String(d[xKey]) };
    });

    // Y-axis labels
    const yLbls = Array.from({ length: 5 }, (_, i) => {
      const value = min + (range / 4) * i;
      const y =
        padding.top + chartHeight - ((value - min) / range) * chartHeight;
      return { y, label: formatNumber(value) };
    });

    return {
      points: pts,
      xLabels: xLbls,
      yLabels: yLbls,
      maxY: max,
      minY: min,
    };
  }, [data, xKey, yKey, width, height]);

  const chartWidth = width || 600;
  const path = generatePath(points, smooth);

  return (
    <div className={`agricultural-chart ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={title || "Line chart"}
      >
        {/* Grid lines */}
        {showGrid &&
          yLabels.map((label, i) => (
            <line
              key={i}
              x1={60}
              y1={label.y}
              x2={chartWidth - 20}
              y2={label.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={50}
            y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600"
          >
            {label.label}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => {
          // Show every nth label to avoid crowding
          const showEvery = Math.ceil(xLabels.length / 8);
          if (i % showEvery !== 0 && i !== xLabels.length - 1) return null;

          return (
            <text
              key={i}
              x={label.x}
              y={height - 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {label.label}
            </text>
          );
        })}

        {/* Line path */}
        <path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Data points */}
        {showPoints &&
          points.map((point, i) => (
            <circle
              key={i}
              cx={point[0]}
              cy={point[1]}
              r="4"
              fill={lineColor}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all"
            >
              <title>{`${data[i][xKey]}: ${data[i][yKey]}`}</title>
            </circle>
          ))}

        {/* Axes */}
        <line
          x1={60}
          y1={40}
          x2={60}
          y2={height - 50}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={60}
          y1={height - 50}
          x2={chartWidth - 20}
          y2={height - 50}
          stroke="#374151"
          strokeWidth="2"
        />
      </svg>

      {/* Divine consciousness indicator */}
      {consciousness === "DIVINE" && (
        <div className="mt-2 text-xs text-center text-agricultural-600">
          🌾 Quantum Chart Coherence: {data.length} data points manifested
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BAR CHART COMPONENT
// ============================================================================

export function BarChart({
  data,
  xKey,
  yKey,
  width,
  height = 300,
  title,
  season = "SPRING",
  theme = "agricultural",
  showLegend = true,
  showGrid = true,
  horizontal = false,
  color,
  className = "",
  consciousness = "DIVINE",
}: BarChartProps) {
  const colors = getSeasonalColors(season);
  const barColor = color || colors.primary;

  const { bars, xLabels, yLabels, maxY } = useMemo(() => {
    const values = data.map((d) => Number(d[yKey]));
    const max = Math.max(...values);

    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = (width || 600) - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate bars
    const barWidth = chartWidth / data.length - 10;
    const brs = data.map((d, i) => {
      const value = Number(d[yKey]);
      const barHeight = (value / max) * chartHeight;
      const x = padding.left + (i * chartWidth) / data.length + 5;
      const y = padding.top + chartHeight - barHeight;
      return { x, y, width: barWidth, height: barHeight, value };
    });

    // Labels
    const xLbls = data.map((d, i) => ({
      x: padding.left + (i * chartWidth) / data.length + barWidth / 2 + 5,
      label: String(d[xKey]),
    }));

    const yLbls = Array.from({ length: 5 }, (_, i) => {
      const value = (max / 4) * i;
      const y = padding.top + chartHeight - (value / max) * chartHeight;
      return { y, label: formatNumber(value) };
    });

    return { bars: brs, xLabels: xLbls, yLabels: yLbls, maxY: max };
  }, [data, xKey, yKey, width, height]);

  const chartWidth = width || 600;

  return (
    <div className={`agricultural-chart ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={title || "Bar chart"}
      >
        {/* Grid lines */}
        {showGrid &&
          yLabels.map((label, i) => (
            <line
              key={i}
              x1={60}
              y1={label.y}
              x2={chartWidth - 20}
              y2={label.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={50}
            y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600"
          >
            {label.label}
          </text>
        ))}

        {/* Bars */}
        {bars.map((bar, i) => (
          <g key={i}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={barColor}
              rx="4"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${data[i][xKey]}: ${bar.value}`}</title>
            </rect>
            {/* Value label on bar */}
            <text
              x={bar.x + bar.width / 2}
              y={bar.y - 5}
              textAnchor="middle"
              className="text-xs fill-gray-700 font-medium"
            >
              {formatNumber(bar.value)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 30}
            textAnchor="middle"
            className="text-xs fill-gray-600"
            transform={`rotate(-45, ${label.x}, ${height - 30})`}
          >
            {label.label}
          </text>
        ))}

        {/* Axes */}
        <line
          x1={60}
          y1={40}
          x2={60}
          y2={height - 60}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={60}
          y1={height - 60}
          x2={chartWidth - 20}
          y2={height - 60}
          stroke="#374151"
          strokeWidth="2"
        />
      </svg>

      {consciousness === "DIVINE" && (
        <div className="mt-2 text-xs text-center text-agricultural-600">
          🌾 Biodynamic Bar Manifestation: {data.length} categories
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================

export function PieChart({
  data,
  labelKey,
  valueKey,
  width,
  height = 300,
  title,
  season = "SPRING",
  showLegend = true,
  showPercentages = true,
  innerRadius = 0,
  className = "",
  consciousness = "DIVINE",
}: PieChartProps) {
  const { slices, total } = useMemo(() => {
    const values = data.map((d) => Number(d[valueKey]));
    const tot = values.reduce((sum, val) => sum + val, 0);

    let currentAngle = -90; // Start from top
    const slcs = data.map((d, i) => {
      const value = Number(d[valueKey]);
      const percentage = (value / tot) * 100;
      const angle = (value / tot) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      return {
        label: String(d[labelKey]),
        value,
        percentage,
        startAngle,
        endAngle,
        color: AGRICULTURAL_PALETTE[i % AGRICULTURAL_PALETTE.length],
      };
    });

    return { slices: slcs, total: tot };
  }, [data, labelKey, valueKey]);

  const size = Math.min(width || 300, height);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  const inner = innerRadius * radius;

  const polarToCartesian = (angle: number, r: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    if (inner > 0) {
      // Donut chart
      const innerStart = polarToCartesian(startAngle, inner);
      const innerEnd = polarToCartesian(endAngle, inner);
      return [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        1,
        end.x,
        end.y,
        "L",
        innerEnd.x,
        innerEnd.y,
        "A",
        inner,
        inner,
        0,
        largeArcFlag,
        0,
        innerStart.x,
        innerStart.y,
        "Z",
      ].join(" ");
    } else {
      // Full pie
      return [
        "M",
        centerX,
        centerY,
        "L",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        1,
        end.x,
        end.y,
        "Z",
      ].join(" ");
    }
  };

  return (
    <div className={`agricultural-chart ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="flex-shrink-0"
          role="img"
          aria-label={title || "Pie chart"}
        >
          {slices.map((slice, i) => (
            <g key={i}>
              <path
                d={describeArc(slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
              </path>
              {/* Label */}
              {slice.percentage > 5 && (
                <text
                  x={
                    polarToCartesian(
                      (slice.startAngle + slice.endAngle) / 2,
                      radius * 0.7,
                    ).x
                  }
                  y={
                    polarToCartesian(
                      (slice.startAngle + slice.endAngle) / 2,
                      radius * 0.7,
                    ).y
                  }
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-sm font-bold fill-white"
                >
                  {showPercentages
                    ? `${slice.percentage.toFixed(0)}%`
                    : slice.value}
                </text>
              )}
            </g>
          ))}

          {/* Center label for donut */}
          {inner > 0 && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="text-2xl font-bold fill-gray-700"
            >
              {formatNumber(total)}
            </text>
          )}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col space-y-2">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {slice.label}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {formatNumber(slice.value)} ({slice.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {consciousness === "DIVINE" && (
        <div className="mt-4 text-xs text-center text-agricultural-600">
          🌾 Quantum Pie Coherence: {slices.length} segments • Total:{" "}
          {formatNumber(total)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AREA CHART COMPONENT
// ============================================================================

export function AreaChart({
  data,
  xKey,
  yKey,
  width,
  height = 300,
  title,
  season = "SPRING",
  showGrid = true,
  color,
  fillOpacity = 0.3,
  className = "",
  consciousness = "DIVINE",
}: AreaChartProps) {
  const colors = getSeasonalColors(season);
  const areaColor = color || colors.primary;

  const { points, areaPath, xLabels, yLabels } = useMemo(() => {
    const values = data.map((d) => Number(d[yKey]));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const padding = { top: 40, right: 20, bottom: 50, left: 60 };
    const chartWidth = (width || 600) - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Points
    const pts: [number, number][] = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((Number(d[yKey]) - min) / range) * chartHeight;
      return [x, y];
    });

    // Area path
    const linePath = generatePath(pts, true);
    const bottomY = padding.top + chartHeight;
    const area = `${linePath} L ${pts[pts.length - 1][0]},${bottomY} L ${pts[0][0]},${bottomY} Z`;

    // Labels
    const xLbls = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      return { x, label: String(d[xKey]) };
    });

    const yLbls = Array.from({ length: 5 }, (_, i) => {
      const value = min + (range / 4) * i;
      const y =
        padding.top + chartHeight - ((value - min) / range) * chartHeight;
      return { y, label: formatNumber(value) };
    });

    return { points: pts, areaPath: area, xLabels: xLbls, yLabels: yLbls };
  }, [data, xKey, yKey, width, height]);

  const chartWidth = width || 600;

  return (
    <div className={`agricultural-chart ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={title || "Area chart"}
      >
        {/* Grid */}
        {showGrid &&
          yLabels.map((label, i) => (
            <line
              key={i}
              x1={60}
              y1={label.y}
              x2={chartWidth - 20}
              y2={label.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={50}
            y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600"
          >
            {label.label}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => {
          const showEvery = Math.ceil(xLabels.length / 8);
          if (i % showEvery !== 0 && i !== xLabels.length - 1) return null;

          return (
            <text
              key={i}
              x={label.x}
              y={height - 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {label.label}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={areaColor} opacity={fillOpacity} />

        {/* Line on top */}
        <path
          d={generatePath(points, true)}
          fill="none"
          stroke={areaColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Axes */}
        <line
          x1={60}
          y1={40}
          x2={60}
          y2={height - 50}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={60}
          y1={height - 50}
          x2={chartWidth - 20}
          y2={height - 50}
          stroke="#374151"
          strokeWidth="2"
        />
      </svg>

      {consciousness === "DIVINE" && (
        <div className="mt-2 text-xs text-center text-agricultural-600">
          🌾 Quantum Area Coherence: {data.length} data points flowing
        </div>
      )}
    </div>
  );
}

/**
 * EXPORT ALL CHART COMPONENTS
 */
export const AgriculturalChart = {
  Line: LineChart,
  Bar: BarChart,
  Pie: PieChart,
  Area: AreaChart,
};
