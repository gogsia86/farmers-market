/**
 * 🌟 Divine Predefined Workflows
 * Farmers Market Platform - Common User Journey Workflows
 * Version: 1.0.0
 *
 * Pre-configured workflows for testing critical user journeys and system health.
 */

import type {
  WorkflowConfig,
  WorkflowStep,
  WorkflowContext,
  WorkflowStepResult,
} from "../types";

// ============================================================================
// WORKFLOW STEPS - USER REGISTRATION
// ============================================================================

const userRegistrationSteps: WorkflowStep[] = [
  {
    id: "navigate-to-signup",
    name: "Navigate to Signup Page",
    description: "Navigate to the user registration page",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      await page.goto(`${baseUrl}/signup`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: 0,
        logs: ["Navigated to signup page successfully"],
      };
    },
  },
  {
    id: "fill-registration-form",
    name: "Fill Registration Form",
    description: "Fill out the registration form with test data",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, testData } = context;
      if (!page) throw new Error("Page not initialized");

      const timestamp = Date.now();
      const email =
        testData.email || `test.user.${timestamp}@farmersmarket.test`;
      const password = testData.password || "SecurePass123!";
      const name = testData.name || `Test User ${timestamp}`;

      // Fill form fields
      await page.fill('input[name="name"]', name);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirmPassword"]', password);

      // Select user type (CONSUMER or FARMER) - click label since radio is hidden
      const userType = testData.userType || "CONSUMER";
      await page.click(`label:has(input[value="${userType}"])`);

      // Store for later use
      context.state.userEmail = email;
      context.state.userPassword = password;

      return {
        success: true,
        duration: 0,
        logs: [`Filled registration form for ${email} as ${userType}`],
      };
    },
  },
  {
    id: "submit-registration",
    name: "Submit Registration",
    description: "Submit the registration form",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      const logs: string[] = [];

      // Capture console messages for debugging
      const consoleMessages: string[] = [];
      page.on("console", (msg) =>
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`),
      );

      // Click submit button
      await page.click('button[type="submit"]');
      logs.push("Clicked submit button");

      // Wait for network to be idle after submission
      await page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => {
          logs.push("Network did not become idle within 5s (may be normal)");
        });

      // Check for success indicators (message first, then redirect)
      let successFound = false;
      let successMessage = "";

      // FIRST: Check for success message on current page (fast - 3s total)
      logs.push("Checking for success message on page...");
      const successIndicators = [
        page.locator('[data-testid="registration-success"]').first(),
        page.locator('[role="alert"]:has-text("success")').first(),
        page.locator("text=/registration.*success/i").first(),
        page.locator("text=/account.*created/i").first(),
        page.locator("text=/welcome.*back/i").first(),
        page.locator("text=/welcome/i").first(),
      ];

      for (const indicator of successIndicators) {
        try {
          await indicator.waitFor({ state: "visible", timeout: 3000 });
          successFound = true;
          successMessage =
            (await indicator.textContent()) || "Success indicator found";
          logs.push(`✓ Success message found: ${successMessage}`);
          break;
        } catch (e) {
          // Continue to next indicator
        }
      }

      // SECOND: If no message, check for redirect to login page
      if (!successFound) {
        logs.push(
          "No success message found, waiting for redirect to login page...",
        );
        try {
          await page.waitForURL(/\/login/, {
            timeout: 30000,
          });
          successFound = true;
          const currentUrl = page.url();
          logs.push(`✓ Redirected to login page: ${currentUrl}`);

          // Check if the URL has registered=true parameter
          if (currentUrl.includes("registered=true")) {
            logs.push("✓ Registration confirmation parameter present");
          }
        } catch (e) {
          logs.push("No redirect to login page detected within 30s");
        }
      }

      // Check for error messages
      const errorSelectors = [
        '[role="alert"]:has-text("error")',
        '[data-testid="error-message"]',
        "text=/error|failed|invalid/i",
      ];

      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const errorElement = page.locator(selector).first();
          await errorElement.waitFor({ state: "visible", timeout: 1000 });
          const errorText = await errorElement.textContent();
          logs.push(`ERROR DETECTED: ${errorText}`);
          errorFound = true;
          break;
        } catch (e) {
          // No error with this selector
        }
      }

      // Capture final state
      const currentUrl = page.url();
      logs.push(`Final URL: ${currentUrl}`);
      logs.push(
        `Console messages (${consoleMessages.length}): ${consoleMessages.slice(-5).join("; ")}`,
      );

      if (errorFound) {
        throw new Error("Registration form showed error message");
      }

      if (!successFound) {
        // Take screenshot for debugging
        try {
          await page.screenshot({
            path: `./test-results/registration-no-success-${Date.now()}.png`,
            fullPage: true,
          });
          logs.push("Screenshot saved for debugging");
        } catch (e) {
          logs.push("Could not save screenshot");
        }

        throw new Error(
          `Registration submission did not show clear success. ` +
            `Check screenshot and logs. URL: ${currentUrl}`,
        );
      }

      return {
        success: true,
        duration: 0,
        logs,
      };
    },
  },
  {
    id: "verify-registration-success",
    name: "Verify Registration Success",
    description: "Verify user was registered and redirected correctly",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      const url = page.url();
      const logs: string[] = [`Current URL: ${url}`];

      // Check if redirected to login page (expected after successful registration)
      const isOnLoginPage = url.includes("/login");
      const hasRegisteredParam = url.includes("registered=true");

      if (isOnLoginPage) {
        logs.push("✓ Successfully redirected to login page");

        if (hasRegisteredParam) {
          logs.push("✓ Registration confirmation parameter present");
        }

        // Check for success banner/message on login page
        const successBanner = page
          .locator("text=/registered|account created/i")
          .first();
        const hasBanner = await successBanner.isVisible().catch(() => false);
        if (hasBanner) {
          const bannerText = await successBanner.textContent();
          logs.push(`✓ Success message visible: ${bannerText}`);
        }

        logs.push("✓ User registration verified successfully");

        return {
          success: true,
          duration: 0,
          logs,
        };
      }

      // If not on login page, check if on authenticated page (alternative success path)
      const isAuthenticated =
        url.includes("/dashboard") ||
        url.includes("/farms") ||
        url.includes("/profile") ||
        url.includes("/home");

      if (isAuthenticated) {
        logs.push(
          "✓ User automatically logged in and redirected to authenticated page",
        );
        logs.push("✓ User registration verified successfully");

        return {
          success: true,
          duration: 0,
          logs,
        };
      }

      // Neither login page nor authenticated page - this is unexpected
      throw new Error(
        `User not redirected correctly after registration. Expected /login or authenticated page, got: ${url}`,
      );
    },
  },
];

// ============================================================================
// WORKFLOW STEPS - USER LOGIN
// ============================================================================

const userLoginSteps: WorkflowStep[] = [
  {
    id: "navigate-to-login",
    name: "Navigate to Login Page",
    description: "Navigate to the user login page",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      await page.goto(`${baseUrl}/login`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: 0,
        logs: ["Navigated to login page successfully"],
      };
    },
  },
  {
    id: "fill-login-form",
    name: "Fill Login Form",
    description: "Fill out the login form with credentials",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, testData } = context;
      if (!page) throw new Error("Page not initialized");

      const email = testData.email || "test@farmersmarket.test";
      const password = testData.password || "TestPassword123!";

      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);

      return {
        success: true,
        duration: 0,
        logs: [`Filled login form for ${email}`],
      };
    },
  },
  {
    id: "submit-login",
    name: "Submit Login",
    description: "Submit the login form",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      const logs: string[] = [];

      // Capture console messages for debugging
      const consoleMessages: string[] = [];
      page.on("console", (msg) =>
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`),
      );

      // Click submit button
      await page.click('button[type="submit"]');
      logs.push("Clicked submit button");

      // Wait for network to be idle after submission
      await page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => {
          logs.push("Network did not become idle within 5s (may be normal)");
        });

      // Check for multiple possible success indicators
      const successIndicators = [
        // Success message or redirect
        page.locator('[data-testid="login-success"]').first(),
        page.locator('[role="alert"]:has-text("success")').first(),
        page.locator("text=/login.*success/i").first(),
        page.locator("text=/welcome back/i").first(),
      ];

      let successFound = false;
      let successMessage = "";

      // Try to find success message (fast check - 2s timeout)
      for (const indicator of successIndicators) {
        try {
          await indicator.waitFor({ state: "visible", timeout: 2000 });
          successFound = true;
          successMessage =
            (await indicator.textContent()) || "Success indicator found";
          logs.push(`Success message found: ${successMessage}`);
          break;
        } catch (e) {
          // Continue to next indicator
        }
      }

      // If no success message, try waiting for redirect (longer timeout - 30s)
      if (!successFound) {
        logs.push("No success message found, waiting for redirect...");
        try {
          await page.waitForURL(/\/(dashboard|farms|profile|home)/, {
            timeout: 30000,
          });
          successFound = true;
          logs.push(`Redirected to: ${page.url()}`);
        } catch (e) {
          logs.push("No redirect detected within 30s");
        }
      }

      // Check for error messages
      const errorSelectors = [
        '[role="alert"]:has-text("error")',
        '[data-testid="error-message"]',
        "text=/error|failed|invalid|incorrect/i",
      ];

      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const errorElement = page.locator(selector).first();
          await errorElement.waitFor({ state: "visible", timeout: 1000 });
          const errorText = await errorElement.textContent();
          logs.push(`ERROR DETECTED: ${errorText}`);
          errorFound = true;
          break;
        } catch (e) {
          // No error with this selector
        }
      }

      // Capture final state
      const currentUrl = page.url();
      logs.push(`Final URL: ${currentUrl}`);
      logs.push(
        `Console messages (${consoleMessages.length}): ${consoleMessages.slice(-5).join("; ")}`,
      );

      if (errorFound) {
        throw new Error("Login form showed error message");
      }

      if (!successFound) {
        // Take screenshot for debugging
        try {
          await page.screenshot({
            path: `./test-results/login-no-success-${Date.now()}.png`,
            fullPage: true,
          });
          logs.push("Screenshot saved for debugging");
        } catch (e) {
          logs.push("Could not save screenshot");
        }

        throw new Error(
          `Login submission did not show clear success. ` +
            `Check screenshot and logs. URL: ${currentUrl}`,
        );
      }

      return {
        success: true,
        duration: 0,
        logs,
      };
    },
  },
];

