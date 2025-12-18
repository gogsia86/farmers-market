/**
 * 🔐 Authentication Setup for E2E Tests
 * This file runs before all other tests to create authenticated browser states
 * @reference .github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md
 */

import { test as setup, expect } from "@playwright/test";
import { TEST_USERS } from "../helpers/auth";
import path from "path";

const authDir = path.join(__dirname, "..", "auth", ".auth");

/**
 * Setup: Admin Authentication
 */
setup("authenticate as admin", async ({ page }) => {
  console.log("🔐 Setting up admin authentication...");

  const adminUser = TEST_USERS.admin;

  // Navigate to login page
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Wait for login form to be ready - element-based wait instead of networkIdle
  await page.waitForSelector('input[name="email"], input[type="email"]', {
    state: "visible",
    timeout: 15000,
  });

  // Fill in login form
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  const passwordInput = page.locator(
    'input[name="password"], input[type="password"]',
  );
  const submitButton = page.locator(
    'button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign in"), button:has-text("Login"), button:has-text("Sign in")',
  );

  await emailInput.fill(adminUser.email);
  await passwordInput.fill(adminUser.password);

  // Submit the form
  await submitButton.click();

  // Wait for successful login (redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });

  // Verify we're logged in
  await expect(page).not.toHaveURL(/.*login.*/);

  console.log("✅ Admin authenticated successfully");

  // Save authentication state
  await page.context().storageState({ path: `${authDir}/admin.json` });
  console.log(`💾 Saved admin auth state to ${authDir}/admin.json`);
});

/**
 * Setup: Farmer Authentication
 */
setup("authenticate as farmer", async ({ page }) => {
  console.log("🔐 Setting up farmer authentication...");

  const farmerUser = TEST_USERS.farmer;

  // Navigate to login page
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Wait for login form to be ready - element-based wait instead of networkIdle
  await page.waitForSelector('input[name="email"], input[type="email"]', {
    state: "visible",
    timeout: 15000,
  });

  // Fill in login form
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  const passwordInput = page.locator(
    'input[name="password"], input[type="password"]',
  );
  const submitButton = page.locator(
    'button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign in"), button:has-text("Login"), button:has-text("Sign in")',
  );

  await emailInput.fill(farmerUser.email);
  await passwordInput.fill(farmerUser.password);

  // Submit the form
  await submitButton.click();

  // Wait for successful login (redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });

  // Verify we're logged in
  await expect(page).not.toHaveURL(/.*login.*/);

  console.log("✅ Farmer authenticated successfully");

  // Save authentication state
  await page.context().storageState({ path: `${authDir}/farmer.json` });
  console.log(`💾 Saved farmer auth state to ${authDir}/farmer.json`);
});

/**
 * Setup: Customer Authentication
 */
setup("authenticate as customer", async ({ page }) => {
  console.log("🔐 Setting up customer authentication...");

  const customerUser = TEST_USERS.customer;

  // Navigate to login page
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  // Wait for login form to be ready - element-based wait instead of networkIdle
  await page.waitForSelector('input[name="email"], input[type="email"]', {
    state: "visible",
    timeout: 15000,
  });

  // Fill in login form
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  const passwordInput = page.locator(
    'input[name="password"], input[type="password"]',
  );
  const submitButton = page.locator(
    'button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign in"), button:has-text("Login"), button:has-text("Sign in")',
  );

  await emailInput.fill(customerUser.email);
  await passwordInput.fill(customerUser.password);

  // Submit the form
  await submitButton.click();

  // Wait for successful login (redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });

  // Verify we're logged in
  await expect(page).not.toHaveURL(/.*login.*/);

  console.log("✅ Customer authenticated successfully");

  // Save authentication state
  await page.context().storageState({ path: `${authDir}/customer.json` });
  console.log(`💾 Saved customer auth state to ${authDir}/customer.json`);
});

/**
 * Setup: Verify Authentication States
 */
setup("verify auth states created", async ({ page }) => {
  const fs = require("fs");

  console.log("\n🔍 Verifying authentication states...");

  // Wait a bit for files to be written (parallel execution)
  await page.waitForTimeout(2000);

  const authFiles = ["admin.json", "farmer.json", "customer.json"];
  let foundCount = 0;

  for (const file of authFiles) {
    const filePath = path.join(authDir, file);
    const exists = fs.existsSync(filePath);

    if (exists) {
      console.log(`✅ ${file} exists`);
      foundCount++;

      // Verify the file has valid content
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const state = JSON.parse(content);

        if (state.cookies && state.cookies.length > 0) {
          console.log(`   📦 Contains ${state.cookies.length} cookies`);
        }

        if (state.origins && state.origins.length > 0) {
          console.log(`   🌐 Contains ${state.origins.length} origins`);
        }
      } catch (error) {
        console.warn(
          `⚠️  ${file} exists but could not be verified: ${error.message}`,
        );
      }
    } else {
      console.warn(
        `⚠️  ${file} does NOT exist at ${filePath} (may still be writing)`,
      );
    }
  }

  console.log(
    `\n✅ Found ${foundCount}/${authFiles.length} authentication states`,
  );

  if (foundCount >= 2) {
    console.log("✅ Minimum authentication states available (admin, farmer)");
    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  🎉 Authentication Setup Complete                         ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      "║  Tests can now use authenticated contexts:                ║",
    );
    console.log(
      "║  • Admin: tests/auth/.auth/admin.json                     ║",
    );
    console.log(
      "║  • Farmer: tests/auth/.auth/farmer.json                   ║",
    );
    console.log(
      "║  • Customer: tests/auth/.auth/customer.json               ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
  } else {
    console.error(
      `❌ Only ${foundCount} authentication states found. Need at least 2.`,
    );
    throw new Error(`Insufficient authentication states: ${foundCount}/3`);
  }
});
