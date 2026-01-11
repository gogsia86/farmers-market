# 🧪 Testing Standards Deep Dive

> **Comprehensive testing standards, patterns, and best practices for the Farmers Market Platform**  
> **Version:** 1.0.0  
> **Last Updated:** January 2025  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Testing Pyramid](#testing-pyramid)
4. [Unit Testing Standards](#unit-testing-standards)
5. [Integration Testing Standards](#integration-testing-standards)
6. [End-to-End (E2E) Testing Standards](#end-to-end-e2e-testing-standards)
7. [Component Testing Standards](#component-testing-standards)
8. [API Testing Standards](#api-testing-standards)
9. [Mocking & Test Doubles](#mocking--test-doubles)
10. [Test Data Management](#test-data-management)
11. [Code Coverage Standards](#code-coverage-standards)
12. [Performance Testing](#performance-testing)
13. [Testing Utilities & Helpers](#testing-utilities--helpers)
14. [Continuous Integration](#continuous-integration)
15. [Testing Checklist](#testing-checklist)
16. [Quick Reference](#quick-reference)

---

## 🎯 Overview

### Purpose

This document establishes comprehensive testing standards for the Farmers Market Platform, ensuring:

- **Quality Assurance**: Catch bugs before production
- **Confidence**: Safe refactoring and feature development
- **Documentation**: Tests as living documentation
- **Regression Prevention**: Automated safety net
- **Performance**: Early detection of performance issues

### Testing Stack

```yaml
test_framework: Vitest (unit, integration)
e2e_framework: Playwright
component_testing: React Testing Library
api_testing: Supertest + MSW (Mock Service Worker)
coverage: Vitest Coverage (c8)
mocking: Vitest mocks + MSW
database: In-memory SQLite for tests
fixtures: Custom factory functions
ci_cd: GitHub Actions
```

### Key Principles

1. **Write tests first** (TDD encouraged, not required)
2. **Test behavior, not implementation**
3. **Maintain fast test suites** (unit tests < 10s, integration < 30s)
4. **Keep tests independent** (no shared state between tests)
5. **Use meaningful test names** (describe what's being tested)
6. **Follow AAA pattern** (Arrange, Act, Assert)
7. **Mock external dependencies** (APIs, databases, third-party services)
8. **Test edge cases and error paths**

---

## 🧠 Testing Philosophy

### Test-Driven Development (TDD)

While not strictly enforced, TDD is encouraged for complex business logic:

```typescript
// 1. Write failing test
describe('FarmService.createFarm', () => {
  it('should generate unique slug from farm name', async () => {
    const result = await farmService.createFarm({ 
      name: 'Green Valley Farm' 
    });
    
    expect(result.slug).toBe('green-valley-farm');
  });
});

// 2. Write minimal code to pass
async createFarm(data: CreateFarmInput) {
  const slug = this.generateSlug(data.name);
  return { ...data, slug };
}

// 3. Refactor with confidence
```

### Behavior-Driven Development (BDD)

Use BDD-style describe/it blocks with clear, human-readable descriptions:

```typescript
describe('Farm Creation Workflow', () => {
  describe('when user is authenticated', () => {
    describe('and provides valid farm data', () => {
      it('creates farm with pending status', async () => {
        // Test implementation
      });

      it('sends verification email to farm owner', async () => {
        // Test implementation
      });

      it('returns farm with generated ID and slug', async () => {
        // Test implementation
      });
    });

    describe('and provides invalid farm data', () => {
      it('throws ValidationError with field-specific messages', async () => {
        // Test implementation
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('throws UnauthorizedError', async () => {
      // Test implementation
    });
  });
});
```

### Test Naming Conventions

#### ✅ Good Test Names

```typescript
// Unit tests
it('should return null when user not found')
it('should hash password before storing in database')
it('should throw ValidationError for invalid email format')

// Integration tests
it('POST /api/v1/farms creates farm and returns 201')
it('GET /api/v1/farms returns paginated list with metadata')

// E2E tests
it('user can complete checkout and receive order confirmation')
it('admin can approve pending farm applications')
```

#### ❌ Bad Test Names

```typescript
// Too vague
it('works')
it('handles error')
it('test farm creation')

// Implementation-focused
it('calls createFarm method')
it('mocks the database')
```

---

## 🏗️ Testing Pyramid

### Distribution

```
        /\
       /  \        E2E Tests (10%)
      /____\       - Critical user journeys
     /      \      - Smoke tests
    /        \     
   /__________\    Integration Tests (30%)
  /            \   - API endpoints
 /              \  - Service layer
/________________\ - Database operations

                   Unit Tests (60%)
                   - Pure functions
                   - Business logic
                   - Utilities
```

### Test Types by Layer

| Layer | Test Type | Tools | Focus |
|-------|-----------|-------|-------|
| **Unit** | Isolated functions/classes | Vitest | Business logic, utilities |
| **Integration** | Multiple components | Vitest + Test DB | Service layer, API routes |
| **E2E** | Full user flows | Playwright | Critical paths |
| **Component** | React components | RTL + Vitest | UI behavior |
| **API** | API contracts | Supertest + MSW | Request/response |

---

## 🔬 Unit Testing Standards

### What to Unit Test

- ✅ Pure functions and utilities
- ✅ Business logic and calculations
- ✅ Data transformations
- ✅ Validation logic
- ✅ Error handling
- ✅ Edge cases and boundary conditions

### Unit Test Structure

```typescript
// tests/unit/lib/utils/slug.test.ts
import { describe, it, expect } from 'vitest';
import { generateSlug } from '@/lib/utils/slug';

describe('generateSlug', () => {
  // Happy path
  it('should convert text to lowercase kebab-case', () => {
    expect(generateSlug('Green Valley Farm')).toBe('green-valley-farm');
  });

  // Edge cases
  it('should handle special characters', () => {
    expect(generateSlug('Farm & Garden Co.')).toBe('farm-garden-co');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('Green   Valley    Farm')).toBe('green-valley-farm');
  });

  it('should handle leading and trailing spaces', () => {
    expect(generateSlug('  Green Valley  ')).toBe('green-valley');
  });

  // Error cases
  it('should return empty string for empty input', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle non-ASCII characters', () => {
    expect(generateSlug('Café André')).toBe('cafe-andre');
  });

  // Boundary conditions
  it('should truncate slugs longer than 100 characters', () => {
    const longText = 'a'.repeat(150);
    const result = generateSlug(longText);
    expect(result.length).toBe(100);
  });
});
```

### Testing Pure Functions

```typescript
// lib/utils/price-calculator.ts
export function calculateTotalPrice(
  items: CartItem[],
  taxRate: number = 0.08,
  discount?: Discount
): PriceBreakdown {
  const subtotal = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  const discountAmount = discount 
    ? calculateDiscount(subtotal, discount)
    : 0;
  
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + tax;

  return {
    subtotal,
    discount: discountAmount,
    tax,
    total
  };
}

// tests/unit/lib/utils/price-calculator.test.ts
describe('calculateTotalPrice', () => {
  const mockItems: CartItem[] = [
    { id: '1', name: 'Tomatoes', price: 10.00, quantity: 2 },
    { id: '2', name: 'Lettuce', price: 5.00, quantity: 1 }
  ];

  describe('basic calculations', () => {
    it('should calculate correct subtotal', () => {
      const result = calculateTotalPrice(mockItems);
      expect(result.subtotal).toBe(25.00);
    });

    it('should apply tax rate correctly', () => {
      const result = calculateTotalPrice(mockItems, 0.10);
      expect(result.tax).toBe(2.50);
    });

    it('should calculate correct total', () => {
      const result = calculateTotalPrice(mockItems, 0.08);
      expect(result.total).toBe(27.00); // 25 + (25 * 0.08)
    });
  });

  describe('discount handling', () => {
    it('should apply percentage discount', () => {
      const discount: Discount = { type: 'PERCENTAGE', value: 10 };
      const result = calculateTotalPrice(mockItems, 0.08, discount);
      
      expect(result.discount).toBe(2.50); // 10% of 25
      expect(result.subtotal).toBe(25.00);
      expect(result.total).toBe(24.30); // (25 - 2.5) * 1.08
    });

    it('should apply fixed amount discount', () => {
      const discount: Discount = { type: 'FIXED', value: 5 };
      const result = calculateTotalPrice(mockItems, 0.08, discount);
      
      expect(result.discount).toBe(5.00);
      expect(result.total).toBe(21.60); // (25 - 5) * 1.08
    });

    it('should not allow discount greater than subtotal', () => {
      const discount: Discount = { type: 'FIXED', value: 50 };
      const result = calculateTotalPrice(mockItems, 0.08, discount);
      
      expect(result.discount).toBe(25.00); // Capped at subtotal
      expect(result.total).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty cart', () => {
      const result = calculateTotalPrice([]);
      expect(result.total).toBe(0);
    });

    it('should handle zero tax rate', () => {
      const result = calculateTotalPrice(mockItems, 0);
      expect(result.tax).toBe(0);
      expect(result.total).toBe(25.00);
    });

    it('should round to 2 decimal places', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Item', price: 9.99, quantity: 3 }
      ];
      const result = calculateTotalPrice(items, 0.08);
      expect(result.total).toBe(32.33); // Not 32.3292
    });
  });
});
```

### Testing Classes and Services

```typescript
// lib/services/farm.service.ts
export class FarmService {
  constructor(
    private readonly repository: FarmRepository,
    private readonly cache: CacheService,
    private readonly logger: Logger
  ) {}

  async createFarm(data: CreateFarmInput, userId: string): Promise<Farm> {
    // Validation
    const validated = CreateFarmSchema.parse(data);

    // Business logic
    const slug = await this.generateUniqueSlug(validated.name);

    // Persistence
    const farm = await this.repository.create({
      ...validated,
      slug,
      ownerId: userId,
      status: FarmStatus.PENDING_VERIFICATION
    });

    // Side effects
    await this.cache.invalidate('farms:*');
    this.logger.info('Farm created', { farmId: farm.id, userId });

    return farm;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name);
    let counter = 1;

    while (await this.repository.existsBySlug(slug)) {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }

    return slug;
  }
}

// tests/unit/lib/services/farm.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FarmService } from '@/lib/services/farm.service';
import { createMockRepository } from '@/tests/factories/mock-repository';
import { createMockCache } from '@/tests/factories/mock-cache';
import { createMockLogger } from '@/tests/factories/mock-logger';

describe('FarmService', () => {
  let farmService: FarmService;
  let mockRepository: ReturnType<typeof createMockRepository>;
  let mockCache: ReturnType<typeof createMockCache>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    mockCache = createMockCache();
    mockLogger = createMockLogger();
    
    farmService = new FarmService(
      mockRepository as any,
      mockCache as any,
      mockLogger as any
    );
  });

  describe('createFarm', () => {
    const validInput: CreateFarmInput = {
      name: 'Green Valley Farm',
      description: 'Organic vegetables and fruits',
      location: {
        address: '123 Farm Road',
        city: 'Farmville',
        state: 'CA',
        zipCode: '12345'
      }
    };

    it('should create farm with valid data', async () => {
      // Arrange
      const userId = 'user_123';
      const expectedFarm = {
        id: 'farm_456',
        ...validInput,
        slug: 'green-valley-farm',
        ownerId: userId,
        status: FarmStatus.PENDING_VERIFICATION
      };

      mockRepository.existsBySlug.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(expectedFarm);

      // Act
      const result = await farmService.createFarm(validInput, userId);

      // Assert
      expect(result).toEqual(expectedFarm);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...validInput,
        slug: 'green-valley-farm',
        ownerId: userId,
        status: FarmStatus.PENDING_VERIFICATION
      });
    });

    it('should generate unique slug when slug exists', async () => {
      // Arrange
      mockRepository.existsBySlug
        .mockResolvedValueOnce(true)  // First slug exists
        .mockResolvedValueOnce(true)  // Second slug exists
        .mockResolvedValueOnce(false); // Third slug is unique

      mockRepository.create.mockResolvedValue({
        id: 'farm_456',
        slug: 'green-valley-farm-2'
      } as any);

      // Act
      await farmService.createFarm(validInput, 'user_123');

      // Assert
      expect(mockRepository.existsBySlug).toHaveBeenCalledTimes(3);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'green-valley-farm-2'
        })
      );
    });

    it('should invalidate cache after creation', async () => {
      // Arrange
      mockRepository.existsBySlug.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({ id: 'farm_456' } as any);

      // Act
      await farmService.createFarm(validInput, 'user_123');

      // Assert
      expect(mockCache.invalidate).toHaveBeenCalledWith('farms:*');
    });

    it('should log farm creation', async () => {
      // Arrange
      const userId = 'user_123';
      const farmId = 'farm_456';
      mockRepository.existsBySlug.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({ id: farmId } as any);

      // Act
      await farmService.createFarm(validInput, userId);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Farm created',
        { farmId, userId }
      );
    });

    it('should throw ValidationError for invalid data', async () => {
      // Arrange
      const invalidInput = { name: 'AB' }; // Too short

      // Act & Assert
      await expect(
        farmService.createFarm(invalidInput as any, 'user_123')
      ).rejects.toThrow('Farm name must be at least 3 characters');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      mockRepository.existsBySlug.mockResolvedValue(false);
      mockRepository.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        farmService.createFarm(validInput, 'user_123')
      ).rejects.toThrow('Database connection failed');
    });
  });
});
```

---

## 🔗 Integration Testing Standards

### What to Integration Test

- ✅ API endpoints (request → response)
- ✅ Service layer with database
- ✅ Authentication flows
- ✅ External API integrations
- ✅ Multi-step business processes
- ✅ Database transactions

### Integration Test Setup

```typescript
// tests/integration/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestDatabase, cleanupTestDatabase } from '@/tests/helpers/database';
import { seedTestData } from '@/tests/helpers/seed';

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await createTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase(testDb);
});

beforeEach(async () => {
  await testDb.reset();
  await seedTestData(testDb);
});
```

### API Route Integration Tests

```typescript
// tests/integration/api/farms.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp } from '@/tests/helpers/app';
import { createTestUser, createAuthToken } from '@/tests/helpers/auth';
import { createMockFarm } from '@/tests/factories/farm.factory';
import request from 'supertest';

describe('POST /api/v1/farms', () => {
  let app: TestApp;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.cleanup();
  });

  beforeEach(async () => {
    const user = await createTestUser({ role: 'FARMER' });
    userId = user.id;
    authToken = await createAuthToken(user);
  });

  describe('authentication', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app.server)
        .post('/api/v1/farms')
        .send({ name: 'Test Farm' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    });

    it('should return 403 when user is not a farmer', async () => {
      const customer = await createTestUser({ role: 'CUSTOMER' });
      const customerToken = await createAuthToken(customer);

      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Test Farm' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('validation', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toMatchObject({
        name: expect.arrayContaining(['Farm name is required'])
      });
    });

    it('should return 400 for invalid farm name', async () => {
      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'AB' }); // Too short

      expect(response.status).toBe(400);
      expect(response.body.error.details.name).toContain(
        'Farm name must be at least 3 characters'
      );
    });
  });

  describe('success cases', () => {
    it('should create farm with valid data', async () => {
      const farmData = {
        name: 'Green Valley Farm',
        description: 'Organic vegetables and fruits',
        location: {
          address: '123 Farm Road',
          city: 'Farmville',
          state: 'CA',
          zipCode: '12345',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        certifications: ['ORGANIC'],
        farmSize: 100,
        establishedYear: 2010
      };

      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(farmData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.stringMatching(/^farm_/),
          name: farmData.name,
          slug: 'green-valley-farm',
          ownerId: userId,
          status: 'PENDING_VERIFICATION',
          createdAt: expect.any(String)
        }
      });
    });

    it('should store farm in database', async () => {
      const farmData = createMockFarm();

      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(farmData);

      const farmId = response.body.data.id;

      // Verify in database
      const storedFarm = await app.database.farm.findUnique({
        where: { id: farmId }
      });

      expect(storedFarm).toBeTruthy();
      expect(storedFarm?.name).toBe(farmData.name);
    });

    it('should return farm with relations', async () => {
      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMockFarm());

      expect(response.body.data.owner).toMatchObject({
        id: userId,
        name: expect.any(String),
        email: expect.any(String)
      });

      expect(response.body.data.location).toMatchObject({
        address: expect.any(String),
        city: expect.any(String),
        state: expect.any(String)
      });
    });
  });

  describe('business logic', () => {
    it('should generate unique slug', async () => {
      // Create first farm
      await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Green Valley Farm' });

      // Create second farm with same name
      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Green Valley Farm' });

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBe('green-valley-farm-1');
    });

    it('should set initial status to PENDING_VERIFICATION', async () => {
      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMockFarm());

      expect(response.body.data.status).toBe('PENDING_VERIFICATION');
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error
      await app.database.$disconnect();

      const response = await request(app.server)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createMockFarm());

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');

      // Reconnect for cleanup
      await app.database.$connect();
    });
  });
});
```

### Service Layer Integration Tests

```typescript
// tests/integration/services/order.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '@/lib/services/order.service';
import { createTestDatabase } from '@/tests/helpers/database';
import { createMockOrder, createMockUser } from '@/tests/factories';

describe('OrderService (Integration)', () => {
  let orderService: OrderService;
  let testDb: TestDatabase;
  let testUser: User;

  beforeEach(async () => {
    testDb = await createTestDatabase();
    orderService = new OrderService(testDb);
    testUser = await createMockUser(testDb);
  });

  describe('createOrder', () => {
    it('should create order with line items', async () => {
      const orderData = {
        userId: testUser.id,
        items: [
          { productId: 'prod_1', quantity: 2, price: 10.00 },
          { productId: 'prod_2', quantity: 1, price: 15.00 }
        ]
      };

      const order = await orderService.createOrder(orderData);

      expect(order.id).toBeDefined();
      expect(order.items).toHaveLength(2);
      expect(order.total).toBe(35.00);
    });

    it('should update product inventory', async () => {
      const product = await testDb.product.create({
        data: { name: 'Tomatoes', stock: 100 }
      });

      await orderService.createOrder({
        userId: testUser.id,
        items: [{ productId: product.id, quantity: 10 }]
      });

      const updatedProduct = await testDb.product.findUnique({
        where: { id: product.id }
      });

      expect(updatedProduct?.stock).toBe(90);
    });

    it('should rollback on failure', async () => {
      const product = await testDb.product.create({
        data: { name: 'Tomatoes', stock: 5 }
      });

      // Try to order more than available
      await expect(
        orderService.createOrder({
          userId: testUser.id,
          items: [{ productId: product.id, quantity: 10 }]
        })
      ).rejects.toThrow('Insufficient stock');

      // Verify stock unchanged
      const unchangedProduct = await testDb.product.findUnique({
        where: { id: product.id }
      });

      expect(unchangedProduct?.stock).toBe(5);
    });
  });
});
```

---

## 🎭 End-to-End (E2E) Testing Standards

### What to E2E Test

- ✅ Critical user journeys (checkout, registration)
- ✅ Multi-page workflows
- ✅ Authentication flows
- ✅ Payment processing
- ✅ Email/notification flows
- ✅ Admin workflows

### E2E Test Structure with Playwright

```typescript
// tests/e2e/checkout-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ProductsPage } from './pages/products.page';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';

test.describe('Checkout Flow', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login('customer@test.com', 'password123');
  });

  test('should complete full checkout process', async ({ page }) => {
    // 1. Browse products
    await productsPage.goto();
    await expect(page).toHaveTitle(/Products/);

    // 2. Add items to cart
    await productsPage.addToCart('Organic Tomatoes', 2);
    await productsPage.addToCart('Fresh Lettuce', 1);

    // 3. View cart
    await page.click('[data-testid="cart-icon"]');
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.totalPrice).toHaveText('$35.00');

    // 4. Proceed to checkout
    await cartPage.proceedToCheckout();

    // 5. Fill shipping information
    await checkoutPage.fillShippingAddress({
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    });

    // 6. Select payment method
    await checkoutPage.selectPaymentMethod('credit_card');
    await checkoutPage.fillCreditCard({
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123'
    });

    // 7. Place order
    await checkoutPage.placeOrder();

    // 8. Verify success
    await expect(page).toHaveURL(/\/orders\/\w+/);
    await expect(page.locator('h1')).toHaveText('Order Confirmed!');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();

    // 9. Verify order in database
    const orderNumber = await page
      .locator('[data-testid="order-number"]')
      .textContent();
    
    expect(orderNumber).toMatch(/ORD-\d+/);
  });

  test('should show validation errors for incomplete checkout', async ({ page }) => {
    await productsPage.goto();
    await productsPage.addToCart('Organic Tomatoes', 2);
    await page.click('[data-testid="cart-icon"]');
    await cartPage.proceedToCheckout();

    // Try to submit without filling form
    await checkoutPage.placeOrder();

    // Verify errors
    await expect(page.locator('text=Address is required')).toBeVisible();
    await expect(page.locator('text=Payment method is required')).toBeVisible();
  });

  test('should handle out of stock items', async ({ page }) => {
    await productsPage.goto();
    
    // Add out of stock item
    const outOfStockButton = page.locator('[data-product="out-of-stock-item"] button');
    await expect(outOfStockButton).toBeDisabled();
    await expect(outOfStockButton).toHaveText('Out of Stock');
  });

  test('should apply promo code', async ({ page }) => {
    await productsPage.goto();
    await productsPage.addToCart('Organic Tomatoes', 2);
    await page.click('[data-testid="cart-icon"]');
    
    await cartPage.applyPromoCode('SUMMER10');
    
    await expect(page.locator('[data-testid="discount"]')).toHaveText('-$3.50');
    await expect(page.locator('[data-testid="total"]')).toHaveText('$31.50');
  });
});
```

### Page Object Model (POM)

```typescript
// tests/e2e/pages/checkout.page.ts
import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipCodeInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvcInput: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addressInput = page.locator('[name="address"]');
    this.cityInput = page.locator('[name="city"]');
    this.stateSelect = page.locator('[name="state"]');
    this.zipCodeInput = page.locator('[name="zipCode"]');
    this.cardNumberInput = page.locator('[name="cardNumber"]');
    this.expiryInput = page.locator('[name="expiry"]');
    this.cvcInput = page.locator('[name="cvc"]');
    this.placeOrderButton = page.locator('button[type="submit"]');
  }

  async fillShippingAddress(address: ShippingAddress) {
    await this.addressInput.fill(address.address);
    await this.cityInput.fill(address.city);
    await this.stateSelect.selectOption(address.state);
    await this.zipCodeInput.fill(address.zipCode);
  }

  async selectPaymentMethod(method: 'credit_card' | 'paypal') {
    await this.page.click(`[data-payment-method="${method}"]`);
  }

  async fillCreditCard(card: CreditCard) {
    await this.cardNumberInput.fill(card.number);
    await this.expiryInput.fill(card.expiry);
    await this.cvcInput.fill(card.cvc);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.waitForURL(/\/orders\/\w+/);
  }
}
```

### E2E Testing Best Practices

```typescript
// ✅ Use data-testid for stable selectors
<button data-testid="add-to-cart-button">Add to Cart</button>
await page.click('[data-testid="add-to-cart-button"]');

// ✅ Wait for navigation
await page.click('button[type="submit"]');
await page.waitForURL('/success');

// ✅ Use explicit waits
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

// ✅ Test with realistic data
const testData = {
  email: `test-${Date.now()}@example.com`,
  password: 'SecurePass123!'
};

// ❌ Avoid fragile selectors
await page.click('.btn.btn-primary.submit'); // Too specific, brittle

// ❌ Avoid implicit waits
await page.waitForTimeout(5000); // Flaky, use explicit waits
```

---

## 🎨 Component Testing Standards

### What to Component Test

- ✅ User interactions (clicks, inputs)
- ✅ Conditional rendering
- ✅ Props handling
- ✅ State changes
- ✅ Event handlers
- ✅ Accessibility

### React Component Tests

```typescript
// components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click Me');
    });

    it('should apply variant styles', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('should apply size classes', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-lg');
    });
  });

  describe('interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Click</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      render(<Button loading>Submit</Button>);
      
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

### Testing Hooks

```typescript
// hooks/useCart.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';

describe('useCart', () => {
  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({
        id: 'prod_1',
        name: 'Tomatoes',
        price: 10.00,
        quantity: 2
      });
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(20.00);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({ id: 'prod_1', price: 10.00, quantity: 2 });
    });
    
    act(() => {
      result.current.updateQuantity('prod_1', 5);
    });
    
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalPrice).toBe(50.00);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({ id: 'prod_1', price: 10.00, quantity: 2 });
      result.current.addItem({ id: 'prod_2', price: 15.00, quantity: 1 });
    });
    
    act(() => {
      result.current.removeItem('prod_1');
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalPrice).toBe(15.00);
  });
});
```

---

## 🌐 API Testing Standards

### API Contract Testing

```typescript
// tests/api/contracts/farms.contract.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '@/tests/helpers/app';

describe('Farms API Contract', () => {
  describe('GET /api/v1/farms/:id', () => {
    it('should match expected response schema', async () => {
      const app = await createTestApp();
      
      const response = await request(app.server)
        .get('/api/v1/farms/farm_123')
        .expect(200);

      // Validate response structure
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.stringMatching(/^farm_/),
          name: expect.any(String),
          slug: expect.any(String),
          description: expect.any(String),
          status: expect.stringMatching(/^(ACTIVE|PENDING|SUSPENDED)$/),
          owner: {
            id: expect.stringMatching(/^user_/),
            name: expect.any(String),
            email: expect.any(String)
          },
          location: {
            address: expect.any(String),
            city: expect.any(String),
            state: expect.stringMatching(/^[A-Z]{2}$/),
            zipCode: expect.stringMatching(/^\d{5}$/),
            coordinates: {
              lat: expect.any(Number),
              lng: expect.any(Number)
            }
          },
          createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
        },
        meta: {
          requestId: expect.any(String),
          version: 'v1'
        }
      });
    });

    it('should return 404 for non-existent farm', async () => {
      const app = await createTestApp();
      
      const response = await request(app.server)
        .get('/api/v1/farms/non_existent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Farm not found',
          timestamp: expect.any(String),
          requestId: expect.any(String)
        }
      });
    });
  });
});
```

---

## 🎭 Mocking & Test Doubles

### When to Mock

- ✅ External APIs (payment gateways, email services)
- ✅ Database in unit tests
- ✅ File system operations
- ✅ Date/time for consistent tests
- ✅ Random number generation
- ❌ Simple utility functions
- ❌ Business logic (test the real thing)

### Mocking with Vitest

```typescript
// Mock entire module
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}));

// Mock specific functions
import { sendEmail } from '@/lib/email';
vi.mocked(sendEmail).mockResolvedValue({ success: true });

// Mock with implementation
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock timers
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-01'));

// Restore mocks
vi.restoreAllMocks();
```

### Mock Service Worker (MSW) for API Mocking

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock external API
  http.get('https://api.stripe.com/v1/charges/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      amount: 5000,
      currency: 'usd',
      status: 'succeeded'
    });
  }),

  // Mock error response
  http.post('https://api.stripe.com/v1/charges', () => {
    return HttpResponse.json(
      { error: 'Card declined' },
      { status: 400 }
    );
  })
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Test Factories

```typescript
// tests/factories/farm.factory.ts
import { faker } from '@faker-js/faker';
import type { Farm } from '@prisma/client';

export function createMockFarm(overrides?: Partial<Farm>): Farm {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.lorem.slug(),
    description: faker.lorem.paragraph(),
    status: 'ACTIVE',
    ownerId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  };
}

