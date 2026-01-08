/**
 * Assertion Utilities - Test Validation Helpers
 *
 * Provides comprehensive assertion functions for bot testing:
 * - Page state assertions
 * - Element visibility and content
 * - API response validation
 * - Performance metrics
 * - Database state validation
 * - Custom matchers
 */

import { logger } from '@/lib/monitoring/logger';
import { Page } from 'playwright';

export interface AssertionResult {
  passed: boolean;
  message: string;
  actual?: any;
  expected?: any;
  screenshot?: string;
}

export class AssertionError extends Error {
  constructor(
    message: string,
    public actual?: any,
    public expected?: any
  ) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Base Assertion Class
 */
export class Assertions {
  constructor(private page: Page) { }

  /**
   * Assert element is visible
   */
  async isVisible(
    selector: string,
    timeout: number = 5000
  ): Promise<AssertionResult> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout
      });

      return {
        passed: true,
        message: `Element "${selector}" is visible`
      };
    } catch (error) {
      const screenshot = await this.captureScreenshot('assertion-failed');

      return {
        passed: false,
        message: `Element "${selector}" is not visible`,
        screenshot
      };
    }
  }

  /**
   * Assert element is hidden or not present
   */
  async isHidden(
    selector: string,
    timeout: number = 5000
  ): Promise<AssertionResult> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'hidden',
        timeout
      });

      return {
        passed: true,
        message: `Element "${selector}" is hidden`
      };
    } catch (error) {
      return {
        passed: false,
        message: `Element "${selector}" is still visible`
      };
    }
  }

  /**
   * Assert element contains text
   */
  async containsText(
    selector: string,
    expectedText: string,
    options?: { exact?: boolean; ignoreCase?: boolean }
  ): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 5000
      });

      const actualText = await element.textContent();

      if (!actualText) {
        return {
          passed: false,
          message: `Element "${selector}" has no text content`,
          actual: null,
          expected: expectedText
        };
      }

      const normalizedActual = options?.ignoreCase
        ? actualText.toLowerCase()
        : actualText;
      const normalizedExpected = options?.ignoreCase
        ? expectedText.toLowerCase()
        : expectedText;

      const matches = options?.exact
        ? normalizedActual === normalizedExpected
        : normalizedActual.includes(normalizedExpected);

      if (matches) {
        return {
          passed: true,
          message: `Element "${selector}" contains text "${expectedText}"`
        };
      }

      return {
        passed: false,
        message: `Element "${selector}" does not contain expected text`,
        actual: actualText,
        expected: expectedText
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check text in "${selector}": ${error}`,
        expected: expectedText
      };
    }
  }

  /**
   * Assert element has attribute with value
   */
  async hasAttribute(
    selector: string,
    attribute: string,
    expectedValue?: string
  ): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'attached',
        timeout: 5000
      });

      const actualValue = await element.getAttribute(attribute);

      if (actualValue === null) {
        return {
          passed: false,
          message: `Element "${selector}" does not have attribute "${attribute}"`,
          actual: null,
          expected: expectedValue
        };
      }

      if (expectedValue !== undefined) {
        const matches = actualValue === expectedValue;

        return {
          passed: matches,
          message: matches
            ? `Element "${selector}" has attribute "${attribute}" with value "${expectedValue}"`
            : `Attribute "${attribute}" has wrong value`,
          actual: actualValue,
          expected: expectedValue
        };
      }

      return {
        passed: true,
        message: `Element "${selector}" has attribute "${attribute}"`
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check attribute in "${selector}": ${error}`
      };
    }
  }

  /**
   * Assert page URL matches
   */
  async urlMatches(
    expected: string | RegExp,
    options?: { exact?: boolean; timeout?: number }
  ): Promise<AssertionResult> {
    const timeout = options?.timeout || 5000;
    const startTime = Date.now();

    try {
      await this.page.waitForFunction(
        ({ expected, exact }) => {
          const currentUrl = window.location.href;

          if (typeof expected === 'string') {
            return exact ? currentUrl === expected : currentUrl.includes(expected);
          }

          // RegExp passed as string, reconstruct
          const regex = new RegExp(expected);
          return regex.test(currentUrl);
        },
        { expected: expected.toString(), exact: options?.exact || false },
        { timeout }
      );

      const actualUrl = this.page.url();

      return {
        passed: true,
        message: `URL matches expected pattern`,
        actual: actualUrl,
        expected: expected.toString()
      };
    } catch (error) {
      const actualUrl = this.page.url();

      return {
        passed: false,
        message: `URL does not match expected pattern`,
        actual: actualUrl,
        expected: expected.toString()
      };
    }
  }

  /**
   * Assert page title matches
   */
  async titleMatches(expected: string | RegExp): Promise<AssertionResult> {
    const actualTitle = await this.page.title();

    const matches =
      typeof expected === 'string'
        ? actualTitle.includes(expected)
        : expected.test(actualTitle);

    return {
      passed: matches,
      message: matches
        ? `Page title matches expected`
        : `Page title does not match expected`,
      actual: actualTitle,
      expected: expected.toString()
    };
  }

  /**
   * Assert element count
   */
  async elementCount(
    selector: string,
    expected: number | { min?: number; max?: number }
  ): Promise<AssertionResult> {
    const elements = await this.page.$$(selector);
    const actual = elements.length;

    let passed = false;
    let message = '';

    if (typeof expected === 'number') {
      passed = actual === expected;
      message = passed
        ? `Found exactly ${expected} elements`
        : `Expected ${expected} elements, found ${actual}`;
    } else {
      const min = expected.min ?? 0;
      const max = expected.max ?? Infinity;

      passed = actual >= min && actual <= max;
      message = passed
        ? `Found ${actual} elements within range [${min}, ${max}]`
        : `Expected ${min}-${max} elements, found ${actual}`;
    }

    return {
      passed,
      message: `${message} for selector "${selector}"`,
      actual,
      expected
    };
  }

  /**
   * Assert element is enabled
   */
  async isEnabled(selector: string): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 5000
      });

      const isDisabled = await element.isDisabled();

      return {
        passed: !isDisabled,
        message: isDisabled
          ? `Element "${selector}" is disabled`
          : `Element "${selector}" is enabled`
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check if element "${selector}" is enabled: ${error}`
      };
    }
  }

  /**
   * Assert element is checked (checkbox/radio)
   */
  async isChecked(selector: string): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'attached',
        timeout: 5000
      });

      const isChecked = await element.isChecked();

      return {
        passed: isChecked,
        message: isChecked
          ? `Element "${selector}" is checked`
          : `Element "${selector}" is not checked`
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check if element "${selector}" is checked: ${error}`
      };
    }
  }

  /**
   * Assert element has class
   */
  async hasClass(selector: string, className: string): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'attached',
        timeout: 5000
      });

      const classAttr = await element.getAttribute('class');
      const classes = classAttr?.split(/\s+/) || [];
      const hasClass = classes.includes(className);

      return {
        passed: hasClass,
        message: hasClass
          ? `Element "${selector}" has class "${className}"`
          : `Element "${selector}" does not have class "${className}"`,
        actual: classes,
        expected: className
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check class on "${selector}": ${error}`
      };
    }
  }

  /**
   * Assert input value
   */
  async inputValue(
    selector: string,
    expectedValue: string
  ): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'attached',
        timeout: 5000
      });

      const actualValue = await element.inputValue();
      const matches = actualValue === expectedValue;

      return {
        passed: matches,
        message: matches
          ? `Input "${selector}" has expected value`
          : `Input "${selector}" has wrong value`,
        actual: actualValue,
        expected: expectedValue
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check input value in "${selector}": ${error}`
      };
    }
  }

  /**
   * Assert element is focused
   */
  async isFocused(selector: string): Promise<AssertionResult> {
    try {
      const element = await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 5000
      });

      const isFocused = await element.evaluate(
        el => el === document.activeElement
      );

      return {
        passed: isFocused,
        message: isFocused
          ? `Element "${selector}" is focused`
          : `Element "${selector}" is not focused`
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to check focus on "${selector}": ${error}`
      };
    }
  }

  /**
   * Assert no console errors
   */
  async noConsoleErrors(): Promise<AssertionResult> {
    const consoleErrors: string[] = [];

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to collect errors
    await this.page.waitForTimeout(1000);

    return {
      passed: consoleErrors.length === 0,
      message:
        consoleErrors.length === 0
          ? 'No console errors detected'
          : `Found ${consoleErrors.length} console errors`,
      actual: consoleErrors
    };
  }

  /**
   * Assert network request was made
   */
  async networkRequestMade(
    urlPattern: string | RegExp,
    options?: { method?: string; timeout?: number }
  ): Promise<AssertionResult> {
    const timeout = options?.timeout || 10000;
    let requestFound = false;

    try {
      await this.page.waitForRequest(
        request => {
          const urlMatches =
            typeof urlPattern === 'string'
              ? request.url().includes(urlPattern)
              : urlPattern.test(request.url());

          const methodMatches = options?.method
            ? request.method() === options.method
            : true;

          return urlMatches && methodMatches;
        },
        { timeout }
      );

      requestFound = true;

      return {
        passed: true,
        message: `Network request to "${urlPattern}" was made`,
        expected: urlPattern.toString()
      };
    } catch (error) {
      return {
        passed: false,
        message: `Network request to "${urlPattern}" was not made within ${timeout}ms`,
        expected: urlPattern.toString()
      };
    }
  }

  /**
   * Assert response status code
   */
  async responseStatus(
    urlPattern: string | RegExp,
    expectedStatus: number
  ): Promise<AssertionResult> {
    try {
      const response = await this.page.waitForResponse(
        resp => {
          const urlMatches =
            typeof urlPattern === 'string'
              ? resp.url().includes(urlPattern)
              : urlPattern.test(resp.url());

          return urlMatches;
        },
        { timeout: 10000 }
      );

      const actualStatus = response.status();
      const matches = actualStatus === expectedStatus;

      return {
        passed: matches,
        message: matches
          ? `Response status is ${expectedStatus}`
          : `Response status mismatch`,
        actual: actualStatus,
        expected: expectedStatus
      };
    } catch (error) {
      return {
        passed: false,
        message: `Failed to capture response for "${urlPattern}": ${error}`
      };
    }
  }

  /**
   * Assert page load time
   */
  async pageLoadTime(maxMilliseconds: number): Promise<AssertionResult> {
    const metrics = await this.page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart
      };
    });

    const passed = metrics.loadTime <= maxMilliseconds;

    return {
      passed,
      message: passed
        ? `Page loaded in ${metrics.loadTime}ms (under ${maxMilliseconds}ms)`
        : `Page load time ${metrics.loadTime}ms exceeds ${maxMilliseconds}ms`,
      actual: metrics.loadTime,
      expected: maxMilliseconds
    };
  }

  /**
   * Assert local storage item
   */
  async localStorageItem(
    key: string,
    expectedValue?: string
  ): Promise<AssertionResult> {
    const actualValue = await this.page.evaluate(
      key => localStorage.getItem(key),
      key
    );

    if (expectedValue === undefined) {
      return {
        passed: actualValue !== null,
        message:
          actualValue !== null
            ? `Local storage has item "${key}"`
            : `Local storage does not have item "${key}"`,
        actual: actualValue
      };
    }

    const matches = actualValue === expectedValue;

    return {
      passed: matches,
      message: matches
        ? `Local storage item "${key}" has expected value`
        : `Local storage item "${key}" has wrong value`,
      actual: actualValue,
      expected: expectedValue
    };
  }

  /**
   * Assert cookie exists
   */
  async cookieExists(name: string): Promise<AssertionResult> {
    const cookies = await this.page.context().cookies();
    const cookie = cookies.find(c => c.name === name);

    return {
      passed: !!cookie,
      message: cookie
        ? `Cookie "${name}" exists`
        : `Cookie "${name}" does not exist`,
      actual: cookie?.value
    };
  }

  /**
   * Capture screenshot on failure
   */
  private async captureScreenshot(name: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const path = `./test-results/${name}-${timestamp}.png`;
      await this.page.screenshot({ path, fullPage: true });
      return path;
    } catch (error) {
      logger.error('[Assertions] Failed to capture screenshot:', error);
      return '';
    }
  }
}

/**
 * Helper to throw assertion error
 */
export function throwAssertionError(
  result: AssertionResult
): never {
  throw new AssertionError(
    result.message,
    result.actual,
    result.expected
  );
}

/**
 * Create assertions instance
 */
export function createAssertions(page: Page): Assertions {
  return new Assertions(page);
}

/**
 * Expect-style API for fluent assertions
 */
export function expect(page: Page) {
  const assertions = new Assertions(page);

  return {
    async toHaveText(selector: string, text: string) {
      const result = await assertions.containsText(selector, text);
      if (!result.passed) throwAssertionError(result);
    },

    async toBeVisible(selector: string) {
      const result = await assertions.isVisible(selector);
      if (!result.passed) throwAssertionError(result);
    },

    async toBeHidden(selector: string) {
      const result = await assertions.isHidden(selector);
      if (!result.passed) throwAssertionError(result);
    },

    async toHaveURL(url: string | RegExp) {
      const result = await assertions.urlMatches(url);
      if (!result.passed) throwAssertionError(result);
    },

    async toHaveTitle(title: string | RegExp) {
      const result = await assertions.titleMatches(title);
      if (!result.passed) throwAssertionError(result);
    },

    async toHaveCount(selector: string, count: number) {
      const result = await assertions.elementCount(selector, count);
      if (!result.passed) throwAssertionError(result);
    },

    async toBeEnabled(selector: string) {
      const result = await assertions.isEnabled(selector);
      if (!result.passed) throwAssertionError(result);
    },

    async toBeChecked(selector: string) {
      const result = await assertions.isChecked(selector);
      if (!result.passed) throwAssertionError(result);
    },

    async toHaveValue(selector: string, value: string) {
      const result = await assertions.inputValue(selector, value);
      if (!result.passed) throwAssertionError(result);
    }
  };
}
