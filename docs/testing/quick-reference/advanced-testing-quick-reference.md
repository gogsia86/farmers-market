# 🚀 Advanced Testing Quick Reference Guide

**Fast lookup for common testing tasks and patterns**

---

## 🎯 Quick Commands

### Run Tests

```bash
# All advanced tests
npm run test:e2e:advanced && npm run test:api:integration && npm run test:database:integration

# E2E only
npm run test:e2e:advanced

# API only
npm run test:api:integration

# Database only
npm run test:database:integration

# Specific category
npm run test:api:farms
npm run test:database:transactions
```

### Debug Mode

```bash
# Interactive UI
npm run test:e2e:advanced:ui

# Headed browser
npm run test:e2e:advanced:headed

# With debugger
npm run test:e2e:advanced:debug
```

---

## 📚 Common Patterns

### Pattern 1: Multi-User E2E Test

```typescript
import { test } from "@playwright/test";
import {
  MultiUserOrchestrator,
  TestDataFactory,
} from "@/tests/utils/e2e-advanced-utils";

test("Multi-user workflow", async ({ browser }) => {
  const context = await browser.newContext();
  const orchestrator = new MultiUserOrchestrator(context);

  // Create test users
  const farmer = await TestDataFactory.createTestUser("FARMER");
  const customer = await TestDataFactory.createTestUser("CUSTOMER");

  // Setup
  await orchestrator.setupUsers([farmer, customer]);

  // Execute parallel actions
  await orchestrator.executeParallel([
    {
      userId: farmer.id,
      action: async (page) => {
        await page.goto("/dashboard/products/new");
        await page.fill('input[name="name"]', "Fresh Tomatoes");
        await page.click('button[type="submit"]');
      },
    },
    {
      userId: customer.id,
      action: async (page) => {
        await page.goto("/products");
        await page.click("text=Fresh Tomatoes");
      },
    },
  ]);

  // Cleanup
  await orchestrator.cleanup();
});
```

### Pattern 2: API Integration Test

```typescript
import { test } from "@playwright/test";
import { ApiClient, ApiAssertions } from "@/tests/utils/api-integration-utils";

test("API workflow", async () => {
  const client = new ApiClient();

  // Authenticate
  await client.authenticate("user@example.com", "password");

  // Create resource
  const response = await client.post("/api/farms", {
    name: "Test Farm",
    location: {
      address: "123 Test St",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
    },
  });

  // Assert success
  ApiAssertions.assertSuccess(response);
  expect(response.data).toHaveProperty("id");

  // Test performance
  await ApiAssertions.assertResponseTime(
    () => client.get(`/api/farms/${response.data.id}`),
    1000, // Max 1 second
  );
});
```

### Pattern 3: Database Transaction Test

```typescript
import { test, expect } from "@playwright/test";
import { TransactionTester } from "@/tests/utils/database-test-utils";
import { database } from "@/lib/database";

test("Transaction rollback", async () => {
  const tester = new TransactionTester();
  let userId: string;

  try {
    await tester.testRollback(
      [
        async () => {
          const user = await database.user.create({
            data: { email: "test@example.com", name: "Test", role: "CUSTOMER" },
          });
          userId = user.id;
          return user;
        },
        async () => {
          throw new Error("Intentional rollback");
        },
      ],
      1,
    );
  } catch (error) {
    // Expected
  }

  // Verify rollback
  const user = await database.user.findUnique({ where: { id: userId } });
  expect(user).toBeNull();
});
```

---

## 🛠️ Utility Cheat Sheet

### MultiUserOrchestrator

```typescript
const orchestrator = new MultiUserOrchestrator(context);

// Setup users
await orchestrator.setupUsers([user1, user2, user3]);

// Execute parallel
await orchestrator.executeParallel([
  {
    userId: user1.id,
    action: async (page) => {
      /* ... */
    },
  },
  {
    userId: user2.id,
    action: async (page) => {
      /* ... */
    },
  },
]);

// Execute sequential
await orchestrator.executeSequential([
  {
    userId: user1.id,
    action: async (page) => {
      /* ... */
    },
  },
  {
    userId: user2.id,
    action: async (page) => {
      /* ... */
    },
  },
]);

// Get specific page
const page = orchestrator.getPage(user1.id);

// Cleanup
await orchestrator.cleanup();
```

### NetworkController

