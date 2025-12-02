#!/usr/bin/env tsx
/**
 * 🧪 Registration Workflow Test Script
 * Tests the user registration workflow in isolation
 */

import { chromium, type Browser, type Page } from "playwright";
import chalk from "chalk";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

interface TestResult {
  success: boolean;
  duration: number;
  logs: string[];
  error?: string;
  screenshot?: string;
}

async function testRegistration(): Promise<TestResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    logs.push("Launching browser...");
    browser = await chromium.launch({
      headless: false, // Set to true for CI
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    page = await context.newPage();

    // Capture console messages
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Step 1: Navigate to registration page
    logs.push("Step 1: Navigating to /register...");
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("networkidle");
    logs.push(`✓ Loaded: ${page.url()}`);

    // Step 2: Fill registration form
    logs.push("Step 2: Filling registration form...");
    const timestamp = Date.now();
    const email = `test-user-${timestamp}@farmersmarket.test`;
    const password = "TestPassword123!";
    const name = `Test User ${timestamp}`;

    // Check if form fields exist
    const nameField = page.locator('input[name="name"]').first();
    const emailField = page.locator('input[name="email"]').first();
    const passwordField = page.locator('input[name="password"]').first();
    const confirmPasswordField = page
      .locator('input[name="confirmPassword"]')
      .first();

    const nameVisible = await nameField.isVisible({ timeout: 5000 });
    if (!nameVisible) {
      throw new Error("Name field not found on page");
    }

    await nameField.fill(name);
    logs.push(`✓ Filled name: ${name}`);

    await emailField.fill(email);
    logs.push(`✓ Filled email: ${email}`);

    await passwordField.fill(password);
    logs.push(`✓ Filled password: ${"*".repeat(password.length)}`);

    await confirmPasswordField.fill(password);
    logs.push("✓ Filled confirm password");

    // Select user type (CONSUMER) - click the label since radio is hidden
    const userTypeLabel = page
      .locator('label:has(input[value="CONSUMER"])')
      .first();
    await userTypeLabel.click();
    logs.push("✓ Selected user type: CONSUMER");

    // Wait a moment for form validation
    await page.waitForTimeout(500);

    // Step 3: Submit form
    logs.push("Step 3: Submitting form...");

    // Check if submit button is enabled
    const submitButton = page.locator('button[type="submit"]').first();
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      logs.push(
        "⚠ Submit button is disabled - checking for validation errors",
      );

      // Check for any validation errors
      const errorMessages = await page
        .locator('[class*="text-red"]')
        .allTextContents();
      if (errorMessages.length > 0) {
        logs.push(`Validation errors found: ${errorMessages.join(", ")}`);
      }
    }

    await submitButton.click();
    logs.push("✓ Clicked submit button");

    // Wait for network to settle
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
      logs.push("⚠ Network did not become idle (may be normal)");
    });

    // Step 4: Check for success indicators
    logs.push("Step 4: Checking for success indicators...");

    let successFound = false;
    let successMessage = "";

    // Try to find success message
    const successSelectors = [
      '[data-testid="registration-success"]',
      '[role="alert"]:has-text("success")',
      "text=/registration.*success/i",
      "text=/account.*created/i",
      "text=/welcome/i",
      "text=/verify.*email/i",
      "text=/check.*email/i",
    ];

    for (const selector of successSelectors) {
      try {
        const element = page.locator(selector).first();
        await element.waitFor({ state: "visible", timeout: 2000 });
        successMessage = (await element.textContent()) || selector;
        successFound = true;
        logs.push(`✓ Success indicator found: ${successMessage}`);
        break;
      } catch (e) {
        // Continue checking
      }
    }

    // Check for redirect to /login (expected behavior)
    if (!successFound) {
      logs.push("No success message found, checking for redirect to login...");
      try {
        await page.waitForURL(/\/login/, {
          timeout: 30000,
        });
        successFound = true;
        logs.push(`✓ Redirected to login page: ${page.url()}`);

        // Check if registered parameter is present
        if (page.url().includes("registered=true")) {
          logs.push("✓ Registration confirmation parameter present");
        }
      } catch (e) {
        logs.push("⚠ No redirect to login page detected within 30s");

        // Fallback: Check for redirect to dashboard
        try {
          await page.waitForURL(/\/(dashboard|farms|profile|home)/, {
            timeout: 5000,
          });
          successFound = true;
          logs.push(`✓ Redirected to: ${page.url()}`);
        } catch (e2) {
          logs.push("⚠ No redirect detected");
        }
      }
    }

    // Check for errors
    const errorSelectors = [
      '[role="alert"]:has-text("error")',
      '[data-testid="error-message"]',
      "text=/error|failed|invalid/i",
    ];

    let errorFound = false;
    let errorMessage = "";

    for (const selector of errorSelectors) {
      try {
        const element = page.locator(selector).first();
        await element.waitFor({ state: "visible", timeout: 1000 });
        errorMessage = (await element.textContent()) || selector;
        errorFound = true;
        logs.push(`✗ Error found: ${errorMessage}`);
        break;
      } catch (e) {
        // No error
      }
    }

    // Final status
    const currentUrl = page.url();
    logs.push(`Final URL: ${currentUrl}`);
    logs.push(
      `Console messages (${consoleMessages.length} total): ${consoleMessages.slice(-3).join("; ")}`,
    );

    if (errorFound) {
      throw new Error(`Registration failed with error: ${errorMessage}`);
    }

    if (!successFound) {
      // Take screenshot
      await page.screenshot({
        path: `./test-results/registration-failed-${timestamp}.png`,
        fullPage: true,
      });
      logs.push("Screenshot saved to test-results/");

      throw new Error(
        `No clear success indicator found. URL: ${currentUrl}. Check screenshot.`,
      );
    }

    const duration = Date.now() - startTime;
    logs.push(`✓ Registration test completed in ${duration}ms`);

    return {
      success: true,
      duration,
      logs,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logs.push(`✗ Test failed: ${errorMessage}`);

    // Try to take screenshot
    if (page) {
      try {
        await page.screenshot({
          path: `./test-results/registration-error-${Date.now()}.png`,
          fullPage: true,
        });
        logs.push("Error screenshot saved to test-results/");
      } catch (e) {
        logs.push("Could not save error screenshot");
      }
    }

    return {
      success: false,
      duration,
      logs,
      error: errorMessage,
    };
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
      logs.push("Browser closed");
    }
  }
}

// Main execution
async function main() {
  console.log(chalk.cyan.bold("\n🧪 Registration Workflow Test\n"));
  console.log(chalk.gray(`Base URL: ${BASE_URL}\n`));

  const result = await testRegistration();

  console.log(chalk.bold("\n📋 Test Logs:\n"));
  result.logs.forEach((log) => {
    if (log.startsWith("✓")) {
      console.log(chalk.green(log));
    } else if (log.startsWith("✗")) {
      console.log(chalk.red(log));
    } else if (log.startsWith("⚠")) {
      console.log(chalk.yellow(log));
    } else {
      console.log(chalk.gray(log));
    }
  });

  console.log(chalk.bold("\n📊 Test Results:\n"));
  console.log(chalk.gray(`Duration: ${result.duration}ms`));
  console.log(
    result.success
      ? chalk.green.bold("✅ TEST PASSED")
      : chalk.red.bold("❌ TEST FAILED"),
  );

  if (result.error) {
    console.log(chalk.red(`\nError: ${result.error}`));
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((error) => {
  console.error(chalk.red.bold("\n💥 Unhandled error:\n"), error);
  process.exit(1);
});
