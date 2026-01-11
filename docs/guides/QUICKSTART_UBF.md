# 🚀 Quick Start Guide - Unified Bot Framework

**Get started with the Unified Bot Framework in 5 minutes**

---

## 📋 Prerequisites

```bash
# Node.js 18+ and npm installed
node --version  # Should be 18.0.0 or higher

# Install dependencies (if not already done)
npm install

# Ensure Playwright browsers are installed
npx playwright install chromium
```

---

## 🎯 Quick Examples

### 1. Run Your First Test Module

```typescript
// example.ts
import { createTestRunner, createConfig } from "@/lib/testing";
import { loginAsFarmerModule } from "@/lib/testing/modules/auth";

async function runTest() {
  // Create test runner with quick preset
  const config = createConfig("quick");
  const runner = createTestRunner(config);

  // Register module
  runner.registerModules([loginAsFarmerModule]);

  // Run the test
  const report = await runner.runModule("auth.login.farmer");

  // Check results
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);

  // Cleanup
  await runner.cleanup();
}

runTest().catch(console.error);
```

**Run it:**

```bash
npx tsx example.ts
```

---

### 2. Run Multiple Tests in a Suite

```typescript
import { createTestRunner, createSuite, createConfig } from "@/lib/testing";
import { loginModules } from "@/lib/testing/modules/auth";

async function runSuite() {
  const runner = createTestRunner(createConfig("mvp"));

  // Register all login modules
  runner.registerModules(loginModules);

  // Create a suite
  const authSuite = createSuite("auth-suite", "Authentication Tests", [
    "auth.login.customer",
    "auth.login.farmer",
    "auth.login.admin",
  ]);

  runner.registerSuites([authSuite]);

  // Run suite in parallel
  const report = await runner.runSuite("auth-suite", "parallel");

  console.log(`Success Rate: ${report.summary.successRate.toFixed(2)}%`);

  await runner.cleanup();
}

runSuite().catch(console.error);
```

---

### 3. Generate Reports

```typescript
import { createTestRunner, createReportGenerator } from "@/lib/testing";
import { loginModules } from "@/lib/testing/modules/auth";

async function runWithReports() {
  const runner = createTestRunner(createConfig("mvp"));
  runner.registerModules(loginModules);

  // Run tests
  const report = await runner.runAll();

  // Generate reports in multiple formats
  const generator = createReportGenerator({
    outputDir: "./test-results",
    formats: ["json", "markdown", "html", "console"],
  });

  const generated = await generator.generateReports(report);

  generated.forEach((result) => {
    if (result.success) {
      console.log(`✅ ${result.format} report: ${result.path}`);
    }
  });

  await runner.cleanup();
}

runWithReports().catch(console.error);
```

---

### 4. Using the CLI

The framework includes a CLI for common operations:

```bash
# Run MVP validation suite
npm run bot test mvp

# Run health checks
npm run bot test health

# Start monitoring (every 60 seconds)
npm run bot monitor --interval=60

# List available test suites
npm run bot list

# Run with custom config
npm run bot test mvp --config=./my-config.json

# Run in debug mode (headed browser)
npm run bot test mvp --headless=false --verbose
```

---

## 🏗️ Creating Your Own Module

### Step 1: Create Module File

```typescript
// src/lib/testing/modules/my-feature/my-test.module.ts
import type { BotModule, BotResult } from "@/lib/testing/types";
import type { ModuleExecutionContext } from "@/lib/testing/core/bot-engine";
import { createAssertions } from "@/lib/testing/utils/assertions";

export const myTestModule: BotModule = {
  id: "my-feature.my-test",
  name: "My Feature Test",
  category: "my-feature",
  description: "Tests my awesome feature",
  tags: ["my-feature", "important"],
  enabled: true,
  retryOnFailure: true,
  timeout: 30000,

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager } = context;
    const page = browserManager.getPage();
    const assertions = createAssertions(page);

    try {
      // Navigate to page
      await browserManager.navigateTo("/my-feature");

      // Perform assertions
      const result = await assertions.isVisible(
        '[data-testid="feature-element"]',
      );

      if (!result.passed) {
        return {
          status: "failed",
          error: "Feature element not found",
          screenshot: result.screenshot,
        };
      }

      // More test logic...

      return {
        status: "success",
        details: {
          message: "Feature works correctly",
        },
      };
    } catch (error) {
      const screenshot = await browserManager.takeScreenshot("my-test-failed");

      return {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        screenshot,
      };
    }
  },
};
```

### Step 2: Export from Index

```typescript
// src/lib/testing/modules/my-feature/index.ts
export { myTestModule } from "./my-test.module";
```

### Step 3: Use Your Module

