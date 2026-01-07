/**
 * 🌟 Divine Workflow Monitoring Bot
 * Farmers Market Platform - Automated Workflow Testing & Monitoring System
 * Version: 1.0.0
 *
 * Main orchestrator for running workflow tests, generating reports, and sending notifications.
 */

import { createReporter } from "./reporter";
import type {
  DivineBotConfig,
  MonitoringReport,
  WorkflowConfig,
  WorkflowContext,
  WorkflowResult,
} from "./types";
import { DEFAULT_WORKFLOW_TIMEOUT } from "./types";
import {
  PREDEFINED_WORKFLOWS,
  getCriticalWorkflows,
  getEnabledWorkflows,
} from "./workflows/predefined-workflows";
import { createWorkflowExecutor } from "./workflows/workflow-executor";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// DIVINE MONITORING BOT
// ============================================================================

export class DivineMonitoringBot {
  private executor: ReturnType<typeof createWorkflowExecutor>;
  private reporter: ReturnType<typeof createReporter>;
  private config: DivineBotConfig;
  private isRunning = false;
  private scheduledIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<DivineBotConfig>) {
    // Merge with default config
    this.config = {
      enabled: true,
      name: "Divine Workflow Monitor Bot",
      version: "1.0.0",
      baseUrl: config.baseUrl || "http://localhost:3001",
      environments: {
        dev: "http://localhost:3001",
        ...config.environments,
      },
      workflows: config.workflows || PREDEFINED_WORKFLOWS,
      scheduler: config.scheduler || {
        enabled: true,
        workflows: [],
        concurrency: 5,
        retryOnFailure: true,
        maxRetries: 3,
        retryDelay: 5000,
      },
      notifications: config.notifications || {
        channels: [],
      },
      storage: config.storage || {
        type: "filesystem",
        location: "./monitoring-reports",
        retention: {
          days: 30,
          maxReports: 1000,
        },
      },
      agricultureConsciousness: config.agricultureConsciousness || {
        enabled: true,
        seasonalAwareness: true,
        biodynamicValidation: true,
        farmHealthMonitoring: true,
      },
      performance: config.performance || {
        parallel: true,
        maxConcurrency: 5,
        timeout: DEFAULT_WORKFLOW_TIMEOUT,
        screenshotOnFailure: true,
        traceOnFailure: true,
      },
      logging: config.logging || {
        level: "info",
        console: true,
        file: false,
      },
    };

    // Initialize components
    this.executor = createWorkflowExecutor();
    this.reporter = createReporter(
      this.config.storage.location,
      this.config.notifications,
    );

    // Register workflows
    this.config.workflows.forEach((workflow) => {
      this.executor.registerWorkflow(workflow);
    });
  }

  /**
   * ✅ START BOT - Start the monitoring bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.info("⚠️  Bot is already running");
      return;
    }

    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗");
    logger.info(
      "║ 🤖 DIVINE WORKFLOW MONITORING BOT STARTING                ║");
    logger.info(
      "╠════════════════════════════════════════════════════════════╣");
    logger.info(`║ 🔮 NAME: ${this.config.name.padEnd(48)} ║`);
    logger.info(`║ 📌 VERSION: ${this.config.version.padEnd(45)} ║`);
    logger.info(`║ 🌐 BASE URL: ${this.config.baseUrl.padEnd(44)} ║`);
    logger.info(
      `║ 🔄 WORKFLOWS: ${String(this.config.workflows.length).padEnd(43)} ║`,
    );
    logger.info(
      `║ 🌾 AGRICULTURE: ${this.config.agricultureConsciousness.enabled ? "ENABLED" : "DISABLED"}${" ".repeat(39 - (this.config.agricultureConsciousness.enabled ? 7 : 8))} ║`,
    );
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n");

    this.isRunning = true;

    // Start scheduler if enabled
    if (this.config.scheduler.enabled) {
      await this.startScheduler();
    }

    logger.info("✅ Bot started successfully!\n");
  }

  /**
   * ✅ STOP BOT - Stop the monitoring bot
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.info("⚠️  Bot is not running");
      return;
    }

    logger.info("\n🛑 Stopping Divine Workflow Monitoring Bot...");

    // Stop all scheduled workflows
    this.stopScheduler();

    this.isRunning = false;

    logger.info("✅ Bot stopped successfully!\n");
  }

  /**
   * ✅ RUN ALL WORKFLOWS - Execute all enabled workflows
   */
  async runAllWorkflows(): Promise<MonitoringReport> {
    logger.info("\n🚀 Running all enabled workflows...\n");

    const enabledWorkflows = getEnabledWorkflows();
    const startTime = new Date();

    const results = await this.executeWorkflows(enabledWorkflows);

    const endTime = new Date();

    // Cleanup executor after all workflows
    if (this.executor && typeof this.executor.destroy === "function") {
      await this.executor.destroy();
    }

    // Generate report
    const report = await this.reporter.generateReport(results, {
      start: startTime,
      end: endTime,
    });

    // Save report
    await this.reporter.saveReport(report);

    // Send notifications if needed
    await this.reporter.sendNotifications(report);

    return report;
  }

  /**
   * ✅ RUN CRITICAL WORKFLOWS - Execute only critical workflows
   */
  async runCriticalWorkflows(): Promise<MonitoringReport> {
    logger.info("\n🚨 Running critical workflows...\n");

    const criticalWorkflows = getCriticalWorkflows();
    const startTime = new Date();

    const results = await this.executeWorkflows(criticalWorkflows);

    const endTime = new Date();

    // Cleanup executor (close browser)
    if (this.executor && typeof this.executor.destroy === "function") {
      await this.executor.destroy();
    }

    // Generate report
    const report = await this.reporter.generateReport(results, {
      start: startTime,
      end: endTime,
    });

    // Save report
    await this.reporter.saveReport(report);

    // Send notifications if needed
    await this.reporter.sendNotifications(report);

    return report;
  }

  /**
   * ✅ RUN WORKFLOW BY ID - Execute specific workflow
   */
  async runWorkflow(workflowId: string): Promise<WorkflowResult> {
    const workflow = this.config.workflows.find((w) => w.id === workflowId);

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (!workflow.enabled) {
      logger.info(`⚠️  Workflow is disabled: ${workflow.name}`);
      throw new Error(`Workflow is disabled: ${workflowId}`);
    }

    logger.info(`\n🔄 Running workflow: ${workflow.name}...\n`);

    const context = this.createWorkflowContext(workflow);
    const result = await this.executeWorkflowWithRetry(workflow, context);

    return result;
  }

  /**
   * ✅ GET REPORT HISTORY - Retrieve historical reports
   */
  async getReportHistory(limit?: number): Promise<MonitoringReport[]> {
    return await this.reporter.getReportHistory(limit);
  }

  /**
   * ✅ GET CONFIG - Get current bot configuration
   */
  getConfig(): DivineBotConfig {
    return { ...this.config };
  }

  /**
   * ✅ UPDATE CONFIG - Update bot configuration
   */
  updateConfig(updates: Partial<DivineBotConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };

    // Reinitialize components if needed
    if (updates.baseUrl) {
      this.executor = createWorkflowExecutor();
    }

    if (updates.storage || updates.notifications) {
      this.reporter = createReporter(
        this.config.storage.location,
        this.config.notifications,
      );
    }
  }

  /**
   * ✅ PUBLIC API - List all registered workflows
   */
  listWorkflows(): WorkflowConfig[] {
    return this.config.workflows;
  }

  /**
   * ✅ PUBLIC API - Get workflow by ID
   */
  getWorkflow(id: string): WorkflowConfig | undefined {
    return this.config.workflows.find((w) => w.id === id);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async startScheduler(): Promise<void> {
    logger.info("📅 Starting workflow scheduler...\n");

    const enabledWorkflows = this.config.workflows.filter(
      (w) => w.enabled && w.schedule,
    );

    for (const workflow of enabledWorkflows) {
      if (!workflow.schedule) continue;

      const intervalMs = workflow.schedule.interval * 60 * 1000; // Convert minutes to ms

      logger.info(
        `   ⏰ Scheduling ${workflow.name} every ${workflow.schedule.interval} minutes`);

      // Schedule workflow execution
      const interval = setInterval(async () => {
        try {
          logger.info(`\n⏰ Scheduled execution: ${workflow.name}`);
          await this.runWorkflow(workflow.id);
        } catch (error) {
          logger.error(
            `❌ Scheduled workflow failed: ${workflow.name}`,
            {
              error: error instanceof Error ? error.message : String(error)
            }
          );
        }
      }, intervalMs);

      this.scheduledIntervals.set(workflow.id, interval);
    }

    logger.info(
      `\n✅ Scheduler started with ${this.scheduledIntervals.size} scheduled workflow(s)\n`,
    );
  }

  private stopScheduler(): void {
    logger.info("⏹️  Stopping workflow scheduler...");

    this.scheduledIntervals.forEach((interval, workflowId) => {
      clearInterval(interval);
      logger.info(`   ✅ Stopped scheduling: ${workflowId}`);
    });

    this.scheduledIntervals.clear();
  }

  private async executeWorkflows(
    workflows: WorkflowConfig[],
  ): Promise<WorkflowResult[]> {
    const results: WorkflowResult[] = [];

    if (this.config.performance.parallel) {
      // Execute workflows in parallel with concurrency limit
      const chunks = this.chunkArray(
        workflows,
        this.config.performance.maxConcurrency,
      );

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(async (workflow) => {
            const context = this.createWorkflowContext(workflow);
            return await this.executeWorkflowWithRetry(workflow, context);
          }),
        );
        results.push(...chunkResults);
      }
    } else {
      // Execute workflows sequentially
      for (const workflow of workflows) {
        const context = this.createWorkflowContext(workflow);
        const result = await this.executeWorkflowWithRetry(workflow, context);
        results.push(result);
      }
    }

    return results;
  }

  private async executeWorkflowWithRetry(
    workflow: WorkflowConfig,
    context: WorkflowContext,
  ): Promise<WorkflowResult> {
    let result = await this.executor.execute(workflow, context);

    // Retry if failed and retries are enabled
    if (
      result.status === "FAILED" &&
      this.config.scheduler.retryOnFailure &&
      workflow.retries > 0
    ) {
      for (let attempt = 1; attempt <= workflow.retries; attempt++) {
        logger.info(
          `\n🔄 Retrying workflow (attempt ${attempt}/${workflow.retries})...`,
        );

        result = await this.executor.retry(workflow, context, attempt);

        if (result.status === "PASSED") {
          logger.info(`✅ Workflow passed on retry ${attempt}`);
          break;
        }
      }
    }

    return result;
  }

  private createWorkflowContext(workflow: WorkflowConfig): WorkflowContext {
    return {
      workflowId: workflow.id,
      runId: "", // Will be set by executor
      baseUrl: this.config.baseUrl,
      config: workflow,
      testData: this.generateTestData(workflow),
      state: {},
      season: this.config.agricultureConsciousness.enabled
        ? this.getCurrentSeason()
        : undefined,
      startTime: new Date(),
      timeout: workflow.timeout || this.config.performance.timeout,
    };
  }

  private generateTestData(workflow: WorkflowConfig): Record<string, any> {
    // Generate appropriate test data based on workflow type
    const timestamp = Date.now();

    const testData: Record<string, any> = {
      timestamp,
    };

    switch (workflow.type) {
      case "USER_REGISTRATION":
        testData.email = `test.user.${timestamp}@farmersmarket.test`;
        testData.password = "TestPassword123!";
        testData.name = `Test User ${timestamp}`;
        break;

      case "USER_LOGIN":
        testData.email = "test@farmersmarket.test";
        testData.password = "TestPassword123!";
        break;

      case "FARM_CREATION": {
        const season = this.getCurrentSeason();
        testData.farmName = `Divine ${season} Farm ${timestamp}`;
        testData.description =
          "A biodynamic farm practicing sustainable agriculture.";
        testData.address = "123 Farm Road, Agricultural Valley, CA 95000";
        break;
      }

      case "PRODUCT_LISTING":
        testData.productName = "Fresh Organic Produce";
        testData.price = "5.99";
        testData.stock = "100";
        testData.description =
          "Fresh organic produce from our biodynamic farm.";
        break;

      case "ORDER_PLACEMENT":
        // No special test data needed
        break;

      case "HEALTH_CHECK":
        // No test data needed
        break;
    }

    return testData;
  }

  private getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createMonitoringBot(
  config: Partial<DivineBotConfig>,
): DivineMonitoringBot {
  return new DivineMonitoringBot(config);
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Run a quick health check
 */
export async function quickHealthCheck(
  baseUrl?: string,
): Promise<WorkflowResult> {
  const bot = createMonitoringBot({
    baseUrl: baseUrl || "http://localhost:3001",
  });

  return await bot.runWorkflow("health-check");
}

/**
 * Run all critical workflows
 */
export async function runCriticalChecks(
  baseUrl?: string,
): Promise<MonitoringReport> {
  const bot = createMonitoringBot({
    baseUrl: baseUrl || "http://localhost:3001",
    performance: {
      parallel: false, // Sequential execution to avoid browser crashes
      maxConcurrency: 1,
      timeout: 300000,
      screenshotOnFailure: true,
      traceOnFailure: true,
    },
  });

  return await bot.runCriticalWorkflows();
}

/**
 * Run comprehensive monitoring
 */
export async function runComprehensiveMonitoring(
  baseUrl?: string,
): Promise<MonitoringReport> {
  const bot = createMonitoringBot({
    baseUrl: baseUrl || "http://localhost:3001",
  });

  return await bot.runAllWorkflows();
}
