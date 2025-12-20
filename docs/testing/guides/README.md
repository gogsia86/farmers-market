# 🎓 Testing Guides

> **Comprehensive Testing Documentation for the Farmers Market Platform**

---

## 📋 Overview

This directory contains detailed testing guides covering all aspects of testing in the Farmers Market Platform. Each guide provides step-by-step instructions, best practices, and real-world examples.

---

## 📚 Available Guides

### 🛒 [Cart Testing Guide](cart-testing-guide.md)

**Purpose**: Complete guide for testing shopping cart functionality  
**Topics**:

- Adding/removing items from cart
- Quantity updates and validation
- Cart persistence across sessions
- Cart synchronization with backend
- Edge cases and error handling

**Use When**: Testing cart features, debugging cart issues, or implementing cart-related features

---

### 🎭 [E2E Testing Guide](e2e-testing-guide.md)

**Purpose**: Comprehensive end-to-end testing with Playwright  
**Topics**:

- Setting up Playwright tests
- Writing user journey tests
- Page object patterns
- Test fixtures and helpers
- Visual regression testing
- CI/CD integration

**Use When**: Creating new E2E tests, debugging flaky tests, or setting up E2E infrastructure

---

### 💳 [Payment Manual Testing Guide](payment-manual-testing-guide.md)

**Purpose**: Manual testing procedures for payment flows  
**Topics**:

- Stripe test card numbers
- Payment flow validation
- Error scenario testing
- Refund testing
- Webhook testing
- Security validation

**Use When**: Testing payment integration, validating Stripe webhooks, or troubleshooting payment issues

---

### ⚙️ [Test Setup Guide](test-setup-guide.md)

**Purpose**: Initial setup and configuration for testing environment  
**Topics**:

- Installing test dependencies
- Configuring test databases
- Environment variable setup
- Test runner configuration
- IDE integration
- Troubleshooting common setup issues

**Use When**: Onboarding new developers, setting up new testing machines, or resetting test environment

---

### 📖 [Testing Guide](testing-guide.md)

**Purpose**: General testing principles and best practices  
**Topics**:

- Testing philosophy
- Test organization strategies
- Unit vs Integration vs E2E testing
- Mocking and stubbing
- Test data management
- Coverage goals and metrics
- Code review checklist for tests

**Use When**: Learning testing fundamentals, establishing team standards, or reviewing testing practices

---

## 🚀 Quick Start

### For New Developers

1. **Start with Setup**  
   Read [test-setup-guide.md](test-setup-guide.md) to configure your environment

2. **Learn the Basics**  
   Study [testing-guide.md](testing-guide.md) for core principles

3. **Choose Your Focus**
   - Frontend/Cart testing → [cart-testing-guide.md](cart-testing-guide.md)
   - User workflows → [e2e-testing-guide.md](e2e-testing-guide.md)
   - Payment flows → [payment-manual-testing-guide.md](payment-manual-testing-guide.md)

4. **Practice**  
   Run existing tests and examine their structure

5. **Write Tests**  
   Start with simple unit tests, progress to integration and E2E

---

### For Experienced Developers

Use these guides as reference when:

- Implementing new features that require tests
- Debugging complex test failures
- Reviewing test code for best practices
- Mentoring junior developers on testing

---

## 📊 Guide Selection Matrix

| **Your Goal**                     | **Recommended Guide**                                           |
| --------------------------------- | --------------------------------------------------------------- |
| Set up testing for the first time | [Test Setup Guide](test-setup-guide.md)                         |
| Learn testing best practices      | [Testing Guide](testing-guide.md)                               |
| Test shopping cart features       | [Cart Testing Guide](cart-testing-guide.md)                     |
| Write end-to-end tests            | [E2E Testing Guide](e2e-testing-guide.md)                       |
| Test payment integration          | [Payment Manual Testing Guide](payment-manual-testing-guide.md) |
| Understand testing philosophy     | [Testing Guide](testing-guide.md)                               |

---

## 🎯 Testing Workflow

### 1. **Understand the Feature**

- Read feature requirements
- Identify critical user paths
- List edge cases and error scenarios

### 2. **Plan Your Tests**

- Choose appropriate test types (unit/integration/e2e)
- Create test cases checklist
- Identify dependencies and mocks needed

### 3. **Set Up Test Environment**

- Follow [test-setup-guide.md](test-setup-guide.md) if needed
- Prepare test data
- Configure test database

### 4. **Write Tests**

- Start with unit tests (fastest)
- Add integration tests (medium)
- Finish with E2E tests (slowest)
- Follow patterns in relevant guide

### 5. **Run and Verify**

```bash
# Run all tests
npm test

# Run specific test type
npm run test:unit
npm run test:integration
npm run test:e2e

# With coverage
npm run test:coverage
```

### 6. **Review and Refactor**

- Check coverage reports
- Ensure tests are maintainable
- Review with team
- Update documentation if needed

---

## 🔍 Common Testing Patterns

### Unit Testing Pattern

```typescript
// src/lib/__tests__/validation.test.ts
import { validateFarmName } from "@/lib/validation";

describe("validateFarmName", () => {
  it("should accept valid farm names", () => {
    expect(validateFarmName("Green Valley Farm")).toBe(true);
  });

  it("should reject names that are too short", () => {
    expect(validateFarmName("AB")).toBe(false);
  });
});
```

**Guide**: [testing-guide.md](testing-guide.md)

