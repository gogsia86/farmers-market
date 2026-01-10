/**
 * Test Runner - Execution Engine for Test Modules
 *
 * Handles test execution with multiple modes:
 * - Single module execution
 * - Suite execution (sequential, parallel, limited-parallel)
 * - Continuous monitoring
 * - Watch mode
 * - Filtering and selection
 */

import { logger } from '@/lib/monitoring/logger';
import type {
  BotConfig,
  BotModule,
  BotResult,
  ExecutionMode,
  TestSuite
} from '../types';
import { BotEngine } from './bot-engine';
import { BrowserManager } from './browser-manager';

export interface TestRunnerOptions {
  config: BotConfig;
  filter?: TestFilter;
  mode?: ExecutionMode;
  continueOnFailure?: boolean;
}

export interface TestFilter {
  moduleIds?: string[];
  suiteIds?: string[];
  tags?: string[];
  categories?: string[];
  exclude?: {
    moduleIds?: string[];
    suiteIds?: string[];
    tags?: string[];
  };
}

export interface TestRunReport {
  summary: TestSummary;
  results: BotResult[];
  startTime: string;
  endTime: string;
  duration: number;
  config: BotConfig;
  filter?: TestFilter;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  successRate: number;
  avgDuration: number;
  totalDuration: number;
}

export class TestRunner {
  private engine: BotEngine;
  private config: BotConfig;
  private browserManager: BrowserManager;
  private isRunning = false;
  private currentRun?: TestRunReport;

