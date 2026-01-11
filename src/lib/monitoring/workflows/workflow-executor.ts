/**
 * 🌟 Divine Workflow Executor
 * Farmers Market Platform - Automated Workflow Testing & Execution
 * Version: 1.0.0
 *
 * Executes workflow tests with agricultural consciousness and divine precision.
 */

import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import type {
  AgriculturalAnalysis,
  WorkflowExecutor as IWorkflowExecutor,
  WorkflowConfig,
  WorkflowContext,
  WorkflowResult,
  WorkflowStatus,
  WorkflowStep,
  WorkflowStepResult,
} from "../types";
import { DEFAULT_RETRY_DELAY, DEFAULT_WORKFLOW_TIMEOUT } from "../types";
import { getWorkflowSteps as getPredefinedWorkflowSteps } from "./predefined-workflows";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// DIVINE WORKFLOW EXECUTOR
// ============================================================================

export class DivinedWorkflowExecutor implements IWorkflowExecutor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private workflows = new Map<string, WorkflowConfig>();

  constructor() {
    // Initialization logic can be added here if needed
  }

  /**
   * ✅ DIVINE PATTERN - Execute workflow with quantum coherence
   */
  async execute(
    workflow: WorkflowConfig,
    context: WorkflowContext,
  ): Promise<WorkflowResult> {
    const runId = this.generateRunId();
    const startTime = new Date();

    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      "║ ⚡ DIVINE WORKFLOW EXECUTION INITIATED                     ║",
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(`║ 🔮 WORKFLOW: ${workflow.name.padEnd(44)} ║`);
    logger.info(`║ 🆔 RUN ID: ${runId.padEnd(46)} ║`);
    logger.info(`║ 🌾 TYPE: ${workflow.type.padEnd(48)} ║`);
    logger.info(`║ ⚠️  PRIORITY: ${workflow.priority.padEnd(45)} ║`);
    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );

    try {
      // Initialize browser
      await this.initializeBrowser();

      // Create page context
      const page = await this.createPage();
      context.page = page;
      context.runId = runId;
      context.startTime = startTime;

      // Validate workflow before execution
      const isValid = await this.validate(workflow);
      if (!isValid) {
        throw new Error("Workflow validation failed");
      }

      // Execute workflow steps
      const steps = await this.getWorkflowSteps(workflow);
      const stepResults: WorkflowStepResult[] = [];

      for (const step of steps) {
        logger.info(`   🔄 Executing step: ${step.name}...`);
        const stepResult = await this.executeStep(step, context);
        stepResults.push(stepResult);

        if (!stepResult.success && !step.skipOnFailure) {
          logger.info(`   ❌ Step failed: ${step.name}`);
          break;
        }
        logger.info(`   ✅ Step passed: ${step.name}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Calculate status
      const status = this.calculateWorkflowStatus(stepResults);

      // Gather metrics
      const metrics = await this.gatherMetrics(page, stepResults);

      // Agricultural consciousness analysis
      const agricultureConsciousness = workflow.agricultureAwareness?.seasonal
        ? await this.analyzeAgriculturalConsciousness(stepResults, context)
        : undefined;

      // Create result
      const result: WorkflowResult = {
        workflowId: workflow.id,
        runId,
        name: workflow.name,
        type: workflow.type,
        priority: workflow.priority,
        status,
        startTime,
        endTime,
        duration,
        steps: stepResults,
        totalSteps: stepResults.length,
        passedSteps: stepResults.filter((s: any) => s.success).length,
        failedSteps: stepResults.filter((s: any) => !s.success).length,
        skippedSteps: 0,
        screenshots: stepResults
          .filter((s: any) => s.screenshot)
          .map((s: any) => s.screenshot!),
        traces: stepResults
          .filter((s: any) => s.trace)
          .map((s: any) => s.trace!),
        metrics,
        agricultureConsciousness,
        tags: workflow.tags,
      };

      this.logWorkflowResult(result);

      return result;
    } catch (error) {
      logger.error("❌ Workflow execution failed:", {
        error: error instanceof Error ? error.message : String(error),
      });

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        workflowId: workflow.id,
        runId,
        name: workflow.name,
        type: workflow.type,
        priority: workflow.priority,
        status: "FAILED",
        startTime,
        endTime,
        duration,
        steps: [],
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        error:
          error instanceof Error
            ? error.message
            : error && typeof error === "object" && "message" in error
              ? String(error.message)
              : String(error),
        screenshots: [],
        traces: [],
        metrics: {
          totalDuration: duration,
          errors: 1,
          warnings: 0,
        },
        tags: workflow.tags,
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * ✅ RETRY PATTERN - Retry failed workflow with exponential backoff
   */
  async retry(
    workflow: WorkflowConfig,
    context: WorkflowContext,
    attempt: number,
  ): Promise<WorkflowResult> {
    const delay = DEFAULT_RETRY_DELAY * Math.pow(2, attempt - 1);

    logger.info(
      `🔄 Retrying workflow (attempt ${attempt}/${workflow.retries}) after ${delay}ms...`,
    );

    await this.sleep(delay);
    return await this.execute(workflow, context);
  }

  /**
   * ✅ VALIDATION PATTERN - Validate workflow configuration
   */
  async validate(workflow: WorkflowConfig): Promise<boolean> {
    logger.info(`   🔍 Validating workflow: ${workflow.name}...`);

    // Check required fields
    if (!workflow.id || !workflow.name || !workflow.type) {
      logger.error("❌ Workflow missing required fields");
      return false;
    }

    // Check dependencies
    if (workflow.dependencies && workflow.dependencies.length > 0) {
      for (const depId of workflow.dependencies) {
        if (!this.workflows.has(depId)) {
          logger.error(`❌ Dependency not found: ${depId}`);
          return false;
        }
      }
    }

    // Check timeout
    if (workflow.timeout && workflow.timeout < 1000) {
      logger.error("❌ Timeout too short (minimum 1000ms)");
      return false;
    }

    logger.info("   ✅ Workflow validation passed");
    return true;
  }

  /**
   * ✅ DEPENDENCY RESOLUTION - Get workflow dependencies
   */
  async getDependencies(workflowId: string): Promise<WorkflowConfig[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.dependencies) {
      return [];
    }

    const dependencies: WorkflowConfig[] = [];
    for (const depId of workflow.dependencies) {
      const dep = this.workflows.get(depId);
      if (dep) {
        dependencies.push(dep);
      }
    }

    return dependencies;
  }

  /**
   * Register workflow for dependency resolution
   */
  registerWorkflow(workflow: WorkflowConfig): void {
    this.workflows.set(workflow.id, workflow);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async initializeBrowser(): Promise<void> {
    // Always create a fresh browser for each workflow to prevent crashes
    // Close any existing browser first
    if (this.browser) {
      await this.browser.close().catch(() => {
        // Ignore if already closed
      });
      this.browser = null;
    }

    // Allow headless mode to be configured via environment variable
    const headless = process.env.HEADLESS !== "false";

    this.browser = await chromium.launch({
      headless,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
    });

    logger.info(`   🔧 Browser mode: ${headless ? "headless" : "headed"}`);

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "DivineWorkflowBot/1.0 (Agricultural Testing)",
    });
  }

  private async createPage(): Promise<Page> {
    if (!this.context) {
      throw new Error("Browser context not initialized");
    }

    const page = await this.context.newPage();

    // Set default timeout
    page.setDefaultTimeout(DEFAULT_WORKFLOW_TIMEOUT);

    // Add console listener
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        logger.info(`   🔴 Browser console error: ${msg.text()}`);
      }
    });

    return page;
  }

  private async executeStep(
    step: any,
    context: WorkflowContext,
  ): Promise<WorkflowStepResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      // Execute step with timeout
      const timeout = step.timeout || DEFAULT_WORKFLOW_TIMEOUT;
      const result = await Promise.race([
        step.execute(context),
        this.timeoutPromise(timeout),
      ]);

      const duration = Date.now() - startTime;

      return {
        success: true,
        duration,
        logs,
        ...result,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Extract error message properly
      let errorMessage = "Unknown error";
      let errorObject: Error;

      if (error instanceof Error) {
        errorMessage = error.message;
        errorObject = error;
      } else if (typeof error === "string") {
        errorMessage = error;
        errorObject = new Error(error);
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
        errorObject = new Error(errorMessage);
      } else {
        errorMessage = String(error);
        errorObject = new Error(errorMessage);
      }

      // Log the error for debugging
      logger.error(`   ⚠️  Step error: ${errorMessage}`);

      // Take screenshot on failure
      let screenshot: string | undefined;
      if (context.page) {
        try {
          const screenshotBuffer = await context.page.screenshot({
            fullPage: true,
            path: `./test-results/failure-${context.runId}-${step.id}.png`,
          });
          screenshot = screenshotBuffer.toString("base64");
        } catch (e) {
          logger.error("Failed to capture screenshot:", {
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      return {
        success: false,
        duration,
        error: errorObject,
        screenshot,
        logs: [...logs, `ERROR: ${errorMessage}`],
      };
    }
  }

  private async getWorkflowSteps(
    workflow: WorkflowConfig,
  ): Promise<WorkflowStep[]> {
    // Get predefined workflow steps by workflow ID
    const steps = getPredefinedWorkflowSteps(workflow.id);

    if (steps.length === 0) {
      logger.warn(`⚠️  No steps found for workflow: ${workflow.id}`);
    }

    return steps;
  }

  private calculateWorkflowStatus(steps: WorkflowStepResult[]): WorkflowStatus {
    if (steps.length === 0) return "SKIPPED";

    const failed = steps.some((s: any) => !s.success);
    if (failed) return "FAILED";

    const hasWarnings = steps.some((s: any) =>
      s.logs.some((log: any) => log.includes("WARN")),
    );
    if (hasWarnings) return "WARNING";

    return "PASSED";
  }

  private async gatherMetrics(
    page: Page | undefined,
    steps: WorkflowStepResult[],
  ): Promise<any> {
    const totalDuration = steps.reduce(
      (sum: any, s: any) => sum + s.duration,
      0,
    );

    const metrics: any = {
      totalDuration,
      errors: steps.filter((s: any) => !s.success).length,
      warnings: steps.filter((s: any) =>
        s.logs.some((log: any) => log.includes("WARN")),
      ).length,
    };

    // Get performance metrics from page if available
    if (page) {
      try {
        const performanceMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;

          return {
            pageLoadTime:
              navigation?.loadEventEnd - navigation?.fetchStart || 0,
            domContentLoaded:
              navigation?.domContentLoadedEventEnd - navigation?.fetchStart ||
              0,
            networkRequests: performance.getEntriesByType("resource").length,
          };
        });

        metrics.pageLoadTime = performanceMetrics.pageLoadTime;
        metrics.networkRequests = performanceMetrics.networkRequests;
        metrics.performanceScore = this.calculatePerformanceScore(
          performanceMetrics.pageLoadTime,
        );
      } catch (e) {
        logger.warn("Failed to gather performance metrics:", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return metrics;
  }

  private calculatePerformanceScore(pageLoadTime: number): number {
    // Score based on page load time
    // < 1s = 100, < 2s = 90, < 3s = 80, < 5s = 70, > 5s = 50
    if (pageLoadTime < 1000) return 100;
    if (pageLoadTime < 2000) return 90;
    if (pageLoadTime < 3000) return 80;
    if (pageLoadTime < 5000) return 70;
    return 50;
  }

  private async analyzeAgriculturalConsciousness(
    steps: WorkflowStepResult[],
    context: WorkflowContext,
  ): Promise<AgriculturalAnalysis> {
    const season = context.season || this.getCurrentSeason();

    // Calculate scores
    const seasonalRelevance = this.calculateSeasonalRelevance(steps, season);
    const biodynamicAlignment = this.calculateBiodynamicAlignment(steps);
    const farmHealthScore = this.calculateFarmHealthScore(steps);

    // Generate recommendations
    const recommendations: string[] = [];
    const warnings: string[] = [];

    if (seasonalRelevance < 70) {
      warnings.push(
        `Low seasonal relevance (${seasonalRelevance}%). Consider seasonal optimization.`,
      );
      recommendations.push(
        `Align workflow with ${season} seasonal patterns for better results.`,
      );
    }

    if (biodynamicAlignment < 80) {
      recommendations.push(
        "Enhance biodynamic patterns in workflow execution.",
      );
    }

    if (farmHealthScore < 90) {
      warnings.push(`Farm health score below optimal: ${farmHealthScore}%`);
      recommendations.push(
        "Review farm data integrity and agricultural metadata.",
      );
    }

    return {
      season,
      seasonalRelevance,
      biodynamicAlignment,
      farmHealthScore,
      recommendations,
      warnings,
    };
  }

  private getCurrentSeason(): "SPRING" | "SUMMER" | "FALL" | "WINTER" {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "SPRING";
    if (month >= 5 && month <= 7) return "SUMMER";
    if (month >= 8 && month <= 10) return "FALL";
    return "WINTER";
  }

  private calculateSeasonalRelevance(
    steps: WorkflowStepResult[],
    season: string,
  ): number {
    // Check if workflow considers seasonal data
    const seasonalSteps = steps.filter(
      (s) => s.agricultureData && s.agricultureData.season === season,
    );
    return steps.length > 0 ? (seasonalSteps.length / steps.length) * 100 : 100;
  }

  private calculateBiodynamicAlignment(steps: WorkflowStepResult[]): number {
    // Check biodynamic pattern adherence
    const alignedSteps = steps.filter(
      (s) => s.agricultureData?.biodynamicCompliant !== false,
    );
    return steps.length > 0 ? (alignedSteps.length / steps.length) * 100 : 100;
  }

  private calculateFarmHealthScore(steps: WorkflowStepResult[]): number {
    // Calculate overall farm data integrity
    const healthySteps = steps.filter((s: any) => {
      const data = s.agricultureData;
      return data?.farmDataIntegrity !== false && data?.soilQuality !== "POOR";
    });
    return steps.length > 0 ? (healthySteps.length / steps.length) * 100 : 100;
  }

  private logWorkflowResult(result: WorkflowResult): void {
    const statusEmoji =
      result.status === "PASSED"
        ? "✅"
        : result.status === "FAILED"
          ? "❌"
          : result.status === "WARNING"
            ? "⚠️"
            : "⏭️";

    logger.info(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    logger.info(
      `║ ${statusEmoji} WORKFLOW EXECUTION COMPLETE                           ║`,
    );
    logger.info(
      "╠════════════════════════════════════════════════════════════╣",
    );
    logger.info(`║ 📊 STATUS: ${result.status.padEnd(46)} ║`);
    logger.info(
      `║ ⏱️  DURATION: ${(result.duration / 1000).toFixed(2)}s${" ".repeat(44 - (result.duration / 1000).toFixed(2).length)} ║`,
    );
    logger.info(
      `║ ✅ PASSED: ${result.passedSteps}/${result.totalSteps}${" ".repeat(47 - String(result.passedSteps).length - String(result.totalSteps).length)} ║`,
    );
    logger.info(
      `║ ❌ FAILED: ${result.failedSteps}/${result.totalSteps}${" ".repeat(47 - String(result.failedSteps).length - String(result.totalSteps).length)} ║`,
    );

    if (result.metrics.performanceScore) {
      logger.info(
        `║ 🚀 PERFORMANCE: ${result.metrics.performanceScore}/100${" ".repeat(40 - String(result.metrics.performanceScore).length)} ║`,
      );
    }

    if (result.agricultureConsciousness) {
      logger.info(
        `║ 🌾 SEASONAL: ${result.agricultureConsciousness.seasonalRelevance.toFixed(0)}%${" ".repeat(44 - result.agricultureConsciousness.seasonalRelevance.toFixed(0).length)} ║`,
      );
      logger.info(
        `║ 🌿 BIODYNAMIC: ${result.agricultureConsciousness.biodynamicAlignment.toFixed(0)}%${" ".repeat(42 - result.agricultureConsciousness.biodynamicAlignment.toFixed(0).length)} ║`,
      );
    }

    logger.info(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
  }

  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async cleanup(): Promise<void> {
    // Close both context and browser after each workflow
    // This ensures a fresh start for the next workflow and prevents crashes
    if (this.context) {
      await this.context.close().catch(() => {
        // Ignore errors if context already closed
      });
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close().catch(() => {
        // Ignore errors if browser already closed
      });
      this.browser = null;
    }
  }

  /**
   * Close the browser completely - call this when executor is no longer needed
   * (Now same as cleanup since we close browser after each workflow)
   */
  async destroy(): Promise<void> {
    await this.cleanup();
  }

  private async timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export function createWorkflowExecutor(): DivinedWorkflowExecutor {
  return new DivinedWorkflowExecutor();
}
