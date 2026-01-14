/**
 * ============================================================================
 * DATABASE STORAGE SERVICE - Updated for Prisma Schema Mapping Fix
 * Farmers Market Platform - Workflow Monitoring System
 * ============================================================================
 *
 * Purpose: Persist monitoring data using Prisma ORM with correct field mappings
 * Version: 2.0 - Post Schema Fix
 * Status: ✅ Production Ready
 *
 * Changes in v2.0:
 * - Updated all field names to match fixed Prisma schema
 * - Uses camelCase for Prisma (maps to snake_case in DB)
 * - Removed raw SQL workarounds
 * - Full type safety with Prisma Client
 *
 * ============================================================================
 */

import { database } from "../../database";

import { logger } from "@/lib/monitoring/logger";

import type {
  MonitoringReport as PrismaMonitoringReport,
  WorkflowExecution as PrismaWorkflowExecution,
  WorkflowSchedule as PrismaWorkflowSchedule,
} from "@prisma/client";
import type {
  HealthCheckResult,
  MonitoringReport,
  Notification,
  WorkflowResult,
} from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface StorageStats {
  totalReports: number;
  totalExecutions: number;
  totalMetrics: number;
  totalHealthChecks: number;
  totalNotifications: number;
  oldestRecord?: Date;
  newestRecord?: Date;
}

interface QueryOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  workflowName?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// DATABASE STORAGE SERVICE
// ============================================================================

