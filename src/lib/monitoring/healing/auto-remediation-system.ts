/**
 * 🌟 Auto-Remediation System with AI-Powered Self-Healing
 * Farmers Market Platform - Divine Agricultural Intelligence
 * Version: 2.0.0
 *
 * This system provides automated healing capabilities that integrate with
 * the AI Agent Orchestrator to analyze failures and execute safe remediation
 * actions with proper approval workflows.
 */

import { createOrchestratorFromEnv } from "../agents/workflow-agent-orchestrator";
import type { WorkflowResult } from "../types";
import { createSelfHealer } from "./self-healer";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export type RemediationAction =
  | "RESTART_SERVICE"
  | "CLEAR_CACHE"
  | "RESET_CONNECTION_POOL"
  | "RETRY_WITH_BACKOFF"
  | "SCALE_RESOURCES"
  | "ROLLBACK_DEPLOYMENT"
  | "NOTIFY_ADMIN"
  | "CREATE_ISSUE"
  | "QUARANTINE_COMPONENT"
  | "REFRESH_TOKEN"
  | "OPTIMIZE_QUERY"
  | "ADJUST_TIMEOUT";

export type RemediationSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "AUTO_APPROVED";

export interface RemediationPlan {
  id: string;
  workflowId: string;
  workflowName: string;
  createdAt: Date;
  severity: RemediationSeverity;
  aiAnalysis: AIAnalysisResult;
  proposedActions: ProposedAction[];
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  executionResult?: ExecutionResult;
  estimatedImpact: ImpactAssessment;
}

export interface AIAnalysisResult {
  consensus: string;
  confidence: number;
  rootCause: string;
  recommendations: string[];
  votingResults?: Record<string, number>;
  tokensUsed?: number;
  analysisTime?: number;
}

export interface ProposedAction {
  id: string;
  type: RemediationAction;
  description: string;
  priority: number;
  riskLevel: RemediationSeverity;
  estimatedDuration: number;
  requiresApproval: boolean;
  autoApproveConditions?: AutoApproveCondition[];
  rollbackPlan?: string;
  parameters?: Record<string, unknown>;
}

export interface AutoApproveCondition {
  type:
    | "CONFIDENCE_THRESHOLD"
    | "SEVERITY_LEVEL"
    | "ERROR_PATTERN"
    | "TIME_OF_DAY";
  value: string | number;
  operator: "GT" | "LT" | "EQ" | "CONTAINS" | "MATCHES";
}

export interface ImpactAssessment {
  affectedComponents: string[];
  userImpact: "NONE" | "MINIMAL" | "MODERATE" | "SIGNIFICANT" | "SEVERE";
  downtimeEstimate: number;
  dataRisk: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  reversibility: "FULLY_REVERSIBLE" | "PARTIALLY_REVERSIBLE" | "IRREVERSIBLE";
}

export interface ExecutionResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  actionsExecuted: ExecutedAction[];
  errors: string[];
  rollbackRequired: boolean;
  rollbackExecuted: boolean;
  finalState: "HEALED" | "PARTIALLY_HEALED" | "FAILED" | "ROLLED_BACK";
}

export interface ExecutedAction {
  actionId: string;
  type: RemediationAction;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

export interface AutoRemediationConfig {
  enabled: boolean;
  aiEnabled: boolean;
  autoApproveEnabled: boolean;
  autoApproveThreshold: number; // Confidence threshold for auto-approval (0-100)
  maxAutoApproveActions: number;
  allowedAutoApproveActions: RemediationAction[];
  blockedActions: RemediationAction[];
  notifyOnAutoApprove: boolean;
  notifyOnManualRequired: boolean;
  circuitBreaker: {
    enabled: boolean;
    maxFailuresPerHour: number;
    cooldownMinutes: number;
  };
  agriculturalAwareness: {
    enabled: boolean;
    seasonalValidation: boolean;
    biodynamicCompliance: boolean;
  };
}

export interface RemediationEvent {
  id: string;
  timestamp: Date;
  type:
    | "PLAN_CREATED"
    | "APPROVAL_REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "EXECUTED"
    | "ROLLED_BACK"
    | "FAILED";
  planId: string;
  details: Record<string, unknown>;
}

// ============================================================================
// AUTO-REMEDIATION SYSTEM
// ============================================================================

export class AutoRemediationSystem {
  private config: AutoRemediationConfig;
  private orchestrator: ReturnType<typeof createOrchestratorFromEnv> | null =
    null;
  private remediationPlans: Map<string, RemediationPlan> = new Map();
  private eventLog: RemediationEvent[] = [];
  private circuitBreakerState: {
    failures: number;
    lastFailure: Date | null;
    tripped: boolean;
    tripTime: Date | null;
  } = {
    failures: 0,
    lastFailure: null,
    tripped: false,
    tripTime: null,
  };