// ============================================================================
// WORKFLOW STEPS - FARM CREATION
// ============================================================================

const farmCreationSteps: WorkflowStep[] = [
  {
    id: "navigate-to-create-farm",
    name: "Navigate to Create Farm",
    description: "Navigate to the farm creation page",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      await page.goto(`${baseUrl}/register-farm`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: 0,
        logs: ["Navigated to farm creation page"],
      };
    },
  },
  {
    id: "fill-farm-details",
    name: "Fill Farm Details",
    description: "Fill out farm information form",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, testData } = context;
      if (!page) throw new Error("Page not initialized");

      const season = context.season || "SPRING";
      const timestamp = Date.now();

      const farmName =
        testData.farmName || `Divine ${season} Farm ${timestamp}`;
      const description =
        testData.description ||
        `A biodynamic farm practicing sustainable agriculture in ${season.toLowerCase()}.`;
      const address =
        testData.address || "123 Farm Road, Agricultural Valley, CA 95000";

      await page.fill('input[name="name"]', farmName);
      await page.fill('textarea[name="description"]', description);
      await page.fill('input[name="address"]', address);

      context.state.farmName = farmName;

      return {
        success: true,
        duration: 0,
        logs: [`Filled farm details for ${farmName}`],
        agricultureData: {
          season,
          biodynamicCompliant: true,
          farmName,
        },
      };
    },
  },
  {
    id: "submit-farm-creation",
    name: "Submit Farm Creation",
    description: "Submit the farm creation form",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      await page.click('button[type="submit"]');
      await page.waitForURL(/\/farmer\/farms\/[a-z0-9-]+/, { timeout: 15000 });

      return {
        success: true,
        duration: 0,
        logs: ["Farm created successfully"],
      };
    },
  },
  {
    id: "verify-farm-creation",
    name: "Verify Farm Creation",
    description: "Verify farm was created and displayed correctly",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, state } = context;
      if (!page) throw new Error("Page not initialized");

      const farmNameOnPage = await page.textContent("h1");
      const expectedName = state.farmName;

      if (!farmNameOnPage?.includes(expectedName)) {
        throw new Error(
          `Farm name mismatch. Expected: ${expectedName}, Found: ${farmNameOnPage}`,
        );
      }

      return {
        success: true,
        duration: 0,
        logs: ["Farm creation verified successfully"],
        agricultureData: {
          farmDataIntegrity: true,
          farmVerified: true,
        },
      };
    },
  },
];