class DatabaseStorageService {
  /**
   * Save a monitoring report to the database
   */
  async saveReport(report: MonitoringReport): Promise<void> {
    try {
      await database.monitoringReport.create({
        data: {
          reportId: report.reportId,
          startTime: report.period.start,
          endTime: report.period.end,
          totalRuns: report.summary.totalWorkflows,
          successfulRuns: report.summary.passedWorkflows,
          failedRuns: report.summary.failedWorkflows,
          totalDurationMs: Math.round(
            report.summary.averageDuration * report.summary.totalWorkflows,
          ),
          avgDurationMs: report.summary.averageDuration,
          successRate: report.summary.successRate,
          status: "COMPLETED",
          reportType: "PERIODIC",
          generatedAt: report.timestamp,
          notified: false,
          metadata: {
            warningWorkflows: report.summary.warningWorkflows,
            skippedWorkflows: report.summary.skippedWorkflows,
            criticalIssues: report.summary.criticalIssues,
            trends: report.trends,
            recommendations: report.recommendations,
            agricultureInsights: report.agricultureInsights,
          },
        },
      });

      logger.info(`✅ Report ${report.reportId} saved to database`);
    } catch (error) {
      logger.error(`❌ Failed to save report ${report.reportId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Save a workflow execution result
   */
  async saveWorkflowExecution(
    result: WorkflowResult,
    reportId?: string,
  ): Promise<void> {
    try {
      const execution = await database.workflowExecution.create({
        data: {
          runId: result.runId,
          workflowName: result.workflowId,
          status: result.status,
          startedAt: result.startTime,
          completedAt: result.endTime,
          durationMs: result.duration,
          testsPassed: result.steps.filter((s: any) => s.success).length,
          testsFailed: result.steps.filter((s: any) => !s.success).length,
          testsTotal: result.steps.length,
          errorMessage: result.error ? String(result.error) : null,
          errorStack:
            typeof result.error === "object" &&
            result.error !== null &&
            "stack" in result.error
              ? (result.error as Error).stack
              : null,
          triggeredBy: "SCHEDULED",
          environment: process.env.NODE_ENV || "production",
          metadata: JSON.parse(
            JSON.stringify({
              name: result.name,
              type: result.type,
              priority: result.priority,
              metrics: result.metrics,
              screenshots: result.screenshots,
              traces: result.traces,
              tags: result.tags,
              agricultureConsciousness: result.agricultureConsciousness,
            }),
          ),
          reportId: reportId || null,
        },
      });

      logger.info(`✅ Execution ${result.runId} saved to database`);

      // Save associated metrics
      if (result.metrics && Object.keys(result.metrics).length > 0) {
        await this.saveWorkflowMetricsFromResult(result, execution.runId);
      }
    } catch (error) {
      logger.error(`❌ Failed to save execution ${result.runId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Save workflow metrics from execution result
   */
  private async saveWorkflowMetricsFromResult(
    result: WorkflowResult,
    executionRunId: string,
  ): Promise<void> {
    const metricsToSave: any[] = [];

    // Extract metrics from result
    if (result.metrics) {
      for (const [key, value] of Object.entries(result.metrics)) {
        if (typeof value === "number") {
          metricsToSave.push({
            workflowId: result.workflowId,
            metricName: key,
            metricValue: value,
            metricUnit: this.inferMetricUnit(key),
            recordedAt: new Date(),
            executionId: executionRunId,
            metadata: {
              source: "workflow_execution",
            },
          });
        }
      }
    }

    // Add duration as metric
    metricsToSave.push({
      workflowId: result.workflowId,
      metricName: "duration",
      metricValue: result.duration,
      metricUnit: "ms",
      thresholdValue: 30000, // 30 seconds threshold
      isWithinThreshold: result.duration < 30000,
      recordedAt: new Date(),
      executionId: executionRunId,
      metadata: {
        source: "workflow_execution",
      },
    });

    if (metricsToSave.length > 0) {
      await database.workflowMetrics.createMany({
        data: metricsToSave,
      });
    }
  }

  /**
   * Infer metric unit from metric name
   */
  private inferMetricUnit(metricName: string): string {
    const name = metricName.toLowerCase();
    if (name.includes("time") || name.includes("duration")) return "ms";
    if (name.includes("memory") || name.includes("size")) return "MB";
    if (name.includes("cpu") || name.includes("usage") || name.includes("rate"))
      return "%";
    if (name.includes("count") || name.includes("total")) return "count";
    return "unit";
  }

  /**
   * Save health check result
   */
  async saveHealthCheck(
    healthCheck: HealthCheckResult,
    executionRunId?: string,
  ): Promise<void> {
    try {
      await database.systemHealthCheck.create({
        data: {
          checkId: `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          checkName: "system-health",
          status: healthCheck.healthy ? "HEALTHY" : "UNHEALTHY",
          responseTimeMs: healthCheck.responseTime,
          checkedAt: new Date(),
          details: {
            database: healthCheck.checks.database,
            api: healthCheck.checks.api,
            cache: healthCheck.checks.cache,
            externalServices: healthCheck.checks.externalServices,
            additionalDetails: healthCheck.details,
          },
          errorMessage: null,
          executionId: executionRunId || null,
        },
      });

      logger.info("✅ Health check saved to database");
    } catch (error) {
      logger.error("❌ Failed to save health check:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Log a notification
   */
  async saveNotification(notification: Notification): Promise<void> {
    try {
      await database.notificationLog.create({
        data: {
          logId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          channel: notification.channel.toUpperCase(),
          notificationType: "WORKFLOW_UPDATE",
          status: notification.sent ? "SUCCESS" : "FAILED",
          recipient: null,
          subject: notification.title,
          message: notification.message,
          sentAt: new Date(),
          deliveryStatus: "DELIVERED",
          retryCount: 0,
          metadata: {
            priority: notification.priority,
            workflowId: (notification as any).workflowId,
            reportId: (notification as any).reportId,
          },
        },
      });

      logger.info("✅ Notification logged to database");
    } catch (error) {
      logger.error("❌ Failed to log notification:", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Get monitoring reports
   */
  async getReports(options: QueryOptions = {}): Promise<MonitoringReport[]> {
    const { startDate, endDate, limit = 50, offset = 0 } = options;

    const reports = await database.monitoringReport.findMany({
      where: {
        ...(startDate && { generatedAt: { gte: startDate } }),
        ...(endDate && { generatedAt: { lte: endDate } }),
      },
      include: {
        workflowExecutions: true,
      },
      orderBy: { generatedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return reports.map((r: any) => this.mapReportFromDatabase(r));
  }

  /**
   * Get a report by ID
   */
  async getReportById(reportId: string): Promise<MonitoringReport | null> {
    const report = await database.monitoringReport.findUnique({
      where: { reportId },
      include: {
        workflowExecutions: true,
      },
    });

    if (!report) return null;
    return this.mapReportFromDatabase(report);
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(
    options: QueryOptions = {},
  ): Promise<WorkflowResult[]> {
    const {
      startDate,
      endDate,
      status,
      workflowName,
      limit = 100,
      offset = 0,
    } = options;

    const executions = await database.workflowExecution.findMany({
      where: {
        ...(startDate && { startedAt: { gte: startDate } }),
        ...(endDate && { completedAt: { lte: endDate } }),
        ...(status && { status }),
        ...(workflowName && { workflowName }),
      },
      include: {
        workflowMetrics: true,
        systemHealthChecks: true,
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
    });

    return executions.map((e: any) => this.mapExecutionFromDatabase(e));
  }

  /**
   * Get workflow metrics
   */
  async getWorkflowMetrics(
    workflowId: string,
    options: QueryOptions = {},
  ): Promise<any[]> {
    const { startDate, endDate, limit = 1000 } = options;

    const metrics = await database.workflowMetrics.findMany({
      where: {
        workflowId,
        ...(startDate && { recordedAt: { gte: startDate } }),
        ...(endDate && { recordedAt: { lte: endDate } }),
      },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });

    return metrics;
  }

  /**
   * Get health check history
   */
  async getHealthHistory(options: QueryOptions = {}): Promise<any[]> {
    const { startDate, endDate, limit = 1000 } = options;

    const healthChecks = await database.systemHealthCheck.findMany({
      where: {
        ...(startDate && { checkedAt: { gte: startDate } }),
        ...(endDate && { checkedAt: { lte: endDate } }),
      },
      orderBy: { checkedAt: "desc" },
      take: limit,
    });

    return healthChecks;
  }

  /**
   * Get notification logs
   */
  async getNotificationLogs(options: QueryOptions = {}): Promise<any[]> {
    const { startDate, endDate, limit = 1000 } = options;

    const logs = await database.notificationLog.findMany({
      where: {
        ...(startDate && { sentAt: { gte: startDate } }),
        ...(endDate && { sentAt: { lte: endDate } }),
      },
      orderBy: { sentAt: "desc" },
      take: limit,
    });

    return logs;
  }

  /**
   * Get workflow schedules
   */
  async getWorkflowSchedules(): Promise<PrismaWorkflowSchedule[]> {
    return await database.workflowSchedule.findMany({
      where: { enabled: true },
      orderBy: { nextRunAt: "asc" },
    });
  }

  /**
   * Update workflow schedule after execution
   */
  async updateWorkflowSchedule(
    scheduleId: string,
    success: boolean,
    nextRunAt: Date,
  ): Promise<void> {
    try {
      const schedule = await database.workflowSchedule.findUnique({
        where: { scheduleId },
      });

      if (!schedule) {
        logger.warn(`Schedule ${scheduleId} not found`);
        return;
      }

      await database.workflowSchedule.update({
        where: { scheduleId },
        data: {
          lastRunAt: new Date(),
          nextRunAt,
          runCount: { increment: 1 },
          ...(success
            ? { successCount: { increment: 1 } }
            : { failureCount: { increment: 1 } }),
        },
      });
    } catch (error) {
      logger.error(`Failed to update schedule ${scheduleId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    const [
      totalReports,
      totalExecutions,
      totalMetrics,
      totalHealthChecks,
      totalNotifications,
    ] = await Promise.all([
      database.monitoringReport.count(),
      database.workflowExecution.count(),
      database.workflowMetrics.count(),
      database.systemHealthCheck.count(),
      database.notificationLog.count(),
    ]);

    const oldestReport = await database.monitoringReport.findFirst({
      orderBy: { generatedAt: "asc" },
      select: { generatedAt: true },
    });

    const newestReport = await database.monitoringReport.findFirst({
      orderBy: { generatedAt: "desc" },
      select: { generatedAt: true },
    });

    return {
      totalReports,
      totalExecutions,
      totalMetrics,
      totalHealthChecks,
      totalNotifications,
      oldestRecord: oldestReport?.generatedAt,
      newestRecord: newestReport?.generatedAt,
    };
  }

  /**
   * Get success rate trend
   */
  async getSuccessRateTrend(
    days: number = 7,
  ): Promise<Array<{ date: Date; successRate: number; totalRuns: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reports = await database.monitoringReport.findMany({
      where: {
        generatedAt: { gte: startDate },
      },
      orderBy: { generatedAt: "asc" },
      select: {
        generatedAt: true,
        successRate: true,
        totalRuns: true,
      },
    });

    return reports.map((r: any) => ({
      date: r.generatedAt,
      successRate: r.successRate,
      totalRuns: r.totalRuns,
    }));
  }

  /**
   * Get workflow performance statistics
   */
  async getWorkflowPerformanceStats(workflowName: string): Promise<{
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    totalExecutions: number;
    recentFailures: number;
  }> {
    const executions = await database.workflowExecution.findMany({
      where: { workflowName },
      select: {
        durationMs: true,
        status: true,
        startedAt: true,
      },
    });

    if (executions.length === 0) {
      return {
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        totalExecutions: 0,
        recentFailures: 0,
      };
    }

    const durations = executions
      .filter((e: any) => e.durationMs !== null)
      .map((e: any) => e.durationMs!);
    const successCount = executions.filter(
      (e: any) => e.status === "SUCCESS",
    ).length;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentFailures = executions.filter(
      (e: any) => e.status === "FAILURE" && e.startedAt >= oneDayAgo,
    ).length;

    return {
      averageDuration:
        durations.length > 0
          ? durations.reduce((a: any, b: any) => a + b, 0) / durations.length
          : 0,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
      successRate: successCount / executions.length,
      totalExecutions: executions.length,
      recentFailures,
    };
  }

  /**
   * Clean up old records
   */
  async cleanupOldRecords(daysToKeep: number = 30): Promise<{
    deletedReports: number;
    deletedExecutions: number;
    deletedMetrics: number;
    deletedHealthChecks: number;
    deletedNotifications: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    logger.info(
      `🧹 Cleaning up records older than ${cutoffDate.toISOString()}`,
    );

    try {
      const [
        deletedReports,
        deletedExecutions,
        deletedMetrics,
        deletedHealthChecks,
        deletedNotifications,
      ] = await Promise.all([
        database.monitoringReport.deleteMany({
          where: { generatedAt: { lt: cutoffDate } },
        }),
        database.workflowExecution.deleteMany({
          where: { startedAt: { lt: cutoffDate } },
        }),
        database.workflowMetrics.deleteMany({
          where: { recordedAt: { lt: cutoffDate } },
        }),
        database.systemHealthCheck.deleteMany({
          where: { checkedAt: { lt: cutoffDate } },
        }),
        database.notificationLog.deleteMany({
          where: { sentAt: { lt: cutoffDate } },
        }),
      ]);

      const result = {
        deletedReports: deletedReports.count,
        deletedExecutions: deletedExecutions.count,
        deletedMetrics: deletedMetrics.count,
        deletedHealthChecks: deletedHealthChecks.count,
        deletedNotifications: deletedNotifications.count,
      };

      logger.info("✅ Cleanup complete", { dataresult: { data: result } });
      return result;
    } catch (error) {
      logger.error("❌ Cleanup failed:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE MAPPING METHODS
  // ============================================================================

  /**
   * Map database report to MonitoringReport type
   */
  private mapReportFromDatabase(
    dbReport: PrismaMonitoringReport & {
      workflowExecutions?: PrismaWorkflowExecution[];
    },
  ): MonitoringReport {
    const metadata = dbReport.metadata as any;

    return {
      reportId: dbReport.reportId,
      timestamp: dbReport.generatedAt,
      period: {
        start: dbReport.startTime,
        end: dbReport.endTime,
      },
      summary: {
        totalWorkflows: dbReport.totalRuns,
        passedWorkflows: dbReport.successfulRuns,
        failedWorkflows: dbReport.failedRuns,
        warningWorkflows: metadata?.warningWorkflows || 0,
        skippedWorkflows: metadata?.skippedWorkflows || 0,
        successRate: dbReport.successRate,
        averageDuration: dbReport.avgDurationMs,
        criticalIssues: metadata?.criticalIssues || 0,
      },
      workflows: dbReport.workflowExecutions
        ? dbReport.workflowExecutions.map((e: any) =>
            this.mapExecutionFromDatabase(e),
          )
        : [],
      trends: metadata?.trends || {
        successRateTrend: 0,
        performanceTrend: 0,
        errorRateTrend: 0,
      },
      recommendations: metadata?.recommendations || [],
      agricultureInsights: metadata?.agricultureInsights,
    };
  }

  /**
   * Map database execution to WorkflowResult type
   */
  private mapExecutionFromDatabase(
    dbExecution: PrismaWorkflowExecution,
  ): WorkflowResult {
    const metadata = dbExecution.metadata as any;

    return {
      workflowId: dbExecution.workflowName,
      runId: dbExecution.runId,
      name: metadata?.name || dbExecution.workflowName,
      type: metadata?.type || "e2e",
      priority: metadata?.priority || "medium",
      status: dbExecution.status as any,
      startTime: dbExecution.startedAt,
      endTime: dbExecution.completedAt || new Date(),
      duration: dbExecution.durationMs || 0,
      steps: [], // Steps array not stored, would need separate table
      totalSteps: dbExecution.testsTotal,
      passedSteps: dbExecution.testsPassed,
      failedSteps: dbExecution.testsFailed,
      skippedSteps:
        dbExecution.testsTotal -
        dbExecution.testsPassed -
        dbExecution.testsFailed,
      error: dbExecution.errorMessage || undefined,
      screenshots: metadata?.screenshots || [],
      traces: metadata?.traces || [],
      metrics: metadata?.metrics || {},
      agricultureConsciousness: metadata?.agricultureConsciousness,
      tags: metadata?.tags || [],
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new database storage instance
 */
function createDatabaseStorage(): DatabaseStorageService {
  return new DatabaseStorageService();
}

/**
 * Singleton instance
 */
let storageInstance: DatabaseStorageService | null = null;

/**
 * Get the singleton database storage instance
 */
function getDatabaseStorage(): DatabaseStorageService {
  if (!storageInstance) {
    storageInstance = createDatabaseStorage();
  }
  return storageInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { createDatabaseStorage, DatabaseStorageService, getDatabaseStorage };
export type { QueryOptions, StorageStats };