```typescript
const network = new NetworkController(page);

// Intercept requests
await network.interceptRequests(/api\/products/);

// Mock response
await network.mockResponse(/api\/farms/, {
  status: 200,
  body: { success: true, data: mockData },
});

// Simulate slow network
await network.setNetworkConditions({
  downloadThroughput: 50 * 1024,
  uploadThroughput: 20 * 1024,
  latency: 500,
});

// Go offline
await network.goOffline();

// Get intercepted requests
const requests = network.getInterceptedRequests("POST", "/api/orders");
```

### ApiClient

```typescript
const client = new ApiClient("http://localhost:3000");

// Set auth token
client.setAuthToken("your-token");

// Or authenticate
await client.authenticate("email@example.com", "password");

// Make requests
const data = await client.get("/api/products");
const created = await client.post("/api/products", productData);
const updated = await client.put("/api/products/123", updates);
const deleted = await client.delete("/api/products/123");

// With params
const filtered = await client.get("/api/products", {
  params: { category: "VEGETABLES", page: "1" },
});
```

### ApiAssertions

```typescript
// Assert success
ApiAssertions.assertSuccess(response);

// Assert error
ApiAssertions.assertError(response, "NOT_FOUND");

// Assert pagination
ApiAssertions.assertPagination(response.meta.pagination, {
  page: 1,
  pageSize: 10,
});

// Assert response time
await ApiAssertions.assertResponseTime(() => client.get("/api/products"), 1000);

// Assert structure
ApiAssertions.assertStructure(response.data, {
  id: "string",
  name: "string",
  price: "number",
});

// Assert array
ApiAssertions.assertArray(response.data, 1, 100);

// Assert validation error
ApiAssertions.assertValidationError(response, "email", "Invalid email");
```

### DatabaseTestManager

```typescript
const dbManager = new DatabaseTestManager();

// Setup
await dbManager.setup();

// Get test data
const users = dbManager.getTestData("users");
const farms = dbManager.getTestData("farms");
const products = dbManager.getTestData("products");

// Create snapshot
await dbManager.createSnapshot("before-test");

// Restore snapshot
await dbManager.restoreSnapshot("before-test");

// Compare snapshots
const diff = dbManager.compareSnapshots("before", "after");
console.log("Added:", diff.added);
console.log("Removed:", diff.removed);

// Teardown
await dbManager.teardown();
```

### QueryPerformanceAnalyzer

```typescript
const analyzer = new QueryPerformanceAnalyzer();

// Measure single query
const { result, metrics } = await analyzer.measureQuery(
  async () => database.product.findMany(),
  "product-list",
);
console.log("Duration:", metrics.duration, "ms");

// Compare queries
const comparison = await analyzer.compareQueries([
  {
    name: "method-1",
    fn: async () => {
      /* ... */
    },
  },
  {
    name: "method-2",
    fn: async () => {
      /* ... */
    },
  },
]);
console.log("Fastest:", comparison.fastest);

// Generate report
console.log(analyzer.getReport());
```

### DataIntegrityValidator

```typescript
const validator = new DataIntegrityValidator();

// Validate all
const { valid, checks, violations } = await validator.validateAll();

if (!valid) {
  console.error(`Found ${violations} violations`);
  checks
    .filter((c) => !c.valid)
    .forEach((check) => {
      console.error(`${check.table}: ${check.constraint}`);
    });
}

// Validate specific constraints
const fkChecks = await validator.validateForeignKeys();
const uniqueChecks = await validator.validateUniqueConstraints();
const consistencyChecks = await validator.validateConsistency();
```

---

## 🎯 Test Data Factories

### Create Test User

```typescript
import { TestDataFactory } from "@/tests/utils/e2e-advanced-utils";

const admin = await TestDataFactory.createTestUser("ADMIN");
const farmer = await TestDataFactory.createTestUser("FARMER");
const customer = await TestDataFactory.createTestUser("CUSTOMER");
```

### Create Test Farm

```typescript
const farm = await TestDataFactory.createTestFarm(farmerId, {
  name: "Custom Farm Name",
  slug: "custom-slug",
});
```

### Create Test Product

```typescript
const product = await TestDataFactory.createTestProduct(farmId, {
  name: "Custom Product",
  price: 19.99,
  inventory: 50,
});
```

### Generate Test Data

```typescript
const email = TestDataFactory.generateEmail("test");
const username = TestDataFactory.generateUsername("user");
const farmData = TestDataFactory.generateFarmData();
const productData = TestDataFactory.generateProductData();
```

### Cleanup

```typescript
await TestDataFactory.cleanup({
  userIds: [user1.id, user2.id],
  farmIds: [farm1.id],
  productIds: [product1.id, product2.id],
  orderIds: [order1.id],
});
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

```typescript
import { debugLog } from "@/tests/utils/e2e-advanced-utils";

