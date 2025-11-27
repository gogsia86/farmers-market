// src/lib/monitoring/alerts/alert-rules-engine.ts
/**
 * 🚨 Alert Rules Engine with Quantum Consciousness
 *
 * Implements intelligent alerting with:
 * - Configurable thresholds and conditions
 * - Alert cooldowns and deduplication
 * - Escalation policies
 * - Severity levels
 * - Agricultural consciousness
 *
 * @version 2.0.0
 * @divine-pattern ALERT_CONSCIOUSNESS
 */

import { trace, SpanStatusCode } from "@opentelemetry/api";
import type { WorkflowResult, MonitoringReport } from "../types";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AlertSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type AlertState = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "SUPPRESSED";
export type AlertChannel = "SLACK" | "DISCORD" | "EMAIL" | "WEBHOOK" | "SMS";

export interface AlertCondition {
  type: "THRESHOLD" | "RATE" | "PATTERN" | "DURATION" | "CUSTOM";
  metric: string;
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=" | "CONTAINS";
  value: number | string | boolean;
  duration?: number; // For duration-based conditions (ms)
  window?: number; // For rate-based conditions (ms)
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: AlertSeverity;
  conditions: AlertCondition[];
  conditionLogic: "AND" | "OR"; // How to combine multiple conditions
  channels: AlertChannel[];
  cooldownMs: number; // Minimum time between alerts
  escalationDelayMs?: number; // Time before escalating
  escalationRule?: string; // ID of rule to escalate to
  tags: string[];
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  state: AlertState;
  message: string;
  details: Record<string, any>;
  firstTriggeredAt: Date;
  lastTriggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  escalatedAt?: Date;
  occurrences: number;
  channels: AlertChannel[];
  tags: string[];
}

export interface AlertRuleConfig {
  enableDeduplication: boolean;
  defaultCooldownMs: number;
  maxActiveAlerts: number;
  autoResolveAfterMs?: number;
  enableEscalation: boolean;
}

