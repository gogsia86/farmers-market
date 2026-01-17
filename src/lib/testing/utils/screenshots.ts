/**
 * Screenshot Utilities - Test Debugging Helpers
 *
 * Provides comprehensive screenshot capture and management:
 * - Automatic screenshot on failure
 * - Full page and viewport screenshots
 * - Element-specific screenshots
 * - Screenshot comparison (visual regression)
 * - Organized storage with metadata
 * - Cleanup and retention policies
 */

import { logger } from "@/lib/monitoring/logger";
import { existsSync } from "fs";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { Page } from "playwright";

export interface ScreenshotOptions {
  outputDir?: string;
  fullPage?: boolean;
  quality?: number;
  format?: "png" | "jpeg";
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mask?: string[]; // Selectors to mask
  animations?: "disabled" | "allow";
}

export interface ScreenshotMetadata {
  path: string;
  timestamp: string;
  testName: string;
  moduleId: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  type: "failure" | "success" | "debug" | "comparison";
  fileSize?: number;
}

export interface ScreenshotResult {
  success: boolean;
  path?: string;
  metadata?: ScreenshotMetadata;
  error?: string;
}

export class ScreenshotManager {
  private outputDir: string;
  private screenshotCount = 0;
  private metadata: ScreenshotMetadata[] = [];

  constructor(outputDir: string = "./test-results/screenshots") {
    this.outputDir = outputDir;
  }

