/**
 * ANALYTICS DASHBOARD - Main Analytics View
 * Divine business intelligence interface
 *
 * @divine-pattern Holographic dashboard with real-time metrics
 * @agricultural-consciousness Seasonal performance awareness
 * @reference .github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md
 */

"use client";

import {
  FarmPerformanceMetrics,
  SalesMetrics,
  TimePeriod,
  formatCurrency,
  formatPercentage,
  getTimeRangeForPeriod,
} from "@/types/analytics.types";
import { useEffect, useState } from "react";

interface AnalyticsDashboardProps {
  farmId?: string;
}

export function AnalyticsDashboard({ farmId }: AnalyticsDashboardProps) {
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [farmMetrics, setFarmMetrics] = useState<FarmPerformanceMetrics | null>(
    null
  );
  const [period, setPeriod] = useState<TimePeriod>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [farmId, period]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const timeRange = getTimeRangeForPeriod(period);

      const params = new URLSearchParams({
        period,
        ...(farmId && { farmId }),
      });

      const [salesResponse, farmResponse] = await Promise.all([
        fetch(`/api/analytics/sales?${params}`),
        farmId
          ? fetch(`/api/analytics/farm/${farmId}?period=${period}`)
          : Promise.resolve(null),
      ]);

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSalesMetrics(salesData.data);
      }

      if (farmResponse && farmResponse.ok) {
        const farmData = await farmResponse.json();
        setFarmMetrics(farmData.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>

        <div className="flex gap-2">
          {(["day", "week", "month", "quarter", "year"] as TimePeriod[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Sales Metrics Overview */}
      {salesMetrics && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(salesMetrics.totalRevenue)}
              change={salesMetrics.revenueGrowth}
              icon="💰"
            />
            <MetricCard
              title="Total Orders"
              value={salesMetrics.totalOrders.toString()}
              change={salesMetrics.ordersGrowth}
              icon="📦"
            />
            <MetricCard
              title="Average Order Value"
              value={formatCurrency(salesMetrics.averageOrderValue)}
              icon="💵"
            />
            <MetricCard
              title="Conversion Rate"
              value={formatPercentage(salesMetrics.conversionRate)}
              icon="🎯"
            />
          </div>

          {/* Top Products */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Top Performing Products
            </h3>
            <div className="space-y-3">
              {salesMetrics.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.quantitySold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.orders} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Sales by Category
            </h3>
            <div className="space-y-4">
              {Object.entries(salesMetrics.salesByCategory).map(
                ([category, data]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">
                        {category}
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(data.revenue)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({formatPercentage(data.percentage)})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Customer Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-600">New Customers</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {salesMetrics.customerMetrics.newCustomers}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-600">
                Returning Customers
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {salesMetrics.customerMetrics.returningCustomers}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-600">
                Retention Rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {formatPercentage(salesMetrics.customerMetrics.retentionRate)}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Farm Performance Metrics */}
      {farmMetrics && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Farm Performance
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {farmMetrics.totalProducts}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {farmMetrics.activeProducts} active,{" "}
                {farmMetrics.soldOutProducts} sold out
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">
                Inventory Value
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(farmMetrics.totalInventoryValue)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Turnover: {farmMetrics.inventoryTurnoverRate.toFixed(2)}x
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">
                Fulfillment Rate
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatPercentage(farmMetrics.fulfillmentRate)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {farmMetrics.fulfilledOrders} / {farmMetrics.totalOrders} orders
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">
                Unique Customers
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {farmMetrics.uniqueCustomers}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {farmMetrics.averageOrdersPerCustomer.toFixed(1)}{" "}
                orders/customer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change?: number;
  icon: string;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>

          {change !== undefined && (
            <div className="mt-2 flex items-center">
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
              </span>
              <span className="ml-2 text-xs text-gray-500">
                vs previous period
              </span>
            </div>
          )}
        </div>

        <div className="text-4xl ml-4">{icon}</div>
      </div>
    </div>
  );
}
