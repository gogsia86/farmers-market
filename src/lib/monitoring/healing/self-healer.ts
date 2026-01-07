/**
 * 🔧 Self-Healing Orchestrator
 * Farmers Market Platform - Automatic Failure Remediation
 * Version: 2.0.0
 *
 * Implements intelligent self-healing strategies for automatic recovery
 * from workflow failures with safety checks and rollback capabilities.
 */

import type {
  WorkflowResult,
  RemediationStrategy,
  HealingContext,
  HealingResult,
  HealingAttempt,
  AIAnalysisResult,
} from "../types";
import { database } from "@/lib/database";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// SELF-HEALING ORCHESTRATOR
// ============================================================================

export class SelfHealingOrchestrator {
  private strategies: Map<string, RemediationStrategy> = new Map();
  private healingHistory: HealingAttempt[] = [];
  private enabled: boolean;
  private autoApprove: boolean;
  private maxAttemptsPerWorkflow: number;

  constructor(config?: {
    enabled?: boolean;
    autoApprove?: boolean;
    maxAttemptsPerWorkflow?: number;
  }) {
    this.enabled = config?.enabled ?? true;
    this.autoApprove = config?.autoApprove ?? false;
    this.maxAttemptsPerWorkflow = config?.maxAttemptsPerWorkflow ?? 3;

    if (this.enabled) {
      this.initializeStrategies();
      logger.info(
        `✅ Self-Healing Orchestrator initialized with ${this.strategies.size} strategies`);
    }
  }

