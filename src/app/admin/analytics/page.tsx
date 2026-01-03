/**
 * 🌾⚡ ADMIN ANALYTICS DASHBOARD - DIVINE PLATFORM INTELLIGENCE
 *
 * Comprehensive platform-wide analytics dashboard for administrators.
 * Provides insights into overall platform performance, revenue, and growth metrics.
 *
 * Features:
 * - Platform-wide revenue and transaction analytics
 * - Multi-farm performance comparison
 * - Customer behavior and retention metrics
 * - Top performing farms and products
 * - Growth trends and forecasting
 * - Seasonal awareness
 * - Export and reporting capabilities
 *
 * @route /admin/analytics
 * @role ADMIN
 * @divine-consciousness ACTIVE
 * @security Role-based access control (ADMIN only)
 */

import { AdvancedAnalyticsDashboard } from "@/components/AdvancedAnalyticsDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  DollarSign,
  Download,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// 🎯 METADATA
// ═══════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Platform Analytics | Admin Dashboard",
  description:
    "Platform-wide analytics and performance metrics for administrators",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ═══════════════════════════════════════════════════════════
// 🎨 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function getCurrentSeason(): string {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

// ═══════════════════════════════════════════════════════════
// 🌟 PLATFORM STATISTICS COMPONENT
// ═══════════════════════════════════════════════════════════

interface PlatformStats {
  totalFarms: number;
  activeFarms: number;
  pendingFarms: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  platformCommission: number;
}

