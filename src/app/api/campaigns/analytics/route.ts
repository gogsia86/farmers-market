/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 CAMPAIGN ANALYTICS API - PERFORMANCE TRACKING                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Phase 5: Advanced Features - Campaign Automation                ║
 * ║  Purpose: Track and analyze campaign performance                 ║
 * ║  Routes:                                                         ║
 * ║    GET    /api/campaigns/analytics - Get analytics & reports    ║
 * ║  Version: 1.0.0                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { createLogger } from "@/lib/logger";
import { campaignAnalyticsService } from "@/lib/services/campaigns/campaign-analytics.service";
import type { CampaignType } from "@/lib/services/campaigns/campaign-automation.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("campaign-analytics-api");

// ═══════════════════════════════════════════════════════════════════
// 📊 GET - Campaign Analytics
// ═══════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const campaignType = searchParams.get("type") as CampaignType | null;
    const campaignId = searchParams.get("campaignId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const compareWith = searchParams.get("compareWith");

    logger.debug("Campaign analytics request", {
      action,
      campaignType,
      campaignId,
      startDate,
      endDate,
    });

    // Get specific campaign performance
    if (action === "performance" && campaignId) {
      const performance =
        campaignAnalyticsService.getCampaignPerformance(campaignId);

      if (!performance) {
        logger.warn("Campaign not found for performance request", {
          campaignId,
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CAMPAIGN_NOT_FOUND",
              message: `Campaign ${campaignId} not found`,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 },
        );
      }

      logger.info("Campaign performance retrieved", { campaignId });

      return NextResponse.json({
        success: true,
        data: {
          performance,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Compare two campaigns (A/B testing)
    if (action === "compare" && campaignId && compareWith) {
      const comparison = campaignAnalyticsService.compareCampaigns(
        campaignId,
        compareWith,
      );

      if (!comparison) {
        logger.warn("Campaigns not found for comparison", {
          campaignId,
          compareWith,
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CAMPAIGNS_NOT_FOUND",
              message: "One or both campaigns not found",
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 },
        );
      }

      logger.info("Campaign comparison completed", {
        campaignId,
        compareWith,
      });

      return NextResponse.json({
        success: true,
        data: {
          comparison,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate comprehensive report
    if (action === "report") {
      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      logger.info("Generating campaign report", {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      const report = await campaignAnalyticsService.generateReport(start, end);

      logger.info("Campaign report generated successfully", {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      return NextResponse.json({
        success: true,
        data: {
          report,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get campaigns by type
    if (campaignType) {
      const campaigns =
        campaignAnalyticsService.getCampaignsByType(campaignType);

      logger.info("Campaigns retrieved by type", {
        campaignType,
        count: campaigns.length,
      });

      return NextResponse.json({
        success: true,
        data: {
          campaigns,
          type: campaignType,
          count: campaigns.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get campaigns in date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const campaigns = campaignAnalyticsService.getCampaignsInDateRange(
        start,
        end,
      );

      logger.info("Campaigns retrieved for date range", {
        startDate,
        endDate,
        count: campaigns.length,
      });

      return NextResponse.json({
        success: true,
        data: {
          campaigns,
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
          count: campaigns.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get summary statistics (default)
    const stats = campaignAnalyticsService.getSummaryStats();
    const allCampaigns = campaignAnalyticsService.getAllCampaigns();

    logger.info("Campaign analytics summary retrieved", {
      totalCampaigns: allCampaigns.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        recentCampaigns: allCampaigns.slice(-10), // Last 10 campaigns
      },
      meta: {
        total: allCampaigns.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching campaign analytics", error as Error, {
      endpoint: "GET /api/campaigns/analytics",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ANALYTICS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch campaign analytics",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