export function createMockFarmArray(count: number): Farm[] {
  return Array.from({ length: count }, () => createMockFarm());
}
```

---

## 📊 Test Data Management

### Test Database Strategy

```typescript
// tests/helpers/database.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export async function createTestDatabase(): Promise<PrismaClient> {
  // Use separate test database
  const testDbUrl = process.env.TEST_DATABASE_URL;
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testDbUrl }
  });

  const prisma = new PrismaClient({
    datasources: { db: { url: testDbUrl } }
  });

  await prisma.$connect();
  return prisma;
}

export async function cleanupTestDatabase(prisma: PrismaClient) {
  // Clean all tables
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  for (const { tablename } of tables as any[]) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }

  await prisma.$disconnect();
}
```

### Seed Test Data

```typescript
// tests/helpers/seed.ts
export async function seedTestData(db: PrismaClient) {
  // Create test users
  const farmer = await db.user.create({
    data: {
      email: 'farmer@test.com',
      name: 'Test Farmer',
      role: 'FARMER'
    }
  });

  const customer = await db.user.create({
    data: {
      email: 'customer@test.com',
      name: 'Test Customer',
      role: 'CUSTOMER'
    }
  });

  // Create test farm
  const farm = await db.farm.create({
    data: {
      name: 'Test Farm',
      slug: 'test-farm',
      ownerId: farmer.id,
      status: 'ACTIVE'
    }
  });

  // Create test products
  await db.product.createMany({
    data: [
      { name: 'Tomatoes', price: 10.00, farmId: farm.id, stock: 100 },
      { name: 'Lettuce', price: 5.00, farmId: farm.id, stock: 50 }
    ]
  });

  return { farmer, customer, farm };
}
```

---

## 📈 Code Coverage Standards

### Coverage Targets

| Category | Minimum | Target | Critical |
|----------|---------|--------|----------|
| **Overall** | 70% | 80% | 90% |
| **Services** | 80% | 90% | 95% |
| **API Routes** | 75% | 85% | 90% |
| **Utilities** | 90% | 95% | 100% |
| **Components** | 60% | 75% | 85% |

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/.next/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

### Running Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Enforce coverage thresholds
npm run test:coverage -- --reporter=text --coverage.thresholds.lines=80
```

