/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔍 CAMPAIGN MONITORING API - AUTOMATED TRIGGER TRACKING         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Phase 5: Advanced Features - Campaign Automation                ║
 * ║  Purpose: Monitor and trigger automated campaigns                ║
 * ║  Routes:                                                         ║
 * ║    GET    /api/campaigns/monitoring - Get monitoring status     ║
 * ║    POST   /api/campaigns/monitoring - Trigger monitoring tasks  ║
 * ║  Version: 1.0.0                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { createLogger } from "@/lib/logger";
import { campaignAutomationService } from "@/lib/services/campaigns/campaign-automation.service";
import { triggerEngineService } from "@/lib/services/campaigns/trigger-engine.service";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("campaigns-monitoring-api");

// ═══════════════════════════════════════════════════════════════════
// 📊 GET - Monitoring Status
// ═══════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    logger.debug("Campaign monitoring status requested", { action, userId });

    // Get trigger rules
    if (action === "rules") {
      const rules = triggerEngineService.getTriggerRules();

      logger.info("Trigger rules fetched", {
        total: rules.length,
        active: rules.filter((r) => r.active).length,
      });

      return NextResponse.json({
        success: true,
        data: {
          rules,
          total: rules.length,
          active: rules.filter((r) => r.active).length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get trigger statistics
    if (action === "stats") {
      const stats = triggerEngineService.getTriggerStats();

      logger.info("Trigger stats fetched");

      return NextResponse.json({
        success: true,
        data: {
          stats,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get user execution history
    if (action === "user-history" && userId) {
      const history = triggerEngineService.getUserExecutionHistory(userId);

      logger.info("User execution history fetched", {
        userId,
        historyCount: history.length,
      });

      return NextResponse.json({
        success: true,
        data: {
          userId,
          history,
          total: history.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get churn risk users
    if (action === "churn-risk") {
      const threshold = parseFloat(searchParams.get("threshold") || "0.7");
      const churnRiskUsers =
        await campaignAutomationService.identifyChurnRiskUsers(threshold);

      logger.info("Churn risk users identified", {
        count: churnRiskUsers.length,
        threshold,
      });

      return NextResponse.json({
        success: true,
        data: {
          users: churnRiskUsers,
          count: churnRiskUsers.length,
          threshold,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get abandoned carts
    if (action === "abandoned-carts") {
      const hoursThreshold = parseInt(
        searchParams.get("hoursThreshold") || "24",
      );
      const abandonedCarts =
        await campaignAutomationService.identifyAbandonedCarts(hoursThreshold);

      logger.info("Abandoned carts identified", {
        count: abandonedCarts.length,
        hoursThreshold,
      });

      return NextResponse.json({
        success: true,
        data: {
          carts: abandonedCarts,
          count: abandonedCarts.length,
          hoursThreshold,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get inactive users
    if (action === "inactive-users") {
      const inactiveDays = parseInt(searchParams.get("inactiveDays") || "30");
      const inactiveUsers =
        await campaignAutomationService.identifyInactiveUsers(inactiveDays);

      logger.info("Inactive users identified", {
        count: inactiveUsers.length,
        inactiveDays,
      });

      return NextResponse.json({
        success: true,
        data: {
          users: inactiveUsers,
          count: inactiveUsers.length,
          inactiveDays,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Default: Return monitoring overview
    const stats = triggerEngineService.getTriggerStats();
    const rules = triggerEngineService.getTriggerRules(true);

    logger.info("Monitoring overview fetched", {
      activeRules: rules.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        stats,
        activeRules: rules.length,
        monitoring: {
          enabled: true,
          lastCheck: stats.lastTrigger,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching monitoring status", error as Error, {
      endpoint: "GET /api/campaigns/monitoring",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MONITORING_FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch monitoring status",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 POST - Trigger Monitoring Tasks
// ═══════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ruleId, updates } = body;

    logger.debug("Monitoring task requested", { action, ruleId });

    // Run all monitoring tasks
    if (action === "run-all") {
      await triggerEngineService.runAllMonitoring();

      logger.info("All monitoring tasks executed successfully");

      return NextResponse.json({
        success: true,
        data: {
          message: "All monitoring tasks executed successfully",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Monitor churn risk
    if (action === "monitor-churn") {
      await triggerEngineService.monitorChurnRisk();

      logger.info("Churn risk monitoring completed");

      return NextResponse.json({
        success: true,
        data: {
          message: "Churn risk monitoring completed",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Monitor abandoned carts
    if (action === "monitor-carts") {
      await triggerEngineService.monitorAbandonedCarts();

      logger.info("Abandoned cart monitoring completed");

      return NextResponse.json({
        success: true,
        data: {
          message: "Abandoned cart monitoring completed",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Monitor inactive users
    if (action === "monitor-inactive") {
      await triggerEngineService.monitorInactiveUsers();

      logger.info("Inactive user monitoring completed");

      return NextResponse.json({
        success: true,
        data: {
          message: "Inactive user monitoring completed",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Monitor seasonal changes
    if (action === "monitor-seasonal") {
      await triggerEngineService.monitorSeasonalChanges();

      logger.info("Seasonal monitoring completed");

      return NextResponse.json({
        success: true,
        data: {
          message: "Seasonal monitoring completed",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Update trigger rule
    if (action === "update-rule" && ruleId && updates) {
      const success = triggerEngineService.updateTriggerRule(ruleId, updates);

      if (!success) {
        logger.warn("Trigger rule not found", { ruleId });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RULE_NOT_FOUND",
              message: `Trigger rule ${ruleId} not found`,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 },
        );
      }

      logger.info("Trigger rule updated successfully", { ruleId });

      return NextResponse.json({
        success: true,
        data: {
          message: "Trigger rule updated successfully",
          ruleId,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Clear execution history
    if (action === "clear-history") {
      triggerEngineService.clearExecutionHistory();

      logger.info("Execution history cleared");

      return NextResponse.json({
        success: true,
        data: {
          message: "Execution history cleared",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    logger.warn("Invalid monitoring action requested", { action });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message:
            "Invalid action. Use 'run-all', 'monitor-churn', 'monitor-carts', 'monitor-inactive', 'monitor-seasonal', 'update-rule', or 'clear-history'",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 },
    );
  } catch (error) {
    logger.error("Error executing monitoring task", error as Error, {
      endpoint: "POST /api/campaigns/monitoring",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MONITORING_EXECUTION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to execute monitoring task",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