```typescript
import { createTestRunner } from "@/lib/testing";
import { myTestModule } from "@/lib/testing/modules/my-feature";

const runner = createTestRunner(createConfig("quick"));
runner.registerModules([myTestModule]);

const report = await runner.runModule("my-feature.my-test");
await runner.cleanup();
```

---

## 🧪 Common Testing Patterns

### Pattern 1: Login Before Test

```typescript
export const myAuthenticatedTestModule: BotModule = {
  id: "feature.authenticated-test",
  name: "Authenticated Feature Test",
  // ... other config

  async execute(context: ModuleExecutionContext): Promise<BotResult> {
    const { browserManager, suiteContext } = context;
    const page = browserManager.getPage();

    // Reuse login from suite context if available
    if (!suiteContext?.authenticated) {
      const farmer = getSeededFarmer();
      await browserManager.navigateTo("/login");
      await page.fill('[data-testid="email-input"]', farmer.email);
      await page.fill('[data-testid="password-input"]', farmer.password);
      await page.click('[data-testid="submit-button"]');
      await page.waitForURL("**/farmer/**");

      // Store in context for other modules
      if (suiteContext) {
        suiteContext.authenticated = true;
      }
    }

    // Now test your authenticated feature
    await browserManager.navigateTo("/my-protected-page");
    // ... rest of test
  },
};
```

### Pattern 2: Suite with Setup/Teardown

```typescript
import { createSuite } from "@/lib/testing";

const mySuite = createSuite(
  "feature-suite",
  "Feature Test Suite",
  ["feature.test1", "feature.test2", "feature.test3"],
  {
    // Setup runs once before all tests
    setup: async (context) => {
      console.log("Suite starting...");
      context.startTime = Date.now();
      // Could seed database, start services, etc.
    },

    // Teardown runs once after all tests
    teardown: async (context) => {
      console.log(`Suite completed in ${Date.now() - context.startTime}ms`);
      // Could cleanup data, stop services, etc.
    },

    stopOnFailure: false, // Continue even if a test fails
    tags: ["integration"],
  },
);
```

### Pattern 3: Assertions with Screenshots

```typescript
const assertions = createAssertions(page);

// Standard assertion
const result = await assertions.isVisible('[data-testid="button"]');
if (!result.passed) {
  // result.screenshot contains path to failure screenshot
  console.error("Button not found:", result.screenshot);
  return { status: "failed", screenshot: result.screenshot };
}

// Expect-style (throws on failure)
try {
  await expect(page).toBeVisible('[data-testid="button"]');
  await expect(page).toHaveText("h1", "Welcome");
  await expect(page).toHaveURL("/dashboard");
} catch (error) {
  // Will throw AssertionError with details
}
```

### Pattern 4: Custom Screenshot Management

```typescript
import { createScreenshotManager } from "@/lib/testing";

const screenshots = createScreenshotManager("./my-screenshots");

// Capture at specific points
await screenshots.capture(page, "before-action");

// Do something
await page.click('[data-testid="action-button"]');

await screenshots.capture(page, "after-action");

// Capture element only
await screenshots.captureElement(page, '[data-testid="modal"]', "modal-view");

// Save metadata
await screenshots.saveMetadata();

// Cleanup old screenshots (keep last 7 days)
await screenshots.cleanup(7);
```

---

## 🎛️ Configuration Presets

The framework includes several pre-configured presets:

### Quick Validation

```typescript
const config = createConfig("quick");
// - Headless: true
// - Timeout: 10s
// - No retries
// - No screenshots
// Perfect for: Fast feedback during development
```

### MVP Validation

```typescript
const config = createConfig("mvp");
// - Headless: true
// - Timeout: 30s
// - 2 retry attempts
// - Screenshots on failure
// Perfect for: Full feature testing
```

### Monitoring

```typescript
const config = createConfig("monitoring");
// - Headless: true
// - Timeout: 20s
// - 3 retry attempts
// - Screenshots on failure
// Perfect for: Continuous health checks
```

### CI/CD

```typescript
const config = createConfig("cicd");
// - Headless: true
// - Timeout: 60s
// - No retries
// - Screenshots on failure
// - Optimized for CI environments
// Perfect for: GitHub Actions, Jenkins, etc.
```

### Debug

```typescript
const config = createConfig("debug");
// - Headless: false (visible browser)
// - Timeout: 300s (5 min)
// - No retries
// - Screenshots on failure
// - Slow motion
// Perfect for: Debugging failing tests
```

### Custom Configuration

```typescript
import { mergeConfigs, DEFAULT_BOT_CONFIG } from "@/lib/testing";

const myConfig = mergeConfigs(DEFAULT_BOT_CONFIG, {
  baseUrl: "https://staging.example.com",
  headless: false,
  timeout: 60000,
  retryAttempts: 3,
  screenshot: "always", // or 'on-failure' or 'never'
});
```

