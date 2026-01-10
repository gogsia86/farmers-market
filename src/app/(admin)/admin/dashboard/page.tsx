/**
 * Admin Dashboard Page
 * Comprehensive platform analytics and management overview
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  Store,
  TrendingDown,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    recentRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    recentOrders: number;
    orderGrowth: number;
    avgOrderValue: number;
  };
  users: {
    total: number;
    active: number;
    newUsers: number;
    userGrowth: number;
    byRole: Record<string, number>;
  };
  farms: {
    total: number;
    active: number;
    pending: number;
    newFarms: number;
    farmGrowth: number;
    topFarms: Array<{
      id: string;
      name: string;
      productCount: number;
      reviewCount: number;
    }>;
  };
  products: {
    total: number;
    active: number;
    newProducts: number;
  };
  orders: {
    total: number;
    recent: number;
    byStatus: Record<string, number>;
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      totalPrice: number;
      createdAt: string;
      customer: {
        name: string;
        email: string;
      } | null;
    }>;
  };
  reviews: {
    total: number;
    pending: number;
    averageRating: number;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to fetch analytics");
      }

      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAnalytics} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Platform overview and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.overview.recentRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {analytics.overview.revenueGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm ${analytics.overview.revenueGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {formatPercent(analytics.overview.revenueGrowth)}
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Orders
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.overview.recentOrders)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {analytics.overview.orderGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm ${analytics.overview.orderGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {formatPercent(analytics.overview.orderGrowth)}
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.users.active)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {analytics.users.userGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm ${analytics.users.userGrowth >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {formatPercent(analytics.users.userGrowth)}
              </span>
              <span className="text-sm text-gray-500">new users</span>
            </div>
          </CardContent>
        </Card>

        {/* Farms Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Farms
            </CardTitle>
            <Store className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics.farms.active)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-gray-600">
                {analytics.farms.pending} pending approval
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="farms">Farms</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current orders by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.orders.byStatus).map(
                    ([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {status === "DELIVERED" && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {status === "PENDING" && (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          {status === "CANCELLED" && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">{status}</span>
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Roles Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>Distribution by role type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.users.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{role}</span>
                      <span className="text-sm font-bold">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <span className="text-sm font-bold">
                      {formatNumber(analytics.products.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Products</span>
                    <span className="text-sm font-bold">
                      {formatNumber(analytics.products.active)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Order Value</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(analytics.overview.avgOrderValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">
                        {analytics.reviews.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Reviews</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {analytics.reviews.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Farms</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {analytics.farms.pending}
                    </span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <a href="/admin/reviews">Moderate Content</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.orders.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">Order #{order.orderNumber}</div>
                      <div className="text-sm text-gray-600">
                        {order.customer?.name || "Guest"} • {order.customer?.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(order.totalPrice)}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full mt-1 ${order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farms Tab */}
        <TabsContent value="farms">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Farms</CardTitle>
              <CardDescription>Farms with most products and reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.farms.topFarms.map((farm: any, index: any) => (
                  <div
                    key={farm.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-800 rounded-full font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{farm.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {farm.productCount} products
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {farm.reviewCount} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>User engagement and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(analytics.users.total)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Users</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-800">
                    {formatNumber(analytics.users.active)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Active Users</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-800">
                    {formatNumber(analytics.users.newUsers)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    New Users ({timeRange} days)
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full" variant="outline" asChild>
                  <a href="/admin/users">Manage Users</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Moderation</CardTitle>
              <CardDescription>Customer feedback and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(analytics.reviews.total)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Reviews</div>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-800">
                      {analytics.reviews.pending}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Pending Moderation
                    </div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-800 flex items-center justify-center gap-2">
                      <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                      {analytics.reviews.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                  </div>
                </div>
                {analytics.reviews.pending > 0 && (
                  <Button className="w-full" asChild>
                    <a href="/admin/reviews">Moderate Pending Reviews</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agricultural Consciousness */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Platform operating with divine agricultural consciousness
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
