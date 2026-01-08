# 🤖 Unified Bot Framework

**Comprehensive Testing & Monitoring System for Farmers Market Platform**

---

## 📖 Overview

The Unified Bot Framework (UBF) consolidates all testing and monitoring bots into a single, modular, and maintainable system. It replaces 4 separate bot implementations with a cohesive architecture that's easier to use, maintain, and extend.

### What's Included

- **Type System** - Complete TypeScript definitions
- **Browser Manager** - Playwright integration and utilities
- **Test Data Generator** - Dynamic test data creation
- **Selectors** - Centralized UI element selectors
- **Configuration** - Flexible configuration system with presets
- **CLI Interface** - Unified command-line interface

---

## 🚀 Quick Start

### 1. Run Tests

```bash
# Run complete MVP validation
npm run bot -- test mvp

# Run quick health checks
npm run bot -- test health

# Run with visible browser (debug mode)
npm run bot -- test mvp --headless=false
```

### 2. Start Monitoring

```bash
# Continuous monitoring (every 60 seconds)
npm run bot -- monitor --interval=60
```

### 3. Seed Database

```bash
npm run bot -- seed
```

---

## 📁 Directory Structure

```
src/lib/testing/
├── core/
│   ├── bot-engine.ts           # Main execution engine
│   ├── browser-manager.ts      # Playwright wrapper ✅
│   ├── test-runner.ts          # Test execution logic
│   └── report-generator.ts     # Unified reporting
├── modules/
│   ├── auth/                   # Authentication tests
│   ├── marketplace/            # Marketplace tests
│   ├── cart/                   # Shopping cart tests
│   ├── farmer/                 # Farmer dashboard tests
│   ├── admin/                  # Admin dashboard tests
│   └── health/                 # Health check tests
├── utils/
│   ├── test-data.ts           # Test data generator ✅
│   ├── selectors.ts           # Element selectors ✅
│   ├── assertions.ts          # Custom assertions
│   └── screenshots.ts         # Screenshot utilities
├── config/
│   ├── bot-config.ts          # Configuration system ✅
│   └── test-suites.ts         # Suite definitions
├── types.ts                   # Type definitions ✅
├── index.ts                   # Public API
└── README.md                  # This file
```

---

## 🎯 Core Components

### Browser Manager (`core/browser-manager.ts`)

Handles all browser interactions using Playwright:

```typescript
import { BrowserManager } from '@/lib/testing/core/browser-manager';
import { DEFAULT_BOT_CONFIG } from '@/lib/testing/config/bot-config';

const manager = new BrowserManager(DEFAULT_BOT_CONFIG);

// Initialize browser
await manager.initialize();

// Navigate to page
await manager.navigate('/products');

// Fill form
await manager.fillForm('input[name="email"]', 'test@example.com');

// Click and wait
await manager.clickAndWait('button[type="submit"]');

// Take screenshot
await manager.screenshot('test-result');

// Cleanup
await manager.cleanup();
```

**Features:**
- Automatic browser lifecycle management
- Built-in retry logic
- Screenshot capture
- Navigation helpers
- Form filling utilities
- Element interaction methods

### Test Data Generator (`utils/test-data.ts`)

Generates realistic test data dynamically:

```typescript
import { generateTestData } from '@/lib/testing/utils/test-data';

const data = generateTestData({
  includeFarmer: true,
  includeCustomer: true,
  includeProduct: true,
  includePayment: true,
});

console.log(data.farmer.email);     // farmer.1234567890@farmersmarket.test
console.log(data.customer.email);   // customer.1234567890@farmersmarket.test
console.log(data.product.name);     // Fresh Organic Tomatoes
console.log(data.payment.cardNumber); // 4242424242424242 (Stripe test)
```

**Features:**
- Dynamic data generation with timestamps
- Realistic names and addresses
- Product catalog
- Stripe test cards
- Seeded data access

### Selectors (`utils/selectors.ts`)

Centralized UI element selectors:

```typescript
import { SELECTORS } from '@/lib/testing/utils/selectors';

// Use predefined selectors
await page.fill(SELECTORS.auth.emailInput, 'test@example.com');
await page.fill(SELECTORS.auth.passwordInput, 'password');
await page.click(SELECTORS.auth.submitButton);

// Access by category
SELECTORS.common.loginButton
SELECTORS.marketplace.productCard
SELECTORS.cart.checkoutButton
SELECTORS.farmer.productNameInput
SELECTORS.admin.approveButton
```

**Features:**
- Single source of truth for selectors
- Grouped by page/feature
- Fallback selectors
- Easy maintenance

### Configuration (`config/bot-config.ts`)

Flexible configuration with presets:

