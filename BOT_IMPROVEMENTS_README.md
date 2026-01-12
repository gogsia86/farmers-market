# 🤖 Bot Infrastructure Improvements - Quick Start Guide

**Farmers Market Platform**  
**Version:** 2.0.0  
**Last Updated:** January 2025

---

## 🎯 What's New?

We've implemented **5 major improvements** to our bot testing infrastructure:

1. ✅ **Unified Authentication Service** - No more duplicated login code
2. ✅ **Visual Regression Testing** - Catch UI changes automatically
3. ✅ **Data-TestId Strategy** - Stable, reliable test selectors
4. ✅ **Testing Dashboard API** - Centralized test result visibility
5. ✅ **Test Data Seeding** - Consistent, reliable test data

---

## 🚀 Quick Start

### 1. Install Dependencies (if needed)

```bash
npm install
```

### 2. Set Up Test Data

```bash
# Seed test data (first time setup)
npm run seed:test

# Or clean and seed
npm run seed:test:clean
```

### 3. Run Improved Bots

```bash
# MVP Automation Bot (now with auth service + seeded data)
npm run bot:mvp

# Website Checker Bot
npm run bot:check

# Divine Monitoring Bot
npm run bot:divine
```

### 4. Create Visual Baselines

```bash
# Create baseline screenshots
npm run test:visual:baseline

# Later, compare against baseline
npm run test:visual:compare
```

### 5. Migrate Components to Data-TestId

```bash
# Preview changes (safe)
npm run migrate:testid:dry

# Apply changes
npm run migrate:testid
```

---

## 📚 Detailed Guides

### Using the Unified Authentication Service

**Import:**

```typescript
import { createAuthService, quickLogin } from "@/lib/testing/auth-service";
```

**Basic Usage:**

```typescript
// Create service
const authService = createAuthService({
  baseUrl: "http://localhost:3001",
});

// Login as customer
const session = await authService.loginAsCustomer(page);

// Login as farmer
const session = await authService.loginAsFarmer(page);

// Login as admin
const session = await authService.loginAsAdmin(page);

// Logout
await authService.logout(page);
```

**Quick Login Helper:**

```typescript
// One-liner login
const session = await quickLogin(page, "customer", "http://localhost:3001");
```

**API Login (Faster):**

```typescript
// Skip UI, login via API
const session = await authService.loginViaAPI(
  page,
  { email: "test@example.com", password: "password" },
  "customer",
);
```

**Session Management:**

```typescript
// Get current session
const session = authService.getCurrentSession();

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}

// Verify session is still valid
const isValid = await authService.verifySession(page);
```

---

### Visual Regression Testing

**Create Baselines:**

```bash
npm run test:visual:baseline
```

**Compare Against Baseline:**

```bash
npm run test:visual:compare
```

**Review Results:**

- Screenshots: `./visual-tests/screenshots/`
- Baselines: `./visual-tests/baseline/`
- Diffs: `./visual-tests/diffs/`
- Reports: `./visual-tests/reports/`

**Chromatic Integration (CI/CD):**

```bash
# Set up Chromatic token
export CHROMATIC_PROJECT_TOKEN=your-token

# Run Chromatic
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
```

**Tested Pages:**

- Homepage, Marketplace, Login, Registration
- Farm profiles, Product details
- Cart, Checkout, Dashboards
- Error pages

**Tested Viewports:**

- 📱 Mobile (320x568, 375x812)
- 📱 Tablet (768x1024, 1024x768)
- 💻 Desktop (1280x720, 1920x1080)

---

### Data-TestId Strategy

**Naming Convention:**

```typescript
// Format: {component-name}-{element-type}
<button data-testid="submit-button">Submit</button>
<input data-testid="email-input" type="email" />
<form data-testid="login-form">...</form>
<div data-testid="farm-card">...</div>
```

**Migration Tool:**

```bash
# Preview changes (dry run)
npm run migrate:testid:dry

# Apply to all components
npm run migrate:testid

# Apply to specific directory
npm run migrate:testid -- --path=src/components/ui
```

**Using in Tests:**

```typescript
// Old way (brittle)
await page.click("button.submit-btn");

// New way (stable)
await page.click('[data-testid="submit-button"]');

// With Playwright
await page.waitForSelector('[data-testid="login-form"]');
const button = page.locator('[data-testid="submit-button"]');
```

**Documentation:**
See `DATA_TESTID_CONVENTIONS.md` for complete guidelines.

---

### Test Data Seeding

**Seed Commands:**

```bash
# Essential data (customer, farmer, admin, 1 farm, 1 product)
npm run seed:test

# Clean existing test data first
npm run seed:test:clean

# Comprehensive data (10 customers, 5 farmers, 10 farms, 50 products)
npm run seed:test:comprehensive
```

**Using in Tests:**

