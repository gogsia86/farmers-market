/**
 * 🔐 Authentication Setup Script
 * Generates authenticated browser states for E2E tests
 * Run this before E2E tests to create auth storage states
 */

import { chromium, FullConfig } from "@playwright/test";
import { TEST_USERS, setupAuthContext } from "../helpers/auth";
import * as fs from "fs";
import * as path from "path";

async function globalAuthSetup(config: FullConfig) {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║  🔐 Setting up authenticated browser states                ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  // Ensure auth directory exists
  const authDir = path.join(__dirname, ".auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log(`✅ Created auth directory: ${authDir}`);
  }

  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3001";
  console.log(`🌐 Using base URL: ${baseURL}\n`);

  // Launch browser
  const browser = await chromium.launch();

  try {
    // Setup auth for each role
    console.log("👨‍💼 Setting up Admin authentication...");
    const adminContext = await browser.newContext({ baseURL });
    await setupAuthContext(adminContext, "admin");
    await adminContext.close();

    console.log("\n🚜 Setting up Farmer authentication...");
    const farmerContext = await browser.newContext({ baseURL });
    await setupAuthContext(farmerContext, "farmer");
    await farmerContext.close();

    console.log("\n🛒 Setting up Customer authentication...");
    const customerContext = await browser.newContext({ baseURL });
    await setupAuthContext(customerContext, "customer");
    await customerContext.close();

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  ✅ Authentication setup complete!                         ║",
    );
    console.log(
      "╠════════════════════════════════════════════════════════════╣",
    );
    console.log(
      "║  Generated auth states:                                    ║",
    );
    console.log(
      "║  • tests/auth/.auth/admin.json                             ║",
    );
    console.log(
      "║  • tests/auth/.auth/farmer.json                            ║",
    );
    console.log(
      "║  • tests/auth/.auth/customer.json                          ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n",
    );
  } catch (error) {
    console.error("❌ Authentication setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalAuthSetup;