---

### Integration Testing Pattern

```typescript
// tests/integration/farm.service.test.ts
import { farmService } from "@/lib/services/farm.service";
import { database } from "@/lib/database";

describe("FarmService Integration", () => {
  beforeEach(async () => {
    await database.$executeRaw`TRUNCATE TABLE "Farm" CASCADE`;
  });

  it("should create and retrieve a farm", async () => {
    const created = await farmService.createFarm(testData);
    const retrieved = await farmService.getFarmById(created.id);
    expect(retrieved).toEqual(created);
  });
});
```

**Guide**: [testing-guide.md](testing-guide.md)

---

### E2E Testing Pattern

```typescript
// tests/e2e/customer-journey.spec.ts
import { test, expect } from "@playwright/test";

test("customer can complete purchase", async ({ page }) => {
  await page.goto("/farms");
  await page.click('[data-testid="farm-card"]:first-child');
  await page.click('[data-testid="add-to-cart"]');
  await page.goto("/cart");
  await page.click('[data-testid="checkout-button"]');

  await expect(page).toHaveURL(/\/checkout/);
});
```

**Guide**: [e2e-testing-guide.md](e2e-testing-guide.md)

---

### Cart Testing Pattern

```typescript
// tests/e2e/cart.spec.ts
test("cart persists across sessions", async ({ page, context }) => {
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart"]');

  // Create new page in same context
  const newPage = await context.newPage();
  await newPage.goto("/cart");

  await expect(newPage.locator('[data-testid="cart-item"]')).toHaveCount(1);
});
```

**Guide**: [cart-testing-guide.md](cart-testing-guide.md)

---

## 🛠️ Troubleshooting

### Issue: Tests failing locally but passing in CI

**Solution**:

1. Check [test-setup-guide.md](test-setup-guide.md) for environment setup
2. Verify `.env.test` matches CI configuration
3. Reset test database: `npm run db:reset:test`

---

### Issue: E2E tests are flaky

**Solution**:

1. Review [e2e-testing-guide.md](e2e-testing-guide.md) for proper wait strategies
2. Add explicit waits for network and DOM
3. Use `data-testid` attributes instead of text selectors
4. Increase timeout for slow operations

---

### Issue: Cart tests failing unpredictably

**Solution**:

1. Check [cart-testing-guide.md](cart-testing-guide.md) for cart isolation
2. Clear cart state between tests
3. Verify cart API responses
4. Check for race conditions in cart updates

---

### Issue: Payment tests not working

**Solution**:

1. Follow [payment-manual-testing-guide.md](payment-manual-testing-guide.md)
2. Verify Stripe test API keys in `.env.test`
3. Use correct test card numbers
4. Check webhook configuration

---

## 📈 Testing Metrics

Track your testing progress:

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
npm run coverage:open

# Check test performance
npm run test -- --verbose
```

**Target Metrics**:

- **Unit Test Coverage**: 80%+
- **Integration Test Coverage**: 75%+
- **E2E Test Coverage**: Critical paths
- **Test Success Rate**: 95%+
- **Average Test Duration**: < 5 minutes

---

## 🎓 Learning Path

### Beginner → Intermediate → Advanced

#### Level 1: Beginner (Week 1-2)

- [ ] Complete [test-setup-guide.md](test-setup-guide.md)
- [ ] Read [testing-guide.md](testing-guide.md) thoroughly
- [ ] Write 5 unit tests for utilities
- [ ] Run and understand existing tests
- [ ] Achieve 50%+ coverage on new code

#### Level 2: Intermediate (Week 3-4)

- [ ] Study [cart-testing-guide.md](cart-testing-guide.md)
- [ ] Write integration tests for services
- [ ] Create component tests with React Testing Library
- [ ] Understand mocking and stubbing
- [ ] Achieve 75%+ coverage on new code

#### Level 3: Advanced (Week 5-6)

- [ ] Master [e2e-testing-guide.md](e2e-testing-guide.md)
- [ ] Implement [payment-manual-testing-guide.md](payment-manual-testing-guide.md) flows
- [ ] Write complex E2E user journeys
- [ ] Set up CI/CD test automation
- [ ] Achieve 80%+ coverage on new code
- [ ] Mentor others on testing

---

## 🌟 Best Practices Summary

### From All Guides

1. **Write Tests First** (TDD when possible)
2. **Test Behavior, Not Implementation**
3. **Keep Tests Simple and Focused**
4. **Use Descriptive Test Names**
5. **Arrange-Act-Assert Pattern**
6. **Isolate Tests** (no shared state)
7. **Mock External Dependencies**
8. **Test Error Cases**
9. **Maintain Test Documentation**
10. **Review Tests in Code Reviews**

---

## 📖 Related Documentation

- **Parent**: [../README.md](../README.md) - Testing documentation hub
- **Quick Reference**: [../quick-reference/](../quick-reference/) - Command cheat sheets
- **Reports**: [../reports/](../reports/) - Test analysis and coverage
- **Progress**: [../daily-progress/](../daily-progress/) - Testing milestones

---

## 🔄 Keep Guides Updated

These guides are living documents. Update them when:

- New testing tools are adopted
- Testing patterns change
- Common issues are discovered
- New team members have questions
- Best practices evolve

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: Farmers Market Platform Testing Team

_Found an issue or have a suggestion? Create a GitHub issue or update the guide directly!_
