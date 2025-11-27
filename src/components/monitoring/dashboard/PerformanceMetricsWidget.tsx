/**
 * 🌟 Performance Metrics Widget
 * Farmers Market Platform - Monitoring Dashboard
 *
 * Displays performance metrics including response times,
 * throughput, and success rates with visual charts.
 */

"use client";

import { useState, useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceMetricsWidgetProps {
  avgResponseTime: number;
  executions: Array<{
    id: string;
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
    status: string;
  }>;
}

interface MetricStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  p95: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate statistics from array of numbers
 */
function calculateStats(values: number[]): MetricStats {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, p95: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)] ?? 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
  };
}

/**
 * Format milliseconds to human-readable format
 */
function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Group executions by hour for chart
 */
function groupExecutionsByHour(
  executions: Array<{
    startedAt: Date;
    durationMs: number | null;
    status: string;
  }>,
) {
  const now = new Date();
  const hours: Map<
    number,
    { count: number; totalDuration: number; successCount: number }
  > = new Map();

  // Initialize last 12 hours
  for (let i = 11; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i, 0, 0, 0);
    hours.set(hour.getTime(), { count: 0, totalDuration: 0, successCount: 0 });
  }

  // Group executions
  executions.forEach((execution) => {
    const executionHour = new Date(execution.startedAt);
    executionHour.setMinutes(0, 0, 0);
    const hourKey = executionHour.getTime();

    if (hours.has(hourKey)) {
      const bucket = hours.get(hourKey)!;
      bucket.count++;
      bucket.totalDuration += execution.durationMs || 0;
      if (execution.status === "SUCCESS") {
        bucket.successCount++;
      }
    }
  });

  return Array.from(hours.entries())
    .map(([timestamp, data]) => ({
      timestamp: new Date(timestamp),
      count: data.count,
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      successRate:
        data.count > 0 ? (data.successCount / data.count) * 100 : 100,
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PerformanceMetricsWidget({
  avgResponseTime,
  executions,
}: PerformanceMetricsWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "duration" | "throughput" | "success"
  >("duration");

  // Calculate statistics
  const stats = useMemo(() => {
    const durations = executions
      .filter((e) => e.durationMs !== null)
      .map((e) => e.durationMs!);

    return calculateStats(durations);
  }, [executions]);

  // Group executions by hour
  const hourlyData = useMemo(
    () => groupExecutionsByHour(executions),
    [executions],
  );

  // Calculate throughput
  const throughput = useMemo(() => {
    const last5Min = executions.filter((e) => {
      const diff = Date.now() - new Date(e.startedAt).getTime();
      return diff < 5 * 60 * 1000;
    }).length;

    return {
      last5Min,
      perMinute: last5Min / 5,
      perHour: (last5Min / 5) * 60,
    };
  }, [executions]);

  // Get max value for chart scaling
  const maxChartValue = useMemo(() => {
    switch (selectedMetric) {
      case "duration":
        return Math.max(...hourlyData.map((d) => d.avgDuration), 1);
      case "throughput":
        return Math.max(...hourlyData.map((d) => d.count), 1);
      case "success":
        return 100;
      default:
        return 1;
    }
  }, [hourlyData, selectedMetric]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Metrics
          </h3>
          <span className="text-xs text-gray-500">(Last 12 hours)</span>
        </div>
        <a
          href="/dashboard/performance"
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Detailed →
        </a>
      </div>

      {/* Metric Selector */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setSelectedMetric("duration")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            selectedMetric === "duration"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ⚡ Duration
        </button>
        <button
          onClick={() => setSelectedMetric("throughput")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            selectedMetric === "throughput"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📊 Throughput
        </button>
        <button
          onClick={() => setSelectedMetric("success")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            selectedMetric === "success"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ✓ Success Rate
        </button>
      </div>

      {/* Simple Bar Chart */}
      <div className="mb-4 rounded-lg bg-gray-50 p-4">
        <div className="flex h-32 items-end justify-between space-x-1">
          {hourlyData.map((data, index) => {
            let value = 0;
            let color = "bg-blue-500";
            let label = "";

            switch (selectedMetric) {
              case "duration":
                value = data.avgDuration;
                color = "bg-blue-500";
                label = formatMs(value);
                break;
              case "throughput":
                value = data.count;
                color = "bg-purple-500";
                label = `${value}`;
                break;
              case "success":
                value = data.successRate;
                color =
                  value >= 95
                    ? "bg-green-500"
                    : value >= 80
                      ? "bg-yellow-500"
                      : "bg-red-500";
                label = `${Math.round(value)}%`;
                break;
            }

            const heightPercentage =
              maxChartValue > 0 ? (value / maxChartValue) * 100 : 0;

            return (
              <div
                key={index}
                className="group relative flex flex-1 flex-col items-center"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all ${color} hover:opacity-80`}
                  style={{
                    height: `${Math.max(heightPercentage, 2)}%`,
                    minHeight: value > 0 ? "4px" : "2px",
                  }}
                />

                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute bottom-full mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                  {data.timestamp.getHours()}:00
                  <br />
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{hourlyData[0]?.timestamp.getHours()}:00</span>
          <span>
            {hourlyData[
              Math.floor(hourlyData.length / 2)
            ]?.timestamp.getHours()}
            :00
          </span>
          <span>
            {hourlyData[hourlyData.length - 1]?.timestamp.getHours()}:00
          </span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* Average Response Time */}
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">Avg Response</p>
          <p className="text-xl font-bold text-blue-600">
            {formatMs(avgResponseTime)}
          </p>
        </div>

        {/* P95 Latency */}
        <div className="rounded-lg bg-purple-50 p-3">
          <p className="text-xs font-medium text-purple-900">P95 Latency</p>
          <p className="text-xl font-bold text-purple-600">
            {formatMs(stats.p95)}
          </p>
        </div>

        {/* Throughput */}
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs font-medium text-green-900">Throughput</p>
          <p className="text-xl font-bold text-green-600">
            {throughput.perMinute.toFixed(1)}/min
          </p>
        </div>

        {/* Total Executions */}
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs font-medium text-orange-900">Total Runs</p>
          <p className="text-xl font-bold text-orange-600">
            {executions.length}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="rounded-lg border border-gray-200 p-3">
        <p className="mb-2 text-xs font-medium text-gray-700">Duration Stats</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-600">Min</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMs(stats.min)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Median</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMs(stats.median)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Avg</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMs(stats.avg)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Max</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMs(stats.max)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: Just now</span>
          <span className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time</span>
          </span>
        </div>
      </div>
    </div>
  );
}