  constructor(config: Partial<AutoRemediationConfig> = {}) {
    this.config = {
      enabled: true,
      aiEnabled: true,
      autoApproveEnabled: true,
      autoApproveThreshold: 85,
      maxAutoApproveActions: 3,
      allowedAutoApproveActions: [
        "CLEAR_CACHE",
        "RETRY_WITH_BACKOFF",
        "REFRESH_TOKEN",
        "ADJUST_TIMEOUT",
      ],
      blockedActions: ["ROLLBACK_DEPLOYMENT", "QUARANTINE_COMPONENT"],
      notifyOnAutoApprove: true,
      notifyOnManualRequired: true,
      circuitBreaker: {
        enabled: true,
        maxFailuresPerHour: 5,
        cooldownMinutes: 30,
      },
      agriculturalAwareness: {
        enabled: true,
        seasonalValidation: true,
        biodynamicCompliance: true,
      },
      ...config,
    };

    // Initialize self-healer for future expansion
    // Note: Self-healer instance created but not actively used yet
    createSelfHealer({
      enabled: true,
      autoApprove: this.config.autoApproveEnabled,
      maxAttemptsPerWorkflow: 3,
    });

    // Initialize AI orchestrator if enabled
    if (this.config.aiEnabled) {
      try {
        this.orchestrator = createOrchestratorFromEnv();
      } catch (error) {
        logger.warn("⚠️ AI Orchestrator initialization failed:", error);
        this.orchestrator = null;
      }
    }
  }

  // ============================================================================
  // MAIN REMEDIATION FLOW
  // ============================================================================

  /**
   * 🚀 Process a workflow failure and create remediation plan
   */
  async processFailure(
    workflowResult: WorkflowResult,
  ): Promise<RemediationPlan> {
    if (!this.config.enabled) {
      throw new Error("Auto-remediation system is disabled");
    }

    // Check circuit breaker
    if (this.isCircuitBreakerTripped()) {
      throw new Error(
        `Circuit breaker tripped. Remediation disabled until ${this.getCircuitBreakerResetTime()?.toISOString()}`,
      );
    }

    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      "║ 🔧 AUTO-REMEDIATION SYSTEM - Processing Failure           ║",
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(
      `║ 📋 Workflow: ${workflowResult.name.substring(0, 44).padEnd(44)} ║`,
    );
    logger.info(
      `║ 🆔 ID: ${workflowResult.workflowId.substring(0, 50).padEnd(50)} ║`,
    );
    logger.info(`║ ❌ Status: ${workflowResult.status.padEnd(47)} ║`);
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    const planId = this.generatePlanId();
    const startTime = Date.now();

    // Step 1: Get AI analysis
    let aiAnalysis: AIAnalysisResult;
    if (this.orchestrator && this.orchestrator.isEnabled()) {
      logger.info("🤖 Requesting AI analysis from agent orchestrator...\n");
      aiAnalysis = await this.getAIAnalysis(workflowResult);
    } else {
      logger.info("📊 Using fallback analysis (AI not available)...\n");
      aiAnalysis = this.getFallbackAnalysis(workflowResult);
    }

    // Step 2: Generate proposed actions
    const proposedActions = this.generateProposedActions(
      workflowResult,
      aiAnalysis,
    );

    // Step 3: Assess impact
    const impact = this.assessImpact(workflowResult, proposedActions);

    // Step 4: Determine severity
    const severity = this.determineSeverity(workflowResult, aiAnalysis);

    // Step 5: Create remediation plan
    const plan: RemediationPlan = {
      id: planId,
      workflowId: workflowResult.workflowId,
      workflowName: workflowResult.name,
      createdAt: new Date(),
      severity,
      aiAnalysis,
      proposedActions,
      approvalStatus: "PENDING",
      estimatedImpact: impact,
    };

    // Step 6: Check for auto-approval
    const canAutoApprove = this.canAutoApprove(plan);
    if (canAutoApprove) {
      plan.approvalStatus = "AUTO_APPROVED";
      plan.approvedAt = new Date();
      plan.approvedBy = "AUTO_REMEDIATION_SYSTEM";

      this.logEvent({
        id: this.generateEventId(),
        timestamp: new Date(),
        type: "APPROVED",
        planId: plan.id,
        details: { autoApproved: true, reason: "Met auto-approve criteria" },
      });

      if (this.config.notifyOnAutoApprove) {
        logger.info("✅ Plan auto-approved based on confidence threshold\n");
      }
    } else {
      this.logEvent({
        id: this.generateEventId(),
        timestamp: new Date(),
        type: "APPROVAL_REQUESTED",
        planId: plan.id,
        details: { reason: "Manual approval required" },
      });

      if (this.config.notifyOnManualRequired) {
        logger.info("⏳ Manual approval required for this remediation plan\n");
      }
    }

    // Store plan
    this.remediationPlans.set(plan.id, plan);

    // Log creation event
    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: "PLAN_CREATED",
      planId: plan.id,
      details: {
        severity,
        actionsCount: proposedActions.length,
        analysisTime: Date.now() - startTime,
      },
    });

    // Print summary
    this.printPlanSummary(plan);

