// 🧠 DIVINE PATTERN: Revenue Chart Component
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Analytics & Data Visualization
// ⚡ Performance: Optimized chart rendering with agricultural consciousness

"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders?: number;
  customers?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  variant?: "line" | "area" | "bar";
  showOrders?: boolean;
  height?: number;
  title?: string;
  className?: string;
}

/**
 * RevenueChart Component
 *
 * Advanced revenue visualization with:
 * - Multiple chart types (line, area, bar)
 * - Dual axis support (revenue + orders)
 * - Responsive design
 * - Agricultural consciousness
 */
export function RevenueChart({
  data,
  variant = "area",
  showOrders = false,
  height = 400,
  title = "Revenue Over Time",
  className = "",
}: RevenueChartProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = data.reduce(
      (sum: any, item: any) => sum + item.revenue,
      0,
    );
    const totalOrders = data.reduce(
      (sum: any, item: any) => sum + (item.orders || 0),
      0,
    );
    const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
    const maxRevenue = Math.max(...data.map((item) => item.revenue));

    return {
      totalRevenue,
      totalOrders,
      avgRevenue,
      maxRevenue,
    };
  }, [data]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date for tooltip
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold text-gray-900">
              {entry.name === "Revenue"
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render chart based on variant
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const xAxisProps = {
      dataKey: "date",
      tick: { fontSize: 12 },
      tickFormatter: (value: string) => {
        const date = new Date(value);
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date);
      },
    };

    const yAxisProps = {
      tick: { fontSize: 12 },
      tickFormatter: (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value}`;
      },
    };

    switch (variant) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ fill: "#16a34a", r: 4 }}
              activeDot={{ r: 6 }}
            />
            {showOrders && (
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
              />
            )}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
            />
            {showOrders && (
              <Bar
                dataKey="orders"
                name="Orders"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            )}
          </BarChart>
        );

      case "area":
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#16a34a"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />
            {showOrders && (
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#ordersGradient)"
              />
            )}
          </AreaChart>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">
            Track revenue performance over time 🌾
          </p>
        </div>
        <div className="flex gap-2">
          {["area", "line", "bar"].map((v: any) => (
            <button
              key={v}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                variant === v
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => {}}
              disabled
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs font-medium text-green-600 mb-1">
            Total Revenue
          </p>
          <p className="text-xl font-bold text-green-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-600 mb-1">Avg Revenue</p>
          <p className="text-xl font-bold text-blue-900">
            {formatCurrency(stats.avgRevenue)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs font-medium text-purple-600 mb-1">
            Peak Revenue
          </p>
          <p className="text-xl font-bold text-purple-900">
            {formatCurrency(stats.maxRevenue)}
          </p>
        </div>
        {showOrders && (
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-xs font-medium text-orange-600 mb-1">
              Total Orders
            </p>
            <p className="text-xl font-bold text-orange-900">
              {stats.totalOrders.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: `${height}px` }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No revenue data available</p>
              <p className="text-sm text-gray-400">
                Data will appear once orders are placed 🌱
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          🌾 Agricultural Consciousness Active • Revenue tracked in real-time
        </p>
      </div>
    </div>
  );
}

/**
 * Compact Revenue Card (mini version)
 */
export function RevenueCard({
  totalRevenue,
  period = "This Month",
  trend,
  className = "",
}: {
  totalRevenue: number;
  period?: string;
  trend?: { value: number; direction: "up" | "down" };
  className?: string;
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{period}</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalRevenue)}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className="bg-green-100 rounded-full p-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
