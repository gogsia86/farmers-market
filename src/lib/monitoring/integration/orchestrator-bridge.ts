/**
 * 🌉 Orchestrator-Monitoring Bridge
 * Farmers Market Platform - Divine Agricultural Intelligence
 * Version: 1.0.0
 *
 * This bridge connects the workflow monitoring bot to the AI agent orchestrator,
 * enabling automatic analysis of failures and triggering of self-healing workflows.
 */

import { createOrchestratorFromEnv } from "../agents/workflow-agent-orchestrator";
import {
  createAutoRemediationSystem,
  type AutoRemediationSystem,
  type RemediationPlan,
  type ExecutionResult,
} from "../healing/auto-remediation-system";
import type { WorkflowResult, MonitoringReport } from "../types";

// ============================================================================
// TYPES
// ============================================================================

export type BridgeEventType =
  | "WORKFLOW_FAILED"
  | "ANALYSIS_STARTED"
  | "ANALYSIS_COMPLETE"
  | "REMEDIATION_STARTED"
  | "REMEDIATION_COMPLETE"
  | "NOTIFICATION_SENT"
  | "ERROR";

export interface BridgeEvent {
  id: string;
  timestamp: Date;
  type: BridgeEventType;
  workflowId?: string;
  workflowName?: string;
  details: Record<string, unknown>;
}

export interface BridgeConfig {
  enabled: boolean;
  autoAnalyze: boolean;
  autoRemediate: boolean;
  notifyOnFailure: boolean;
  notifyOnRemediation: boolean;
  analysisTimeout: number;
  remediationTimeout: number;
  minFailuresBeforeAnalysis: number;
  cooldownBetweenAnalyses: number;
  webhookUrl?: string;
  slackWebhook?: string;
  emailRecipients?: string[];
  agriculturalAwareness: {
    enabled: boolean;
    validateSeasonal: boolean;
    checkBiodynamicCompliance: boolean;
  };
}

export interface BridgeStatistics {
  totalFailuresProcessed: number;
  analysesPerformed: number;
  remediationsExecuted: number;
  successfulRemediations: number;
  averageAnalysisTime: number;
  averageRemediationTime: number;
  lastFailureTime?: Date;
  lastAnalysisTime?: Date;
  lastRemediationTime?: Date;
}

export interface NotificationPayload {
  type: "FAILURE" | "ANALYSIS" | "REMEDIATION" | "SUCCESS" | "ERROR";
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  title: string;
  message: string;
  workflowName?: string;
  workflowId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// ORCHESTRATOR-MONITORING BRIDGE
// ============================================================================

export class OrchestratorBridge {
  private config: BridgeConfig;
  private orchestrator: ReturnType<typeof createOrchestratorFromEnv> | null =
    null;
  private remediationSystem: AutoRemediationSystem;
  private eventLog: BridgeEvent[] = [];
  private statistics: BridgeStatistics;
  private analysisTimestamps: Map<string, Date> = new Map();
  private failureCounters: Map<string, number> = new Map();
  private eventHandlers: Map<
    BridgeEventType,
    Array<(event: BridgeEvent) => void>
  > = new Map();

  constructor(config: Partial<BridgeConfig> = {}) {
    this.config = {
      enabled: true,
      autoAnalyze: true,
      autoRemediate: true,
      notifyOnFailure: true,
      notifyOnRemediation: true,
      analysisTimeout: 60000, // 1 minute
      remediationTimeout: 120000, // 2 minutes
      minFailuresBeforeAnalysis: 1,
      cooldownBetweenAnalyses: 300000, // 5 minutes
      agriculturalAwareness: {
        enabled: true,
        validateSeasonal: true,
        checkBiodynamicCompliance: true,
      },
      ...config,
    };

    this.statistics = {
      totalFailuresProcessed: 0,
      analysesPerformed: 0,
      remediationsExecuted: 0,
      successfulRemediations: 0,
      averageAnalysisTime: 0,
      averageRemediationTime: 0,
    };

    // Initialize AI orchestrator
    try {
      this.orchestrator = createOrchestratorFromEnv();
    } catch (error) {
      console.warn("⚠️ AI Orchestrator not available:", error);
      this.orchestrator = null;
    }

    // Initialize remediation system
    this.remediationSystem = createAutoRemediationSystem({
      enabled: this.config.autoRemediate,
      aiEnabled: !!this.orchestrator,
    });
  }

