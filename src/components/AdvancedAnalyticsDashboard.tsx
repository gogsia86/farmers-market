/**
 * 🌾⚡ ADVANCED ANALYTICS DASHBOARD - DIVINE EDITION
 *
 * Comprehensive analytics dashboard with real-time data integration.
 * Connects to payment and order analytics APIs with agricultural consciousness.
 *
 * Features:
 * - Real-time revenue and order metrics
 * - Payment method breakdowns
 * - Customer insights and LTV tracking
 * - Product performance analytics
 * - Time series visualizations
 * - Seasonal awareness
 * - Role-based data filtering
 *
 * @divine-consciousness ACTIVE
 * @agricultural-awareness ENABLED
 */

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLogger } from "@/lib/utils/logger";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const analyticsLogger = createLogger("AdvancedAnalyticsDashboard");

// ═══════════════════════════════════════════════════════════
// 🎯 TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

interface PaymentAnalytics {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
    successRate: number;
    failureRate: number;
    refundRate: number;
    growthRate: number;
  };
  byMethod?: Array<{
    method: string;
    count: number;
    revenue: number;
    successRate: number;
  }>;
  timeSeries?: Array<{
    timestamp: string;
    revenue: number;
    transactions: number;
  }>;
  trends?: {
    revenueGrowth: number;
    transactionGrowth: number;
    averageTransactionGrowth: number;
  };
  agricultural?: {
    season: string;
    consciousness: string;
  };
}

interface OrderAnalytics {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    orderGrowthRate: number;
    conversionRate: number;
  };
  customers?: {
    totalCustomers: number;
    repeatCustomers: number;
    averageLifetimeValue: number;
    topCustomers: Array<{
      customerId: string;
      customerName: string;
      totalOrders: number;
      totalSpent: number;
      lifetimeValue: number;
    }>;
  };
  products?: {
    topProducts: Array<{
      productId: string;
      productName: string;
      unitsSold: number;
      revenue: number;
      averagePrice: number;
    }>;
  };
  fulfillment?: {
    averageFulfillmentTime: number;
    onTimeDeliveryRate: number;
    pendingOrders: number;
    processingOrders: number;
  };
  agricultural?: {
    season: string;
    consciousness: string;
  };
}

interface AnalyticsPeriod {
  label: string;
  days: number;
}

// ═══════════════════════════════════════════════════════════
// 🎨 METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon: React.ReactNode;
  loading?: boolean;
  format?: "currency" | "number" | "percentage";
}

function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  loading = false,
  format = "number",
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US").format(val);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-32" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && trend !== 0 && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend).toFixed(1)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// 🌟 MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════

const PERIODS: AnalyticsPeriod[] = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "Last Year", days: 365 },
];