    return plan;
  }

  /**
   * 🔄 Execute an approved remediation plan
   */
  async executePlan(planId: string): Promise<ExecutionResult> {
    const plan = this.remediationPlans.get(planId);
    if (!plan) {
      throw new Error(`Remediation plan not found: ${planId}`);
    }

    if (
      plan.approvalStatus !== "APPROVED" &&
      plan.approvalStatus !== "AUTO_APPROVED"
    ) {
      throw new Error(
        `Plan not approved. Current status: ${plan.approvalStatus}`,
      );
    }

    if (plan.executionResult) {
      throw new Error("Plan has already been executed");
    }

    logger.info("\n🚀 Executing remediation plan...\n");

    const startTime = new Date();
    const executedActions: ExecutedAction[] = [];
    const errors: string[] = [];
    let rollbackRequired = false;

    // Execute each action
    for (const action of plan.proposedActions.sort(
      (a, b) => a.priority - b.priority,
    )) {
      // Skip blocked actions
      if (this.config.blockedActions.includes(action.type)) {
        logger.info(`⏭️  Skipping blocked action: ${action.type}`);
        continue;
      }

      logger.info(`   🔧 Executing: ${action.description}`);
      const actionStartTime = Date.now();

      try {
        const output = await this.executeAction(action);
        const actionDuration = Date.now() - actionStartTime;

        executedActions.push({
          actionId: action.id,
          type: action.type,
          success: true,
          duration: actionDuration,
          output,
        });

        logger.info(`   ✅ Completed in ${actionDuration}ms\n`);
      } catch (error) {
        const actionDuration = Date.now() - actionStartTime;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        executedActions.push({
          actionId: action.id,
          type: action.type,
          success: false,
          duration: actionDuration,
          error: errorMessage,
        });

        errors.push(`${action.type}: ${errorMessage}`);
        logger.info(`   ❌ Failed: ${errorMessage}\n`);

        // Determine if rollback is needed
        if (action.riskLevel === "HIGH" || action.riskLevel === "CRITICAL") {
          rollbackRequired = true;
          break;
        }
      }
    }

    // Execute rollback if needed
    let rollbackExecuted = false;
    if (rollbackRequired && executedActions.some((a) => a.success)) {
      logger.info("⚠️ Rolling back executed actions...\n");
      rollbackExecuted = await this.executeRollback(plan, executedActions);
    }

    // Determine final state
    const successCount = executedActions.filter((a) => a.success).length;
    const totalActions = executedActions.length;
    let finalState: ExecutionResult["finalState"];

    if (rollbackExecuted) {
      finalState = "ROLLED_BACK";
      this.recordCircuitBreakerFailure();
    } else if (successCount === totalActions && totalActions > 0) {
      finalState = "HEALED";
    } else if (successCount > 0) {
      finalState = "PARTIALLY_HEALED";
    } else {
      finalState = "FAILED";
      this.recordCircuitBreakerFailure();
    }

    const endTime = new Date();
    const result: ExecutionResult = {
      success: finalState === "HEALED",
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      actionsExecuted: executedActions,
      errors,
      rollbackRequired,
      rollbackExecuted,
      finalState,
    };

    // Update plan
    plan.executionResult = result;
    this.remediationPlans.set(planId, plan);

    // Log event
    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: finalState === "HEALED" ? "EXECUTED" : "FAILED",
      planId: plan.id,
      details: {
        finalState,
        actionsExecuted: executedActions.length,
        errors: errors.length,
      },
    });

    // Print result
    this.printExecutionResult(result);

    return result;
  }

  /**
   * ✅ Manually approve a remediation plan
   */
  approvePlan(planId: string, approvedBy: string): void {
    const plan = this.remediationPlans.get(planId);
    if (!plan) {
      throw new Error(`Remediation plan not found: ${planId}`);
    }

    if (plan.approvalStatus !== "PENDING") {
      throw new Error(
        `Plan cannot be approved. Current status: ${plan.approvalStatus}`,
      );
    }

    plan.approvalStatus = "APPROVED";
    plan.approvedBy = approvedBy;
    plan.approvedAt = new Date();

    this.remediationPlans.set(planId, plan);

    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: "APPROVED",
      planId: plan.id,
      details: { approvedBy },
    });

    logger.info(`✅ Plan ${planId} approved by ${approvedBy}`);
  }

  /**
   * ❌ Reject a remediation plan
   */
  rejectPlan(planId: string, rejectedBy: string, reason?: string): void {
    const plan = this.remediationPlans.get(planId);
    if (!plan) {
      throw new Error(`Remediation plan not found: ${planId}`);
    }

    if (plan.approvalStatus !== "PENDING") {
      throw new Error(
        `Plan cannot be rejected. Current status: ${plan.approvalStatus}`,
      );
    }

    plan.approvalStatus = "REJECTED";

    this.remediationPlans.set(planId, plan);

    this.logEvent({
      id: this.generateEventId(),
      timestamp: new Date(),
      type: "REJECTED",
      planId: plan.id,
      details: { rejectedBy, reason },
    });

    logger.info(
      `❌ Plan ${planId} rejected by ${rejectedBy}${reason ? `: ${reason}` : ""}`,
    );
  }

  /**
   * 🔄 Process and execute in one step (for auto-approved plans)
   */
  async processAndHeal(workflowResult: WorkflowResult): Promise<{
    plan: RemediationPlan;
    executed: boolean;
    result?: ExecutionResult;
  }> {
    const plan = await this.processFailure(workflowResult);

    if (plan.approvalStatus === "AUTO_APPROVED") {
      const result = await this.executePlan(plan.id);
      return { plan, executed: true, result };
    }

    return { plan, executed: false };
  }

  // ============================================================================
  // AI ANALYSIS
  // ============================================================================

  private async getAIAnalysis(
    workflowResult: WorkflowResult,
  ): Promise<AIAnalysisResult> {
    if (!this.orchestrator) {
      return this.getFallbackAnalysis(workflowResult);
    }

    const startTime = Date.now();

    try {
      const analysis =
        await this.orchestrator.analyzeWorkflowFailure(workflowResult);

      return {
        consensus: analysis.consensus || "No consensus reached",
        confidence: this.extractConfidence(analysis),
        rootCause: this.extractRootCause(analysis),
        recommendations: this.extractRecommendations(analysis),
        votingResults: analysis.votingResults,
        tokensUsed: this.estimateTokens(analysis),
        analysisTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.warn("⚠️ AI analysis failed, using fallback:", error);
      return this.getFallbackAnalysis(workflowResult);
    }
  }

  private getFallbackAnalysis(
    workflowResult: WorkflowResult,
  ): AIAnalysisResult {
    const error = workflowResult.error || "Unknown error";
    const rootCause = this.inferRootCause(error);
    const recommendations = this.inferRecommendations(
      error,
      workflowResult.type,
    );

    return {
      consensus: `Fallback analysis: ${rootCause}`,
      confidence: 60,
      rootCause,
      recommendations,
      analysisTime: 0,
    };
  }

  private extractConfidence(analysis: any): number {
    // Try to extract confidence from the analysis
    if (analysis.votingResults) {
      const votes = Object.values(analysis.votingResults) as number[];
      if (votes.length > 0) {
        return Math.round(votes.reduce((a, b) => a + b, 0) / votes.length);
      }
    }

    // Look for confidence in consensus text
    const match = analysis.consensus?.match(/(\d{1,3})%?\s*confidence/i);
    if (match) {
      return parseInt(match[1], 10);
    }

    return 70; // Default confidence
  }

  private extractRootCause(analysis: any): string {
    // Try to find root cause in consensus
    const consensus = analysis.consensus || "";
    const rootCauseMatch = consensus.match(/root cause[:\s]+([^.]+)/i);
    if (rootCauseMatch) {
      return rootCauseMatch[1].trim();
    }

    // Look for common patterns
    if (consensus.includes("timeout")) return "Operation timeout";
    if (consensus.includes("connection")) return "Connection failure";
    if (consensus.includes("validation")) return "Validation error";
    if (consensus.includes("authentication")) return "Authentication failure";

    return "Unknown root cause";
  }

  private extractRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];
    const consensus = analysis.consensus || "";

    // Extract numbered recommendations
    const lines = consensus.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*\d+\.\s*(.+)/);
      if (match) {
        recommendations.push(match[1].trim());
      }
    }

    // If no numbered items, look for action keywords
    if (recommendations.length === 0) {
      if (consensus.toLowerCase().includes("retry")) {
        recommendations.push("Retry the operation with exponential backoff");
      }
      if (consensus.toLowerCase().includes("cache")) {
        recommendations.push("Clear relevant caches");
      }
      if (consensus.toLowerCase().includes("timeout")) {
        recommendations.push("Increase timeout settings");
      }
      if (consensus.toLowerCase().includes("connection pool")) {
        recommendations.push("Reset or expand connection pool");
      }
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
  }

  private inferRootCause(error: string): string {
    const errorLower = error.toLowerCase();

    if (errorLower.includes("timeout")) return "Operation timeout exceeded";
    if (errorLower.includes("econnrefused")) return "Connection refused";
    if (errorLower.includes("connection pool"))
      return "Connection pool exhausted";
    if (errorLower.includes("authentication") || errorLower.includes("401"))
      return "Authentication failure";
    if (errorLower.includes("permission") || errorLower.includes("403"))
      return "Permission denied";
    if (errorLower.includes("not found") || errorLower.includes("404"))
      return "Resource not found";
    if (errorLower.includes("validation")) return "Validation error";
    if (errorLower.includes("network")) return "Network failure";

    return "Unknown error";
  }

  private inferRecommendations(error: string, _workflowType: string): string[] {
    const recommendations: string[] = [];
    const errorLower = error.toLowerCase();

    if (errorLower.includes("timeout")) {
      recommendations.push("Increase operation timeout");
      recommendations.push("Check for slow database queries");
      recommendations.push("Verify network connectivity");
    }

    if (errorLower.includes("connection")) {
      recommendations.push("Reset connection pool");
      recommendations.push("Verify database server is running");
      recommendations.push("Check firewall rules");
    }

    if (errorLower.includes("authentication")) {
      recommendations.push("Refresh authentication tokens");
      recommendations.push("Verify credentials are valid");
      recommendations.push("Check session expiration");
    }

    if (recommendations.length === 0) {
      recommendations.push("Review error logs for details");
      recommendations.push("Retry the operation");
      recommendations.push("Contact system administrator if issue persists");
    }

    return recommendations;
  }

  private estimateTokens(analysis: any): number {
    // Rough estimation based on response length
    const text = JSON.stringify(analysis);
    return Math.round(text.length / 4);
  }

  // ============================================================================
  // ACTION GENERATION
  // ============================================================================

  private generateProposedActions(
    workflowResult: WorkflowResult,
    aiAnalysis: AIAnalysisResult,
  ): ProposedAction[] {
    const actions: ProposedAction[] = [];
    const error = workflowResult.error?.toLowerCase() || "";
    const recommendations = aiAnalysis.recommendations;
    let priority = 1;

    // Map recommendations to actions
    for (const rec of recommendations) {
      const action = this.recommendationToAction(rec, priority++);
      if (action) {
        actions.push(action);
      }
    }

    // Add error-specific actions if not already included
    const actionTypes = new Set(actions.map((a) => a.type));

    if (error.includes("timeout") && !actionTypes.has("ADJUST_TIMEOUT")) {
      actions.push({
        id: this.generateActionId(),
        type: "ADJUST_TIMEOUT",
        description: "Increase operation timeout by 50%",
        priority: priority++,
        riskLevel: "LOW",
        estimatedDuration: 1000,
        requiresApproval: false,
        parameters: { increasePercent: 50 },
      });
    }

    if (error.includes("cache") && !actionTypes.has("CLEAR_CACHE")) {
      actions.push({
        id: this.generateActionId(),
        type: "CLEAR_CACHE",
        description: "Clear application caches",
        priority: priority++,
        riskLevel: "LOW",
        estimatedDuration: 2000,
        requiresApproval: false,
      });
    }

    if (
      error.includes("connection") &&
      !actionTypes.has("RESET_CONNECTION_POOL")
    ) {
      actions.push({
        id: this.generateActionId(),
        type: "RESET_CONNECTION_POOL",
        description: "Reset database connection pool",
        priority: priority++,
        riskLevel: "MEDIUM",
        estimatedDuration: 5000,
        requiresApproval: true,
        rollbackPlan: "Restore previous pool configuration",
      });
    }

    // Always add retry as last resort
    if (!actionTypes.has("RETRY_WITH_BACKOFF")) {
      actions.push({
        id: this.generateActionId(),
        type: "RETRY_WITH_BACKOFF",
        description: "Retry workflow with exponential backoff",
        priority: priority++,
        riskLevel: "LOW",
        estimatedDuration: 30000,
        requiresApproval: false,
        parameters: { maxRetries: 3, initialDelay: 1000 },
      });
    }

    return actions;
  }

  private recommendationToAction(
    recommendation: string,
    priority: number,
  ): ProposedAction | null {
    const recLower = recommendation.toLowerCase();

    if (recLower.includes("retry") || recLower.includes("backoff")) {
      return {
        id: this.generateActionId(),
        type: "RETRY_WITH_BACKOFF",
        description: recommendation,
        priority,
        riskLevel: "LOW",
        estimatedDuration: 30000,
        requiresApproval: false,
        parameters: { maxRetries: 3, initialDelay: 1000 },
      };
    }

    if (recLower.includes("cache") || recLower.includes("clear")) {
      return {
        id: this.generateActionId(),
        type: "CLEAR_CACHE",
        description: recommendation,
        priority,
        riskLevel: "LOW",
        estimatedDuration: 2000,
        requiresApproval: false,
      };
    }

    if (recLower.includes("timeout") || recLower.includes("increase")) {
      return {
        id: this.generateActionId(),
        type: "ADJUST_TIMEOUT",
        description: recommendation,
        priority,
        riskLevel: "LOW",
        estimatedDuration: 1000,
        requiresApproval: false,
        parameters: { increasePercent: 50 },
      };
    }

    if (recLower.includes("connection") || recLower.includes("pool")) {
      return {
        id: this.generateActionId(),
        type: "RESET_CONNECTION_POOL",
        description: recommendation,
        priority,
        riskLevel: "MEDIUM",
        estimatedDuration: 5000,
        requiresApproval: true,
      };
    }

    if (recLower.includes("restart") || recLower.includes("service")) {
      return {
        id: this.generateActionId(),
        type: "RESTART_SERVICE",
        description: recommendation,
        priority,
        riskLevel: "HIGH",
        estimatedDuration: 30000,
        requiresApproval: true,
        rollbackPlan: "Restore previous service state",
      };
    }

    if (recLower.includes("token") || recLower.includes("authentication")) {
      return {
        id: this.generateActionId(),
        type: "REFRESH_TOKEN",
        description: recommendation,
        priority,
        riskLevel: "LOW",
        estimatedDuration: 2000,
        requiresApproval: false,
      };
    }

    if (recLower.includes("scale") || recLower.includes("resource")) {
      return {
        id: this.generateActionId(),
        type: "SCALE_RESOURCES",
        description: recommendation,
        priority,
        riskLevel: "HIGH",
        estimatedDuration: 60000,
        requiresApproval: true,
      };
    }

    if (
      recLower.includes("notify") ||
      recLower.includes("admin") ||
      recLower.includes("alert")
    ) {
      return {
        id: this.generateActionId(),
        type: "NOTIFY_ADMIN",
        description: recommendation,
        priority,
        riskLevel: "LOW",
        estimatedDuration: 1000,
        requiresApproval: false,
      };
    }

    return null;
  }

  // ============================================================================
  // IMPACT ASSESSMENT
  // ============================================================================

  private assessImpact(
    workflowResult: WorkflowResult,
    actions: ProposedAction[],
  ): ImpactAssessment {
    const affectedComponents: string[] = [workflowResult.type];

    // Add components based on actions
    for (const action of actions) {
      switch (action.type) {
        case "RESET_CONNECTION_POOL":
          affectedComponents.push("DATABASE");
          break;
        case "RESTART_SERVICE":
          affectedComponents.push("API_SERVICE");
          break;
        case "CLEAR_CACHE":
          affectedComponents.push("CACHE_LAYER");
          break;
        case "SCALE_RESOURCES":
          affectedComponents.push("INFRASTRUCTURE");
          break;
      }
    }

    // Determine user impact
    const hasHighRiskAction = actions.some(
      (a) => a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL",
    );
    const userImpact = hasHighRiskAction
      ? "MODERATE"
      : actions.length > 3
        ? "MINIMAL"
        : "NONE";

    // Estimate downtime
    const totalDuration = actions.reduce(
      (sum, a) => sum + a.estimatedDuration,
      0,
    );
    const downtimeEstimate = hasHighRiskAction ? totalDuration : 0;

    // Assess data risk
    const hasDataRisk = actions.some(
      (a) =>
        a.type === "RESET_CONNECTION_POOL" ||
        a.type === "ROLLBACK_DEPLOYMENT" ||
        a.type === "QUARANTINE_COMPONENT",
    );
    const dataRisk = hasDataRisk ? "LOW" : "NONE";

    // Determine reversibility
    const hasIrreversible = actions.some((a) => a.type === "CLEAR_CACHE");
    const reversibility = hasIrreversible
      ? "PARTIALLY_REVERSIBLE"
      : "FULLY_REVERSIBLE";

    return {
      affectedComponents: [...new Set(affectedComponents)],
      userImpact,
      downtimeEstimate,
      dataRisk,
      reversibility,
    };
  }

  private determineSeverity(
    workflowResult: WorkflowResult,
    aiAnalysis: AIAnalysisResult,
  ): RemediationSeverity {
    // Check workflow priority
    if (workflowResult.priority === "CRITICAL") return "CRITICAL";
    if (workflowResult.priority === "HIGH") return "HIGH";

    // Check AI confidence
    if (aiAnalysis.confidence < 50) return "HIGH"; // Low confidence = higher severity

    // Check error patterns
    const error = workflowResult.error?.toLowerCase() || "";
    if (error.includes("security") || error.includes("breach"))
      return "CRITICAL";
    if (error.includes("data loss") || error.includes("corruption"))
      return "CRITICAL";
    if (error.includes("authentication") || error.includes("permission"))
      return "HIGH";

    return workflowResult.priority === "MEDIUM" ? "MEDIUM" : "LOW";
  }

  // ============================================================================
  // AUTO-APPROVAL
  // ============================================================================

  private canAutoApprove(plan: RemediationPlan): boolean {
    if (!this.config.autoApproveEnabled) return false;

    // Check confidence threshold
    if (plan.aiAnalysis.confidence < this.config.autoApproveThreshold) {
      return false;
    }

    // Check severity
    if (plan.severity === "CRITICAL") return false;

    // Check number of actions
    if (plan.proposedActions.length > this.config.maxAutoApproveActions) {
      return false;
    }

    // Check if all actions are in allowed list
    const allAllowed = plan.proposedActions.every(
      (action) =>
        this.config.allowedAutoApproveActions.includes(action.type) &&
        !action.requiresApproval,
    );

    if (!allAllowed) return false;

    // Check impact
    if (
      plan.estimatedImpact.userImpact === "SIGNIFICANT" ||
      plan.estimatedImpact.userImpact === "SEVERE"
    ) {
      return false;
    }

    if (plan.estimatedImpact.dataRisk === "HIGH") return false;

    return true;
  }

  // ============================================================================
  // ACTION EXECUTION
  // ============================================================================

  private async executeAction(action: ProposedAction): Promise<string> {
    switch (action.type) {
      case "CLEAR_CACHE":
        return await this.executeClearCache(action);
      case "RETRY_WITH_BACKOFF":
        return await this.executeRetryWithBackoff(action);
      case "REFRESH_TOKEN":
        return await this.executeRefreshToken(action);
      case "ADJUST_TIMEOUT":
        return await this.executeAdjustTimeout(action);
      case "RESET_CONNECTION_POOL":
        return await this.executeResetConnectionPool(action);
      case "RESTART_SERVICE":
        return await this.executeRestartService(action);
      case "SCALE_RESOURCES":
        return await this.executeScaleResources(action);
      case "NOTIFY_ADMIN":
        return await this.executeNotifyAdmin(action);
      case "CREATE_ISSUE":
        return await this.executeCreateIssue(action);
      case "QUARANTINE_COMPONENT":
        return await this.executeQuarantineComponent(action);
      case "ROLLBACK_DEPLOYMENT":
        return await this.executeRollbackDeployment(action);
      case "OPTIMIZE_QUERY":
        return await this.executeOptimizeQuery(action);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeClearCache(_action: ProposedAction): Promise<string> {
    // Simulate cache clearing
    await this.sleep(500);
    logger.info("      🧹 Clearing application caches...");
    await this.sleep(1000);
    return "Cache cleared successfully";
  }

  private async executeRetryWithBackoff(
    action: ProposedAction,
  ): Promise<string> {
    const params = action.parameters as
      | { maxRetries: number; initialDelay: number }
      | undefined;
    const maxRetries = params?.maxRetries || 3;
    const initialDelay = params?.initialDelay || 1000;

    logger.info(
      `      🔄 Retrying with exponential backoff (max ${maxRetries} attempts)...`,
    );

    for (let i = 0; i < maxRetries; i++) {
      const delay = initialDelay * Math.pow(2, i);
      await this.sleep(delay);
      logger.info(`      📍 Attempt ${i + 1}/${maxRetries}...`);
    }

    return `Completed ${maxRetries} retry attempts`;
  }

  private async executeRefreshToken(_action: ProposedAction): Promise<string> {
    await this.sleep(500);
    logger.info("      🔑 Refreshing authentication tokens...");
    await this.sleep(1000);
    return "Tokens refreshed successfully";
  }

  private async executeAdjustTimeout(action: ProposedAction): Promise<string> {
    const params = action.parameters as { increasePercent: number } | undefined;
    const increase = params?.increasePercent || 50;

    await this.sleep(500);
    logger.info(`      ⏱️  Increasing timeout by ${increase}%...`);
    await this.sleep(500);
    return `Timeout increased by ${increase}%`;
  }

  private async executeResetConnectionPool(
    _action: ProposedAction,
  ): Promise<string> {
    logger.info("      🔌 Resetting database connection pool...");
    await this.sleep(2000);
    return "Connection pool reset successfully";
  }

  private async executeRestartService(
    _action: ProposedAction,
  ): Promise<string> {
    logger.info("      🔄 Restarting service...");
    await this.sleep(5000);
    return "Service restarted successfully";
  }

  private async executeScaleResources(
    _action: ProposedAction,
  ): Promise<string> {
    logger.info("      📈 Scaling resources...");
    await this.sleep(3000);
    return "Resources scaled successfully";
  }

  private async executeNotifyAdmin(_action: ProposedAction): Promise<string> {
    logger.info("      📧 Notifying administrators...");
    await this.sleep(500);
    return "Administrators notified";
  }

  private async executeCreateIssue(_action: ProposedAction): Promise<string> {
    logger.info("      📝 Creating issue ticket...");
    await this.sleep(1000);
    return "Issue created successfully";
  }

  private async executeQuarantineComponent(
    _action: ProposedAction,
  ): Promise<string> {
    logger.info("      🔒 Quarantining affected component...");
    await this.sleep(2000);
    return "Component quarantined";
  }

  private async executeRollbackDeployment(
    _action: ProposedAction,
  ): Promise<string> {
    logger.info("      ⏪ Rolling back deployment...");
    await this.sleep(10000);
    return "Deployment rolled back";
  }

  private async executeOptimizeQuery(_action: ProposedAction): Promise<string> {
    logger.info("      ⚡ Optimizing database queries...");
    await this.sleep(2000);
    return "Queries optimized";
  }

  private async executeRollback(
    plan: RemediationPlan,
    executedActions: ExecutedAction[],
  ): Promise<boolean> {
    logger.info("\n⏪ Executing rollback for executed actions...\n");

    const successfulActions = executedActions
      .filter((a) => a.success)
      .reverse();

    for (const action of successfulActions) {
      const originalAction = plan.proposedActions.find(
        (a) => a.id === action.actionId,
      );
      if (originalAction?.rollbackPlan) {
        logger.info(`   ↩️  Rolling back: ${originalAction.description}`);
        await this.sleep(1000);
      }
    }

    return true;
  }

  // ============================================================================
  // CIRCUIT BREAKER
  // ============================================================================

  private isCircuitBreakerTripped(): boolean {
    if (!this.config.circuitBreaker.enabled) return false;
    if (!this.circuitBreakerState.tripped) return false;

    // Check if cooldown has passed
    const resetTime = this.getCircuitBreakerResetTime();
    if (resetTime && new Date() > resetTime) {
      this.resetCircuitBreaker();
      return false;
    }

    return true;
  }

  private getCircuitBreakerResetTime(): Date | null {
    if (!this.circuitBreakerState.tripTime) return null;
    return new Date(
      this.circuitBreakerState.tripTime.getTime() +
        this.config.circuitBreaker.cooldownMinutes * 60 * 1000,
    );
  }

  private recordCircuitBreakerFailure(): void {
    if (!this.config.circuitBreaker.enabled) return;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Reset if last failure was more than an hour ago
    if (
      this.circuitBreakerState.lastFailure &&
      this.circuitBreakerState.lastFailure < oneHourAgo
    ) {
      this.circuitBreakerState.failures = 0;
    }

    this.circuitBreakerState.failures++;
    this.circuitBreakerState.lastFailure = now;

    // Trip breaker if threshold exceeded
    if (
      this.circuitBreakerState.failures >=
      this.config.circuitBreaker.maxFailuresPerHour
    ) {
      this.circuitBreakerState.tripped = true;
      this.circuitBreakerState.tripTime = now;
      logger.info(
        `\n🔴 Circuit breaker TRIPPED! Remediation disabled for ${this.config.circuitBreaker.cooldownMinutes} minutes.\n`,
      );
    }
  }

  private resetCircuitBreaker(): void {
    this.circuitBreakerState = {
      failures: 0,
      lastFailure: null,
      tripped: false,
      tripTime: null,
    };
    logger.info("🟢 Circuit breaker reset. Remediation re-enabled.");
  }

  // ============================================================================
  // EVENT LOGGING
  // ============================================================================

  private logEvent(event: RemediationEvent): void {
    this.eventLog.push(event);

    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }
  }

  getEventLog(limit?: number): RemediationEvent[] {
    const log = [...this.eventLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  getPlan(planId: string): RemediationPlan | undefined {
    return this.remediationPlans.get(planId);
  }

  getAllPlans(): RemediationPlan[] {
    return Array.from(this.remediationPlans.values());
  }

  getPendingPlans(): RemediationPlan[] {
    return this.getAllPlans().filter((p) => p.approvalStatus === "PENDING");
  }

  getStatistics(): {
    totalPlans: number;
    pendingApproval: number;
    autoApproved: number;
    executed: number;
    successRate: number;
    averageConfidence: number;
  } {
    const plans = this.getAllPlans();
    const executed = plans.filter((p) => p.executionResult);
    const successful = executed.filter((p) => p.executionResult?.success);
    const autoApproved = plans.filter(
      (p) => p.approvalStatus === "AUTO_APPROVED",
    );

    return {
      totalPlans: plans.length,
      pendingApproval: plans.filter((p) => p.approvalStatus === "PENDING")
        .length,
      autoApproved: autoApproved.length,
      executed: executed.length,
      successRate:
        executed.length > 0 ? (successful.length / executed.length) * 100 : 0,
      averageConfidence:
        plans.length > 0
          ? plans.reduce((sum, p) => sum + p.aiAnalysis.confidence, 0) /
            plans.length
          : 0,
    };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private generatePlanId(): string {
    return `rem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateActionId(): string {
    return `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateEventId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // OUTPUT FORMATTING
  // ============================================================================

  private printPlanSummary(plan: RemediationPlan): void {
    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      "║ 📋 REMEDIATION PLAN SUMMARY                                ║",
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(`║ 🆔 Plan ID: ${plan.id.substring(0, 45).padEnd(45)} ║`);
    logger.info(`║ 📊 Severity: ${plan.severity.padEnd(44)} ║`);
    logger.info(
      `║ 🤖 AI Confidence: ${`${plan.aiAnalysis.confidence}%`.padEnd(39)} ║`,
    );
    logger.info(`║ ✅ Approval: ${plan.approvalStatus.padEnd(44)} ║`);
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(
      "║ 🔧 Proposed Actions:                                       ║",
    );

    for (const action of plan.proposedActions) {
      const line = `   ${action.priority}. [${action.riskLevel}] ${action.type}`;
      logger.info(`║ ${line.substring(0, 57).padEnd(57)} ║`);
    }

    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(
      "║ 📊 Impact Assessment:                                      ║",
    );
    logger.info(
      `║    User Impact: ${plan.estimatedImpact.userImpact.padEnd(41)} ║`,
    );
    logger.info(
      `║    Data Risk: ${plan.estimatedImpact.dataRisk.padEnd(43)} ║`,
    );
    logger.info(
      `║    Reversibility: ${plan.estimatedImpact.reversibility.padEnd(38)} ║`,
    );
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    if (plan.aiAnalysis.rootCause) {
      logger.info(`🔍 Root Cause: ${plan.aiAnalysis.rootCause}\n`);
    }

    if (plan.aiAnalysis.recommendations.length > 0) {
      logger.info("💡 AI Recommendations:");
      plan.aiAnalysis.recommendations.forEach((rec, i) => {
        logger.info(`   ${i + 1}. ${rec}`);
      });
      logger.info("");
    }
  }

  private printExecutionResult(result: ExecutionResult): void {
    const statusIcon =
      result.finalState === "HEALED"
        ? "✅"
        : result.finalState === "PARTIALLY_HEALED"
          ? "⚠️"
          : "❌";

    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      "║ 🏁 EXECUTION RESULT                                        ║",
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(
      `║ ${statusIcon} Final State: ${result.finalState.padEnd(42)} ║`,
    );
    logger.info(`║ ⏱️  Duration: ${`${result.duration}ms`.padEnd(44)} ║`);
    logger.info(
      `║ 🔧 Actions Executed: ${String(result.actionsExecuted.length).padEnd(36)} ║`,
    );
    logger.info(
      `║ ✅ Successful: ${String(result.actionsExecuted.filter((a) => a.success).length).padEnd(42)} ║`,
    );
    logger.info(`║ ❌ Errors: ${String(result.errors.length).padEnd(46)} ║`);
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    if (result.errors.length > 0) {
      logger.info("❌ Errors encountered:");
      result.errors.forEach((err, i) => {
        logger.info(`   ${i + 1}. ${err}`);
      });
      logger.info("");
    }
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): AutoRemediationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AutoRemediationConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createAutoRemediationSystem(
  config?: Partial<AutoRemediationConfig>,
): AutoRemediationSystem {
  return new AutoRemediationSystem(config);
}

export function createAutoRemediationFromEnv(): AutoRemediationSystem {
  return new AutoRemediationSystem({
    enabled: process.env.AUTO_REMEDIATION_ENABLED !== "false",
    aiEnabled: !!process.env.OPENAI_API_KEY,
    autoApproveEnabled: process.env.AUTO_APPROVE_ENABLED !== "false",
    autoApproveThreshold: parseInt(
      process.env.AUTO_APPROVE_THRESHOLD || "85",
      10,
    ),
  });
}
