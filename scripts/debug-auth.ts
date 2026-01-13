#!/usr/bin/env tsx
/**
 * 🔐 DEBUG AUTHENTICATION TEST
 * Quick script to test authentication flow for inspector bot
 */

import "dotenv/config";
import { chromium } from "playwright";

const BASE_URL =
  process.env.BASE_URL || "https://farmers-market-platform.vercel.app";

const TEST_USERS = {
  customer: {
    email: "customer@test.com",
    password: "Test123!@#",
  },
  farmer: {
    email: "farmer@test.com",
    password: "Test123!@#",
  },
  admin: {
    email: "admin@test.com",
    password: "Test123!@#",
  },
};

async function testAuth(
  role: "customer" | "farmer" | "admin",
  headless: boolean = false,
) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🔐 Testing authentication for: ${role.toUpperCase()}`);
  console.log("=".repeat(80));

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  const credentials = TEST_USERS[role];

  try {
    // Navigate to sign-in page
    console.log(`\n1️⃣  Navigating to: ${BASE_URL}/auth/signin`);
    await page.goto(`${BASE_URL}/auth/signin`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    console.log("✅ Page loaded");

    // Take screenshot
    await page.screenshot({ path: `debug-auth-${role}-1-loaded.png` });

    // Check if email input exists
    console.log("\n2️⃣  Looking for email input...");
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[id="email"]',
      'input[placeholder*="email" i]',
    ];

    let emailFound = false;
    for (const selector of emailSelectors) {
      const count = await page.locator(selector).count();
      console.log(`   ${selector}: ${count} found`);
      if (count > 0) {
        emailFound = true;
        console.log(`✅ Found email input: ${selector}`);
        await page.fill(selector, credentials.email);
        console.log(`✅ Filled email: ${credentials.email}`);
        break;
      }
    }

    if (!emailFound) {
      console.error("❌ No email input found!");
      const html = await page.content();
      console.log("\n📄 Page HTML (first 1000 chars):");
      console.log(html.substring(0, 1000));
      return false;
    }

    await page.screenshot({ path: `debug-auth-${role}-2-email-filled.png` });

    // Check if password input exists
    console.log("\n3️⃣  Looking for password input...");
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]',
    ];

    let passwordFound = false;
    for (const selector of passwordSelectors) {
      const count = await page.locator(selector).count();
      console.log(`   ${selector}: ${count} found`);
      if (count > 0) {
        passwordFound = true;
        console.log(`✅ Found password input: ${selector}`);
        await page.fill(selector, credentials.password);
        console.log(`✅ Filled password: ***`);
        break;
      }
    }

    if (!passwordFound) {
      console.error("❌ No password input found!");
      return false;
    }

    await page.screenshot({ path: `debug-auth-${role}-3-password-filled.png` });

    // Look for submit button
    console.log("\n4️⃣  Looking for submit button...");
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'button:has-text("Login")',
      'input[type="submit"]',
    ];

    let submitFound = false;
    for (const selector of submitSelectors) {
      const count = await page.locator(selector).count();
      console.log(`   ${selector}: ${count} found`);
      if (count > 0) {
        submitFound = true;
        console.log(`✅ Found submit button: ${selector}`);
        break;
      }
    }

    if (!submitFound) {
      console.error("❌ No submit button found!");
      return false;
    }

    // Submit form
    console.log("\n5️⃣  Submitting form...");
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    await page.click('button[type="submit"]');
    console.log("✅ Clicked submit button");

    // Wait for navigation or error message
    console.log("\n6️⃣  Waiting for response...");
    await page.waitForTimeout(3000); // Give it 3 seconds

    const newUrl = page.url();
    console.log(`   New URL: ${newUrl}`);

    await page.screenshot({ path: `debug-auth-${role}-4-after-submit.png` });

    // Check for error messages
    const errorMessages = await page
      .locator("text=/error|invalid|incorrect|failed/i")
      .allTextContents();
    if (errorMessages.length > 0) {
      console.log("\n⚠️  Error messages found:");
      errorMessages.forEach((msg) => console.log(`   - ${msg}`));
    }

    // Check if authenticated
    const isAuthenticated =
      !newUrl.includes("/auth/signin") && !newUrl.includes("/auth/error");

    if (isAuthenticated) {
      console.log("\n✅ AUTHENTICATION SUCCESSFUL!");
      console.log(`   Redirected to: ${newUrl}`);

      // Try to access dashboard
      console.log("\n7️⃣  Testing dashboard access...");
      const dashboardUrls = [
        `/dashboard`,
        `/customer/dashboard`,
        `/farmer/dashboard`,
        `/admin/dashboard`,
      ];

      for (const dashUrl of dashboardUrls) {
        try {
          await page.goto(`${BASE_URL}${dashUrl}`, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });
          const dashPageUrl = page.url();
          if (
            !dashPageUrl.includes("/auth/signin") &&
            !dashPageUrl.includes("/auth/error")
          ) {
            console.log(`✅ Dashboard accessible: ${dashUrl}`);
            await page.screenshot({
              path: `debug-auth-${role}-5-dashboard.png`,
            });
            break;
          }
        } catch (e) {
          console.log(`   ${dashUrl}: not accessible`);
        }
      }

      return true;
    } else {
      console.log("\n❌ AUTHENTICATION FAILED");
      console.log(`   Still on: ${newUrl}`);

      // Get page content for debugging
      const html = await page.content();
      console.log("\n📄 Page HTML (first 2000 chars):");
      console.log(html.substring(0, 2000));

      return false;
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    await page.screenshot({ path: `debug-auth-${role}-error.png` });
    return false;
  } finally {
    await browser.close();
  }
}

async function main() {
  const headless = process.env.HEADLESS !== "false";
  console.log(`\n🚀 Starting authentication debug tests`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Headless: ${headless}`);

  const roles: Array<"customer" | "farmer" | "admin"> = [
    "customer",
    "farmer",
    "admin",
  ];

  const results: Record<string, boolean> = {};

  for (const role of roles) {
    const success = await testAuth(role, headless);
    results[role] = success;
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("📊 SUMMARY");
  console.log("=".repeat(80));
  for (const [role, success] of Object.entries(results)) {
    console.log(
      `   ${success ? "✅" : "❌"} ${role}: ${success ? "PASS" : "FAIL"}`,
    );
  }
  console.log("");

  process.exit(Object.values(results).every((r) => r) ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