  // ============================================================================
  // MAIN WORKFLOW HOOKS
  // ============================================================================

  /**
   * 🎯 Process a single workflow result
   * This is the main entry point for workflow failures
   */
  async processWorkflowResult(result: WorkflowResult): Promise<{
    analyzed: boolean;
    remediated: boolean;
    plan?: RemediationPlan;
    executionResult?: ExecutionResult;
  }> {
    if (!this.config.enabled) {
      return { analyzed: false, remediated: false };
    }

    // Only process failures
    if (result.status !== "FAILED") {
      // Reset failure counter on success
      this.failureCounters.delete(result.workflowId);
      return { analyzed: false, remediated: false };
    }

    this.statistics.totalFailuresProcessed++;
    this.statistics.lastFailureTime = new Date();

    // Log the failure event
    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: "WORKFLOW_FAILED",
      workflowId: result.workflowId,
      workflowName: result.name,
      details: {
        error: result.error,
        duration: result.duration,
        priority: result.priority,
      },
    });

    // Increment failure counter
    const currentCount = (this.failureCounters.get(result.workflowId) || 0) + 1;
    this.failureCounters.set(result.workflowId, currentCount);

    // Send failure notification
    if (this.config.notifyOnFailure) {
      await this.sendNotification({
        type: "FAILURE",
        severity: result.priority === "CRITICAL" ? "CRITICAL" : "ERROR",
        title: `Workflow Failed: ${result.name}`,
        message: result.error || "Unknown error occurred",
        workflowName: result.name,
        workflowId: result.workflowId,
        details: {
          duration: result.duration,
          failedSteps: result.failedSteps,
        },
        timestamp: new Date(),
      });
    }

    // Check if we should analyze
    if (!this.shouldAnalyze(result)) {
      return { analyzed: false, remediated: false };
    }

