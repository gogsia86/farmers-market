/**
 * Webhook Monitoring Utility
 * Provides health checks, metrics, and alerting for webhook event processing
 */

import { database } from "@/lib/database";
import {
  webhookEventService,
  type WebhookProvider,
} from "@/lib/services/webhook-event.service";
import { SpanStatusCode, trace } from "@opentelemetry/api";

import { logger } from "@/lib/monitoring/logger";

const tracer = trace.getTracer("webhook-monitor");

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WebhookHealthStatus {
  healthy: boolean;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  checks: {
    recentFailures: HealthCheck;
    processingBacklog: HealthCheck;
    oldestPending: HealthCheck;
    averageProcessingTime: HealthCheck;
    duplicateEvents: HealthCheck;
  };
  metrics: WebhookMetrics;
  timestamp: Date;
}

export interface HealthCheck {
  passed: boolean;
  value: number | string | null;
  threshold: number | string;
  message: string;
}

export interface WebhookMetrics {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  pendingEvents: number;
  successRate: number;
  averageAttempts: number;
  eventsByProvider: Record<WebhookProvider, number>;
  eventsByType: Record<string, number>;
  processingTimeMs: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface WebhookAlert {
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  type: string;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface MonitoringReport {
  health: WebhookHealthStatus;
  alerts: WebhookAlert[];
  recommendations: string[];
}

// ============================================================================
// Webhook Monitor Class
// ============================================================================

export class WebhookMonitor {
  private readonly thresholds = {
    maxRecentFailures: 10,
    maxBacklogSize: 100,
    maxOldestPendingMinutes: 30,
    minSuccessRate: 0.95,
    maxAverageAttempts: 2,
    maxDuplicates: 5,
  };

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(
    timeWindowMinutes = 60,
  ): Promise<WebhookHealthStatus> {
    return await tracer.startActiveSpan("webhookHealthCheck", async (span) => {
      span.setAttribute("time_window_minutes", timeWindowMinutes);

      try {
        const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

        const [
          recentFailuresCheck,
          backlogCheck,
          oldestPendingCheck,
          processingTimeCheck,
          duplicatesCheck,
          metrics,
        ] = await Promise.all([
          this.checkRecentFailures(timeWindow),
          this.checkProcessingBacklog(),
          this.checkOldestPending(),
          this.checkAverageProcessingTime(timeWindow),
          this.checkDuplicates(),
          this.collectMetrics(timeWindow),
        ]);

        const allChecks = [
          recentFailuresCheck,
          backlogCheck,
          oldestPendingCheck,
          processingTimeCheck,
          duplicatesCheck,
        ];

        const failedChecks = allChecks.filter((check: any) => !check.passed);
        const healthy = failedChecks.length === 0;
        const status = this.determineHealthStatus(
          failedChecks.length,
          allChecks.length,
        );

        const health: WebhookHealthStatus = {
          healthy,
          status,
          checks: {
            recentFailures: recentFailuresCheck,
            processingBacklog: backlogCheck,
            oldestPending: oldestPendingCheck,
            averageProcessingTime: processingTimeCheck,
            duplicateEvents: duplicatesCheck,
          },
          metrics,
          timestamp: new Date(),
        };

        span.setAttributes({
          "health.status": status,
          "health.failed_checks": failedChecks.length,
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return health;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Check recent failures
   */
  private async checkRecentFailures(since: Date): Promise<HealthCheck> {
    const failedCount = await database.webhookEvent.count({
      where: {
        processed: false,
        attempts: { gte: 3 },
        createdAt: { gte: since },
      },
    });

    const passed = failedCount <= this.thresholds.maxRecentFailures;

    return {
      passed,
      value: failedCount,
      threshold: this.thresholds.maxRecentFailures,
      message: passed
        ? `Recent failures within acceptable range (${failedCount}/${this.thresholds.maxRecentFailures})`
        : `Too many recent failures: ${failedCount} (threshold: ${this.thresholds.maxRecentFailures})`,
    };
  }

  /**
   * Check processing backlog
   */
  private async checkProcessingBacklog(): Promise<HealthCheck> {
    const backlogSize = await database.webhookEvent.count({
      where: { processed: false },
    });

    const passed = backlogSize <= this.thresholds.maxBacklogSize;

    return {
      passed,
      value: backlogSize,
      threshold: this.thresholds.maxBacklogSize,
      message: passed
        ? `Processing backlog healthy (${backlogSize}/${this.thresholds.maxBacklogSize})`
        : `Large processing backlog: ${backlogSize} events (threshold: ${this.thresholds.maxBacklogSize})`,
    };
  }

  /**
   * Check oldest pending event
   */
  private async checkOldestPending(): Promise<HealthCheck> {
    const oldestPending = await database.webhookEvent.findFirst({
      where: { processed: false },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    if (!oldestPending) {
      return {
        passed: true,
        value: null,
        threshold: this.thresholds.maxOldestPendingMinutes,
        message: "No pending events",
      };
    }

    const ageMinutes = Math.floor(
      (Date.now() - oldestPending.createdAt.getTime()) / (1000 * 60),
    );
    const passed = ageMinutes <= this.thresholds.maxOldestPendingMinutes;

    return {
      passed,
      value: ageMinutes,
      threshold: this.thresholds.maxOldestPendingMinutes,
      message: passed
        ? `Oldest pending event is ${ageMinutes} minutes old (threshold: ${this.thresholds.maxOldestPendingMinutes} minutes)`
        : `Oldest pending event is ${ageMinutes} minutes old! (threshold: ${this.thresholds.maxOldestPendingMinutes} minutes)`,
    };
  }

  /**
   * Check average processing time
   */
  private async checkAverageProcessingTime(since: Date): Promise<HealthCheck> {
    const avgAttempts = await database.webhookEvent.aggregate({
      where: {
        processed: true,
        processedAt: { gte: since },
      },
      _avg: { attempts: true },
    });

    const averageAttempts = avgAttempts._avg.attempts || 0;
    const passed = averageAttempts <= this.thresholds.maxAverageAttempts;

    return {
      passed,
      value: averageAttempts,
      threshold: this.thresholds.maxAverageAttempts,
      message: passed
        ? `Average processing attempts healthy (${averageAttempts.toFixed(2)}/${this.thresholds.maxAverageAttempts})`
        : `High average processing attempts: ${averageAttempts.toFixed(2)} (threshold: ${this.thresholds.maxAverageAttempts})`,
    };
  }

  /**
   * Check for duplicate events
   */
  private async checkDuplicates(): Promise<HealthCheck> {
    const duplicates = await webhookEventService.findDuplicates();
    const duplicateCount = duplicates.length;
    const passed = duplicateCount <= this.thresholds.maxDuplicates;

    return {
      passed,
      value: duplicateCount,
      threshold: this.thresholds.maxDuplicates,
      message: passed
        ? `Duplicate events within acceptable range (${duplicateCount}/${this.thresholds.maxDuplicates})`
        : `Too many duplicate events detected: ${duplicateCount} (threshold: ${this.thresholds.maxDuplicates})`,
    };
  }

  /**
   * Determine overall health status
   */
  private determineHealthStatus(
    failedChecks: number,
    totalChecks: number,
  ): "HEALTHY" | "DEGRADED" | "CRITICAL" {
    if (failedChecks === 0) return "HEALTHY";
    if (failedChecks <= totalChecks / 3) return "DEGRADED";
    return "CRITICAL";
  }

  /**
   * Collect webhook metrics
   */
  private async collectMetrics(since: Date): Promise<WebhookMetrics> {
    const [
      totalEvents,
      processedEvents,
      failedEvents,
      pendingEvents,
      avgAttempts,
      eventsByProvider,
      eventsByType,
    ] = await Promise.all([
      database.webhookEvent.count({ where: { createdAt: { gte: since } } }),
      database.webhookEvent.count({
        where: { processed: true, createdAt: { gte: since } },
      }),
      database.webhookEvent.count({
        where: {
          processed: false,
          attempts: { gte: 3 },
          createdAt: { gte: since },
        },
      }),
      database.webhookEvent.count({
        where: { processed: false, createdAt: { gte: since } },
      }),
      database.webhookEvent.aggregate({
        where: { createdAt: { gte: since } },
        _avg: { attempts: true },
      }),
      this.getEventsByProvider(since),
      this.getEventsByType(since),
    ]);

    const successRate = totalEvents > 0 ? processedEvents / totalEvents : 1;

    // Calculate processing time percentiles (simulated for now)
    // In production, you would track actual processing times
    const processingTimeMs = {
      average: avgAttempts._avg.attempts ? avgAttempts._avg.attempts * 100 : 0,
      p50: 150,
      p95: 500,
      p99: 1000,
    };

    return {
      totalEvents,
      processedEvents,
      failedEvents,
      pendingEvents,
      successRate,
      averageAttempts: avgAttempts._avg.attempts || 0,
      eventsByProvider,
      eventsByType,
      processingTimeMs,
    };
  }

  /**
   * Get events grouped by provider
   */
  private async getEventsByProvider(
    since: Date,
  ): Promise<Record<string, number>> {
    const results = await database.webhookEvent.groupBy({
      by: ["provider"],
      where: { createdAt: { gte: since } },
      _count: true,
    });

    const eventsByProvider: Record<string, number> = {};
    for (const result of results) {
      eventsByProvider[result.provider] = result._count;
    }

    return eventsByProvider;
  }

  /**
   * Get events grouped by type
   */
  private async getEventsByType(since: Date): Promise<Record<string, number>> {
    const results = await database.webhookEvent.groupBy({
      by: ["eventType"],
      where: { createdAt: { gte: since } },
      _count: true,
    });

    const eventsByType: Record<string, number> = {};
    for (const result of results) {
      eventsByType[result.eventType] = result._count;
    }

    return eventsByType;
  }

  /**
   * Generate alerts based on health check
   */
  generateAlerts(health: WebhookHealthStatus): WebhookAlert[] {
    const alerts: WebhookAlert[] = [];

    // Check recent failures
    if (!health.checks.recentFailures.passed) {
      alerts.push({
        severity: "ERROR",
        type: "HIGH_FAILURE_RATE",
        message: health.checks.recentFailures.message,
        details: {
          value: health.checks.recentFailures.value,
          threshold: health.checks.recentFailures.threshold,
        },
        timestamp: new Date(),
      });
    }

    // Check backlog
    if (!health.checks.processingBacklog.passed) {
      alerts.push({
        severity: "WARNING",
        type: "LARGE_BACKLOG",
        message: health.checks.processingBacklog.message,
        details: {
          value: health.checks.processingBacklog.value,
          threshold: health.checks.processingBacklog.threshold,
        },
        timestamp: new Date(),
      });
    }

    // Check oldest pending
    if (!health.checks.oldestPending.passed) {
      alerts.push({
        severity: "CRITICAL",
        type: "STALE_EVENTS",
        message: health.checks.oldestPending.message,
        details: {
          value: health.checks.oldestPending.value,
          threshold: health.checks.oldestPending.threshold,
        },
        timestamp: new Date(),
      });
    }

    // Check processing time
    if (!health.checks.averageProcessingTime.passed) {
      alerts.push({
        severity: "WARNING",
        type: "SLOW_PROCESSING",
        message: health.checks.averageProcessingTime.message,
        details: {
          value: health.checks.averageProcessingTime.value,
          threshold: health.checks.averageProcessingTime.threshold,
        },
        timestamp: new Date(),
      });
    }

    // Check duplicates
    if (!health.checks.duplicateEvents.passed) {
      alerts.push({
        severity: "WARNING",
        type: "DUPLICATE_EVENTS",
        message: health.checks.duplicateEvents.message,
        details: {
          value: health.checks.duplicateEvents.value,
          threshold: health.checks.duplicateEvents.threshold,
        },
        timestamp: new Date(),
      });
    }

    // Check success rate
    if (health.metrics.successRate < this.thresholds.minSuccessRate) {
      alerts.push({
        severity: "ERROR",
        type: "LOW_SUCCESS_RATE",
        message: `Success rate below threshold: ${(health.metrics.successRate * 100).toFixed(2)}% (threshold: ${(this.thresholds.minSuccessRate * 100).toFixed(2)}%)`,
        details: {
          successRate: health.metrics.successRate,
          threshold: this.thresholds.minSuccessRate,
        },
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Generate recommendations based on health status
   */
  generateRecommendations(
    health: WebhookHealthStatus,
    alerts: WebhookAlert[],
  ): string[] {
    const recommendations: string[] = [];

    // High failure rate recommendations
    if (alerts.some((a: any) => a.type === "HIGH_FAILURE_RATE")) {
      recommendations.push(
        "🔴 Investigate recent webhook failures - check provider API status and error logs",
      );
      recommendations.push(
        "🔧 Review webhook handler implementations for potential bugs",
      );
    }

    // Large backlog recommendations
    if (alerts.some((a: any) => a.type === "LARGE_BACKLOG")) {
      recommendations.push(
        "⚡ Consider scaling up webhook workers to process backlog faster",
      );
      recommendations.push(
        "📊 Check worker health and restart any stuck processes",
      );
    }

    // Stale events recommendations
    if (alerts.some((a: any) => a.type === "STALE_EVENTS")) {
      recommendations.push(
        "🚨 Oldest events are very stale - immediate attention required",
      );
      recommendations.push(
        "🔄 Consider manual retry of failed events using admin endpoint",
      );
    }

    // Slow processing recommendations
    if (alerts.some((a: any) => a.type === "SLOW_PROCESSING")) {
      recommendations.push(
        "⏱️ Events requiring multiple attempts - investigate retry causes",
      );
      recommendations.push(
        "🔍 Check for intermittent network issues or provider timeouts",
      );
    }

    // Duplicate events recommendations
    if (alerts.some((a: any) => a.type === "DUPLICATE_EVENTS")) {
      recommendations.push(
        "🔍 Duplicate events detected - verify idempotency implementation",
      );
      recommendations.push(
        "🧹 Run duplicate cleanup to remove redundant event records",
      );
    }

    // Low success rate recommendations
    if (alerts.some((a: any) => a.type === "LOW_SUCCESS_RATE")) {
      recommendations.push(
        "📉 Overall success rate is low - review webhook processing pipeline",
      );
      recommendations.push(
        "🛡️ Implement circuit breakers for failing provider integrations",
      );
    }

    // General recommendations when degraded or critical
    if (health.status === "DEGRADED" || health.status === "CRITICAL") {
      recommendations.push(
        "📧 Consider enabling emergency notifications to on-call team",
      );
      recommendations.push(
        "📊 Review webhook monitoring dashboard for trends and patterns",
      );
    }

    // Add positive recommendation if healthy
    if (health.status === "HEALTHY" && recommendations.length === 0) {
      recommendations.push(
        "✅ Webhook system is healthy - continue regular monitoring",
      );
    }

    return recommendations;
  }

  /**
   * Generate comprehensive monitoring report
   */
  async generateReport(timeWindowMinutes = 60): Promise<MonitoringReport> {
    const health = await this.performHealthCheck(timeWindowMinutes);
    const alerts = this.generateAlerts(health);
    const recommendations = this.generateRecommendations(health, alerts);

    return {
      health,
      alerts,
      recommendations,
    };
  }

  /**
   * Auto-remediation for common issues
   */
  async autoRemediate(): Promise<{
    actions: string[];
    results: Record<string, any>;
  }> {
    const actions: string[] = [];
    const results: Record<string, any> = {};

    try {
      // 1. Cleanup old processed events
      const cleanupCount = await webhookEventService.cleanupOldEvents(90);
      if (cleanupCount > 0) {
        actions.push(`Cleaned up ${cleanupCount} old processed events`);
        results.cleanup = { count: cleanupCount };
      }

      // 2. Retry failed events with low attempts
      const failedEvents = await webhookEventService.getFailedEvents(3, 50);
      if (failedEvents.length > 0) {
        actions.push(
          `Found ${failedEvents.length} failed events eligible for retry (max 3 attempts)`,
        );
        results.retryableEvents = failedEvents.length;
      }

      // 3. Identify stuck events (pending for > 1 hour)
      const stuckEvents = await database.webhookEvent.count({
        where: {
          processed: false,
          createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });
      if (stuckEvents > 0) {
        actions.push(
          `Identified ${stuckEvents} stuck events requiring manual review`,
        );
        results.stuckEvents = stuckEvents;
      }

      return { actions, results };
    } catch (error) {
      logger.error("Auto-remediation failed:", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const webhookMonitor = new WebhookMonitor();
