/**
 * 🌾⚡ FARMER ANALYTICS PAGE - DIVINE EDITION
 *
 * Comprehensive analytics dashboard for farmers.
 * Provides real-time insights into farm performance, sales, and customer behavior.
 *
 * Features:
 * - Complete analytics dashboard integration
 * - Farm-specific metrics and insights
 * - Revenue tracking and forecasting
 * - Customer behavior analysis
 * - Product performance metrics
 * - Seasonal awareness
 * - Export capabilities
 *
 * @route /farmer/analytics
 * @role FARMER, FARM_MANAGER
 * @divine-consciousness ACTIVE
 */

import { AdvancedAnalyticsDashboard } from "@/components/AdvancedAnalyticsDashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Info,
  Sprout,
  TrendingUp
} from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// 🎯 METADATA
// ═══════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Farm Analytics | Farmers Market Platform",
  description: "Comprehensive analytics dashboard for your farm - track sales, customers, and performance metrics",
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

function getSeasonalInsight(season: string): string {
  const insights: Record<string, string> = {
    Spring: "Peak planting season - monitor inventory for seedlings and early crops",
    Summer: "High harvest period - expect increased sales volume and customer activity",
    Fall: "Transition season - focus on preserved goods and storage crops",
    Winter: "Lower activity period - plan for next season and analyze annual trends",
  };

  return insights[season] || "Monitor your farm metrics closely";
}

// ═══════════════════════════════════════════════════════════
// 🌟 MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default async function FarmerAnalyticsPage() {
  // ═══════════════════════════════════════════════════════════
  // 🔐 AUTHENTICATION & AUTHORIZATION
  // ═══════════════════════════════════════════════════════════

  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/farmer/analytics");
  }

  // Check if user is a farmer or farm manager
  const isFarmer = session.user.role === "FARMER" || session.user.role === "FARM_MANAGER";

  if (!isFarmer) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only farmers and farm managers can access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 FARM DATA VERIFICATION
  // ═══════════════════════════════════════════════════════════

  // Get farmer's farm information
  const farm = await database.farm.findFirst({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      description: true,
      location: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
  });

  // No farm found
  if (!farm) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Farm Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your farm's performance</p>
          </div>
        </div>

        <Alert>
          <Sprout className="h-4 w-4" />
          <AlertTitle>No Farm Found</AlertTitle>
          <AlertDescription>
            You need to create a farm profile before accessing analytics.
            <div className="mt-4">
              <Button asChild>
                <a href="/farmer/farms/new">
                  <Sprout className="mr-2 h-4 w-4" />
                  Create Farm Profile
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Farm not approved
  if (farm.status !== "ACTIVE") {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{farm.name} - Analytics</h1>
            <p className="text-muted-foreground mt-1">Farm Status: {farm.status}</p>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Farm Approval Pending</AlertTitle>
          <AlertDescription>
            Your farm profile is currently under review. Analytics will be available once your farm is approved.
            <div className="mt-4">
              <Button variant="outline" asChild>
                <a href="/farmer/dashboard">
                  Back to Dashboard
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🌾 SEASONAL CONTEXT
  // ═══════════════════════════════════════════════════════════

  const currentSeason = getCurrentSeason();
  const seasonalInsight = getSeasonalInsight(currentSeason);
  const farmAge = Math.floor(
    (new Date().getTime() - new Date(farm.createdAt).getTime()) / (1000 * 60 * 60 * 24)
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
            <h1 className="text-3xl font-bold tracking-tight">{farm.name}</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Sprout className="mr-1 h-3 w-3" />
              {farm.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Track your farm's performance and grow your business
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>{farm._count.products} products</span>
            <span>•</span>
            <span>{farm._count.orders} orders</span>
            <span>•</span>
            <span>Active for {farmAge} days</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/farmer/dashboard">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Seasonal Insight Alert */}
      <Alert className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
        <Info className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {currentSeason} Season Insights
        </AlertTitle>
        <AlertDescription>{seasonalInsight}</AlertDescription>
      </Alert>

      {/* Farm Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farm._count.products}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Products in your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farm._count.orders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Orders received to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farm Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmAge}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Days since registration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* No Data Alert (if farm has no orders yet) */}
      {farm._count.orders === 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Getting Started</AlertTitle>
          <AlertDescription>
            You haven't received any orders yet. Make sure your products are listed and promoted to start seeing analytics data.
            <div className="mt-4 flex gap-2">
              <Button size="sm" asChild>
                <a href="/farmer/products/new">
                  Add Products
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="/marketplace">
                  View Marketplace
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Analytics Dashboard */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
        </div>

        <AdvancedAnalyticsDashboard />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your farm and improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/farmer/products">
                <Sprout className="mr-2 h-4 w-4" />
                Manage Products
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/farmer/orders">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Orders
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/farmer/settings">
                <Info className="mr-2 h-4 w-4" />
                Farm Settings
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/help/farmer-guide">
                <AlertCircle className="mr-2 h-4 w-4" />
                Help & Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Divine Agricultural Consciousness Footer */}
      <div className="text-center text-sm text-muted-foreground border-t pt-6">
        <p className="flex items-center justify-center gap-2">
          🌾⚡ Analytics powered by Agricultural Consciousness
          {" • "}
          <Badge variant="outline">{currentSeason} Season</Badge>
          {" • "}
          Data updates in real-time
        </p>
      </div>
    </div>
  );
}