```typescript
import {
  seedEssentialData,
  getTestDataReferences,
  TEST_IDS,
} from "@/lib/testing/seed-data";

// Seed before tests
await seedEssentialData({ clean: true, verbose: true });

// Get references to seeded data
const { customer, farmer, farm, products } = await getTestDataReferences();

// Use predefined test IDs
const customerEmail = TEST_IDS.customer.email;
const farmSlug = TEST_IDS.farm.slug;
```

**Factory Functions:**

```typescript
import {
  UserFactory,
  FarmFactory,
  ProductFactory,
} from "@/lib/testing/seed-data";

// Create test users
const customerData = UserFactory.customer();
const farmerData = UserFactory.farmer({ email: "custom@test.com" });
const users = UserFactory.batch(10, "customer");

// Create test farms
const farmData = FarmFactory.create(farmerId);
const organicFarm = FarmFactory.organic(farmerId);
const farms = FarmFactory.batch([farmer1.id, farmer2.id], 5);

// Create test products
const productData = ProductFactory.vegetable(farmId, "Tomatoes");
const fruitData = ProductFactory.fruit(farmId, "Apples");
const products = ProductFactory.batch([farm1.id, farm2.id], 20);
```

**Cleanup:**

```typescript
import { cleanTestData } from "@/lib/testing/seed-data";

// Clean all test data
await cleanTestData(true); // verbose = true
```

---

### Testing Dashboard API

**Get Dashboard Stats:**

```typescript
import { TestDashboardAPI } from "@/lib/testing/dashboard/api";

// Get current status and statistics
const stats = await TestDashboardAPI.getDashboardStats();

console.log(stats.currentStatus); // 'healthy' | 'degraded' | 'critical'
console.log(stats.overallPassRate); // 95.5
console.log(stats.totalTests); // 1250
```

**Get Recent Runs:**

```typescript
// Get last 20 test runs
const runs = await TestDashboardAPI.getRecentRuns(20);

runs.forEach((run) => {
  console.log(`${run.type}: ${run.summary.passRate}% pass rate`);
});
```

**Get Metrics:**

```typescript
// Get metrics for past week
const metrics = await TestDashboardAPI.getMetrics("week");

console.log("Flaky Tests:");
metrics.flakyTests.forEach((test) => {
  console.log(`  ${test.testName}: ${test.failureRate}%`);
});

console.log("Slowest Tests:");
metrics.slowestTests.forEach((test) => {
  console.log(`  ${test.testName}: ${test.averageDuration}ms`);
});
```

**Search Runs:**

```typescript
// Search for specific test runs
const results = await TestDashboardAPI.searchRuns("login");
```

---

## 🔧 Integration Examples

### Update Your Bot to Use New Features

**Before (Old Way):**

```typescript
class MyBot {
  async testLogin() {
    // Manual login
    await page.goto("http://localhost:3001/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
  }
}
```

**After (New Way):**

```typescript
import { createAuthService } from "@/lib/testing/auth-service";
import { seedEssentialData } from "@/lib/testing/seed-data";

class MyBot {
  private authService!: AuthService;

  async init() {
    // Seed test data
    await seedEssentialData({ clean: true, verbose: false });

    // Create auth service
    this.authService = createAuthService({
      baseUrl: "http://localhost:3001",
    });
  }

  async testLogin() {
    // One-liner login
    const session = await this.authService.loginAsCustomer(this.page);
    console.log(`Logged in as: ${session.email}`);
  }

  async testWithSelectors() {
    // Use data-testid selectors
    await this.page.click('[data-testid="submit-button"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }
}
```

---

## 📊 Available Scripts

### Testing Scripts

```bash
# Bot testing
npm run bot:mvp                    # MVP automation bot
npm run bot:check                  # Website checker
npm run bot:check:continuous       # Continuous monitoring
npm run bot:divine                 # Divine monitoring bot
npm run bot:quick                  # Quick validation

# Visual regression
npm run test:visual:baseline       # Create baselines
npm run test:visual:compare        # Compare against baseline

# Data seeding
npm run seed:test                  # Seed essential data
npm run seed:test:clean            # Clean + seed
npm run seed:test:comprehensive    # Seed comprehensive data

# Migration
npm run migrate:testid             # Add data-testid to components
npm run migrate:testid:dry         # Dry run (preview changes)
```

---

## 📁 File Structure

