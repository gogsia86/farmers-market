/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎯 CAMPAIGNS API - MAIN ENDPOINT                                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Phase 5: Advanced Features - Campaign Automation                ║
 * ║  Purpose: Manage and execute marketing campaigns                 ║
 * ║  Routes:                                                         ║
 * ║    GET    /api/campaigns - List all campaigns                   ║
 * ║    POST   /api/campaigns - Create/Execute a campaign            ║
 * ║  Version: 1.0.0                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from "next/server";
import { campaignAutomationService } from "@/lib/services/campaigns/campaign-automation.service";
import { campaignAnalyticsService } from "@/lib/services/campaigns/campaign-analytics.service";
import { campaignSchedulerService } from "@/lib/services/campaigns/campaign-scheduler.service";
import type { CampaignType } from "@/lib/services/campaigns/campaign-automation.service";

// ═══════════════════════════════════════════════════════════════════
// 📊 GET - List Campaigns & Analytics
// ═══════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const campaignType = searchParams.get("type") as CampaignType | null;

    // Get summary statistics
    if (action === "stats") {
      const stats = campaignAnalyticsService.getSummaryStats();
      const schedulerStats = campaignSchedulerService.getStats();

      return NextResponse.json({
        success: true,
        data: {
          analytics: stats,
          scheduler: schedulerStats,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get scheduled campaigns
    if (action === "scheduled") {
      const schedules = campaignSchedulerService.getSchedules(true);

      return NextResponse.json({
        success: true,
        data: {
          schedules,
          total: schedules.length,
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

    // Get all campaigns
    const allCampaigns = campaignAnalyticsService.getAllCampaigns();
    const stats = campaignAnalyticsService.getSummaryStats();

    return NextResponse.json({
      success: true,
      data: {
        campaigns: allCampaigns,
        statistics: stats,
      },
      meta: {
        total: allCampaigns.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching campaigns:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CAMPAIGNS_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch campaigns",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 POST - Execute Campaign
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, campaignType, threshold, inactiveDays, hoursThreshold } =
      body;

    // Execute specific campaign type
    if (action === "execute") {
      let execution;

      switch (campaignType as CampaignType) {
        case "CHURN_PREVENTION":
          execution =
            await campaignAutomationService.executeChurnPreventionCampaign(
              threshold || 0.7,
            );
          break;

        case "WIN_BACK":
          execution = await campaignAutomationService.executeWinBackCampaign(
            inactiveDays || 30,
          );
          break;

        case "ABANDONED_CART":
          execution =
            await campaignAutomationService.executeAbandonedCartCampaign(
              hoursThreshold || 24,
            );
          break;

        case "SEASONAL_ALERT":
          execution =
            await campaignAutomationService.executeSeasonalAlertCampaign();
          break;

        case "CROSS_SELL":
          execution =
            await campaignAutomationService.executeCrossSellCampaign();
          break;

        default:
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "INVALID_CAMPAIGN_TYPE",
                message: `Unknown campaign type: ${campaignType}`,
                timestamp: new Date().toISOString(),
              },
            },
            { status: 400 },
          );
      }

      // Track campaign execution
      if (execution) {
        campaignAnalyticsService.trackCampaign(
          execution.id,
          campaignType,
          execution.metrics,
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          execution,
          message: `${campaignType} campaign executed successfully`,
        },
        meta: {
          executedAt: new Date().toISOString(),
        },
      });
    }

    // Schedule campaign
    if (action === "schedule") {
      const { scheduleType, startDate, recurrence, metadata } = body;

      if (!campaignType || !scheduleType || !startDate) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MISSING_REQUIRED_FIELDS",
              message: "campaignType, scheduleType, and startDate are required",
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 },
        );
      }

      const scheduleId = campaignSchedulerService.scheduleCampaign({
        campaignType,
        scheduleType,
        startDate: new Date(startDate),
        recurrence,
        metadata,
      });

      return NextResponse.json({
        success: true,
        data: {
          scheduleId,
          message: "Campaign scheduled successfully",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Start scheduler
    if (action === "start-scheduler") {
      campaignSchedulerService.start();

      return NextResponse.json({
        success: true,
        data: {
          message: "Campaign scheduler started",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Stop scheduler
    if (action === "stop-scheduler") {
      campaignSchedulerService.stop();

      return NextResponse.json({
        success: true,
        data: {
          message: "Campaign scheduler stopped",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message:
            "Invalid action. Use 'execute', 'schedule', 'start-scheduler', or 'stop-scheduler'",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("❌ Error executing campaign:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CAMPAIGN_EXECUTION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to execute campaign",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