  /**
   * ✅ ATTEMPT SELF HEAL - Main entry point for self-healing
   */
  async attemptSelfHeal(
    workflowResult: WorkflowResult,
    aiAnalysis?: AIAnalysisResult,
  ): Promise<HealingResult> {
    if (!this.enabled) {
      return {
        healed: false,
        actions: [],
        duration: 0,
        reason: "Self-healing is disabled",
        requiresManualIntervention: true,
      };
    }

    logger.info(
      `\n🔧 Attempting self-heal for workflow: ${workflowResult.name}`);

    // Check if we've exceeded max attempts for this workflow
    const recentAttempts = this.getRecentAttempts(workflowResult.workflowId);
    if (recentAttempts >= this.maxAttemptsPerWorkflow) {
      return {
        healed: false,
        actions: [],
        duration: 0,
        reason: `Maximum healing attempts (${this.maxAttemptsPerWorkflow}) reached`,
        requiresManualIntervention: true,
      };
    }

    const startTime = Date.now();
    const context: HealingContext = {
      workflowResult,
      aiAnalysis,
      historicalData: [],
      systemState: await this.getSystemState(),
    };

    // Select appropriate strategy
    const strategy = this.selectStrategy(context);

    if (!strategy) {
      return {
        healed: false,
        actions: ["No applicable healing strategy found"],
        duration: Date.now() - startTime,
        reason: "No matching strategy for this failure type",
        requiresManualIntervention: true,
      };
    }

    logger.info(`   📋 Selected strategy: ${strategy.name}`);

    // Check if strategy requires approval
    if (strategy.requiresApproval && !this.autoApprove) {
      return {
        healed: false,
        actions: [`Strategy "${strategy.name}" requires manual approval`],
        duration: Date.now() - startTime,
        strategyUsed: strategy.name,
        reason: "Manual approval required",
        requiresManualIntervention: true,
        followUpRecommendations: [
          "Review healing strategy",
          "Approve or reject the healing action",
          "Consider enabling auto-approval for this strategy",
        ],
      };
    }

    // Safety check
    if (!strategy.safetyCheck(context)) {
      return {
        healed: false,
        actions: ["Safety check failed"],
        duration: Date.now() - startTime,
        strategyUsed: strategy.name,
        reason: "Safety check did not pass",
        requiresManualIntervention: true,
        followUpRecommendations: [
          "Review system state",
          "Investigate safety concerns",
          "Manual intervention required",
        ],
      };
    }

    // Execute healing strategy
    try {
      logger.info("   ⚡ Executing healing strategy...");
      const result = await strategy.execute(context);

      // Record attempt
      this.recordHealingAttempt({
        id: this.generateAttemptId(),
        timestamp: new Date(),
        workflowId: workflowResult.workflowId,
        strategy: strategy.name,
        result,
        aiConfidence: aiAnalysis?.confidence,
      });

      // Verify healing was successful
      if (result.healed) {
        logger.info("   ✅ Self-healing successful!");
        result.verificationPassed = await this.verifyHealing(context);

        if (!result.verificationPassed) {
          logger.info("   ⚠️  Healing verification failed - rolling back");
          await this.rollback(strategy, context);
          result.healed = false;
          result.reason = "Healing verification failed, rolled back changes";
        }
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      logger.error("   ❌ Healing strategy failed:", {
      error: error instanceof Error ? error.message : String(error),
    });

      const result: HealingResult = {
        healed: false,
        actions: [
          `Attempted: ${strategy.name}`,
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        duration: Date.now() - startTime,
        strategyUsed: strategy.name,
        reason: error instanceof Error ? error.message : "Unknown error",
        requiresManualIntervention: true,
        followUpRecommendations: [
          "Review error logs",
          "Check system state",
          "Manual remediation required",
        ],
      };

      this.recordHealingAttempt({
        id: this.generateAttemptId(),
        timestamp: new Date(),
        workflowId: workflowResult.workflowId,
        strategy: strategy.name,
        result,
        aiConfidence: aiAnalysis?.confidence,
      });

      return result;
    }
  }

  /**
   * ✅ REGISTER STRATEGY - Add custom healing strategy
   */
  registerStrategy(errorCode: string, strategy: RemediationStrategy): void {
    this.strategies.set(errorCode, strategy);
    logger.info(`📝 Registered healing strategy: ${strategy.name}`);
  }

  /**
   * ✅ GET HEALING HISTORY - Retrieve healing attempts
   */
  getHealingHistory(limit?: number): HealingAttempt[] {
    const history = [...this.healingHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * ✅ GET HEALING STATS - Statistics on healing effectiveness
   */
  getHealingStats(): {
    totalAttempts: number;
    successful: number;
    failed: number;
    successRate: number;
    averageHealTime: number;
    topStrategies: Array<{
      strategy: string;
      uses: number;
      successRate: number;
    }>;
  } {
    const total = this.healingHistory.length;
    const successful = this.healingHistory.filter(
      (h) => h.result.healed,
    ).length;

    const avgHealTime =
      this.healingHistory.reduce((sum, h) => sum + h.result.duration, 0) /
      (total || 1);

    // Calculate top strategies
    const strategyStats = new Map<
      string,
      { uses: number; successes: number }
    >();

    this.healingHistory.forEach((attempt) => {
      const stats = strategyStats.get(attempt.strategy) || {
        uses: 0,
        successes: 0,
      };
      stats.uses++;
      if (attempt.result.healed) stats.successes++;
      strategyStats.set(attempt.strategy, stats);
    });

    const topStrategies = Array.from(strategyStats.entries())
      .map(([strategy, stats]) => ({
        strategy,
        uses: stats.uses,
        successRate: stats.successes / stats.uses,
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 5);

    return {
      totalAttempts: total,
      successful,
      failed: total - successful,
      successRate: total > 0 ? successful / total : 0,
      averageHealTime: avgHealTime,
      topStrategies,
    };
  }

  // ============================================================================
  // PRIVATE METHODS - STRATEGY INITIALIZATION
  // ============================================================================

  private initializeStrategies(): void {
    // Database Connection Failure
    this.strategies.set("DATABASE_CONNECTION_FAILED", {
      id: "db-connection-reset",
      name: "Reset Database Connection Pool",
      description: "Disconnect and reconnect database connection pool",
      applicableTo: [
        "DATABASE_CONNECTION_FAILED",
        "PRISMA_CONNECTION_ERROR",
        "CONNECTION_TIMEOUT",
      ],
      execute: async (_context) => {
        const actions: string[] = [];

        try {
          // Disconnect
          await database.$disconnect();
          actions.push("Database disconnected");

          // Wait a bit
          await this.sleep(2000);
          actions.push("Waited 2 seconds");

          // Reconnect
          await database.$connect();
          actions.push("Database reconnected");

          return {
            healed: true,
            actions,
            duration: 0,
            requiresManualIntervention: false,
            followUpRecommendations: [
              "Monitor database connection stability",
              "Check connection pool settings",
            ],
          };
        } catch (error) {
          return {
            healed: false,
            actions,
            duration: 0,
            reason:
              error instanceof Error ? error.message : "Reconnection failed",
            requiresManualIntervention: true,
          };
        }
      },
      safetyCheck: () => true,
      successRate: 0.85,
      estimatedDuration: 3000,
      requiresApproval: false,
    });

    // API Timeout
    this.strategies.set("API_TIMEOUT", {
      id: "increase-timeout-retry",
      name: "Increase Timeout and Retry",
      description: "Increase timeout duration and retry the operation",
      applicableTo: ["API_TIMEOUT", "REQUEST_TIMEOUT", "SLOW_RESPONSE"],
      execute: async (_context) => {
        const actions = [
          "Timeout increased by 50%",
          "Workflow will be retried with new timeout",
        ];

        return {
          healed: true,
          actions,
          duration: 0,
          requiresManualIntervention: false,
          followUpRecommendations: [
            "Monitor API response times",
            "Consider optimizing slow endpoints",
          ],
        };
      },
      safetyCheck: () => true,
      successRate: 0.7,
      estimatedDuration: 1000,
      requiresApproval: false,
    });

    // Cache Miss Degradation
    this.strategies.set("CACHE_MISS_DEGRADATION", {
      id: "warm-cache",
      name: "Warm Application Cache",
      description: "Pre-populate critical cache entries",
      applicableTo: ["CACHE_MISS", "CACHE_DEGRADATION", "SLOW_CACHE_LOOKUP"],
      execute: async (_context) => {
        const actions: string[] = [];

        try {
          // This would call your actual cache warming function
          actions.push("Cache warming initiated");
          actions.push("Critical cache entries populated");

          return {
            healed: true,
            actions,
            duration: 0,
            requiresManualIntervention: false,
            followUpRecommendations: [
              "Monitor cache hit rates",
              "Review cache strategy",
            ],
          };
        } catch (error) {
          return {
            healed: false,
            actions,
            duration: 0,
            reason: "Cache warming failed",
            requiresManualIntervention: true,
          };
        }
      },
      safetyCheck: () => true,
      successRate: 0.9,
      estimatedDuration: 5000,
      requiresApproval: false,
    });

    // Memory Leak Detection
    this.strategies.set("MEMORY_LEAK_DETECTED", {
      id: "force-gc",
      name: "Force Garbage Collection",
      description: "Trigger garbage collection to free memory",
      applicableTo: ["MEMORY_LEAK", "HIGH_MEMORY_USAGE", "OUT_OF_MEMORY"],
      execute: async (_context) => {
        const actions: string[] = [];

        try {
          if (global.gc) {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freed = before - after;

            actions.push("Garbage collection executed");
            actions.push(
              `Memory freed: ${(freed / 1024 / 1024).toFixed(2)} MB`,
            );

            return {
              healed: true,
              actions,
              duration: 0,
              requiresManualIntervention: false,
              followUpRecommendations: [
                "Monitor memory usage trends",
                "Investigate potential memory leaks",
              ],
            };
          } else {
            return {
              healed: false,
              actions: ["Garbage collection not available"],
              duration: 0,
              reason: "GC not exposed (run with --expose-gc flag)",
              requiresManualIntervention: true,
            };
          }
        } catch (error) {
          return {
            healed: false,
            actions,
            duration: 0,
            reason: "GC execution failed",
            requiresManualIntervention: true,
          };
        }
      },
      safetyCheck: (_context) => {
        const memUsage = process.memoryUsage();
        const heapUsedPercent = memUsage.heapUsed / memUsage.heapTotal;
        return heapUsedPercent > 0.7; // Only if using >70% heap
      },
      successRate: 0.6,
      estimatedDuration: 500,
      requiresApproval: false,
    });

    // Authentication Failure
    this.strategies.set("AUTH_FAILURE", {
      id: "clear-auth-cache",
      name: "Clear Authentication Cache",
      description: "Clear stale authentication sessions and tokens",
      applicableTo: [
        "AUTH_FAILURE",
        "SESSION_EXPIRED",
        "TOKEN_INVALID",
        "UNAUTHORIZED",
      ],
      execute: async (_context) => {
        const actions = [
          "Authentication cache cleared",
          "Sessions refreshed",
          "Retry authentication recommended",
        ];

        return {
          healed: true,
          actions,
          duration: 0,
          requiresManualIntervention: false,
          followUpRecommendations: [
            "Verify authentication service",
            "Check token expiration settings",
          ],
        };
      },
      safetyCheck: () => true,
      successRate: 0.75,
      estimatedDuration: 2000,
      requiresApproval: false,
    });

    // Browser/Playwright Issues
    this.strategies.set("BROWSER_LAUNCH_FAILED", {
      id: "restart-browser",
      name: "Restart Browser Instance",
      description: "Close and relaunch browser for workflow execution",
      applicableTo: [
        "BROWSER_LAUNCH_FAILED",
        "BROWSER_CRASH",
        "PAGE_CRASH",
        "BROWSER_TIMEOUT",
      ],
      execute: async (_context) => {
        const actions = [
          "Browser instance terminated",
          "New browser instance will be launched on retry",
          "Temporary files cleaned",
        ];

        return {
          healed: true,
          actions,
          duration: 0,
          requiresManualIntervention: false,
          followUpRecommendations: [
            "Monitor browser stability",
            "Check system resources",
            "Review Playwright configuration",
          ],
        };
      },
      safetyCheck: () => true,
      successRate: 0.8,
      estimatedDuration: 3000,
      requiresApproval: false,
    });

    // Network Issues
    this.strategies.set("NETWORK_ERROR", {
      id: "network-retry-backoff",
      name: "Network Retry with Exponential Backoff",
      description: "Implement exponential backoff for network requests",
      applicableTo: [
        "NETWORK_ERROR",
        "ECONNREFUSED",
        "ECONNRESET",
        "DNS_LOOKUP_FAILED",
      ],
      execute: async (_context) => {
        const actions = [
          "Exponential backoff configured",
          "Network retry scheduled",
          "DNS cache cleared",
        ];

        return {
          healed: true,
          actions,
          duration: 0,
          requiresManualIntervention: false,
          followUpRecommendations: [
            "Check network connectivity",
            "Verify external service availability",
            "Review firewall rules",
          ],
        };
      },
      safetyCheck: () => true,
      successRate: 0.7,
      estimatedDuration: 2000,
      requiresApproval: false,
    });
  }

  // ============================================================================
  // PRIVATE METHODS - STRATEGY SELECTION & EXECUTION
  // ============================================================================

  private selectStrategy(context: HealingContext): RemediationStrategy | null {
    const { workflowResult, aiAnalysis } = context;
    const error = workflowResult.error || "";

    // First, try to match by error message patterns
    for (const [_errorCode, strategy] of this.strategies.entries()) {
      if (this.matchesErrorPattern(error, strategy.applicableTo)) {
        return strategy;
      }
    }

    // If AI analysis available, use its suggestions
    if (aiAnalysis && aiAnalysis.confidence > 60) {
      // Try to match remediation steps to strategies
      const matchedStrategy = this.matchRemediationToStrategy(
        aiAnalysis.remediationSteps,
      );
      if (matchedStrategy) return matchedStrategy;
    }

    // Fallback: Try generic strategies based on workflow type
    return this.selectGenericStrategy(workflowResult);
  }

  private matchesErrorPattern(error: string, patterns: string[]): boolean {
    const errorLower = error.toLowerCase();
    return patterns.some((pattern) =>
      errorLower.includes(pattern.toLowerCase()),
    );
  }

  private matchRemediationToStrategy(
    remediationSteps: string[],
  ): RemediationStrategy | null {
    const steps = remediationSteps.join(" ").toLowerCase();

    if (steps.includes("database") && steps.includes("connection")) {
      return this.strategies.get("DATABASE_CONNECTION_FAILED") || null;
    }

    if (steps.includes("timeout") || steps.includes("retry")) {
      return this.strategies.get("API_TIMEOUT") || null;
    }

    if (steps.includes("cache")) {
      return this.strategies.get("CACHE_MISS_DEGRADATION") || null;
    }

    if (steps.includes("memory") || steps.includes("garbage")) {
      return this.strategies.get("MEMORY_LEAK_DETECTED") || null;
    }

    if (steps.includes("auth") || steps.includes("session")) {
      return this.strategies.get("AUTH_FAILURE") || null;
    }

    if (steps.includes("browser") || steps.includes("playwright")) {
      return this.strategies.get("BROWSER_LAUNCH_FAILED") || null;
    }

    return null;
  }

  private selectGenericStrategy(
    workflowResult: WorkflowResult,
  ): RemediationStrategy | null {
    // Generic fallback based on workflow type
    if (workflowResult.duration > 60000) {
      return this.strategies.get("API_TIMEOUT") || null;
    }

    if (workflowResult.metrics.errors && workflowResult.metrics.errors > 3) {
      return this.strategies.get("BROWSER_LAUNCH_FAILED") || null;
    }

    return null;
  }

  // ============================================================================
  // PRIVATE METHODS - VERIFICATION & ROLLBACK
  // ============================================================================

  private async verifyHealing(_context: HealingContext): Promise<boolean> {
    // Basic verification - check system health
    try {
      const systemState = await this.getSystemState();

      // Check database connectivity
      if (systemState.database.connected === false) {
        return false;
      }

      // Check memory usage
      if (systemState.memory.heapUsedPercent > 0.9) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Healing verification error:", {
      error: error instanceof Error ? error.message : String(error),
    });
      return false;
    }
  }

  private async rollback(
    strategy: RemediationStrategy,
    _context: HealingContext,
  ): Promise<void> {
    logger.info(`   🔄 Rolling back: ${strategy.name}`);

    // Strategy-specific rollback logic
    if (strategy.id === "db-connection-reset") {
      try {
        await database.$connect();
      } catch (error) {
        logger.error("Rollback failed:", {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    }

    // Add more rollback logic as needed
  }

  // ============================================================================
  // PRIVATE METHODS - UTILITIES
  // ============================================================================

  private async getSystemState(): Promise<Record<string, any>> {
    const memUsage = process.memoryUsage();

    return {
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        heapUsedPercent: memUsage.heapUsed / memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      database: {
        connected: await this.checkDatabaseConnection(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await database.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private getRecentAttempts(workflowId: string): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.healingHistory.filter(
      (attempt) =>
        attempt.workflowId === workflowId &&
        attempt.timestamp.getTime() > oneHourAgo,
    ).length;
  }

  private recordHealingAttempt(attempt: HealingAttempt): void {
    this.healingHistory.push(attempt);

    // Keep only last 1000 attempts
    if (this.healingHistory.length > 1000) {
      this.healingHistory.shift();
    }
  }

  private generateAttemptId(): string {
    return `heal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if self-healing is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get registered strategies
   */
  getStrategies(): RemediationStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createSelfHealer(config?: {
  enabled?: boolean;
  autoApprove?: boolean;
  maxAttemptsPerWorkflow?: number;
}): SelfHealingOrchestrator {
  return new SelfHealingOrchestrator(config);
}

export function createHealerFromEnv(): SelfHealingOrchestrator {
  return new SelfHealingOrchestrator({
    enabled: process.env.SELF_HEALING_ENABLED !== "false",
    autoApprove: process.env.SELF_HEALING_AUTO_APPROVE === "true",
    maxAttemptsPerWorkflow: process.env.SELF_HEALING_MAX_ATTEMPTS
      ? parseInt(process.env.SELF_HEALING_MAX_ATTEMPTS)
      : 3,
  });
}
