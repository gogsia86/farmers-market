/**
 * Bot Engine - Core Orchestration System
 *
 * Manages module registration, scheduling, execution, retries, and event emission.
 * This is the heart of the Unified Bot Framework.
 */

import { logger } from '../../monitoring/logger';
import type {
  BotConfig,
  BotEvent,
  BotModule,
  BotResult,
  EventType,
  ExecutionMode,
  TestSuite
} from '../types';
import { BrowserManager } from './browser-manager';

export interface BotEngineOptions {
  config: BotConfig;
  browserManager?: BrowserManager;
}

export interface ModuleExecutionContext {
  config: BotConfig;
  browserManager: BrowserManager;
  suiteContext?: Record<string, any>;
}

export class BotEngine {
  private config: BotConfig;
  private browserManager: BrowserManager;
  private modules: Map<string, BotModule> = new Map();
  private suites: Map<string, TestSuite> = new Map();
  private eventHandlers: Map<EventType, Array<(event: BotEvent) => void>> = new Map();
  private isRunning = false;
  private abortController?: AbortController;

  constructor(options: BotEngineOptions) {
    this.config = options.config;
    this.browserManager = options.browserManager ?? new BrowserManager(options.config);
    this.initializeEventHandlers();
  }

  /**
   * Initialize default event handlers
   */
  private initializeEventHandlers(): void {
    // Log all events if verbose
    if (this.config.verbose) {
      this.on('*', (event) => {
        logger.debug(`[BotEngine] Event: ${event.type}`, event.data);
      });
    }
  }

  /**
   * Register a bot module
   */
  registerModule(module: BotModule): void {
    if (this.modules.has(module.id)) {
      logger.warn(`[BotEngine] Module ${module.id} already registered, overwriting`);
    }

    this.modules.set(module.id, module);
    this.emit('module:registered', { moduleId: module.id, module });

    logger.info(`[BotEngine] Registered module: ${module.name} (${module.id})`);
  }

  /**
   * Register multiple modules
   */
  registerModules(modules: BotModule[]): void {
    modules.forEach(module => this.registerModule(module));
  }

  /**
   * Register a test suite
   */
  registerSuite(suite: TestSuite): void {
    if (this.suites.has(suite.id)) {
      logger.warn(`[BotEngine] Suite ${suite.id} already registered, overwriting`);
    }

    this.suites.set(suite.id, suite);
    this.emit('suite:registered', { suiteId: suite.id, suite });

    logger.info(`[BotEngine] Registered suite: ${suite.name} (${suite.id})`);
  }

  /**
   * Get registered module by ID
   */
  getModule(moduleId: string): BotModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get registered suite by ID
   */
  getSuite(suiteId: string): TestSuite | undefined {
    return this.suites.get(suiteId);
  }

  /**
   * List all registered modules
   */
  listModules(): BotModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * List all registered suites
   */
  listSuites(): TestSuite[] {
    return Array.from(this.suites.values());
  }

  /**
   * Execute a single module
   */
  async executeModule(
    moduleId: string,
    context?: Record<string, any>
  ): Promise<BotResult> {
    const module = this.modules.get(moduleId);

    if (!module) {
      const error = `Module ${moduleId} not found`;
      logger.error(`[BotEngine] ${error}`);
      return this.createErrorResult(moduleId, error);
    }

    return await this.executeModuleWithRetry(module, context);
  }