```typescript
import { createConfig } from '@/lib/testing/config/bot-config';

// Use preset
const config = createConfig('mvp');

// Use preset with overrides
const config = createConfig('debug', {
  baseUrl: 'https://staging.example.com',
  browser: {
    slowMo: 1000,
  },
});

// From scratch
const config = createConfig(undefined, {
  name: 'Custom Test',
  baseUrl: 'http://localhost:3001',
  browser: {
    headless: false,
    timeout: 60000,
  },
  execution: {
    parallel: false,
    retries: 3,
  },
});
```

**Available Presets:**
- `quick` - Fast validation (critical tests only)
- `mvp` - Complete MVP validation
- `monitoring` - Continuous health monitoring
- `cicd` - CI/CD pipeline optimized
- `debug` - Development mode with traces

---

## 🎨 Configuration

### Environment Variables

```bash
# Core Settings
BASE_URL=http://localhost:3001
HEADLESS=true
SLOW_MO=0

# Credentials
TEST_USER_PASSWORD=YourPassword123!
ADMIN_EMAIL=admin@farmersmarket.app
ADMIN_PASSWORD=AdminPassword123!

# Bot Settings
BOT_TIMEOUT=60000
BOT_RETRIES=2
BOT_PARALLEL=false
BOT_MAX_CONCURRENCY=1

# Reporting
BOT_OUTPUT_DIR=./bot-reports
BOT_REPORT_FORMATS=json,markdown,console
BOT_SCREENSHOT_ON_FAILURE=true
BOT_SCREENSHOT_ON_SUCCESS=false
BOT_SAVE_TRACES=false

# Logging
BOT_LOG_LEVEL=info
BOT_LOG_CONSOLE=true
BOT_LOG_FILE=false
```

---

## 💻 CLI Usage

### Available Commands

```bash
# Test Commands
bot test [suite]        # Run test suite
bot monitor             # Start continuous monitoring
bot list                # List suites and modules
bot config              # Show configuration
bot seed                # Seed database
bot server [suite]      # Start server and run tests
bot help [command]      # Show help

# Examples
npm run bot -- test mvp
npm run bot -- test quick --headless=false
npm run bot -- monitor --interval=60
npm run bot -- list modules
npm run bot -- config debug
npm run bot -- seed
npm run bot -- server mvp
npm run bot -- help test
```

### Global Options

```bash
--baseUrl=URL           # Base URL to test
--headless=false        # Run browser in visible mode
--preset=NAME           # Use configuration preset
--modules=a,b,c         # Run specific modules only
--timeout=60000         # Override timeout
--retries=3             # Override retry count
```

---

## 🧩 Test Modules

### Module Categories

#### Authentication
- `auth-login` - User login flow
- `auth-register-farmer` - Farmer registration
- `auth-register-customer` - Customer registration
- `auth-logout` - Logout flow

#### Marketplace
- `marketplace-browse` - Product browsing
- `marketplace-search` - Search functionality
- `marketplace-filter` - Category filtering
- `marketplace-product-detail` - Product page

#### Shopping Cart
- `cart-add` - Add items to cart
- `cart-update` - Update quantities
- `cart-remove` - Remove items
- `cart-checkout` - Checkout flow
- `cart-payment` - Stripe payment

#### Farmer Dashboard
- `farmer-registration` - Complete onboarding
- `farmer-farm-setup` - Farm profile creation
- `farmer-product-create` - Add products
- `farmer-product-edit` - Edit products
- `farmer-orders` - Order dashboard

#### Admin Dashboard
- `admin-farm-approval` - Approve farms
- `admin-user-management` - Manage users
- `admin-order-management` - Manage orders

#### Health & Performance
- `health-check` - System health
- `health-database` - Database connectivity
- `health-api` - API endpoints
- `performance-page-load` - Page metrics
- `performance-api-response` - API metrics

---

## 📊 Reports

### Report Locations

```
bot-reports/
├── screenshots/           # Test screenshots
├── traces/               # Playwright traces
├── logs/                 # Log files
└── reports/              # Test reports (JSON, MD)
```

### Report Formats

- **JSON** - Machine-readable
- **Markdown** - Human-readable
- **HTML** - Visual reports (coming soon)
- **Console** - Real-time output

---

## 🔧 Creating Test Modules

### Example Module

