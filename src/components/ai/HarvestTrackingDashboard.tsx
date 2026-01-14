"use client";

/**
 * 🌾 HARVEST TRACKING DASHBOARD
 * Comprehensive harvest tracking with AI-powered insights and seasonal analytics
 *
 * Features:
 * - Real-time harvest metrics and KPIs
 * - Seasonal yield trends and comparisons
 * - Crop performance analytics
 * - Weather impact analysis
 * - AI-powered recommendations
 * - Export and reporting capabilities
 *
 * @module components/ai/HarvestTrackingDashboard
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface HarvestTrackingDashboardProps {
  farmId: string;
  className?: string;
}

export interface HarvestMetrics {
  totalYield: number;
  totalValue: number;
  activeCrops: number;
  completedHarvests: number;
  averageQuality: number;
  yieldTrend: number; // Percentage change
  valueTrend: number; // Percentage change
}

export interface CropPerformance {
  cropId: string;
  cropName: string;
  category: string;
  plantedArea: number;
  harvestedYield: number;
  expectedYield: number;
  yieldEfficiency: number; // Percentage
  totalValue: number;
  averageQuality: number;
  harvestCount: number;
  lastHarvestDate: string;
  status: "ACTIVE" | "COMPLETED" | "DELAYED" | "ISSUES";
}

export interface SeasonalInsight {
  season: string;
  year: number;
  totalYield: number;
  totalValue: number;
  topCrops: Array<{ name: string; yield: number }>;
  weatherImpact: string;
  recommendations: string[];
}

export interface HarvestRecord {
  id: string;
  cropName: string;
  date: string;
  quantity: number;
  unit: string;
  quality: number;
  value: number;
  weather: string;
  notes?: string;
}

// ============================================================================
// Mock Data (Replace with actual API calls)
// ============================================================================

const mockMetrics: HarvestMetrics = {
  totalYield: 12450,
  totalValue: 45680,
  activeCrops: 8,
  completedHarvests: 23,
  averageQuality: 4.2,
  yieldTrend: 15.3,
  valueTrend: 18.7,
};

const mockCropPerformance: CropPerformance[] = [
  {
    cropId: "1",
    cropName: "Heirloom Tomatoes",
    category: "Vegetables",
    plantedArea: 2.5,
    harvestedYield: 3200,
    expectedYield: 3000,
    yieldEfficiency: 106.7,
    totalValue: 12800,
    averageQuality: 4.5,
    harvestCount: 8,
    lastHarvestDate: "2024-01-15",
    status: "ACTIVE",
  },
  {
    cropId: "2",
    cropName: "Organic Lettuce",
    category: "Leafy Greens",
    plantedArea: 1.8,
    harvestedYield: 1850,
    expectedYield: 2000,
    yieldEfficiency: 92.5,
    totalValue: 5550,
    averageQuality: 4.0,
    harvestCount: 12,
    lastHarvestDate: "2024-01-18",
    status: "ACTIVE",
  },
  {
    cropId: "3",
    cropName: "Sweet Corn",
    category: "Vegetables",
    plantedArea: 3.0,
    harvestedYield: 4200,
    expectedYield: 4500,
    yieldEfficiency: 93.3,
    totalValue: 8400,
    averageQuality: 4.3,
    harvestCount: 5,
    lastHarvestDate: "2024-01-10",
    status: "DELAYED",
  },
];

const mockSeasonalInsights: SeasonalInsight[] = [
  {
    season: "WINTER",
    year: 2024,
    totalYield: 8500,
    totalValue: 32000,
    topCrops: [
      { name: "Spinach", yield: 2200 },
      { name: "Kale", yield: 1800 },
      { name: "Carrots", yield: 1500 },
    ],
    weatherImpact:
      "Mild winter with adequate rainfall; excellent growing conditions",
    recommendations: [
      "Increase spinach planting area by 20% next winter",
      "Consider adding Brussels sprouts to crop rotation",
      "Implement frost protection for late-season crops",
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

export function HarvestTrackingDashboard({
  farmId,
  className = "",
}: HarvestTrackingDashboardProps) {
  const [metrics, setMetrics] = useState<HarvestMetrics>(mockMetrics);
  const [cropPerformance, setCropPerformance] =
    useState<CropPerformance[]>(mockCropPerformance);
  const [seasonalInsights, setSeasonalInsights] =
    useState<SeasonalInsight[]>(mockSeasonalInsights);
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    loadDashboardData();
  }, [farmId, selectedPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const [metricsData, performanceData, insightsData] = await Promise.all([
      //   fetch(`/api/farms/${farmId}/harvest/metrics?period=${selectedPeriod}`),
      //   fetch(`/api/farms/${farmId}/harvest/performance?period=${selectedPeriod}`),
      //   fetch(`/api/farms/${farmId}/harvest/insights`),
      // ]);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Using mock data for now
      setMetrics(mockMetrics);
      setCropPerformance(mockCropPerformance);
      setSeasonalInsights(mockSeasonalInsights);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load harvest data", {
        description: "Please try refreshing the page",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast.success("Export started", {
      description: "Your harvest report will be downloaded shortly",
    });
    // TODO: Implement actual export functionality
  };

  const handleRefresh = () => {
    loadDashboardData();
    toast.success("Data refreshed");
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "DELAYED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "ISSUES":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return "text-green-600 dark:text-green-400";
    if (efficiency >= 90) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return "📈";
    if (trend < 0) return "📉";
    return "➡️";
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>🌾</span>
            Harvest Tracking Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor crop performance and harvest analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="season">Current Season</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            🔄 Refresh
          </Button>
          <Button onClick={handleExport}>📊 Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Yield</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.totalYield.toLocaleString()} lbs
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              {getTrendIcon(metrics.yieldTrend)}
              <span
                className={
                  metrics.yieldTrend >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {metrics.yieldTrend >= 0 ? "+" : ""}
                {metrics.yieldTrend.toFixed(1)}%
              </span>
              <span className="ml-1">vs last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${metrics.totalValue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              {getTrendIcon(metrics.valueTrend)}
              <span
                className={
                  metrics.valueTrend >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {metrics.valueTrend >= 0 ? "+" : ""}
                {metrics.valueTrend.toFixed(1)}%
              </span>
              <span className="ml-1">vs last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.activeCrops}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.completedHarvests} harvests completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-1">
              {metrics.averageQuality.toFixed(1)}
              <span className="text-xl text-yellow-500">⭐</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Out of 5.0 rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crops">Crop Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Yield Trends</CardTitle>
              <CardDescription>
                Track your harvest performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">
                    📊 Chart Visualization
                  </p>
                  <p className="text-sm">
                    Line chart showing yield trends over the selected period
                  </p>
                  <p className="text-xs mt-1">
                    (Integration with Chart.js or Recharts)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Harvests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCropPerformance.slice(0, 5).map((crop) => (
                    <div
                      key={crop.cropId}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{crop.cropName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(crop.lastHarvestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{crop.harvestedYield} lbs</p>
                        <p className="text-sm text-muted-foreground">
                          ${crop.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Crops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cropPerformance
                    .sort((a, b) => b.yieldEfficiency - a.yieldEfficiency)
                    .slice(0, 5)
                    .map((crop) => (
                      <div
                        key={crop.cropId}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{crop.cropName}</p>
                          <p className="text-sm text-muted-foreground">
                            {crop.plantedArea} acres
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${getEfficiencyColor(crop.yieldEfficiency)}`}
                          >
                            {crop.yieldEfficiency.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            efficiency
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crop Performance Tab */}
        <TabsContent value="crops" className="space-y-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {cropPerformance.map((crop) => (
                  <SelectItem key={crop.cropId} value={crop.cropId}>
                    {crop.cropName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {cropPerformance.map((crop) => (
              <Card key={crop.cropId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {crop.cropName}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(crop.status)}`}
                        >
                          {crop.status}
                        </span>
                      </CardTitle>
                      <CardDescription>{crop.category}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {crop.harvestedYield.toLocaleString()} lbs
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${crop.totalValue.toLocaleString()} value
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Planted Area
                      </p>
                      <p className="text-lg font-medium">
                        {crop.plantedArea} acres
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Efficiency
                      </p>
                      <p
                        className={`text-lg font-medium ${getEfficiencyColor(crop.yieldEfficiency)}`}
                      >
                        {crop.yieldEfficiency.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quality</p>
                      <p className="text-lg font-medium flex items-center gap-1">
                        {crop.averageQuality.toFixed(1)}
                        <span className="text-sm text-yellow-500">⭐</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Harvests</p>
                      <p className="text-lg font-medium">{crop.harvestCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Expected: {crop.expectedYield.toLocaleString()} lbs
                      </span>
                      <span className="text-muted-foreground">
                        Last harvest:{" "}
                        {new Date(crop.lastHarvestDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          {seasonalInsights.map((insight, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  {insight.season} {insight.year} Insights
                </CardTitle>
                <CardDescription>
                  AI-powered analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="font-medium mb-2">Season Summary</h4>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Yield
                      </p>
                      <p className="text-xl font-bold">
                        {insight.totalYield.toLocaleString()} lbs
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Value
                      </p>
                      <p className="text-xl font-bold">
                        ${insight.totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Crops */}
                <div>
                  <h4 className="font-medium mb-2">Top Performing Crops</h4>
                  <div className="space-y-2">
                    {insight.topCrops.map((crop, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded"
                      >
                        <span className="font-medium">
                          {i + 1}. {crop.name}
                        </span>
                        <span className="text-muted-foreground">
                          {crop.yield.toLocaleString()} lbs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Impact */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span>🌤️</span>
                    Weather Impact
                  </h4>
                  <p className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                    {insight.weatherImpact}
                  </p>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span>💡</span>
                    AI Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                      >
                        <span className="text-green-600 dark:text-green-400 mt-0.5">
                          ✓
                        </span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Get More Insights Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Need personalized recommendations for your farm?
                </p>
                <Button size="lg">
                  <span className="mr-2">🌾</span>
                  Get AI Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