### Coverage Best Practices

```typescript
// ✅ Focus on critical paths
describe('PaymentService', () => {
  it('should process payment successfully', () => {
    // Test happy path
  });

  it('should handle payment failures', () => {
    // Test error path
  });

  it('should retry on network errors', () => {
    // Test edge case
  });
});

// ✅ Ignore uncovered lines intentionally
/* v8 ignore next 3 */
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// ❌ Don't chase 100% coverage blindly
// Some code (like error boundaries) is hard to test and that's OK
```

---

## ⚡ Performance Testing

### Load Testing with k6

```javascript
// tests/performance/api-load.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/farms');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### Database Query Performance Tests

```typescript
// tests/performance/database.test.ts
import { describe, it, expect } from 'vitest';
import { database } from '@/lib/database';

describe('Database Performance', () => {
  it('should fetch farms list in under 100ms', async () => {
    const start = Date.now();
    
    await database.farm.findMany({
      take: 20,
      include: { owner: true, location: true }
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle N+1 queries efficiently', async () => {
    const farms = await database.farm.findMany({ take: 10 });
    
    const start = Date.now();
    
    // ❌ BAD: N+1 query
    // for (const farm of farms) {
    //   await database.product.findMany({ where: { farmId: farm.id } });
    // }
    
    // ✅ GOOD: Single query
    await database.product.findMany({
      where: { farmId: { in: farms.map(f => f.id) } }
    });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50);
  });
});
```

---

## 🛠️ Testing Utilities & Helpers

### Custom Matchers

```typescript
// tests/helpers/matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`
    };
  },

  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within ${min}-${max}`
          : `Expected ${received} to be within ${min}-${max}`
    };
  }
});

// Usage
expect('test@example.com').toBeValidEmail();
expect(50).toBeWithinRange(0, 100);
```