```typescript
// src/lib/testing/modules/example/my-test.ts

import type { TestModule, TestContext, TestResult } from '@/lib/testing/types';

export const myTestModule: TestModule = {
  id: 'example-my-test',
  name: 'My Custom Test',
  description: 'Description of what this test does',
  category: 'MARKETPLACE',
  priority: 'HIGH',
  enabled: true,
  timeout: 30000,
  retries: 2,

  async execute(context: TestContext): Promise<TestResult> {
    const startTime = new Date();

    try {
      // Test logic
      await context.utils.navigate('/products');
      await context.page.waitForSelector('[data-testid="product-card"]');

      const count = await context.page.$$eval(
        '[data-testid="product-card"]',
        (els) => els.length
      );

      if (count === 0) {
        throw new Error('No products found');
      }

      return {
        id: `${this.id}-${Date.now()}`,
        moduleId: this.id,
        name: this.name,
        category: this.category,
        priority: this.priority,
        status: 'PASSED',
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        message: `Found ${count} products`,
      };

    } catch (error) {
      return {
        id: `${this.id}-${Date.now()}`,
        moduleId: this.id,
        name: this.name,
        category: this.category,
        priority: this.priority,
        status: 'FAILED',
        startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        message: 'Test failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
```

---

## 🐛 Troubleshooting

### Common Issues

#### Browser Not Initialized

```typescript
// Always initialize before use
await manager.initialize();
await manager.navigate('/');
await manager.cleanup();
```

#### Selector Not Found

```typescript
// Use fallback selectors
import { fallbackSelector } from '@/lib/testing/utils/selectors';

const selector = fallbackSelector(
  '[data-testid="email"]',
  'input[type="email"]',
  'input[name="email"]'
);
```

#### Test Timeout

```bash
# Increase timeout
npm run bot -- test mvp --timeout=120000
```

#### Debug Mode

```bash
# Run in debug mode
npm run bot -- test mvp --preset=debug

# Or with environment variables
HEADLESS=false SLOW_MO=500 BOT_LOG_LEVEL=debug npm run bot -- test mvp
```

---

## 📚 API Reference

### BrowserManager

```typescript
class BrowserManager {
  constructor(config: BotConfig)

  // Lifecycle
  async initialize(): Promise<void>
  async cleanup(): Promise<void>

  // Browser Access
  getBrowser(): Browser
  getContext(): BrowserContext
  getPage(): Page
  async newPage(): Promise<Page>

  // Navigation
  async navigate(url: string): Promise<void>
  async waitForNavigation(): Promise<void>

  // Interactions
  async fillForm(selector: string, value: string): Promise<void>
  async clickAndWait(selector: string): Promise<void>
  async waitForSelector(selector: string): Promise<void>
  async elementExists(selector: string): Promise<boolean>

  // Utilities
  async screenshot(name: string): Promise<string>
  async wait(ms: number): Promise<void>
  async retry<T>(fn: () => Promise<T>, attempts?: number): Promise<T>
  async clearSession(): Promise<void>
}
```

### TestDataGenerator

```typescript
class TestDataGenerator {
  generate(options?: GenerateOptions): TestData
  generateAdmin(): TestData['admin']
  generateFarmer(): TestData['farmer']
  generateCustomer(): TestData['customer']
  generateProduct(): TestData['product']
  generatePayment(): TestData['payment']
}

// Helper functions
function generateTestData(options?: GenerateOptions): TestData
function getSeededAdmin(): { email: string; password: string }
function getSeededFarmer(): { email: string; password: string }
function getStripeTestCard(): { number: string; expiry: string; cvc: string; zip: string }
```

---

## 📖 Related Documentation

- [Bot Consolidation Analysis](../../../BOT_CONSOLIDATION_ANALYSIS.md)
- [Unified Bot Framework Guide](../../../UNIFIED_BOT_FRAMEWORK.md)
- [Type Definitions](./types.ts)
- [Configuration Guide](./config/bot-config.ts)

---

## ✅ Implementation Status

| Component | Status | Progress |
|-----------|--------|----------|
| Types & Interfaces | ✅ Complete | 100% |
| Browser Manager | ✅ Complete | 100% |
| Test Data Generator | ✅ Complete | 100% |
| Selectors | ✅ Complete | 100% |
| Configuration | ✅ Complete | 100% |
| CLI Interface | ✅ Complete | 100% |
| Core Engine | 🚧 In Progress | 30% |
| Test Runner | 🚧 In Progress | 20% |
| Report Generator | 🚧 In Progress | 20% |
| Test Modules | 📅 Planned | 0% |

---

## 🤝 Contributing

### Adding New Test Modules

1. Create module file in appropriate category
2. Implement `TestModule` interface
3. Register in module index
4. Add to test suite definition
5. Update documentation

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Include error handling
- Log important steps

---

## 📞 Support

For help:
1. Check this documentation
2. Review examples in `scripts/bot-cli.ts`
3. Check troubleshooting section
4. Review main documentation

---

**Version:** 1.0.0
**Status:** Foundation Complete, Module Migration In Progress
**Last Updated:** 2024
