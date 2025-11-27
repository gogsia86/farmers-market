/**
 * 📊 FARMER ANALYTICS DASHBOARD
 * Divine implementation of analytics and insights
 * Features: Revenue charts, top products, seasonal trends, performance metrics
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "View your farm's performance analytics and insights",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
  ordersCount: number;
}

interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

export default async function FarmerAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify farmer owns a farm
  const farm = await database.farm.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, status: true },
  });

  if (!farm) {
    redirect("/onboarding/farm");
  }

  // Calculate date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Fetch all orders for the farm
  const allOrders = await database.order.findMany({
    where: {
      farmId: farm.id,
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      items: {
        where: {
          product: {
            farmId: farm.id,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Current period orders (last 30 days)
  const currentPeriodOrders = allOrders.filter(
    (order) => order.createdAt >= thirtyDaysAgo
  );

  // Previous period orders (30-60 days ago)
  const previousPeriodOrders = allOrders.filter(
    (order) => order.createdAt >= sixtyDaysAgo && order.createdAt < thirtyDaysAgo
  );

  // Calculate metrics
  const totalRevenue = currentPeriodOrders.reduce(
    (sum, order) => sum + Number(order.farmerAmount),
    0
  );

  const previousRevenue = previousPeriodOrders.reduce(
    (sum, order) => sum + Number(order.farmerAmount),
    0
  );

  const revenueGrowth =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const totalOrders = currentPeriodOrders.length;
  const previousOrders = previousPeriodOrders.length;
  const ordersGrowth =
    previousOrders > 0
      ? ((totalOrders - previousOrders) / previousOrders) * 100
      : 0;

  // Unique customers
  const uniqueCustomers = new Set(
    currentPeriodOrders.map((order) => order.customerId)
  ).size;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const metrics: AnalyticsMetrics = {
    totalRevenue,
    totalOrders,
    totalCustomers: uniqueCustomers,
    averageOrderValue,
    revenueGrowth,
    ordersGrowth,
  };

  // Top Products Analysis
  const productStats = new Map<
    string,
    { name: string; revenue: number; units: number; orders: Set<string> }
  >();

  currentPeriodOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productStats.get(item.productId) || {
        name: item.productName,
        revenue: 0,
        units: 0,
        orders: new Set<string>(),
      };

      existing.revenue += Number(item.subtotal);
      existing.units += Number(item.quantity);
      existing.orders.add(order.id);

      productStats.set(item.productId, existing);
    });
  });

  const topProducts: TopProduct[] = Array.from(productStats.entries())
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      revenue: stats.revenue,
      unitsSold: stats.units,
      ordersCount: stats.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Revenue by Month (last 12 months)
  const monthlyRevenue: RevenueByMonth[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthOrders = allOrders.filter(
      (order) => order.createdAt >= monthStart && order.createdAt <= monthEnd
    );

    const revenue = monthOrders.reduce(
      (sum, order) => sum + Number(order.farmerAmount),
      0
    );

    monthlyRevenue.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      revenue,
      orders: monthOrders.length,
    });
  }

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="analytics-page">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Performance insights for {farm.name}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="revenue-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${metrics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {metrics.revenueGrowth >= 0 ? (
                <>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">
                    {metrics.revenueGrowth.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">
                    {Math.abs(metrics.revenueGrowth).toFixed(1)}%
                  </span>
                </>
              )}
              <span className="ml-2 text-gray-600">vs last 30 days</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="orders-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalOrders}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {metrics.ordersGrowth >= 0 ? (
                <>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">
                    {metrics.ordersGrowth.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">
                    {Math.abs(metrics.ordersGrowth).toFixed(1)}%
                  </span>
                </>
              )}
              <span className="ml-2 text-gray-600">vs last 30 days</span>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="customers-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Unique Customers
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalCustomers}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Last 30 days</span>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="aov-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${metrics.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Per order</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6" data-testid="revenue-chart">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Revenue Trend (Last 12 Months)
            </h2>
            <div className="space-y-4">
              {monthlyRevenue.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 w-24">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                          style={{
                            width: `${(month.revenue / maxRevenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-gray-900 font-medium w-24 text-right">
                      ${month.revenue.toFixed(0)}
                    </span>
                    <span className="text-gray-500 text-xs w-16 text-right">
                      {month.orders} orders
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="top-products">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Top Products (Last 30 Days)
            </h2>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-start space-x-3"
                    data-testid={`top-product-${index}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>${product.revenue.toFixed(2)}</span>
                        <span>•</span>
                        <span>{product.unitsSold} units</span>
                        <span>•</span>
                        <span>{product.ordersCount} orders</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  No product sales yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="performance-summary">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Summary
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Total Products Sold</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {topProducts.reduce((sum, p) => sum + p.unitsSold, 0)} units
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Most Popular Product</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {topProducts.length > 0 ? topProducts[0].name : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Revenue per Customer</dt>
                <dd className="text-sm font-medium text-gray-900">
                  $
                  {metrics.totalCustomers > 0
                    ? (metrics.totalRevenue / metrics.totalCustomers).toFixed(2)
                    : "0.00"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Orders per Customer</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {metrics.totalCustomers > 0
                    ? (metrics.totalOrders / metrics.totalCustomers).toFixed(1)
                    : "0"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6" data-testid="quick-actions">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/farmer/products/new"
                className="block w-full text-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Add New Product
              </a>
              <a
                href="/farmer/orders"
                className="block w-full text-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                View All Orders
              </a>
              <a
                href="/farmer/products"
                className="block w-full text-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Manage Products
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
