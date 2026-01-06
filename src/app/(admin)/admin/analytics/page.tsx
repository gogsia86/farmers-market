/**
 * 📊 ADMIN ANALYTICS DASHBOARD
 * Comprehensive platform analytics with metrics, charts, and insights
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & Divine Patterns
 */

import { OrdersChart } from "@/components/charts/OrdersChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { platformAnalyticsService } from "@/lib/services/analytics/platform-analytics.service";
import { formatCurrency } from "@/lib/utils/currency";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Analytics Dashboard | Admin Portal",
  description: "Platform-wide analytics and insights",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const session = await auth();

  // Auth check
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/analytics");
  }

  // Admin check
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  // Fetch all metrics
  const metrics = await platformAnalyticsService.getPlatformMetrics();
  const revenueTimeSeries = await platformAnalyticsService.getTimeSeriesData(
    "revenue",
    30
  );
  const ordersTimeSeries = await platformAnalyticsService.getTimeSeriesData(
    "orders",
    30
  );

  // Calculate trends
  const recentRevenue = revenueTimeSeries.slice(-7).reduce((sum, d) => sum + d.value, 0);
  const previousRevenue = revenueTimeSeries.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
  const weeklyRevenueTrend = previousRevenue > 0
    ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
    : 100;

  // Fetch chart data (last 30 days)
  const chartRevenueData = await database.$queryRaw<Array<{ date: Date; revenue: number; orders: number }>>`
    SELECT
      DATE("createdAt") as date,
      SUM("total")::DECIMAL as revenue,
      COUNT(*)::INTEGER as orders
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  // Format data for RevenueChart
  const formattedRevenueData = chartRevenueData.map(item => ({
    date: item.date.toISOString(),
    revenue: Number(item.revenue),
    orders: item.orders,
  }));

  // Get order status distribution
  const ordersData = await database.order.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const formattedOrdersData = ordersData.map(item => ({
    status: item.status,
    count: item._count.status,
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Platform-wide metrics and performance insights
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Revenue
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatCurrency(metrics.revenue.total)}
                  </dd>
                  <dd className="mt-1 flex items-center text-sm">
                    {metrics.revenue.growthRate >= 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {metrics.revenue.growthRate.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          {Math.abs(metrics.revenue.growthRate).toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="ml-1 text-gray-500">vs last month</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Orders
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {metrics.orders.total.toLocaleString()}
                  </dd>
                  <dd className="mt-1 flex items-center text-sm">
                    {metrics.orders.growthRate >= 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {metrics.orders.growthRate.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          {Math.abs(metrics.orders.growthRate).toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="ml-1 text-gray-500">vs last month</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Users
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {metrics.users.total.toLocaleString()}
                  </dd>
                  <dd className="mt-1 flex items-center text-sm">
                    {metrics.users.growthRate >= 0 ? (
                      <>
                        <ArrowUp className="mr-1 h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {metrics.users.growthRate.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          {Math.abs(metrics.users.growthRate).toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="ml-1 text-gray-500">vs last month</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Active Products */}
          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Active Products
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {metrics.products.active.toLocaleString()}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    {metrics.products.total.toLocaleString()} total products
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Overview */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Revenue Overview
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(metrics.revenue.thisMonth)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(metrics.revenue.lastMonth)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(metrics.revenue.averagePerOrder)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Platform Fees Collected</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(metrics.revenue.platformFees)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm font-medium text-gray-900">
                  Projected Monthly
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(metrics.revenue.projectedMonthly)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Overview */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <ShoppingBag className="mr-2 h-5 w-5 text-blue-600" />
              Order Overview
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {metrics.orders.pending.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Completed Orders</span>
                <span className="text-sm font-semibold text-green-600">
                  {metrics.orders.completed.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Cancelled Orders</span>
                <span className="text-sm font-semibold text-red-600">
                  {metrics.orders.cancelled.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Orders This Month</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.orders.ordersThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm font-medium text-gray-900">
                  Average Order Value
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(metrics.orders.averageOrderValue)}
                </span>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Users className="mr-2 h-5 w-5 text-purple-600" />
              User Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.users.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Active Users (30d)</span>
                <span className="text-sm font-semibold text-green-600">
                  {metrics.users.active.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="text-sm font-semibold text-blue-600">
                  {metrics.users.newThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Customers</span>
                  <span className="text-xs font-medium text-gray-900">
                    {metrics.users.byRole.customers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Farmers</span>
                  <span className="text-xs font-medium text-gray-900">
                    {metrics.users.byRole.farmers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Admins</span>
                  <span className="text-xs font-medium text-gray-900">
                    {metrics.users.byRole.admins.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Farm Statistics */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
              Farm Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Total Farms</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.farms.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Verified Farms</span>
                <span className="text-sm font-semibold text-green-600">
                  {metrics.farms.verified.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Pending Verification</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {metrics.farms.pending.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-600">Average Products/Farm</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.farms.averageProducts.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm font-medium text-gray-900">
                  Rejected Farms
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {metrics.farms.rejected.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Farms */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Top Performing Farms
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Farm Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Avg Order
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metrics.farms.topPerforming.map((farm, index) => (
                  <tr key={farm.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {farm.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(farm.revenue)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {farm.orderCount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(
                        farm.orderCount > 0 ? farm.revenue / farm.orderCount : 0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Top Selling Products
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metrics.products.topSelling.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {product.sales.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advanced Charts Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="rounded-lg bg-white p-6 shadow">
            <RevenueChart
              data={formattedRevenueData}
              variant="area"
              showOrders={true}
              title="Revenue & Orders (Last 30 Days)"
              height={350}
            />
          </div>

          {/* Orders Chart */}
          <div className="rounded-lg bg-white p-6 shadow">
            <OrdersChart
              data={formattedOrdersData}
              variant="bar"
              title="Orders by Status"
              height={350}
            />
          </div>
        </div>

        {/* Revenue Trend Visualization (Legacy - Kept for comparison) */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Daily Revenue Bars (Last 10 Days)
          </h2>
          <div className="space-y-2">
            {revenueTimeSeries.slice(-10).map((data, index) => {
              const maxValue = Math.max(...revenueTimeSeries.map((d) => d.value));
              const width = maxValue > 0 ? (data.value / maxValue) * 100 : 0;

              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-24 text-xs text-gray-500">
                    {new Date(data.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex-1">
                    <div className="h-8 w-full bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-24 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(data.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
