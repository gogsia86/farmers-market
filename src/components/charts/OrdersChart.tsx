// 🧠 DIVINE PATTERN: Orders Chart Component
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Order Analytics & Status Visualization
// ⚡ Performance: Optimized chart rendering with agricultural consciousness

'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface OrderStatusData {
  status: string;
  count: number;
  color?: string;
}

interface OrdersChartProps {
  data: OrderStatusData[];
  variant?: 'bar' | 'pie';
  height?: number;
  title?: string;
  className?: string;
}

/**
 * Default status color mapping
 */
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#16a34a',
  CANCELLED: '#ef4444',
  REFUNDED: '#6b7280',
};

/**
 * OrdersChart Component
 *
 * Visualize order distribution by status with:
 * - Multiple chart types (bar, pie)
 * - Status color coding
 * - Responsive design
 * - Agricultural consciousness
 */
export function OrdersChart({
  data,
  variant = 'bar',
  height = 400,
  title = 'Orders by Status',
  className = '',
}: OrdersChartProps) {
  // Enrich data with colors
  const enrichedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      color: item.color || STATUS_COLORS[item.status] || '#6b7280',
    }));
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = data.reduce((sum, item) => sum + item.count, 0);
    const mostCommonStatus = data.reduce((max, item) =>
      item.count > max.count ? item : max
      , data[0] || { status: 'N/A', count: 0 });

    return {
      totalOrders,
      mostCommonStatus: mostCommonStatus.status,
      statusCount: data.length,
    };
  }, [data]);

  // Format status label
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="font-semibold text-gray-900">
            {formatStatus(data.status)}
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Orders: <span className="font-semibold text-gray-900">{data.count}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {((data.count / stats.totalOrders) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  };

  // Custom pie chart label
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Render chart based on variant
  const renderChart = () => {
    switch (variant) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={enrichedData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={renderCustomLabel}
              labelLine={false}
            >
              {enrichedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => formatStatus(value)}
              iconType="circle"
            />
          </PieChart>
        );

      case 'bar':
      default:
        return (
          <BarChart
            data={enrichedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 12 }}
              tickFormatter={formatStatus}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => 'Orders'} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {enrichedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            Track order status distribution 📦
          </p>
        </div>
        <div className="flex gap-2">
          {['bar', 'pie'].map((v) => (
            <button
              key={v}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${variant === v
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              onClick={() => { }}
              disabled
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-600 mb-1">
            Total Orders
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {stats.totalOrders.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs font-medium text-green-600 mb-1">
            Status Types
          </p>
          <p className="text-2xl font-bold text-green-900">
            {stats.statusCount}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs font-medium text-purple-600 mb-1">
            Most Common
          </p>
          <p className="text-sm font-bold text-purple-900">
            {formatStatus(stats.mostCommonStatus)}
          </p>
        </div>
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
              <p className="text-gray-500 mb-2">No order data available</p>
              <p className="text-sm text-gray-400">
                Data will appear once orders are placed 🌱
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {enrichedData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600">
                {formatStatus(item.status)}
              </span>
              <span className="text-xs font-semibold text-gray-900 ml-auto">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          🌾 Agricultural Consciousness Active • Orders tracked in real-time
        </p>
      </div>
    </div>
  );
}

/**
 * Compact Orders Card (mini version)
 */
export function OrdersCard({
  totalOrders,
  activeOrders,
  completedToday,
  className = '',
}: {
  totalOrders: number;
  activeOrders: number;
  completedToday?: number;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-sm font-semibold text-blue-600">
                {activeOrders}
              </p>
            </div>
            {completedToday !== undefined && (
              <div className="border-l border-gray-200 pl-3">
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-sm font-semibold text-green-600">
                  {completedToday}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-blue-100 rounded-full p-3">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Order Status Badge Component
 */
export function OrderStatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6b7280';
  const formattedStatus = status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {formattedStatus}
    </span>
  );
}