// ============================================================================
// WORKFLOW STEPS - PRODUCT LISTING
// ============================================================================

const productListingSteps: WorkflowStep[] = [
  {
    id: "navigate-to-add-product",
    name: "Navigate to Add Product",
    description: "Navigate to the product creation page",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      await page.goto(`${baseUrl}/farmer-dashboard/products/bulk-upload`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: 0,
        logs: ["Navigated to product creation page"],
      };
    },
  },
  {
    id: "fill-product-details",
    name: "Fill Product Details",
    description: "Fill out product information",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, testData } = context;
      if (!page) throw new Error("Page not initialized");

      const season = context.season || "SPRING";
      const seasonalProducts = {
        SPRING: ["Fresh Lettuce", "Radishes", "Peas", "Strawberries"],
        SUMMER: ["Tomatoes", "Corn", "Peppers", "Watermelon"],
        FALL: ["Pumpkins", "Squash", "Apples", "Brussels Sprouts"],
        WINTER: ["Kale", "Carrots", "Potatoes", "Winter Squash"],
      };

      const productName =
        testData.productName ||
        seasonalProducts[season][Math.floor(Math.random() * 4)];
      const price = testData.price || "5.99";
      const stock = testData.stock || "100";
      const description =
        testData.description ||
        `Fresh organic ${productName.toLowerCase()} from our biodynamic farm.`;

      await page.fill('input[name="name"]', productName);
      await page.fill('input[name="price"]', price);
      await page.fill('input[name="stock"]', stock);
      await page.fill('textarea[name="description"]', description);

      context.state.productName = productName;

      return {
        success: true,
        duration: 0,
        logs: [`Filled product details for ${productName}`],
        agricultureData: {
          season,
          seasonallyAppropriate: true,
          productName,
        },
      };
    },
  },
  {
    id: "submit-product-listing",
    name: "Submit Product Listing",
    description: "Submit the product creation form",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      await page.click('button[type="submit"]');
      await page.waitForURL(/\/farmer\/products/, { timeout: 10000 });

      return {
        success: true,
        duration: 0,
        logs: ["Product listed successfully"],
      };
    },
  },
];

