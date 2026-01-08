/**
 * 🌐 Browser Manager
 * Unified Bot Framework - Playwright Browser Management
 *
 * Handles browser lifecycle, context management, and page utilities
 */

import { Browser, BrowserContext, chromium, Page } from 'playwright';
import type { BotConfig } from '../types';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      console.warn('⚠️  Browser already initialized');
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: this.config.browser.headless,
        slowMo: this.config.browser.slowMo,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
        ],
      });

      this.context = await this.browser.newContext({
        viewport: this.config.browser.viewport,
        userAgent:
          this.config.browser.userAgent ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/Los_Angeles',
        permissions: [],
        recordVideo: this.config.reporting.saveTraces
          ? { dir: `${this.config.reporting.outputDir}/videos` }
          : undefined,
      });

      // Enable tracing if configured
      if (this.config.reporting.saveTraces) {
        await this.context.tracing.start({
          screenshots: true,
          snapshots: true,
          sources: true,
        });
      }

      this.page = await this.context.newPage();

      // Set default timeout
      this.page.setDefaultTimeout(this.config.browser.timeout);
      this.page.setDefaultNavigationTimeout(this.config.browser.timeout);

      // Add console message handler for debugging
      if (this.config.logging.level === 'debug') {
        this.page.on('console', (msg) => {
          const type = msg.type();
          if (type === 'error' || type === 'warning') {
            console.log(`[Browser ${type}]: ${msg.text()}`);
          }
        });

        this.page.on('pageerror', (error) => {
          console.error('[Browser Page Error]:', error.message);
        });
      }

      this.config.logging.console &&
        console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    }
  }

  /**
   * Get browser instance
   */
  getBrowser(): Browser {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }
    return this.browser;
  }

  /**
   * Get browser context
   */
  getContext(): BrowserContext {
    if (!this.context) {
      throw new Error(
        'Browser context not initialized. Call initialize() first.',
      );
    }
    return this.context;
  }

  /**
   * Get current page
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }
    return this.page;
  }

  /**
   * Create a new page in the current context
   */
  async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error(
        'Browser context not initialized. Call initialize() first.',
      );
    }

    const page = await this.context.newPage();
    page.setDefaultTimeout(this.config.browser.timeout);
    page.setDefaultNavigationTimeout(this.config.browser.timeout);

    return page;
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    const page = this.getPage();

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;

      await page.goto(fullUrl, {
        waitUntil: options?.waitUntil || 'networkidle',
        timeout: this.config.browser.timeout,
      });

      this.config.logging.level === 'debug' &&
        console.log(`📍 Navigated to: ${fullUrl}`);
    } catch (error) {
      console.error(`❌ Failed to navigate to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(options?: { timeout?: number }): Promise<void> {
    const page = this.getPage();

    try {
      await page.waitForLoadState('networkidle', {
        timeout: options?.timeout || this.config.browser.timeout,
      });
    } catch (error) {
      console.error('❌ Navigation timeout:', error);
      throw error;
    }
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string, options?: { fullPage?: boolean }): Promise<string> {
    const page = this.getPage();

    try {
      const timestamp = Date.now();
      const filename = `${name}-${timestamp}.png`;
      const filepath = `${this.config.reporting.outputDir}/screenshots/${filename}`;

      await page.screenshot({
        path: filepath,
        fullPage: options?.fullPage ?? this.config.reporting.fullPageScreenshot,
      });

      this.config.logging.level === 'debug' &&
        console.log(`📸 Screenshot saved: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error(`❌ Failed to take screenshot ${name}:`, error);
      throw error;
    }
  }

  /**
   * Fill a form field
   */
  async fillForm(selector: string, value: string): Promise<void> {
    const page = this.getPage();

    try {
      await page.waitForSelector(selector, {
        state: 'visible',
        timeout: this.config.browser.timeout,
      });

      await page.fill(selector, value);

      this.config.logging.level === 'debug' &&
        console.log(`✍️  Filled field ${selector}: ${value.substring(0, 20)}...`);
    } catch (error) {
      console.error(`❌ Failed to fill field ${selector}:`, error);
      throw error;
    }
  }

  /**
   * Click an element and wait for navigation
   */
  async clickAndWait(selector: string, options?: { waitForNavigation?: boolean; timeout?: number }): Promise<void> {
    const page = this.getPage();

    try {
      await page.waitForSelector(selector, {
        state: 'visible',
        timeout: options?.timeout || this.config.browser.timeout,
      });

      if (options?.waitForNavigation) {
        await Promise.all([
          page.waitForLoadState('networkidle'),
          page.click(selector),
        ]);
      } else {
        await page.click(selector);
        await page.waitForTimeout(500); // Brief pause for UI updates
      }

      this.config.logging.level === 'debug' &&
        console.log(`🖱️  Clicked: ${selector}`);
    } catch (error) {
      console.error(`❌ Failed to click ${selector}:`, error);
      throw error;
    }
  }

  /**
   * Wait for a selector to appear
   */
  async waitForSelector(
    selector: string,
    options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }
  ): Promise<void> {
    const page = this.getPage();

    try {
      await page.waitForSelector(selector, {
        state: options?.state || 'visible',
        timeout: options?.timeout || this.config.browser.timeout,
      });
    } catch (error) {
      console.error(`❌ Selector not found: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string, timeout: number = 5000): Promise<boolean> {
    const page = this.getPage();

    try {
      await page.waitForSelector(selector, {
        state: 'attached',
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   */
  async getTextContent(selector: string): Promise<string | null> {
    const page = this.getPage();

    try {
      return await page.textContent(selector);
    } catch (error) {
      console.error(`❌ Failed to get text content from ${selector}:`, error);
      return null;
    }
  }

  /**
   * Get element attribute
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const page = this.getPage();

    try {
      return await page.getAttribute(selector, attribute);
    } catch (error) {
      console.error(`❌ Failed to get attribute ${attribute} from ${selector}:`, error);
      return null;
    }
  }

  /**
   * Execute JavaScript in the page context
   */
  async evaluate<T>(pageFunction: () => T | Promise<T>): Promise<T> {
    const page = this.getPage();
    return await page.evaluate(pageFunction);
  }

  /**
   * Wait for a specific amount of time
   */
  async wait(ms: number): Promise<void> {
    const page = this.getPage();
    await page.waitForTimeout(ms);
  }

  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    attempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < attempts) {
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          this.config.logging.level === 'debug' &&
            console.log(`🔄 Retry attempt ${attempt}/${attempts}, waiting ${backoffDelay}ms...`);

          await this.wait(backoffDelay);
        }
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Save trace file
   */
  async saveTrace(filename: string): Promise<string> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    if (!this.config.reporting.saveTraces) {
      console.warn('⚠️  Tracing is not enabled in config');
      return '';
    }

    try {
      const filepath = `${this.config.reporting.outputDir}/traces/${filename}.zip`;
      await this.context.tracing.stop({ path: filepath });

      // Restart tracing for next test
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });

      return filepath;
    } catch (error) {
      console.error('❌ Failed to save trace:', error);
      throw error;
    }
  }

  /**
   * Clear cookies and storage
   */
  async clearSession(): Promise<void> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    try {
      await this.context.clearCookies();
      await this.context.clearPermissions();

      const page = this.getPage();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      this.config.logging.console &&
        console.log('🧹 Session cleared (cookies, localStorage, sessionStorage)');
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
      throw error;
    }
  }

  /**
   * Close current page
   */
  async closePage(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }

  /**
   * Cleanup and close browser
   */
  async cleanup(): Promise<void> {
    try {
      // Stop tracing if enabled
      if (this.context && this.config.reporting.saveTraces) {
        try {
          await this.context.tracing.stop();
        } catch {
          // Ignore errors if tracing wasn't started
        }
      }

      // Close page
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      // Close context
      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.config.logging.console &&
        console.log('✅ Browser cleanup completed');
    } catch (error) {
      console.error('❌ Error during browser cleanup:', error);
      throw error;
    }
  }

  /**
   * Check if browser is initialized
   */
  isInitialized(): boolean {
    return this.browser !== null && this.context !== null && this.page !== null;
  }
}

/**
 * Factory function to create browser manager
 */
export function createBrowserManager(config: BotConfig): BrowserManager {
  return new BrowserManager(config);
}