    // Perform analysis and optional remediation
    return await this.analyzeAndRemediate(result);
  }

  /**
   * 📊 Process a complete monitoring report
   * Analyzes all failed workflows in the report
   */
  async processMonitoringReport(report: MonitoringReport): Promise<{
    failuresFound: number;
    failuresAnalyzed: number;
    remediationsAttempted: number;
    remediationsSuccessful: number;
    plans: RemediationPlan[];
  }> {
    const results = {
      failuresFound: 0,
      failuresAnalyzed: 0,
      remediationsAttempted: 0,
      remediationsSuccessful: 0,
      plans: [] as RemediationPlan[],
    };

    if (!this.config.enabled) {
      return results;
    }

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║ 🌉 ORCHESTRATOR BRIDGE - Processing Monitoring Report      ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║ 📊 Total Workflows: ${String(report.summary.totalWorkflows).padEnd(36)} ║`,
    );
    console.log(
      `║ ❌ Failed: ${String(report.summary.failedWorkflows).padEnd(46)} ║`,
    );
    console.log(
      `║ ✅ Passed: ${String(report.summary.passedWorkflows).padEnd(46)} ║`,
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    // Filter failed workflows
    const failedWorkflows = report.workflows.filter(
      (r: { status: string }) => r.status === "FAILED",
    );
    results.failuresFound = failedWorkflows.length;

    if (failedWorkflows.length === 0) {
      console.log("✅ No failures to process\n");
      return results;
    }

    // Process each failed workflow
    for (const workflow of failedWorkflows) {
      try {
        const outcome = await this.processWorkflowResult(workflow);

        if (outcome.analyzed) {
          results.failuresAnalyzed++;
        }

        if (outcome.remediated && outcome.plan) {
          results.remediationsAttempted++;
          results.plans.push(outcome.plan);

          if (outcome.executionResult?.success) {
            results.remediationsSuccessful++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing workflow ${workflow.name}:`, error);
        this.logEvent({
          id: this.generateEventId(),
          timestamp: new Date(),
          type: "ERROR",
          workflowId: workflow.workflowId,
          workflowName: workflow.name,
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }

    // Print summary
    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║ 📈 BRIDGE PROCESSING SUMMARY                               ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║ 🔍 Failures Analyzed: ${String(results.failuresAnalyzed).padEnd(35)} ║`,
    );
    console.log(
      `║ 🔧 Remediations Attempted: ${String(results.remediationsAttempted).padEnd(30)} ║`,
    );
    console.log(
      `║ ✅ Remediations Successful: ${String(results.remediationsSuccessful).padEnd(29)} ║`,
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    return results;
  }

  // ============================================================================
  // ANALYSIS AND REMEDIATION
  // ============================================================================

  private async analyzeAndRemediate(result: WorkflowResult): Promise<{
    analyzed: boolean;
    remediated: boolean;
    plan?: RemediationPlan;
    executionResult?: ExecutionResult;
  }> {
    const startTime = Date.now();

    // Log analysis start
    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: "ANALYSIS_STARTED",
      workflowId: result.workflowId,
      workflowName: result.name,
      details: {},
    });

    console.log(`\n🔍 Analyzing failure: ${result.name}\n`);

    try {
      // Use the remediation system to process the failure
      const {
        plan,
        executed,
        result: execResult,
      } = await this.remediationSystem.processAndHeal(result);

      const analysisTime = Date.now() - startTime;
      this.updateAnalysisStatistics(analysisTime);
      this.analysisTimestamps.set(result.workflowId, new Date());

      // Log analysis complete
      this.logEvent({
        id: this.generateEventId(),
        timestamp: new Date(),
        type: "ANALYSIS_COMPLETE",
        workflowId: result.workflowId,
        workflowName: result.name,
        details: {
          planId: plan.id,
          confidence: plan.aiAnalysis.confidence,
          actionsProposed: plan.proposedActions.length,
          analysisTime,
        },
      });

      // Send analysis notification
      await this.sendNotification({
        type: "ANALYSIS",
        severity: "INFO",
        title: `Analysis Complete: ${result.name}`,
        message: `Root cause: ${plan.aiAnalysis.rootCause}. Confidence: ${plan.aiAnalysis.confidence}%`,
        workflowName: result.name,
        workflowId: result.workflowId,
        details: {
          planId: plan.id,
          actionsProposed: plan.proposedActions.length,
        },
        timestamp: new Date(),
      });

      // If executed (auto-approved), log and notify
      if (executed && execResult) {
        this.statistics.remediationsExecuted++;
        this.statistics.lastRemediationTime = new Date();

        if (execResult.success) {
          this.statistics.successfulRemediations++;
        }

        this.updateRemediationStatistics(execResult.duration);

        this.logEvent({
          id: this.generateEventId(),
          timestamp: new Date(),
          type: "REMEDIATION_COMPLETE",
          workflowId: result.workflowId,
          workflowName: result.name,
          details: {
            planId: plan.id,
            success: execResult.success,
            finalState: execResult.finalState,
            duration: execResult.duration,
          },
        });

        if (this.config.notifyOnRemediation) {
          await this.sendNotification({
            type: execResult.success ? "SUCCESS" : "ERROR",
            severity: execResult.success ? "INFO" : "WARNING",
            title: `Remediation ${execResult.success ? "Successful" : "Failed"}: ${result.name}`,
            message: `Final state: ${execResult.finalState}. Duration: ${execResult.duration}ms`,
            workflowName: result.name,
            workflowId: result.workflowId,
            details: {
              planId: plan.id,
              actionsExecuted: execResult.actionsExecuted.length,
              errors: execResult.errors,
            },
            timestamp: new Date(),
          });
        }

        return {
          analyzed: true,
          remediated: true,
          plan,
          executionResult: execResult,
        };
      }

      return { analyzed: true, remediated: false, plan };
    } catch (error) {
      console.error("❌ Analysis/Remediation error:", error);

      this.logEvent({
        id: this.generateEventId(),
        timestamp: new Date(),
        type: "ERROR",
        workflowId: result.workflowId,
        workflowName: result.name,
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      return { analyzed: false, remediated: false };
    }
  }

  private shouldAnalyze(result: WorkflowResult): boolean {
    if (!this.config.autoAnalyze) {
      return false;
    }

    // Check failure count threshold
    const failureCount = this.failureCounters.get(result.workflowId) || 0;
    if (failureCount < this.config.minFailuresBeforeAnalysis) {
      console.log(
        `⏳ Waiting for more failures before analysis (${failureCount}/${this.config.minFailuresBeforeAnalysis})`,
      );
      return false;
    }

    // Check cooldown
    const lastAnalysis = this.analysisTimestamps.get(result.workflowId);
    if (lastAnalysis) {
      const timeSinceLastAnalysis = Date.now() - lastAnalysis.getTime();
      if (timeSinceLastAnalysis < this.config.cooldownBetweenAnalyses) {
        const remaining = Math.round(
          (this.config.cooldownBetweenAnalyses - timeSinceLastAnalysis) / 1000,
        );
        console.log(
          `⏳ Cooldown active. ${remaining}s until next analysis allowed.`,
        );
        return false;
      }
    }

    // Always analyze critical failures
    if (result.priority === "CRITICAL") {
      return true;
    }

    return true;
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  private async sendNotification(payload: NotificationPayload): Promise<void> {
    // Console notification
    const icon =
      payload.type === "FAILURE"
        ? "❌"
        : payload.type === "SUCCESS"
          ? "✅"
          : payload.type === "ANALYSIS"
            ? "🔍"
            : payload.type === "REMEDIATION"
              ? "🔧"
              : "⚠️";

    console.log(`\n${icon} [NOTIFICATION] ${payload.title}`);
    console.log(`   ${payload.message}\n`);

    // Log notification event
    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: "NOTIFICATION_SENT",
      workflowId: payload.workflowId,
      workflowName: payload.workflowName,
      details: {
        notificationType: payload.type,
        severity: payload.severity,
        title: payload.title,
      },
    });

    // Webhook notification
    if (this.config.webhookUrl) {
      try {
        await this.sendWebhook(this.config.webhookUrl, payload);
      } catch (error) {
        console.error("Failed to send webhook notification:", error);
      }
    }

    // Slack notification
    if (this.config.slackWebhook) {
      try {
        await this.sendSlackNotification(payload);
      } catch (error) {
        console.error("Failed to send Slack notification:", error);
      }
    }
  }

  private async sendWebhook(
    url: string,
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          source: "farmers-market-orchestrator-bridge",
        }),
      });

      if (!response.ok) {
        console.warn(`Webhook returned status ${response.status}`);
      }
    } catch (error) {
      console.error("Webhook error:", error);
    }
  }

  private async sendSlackNotification(
    payload: NotificationPayload,
  ): Promise<void> {
    if (!this.config.slackWebhook) return;

    const color =
      payload.severity === "CRITICAL"
        ? "#ff0000"
        : payload.severity === "ERROR"
          ? "#ff6600"
          : payload.severity === "WARNING"
            ? "#ffcc00"
            : "#00ff00";

    const slackPayload = {
      attachments: [
        {
          color,
          title: payload.title,
          text: payload.message,
          fields: [
            {
              title: "Type",
              value: payload.type,
              short: true,
            },
            {
              title: "Severity",
              value: payload.severity,
              short: true,
            },
            ...(payload.workflowName
              ? [
                  {
                    title: "Workflow",
                    value: payload.workflowName,
                    short: true,
                  },
                ]
              : []),
          ],
          footer: "Farmers Market Orchestrator Bridge",
          ts: Math.floor(payload.timestamp.getTime() / 1000),
        },
      ],
    };

    try {
      await fetch(this.config.slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackPayload),
      });
    } catch (error) {
      console.error("Slack notification error:", error);
    }
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /**
   * Register an event handler for bridge events
   */
  on(eventType: BridgeEventType, handler: (event: BridgeEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Remove an event handler
   */
  off(eventType: BridgeEventType, handler: (event: BridgeEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(eventType, handlers);
    }
  }

  private logEvent(event: BridgeEvent): void {
    this.eventLog.push(event);

    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }

    // Emit to handlers
    const handlers = this.eventHandlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Event handler error:", error);
      }
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  private updateAnalysisStatistics(analysisTime: number): void {
    this.statistics.analysesPerformed++;

    // Update running average
    const n = this.statistics.analysesPerformed;
    this.statistics.averageAnalysisTime =
      (this.statistics.averageAnalysisTime * (n - 1) + analysisTime) / n;

    this.statistics.lastAnalysisTime = new Date();
  }

  private updateRemediationStatistics(remediationTime: number): void {
    const n = this.statistics.remediationsExecuted;
    this.statistics.averageRemediationTime =
      (this.statistics.averageRemediationTime * (n - 1) + remediationTime) / n;
  }

  getStatistics(): BridgeStatistics {
    return { ...this.statistics };
  }

  getEventLog(limit?: number): BridgeEvent[] {
    const log = [...this.eventLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  // ============================================================================
  // MANUAL OPERATIONS
  // ============================================================================

  /**
   * Manually trigger analysis for a workflow result
   */
  async manualAnalysis(result: WorkflowResult): Promise<RemediationPlan> {
    console.log(`\n🔍 Manual analysis requested for: ${result.name}\n`);
    return await this.remediationSystem.processFailure(result);
  }

  /**
   * Manually approve and execute a remediation plan
   */
  async manualApproveAndExecute(
    planId: string,
    approvedBy: string,
  ): Promise<ExecutionResult> {
    this.remediationSystem.approvePlan(planId, approvedBy);
    return await this.remediationSystem.executePlan(planId);
  }

  /**
   * Get pending remediation plans
   */
  getPendingPlans(): RemediationPlan[] {
    return this.remediationSystem.getPendingPlans();
  }

  /**
   * Get all remediation plans
   */
  getAllPlans(): RemediationPlan[] {
    return this.remediationSystem.getAllPlans();
  }

  /**
   * Get a specific remediation plan
   */
  getPlan(planId: string): RemediationPlan | undefined {
    return this.remediationSystem.getPlan(planId);
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): BridgeConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...updates };

    // Update remediation system if needed
    if (updates.autoRemediate !== undefined) {
      this.remediationSystem.updateConfig({ enabled: updates.autoRemediate });
    }
  }

  /**
   * Enable the bridge
   */
  enable(): void {
    this.config.enabled = true;
    console.log("🌉 Orchestrator Bridge ENABLED");
  }

  /**
   * Disable the bridge
   */
  disable(): void {
    this.config.enabled = false;
    console.log("🌉 Orchestrator Bridge DISABLED");
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private generateEventId(): string {
    return `bridge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get the remediation system instance
   */
  getRemediationSystem(): AutoRemediationSystem {
    return this.remediationSystem;
  }

  /**
   * Check if AI orchestrator is available
   */
  isOrchestratorAvailable(): boolean {
    return this.orchestrator !== null && this.orchestrator.isEnabled();
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createOrchestratorBridge(
  config?: Partial<BridgeConfig>,
): OrchestratorBridge {
  return new OrchestratorBridge(config);
}

export function createBridgeFromEnv(): OrchestratorBridge {
  return new OrchestratorBridge({
    enabled: process.env.BRIDGE_ENABLED !== "false",
    autoAnalyze: process.env.AUTO_ANALYZE !== "false",
    autoRemediate: process.env.AUTO_REMEDIATE !== "false",
    notifyOnFailure: process.env.NOTIFY_ON_FAILURE !== "false",
    notifyOnRemediation: process.env.NOTIFY_ON_REMEDIATION !== "false",
    webhookUrl: process.env.BRIDGE_WEBHOOK_URL,
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
  });
}