export function AdvancedAnalyticsDashboard() {
  const { data: session } = useSession();

  // State management
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>(
    PERIODS[1]!,
  );
  const [paymentAnalytics, setPaymentAnalytics] =
    useState<PaymentAnalytics | null>(null);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════
  // 📊 DATA FETCHING
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!session?.user) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - selectedPeriod.days);

        // Build query parameters
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          includeByMethod: "true",
          includeTimeSeries: "true",
          includeTrends: "true",
          includeTopFarms: "true",
          includeTopCustomers: "true",
          includeTopProducts: "true",
          includeFulfillment: "true",
          timeSeriesInterval:
            selectedPeriod.days <= 7
              ? "hour"
              : selectedPeriod.days <= 30
                ? "day"
                : "week",
        });

        // Add farm filter for farmers
        if (session.user.role === "FARMER" && (session.user as any).farmId) {
          params.append("farmId", (session.user as any).farmId);
        }

        // Fetch payment analytics
        const paymentResponse = await fetch(
          `/api/analytics/payments?${params}`,
        );
        if (!paymentResponse.ok) {
          throw new Error("Failed to fetch payment analytics");
        }
        const paymentData = await paymentResponse.json();
        setPaymentAnalytics(paymentData);

        // Fetch order analytics
        const orderResponse = await fetch(`/api/analytics/orders?${params}`);
        if (!orderResponse.ok) {
          throw new Error("Failed to fetch order analytics");
        }
        const orderData = await orderResponse.json();
        setOrderAnalytics(orderData);
      } catch (err) {
        analyticsLogger.error(
          "Failed to fetch analytics data",
          err instanceof Error ? err : new Error(String(err)),
          {
            period: selectedPeriod.label,
            days: selectedPeriod.days,
          },
        );
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session, selectedPeriod]);

  // ═══════════════════════════════════════════════════════════
  // 🎨 RENDERING
  // ═══════════════════════════════════════════════════════════

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to access analytics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasAccess = ["ADMIN", "FARMER", "FARM_MANAGER"].includes(
    session.user.role || "",
  );
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view analytics
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights and performance metrics
          </p>
        </div>

        {/* Agricultural Season Badge */}
        {(paymentAnalytics?.agricultural || orderAnalytics?.agricultural) && (
          <Badge variant="outline" className="self-start md:self-center">
            🌾{" "}
            {paymentAnalytics?.agricultural?.season ||
              orderAnalytics?.agricultural?.season}{" "}
            Season
          </Badge>
        )}
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((period) => (
          <button
            key={period.days}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod.days === period.days
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            {period.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                Error Loading Analytics
              </CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 📊 OVERVIEW TAB */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={paymentAnalytics?.summary.totalRevenue || 0}
              description={`${paymentAnalytics?.summary.totalTransactions || 0} transactions`}
              trend={paymentAnalytics?.trends?.revenueGrowth}
              icon={<DollarSign className="h-4 w-4" />}
              format="currency"
              loading={loading}
            />
            <MetricCard
              title="Total Orders"
              value={orderAnalytics?.summary.totalOrders || 0}
              description={`${orderAnalytics?.customers?.totalCustomers || 0} customers`}
              trend={orderAnalytics?.summary.orderGrowthRate}
              icon={<ShoppingCart className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Average Order Value"
              value={orderAnalytics?.summary.averageOrderValue || 0}
              description="Per transaction"
              trend={paymentAnalytics?.trends?.averageTransactionGrowth}
              icon={<Activity className="h-4 w-4" />}
              format="currency"
              loading={loading}
            />
            <MetricCard
              title="Success Rate"
              value={paymentAnalytics?.summary.successRate || 0}
              description={`${(100 - (paymentAnalytics?.summary.failureRate || 0)).toFixed(1)}% successful`}
              icon={<CreditCard className="h-4 w-4" />}
              format="percentage"
              loading={loading}
            />
          </div>

          {/* Payment Methods Breakdown */}
          {paymentAnalytics?.byMethod &&
            paymentAnalytics.byMethod.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Revenue breakdown by payment type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentAnalytics.byMethod.map((method) => (
                      <div
                        key={method.method}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{method.method}</p>
                            <p className="text-xs text-muted-foreground">
                              {method.count} transactions •{" "}
                              {method.successRate.toFixed(1)}% success
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(method.revenue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(
                              (method.revenue /
                                (paymentAnalytics.summary.totalRevenue || 1)) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Fulfillment Metrics */}
          {orderAnalytics?.fulfillment && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Avg Fulfillment Time"
                value={`${orderAnalytics.fulfillment.averageFulfillmentTime.toFixed(1)}h`}
                description="Time to fulfill orders"
                icon={<Activity className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="On-Time Delivery"
                value={orderAnalytics.fulfillment.onTimeDeliveryRate}
                description="Orders delivered on time"
                icon={<Package className="h-4 w-4" />}
                format="percentage"
                loading={loading}
              />
              <MetricCard
                title="Pending Orders"
                value={orderAnalytics.fulfillment.pendingOrders}
                description="Awaiting fulfillment"
                icon={<ShoppingCart className="h-4 w-4" />}
                loading={loading}
              />
              <MetricCard
                title="Processing Orders"
                value={orderAnalytics.fulfillment.processingOrders}
                description="Currently being processed"
                icon={<Activity className="h-4 w-4" />}
                loading={loading}
              />
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 💰 REVENUE TAB */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Revenue"
              value={paymentAnalytics?.summary.totalRevenue || 0}
              trend={paymentAnalytics?.trends?.revenueGrowth}
              icon={<DollarSign className="h-4 w-4" />}
              format="currency"
              loading={loading}
            />
            <MetricCard
              title="Average Transaction"
              value={paymentAnalytics?.summary.averageTransaction || 0}
              trend={paymentAnalytics?.trends?.averageTransactionGrowth}
              icon={<Activity className="h-4 w-4" />}
              format="currency"
              loading={loading}
            />
            <MetricCard
              title="Total Transactions"
              value={paymentAnalytics?.summary.totalTransactions || 0}
              trend={paymentAnalytics?.trends?.transactionGrowth}
              icon={<CreditCard className="h-4 w-4" />}
              loading={loading}
            />
          </div>

          {/* Revenue Time Series */}
          {paymentAnalytics?.timeSeries &&
            paymentAnalytics.timeSeries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Historical revenue trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {paymentAnalytics.timeSeries
                      .slice(-10)
                      .map((point, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-muted-foreground">
                            {new Date(point.timestamp).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">
                              {point.transactions} transactions
                            </span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(point.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 🛒 ORDERS TAB */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Orders"
              value={orderAnalytics?.summary.totalOrders || 0}
              trend={orderAnalytics?.summary.orderGrowthRate}
              icon={<ShoppingCart className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Average Order Value"
              value={orderAnalytics?.summary.averageOrderValue || 0}
              icon={<DollarSign className="h-4 w-4" />}
              format="currency"
              loading={loading}
            />
            <MetricCard
              title="Conversion Rate"
              value={orderAnalytics?.summary.conversionRate || 0}
              description="Visitors to customers"
              icon={<Activity className="h-4 w-4" />}
              format="percentage"
              loading={loading}
            />
            <MetricCard
              title="Repeat Customers"
              value={orderAnalytics?.customers?.repeatCustomers || 0}
              description={`${orderAnalytics?.customers?.totalCustomers || 0} total customers`}
              icon={<Users className="h-4 w-4" />}
              loading={loading}
            />
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 👥 CUSTOMERS TAB */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Customers"
              value={orderAnalytics?.customers?.totalCustomers || 0}
              icon={<Users className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Repeat Customers"
              value={orderAnalytics?.customers?.repeatCustomers || 0}
              description={`${(((orderAnalytics?.customers?.repeatCustomers || 0) / (orderAnalytics?.customers?.totalCustomers || 1)) * 100).toFixed(1)}% repeat rate`}
              icon={<Users className="h-4 w-4" />}
              loading={loading}
            />
            <MetricCard
              title="Avg Lifetime Value"
              value={orderAnalytics?.customers?.averageLifetimeValue || 0}
              description="Per customer"
              icon={<DollarSign className="h-4 w-4" />}
              format="currency"
              loading={loading}
            />
          </div>

          {/* Top Customers */}
          {orderAnalytics?.customers?.topCustomers &&
            orderAnalytics.customers.topCustomers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Highest spending customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderAnalytics.customers.topCustomers.map(
                      (customer, index) => (
                        <div
                          key={customer.customerId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">
                                {customer.customerName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {customer.totalOrders} orders
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(customer.lifetimeValue)}
                            </p>
                            <p className="text-xs text-muted-foreground">LTV</p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 📦 PRODUCTS TAB */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="products" className="space-y-4">
          {orderAnalytics?.products?.topProducts &&
          orderAnalytics.products.topProducts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Best performing products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderAnalytics.products.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.unitsSold} units sold • Avg{" "}
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(product.averagePrice)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(product.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total revenue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No product data available for this period</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Divine Consciousness Footer */}
      {(paymentAnalytics?.agricultural || orderAnalytics?.agricultural) && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              🌾⚡ Agricultural Consciousness:{" "}
              {paymentAnalytics?.agricultural?.consciousness ||
                orderAnalytics?.agricultural?.consciousness}
              {" • "}
              Season:{" "}
              {paymentAnalytics?.agricultural?.season ||
                orderAnalytics?.agricultural?.season}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