debugLog("Starting test", { userId: user.id });
debugLog("API call completed", { response: data });
```

### Take Screenshots

```typescript
await page.screenshot({ path: "debug-screenshot.png" });
```

### Generate Traces

```bash
npm run test:e2e:advanced -- --trace on
npx playwright show-trace trace.zip
```

### Console Logs

```typescript
page.on("console", (msg) => console.log("Browser log:", msg.text()));
```

### Pause Test

```typescript
await page.pause(); // Opens Playwright Inspector
```

---

## 📊 Performance Monitoring

### Page Performance

```typescript
import { PerformanceMonitor } from "@/tests/utils/e2e-advanced-utils";

const monitor = new PerformanceMonitor(page);

// Measure page load
const loadTime = await monitor.measurePageLoad("/products");
console.log("Load time:", loadTime, "ms");

// Collect Core Web Vitals
const vitals = await monitor.collectWebVitals();
console.log("LCP:", vitals.largestContentfulPaint);
console.log("FCP:", vitals.firstContentfulPaint);

// Trace operations
await monitor.startTrace("checkout");
// ... perform checkout ...
const duration = await monitor.endTrace("checkout");
console.log("Checkout took:", duration, "ms");
```

### API Performance

```typescript
import { ApiPerformanceMonitor } from "@/tests/utils/api-integration-utils";

const monitor = new ApiPerformanceMonitor();

// Measure API call
const duration = await monitor.measure("/api/products", () =>
  client.get("/api/products"),
);

// Get statistics
const stats = monitor.getStats("/api/products");
console.log("Average:", stats.avg, "ms");
console.log("P95:", stats.p95, "ms");

// Generate report
console.log(monitor.generateReport());
```

---

## 🚨 Common Issues & Solutions

### Issue: Tests timeout

**Solution:**

```typescript
test.setTimeout(60000); // 60 seconds
```

### Issue: Database connection errors

**Solution:**

```bash
npm run db:test:setup
```

### Issue: Flaky tests

**Solution:**

```typescript
// Use explicit waits
await page.waitForSelector('[data-testid="element"]', { state: "visible" });

// Add retries
test.describe.configure({ retries: 3 });
```

### Issue: Port conflicts

**Solution:**

```bash
npm run kill-server
lsof -ti:3000 | xargs kill -9
```

### Issue: Stale test data

**Solution:**

```typescript
test.beforeEach(async () => {
  await dbManager.cleanDatabase();
  await dbManager.seedTestData();
});
```

---

## 📋 Assert Helpers

### Basic Assertions

```typescript
// Existence
expect(element).toBeVisible();
expect(element).toBeHidden();
expect(element).toBeDisabled();
expect(element).toBeEnabled();

// Text
expect(element).toHaveText("Hello");
expect(element).toContainText("Hello");

// Values
expect(input).toHaveValue("test");
expect(checkbox).toBeChecked();

// Count
expect(elements).toHaveCount(5);

// URLs
await expect(page).toHaveURL(/products/);
await expect(page).toHaveTitle("Products");
```

### API Assertions

```typescript
// Response structure
expect(response).toHaveProperty("success", true);
expect(response.data).toHaveProperty("id");

// Data types
expect(typeof response.data.id).toBe("string");
expect(Array.isArray(response.data)).toBe(true);

// Numbers
expect(response.data.price).toBeGreaterThan(0);
expect(response.data.inventory).toBeLessThanOrEqual(1000);
```

### Database Assertions

```typescript
// Existence
expect(user).not.toBeNull();
expect(user).toBeDefined();

// Relationships
expect(farm.owner).toBeDefined();
expect(farm.products).toHaveLength(5);

// Values
expect(product.price).toBe(9.99);
expect(product.status).toBe("ACTIVE");
```

---

## 🎯 Best Practices

### ✅ DO

- Use descriptive test names
- Keep tests independent
- Clean up after tests
- Use test data factories
- Assert both success and error cases
- Monitor performance
- Document complex scenarios

### ❌ DON'T

- Share state between tests
- Use production data
- Leave orphaned test data
- Use generic assertions
- Skip error case testing
- Make unnecessary API calls
- Hardcode test values

---

## 📚 Resources

- **Full Documentation**: `tests/e2e/advanced/README.md`
- **Completion Summary**: `tests/DAY_18_ADVANCED_TESTING_COMPLETE.md`
- **NPM Scripts**: `tests/NPM_SCRIPTS_DAY_18.md`
- **Utilities**: Inline JSDoc in `tests/utils/`

---

**Version**: 3.0.0  
**Last Updated**: Day 18  
**Status**: Production Ready ✅