export interface EvaluationContext {
  workflowResult?: WorkflowResult;
  report?: MonitoringReport;
  metrics?: Record<string, number>;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

export interface AlertEvaluationResult {
  triggered: boolean;
  rule: AlertRule;
  reason?: string;
  metConditions: string[];
  failedConditions: string[];
  shouldEscalate: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_ALERT_CONFIG: AlertRuleConfig = {
  enableDeduplication: true,
  defaultCooldownMs: 300000, // 5 minutes
  maxActiveAlerts: 100,
  autoResolveAfterMs: 3600000, // 1 hour
  enableEscalation: true,
};

// ============================================================================
// Predefined Alert Rules
// ============================================================================

export const PREDEFINED_RULES: AlertRule[] = [
  {
    id: "workflow-failure-critical",
    name: "Critical Workflow Failure",
    description: "Alert when a critical workflow fails",
    enabled: true,
    severity: "CRITICAL",
    conditions: [
      {
        type: "THRESHOLD",
        metric: "workflow.status",
        operator: "==",
        value: "failed",
      },
      {
        type: "THRESHOLD",
        metric: "workflow.priority",
        operator: "==",
        value: "critical",
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK", "EMAIL"],
    cooldownMs: 300000, // 5 minutes
    escalationDelayMs: 900000, // 15 minutes
    tags: ["workflow", "critical"],
  },
  {
    id: "high-failure-rate",
    name: "High Failure Rate",
    description: "Alert when failure rate exceeds threshold",
    enabled: true,
    severity: "ERROR",
    conditions: [
      {
        type: "THRESHOLD",
        metric: "report.failureRate",
        operator: ">",
        value: 0.5, // 50%
      },
      {
        type: "THRESHOLD",
        metric: "report.totalRuns",
        operator: ">=",
        value: 3, // At least 3 runs
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK"],
    cooldownMs: 600000, // 10 minutes
    tags: ["failure-rate", "performance"],
  },
  {
    id: "slow-response-time",
    name: "Slow Response Time",
    description: "Alert when workflow duration exceeds threshold",
    enabled: true,
    severity: "WARNING",
    conditions: [
      {
        type: "THRESHOLD",
        metric: "workflow.duration",
        operator: ">",
        value: 30000, // 30 seconds
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK"],
    cooldownMs: 900000, // 15 minutes
    tags: ["performance", "latency"],
  },
  {
    id: "consecutive-failures",
    name: "Consecutive Failures",
    description: "Alert when multiple workflows fail in a row",
    enabled: true,
    severity: "ERROR",
    conditions: [
      {
        type: "RATE",
        metric: "workflow.consecutiveFailures",
        operator: ">=",
        value: 3,
        window: 1800000, // 30 minutes
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK", "EMAIL"],
    cooldownMs: 600000, // 10 minutes
    escalationDelayMs: 1800000, // 30 minutes
    tags: ["failure", "reliability"],
  },
  {
    id: "health-check-failure",
    name: "Health Check Failure",
    description: "Alert when system health check fails",
    enabled: true,
    severity: "CRITICAL",
    conditions: [
      {
        type: "THRESHOLD",
        metric: "health.status",
        operator: "==",
        value: "unhealthy",
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK", "EMAIL", "SMS"],
    cooldownMs: 180000, // 3 minutes
    escalationDelayMs: 600000, // 10 minutes
    tags: ["health", "system"],
  },
  {
    id: "low-success-rate",
    name: "Low Success Rate",
    description: "Alert when overall success rate drops below threshold",
    enabled: true,
    severity: "WARNING",
    conditions: [
      {
        type: "THRESHOLD",
        metric: "report.successRate",
        operator: "<",
        value: 0.8, // 80%
      },
      {
        type: "THRESHOLD",
        metric: "report.totalRuns",
        operator: ">=",
        value: 5,
      },
    ],
    conditionLogic: "AND",
    channels: ["SLACK"],
    cooldownMs: 1800000, // 30 minutes
    tags: ["success-rate", "quality"],
  },
];

// ============================================================================
// Alert Rules Engine
// ============================================================================

export class AlertRulesEngine {
  private rules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, Alert>();
  private alertHistory = new Map<string, Alert[]>();
  private lastAlertTimes = new Map<string, number>();
  private tracer = trace.getTracer("alert-rules-engine");

  constructor(
    private config: AlertRuleConfig = DEFAULT_ALERT_CONFIG,
    initialRules: AlertRule[] = PREDEFINED_RULES,
  ) {
    // Load initial rules
    initialRules.forEach((rule) => this.addRule(rule));
  }

  /**
   * Add a new alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Update an existing rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const existingRule = this.rules.get(ruleId);
    if (existingRule) {
      this.rules.set(ruleId, { ...existingRule, ...updates });
    }
  }

  /**
   * Get a rule by ID
   */
  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  getAllRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluate all rules against context
   */
  async evaluate(context: EvaluationContext): Promise<Alert[]> {
    return await this.tracer.startActiveSpan(
      "evaluate-alert-rules",
      async (span) => {
        const triggeredAlerts: Alert[] = [];

        span.setAttributes({
          "alert.rules_count": this.rules.size,
          "alert.active_count": this.activeAlerts.size,
        });

        try {
          for (const rule of this.rules.values()) {
            if (!rule.enabled) continue;

            const evaluation = await this.evaluateRule(rule, context);

            if (evaluation.triggered) {
              const alert = await this.createOrUpdateAlert(
                rule,
                evaluation,
                context,
              );
              if (alert) {
                triggeredAlerts.push(alert);
              }
            }
          }

          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttributes({
            "alert.triggered_count": triggeredAlerts.length,
          });

          return triggeredAlerts;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : String(error),
          });
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    rule: AlertRule,
    context: EvaluationContext,
  ): Promise<AlertEvaluationResult> {
    const metConditions: string[] = [];
    const failedConditions: string[] = [];

    for (const condition of rule.conditions) {
      const conditionMet = this.evaluateCondition(condition, context);

      if (conditionMet) {
        metConditions.push(condition.metric);
      } else {
        failedConditions.push(condition.metric);
      }
    }

    // Determine if rule is triggered based on condition logic
    const triggered =
      rule.conditionLogic === "AND"
        ? metConditions.length === rule.conditions.length
        : metConditions.length > 0;

    // Check if should escalate
    const existingAlert = this.getActiveAlertForRule(rule.id);
    const shouldEscalate =
      triggered &&
      existingAlert !== null &&
      rule.escalationDelayMs !== undefined &&
      Date.now() - existingAlert.firstTriggeredAt.getTime() >
        rule.escalationDelayMs;

    return {
      triggered,
      rule,
      metConditions,
      failedConditions,
      shouldEscalate,
      reason: triggered
        ? `Conditions met: ${metConditions.join(", ")}`
        : `Conditions not met: ${failedConditions.join(", ")}`,
    };
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: AlertCondition,
    context: EvaluationContext,
  ): boolean {
    const actualValue = this.getMetricValue(condition.metric, context);

    if (actualValue === undefined || actualValue === null) {
      return false;
    }

    switch (condition.operator) {
      case ">":
        return Number(actualValue) > Number(condition.value);
      case "<":
        return Number(actualValue) < Number(condition.value);
      case ">=":
        return Number(actualValue) >= Number(condition.value);
      case "<=":
        return Number(actualValue) <= Number(condition.value);
      case "==":
        return actualValue === condition.value;
      case "!=":
        return actualValue !== condition.value;
      case "CONTAINS":
        return String(actualValue).includes(String(condition.value));
      default:
        return false;
    }
  }

  /**
   * Get metric value from context
   */
  private getMetricValue(
    metric: string,
    context: EvaluationContext,
  ): number | string | boolean | undefined {
    const parts = metric.split(".");

    // Check workflow result
    if (parts[0] === "workflow" && context.workflowResult) {
      const result = context.workflowResult as any;
      return parts.slice(1).reduce((obj, key) => obj?.[key], result);
    }

    // Check report
    if (parts[0] === "report" && context.report) {
      const report = context.report as any;
      if (parts[1] === "failureRate") {
        return report.summary.failedWorkflows / report.summary.totalWorkflows;
      }
      if (parts[1] === "successRate") {
        return report.summary.passedWorkflows / report.summary.totalWorkflows;
      }
      return parts.slice(1).reduce((obj, key) => obj?.[key], report);
    }

    // Check custom metrics
    if (parts[0] === "metrics" && context.metrics) {
      return context.metrics[parts.slice(1).join(".")];
    }

    // Check additional data
    if (context.additionalData) {
      return parts.reduce(
        (obj, key) => obj?.[key],
        context.additionalData as any,
      );
    }

    return undefined;
  }

  /**
   * Create or update an alert
   */
  private async createOrUpdateAlert(
    rule: AlertRule,
    evaluation: AlertEvaluationResult,
    context: EvaluationContext,
  ): Promise<Alert | null> {
    // Check cooldown
    if (this.config.enableDeduplication) {
      const lastAlertTime = this.lastAlertTimes.get(rule.id);
      if (lastAlertTime && Date.now() - lastAlertTime < rule.cooldownMs) {
        return null; // Still in cooldown period
      }
    }

    // Check if we've hit max active alerts
    if (this.activeAlerts.size >= this.config.maxActiveAlerts) {
      return null;
    }

    const existingAlert = this.getActiveAlertForRule(rule.id);
    const now = new Date();

    if (existingAlert) {
      // Update existing alert
      existingAlert.lastTriggeredAt = now;
      existingAlert.occurrences++;
      existingAlert.details = {
        ...existingAlert.details,
        lastEvaluation: evaluation,
        context: this.sanitizeContext(context),
      };

      // Check escalation
      if (evaluation.shouldEscalate && !existingAlert.escalatedAt) {
        existingAlert.escalatedAt = now;
        existingAlert.severity = this.escalateSeverity(existingAlert.severity);
      }

      return existingAlert;
    } else {
      // Create new alert
      const alertId = `${rule.id}-${Date.now()}`;
      const alert: Alert = {
        id: alertId,
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        state: "ACTIVE",
        message: this.generateAlertMessage(rule, evaluation, context),
        details: {
          evaluation,
          context: this.sanitizeContext(context),
        },
        firstTriggeredAt: now,
        lastTriggeredAt: now,
        occurrences: 1,
        channels: rule.channels,
        tags: rule.tags,
      };

      this.activeAlerts.set(alertId, alert);
      this.lastAlertTimes.set(rule.id, Date.now());

      // Add to history
      const history = this.alertHistory.get(rule.id) || [];
      history.push(alert);
      this.alertHistory.set(rule.id, history);

      return alert;
    }
  }

  /**
   * Generate human-readable alert message
   */
  private generateAlertMessage(
    rule: AlertRule,
    evaluation: AlertEvaluationResult,
    context: EvaluationContext,
  ): string {
    let message = `🚨 ${rule.name}\n\n`;
    message += `${rule.description}\n\n`;
    message += `**Severity:** ${rule.severity}\n`;
    message += `**Reason:** ${evaluation.reason}\n`;

    if (context.workflowResult) {
      message += `\n**Workflow:** ${context.workflowResult.name}\n`;
      message += `**Status:** ${context.workflowResult.status}\n`;
    }

    if (context.report) {
      message += `\n**Report Summary:**\n`;
      message += `- Total Runs: ${context.report.summary.totalWorkflows}\n`;
      message += `- Success Rate: ${((context.report.summary.passedWorkflows / context.report.summary.totalWorkflows) * 100).toFixed(1)}%\n`;
    }

    return message;
  }

  /**
   * Escalate severity level
   */
  private escalateSeverity(currentSeverity: AlertSeverity): AlertSeverity {
    const severityLevels: AlertSeverity[] = [
      "INFO",
      "WARNING",
      "ERROR",
      "CRITICAL",
    ];
    const currentIndex = severityLevels.indexOf(currentSeverity);
    const nextSeverity =
      currentIndex < severityLevels.length - 1
        ? severityLevels[currentIndex + 1]
        : currentSeverity;
    return nextSeverity!;
  }

  /**
   * Get active alert for a rule
   */
  private getActiveAlertForRule(ruleId: string): Alert | null {
    for (const alert of this.activeAlerts.values()) {
      if (alert.ruleId === ruleId && alert.state === "ACTIVE") {
        return alert;
      }
    }
    return null;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && alert.state === "ACTIVE") {
      alert.state = "ACKNOWLEDGED";
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && alert.state !== "RESOLVED") {
      alert.state = "RESOLVED";
      alert.resolvedAt = new Date();
      this.activeAlerts.delete(alertId);
      return true;
    }
    return false;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(
      (alert) => alert.severity === severity,
    );
  }

  /**
   * Get alert history for a rule
   */
  getAlertHistory(ruleId: string, limit: number = 10): Alert[] {
    const history = this.alertHistory.get(ruleId) || [];
    return history.slice(-limit);
  }

  /**
   * Auto-resolve old alerts
   */
  autoResolveOldAlerts(): number {
    if (!this.config.autoResolveAfterMs) return 0;

    let resolvedCount = 0;
    const cutoffTime = Date.now() - this.config.autoResolveAfterMs;

    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.firstTriggeredAt.getTime() < cutoffTime) {
        this.resolveAlert(alertId);
        resolvedCount++;
      }
    }

    return resolvedCount;
  }

  /**
   * Sanitize context for storage
   */
  private sanitizeContext(context: EvaluationContext): Record<string, any> {
    return {
      timestamp: context.timestamp,
      workflowName: context.workflowResult?.workflow?.name,
      workflowStatus: context.workflowResult?.status,
      reportSummary: context.report
        ? {
            total: context.report.summary.totalWorkflows,
            passed: context.report.summary.passedWorkflows,
            failed: context.report.summary.failedWorkflows,
          }
        : undefined,
    };
  }

  /**
   * Get engine statistics
   */
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    activeAlerts: number;
    alertsBySeverity: Record<AlertSeverity, number>;
  } {
    const alertsBySeverity: Record<AlertSeverity, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0,
    };

    for (const alert of this.activeAlerts.values()) {
      alertsBySeverity[alert.severity]++;
    }

    return {
      totalRules: this.rules.size,
      enabledRules: Array.from(this.rules.values()).filter((r) => r.enabled)
        .length,
      activeAlerts: this.activeAlerts.size,
      alertsBySeverity,
    };
  }

  /**
   * Clear all alerts and history
   */
  clear(): void {
    this.activeAlerts.clear();
    this.alertHistory.clear();
    this.lastAlertTimes.clear();
  }
}

// ============================================================================
// Global Alert Engine Instance
// ============================================================================

export const globalAlertEngine = new AlertRulesEngine();

// ============================================================================
// Export Everything
// ============================================================================

export default AlertRulesEngine;