---

## 🔍 Debugging Tips

### 1. Run with Visible Browser

```typescript
const config = createConfig("debug"); // Headless: false
const runner = createTestRunner(config);
```

### 2. Enable Verbose Logging

```typescript
const config = createConfig("quick");
config.verbose = true;
const runner = createTestRunner(config);
```

### 3. Add Breakpoints in Modules

```typescript
async execute(context: ModuleExecutionContext): Promise<BotResult> {
  const page = browserManager.getPage();

  // Pause for manual inspection
  await page.pause(); // Playwright debugger

  // Or add delays
  await page.waitForTimeout(5000); // 5 second pause
}
```

### 4. Capture Screenshots at Key Points

```typescript
await browserManager.takeScreenshot("before-click");
await page.click('[data-testid="button"]');
await browserManager.takeScreenshot("after-click");
```

### 5. Check Network Requests

```typescript
page.on("request", (request) => {
  console.log("Request:", request.url());
});

page.on("response", (response) => {
  console.log("Response:", response.url(), response.status());
});
```

---

## 📊 Understanding Test Reports

### Console Output

```
📊 SUMMARY:
  Total:        5
  ✅ Passed:    4
  ❌ Failed:    1
  Success Rate: 80.00%
```

### JSON Report (`test-report-*.json`)

```json
{
  "summary": {
    "total": 5,
    "passed": 4,
    "failed": 1,
    "successRate": 80
  },
  "results": [
    {
      "moduleId": "auth.login.farmer",
      "status": "success",
      "duration": 2456
    }
  ]
}
```

### Markdown Report (`test-report-*.md`)

Human-readable report with:

- Summary table
- Failed test details with errors
- Passed test list
- Configuration snapshot
- Trend analysis (if historical data available)

### HTML Report (`test-report-*.html`)

Visual dashboard with:

- Color-coded metrics
- Progress bars
- Interactive elements
- Screenshot links
- Professional styling

---

## 🔗 Integration Examples

### GitHub Actions

```yaml
# .github/workflows/tests.yml
name: Bot Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install chromium

      - name: Run tests
        run: npm run bot test mvp

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: test-results/
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Install Playwright dependencies
RUN npx playwright install --with-deps chromium

COPY . .

CMD ["npm", "run", "bot", "test", "mvp"]
```

---

## 📚 Next Steps

1. **Explore Sample Modules**
   - Check `src/lib/testing/modules/auth/` for login examples
   - Use as templates for your own modules

2. **Read Full Documentation**
   - `UNIFIED_BOT_FRAMEWORK.md` - Complete framework guide
   - `PHASE_2_IMPLEMENTATION.md` - Architecture details
   - `src/lib/testing/README.md` - Developer reference

3. **Migrate Existing Tests**
   - Follow the migration pattern in Phase 2 docs
   - Start with critical path tests
   - Test in parallel with old scripts initially

4. **Add to CI/CD**
   - Integrate into your build pipeline
   - Set up failure notifications
   - Store reports as artifacts

---

## 🆘 Troubleshooting

### "Module not found" errors

```bash
# Make sure TypeScript paths are configured
# Check tsconfig.json has "@/*": ["./src/*"]
```

### "Browser not found" errors

```bash
# Reinstall Playwright browsers
npx playwright install chromium
```

### Tests timing out

```typescript
// Increase timeout in config
const config = createConfig("mvp");
config.timeout = 60000; // 60 seconds
```

### Screenshots not saving

```bash
# Ensure output directory exists and is writable
mkdir -p ./test-results/screenshots
chmod 755 ./test-results
```

---

## 💡 Pro Tips

1. **Use Tags for Organization**

   ```typescript
   tags: ["critical", "auth", "slow"];
   // Then filter: runner.runAll({ tags: ['critical'] })
   ```

2. **Leverage Suite Context for State**

   ```typescript
   // Share data between modules in a suite
   context.suiteContext.userData = { ... };
   ```

3. **Combine with Test Data Generators**

   ```typescript
   import { generateTestData } from "@/lib/testing";
   const testData = generateTestData();
   ```

4. **Run Tests in Parallel for Speed**

   ```typescript
   await runner.runSuite("my-suite", "parallel");
   // Or limited parallel:
   await runner.runSuite("my-suite", "limited-parallel");
   ```

5. **Monitor Production with Health Checks**
   ```typescript
   // Set up continuous monitoring
   await runner.startMonitoring("health-suite", 300); // Every 5 min
   ```

---

**Happy Testing! 🌾**

For more help, see:

- Full docs: `UNIFIED_BOT_FRAMEWORK.md`
- Phase 2 details: `PHASE_2_IMPLEMENTATION.md`
- Issues: Create a GitHub issue in the repository
