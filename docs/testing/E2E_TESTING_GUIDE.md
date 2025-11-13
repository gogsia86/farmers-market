# 🧪 E2E Testing Setup Guide

## Overview

This guide covers setting up and running end-to-end (E2E) tests for the Farmers Market Platform using Playwright.

## Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL database (local or remote)
- npm 9.0.0 or higher

## Quick Start

### 1. Install Dependencies

```bash
npm install
npx playwright install
```

### 2. Setup Test Database

```bash
npm run db:test:setup
```

This will:

- Reset the database schema
- Run all migrations
- Seed test data with users, farms, and products
- Verify test credentials

### 3. Run E2E Tests

```bash
# Run all tests headless
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## Test Credentials

After running `npm run db:test:setup`, you'll have these test accounts:

### Admin Account

- **Email**: `admin@farmersmarket.app`
- **Password**: `DivineAdmin123!`
- **Role**: ADMIN
- **Access**: Full platform administration

### Farmer Account

- **Email**: `ana.romana@email.com`
- **Password**: `FarmLife2024!`
- **Role**: FARMER
- **Access**: Farm management, product listings, orders

### Consumer Account

- **Email**: `divna.kapica@email.com`
- **Password**: `HealthyEating2024!`
- **Role**: CONSUMER
- **Access**: Product browsing, shopping cart, orders

## Test Structure

```
tests/
└── e2e/
    └── critical-flows.spec.ts  # Main E2E test suite
```

## Test Coverage

### Authentication Flows ✅

- Admin login
- Failed login error handling
- Session management

### Customer Shopping Flow ✅

- Browse farms and products
- Add products to cart
- Complete checkout process
- Order confirmation

### Farmer Management Flow ✅

- View farmer dashboard
- Add new products
- View orders
- Update inventory

### Admin Management Flow ✅

- View all farms
- View all orders
- Verify farms
- Platform analytics

### Search and Filters ✅

- Product search
- Category filtering
- Price range filters
- Organic filters

### Responsive Design ✅

- Mobile navigation
- Tablet layouts
- Desktop layouts

### Accessibility ✅

- Heading structure
- Form labels
- ARIA attributes
- Keyboard navigation

## Component Test IDs

The following `data-testid` attributes are available for testing:

### Navigation

- `browse-farms-link` - Farms navigation link
- `cart-button` - Shopping cart button
- `cart-count` - Cart item count badge
- `mobile-menu-button` - Mobile menu toggle
- `mobile-menu` - Mobile menu container

### Products

- `add-to-cart` - Add to cart button
- `data-category="VEGETABLES"` - Category filter buttons

### Farms

- `farm-card` - Farm listing card

### Cart

- `cart-item` - Individual cart item

## Running Tests in CI/CD

### Environment Variables

Set these in your CI/CD environment:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
NEXTAUTH_SECRET="your-test-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Setup test database
        run: npm run db:test:setup
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          NEXTAUTH_SECRET: test-secret-key-min-32-chars-long
          NEXTAUTH_URL: http://localhost:3000
          NEXT_PUBLIC_APP_URL: http://localhost:3000

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests failing to find elements

**Issue**: Elements not found during test execution

**Solutions**:

1. Ensure dev server is running: `npm run dev`
2. Verify database is seeded: `npm run db:test:setup`
3. Check that port 3000 is available
4. Review element selectors match actual components

### Authentication failures

**Issue**: Tests can't log in

**Solutions**:

1. Re-run database setup: `npm run db:test:setup`
2. Verify test credentials are correct
3. Check NextAuth configuration
4. Ensure `NEXTAUTH_SECRET` is set

### Timeout errors

**Issue**: Tests timeout waiting for elements

**Solutions**:

1. Increase timeout in `playwright.config.ts`
2. Check network conditions
3. Verify dev server is responsive
4. Review test for race conditions

### Database connection issues

**Issue**: Can't connect to database

**Solutions**:

1. Verify `DATABASE_URL` in `.env`
2. Check PostgreSQL is running
3. Ensure database exists
4. Test connection: `npx prisma db push`

## Best Practices

### 1. Use Test IDs

Always use `data-testid` for stable selectors:

```tsx
// ✅ Good
<button data-testid="add-to-cart">Add to Cart</button>;

// ❌ Bad (text can change)
await page.click("text=Add to Cart");
```

### 2. Wait for Navigation

```typescript
// ✅ Good
await page.click("text=Submit");
await page.waitForURL(/\/success/);

// ❌ Bad (race condition)
await page.click("text=Submit");
expect(page.url()).toContain("/success");
```

### 3. Clean Test Data

```typescript
// Run setup before each test
test.beforeEach(async () => {
  // Reset test state
  await resetTestData();
});
```

### 4. Use Page Objects

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

## Writing New Tests

### Test Template

```typescript
import { expect, test } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test("should do something", async ({ page }) => {
    // Arrange
    await page.goto(`${BASE_URL}/path`);

    // Act
    await page.click('[data-testid="action-button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

## Performance Tips

### 1. Parallel Execution

Tests run in parallel by default. Configure in `playwright.config.ts`:

```typescript
workers: process.env.CI ? 1 : undefined,
```

### 2. Reuse Authentication

```typescript
// Save authentication state
await page.context().storageState({ path: "auth.json" });

// Reuse in other tests
const context = await browser.newContext({
  storageState: "auth.json",
});
```

### 3. Skip Heavy Tests

```typescript
test.skip(({ browserName }) => browserName === "webkit", "Skip on Safari");
```

## Continuous Improvement

### Adding Test Coverage

1. Identify critical user flows
2. Write test scenarios
3. Add `data-testid` to components
4. Implement tests
5. Run and verify
6. Update documentation

### Monitoring Test Health

- Review test reports regularly
- Fix flaky tests immediately
- Keep tests fast (<2 min total)
- Maintain >90% pass rate

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Tests](https://playwright.dev/docs/debug)

## Support

For issues or questions:

1. Check troubleshooting section
2. Review Playwright docs
3. Check project issues on GitHub
4. Ask in team chat

---

**Last Updated**: November 12, 2025  
**Maintained By**: Development Team