// ============================================================================
// WORKFLOW STEPS - ORDER PLACEMENT
// ============================================================================

const orderPlacementSteps: WorkflowStep[] = [
  {
    id: "navigate-to-products",
    name: "Navigate to Products",
    description: "Navigate to the products listing page",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      await page.goto(`${baseUrl}/products`);
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: 0,
        logs: ["Navigated to products page"],
      };
    },
  },
  {
    id: "add-product-to-cart",
    name: "Add Product to Cart",
    description: "Add a product to the shopping cart",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      // Click first "Add to Cart" button
      const addToCartButton = page
        .locator('button:has-text("Add to Cart")')
        .first();
      await addToCartButton.click();

      // Wait for cart update
      await page.waitForTimeout(1000);

      return {
        success: true,
        duration: 0,
        logs: ["Product added to cart"],
      };
    },
  },
  {
    id: "navigate-to-cart",
    name: "Navigate to Cart",
    description: "Navigate to the shopping cart",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      await page.click('a[href*="/cart"]');
      await page.waitForLoadState("networkidle");

      return {
        success: true,
        duration: 0,
        logs: ["Navigated to cart page"],
      };
    },
  },
  {
    id: "proceed-to-checkout",
    name: "Proceed to Checkout",
    description: "Proceed to the checkout page",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page } = context;
      if (!page) throw new Error("Page not initialized");

      await page.click('button:has-text("Checkout")');
      await page.waitForURL(/\/checkout/, { timeout: 10000 });

      return {
        success: true,
        duration: 0,
        logs: ["Proceeded to checkout"],
      };
    },
  },
];

// ============================================================================
// WORKFLOW STEPS - HEALTH CHECK
// ============================================================================

const healthCheckSteps: WorkflowStep[] = [
  {
    id: "check-api-health",
    name: "Check API Health",
    description: "Verify API health endpoint",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      const response = await page.request.get(`${baseUrl}/api/health`);
      const status = response.status();

      if (status !== 200) {
        throw new Error(`API health check failed with status ${status}`);
      }

      const data = await response.json();

      return {
        success: true,
        duration: 0,
        logs: ["API health check passed"],
        metrics: {
          apiResponseTime: data.responseTime || 0,
        },
      };
    },
  },
  {
    id: "check-database-health",
    name: "Check Database Health",
    description: "Verify database connectivity",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      const response = await page.request.get(`${baseUrl}/api/health`);
      const status = response.status();

      if (status !== 200 && status !== 503) {
        throw new Error(`Health endpoint check failed with status ${status}`);
      }

      const data = await response.json();

      if (data.checks?.database?.status !== "up") {
        throw new Error(
          `Database health check failed: ${data.checks?.database?.error || "Database is down"}`,
        );
      }

      return {
        success: true,
        duration: data.checks.database.responseTime || 0,
        logs: ["Database health check passed"],
        metrics: {
          databaseResponseTime: data.checks.database.responseTime || 0,
        },
      };
    },
  },
  {
    id: "check-homepage-load",
    name: "Check Homepage Load",
    description: "Verify homepage loads correctly",
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const { page, baseUrl } = context;
      if (!page) throw new Error("Page not initialized");

      const startTime = Date.now();
      await page.goto(baseUrl);
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      return {
        success: true,
        duration: loadTime,
        logs: [`Homepage loaded in ${loadTime}ms`],
        metrics: {
          pageLoadTime: loadTime,
        },
      };
    },
  },
];

