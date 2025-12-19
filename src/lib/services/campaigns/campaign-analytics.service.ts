/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 CAMPAIGN ANALYTICS SERVICE - PERFORMANCE TRACKING & ROI      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Phase 5: Advanced Features - Campaign Automation                ║
 * ║  Purpose: Track campaign performance and calculate ROI           ║
 * ║  Features:                                                       ║
 * ║    • Campaign Performance Metrics                               ║
 * ║    • ROI Calculation                                            ║
 * ║    • A/B Testing Results                                        ║
 * ║    • Conversion Tracking                                        ║
 * ║    • Revenue Attribution                                        ║
 * ║  Version: 1.0.0                                                 ║
 * ║  Lines: ~400                                                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { database } from "@/lib/database";
import type {
  CampaignType,
  CampaignMetrics,
} from "./campaign-automation.service";

// ═══════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface CampaignPerformance {
  campaignId: string;
  campaignType: CampaignType;
  sentDate: Date;
  metrics: CampaignMetrics;
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    unsubscribeRate: number;
  };
  roi: {
    cost: number;
    revenue: number;
    profit: number;
    roiPercentage: number;
  };
}

export interface CampaignComparison {
  campaignA: CampaignPerformance;
  campaignB: CampaignPerformance;
  winner?: "A" | "B" | "TIE";
  confidenceLevel: number;
  insights: string[];
}

export interface CampaignInsights {
  bestPerformingType: CampaignType;
  worstPerformingType: CampaignType;
  averageOpenRate: number;
  averageClickRate: number;
  averageConversionRate: number;
  totalRevenue: number;
  totalROI: number;
  recommendations: string[];
}

export interface TimeSeriesData {
  date: Date;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
}

export interface CampaignReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalCampaigns: number;
    totalRecipients: number;
    totalRevenue: number;
    totalROI: number;
  };
  byType: Record<CampaignType, CampaignMetrics>;
  timeSeries: TimeSeriesData[];
  insights: CampaignInsights;
}

// ═══════════════════════════════════════════════════════════════════
// 🏗️ CAMPAIGN ANALYTICS SERVICE
// ═══════════════════════════════════════════════════════════════════

export class CampaignAnalyticsService {
  private static instance: CampaignAnalyticsService;
  private campaignData: Map<string, CampaignPerformance> = new Map();

  private constructor() {}

  public static getInstance(): CampaignAnalyticsService {
    if (!CampaignAnalyticsService.instance) {
      CampaignAnalyticsService.instance = new CampaignAnalyticsService();
    }
    return CampaignAnalyticsService.instance;
  }

  // ═════════════════════════════════════════════════════════════════
  // 📊 PERFORMANCE TRACKING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Track campaign execution
   */
  trackCampaign(
    campaignId: string,
    campaignType: CampaignType,
    metrics: CampaignMetrics,
    cost = 0,
  ): void {
    const performance: CampaignPerformance = {
      campaignId,
      campaignType,
      sentDate: new Date(),
      metrics,
      rates: this.calculateRates(metrics),
      roi: this.calculateROI(metrics, cost),
    };

    this.campaignData.set(campaignId, performance);
    console.log(`📊 Campaign tracked: ${campaignId} (${campaignType})`);
  }

  /**
   * Update campaign metrics
   */
  updateCampaignMetrics(
    campaignId: string,
    updates: Partial<CampaignMetrics>,
  ): boolean {
    const campaign = this.campaignData.get(campaignId);
    if (!campaign) return false;

    campaign.metrics = { ...campaign.metrics, ...updates };
    campaign.rates = this.calculateRates(campaign.metrics);
    campaign.roi = this.calculateROI(campaign.metrics, campaign.roi.cost);

    this.campaignData.set(campaignId, campaign);
    return true;
  }

  /**
   * Calculate performance rates
   */
  private calculateRates(
    metrics: CampaignMetrics,
  ): CampaignPerformance["rates"] {
    const deliveryRate =
      metrics.sent > 0 ? metrics.delivered / metrics.sent : 0;
    const openRate =
      metrics.delivered > 0 ? metrics.opened / metrics.delivered : 0;
    const clickRate = metrics.opened > 0 ? metrics.clicked / metrics.opened : 0;
    const conversionRate =
      metrics.clicked > 0 ? metrics.converted / metrics.clicked : 0;
    const unsubscribeRate =
      metrics.sent > 0 ? metrics.unsubscribed / metrics.sent : 0;

    return {
      deliveryRate: Math.round(deliveryRate * 10000) / 100,
      openRate: Math.round(openRate * 10000) / 100,
      clickRate: Math.round(clickRate * 10000) / 100,
      conversionRate: Math.round(conversionRate * 10000) / 100,
      unsubscribeRate: Math.round(unsubscribeRate * 10000) / 100,
    };
  }