  /**
   * Execute a test suite
   */
  async executeSuite(
    suiteId: string,
    mode: ExecutionMode = 'sequential'
  ): Promise<BotResult[]> {
    const suite = this.suites.get(suiteId);

    if (!suite) {
      const error = `Suite ${suiteId} not found`;
      logger.error(`[BotEngine] ${error}`);
      return [this.createErrorResult(suiteId, error)];
    }

    this.emit('suite:started', { suiteId, suite });

    const results: BotResult[] = [];
    const suiteContext: Record<string, any> = {};
    const startTime = Date.now();

    try {
      // Execute setup if provided
      if (suite.setup) {
        await suite.setup(suiteContext);
        this.emit('suite:setup:complete', { suiteId });
      }

      // Execute modules based on mode
      if (mode === 'sequential') {
        for (const moduleId of suite.modules) {
          if (this.abortController?.signal.aborted) {
            logger.warn(`[BotEngine] Suite ${suiteId} aborted`);
            break;
          }

          const result = await this.executeModule(moduleId, suiteContext);
          results.push(result);

          // Stop on critical failure if configured
          if (result.status === 'failed' && suite.stopOnFailure) {
            logger.warn(`[BotEngine] Suite ${suiteId} stopping on failure`);
            break;
          }
        }
      } else if (mode === 'parallel') {
        const promises = suite.modules.map(moduleId =>
          this.executeModule(moduleId, suiteContext)
        );
        const parallelResults = await Promise.allSettled(promises);

        parallelResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push(
              this.createErrorResult(
                suite.modules[index],
                result.reason?.message || 'Unknown error'
              )
            );
          }
        });
      } else if (mode === 'limited-parallel') {
        // Execute with concurrency limit
        const concurrency = this.config.maxConcurrency || 3;
        results.push(...await this.executeWithConcurrencyLimit(suite.modules, concurrency, suiteContext));
      }

      // Execute teardown if provided
      if (suite.teardown) {
        await suite.teardown(suiteContext);
        this.emit('suite:teardown:complete', { suiteId });
      }

      const duration = Date.now() - startTime;
      this.emit('suite:completed', { suiteId, results, duration });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`[BotEngine] Suite ${suiteId} failed:`, error as Error);
      this.emit('suite:failed', { suiteId, error: errorMessage, duration });

      return [this.createErrorResult(suiteId, errorMessage)];
    }
  }

  /**
   * Execute modules with concurrency limit
   */
  private async executeWithConcurrencyLimit(
    moduleIds: string[],
    concurrency: number,
    context?: Record<string, any>
  ): Promise<BotResult[]> {
    const results: BotResult[] = [];
    const queue = [...moduleIds];
    const executing: Promise<void>[] = [];

    while (queue.length > 0 || executing.length > 0) {
      // Start new tasks up to concurrency limit
      while (executing.length < concurrency && queue.length > 0) {
        const moduleId = queue.shift()!;

        const promise = this.executeModule(moduleId, context)
          .then(result => {
            results.push(result);
          })
          .finally(() => {
            const index = executing.indexOf(promise);
            if (index > -1) {
              executing.splice(index, 1);
            }
          });

        executing.push(promise);
      }

      // Wait for at least one to complete
      if (executing.length > 0) {
        await Promise.race(executing);
      }
    }

    return results;
  }

  /**
   * Execute module with retry logic
   */
  private async executeModuleWithRetry(
    module: BotModule,
    context?: Record<string, any>
  ): Promise<BotResult> {
    const maxRetries = module.retryOnFailure !== false ? (this.config.retryAttempts || 2) : 0;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        logger.info(`[BotEngine] Retrying module ${module.id} (attempt ${attempt}/${maxRetries})`);
        this.emit('module:retry', { moduleId: module.id, attempt, maxRetries });

        // Wait before retry
        await this.sleep(this.config.retryDelay || 1000);
      }

      try {
        const result = await this.executeModuleOnce(module, context);

        // If successful or skipped, return immediately
        if (result.status === 'success' || result.status === 'skipped') {
          return result;
        }

        // If failed, continue to retry (unless it's the last attempt)
        lastError = new Error(result.error || 'Module failed');

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.error(`[BotEngine] Module ${module.id} threw error:`, error as Error);
      }
    }

    // All retries exhausted
    return this.createErrorResult(
      module.id,
      lastError?.message || 'Module failed after retries'
    );
  }

  /**
   * Execute module once (single attempt)
   */
  private async executeModuleOnce(
    module: BotModule,
    context?: Record<string, any>
  ): Promise<BotResult> {
    const startTime = Date.now();

    this.emit('module:started', { moduleId: module.id, module });

    try {
      // Check if module should be skipped
      if (module.enabled === false) {
        logger.info(`[BotEngine] Module ${module.id} is disabled, skipping`);
        return {
          moduleId: module.id,
          moduleName: module.name,
          status: 'skipped',
          timestamp: new Date().toISOString(),
          duration: 0
        };
      }

      // Initialize browser if needed
      if (!this.browserManager.isInitialized()) {
        await this.browserManager.initialize();
      }

      // Execute the module
      const executionContext: ModuleExecutionContext = {
        config: this.config,
        browserManager: this.browserManager,
        suiteContext: context
      };

      const result = await module.execute(executionContext);

      const duration = Date.now() - startTime;

      // Enhance result with timing
      const enhancedResult: BotResult = {
        ...result,
        moduleId: module.id,
        moduleName: module.name,
        timestamp: new Date().toISOString(),
        duration
      };

      this.emit('module:completed', { moduleId: module.id, result: enhancedResult });

      return enhancedResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`[BotEngine] Module ${module.id} failed:`, error as Error);

      const result: BotResult = {
        moduleId: module.id,
        moduleName: module.name,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        duration
      };

      this.emit('module:failed', { moduleId: module.id, result, error });

      return result;
    }
  }

  /**
   * Start continuous monitoring mode
   */
  async startMonitoring(
    suiteId: string,
    intervalSeconds: number = 60
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Monitoring is already running');
    }

    const suite = this.suites.get(suiteId);
    if (!suite) {
      throw new Error(`Suite ${suiteId} not found`);
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    logger.info(`[BotEngine] Starting monitoring: ${suite.name} (interval: ${intervalSeconds}s)`);
    this.emit('monitoring:started', { suiteId, interval: intervalSeconds });

    while (this.isRunning && !this.abortController.signal.aborted) {
      try {
        const results = await this.executeSuite(suiteId, 'sequential');

        this.emit('monitoring:cycle:completed', { suiteId, results });

        // Check if any critical failures
        const hasFailures = results.some(r => r.status === 'failed');
        if (hasFailures) {
          this.emit('monitoring:failures:detected', { suiteId, results });
        }

      } catch (error) {
        logger.error('[BotEngine] Monitoring cycle failed:', error as Error);
        this.emit('monitoring:cycle:failed', { suiteId, error });
      }

      // Wait for next interval
      await this.sleep(intervalSeconds * 1000);
    }

    this.emit('monitoring:stopped', { suiteId });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isRunning) {
      return;
    }

    logger.info('[BotEngine] Stopping monitoring');
    this.isRunning = false;
    this.abortController?.abort();
  }

  /**
   * Register event handler
   */
  on(eventType: EventType | '*', handler: (event: BotEvent) => void): void {
    const type = eventType as EventType;

    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }

    this.eventHandlers.get(type)!.push(handler);
  }

  /**
   * Emit event
   */
  private emit(type: EventType, data?: any): void {
    const event: BotEvent = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    // Emit to specific handlers
    const handlers = this.eventHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        logger.error(`[BotEngine] Event handler error for ${type}:`, error as Error);
      }
    });

    // Emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*' as EventType) || [];
    wildcardHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        logger.error(`[BotEngine] Wildcard event handler error:`, error as Error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.info('[BotEngine] Cleaning up resources');

    this.stopMonitoring();

    if (this.browserManager.isInitialized()) {
      await this.browserManager.cleanup();
    }

    this.modules.clear();
    this.suites.clear();
    this.eventHandlers.clear();

    this.emit('engine:cleanup:complete', {});
  }

  /**
   * Create an error result
   */
  private createErrorResult(moduleId: string, error: string): BotResult {
    return {
      moduleId,
      moduleName: moduleId,
      status: 'failed',
      error,
      timestamp: new Date().toISOString(),
      duration: 0
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get engine status
   */
  getStatus(): {
    isRunning: boolean;
    modulesCount: number;
    suitesCount: number;
    config: BotConfig;
  } {
    return {
      isRunning: this.isRunning,
      modulesCount: this.modules.size,
      suitesCount: this.suites.size,
      config: this.config
    };
  }
}

/**
 * Create a bot engine instance with default configuration
 */
export function createBotEngine(config: BotConfig): BotEngine {
  return new BotEngine({ config });
}

/**
 * Helper to create a simple bot module
 */
export function createModule(
  id: string,
  name: string,
  execute: (context: ModuleExecutionContext) => Promise<BotResult>,
  options?: Partial<BotModule>
): BotModule {
  return {
    id,
    name,
    execute,
    category: options?.category || 'general',
    description: options?.description || `${name} test module`,
    tags: options?.tags || [],
    enabled: options?.enabled !== false,
    retryOnFailure: options?.retryOnFailure !== false,
    timeout: options?.timeout || 30000
  };
}

/**
 * Helper to create a test suite
 */
export function createSuite(
  id: string,
  name: string,
  modules: string[],
  options?: Partial<TestSuite>
): TestSuite {
  return {
    id,
    name,
    modules,
    description: options?.description || `${name} test suite`,
    tags: options?.tags || [],
    enabled: options?.enabled !== false,
    stopOnFailure: options?.stopOnFailure || false,
    setup: options?.setup,
    teardown: options?.teardown
  };
}