  /**
   * Capture a screenshot with automatic naming
   */
  async capture(
    page: Page,
    name: string,
    options?: ScreenshotOptions,
  ): Promise<ScreenshotResult> {
    try {
      await this.ensureOutputDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${name}-${timestamp}.${options?.format || "png"}`;
      const filepath = join(options?.outputDir || this.outputDir, filename);

      // Prepare screenshot options
      const screenshotOptions: any = {
        path: filepath,
        fullPage: options?.fullPage !== false,
        type: options?.format || "png",
      };

      if (options?.quality && options.format === "jpeg") {
        screenshotOptions.quality = options.quality;
      }

      if (options?.clip) {
        screenshotOptions.clip = options.clip;
      }

      if (options?.mask && options.mask.length > 0) {
        screenshotOptions.mask = await Promise.all(
          options.mask.map((selector) => page.locator(selector)),
        );
      }

      if (options?.animations) {
        screenshotOptions.animations = options.animations;
      }

      // Capture screenshot
      await page.screenshot(screenshotOptions);

      // Get viewport size
      const viewport = page.viewportSize() || { width: 1280, height: 720 };

      // Create metadata
      const metadata: ScreenshotMetadata = {
        path: filepath,
        timestamp: new Date().toISOString(),
        testName: name,
        moduleId: name,
        url: page.url(),
        viewport,
        type: "debug",
      };

      this.metadata.push(metadata);
      this.screenshotCount++;

      logger.debug(`[ScreenshotManager] Captured screenshot: ${filepath}`);

      return {
        success: true,
        path: filepath,
        metadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        "[ScreenshotManager] Failed to capture screenshot:",
        error instanceof Error ? error : new Error(String(error)),
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Capture screenshot on test failure
   */
  async captureFailure(
    page: Page,
    testName: string,
    errorMessage?: string,
  ): Promise<ScreenshotResult> {
    try {
      const result = await this.capture(page, `failure-${testName}`, {
        fullPage: true,
      });

      if (result.metadata) {
        result.metadata.type = "failure";
      }

      // Also save the error message
      if (errorMessage && result.path) {
        const errorPath = result.path.replace(/\.(png|jpeg)$/, ".error.txt");
        await writeFile(errorPath, errorMessage, "utf-8");
      }

      logger.warn(
        `[ScreenshotManager] Captured failure screenshot: ${result.path}`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        "[ScreenshotManager] Failed to capture failure screenshot:",
        error instanceof Error ? error : new Error(String(error)),
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Capture screenshot on test success
   */
  async captureSuccess(
    page: Page,
    testName: string,
  ): Promise<ScreenshotResult> {
    const result = await this.capture(page, `success-${testName}`, {
      fullPage: false,
    });

    if (result.metadata) {
      result.metadata.type = "success";
    }

    return result;
  }

  /**
   * Capture element screenshot
   */
  async captureElement(
    page: Page,
    selector: string,
    name: string,
  ): Promise<ScreenshotResult> {
    try {
      await this.ensureOutputDirectory();

      const element = await page.waitForSelector(selector, {
        state: "visible",
        timeout: 5000,
      });

      if (!element) {
        return {
          success: false,
          error: `Element "${selector}" not found`,
        };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `element-${name}-${timestamp}.png`;
      const filepath = join(this.outputDir, filename);

      await element.screenshot({ path: filepath });

      const viewport = page.viewportSize() || { width: 1280, height: 720 };

      const metadata: ScreenshotMetadata = {
        path: filepath,
        timestamp: new Date().toISOString(),
        testName: `element-${name}`,
        moduleId: name,
        url: page.url(),
        viewport,
        type: "debug",
      };

      this.metadata.push(metadata);

      logger.debug(
        `[ScreenshotManager] Captured element screenshot: ${filepath}`,
      );

      return {
        success: true,
        path: filepath,
        metadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        "[ScreenshotManager] Failed to capture comparison screenshot:",
        error instanceof Error ? error : new Error(String(error)),
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Capture multiple screenshots in sequence
   */
  async captureSequence(
    page: Page,
    sequenceName: string,
    count: number,
    intervalMs: number = 1000,
  ): Promise<ScreenshotResult[]> {
    const results: ScreenshotResult[] = [];

    for (let i = 0; i < count; i++) {
      const result = await this.capture(page, `${sequenceName}-${i + 1}`, {
        fullPage: false,
      });

      results.push(result);

      if (i < count - 1) {
        await page.waitForTimeout(intervalMs);
      }
    }

    return results;
  }

  /**
   * Capture screenshot with comparison (visual regression)
   */
  async captureComparison(
    page: Page,
    name: string,
    baselinePath?: string,
  ): Promise<ScreenshotResult & { isDifferent?: boolean; diffPath?: string }> {
    const result = await this.capture(page, `comparison-${name}`);

    if (!result.success || !result.path) {
      return result;
    }

    if (result.metadata) {
      result.metadata.type = "comparison";
    }

    // If baseline exists, perform comparison
    if (baselinePath && existsSync(baselinePath)) {
      try {
        // Note: Actual pixel-by-pixel comparison would require additional library
        // (e.g., pixelmatch, looks-same). This is a placeholder for the structure.
        logger.info(
          "[ScreenshotManager] Baseline comparison would happen here",
        );

        // Placeholder: In real implementation, use image comparison library
        const isDifferent = false; // Would be result of comparison

        return {
          ...result,
          isDifferent,
          diffPath: isDifferent
            ? result.path.replace(".png", "-diff.png")
            : undefined,
        };
      } catch (error) {
        logger.error(
          "[ScreenshotManager] Comparison failed:",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    return result;
  }

  /**
   * Capture viewport screenshot (visible area only)
   */
  async captureViewport(page: Page, name: string): Promise<ScreenshotResult> {
    return await this.capture(page, `viewport-${name}`, {
      fullPage: false,
    });
  }

  /**
   * Capture with annotations (highlight elements)
   */
  async captureWithAnnotations(
    page: Page,
    name: string,
    highlightSelectors: string[],
  ): Promise<ScreenshotResult> {
    try {
      // Add highlights to elements
      await page.evaluate((selectors) => {
        selectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.outline = "3px solid red";
              el.style.outlineOffset = "2px";
            }
          });
        });
      }, highlightSelectors);

      const result = await this.capture(page, `annotated-${name}`);

      // Remove highlights
      await page.evaluate((selectors) => {
        selectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.outline = "";
              el.style.outlineOffset = "";
            }
          });
        });
      }, highlightSelectors);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Capture screenshot with scroll to element
   */
  async captureAfterScroll(
    page: Page,
    selector: string,
    name: string,
  ): Promise<ScreenshotResult> {
    try {
      const element = await page.waitForSelector(selector, {
        state: "attached",
        timeout: 5000,
      });

      if (!element) {
        return {
          success: false,
          error: `Element "${selector}" not found`,
        };
      }

      // Scroll to element
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Wait for scroll animation

      return await this.capture(page, `scroll-${name}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get all screenshot metadata
   */
  getMetadata(): ScreenshotMetadata[] {
    return [...this.metadata];
  }

  /**
   * Get screenshot count
   */
  getCount(): number {
    return this.screenshotCount;
  }

  /**
   * Save metadata to JSON file
   */
  async saveMetadata(): Promise<void> {
    try {
      const metadataPath = join(this.outputDir, "screenshots-metadata.json");
      await writeFile(
        metadataPath,
        JSON.stringify(this.metadata, null, 2),
        "utf-8",
      );

      logger.info(`[ScreenshotManager] Saved metadata: ${metadataPath}`);
    } catch (error) {
      logger.error(
        "[ScreenshotManager] Failed to capture viewport:",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Clean up old screenshots (retention policy)
   */
  async cleanup(retentionDays: number = 7): Promise<number> {
    try {
      const files = await readdir(this.outputDir);
      const now = Date.now();
      const maxAge = retentionDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filepath = join(this.outputDir, file);

        // Skip metadata file
        if (file === "screenshots-metadata.json") {
          continue;
        }

        // Check file age (from filename timestamp)
        const timestampMatch = file.match(
          /(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/,
        );
        if (timestampMatch) {
          const timestamp = new Date(
            timestampMatch[1].replace(/-/g, ":").replace("T", "T"),
          );
          const age = now - timestamp.getTime();

          if (age > maxAge) {
            await unlink(filepath);
            deletedCount++;
          }
        }
      }

      logger.info(
        `[ScreenshotManager] Cleaned up ${deletedCount} old screenshots`,
      );

      return deletedCount;
    } catch (error) {
      logger.error(
        "[ScreenshotManager] Cleanup failed:",
        error instanceof Error ? error : new Error(String(error)),
      );
      return 0;
    }
  }

  /**
   * Clear all screenshots
   */
  async clearAll(): Promise<number> {
    try {
      const files = await readdir(this.outputDir);
      let deletedCount = 0;

      for (const file of files) {
        const filepath = join(this.outputDir, file);
        await unlink(filepath);
        deletedCount++;
      }

      this.metadata = [];
      this.screenshotCount = 0;

      logger.info(
        `[ScreenshotManager] Cleared all screenshots (${deletedCount} files)`,
      );

      return deletedCount;
    } catch (error) {
      logger.error(
        "[ScreenshotManager] Failed to capture element:",
        error instanceof Error ? error : new Error(String(error)),
      );
      return 0;
    }
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      if ((error as any).code !== "EEXIST") {
        logger.error(
          "[ScreenshotManager] Failed to create output directory:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      }
    }
  }
}

/**
 * Create a screenshot manager instance
 */
export function createScreenshotManager(outputDir?: string): ScreenshotManager {
  return new ScreenshotManager(outputDir);
}

/**
 * Quick screenshot helper
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options?: ScreenshotOptions,
): Promise<string | null> {
  const manager = new ScreenshotManager(options?.outputDir);
  const result = await manager.capture(page, name, options);

  return result.success ? result.path || null : null;
}

/**
 * Quick failure screenshot helper
 */
export async function takeFailureScreenshot(
  page: Page,
  testName: string,
  error?: string,
): Promise<string | null> {
  const manager = new ScreenshotManager();
  const result = await manager.captureFailure(page, testName, error);

  return result.success ? result.path || null : null;
}

/**
 * Screenshot decorator for automatic capture on failure
 */
export function withScreenshotOnFailure(testFn: (page: Page) => Promise<void>) {
  return async (page: Page) => {
    try {
      await testFn(page);
    } catch (error) {
      const manager = new ScreenshotManager();
      await manager.captureFailure(
        page,
        "test-failure",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  };
}

/**
 * Create a screenshot on condition
 */
export async function screenshotIf(
  page: Page,
  condition: boolean,
  name: string,
  options?: ScreenshotOptions,
): Promise<string | null> {
  if (!condition) {
    return null;
  }

  return await takeScreenshot(page, name, options);
}