### Test Helpers

```typescript
// tests/helpers/auth.ts
export async function createTestUser(
  overrides?: Partial<User>
): Promise<User> {
  return await database.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role: 'CUSTOMER',
      ...overrides
    }
  });
}

export async function createAuthToken(user: User): Promise<string> {
  return await signJWT({ userId: user.id, role: user.role });
}

export async function loginAsUser(role: 'FARMER' | 'CUSTOMER' = 'CUSTOMER') {
  const user = await createTestUser({ role });
  const token = await createAuthToken(user);
  return { user, token };
}
```

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E videos on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-videos
          path: tests/e2e/videos/
```

---

## ✅ Testing Checklist

### Before Committing

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage thresholds met
- [ ] No skipped/pending tests without reason
- [ ] Test names are descriptive
- [ ] No console errors/warnings in tests

### Before PR Review

- [ ] All CI tests passing
- [ ] E2E tests pass on staging
- [ ] Coverage report reviewed
- [ ] Performance tests pass
- [ ] No flaky tests
- [ ] Test documentation updated

### Before Merging

- [ ] All review comments addressed
- [ ] Final test run successful
- [ ] Breaking changes documented
- [ ] Migration tests verified

---

## 📚 Quick Reference

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific file
npm test -- farm.test.ts

# Run tests matching pattern
npm test -- --grep "createFarm"

# Update snapshots
npm test -- -u
```