  /**
   * Calculate ROI
   */
  private calculateROI(
    metrics: CampaignMetrics,
    cost: number,
  ): CampaignPerformance["roi"] {
    const revenue = metrics.revenue || 0;
    const profit = revenue - cost;
    const roiPercentage = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      cost,
      revenue,
      profit,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
    };
  }

  // ═════════════════════════════════════════════════════════════════
  // 📈 CAMPAIGN REPORTING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Get campaign performance
   */
  getCampaignPerformance(campaignId: string): CampaignPerformance | undefined {
    return this.campaignData.get(campaignId);
  }

  /**
   * Get all campaigns by type
   */
  getCampaignsByType(campaignType: CampaignType): CampaignPerformance[] {
    return Array.from(this.campaignData.values()).filter(
      (c) => c.campaignType === campaignType,
    );
  }

  /**
   * Get campaigns in date range
   */
  getCampaignsInDateRange(
    startDate: Date,
    endDate: Date,
  ): CampaignPerformance[] {
    return Array.from(this.campaignData.values()).filter(
      (c) => c.sentDate >= startDate && c.sentDate <= endDate,
    );
  }

  /**
   * Generate comprehensive campaign report
   */
  async generateReport(
    startDate: Date,
    endDate: Date,
  ): Promise<CampaignReport> {
    const campaigns = this.getCampaignsInDateRange(startDate, endDate);

    // Summary calculations
    const totalCampaigns = campaigns.length;
    const totalRecipients = campaigns.reduce(
      (sum, c) => sum + c.metrics.sent,
      0,
    );
    const totalRevenue = campaigns.reduce(
      (sum, c) => sum + (c.roi.revenue || 0),
      0,
    );
    const totalCost = campaigns.reduce((sum, c) => sum + c.roi.cost, 0);
    const totalROI =
      totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    // Group by type
    const byType: Partial<Record<CampaignType, CampaignMetrics>> = {};
    for (const campaign of campaigns) {
      if (!byType[campaign.campaignType]) {
        byType[campaign.campaignType] = {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          bounced: 0,
          unsubscribed: 0,
          revenue: 0,
        };
      }

      const typeMetrics = byType[campaign.campaignType]!;
      typeMetrics.sent += campaign.metrics.sent;
      typeMetrics.delivered += campaign.metrics.delivered;
      typeMetrics.opened += campaign.metrics.opened;
      typeMetrics.clicked += campaign.metrics.clicked;
      typeMetrics.converted += campaign.metrics.converted;
      typeMetrics.bounced += campaign.metrics.bounced;
      typeMetrics.unsubscribed += campaign.metrics.unsubscribed;
      typeMetrics.revenue =
        (typeMetrics.revenue || 0) + (campaign.roi.revenue || 0);
    }

    // Time series data
    const timeSeries = this.generateTimeSeries(campaigns, startDate, endDate);

    // Generate insights
    const insights = this.generateInsights(campaigns);

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalCampaigns,
        totalRecipients,
        totalRevenue,
        totalROI: Math.round(totalROI * 100) / 100,
      },
      byType: byType as Record<CampaignType, CampaignMetrics>,
      timeSeries,
      insights,
    };
  }

  /**
   * Generate time series data
   */
  private generateTimeSeries(
    campaigns: CampaignPerformance[],
    startDate: Date,
    endDate: Date,
  ): TimeSeriesData[] {
    const timeSeries: TimeSeriesData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayCampaigns = campaigns.filter(
        (c) => c.sentDate >= dayStart && c.sentDate <= dayEnd,
      );

      timeSeries.push({
        date: new Date(currentDate),
        sent: dayCampaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
        opened: dayCampaigns.reduce((sum, c) => sum + c.metrics.opened, 0),
        clicked: dayCampaigns.reduce((sum, c) => sum + c.metrics.clicked, 0),
        converted: dayCampaigns.reduce(
          (sum, c) => sum + c.metrics.converted,
          0,
        ),
        revenue: dayCampaigns.reduce((sum, c) => sum + (c.roi.revenue || 0), 0),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeSeries;
  }

  /**
   * Generate campaign insights
   */
  private generateInsights(campaigns: CampaignPerformance[]): CampaignInsights {
    if (campaigns.length === 0) {
      return {
        bestPerformingType: "CHURN_PREVENTION",
        worstPerformingType: "CHURN_PREVENTION",
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0,
        totalRevenue: 0,
        totalROI: 0,
        recommendations: ["Not enough data to generate insights"],
      };
    }

    // Calculate averages
    const avgOpenRate =
      campaigns.reduce((sum, c) => sum + c.rates.openRate, 0) /
      campaigns.length;
    const avgClickRate =
      campaigns.reduce((sum, c) => sum + c.rates.clickRate, 0) /
      campaigns.length;
    const avgConversionRate =
      campaigns.reduce((sum, c) => sum + c.rates.conversionRate, 0) /
      campaigns.length;
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.roi.revenue, 0);
    const totalCost = campaigns.reduce((sum, c) => sum + c.roi.cost, 0);
    const totalROI =
      totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

    // Find best and worst performing types
    const typePerformance = new Map<CampaignType, number>();
    for (const campaign of campaigns) {
      const current = typePerformance.get(campaign.campaignType) || 0;
      typePerformance.set(
        campaign.campaignType,
        current + campaign.rates.conversionRate,
      );
    }

    const sortedTypes = Array.from(typePerformance.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    const bestPerformingType = sortedTypes[0]?.[0] || "CHURN_PREVENTION";
    const worstPerformingType =
      sortedTypes[sortedTypes.length - 1]?.[0] || "CHURN_PREVENTION";

    // Generate recommendations
    const recommendations: string[] = [];

    if (avgOpenRate < 20) {
      recommendations.push(
        "📧 Open rates are low. Consider improving subject lines and send times.",
      );
    }
    if (avgClickRate < 10) {
      recommendations.push(
        "🔗 Click rates are low. Improve email content and CTAs.",
      );
    }
    if (avgConversionRate < 5) {
      recommendations.push(
        "💰 Conversion rates need improvement. Review landing pages and offers.",
      );
    }
    if (totalROI < 200) {
      recommendations.push(
        "📈 ROI could be better. Focus on high-converting campaign types.",
      );
    }
    if (avgOpenRate > 30) {
      recommendations.push(
        "✅ Great open rates! Maintain current subject line strategies.",
      );
    }
    if (totalROI > 500) {
      recommendations.push(
        "🎉 Excellent ROI! Scale up successful campaign types.",
      );
    }

    return {
      bestPerformingType,
      worstPerformingType,
      averageOpenRate: Math.round(avgOpenRate * 100) / 100,
      averageClickRate: Math.round(avgClickRate * 100) / 100,
      averageConversionRate: Math.round(avgConversionRate * 100) / 100,
      totalRevenue,
      totalROI: Math.round(totalROI * 100) / 100,
      recommendations,
    };
  }

  // ═════════════════════════════════════════════════════════════════
  // 🔬 A/B TESTING
  // ═════════════════════════════════════════════════════════════════

  /**
   * Compare two campaigns for A/B testing
   */
  compareCampaigns(
    campaignIdA: string,
    campaignIdB: string,
  ): CampaignComparison | null {
    const campaignA = this.campaignData.get(campaignIdA);
    const campaignB = this.campaignData.get(campaignIdB);

    if (!campaignA || !campaignB) return null;

    // Determine winner based on conversion rate
    let winner: "A" | "B" | "TIE" = "TIE";
    const conversionDiff = Math.abs(
      campaignA.rates.conversionRate - campaignB.rates.conversionRate,
    );

    if (conversionDiff > 5) {
      // 5% difference threshold
      winner =
        campaignA.rates.conversionRate > campaignB.rates.conversionRate
          ? "A"
          : "B";
    }

    // Calculate confidence level (simplified)
    const confidenceLevel = Math.min(
      (Math.abs(campaignA.metrics.converted - campaignB.metrics.converted) /
        Math.max(campaignA.metrics.converted, campaignB.metrics.converted)) *
        100,
      95,
    );

    // Generate insights
    const insights: string[] = [];

    if (winner !== "TIE") {
      insights.push(
        `Campaign ${winner} is the clear winner with ${conversionDiff.toFixed(1)}% higher conversion rate`,
      );
    } else {
      insights.push(
        "Both campaigns performed similarly. Consider testing different variables.",
      );
    }

    if (campaignA.rates.openRate > campaignB.rates.openRate + 5) {
      insights.push("Campaign A had significantly better open rates");
    } else if (campaignB.rates.openRate > campaignA.rates.openRate + 5) {
      insights.push("Campaign B had significantly better open rates");
    }

    if (campaignA.roi.roiPercentage > campaignB.roi.roiPercentage) {
      insights.push("Campaign A generated better ROI");
    } else if (campaignB.roi.roiPercentage > campaignA.roi.roiPercentage) {
      insights.push("Campaign B generated better ROI");
    }

    return {
      campaignA,
      campaignB,
      winner,
      confidenceLevel: Math.round(confidenceLevel * 100) / 100,
      insights,
    };
  }

  // ═════════════════════════════════════════════════════════════════
  // 🧹 UTILITIES
  // ═════════════════════════════════════════════════════════════════

  /**
   * Clear all campaign data (for testing)
   */
  clearAllData(): void {
    this.campaignData.clear();
    console.log("🧹 All campaign data cleared");
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): CampaignPerformance[] {
    return Array.from(this.campaignData.values());
  }

  /**
   * Get summary statistics
   */
  getSummaryStats(): {
    totalCampaigns: number;
    avgOpenRate: number;
    avgConversionRate: number;
    totalRevenue: number;
  } {
    const campaigns = this.getAllCampaigns();

    if (campaigns.length === 0) {
      return {
        totalCampaigns: 0,
        avgOpenRate: 0,
        avgConversionRate: 0,
        totalRevenue: 0,
      };
    }

    return {
      totalCampaigns: campaigns.length,
      avgOpenRate:
        campaigns.reduce((sum, c) => sum + c.rates.openRate, 0) /
        campaigns.length,
      avgConversionRate:
        campaigns.reduce((sum, c) => sum + c.rates.conversionRate, 0) /
        campaigns.length,
      totalRevenue: campaigns.reduce((sum, c) => sum + c.roi.revenue, 0),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🌟 SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const campaignAnalyticsService = CampaignAnalyticsService.getInstance();