```
src/
├── lib/
│   └── testing/
│       ├── auth-service.ts          # ✅ NEW: Unified authentication
│       ├── seed-data.ts             # ✅ NEW: Test data factories
│       ├── config/
│       │   └── bot-config.ts        # Existing: Bot configuration
│       ├── core/
│       │   └── bot-engine.ts        # Existing: Bot engine
│       └── dashboard/
│           └── api.ts               # ✅ NEW: Dashboard API

scripts/
├── visual-regression-test.ts       # ✅ NEW: Visual testing
├── add-testid-migration.ts         # ✅ NEW: TestId migration
├── seed-test-data.ts               # Existing: Test data seeding
├── mvp-automation-bot.ts           # Existing: MVP bot
├── website-checker-bot.ts          # Existing: Health checker
└── bot-cli.ts                      # Existing: CLI interface

.chromatic.yml                      # ✅ NEW: Chromatic config
DATA_TESTID_CONVENTIONS.md          # ✅ NEW: TestId guidelines
BOT_INFRASTRUCTURE_ANALYSIS.md      # ✅ NEW: Analysis document
IMPLEMENTATION_COMPLETE.md          # ✅ NEW: Implementation summary
```

---

## 🎓 Best Practices

### Authentication

- ✅ Use `loginViaAPI` for faster tests (no UI interaction)
- ✅ Use `loginAsCustomer/Farmer/Admin` for UI testing
- ✅ Always logout after test completion
- ✅ Check session validity before operations

### Test Selectors

- ✅ Always use `data-testid` for test selectors
- ✅ Never use CSS classes or complex selectors
- ✅ Follow naming convention: `{component}-{type}`
- ✅ Use dynamic testids for list items: `product-card-${id}`

### Test Data

- ✅ Seed data at the start of test suites
- ✅ Clean data after test completion
- ✅ Use factory functions for consistent data
- ✅ Use predefined TEST_IDS for common entities

### Visual Testing

- ✅ Create baselines after UI is stable
- ✅ Update baselines when UI changes are intentional
- ✅ Test all critical viewports
- ✅ Review diffs before approving changes

---

## 🐛 Troubleshooting

### Authentication Issues

**Problem:** Login fails with "Login form not found"  
**Solution:** Ensure form has data-testid or update selector fallbacks

**Problem:** Session not persisting  
**Solution:** Check cookie domain matches baseUrl

### Visual Testing Issues

**Problem:** All tests fail with "No baseline found"  
**Solution:** Run `npm run test:visual:baseline` first

**Problem:** False positives in visual diffs  
**Solution:** Adjust threshold in `scripts/visual-regression-test.ts`

### Test Data Issues

**Problem:** "Test data not found"  
**Solution:** Run `npm run seed:test` before running tests

**Problem:** Database connection errors  
**Solution:** Ensure database is running and `.env` is configured

### TestId Migration Issues

**Problem:** Elements already have data-testid  
**Solution:** Tool skips elements with existing testids (safe)

**Problem:** Wrong testid generated  
**Solution:** Manual fix or customize naming convention

---

## 📖 Additional Resources

### Documentation

- `BOT_INFRASTRUCTURE_ANALYSIS.md` - Full analysis and recommendations
- `IMPLEMENTATION_COMPLETE.md` - Implementation details and examples
- `DATA_TESTID_CONVENTIONS.md` - Complete testid guidelines

### External Resources

- [Playwright Documentation](https://playwright.dev/)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🎯 Next Steps

1. **This Week:**
   - [ ] Seed test data: `npm run seed:test`
   - [ ] Create visual baselines: `npm run test:visual:baseline`
   - [ ] Run migration tool: `npm run migrate:testid:dry`

2. **This Month:**
   - [ ] Update existing bots to use AuthService
   - [ ] Apply testid migration to all components
   - [ ] Set up Chromatic project
   - [ ] Build dashboard UI (planned)

3. **Long Term:**
   - [ ] Integrate cross-browser testing
   - [ ] Add AI-powered test generation
   - [ ] Implement distributed execution
   - [ ] Performance budget enforcement

---

## 💡 Tips & Tricks

### Speed Up Tests

```typescript
// Use API login instead of UI login
const session = await authService.loginViaAPI(page, credentials, "customer");
// 10x faster than UI login!
```

### Debug Visual Tests

```typescript
// Run visual tests with headed browser
HEADLESS=false npm run test:visual:compare
```

### Quick Test Data Reset

```bash
# Clean and reseed in one command
npm run seed:test:clean
```

### Find Flaky Tests

```typescript
// Use dashboard API
const metrics = await TestDashboardAPI.getMetrics("week");
console.log("Flaky Tests:", metrics.flakyTests);
```

---

## 🤝 Contributing

When adding new tests or bots:

1. Use the unified AuthService for authentication
2. Add data-testid to new components
3. Use seeded test data instead of dynamic data
4. Add visual regression tests for critical pages
5. Document any new patterns or conventions

---

## 📞 Support

For questions or issues:

- Check this README first
- Review the detailed documentation files
- Check examples in existing bots
- Reach out to the engineering team

---

**Status:** ✅ READY TO USE  
**Version:** 2.0.0  
**Last Updated:** January 2025

---

_Happy Testing! 🚀_