  constructor(options: TestRunnerOptions) {
    this.config = options.config;
    this.browserManager = new BrowserManager(this.config);
    this.engine = new BotEngine({
      config: this.config,
      browserManager: this.browserManager
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for logging and tracking
   */
  private setupEventHandlers(): void {
    // Log suite progress
    this.engine.on('suite:started', (event) => {
      logger.info(`[TestRunner] Suite started: ${event.data.suite.name}`);
    });

    this.engine.on('suite:completed', (event) => {
      const { suiteId, results, duration } = event.data;
      const passed = results.filter((r: BotResult) => r.status === 'success').length;
      const failed = results.filter((r: BotResult) => r.status === 'failed').length;

      logger.info(
        `[TestRunner] Suite completed: ${suiteId} (${passed} passed, ${failed} failed, ${duration}ms)`
      );
    });

    // Log module progress
    this.engine.on('module:started', (event) => {
      logger.info(`[TestRunner] Module started: ${event.data.module.name}`);
    });

    this.engine.on('module:completed', (event) => {
      const { result } = event.data;
      const status = result.status === 'success' ? '✓' : result.status === 'failed' ? '✗' : '○';
      logger.info(
        `[TestRunner] ${status} ${result.moduleName} (${result.duration}ms)`
      );
    });

    this.engine.on('module:failed', (event) => {
      const { result } = event.data;
      logger.error(`[TestRunner] Module failed: ${result.moduleName}`, {
        error: result.error,
        duration: result.duration
      });
    });

    this.engine.on('module:retry', (event) => {
      const { moduleId, attempt, maxRetries } = event.data;
      logger.warn(`[TestRunner] Retrying ${moduleId} (${attempt}/${maxRetries})`);
    });
  }

  /**
   * Register modules with the engine
   */
  registerModules(modules: BotModule[]): void {
    this.engine.registerModules(modules);
  }

  /**
   * Register suites with the engine
   */
  registerSuites(suites: TestSuite[]): void {
    suites.forEach(suite => this.engine.registerSuite(suite));
  }

  /**
   * Run a single module
   */
  async runModule(moduleId: string): Promise<TestRunReport> {
    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    this.isRunning = true;

    try {
      logger.info(`[TestRunner] Running single module: ${moduleId}`);

      const result = await this.engine.executeModule(moduleId);
      const results = [result];

      const endTime = new Date().toISOString();
      const duration = Date.now() - startTimestamp;

      const report = this.createReport(results, startTime, endTime, duration);
      this.currentRun = report;

      return report;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run a test suite
   */
  async runSuite(
    suiteId: string,
    mode: ExecutionMode = 'sequential'
  ): Promise<TestRunReport> {
    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    this.isRunning = true;

    try {
      logger.info(`[TestRunner] Running suite: ${suiteId} (mode: ${mode})`);

      const results = await this.engine.executeSuite(suiteId, mode);

      const endTime = new Date().toISOString();
      const duration = Date.now() - startTimestamp;

      const report = this.createReport(results, startTime, endTime, duration);
      this.currentRun = report;

      return report;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run multiple suites
   */
  async runSuites(
    suiteIds: string[],
    mode: ExecutionMode = 'sequential'
  ): Promise<TestRunReport> {
    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    this.isRunning = true;

    try {
      logger.info(`[TestRunner] Running ${suiteIds.length} suites`);

      const allResults: BotResult[] = [];

      for (const suiteId of suiteIds) {
        const results = await this.engine.executeSuite(suiteId, mode);
        allResults.push(...results);
      }

      const endTime = new Date().toISOString();
      const duration = Date.now() - startTimestamp;

      const report = this.createReport(allResults, startTime, endTime, duration);
      this.currentRun = report;

      return report;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run all registered modules matching filter
   */
  async runAll(filter?: TestFilter): Promise<TestRunReport> {
    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    this.isRunning = true;

    try {
      const modules = this.getFilteredModules(filter);

      logger.info(`[TestRunner] Running ${modules.length} modules`);

      const results: BotResult[] = [];

      for (const module of modules) {
        const result = await this.engine.executeModule(module.id);
        results.push(result);

        // Check if we should continue on failure
        if (result.status === 'failed' && !this.config.continueOnFailure) {
          logger.warn('[TestRunner] Stopping execution due to failure');
          break;
        }
      }

      const endTime = new Date().toISOString();
      const duration = Date.now() - startTimestamp;

      const report = this.createReport(results, startTime, endTime, duration, filter);
      this.currentRun = report;

      return report;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run specific modules by IDs
   */
  async runModules(moduleIds: string[]): Promise<TestRunReport> {
    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    this.isRunning = true;

    try {
      logger.info(`[TestRunner] Running ${moduleIds.length} modules`);

      const results: BotResult[] = [];

      for (const moduleId of moduleIds) {
        const result = await this.engine.executeModule(moduleId);
        results.push(result);
      }

      const endTime = new Date().toISOString();
      const duration = Date.now() - startTimestamp;

      const report = this.createReport(results, startTime, endTime, duration);
      this.currentRun = report;

      return report;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start continuous monitoring mode
   */
  async startMonitoring(
    suiteId: string,
    intervalSeconds: number = 60
  ): Promise<void> {
    logger.info(`[TestRunner] Starting monitoring mode for suite: ${suiteId}`);

    // Setup monitoring event handlers
    this.engine.on('monitoring:cycle:completed', (event) => {
      const { results } = event.data;
      logger.info('[TestRunner] Monitoring cycle completed');
      this.logSummary(this.calculateSummary(results));
    });

    this.engine.on('monitoring:failures:detected', (event) => {
      const { results } = event.data;
      const failures = results.filter((r: BotResult) => r.status === 'failed');
      logger.error(`[TestRunner] Monitoring detected ${failures.length} failures`);

      failures.forEach((failure: BotResult) => {
        logger.error(`  - ${failure.moduleName}: ${failure.error}`);
      });
    });

    await this.engine.startMonitoring(suiteId, intervalSeconds);
  }

  /**
   * Stop monitoring mode
   */
  stopMonitoring(): void {
    logger.info('[TestRunner] Stopping monitoring mode');
    this.engine.stopMonitoring();
  }

  /**
   * Get filtered modules based on filter criteria
   */
  private getFilteredModules(filter?: TestFilter): BotModule[] {
    let modules = this.engine.listModules();

    if (!filter) {
      return modules;
    }

    // Filter by module IDs
    if (filter.moduleIds && filter.moduleIds.length > 0) {
      modules = modules.filter(m => filter.moduleIds!.includes(m.id));
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      modules = modules.filter(m =>
        m.tags.some(tag => filter.tags!.includes(tag))
      );
    }

    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      modules = modules.filter(m =>
        filter.categories!.includes(m.category)
      );
    }

    // Exclude by module IDs
    if (filter.exclude?.moduleIds && filter.exclude.moduleIds.length > 0) {
      modules = modules.filter(m => !filter.exclude!.moduleIds!.includes(m.id));
    }

    // Exclude by tags
    if (filter.exclude?.tags && filter.exclude.tags.length > 0) {
      modules = modules.filter(m =>
        !m.tags.some(tag => filter.exclude!.tags!.includes(tag))
      );
    }

    return modules;
  }

  /**
   * Create test run report
   */
  private createReport(
    results: BotResult[],
    startTime: string,
    endTime: string,
    duration: number,
    filter?: TestFilter
  ): TestRunReport {
    const summary = this.calculateSummary(results);

    return {
      summary,
      results,
      startTime,
      endTime,
      duration,
      config: this.config,
      filter
    };
  }

  /**
   * Calculate test summary
   */
  private calculateSummary(results: BotResult[]): TestSummary {
    const total = results.length;
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    const successRate = total > 0 ? (passed / total) * 100 : 0;

    const totalDuration = results.reduce((sum: any, r: any) => sum + r.duration, 0);
    const avgDuration = total > 0 ? totalDuration / total : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      successRate,
      avgDuration,
      totalDuration
    };
  }

  /**
   * Log summary to console
   */
  private logSummary(summary: TestSummary): void {
    logger.info('[TestRunner] Summary:', {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
      successRate: `${summary.successRate.toFixed(2)}%`,
      avgDuration: `${summary.avgDuration.toFixed(0)}ms`,
      totalDuration: `${summary.totalDuration.toFixed(0)}ms`
    });
  }

  /**
   * Get current run report
   */
  getCurrentRun(): TestRunReport | undefined {
    return this.currentRun;
  }

  /**
   * Check if runner is currently executing
   */
  isExecuting(): boolean {
    return this.isRunning;
  }

  /**
   * Get engine status
   */
  getStatus() {
    return this.engine.getStatus();
  }

  /**
   * List all registered modules
   */
  listModules(): BotModule[] {
    return this.engine.listModules();
  }

  /**
   * List all registered suites
   */
  listSuites(): TestSuite[] {
    return this.engine.listSuites();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.info('[TestRunner] Cleaning up resources');

    this.stopMonitoring();
    await this.engine.cleanup();

    this.isRunning = false;
    this.currentRun = undefined;
  }
}

/**
 * Create a test runner instance
 */
export function createTestRunner(config: BotConfig, filter?: TestFilter): TestRunner {
  return new TestRunner({ config, filter });
}

/**
 * Helper to run a quick test
 */
export async function quickTest(
  moduleId: string,
  config: BotConfig
): Promise<TestRunReport> {
  const runner = createTestRunner(config);

  try {
    return await runner.runModule(moduleId);
  } finally {
    await runner.cleanup();
  }
}

/**
 * Helper to run a suite with cleanup
 */
export async function runSuiteWithCleanup(
  suiteId: string,
  config: BotConfig,
  mode: ExecutionMode = 'sequential'
): Promise<TestRunReport> {
  const runner = createTestRunner(config);

  try {
    return await runner.runSuite(suiteId, mode);
  } finally {
    await runner.cleanup();
  }
}