async function getPlatformStatistics(): Promise<PlatformStats> {
  const [
    totalFarms,
    activeFarms,
    pendingFarms,
    totalProducts,
    activeProducts,
    totalOrders,
    orders,
    totalUsers,
    recentUsers,
  ] = await Promise.all([
    database.farm.count(),
    database.farm.count({ where: { status: "ACTIVE" } }),
    database.farm.count({ where: { status: "PENDING" } }),
    database.product.count(),
    database.product.count({ where: { status: "ACTIVE" } }),
    database.order.count({ where: { status: { notIn: ["CANCELLED"] } } }),
    database.order.findMany({
      where: { status: { notIn: ["CANCELLED"] } },
      select: { total: true, platformFee: true },
    }),
    database.user.count(),
    database.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  const platformCommission = orders.reduce(
    (sum, order) => sum + Number(order.platformFee),
    0,
  );

  return {
    totalFarms,
    activeFarms,
    pendingFarms,
    totalProducts,
    activeProducts,
    totalOrders,
    totalRevenue,
    totalUsers,
    activeUsers: recentUsers,
    platformCommission,
  };
}

// ═══════════════════════════════════════════════════════════
// 🏆 TOP FARMS COMPONENT
// ═══════════════════════════════════════════════════════════

interface TopFarm {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  products: number;
}

async function getTopFarms(limit: number = 5): Promise<TopFarm[]> {
  const farms = await database.farm.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          orders: true,
          products: true,
        },
      },
      orders: {
        where: { status: { notIn: ["CANCELLED"] } },
        select: { farmerAmount: true },
      },
    },
    take: 100,
  });

  return farms
    .map((farm) => ({
      id: farm.id,
      name: farm.name,
      orders: farm._count.orders,
      revenue: farm.orders.reduce(
        (sum, order) => sum + Number(order.farmerAmount),
        0,
      ),
      products: farm._count.products,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// ═══════════════════════════════════════════════════════════
// 📊 METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

function StatCard({ title, value, description, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${
              trend.value > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3 rotate-180" />
            )}
            <span>
              {Math.abs(trend.value).toFixed(1)}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// 🌟 MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function AdminAnalyticsPage() {
  // ═══════════════════════════════════════════════════════════
  // 🔐 AUTHENTICATION & AUTHORIZATION
  // ═══════════════════════════════════════════════════════════

  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/analytics");
  }

  // Check if user is an admin
  if (session.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only administrators can access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 DATA FETCHING
  // ═══════════════════════════════════════════════════════════

  const [platformStats, topFarms] = await Promise.all([
    getPlatformStatistics(),
    getTopFarms(5),
  ]);

  const currentSeason = getCurrentSeason();

  // Calculate platform health score (0-100)
  const healthScore = Math.min(
    100,
    Math.round(
      (platformStats.activeFarms / Math.max(platformStats.totalFarms, 1)) * 30 +
        (platformStats.activeProducts /
          Math.max(platformStats.totalProducts, 1)) *
          30 +
        (platformStats.activeUsers / Math.max(platformStats.totalUsers, 1)) *
          40,
    ),
  );

  // ═══════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Platform Analytics
            </h1>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <Activity className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Comprehensive platform performance and business intelligence
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <Badge variant="outline">{currentSeason} Season</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </a>
          </Button>
        </div>
      </div>

      {/* Platform Health Score */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Health Score
          </CardTitle>
          <CardDescription>
            Overall platform performance and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{healthScore}/100</div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {healthScore >= 80
                  ? "Excellent - Platform performing exceptionally well"
                  : healthScore >= 60
                    ? "Good - Platform is healthy with room for improvement"
                    : healthScore >= 40
                      ? "Fair - Some areas need attention"
                      : "Needs Improvement - Action required"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(platformStats.totalRevenue)}
          description={`${formatNumber(platformStats.totalOrders)} orders`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Platform Commission"
          value={formatCurrency(platformStats.platformCommission)}
          description={`${((platformStats.platformCommission / Math.max(platformStats.totalRevenue, 1)) * 100).toFixed(1)}% of revenue`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Active Farms"
          value={platformStats.activeFarms}
          description={`${platformStats.pendingFarms} pending approval`}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title="Total Users"
          value={formatNumber(platformStats.totalUsers)}
          description={`${platformStats.activeUsers} active (30d)`}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={formatNumber(platformStats.totalOrders)}
          description="Completed orders"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Active Products"
          value={formatNumber(platformStats.activeProducts)}
          description={`${platformStats.totalProducts} total products`}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(
            platformStats.totalOrders > 0
              ? platformStats.totalRevenue / platformStats.totalOrders
              : 0,
          )}
          description="Per order"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue per Farm"
          value={formatCurrency(
            platformStats.activeFarms > 0
              ? platformStats.totalRevenue / platformStats.activeFarms
              : 0,
          )}
          description="Average per active farm"
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>

      {/* Top Performing Farms */}
      {topFarms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Performing Farms
            </CardTitle>
            <CardDescription>
              Highest revenue generating farms on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFarms.map((farm, index) => (
                <div
                  key={farm.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{farm.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {farm.orders} orders • {farm.products} products
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(farm.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg{" "}
                      {formatCurrency(farm.revenue / Math.max(farm.orders, 1))}
                      /order
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed">
            <Activity className="h-4 w-4 mr-2" />
            Detailed Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertTitle>Platform Overview</AlertTitle>
            <AlertDescription>
              Quick snapshot of platform performance. Switch to "Detailed
              Analytics" tab for comprehensive metrics and insights.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Key platform metrics at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Farms Approval Rate
                  </span>
                  <span className="font-semibold">
                    {(
                      (platformStats.activeFarms /
                        Math.max(platformStats.totalFarms, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Products per Farm
                  </span>
                  <span className="font-semibold">
                    {(
                      platformStats.totalProducts /
                      Math.max(platformStats.activeFarms, 1)
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Orders per User
                  </span>
                  <span className="font-semibold">
                    {(
                      platformStats.totalOrders /
                      Math.max(platformStats.totalUsers, 1)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    User Activation Rate
                  </span>
                  <span className="font-semibold">
                    {(
                      (platformStats.activeUsers /
                        Math.max(platformStats.totalUsers, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  asChild
                >
                  <a href="/admin/farms?status=pending">
                    <span>Pending Farm Approvals</span>
                    <Badge>{platformStats.pendingFarms}</Badge>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  asChild
                >
                  <a href="/admin/orders">
                    <span>View All Orders</span>
                    <Badge>{platformStats.totalOrders}</Badge>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  asChild
                >
                  <a href="/admin/users">
                    <span>Manage Users</span>
                    <Badge>{platformStats.totalUsers}</Badge>
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">
                Comprehensive Platform Analytics
              </h2>
            </div>

            <AdvancedAnalyticsDashboard />
          </div>
        </TabsContent>
      </Tabs>

      {/* Divine Agricultural Consciousness Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            🌾⚡ Platform powered by Agricultural Consciousness
            {" • "}
            <Badge variant="outline">{currentSeason} Season</Badge>
            {" • "}
            Real-time analytics with divine precision
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