### Common Test Patterns

```typescript
// AAA Pattern
it('should add two numbers', () => {
  // Arrange
  const a = 2;
  const b = 3;
  
  // Act
  const result = add(a, b);
  
  // Assert
  expect(result).toBe(5);
});

// Async testing
it('should fetch user', async () => {
  const user = await fetchUser('123');
  expect(user.id).toBe('123');
});

// Error testing
it('should throw for invalid input', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero');
});

// Mock testing
it('should call logger', () => {
  const mockLogger = vi.fn();
  service.setLogger(mockLogger);
  service.doSomething();
  expect(mockLogger).toHaveBeenCalledWith('Something happened');
});
```

### Assertion Cheatsheet

```typescript
// Equality
expect(value).toBe(42)
expect(value).toEqual({ name: 'John' })
expect(value).toStrictEqual({ name: 'John' })

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(10)
expect(value).toBeLessThan(100)
expect(value).toBeCloseTo(10.5, 1)

// Strings
expect(text).toMatch(/pattern/)
expect(text).toContain('substring')

// Arrays
expect(array).toHaveLength(5)
expect(array).toContain('item')
expect(array).toEqual(expect.arrayContaining([1, 2]))

// Objects
expect(obj).toHaveProperty('key')
expect(obj).toMatchObject({ key: 'value' })

// Promises
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()

// Mock functions
expect(mock).toHaveBeenCalled()
expect(mock).toHaveBeenCalledWith(arg1, arg2)
expect(mock).toHaveBeenCalledTimes(3)
```

---

## 🎯 Success Criteria

This testing strategy is successful when:

1. ✅ **Coverage**: Maintain >80% overall coverage
2. ✅ **Speed**: Unit tests run in <10s, full suite in <5min
3. ✅ **Reliability**: <1% flaky test rate
4. ✅ **Confidence**: Team trusts tests to catch regressions
5. ✅ **Maintainability**: Tests are easy to update and understand
6. ✅ **CI/CD**: All tests pass before merge
7. ✅ **Documentation**: Tests serve as usage examples

---

## 📞 Support & Resources

### Internal Resources

- [Testing Guide (Getting Started)](/docs/testing/guides/getting-started.md)
- [Test Utilities Reference](/docs/testing/utilities.md)
- [CI/CD Setup Guide](/docs/testing/CI_CD_SETUP_GUIDE.md)
- [Troubleshooting Guide](/docs/testing/troubleshooting.md)

### External Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Getting Help

- **Slack**: #testing-help
- **Code Reviews**: Tag @testing-champions
- **Office Hours**: Tuesdays 2-3pm

---

**Version History:**
- 1.0.0 (2025-01-10): Initial comprehensive testing standards
- Status: 
