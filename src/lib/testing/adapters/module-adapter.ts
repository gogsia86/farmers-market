/**
 * Module Adapter
 *
 * Converts new TestModule format (with suites/tests) to execute-based format
 * that the BotEngine expects. This allows us to use the new Playwright-style
 * test structure while maintaining compatibility with the existing engine.
 */

import { logger } from "../../monitoring/logger";
import type { ModuleExecutionContext } from "../core/bot-engine";
import type {
  BotModule,
  BotResult,
  TestContext,
  TestModule,
  TestResult,
} from "../types";

/**
 * Convert a TestModule (with suites) to a BotModule (with execute function)
 */
export function adaptTestModule(testModule: TestModule): BotModule {
  return {
    id: testModule.id,
    name: testModule.name,
    description: testModule.description,
    category: testModule.category,
    tags: testModule.tags || [],
    enabled: testModule.enabled !== false,
    timeout: testModule.timeout,
    retries: testModule.retries,
    dependencies: testModule.dependencies,
    priority: testModule.priority,

    async execute(context: ModuleExecutionContext): Promise<BotResult> {
      const startTime = Date.now();
      const results: TestResult[] = [];
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      const skippedTests = 0;

      try {
        // Get browser page
        const page = await context.browserManager.getPage();

        if (!page) {
          throw new Error("Browser page not available");
        }

        // Set base URL from config - ensure it's set
        const baseUrl = context.config.baseUrl || "http://localhost:3001";

        // Set base URL on page context for relative navigation
        page
          .context()
          .setDefaultNavigationTimeout(context.config.browser.timeout || 60000);

        // Execute each suite
        for (const suite of testModule.suites || []) {
          logger.info(`[${testModule.id}] Running suite: ${suite.name}`);

          // Execute setup if provided
          if (suite.setup) {
            await suite.setup(page);
          }

          // Execute each test in the suite
          for (const test of suite.tests) {
            totalTests++;
            const testStartTime = Date.now();

            try {
              logger.info(`[${testModule.id}] Running test: ${test.name}`);

              // Create test context with baseUrl
              const testContext: TestContext = {
                page,
                baseUrl,
                config: context.config,
                data: context.suiteContext || {},
              };

              // Monkey-patch page.goto to automatically prepend baseUrl for relative paths
              const originalGoto = page.goto.bind(page);
              page.goto = async (url: string, options?: any) => {
                const fullUrl = url.startsWith("http")
                  ? url
                  : `${baseUrl}${url}`;
                return originalGoto(fullUrl, options);
              };

              // Monkey-patch request.get to automatically prepend baseUrl for relative paths
              const originalGet = page.request.get.bind(page.request);
              page.request.get = async (url: string, options?: any) => {
                const fullUrl = url.startsWith("http")
                  ? url
                  : `${baseUrl}${url}`;
                return originalGet(fullUrl, options);
              };

              // Execute the test
              await test.run(page, testContext);

              const testDuration = Date.now() - testStartTime;
              passedTests++;

              results.push({
                testId: test.id,
                testName: test.name,
                status: "PASSED",
                duration: testDuration,
                timestamp: new Date().toISOString(),
              });

              logger.info(
                `[${testModule.id}] ✓ ${test.name} (${testDuration}ms)`,
              );
            } catch (error) {
              const testDuration = Date.now() - testStartTime;
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              failedTests++;

              results.push({
                testId: test.id,
                testName: test.name,
                status: "FAILED",
                error: errorMessage,
                duration: testDuration,
                timestamp: new Date().toISOString(),
              });

              logger.error(
                `[${testModule.id}] ✗ ${test.name} (${testDuration}ms)`,
                error as Error,
              );

              // Stop on failure if configured
              if (suite.stopOnFailure) {
                logger.warn(`[${testModule.id}] Stopping suite on failure`);
                break;
              }
            }
          }

          // Execute teardown if provided
          if (suite.teardown) {
            await suite.teardown(page);
          }
        }

        const duration = Date.now() - startTime;
        const successRate =
          totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

        // Return success result
        return {
          moduleId: testModule.id,
          moduleName: testModule.name,
          status: failedTests === 0 ? "success" : "failed",
          timestamp: new Date().toISOString(),
          duration,
          details: {
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            successRate: parseFloat(successRate.toFixed(2)),
            results,
          },
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        logger.error(
          `[${testModule.id}] Module execution failed:`,
          error as Error,
        );

        return {
          moduleId: testModule.id,
          moduleName: testModule.name,
          status: "failed",
          error: errorMessage,
          timestamp: new Date().toISOString(),
          duration,
          details: {
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            results,
          },
        };
      }
    },
  };
}

/**
 * Convert multiple TestModules to BotModules
 */
export function adaptTestModules(testModules: TestModule[]): BotModule[] {
  return testModules.map(adaptTestModule);
}

/**
 * Check if a module is already in BotModule format (has execute function)
 */
export function isBotModule(module: any): module is BotModule {
  return typeof module?.execute === "function";
}

/**
 * Check if a module is in TestModule format (has suites array)
 */
export function isTestModule(module: any): module is TestModule {
  return Array.isArray(module?.suites);
}

/**
 * Smart adapter that automatically detects format and converts if needed
 */
export function ensureBotModule(module: TestModule | BotModule): BotModule {
  if (isBotModule(module)) {
    return module;
  }

  if (isTestModule(module)) {
    return adaptTestModule(module);
  }

  throw new Error(`Invalid module format: ${(module as any)?.id || "unknown"}`);
}