// ============================================================================
// WORKFLOW CONFIGURATIONS
// ============================================================================

export const PREDEFINED_WORKFLOWS: WorkflowConfig[] = [
  {
    id: "user-registration",
    name: "User Registration Workflow",
    type: "USER_REGISTRATION",
    priority: "CRITICAL",
    enabled: true,
    schedule: {
      interval: 60, // Every hour
    },
    timeout: 120000, // 2 minutes
    retries: 3,
    tags: ["authentication", "critical", "user-journey"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "user-login",
    name: "User Login Workflow",
    type: "USER_LOGIN",
    priority: "CRITICAL",
    enabled: true,
    schedule: {
      interval: 30, // Every 30 minutes
    },
    timeout: 60000, // 1 minute
    retries: 3,
    tags: ["authentication", "critical", "user-journey"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "farm-creation",
    name: "Farm Creation Workflow",
    type: "FARM_CREATION",
    priority: "HIGH",
    enabled: true,
    schedule: {
      interval: 120, // Every 2 hours
    },
    timeout: 180000, // 3 minutes
    retries: 2,
    tags: ["farm", "core-feature", "user-journey"],
    dependencies: ["user-login"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
    agricultureAwareness: {
      seasonal: true,
      biodynamic: true,
      checkSoilHealth: false,
    },
  },
  {
    id: "product-listing",
    name: "Product Listing Workflow",
    type: "PRODUCT_LISTING",
    priority: "HIGH",
    enabled: true,
    schedule: {
      interval: 180, // Every 3 hours
    },
    timeout: 120000, // 2 minutes
    retries: 2,
    tags: ["product", "core-feature", "user-journey"],
    dependencies: ["user-login", "farm-creation"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
    agricultureAwareness: {
      seasonal: true,
      biodynamic: false,
      checkSoilHealth: false,
    },
  },
  {
    id: "order-placement",
    name: "Order Placement Workflow",
    type: "ORDER_PLACEMENT",
    priority: "CRITICAL",
    enabled: true,
    schedule: {
      interval: 60, // Every hour
    },
    timeout: 180000, // 3 minutes
    retries: 3,
    tags: ["order", "critical", "user-journey", "revenue"],
    dependencies: ["user-login"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
  {
    id: "health-check",
    name: "System Health Check",
    type: "HEALTH_CHECK",
    priority: "CRITICAL",
    enabled: true,
    schedule: {
      interval: 5, // Every 5 minutes
    },
    timeout: 30000, // 30 seconds
    retries: 1,
    tags: ["health", "monitoring", "infrastructure"],
    notifyOnFailure: true,
    notifyOnSuccess: false,
  },
];

// ============================================================================
// WORKFLOW STEP MAPPING
// ============================================================================

export const WORKFLOW_STEPS_MAP = new Map<string, WorkflowStep[]>([
  ["user-registration", userRegistrationSteps],
  ["user-login", userLoginSteps],
  ["farm-creation", farmCreationSteps],
  ["product-listing", productListingSteps],
  ["order-placement", orderPlacementSteps],
  ["health-check", healthCheckSteps],
]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getWorkflowById(id: string): WorkflowConfig | undefined {
  return PREDEFINED_WORKFLOWS.find((w) => w.id === id);
}

export function getWorkflowsByType(type: string): WorkflowConfig[] {
  return PREDEFINED_WORKFLOWS.filter((w) => w.type === type);
}

export function getWorkflowsByPriority(priority: string): WorkflowConfig[] {
  return PREDEFINED_WORKFLOWS.filter((w) => w.priority === priority);
}

export function getEnabledWorkflows(): WorkflowConfig[] {
  return PREDEFINED_WORKFLOWS.filter((w) => w.enabled);
}

export function getCriticalWorkflows(): WorkflowConfig[] {
  return PREDEFINED_WORKFLOWS.filter(
    (w) => w.priority === "CRITICAL" && w.enabled,
  );
}

export function getWorkflowSteps(workflowId: string): WorkflowStep[] {
  return WORKFLOW_STEPS_MAP.get(workflowId) || [];
}
