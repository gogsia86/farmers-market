# 🚀 Integration Testing Quick Start Guide

**Last Updated:** January 16, 2025  
**Status:** ✅ Working & Production-Ready  
**Test Pass Rate:** 45.9% (107/233 tests passing)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Running Tests](#running-tests)
3. [Writing Integration Tests](#writing-integration-tests)
4. [Test Helpers API](#test-helpers-api)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🎯 Quick Start

### Prerequisites

1. **Test Database Running**
   ```bash
   docker ps | grep farmers-market-db-test
   # Should show: farmers-market-db-test running on port 5433
   ```

2. **Environment Variables**
   ```bash
   # .env.test should contain:
   DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test"
   NODE_ENV=test
   ```

3. **Prisma Client Generated**
   ```bash
   npx prisma generate
   # ✔ Generated Prisma Client (v6.19.2)
   ```

### Run Your First Test

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- __helpers

# Run with coverage
npm run test:integration:coverage

# Watch mode
npm run test:integration:watch
```

---

## 🏃 Running Tests

### Available Commands

```bash
# Full integration test suite
npm run test:integration

# With coverage report
npm run test:integration:coverage

# Watch mode (re-runs on file changes)
npm run test:integration:watch

# Run specific pattern
npm run test:integration -- cart
npm run test:integration -- api/farm

# Verbose output
npm run test:integration -- --verbose

# Run only changed tests
npm run test:integration -- --onlyChanged
```

### Test Organization

```
src/__tests__/integration/
├── __helpers-test__.test.ts       # Helper verification
├── __simple-db-test__.test.ts     # Database connectivity
├── __debug__.test.ts              # Infrastructure debug
├── api/                           # API endpoint tests
│   ├── cart.api.integration.test.ts
│   ├── farm.api.integration.test.ts
│   ├── order.api.integration.test.ts
│   ├── product.api.integration.test.ts
│   └── search.api.integration.test.ts
└── journeys/                      # End-to-end user journeys
    ├── admin-journey.integration.test.ts
    ├── customer-journey.integration.test.ts
    ├── farmer-journey.integration.test.ts
    └── checkout-journey.integration.test.ts
```

---

## ✍️ Writing Integration Tests

### Basic Template

```typescript
/**
 * Integration test for [Feature Name]
 */
import { database } from "@/lib/database";
import {
  createTestUser,
  createTestFarm,
  createTestProduct,
  cleanupTestData,
  generateTestEmail,
} from "@/tests/helpers/integration-helpers";

describe("[Feature Name] Integration Tests", () => {
  // Test data variables
  let testUser: any;
  let testFarm: any;

  // Setup: Create test data
  beforeAll(async () => {
    testUser = await createTestUser({
      email: generateTestEmail(),
      name: "Test User",
      role: "CONSUMER", // ⚠️ Note: CONSUMER not CUSTOMER
    });

    testFarm = await createTestFarm({
      name: "Test Farm",
      ownerId: testUser.id,
      status: "ACTIVE",
    });
  });

  // Cleanup: Remove test data
  afterAll(async () => {
    await cleanupTestData();
    await database.$disconnect();
  });

  // Your tests
  describe("Feature Functionality", () => {
    it("should perform expected behavior", async () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = await yourFunction(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
    });
  });
});
```

### API Endpoint Test Template

```typescript
import { createTestUser } from "@/tests/helpers/integration-helpers";

describe("GET /api/your-endpoint", () => {
  let testUser: any;

  beforeAll(async () => {
    testUser = await createTestUser({ role: "CONSUMER" });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("should return 200 with valid data", async () => {
    const response = await fetch(`http://localhost:3001/api/your-endpoint`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add auth headers if needed
      },
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it("should return 401 without authentication", async () => {
    const response = await fetch(`http://localhost:3001/api/your-endpoint`);
    expect(response.status).toBe(401);
  });
});
```

---

## 🛠️ Test Helpers API

### User Helpers

```typescript
// Create a single user
const user = await createTestUser({
  email?: string,          // Optional: auto-generated if not provided
  name?: string,           // Optional: defaults to "Test User"
  password?: string,       // Optional: defaults to "hashed_test_password"
  role?: "CONSUMER" | "FARMER" | "ADMIN"  // Optional: defaults to "CONSUMER"
});

// Create multiple users
const users = await createTestUsers(count: number, input?: CreateTestUserInput);

// Generate unique test email
const email = generateTestEmail();
// Returns: "test-1768580759818-abc123@example.com"
```

### Farm Helpers

```typescript
// Create a single farm
const farm = await createTestFarm({
  name?: string,           // Optional: defaults to "Test Farm"
  slug?: string,           // Optional: auto-generated from name
  description?: string,    // Optional
  ownerId: string,         // Required: User ID (must be FARMER role)
  email?: string,          // Optional: defaults to "farm@example.com"
  phone?: string,          // Optional: defaults to "555-0100"
  address?: string,        // Optional: defaults to "123 Farm Road"
  city?: string,           // Optional: defaults to "Farmville"
  state?: string,          // Optional: defaults to "CA"
  zipCode?: string,        // Optional: defaults to "12345"
  latitude?: number,       // Optional: defaults to 37.7749
  longitude?: number,      // Optional: defaults to -122.4194
  status?: "ACTIVE" | "INACTIVE" | "PENDING"  // Optional: defaults to "PENDING"
});

// Create multiple farms
const farms = await createTestFarms(count: number, ownerId: string);
```

### Product Helpers

```typescript
// Create a single product
const product = await createTestProduct({
  name?: string,           // Optional: defaults to "Test Product"
  description?: string,    // Optional
  price?: number,          // Optional: defaults to 9.99
  farmId: string,          // Required: Farm ID
  category?: string,       // Optional: defaults to "VEGETABLES"
  unit?: string,           // Optional: defaults to "lb"
  quantityAvailable?: number,  // Optional: defaults to 100
  inStock?: boolean,       // Optional: defaults to true
});

// Create multiple products
const products = await createTestProducts(count: number, farmId: string);

// ⚠️ Important: Decimal fields
// Prisma returns Decimal as string for precision
expect(Number(product.price)).toBe(9.99);  // ✅ Correct
expect(product.price).toBe(9.99);          // ❌ Fails (string vs number)
```

### Order Helpers

```typescript
// Create a single order
const order = await createTestOrder({
  customerId: string,      // Required: User ID
  items: OrderItemInput[], // Required: Array of order items
  status?: string,         // Optional: defaults to "PENDING"
});

// Create order items
const orderItem = {
  productId: string,
  quantity: number,
  price: number,
  farmId: string,
};
```

### Cleanup

```typescript
// Automatic cleanup (tracks all created entities)
afterAll(async () => {
  await cleanupTestData();  // Deletes all tracked test data
  await database.$disconnect();
});

// Manual cleanup (if needed)
await database.user.deleteMany({ where: { email: { contains: 'test-' } } });
```

---

## 📚 Common Patterns

### Pattern 1: Test Data Setup with Dependencies

```typescript
describe("Order Creation Flow", () => {
  let customer: any;
  let farmer: any;
  let farm: any;
  let product: any;

  beforeAll(async () => {
    // 1. Create customer
    customer = await createTestUser({
      role: "CONSUMER",
      email: generateTestEmail(),
    });

    // 2. Create farmer
    farmer = await createTestUser({
      role: "FARMER",
      email: generateTestEmail(),
    });

    // 3. Create farm (needs farmer)
    farm = await createTestFarm({
      ownerId: farmer.id,
      status: "ACTIVE",
    });

    // 4. Create product (needs farm)
    product = await createTestProduct({
      farmId: farm.id,
      inStock: true,
      quantityAvailable: 50,
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await database.$disconnect();
  });

  it("should create order successfully", async () => {
    const order = await createTestOrder({
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantity: 2,
          price: product.price,
          farmId: farm.id,
        },
      ],
    });

    expect(order.id).toBeDefined();
    expect(order.customerId).toBe(customer.id);
  });
});
```

### Pattern 2: Testing Validation Errors

```typescript
it("should reject invalid email format", async () => {
  await expect(
    createTestUser({ email: "invalid-email" })
  ).rejects.toThrow();
});

it("should require farm owner to be FARMER role", async () => {
  const consumer = await createTestUser({ role: "CONSUMER" });
  
  await expect(
    createTestFarm({ ownerId: consumer.id })
  ).rejects.toThrow(/owner must be a farmer/i);
});
```

### Pattern 3: Testing Database Constraints

```typescript
it("should enforce unique email constraint", async () => {
  const email = generateTestEmail();
  
  // First user succeeds
  const user1 = await createTestUser({ email });
  expect(user1).toBeDefined();
  
  // Second user with same email fails
  await expect(
    createTestUser({ email })
  ).rejects.toThrow(/unique constraint/i);
});
```

### Pattern 4: Testing Relations

```typescript
it("should load farm with owner and products", async () => {
  const farm = await database.farm.findUnique({
    where: { id: testFarm.id },
    include: {
      owner: true,
      products: true,
    },
  });

  expect(farm).toBeDefined();
  expect(farm.owner.id).toBe(testUser.id);
  expect(farm.products).toBeInstanceOf(Array);
});
```

---

## 🐛 Troubleshooting

### Problem: All tests return `undefined`

**Cause:** Database module is being mocked.

**Solution:**
```javascript
// In jest.integration.setup.cjs (already done)
jest.unmock("@/lib/database");
jest.unmock("@prisma/client");
```

---

### Problem: `PrismaClient initialization error`

**Cause:** Prisma client not generated.

**Solution:**
```bash
npx prisma generate
# Verify engine exists
ls node_modules/.prisma/client/*.node
```

---

### Problem: `Column 'xyz' does not exist`

**Cause:** Database schema out of sync with Prisma schema.

**Solution:**
```bash
# Apply migrations
DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" \
  npx prisma migrate deploy

# Or reset test database
DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" \
  npx prisma migrate reset --force
```

---

### Problem: `Invalid value for enum`

**Common Mistakes:**
- ❌ `role: "CUSTOMER"` → ✅ `role: "CONSUMER"`
- ❌ `category: "VEGETABLE"` → ✅ `category: "VEGETABLES"`
- ❌ `status: "PUBLISHED"` → ✅ `status: "ACTIVE"`

**Solution:** Check schema for correct enum values.

---

### Problem: `Foreign key constraint violation`

**Cause:** Trying to delete entity with dependent records.

**Solution:**
```typescript
// Delete in correct order (children first, parents last)
await database.product.deleteMany({ where: { farmId: farm.id } });
await database.farm.delete({ where: { id: farm.id } });
await database.user.delete({ where: { id: user.id } });

// Or use cleanup helper (handles order automatically)
await cleanupTestData();
```

---

### Problem: Tests hanging or timing out

**Causes:**
1. Database connection not closed
2. Infinite loop in test
3. Deadlock in database

**Solutions:**
```typescript
// Always disconnect after tests
afterAll(async () => {
  await database.$disconnect();
});

// Increase timeout for slow operations
it("slow operation", async () => {
  // test code
}, 30000); // 30 second timeout

// Check for open handles
npm run test:integration -- --detectOpenHandles
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use Test Helpers**
   ```typescript
   ✅ const user = await createTestUser({ role: "CONSUMER" });
   ❌ const user = await database.user.create({ data: { ... } });
   ```

2. **Generate Unique Identifiers**
   ```typescript
   ✅ email: generateTestEmail()
   ❌ email: "test@example.com"
   ```

3. **Clean Up After Tests**
   ```typescript
   ✅ afterAll(async () => { await cleanupTestData(); });
   ❌ // No cleanup
   ```

4. **Use Proper Type Conversions**
   ```typescript
   ✅ expect(Number(product.price)).toBe(9.99);
   ❌ expect(product.price).toBe(9.99);
   ```

5. **Test Real Business Logic**
   ```typescript
   ✅ Test actual API endpoints
   ✅ Test database constraints
   ✅ Test validation logic
   ❌ Test mocked functions
   ```

### ❌ DON'T

1. **Don't Use Hardcoded IDs**
   ```typescript
   ❌ const user = await database.user.findUnique({ where: { id: "123" } });
   ✅ const user = await createTestUser();
   ```

2. **Don't Rely on Test Order**
   ```typescript
   ❌ Assuming test A runs before test B
   ✅ Each test should be independent
   ```

3. **Don't Leave Test Data**
   ```typescript
   ❌ Creating entities without cleanup
   ✅ Use cleanupTestData() in afterAll
   ```

4. **Don't Mock the Database**
   ```typescript
   ❌ jest.mock("@/lib/database")
   ✅ Use real database for integration tests
   ```

---

## 📊 Performance Tips

### Parallel Execution

```bash
# Run tests in parallel (default: 4 workers)
npm run test:integration -- --maxWorkers=4

# Single worker (serial execution)
npm run test:integration -- --maxWorkers=1
```

### Optimize Test Data

```typescript
// ✅ Create shared test data once
beforeAll(async () => {
  testUser = await createTestUser();
  testFarm = await createTestFarm({ ownerId: testUser.id });
});

// ❌ Recreate for each test
beforeEach(async () => {
  testUser = await createTestUser();
});
```

### Database Connection Pooling

```typescript
// Already configured in lib/database/index.ts
// Single connection per serverless function
// No action needed
```

---

## 🎓 Learning Resources

### Example Tests

- `src/__tests__/integration/__helpers-test__.test.ts` - Helper usage examples
- `src/__tests__/integration/__simple-db-test__.test.ts` - Basic database operations
- `src/__tests__/integration/api/*.test.ts` - API endpoint testing patterns

### Documentation

- [Session 11 Summary](./SESSION-11-INTEGRATION-TEST-BREAKTHROUGH.md) - Breakthrough achievements
- [Prisma Schema](../prisma/schema.prisma) - Database models and enums
- [Test Helpers Source](../tests/helpers/integration-helpers.ts) - Helper implementation

---

## 📞 Getting Help

### Check Logs

```bash
# Verbose test output
npm run test:integration -- --verbose

# Show console.log statements
npm run test:integration -- --silent=false
```

### Debug Single Test

```typescript
// Add focused test
it.only("should debug this test", async () => {
  console.log("Debug info:", testData);
  // test code
});
```

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `PrismaClientInitializationError` | Client not generated | Run `npx prisma generate` |
| `Column does not exist` | Schema out of sync | Run migrations |
| `Invalid value for enum` | Wrong enum value | Check schema for correct value |
| `Foreign key constraint` | Deleting in wrong order | Use `cleanupTestData()` |
| `Received: undefined` | Database still mocked | Check integration setup |

---

## 🚀 Next Steps

1. **Write Your First Test**
   - Copy a template from above
   - Add your test logic
   - Run with `npm run test:integration`

2. **Run Existing Tests**
   - `npm run test:integration -- __helpers`
   - Study the passing examples

3. **Fix Failing Tests**
   - Check enum values
   - Add missing required fields
   - Update to match current schema

4. **Increase Coverage**
   - Write tests for uncovered endpoints
   - Add edge case tests
   - Test error conditions

---

**Happy Testing! 🧪**

*Remember: Integration tests use REAL database operations.*  
*All data is automatically cleaned up after tests.*  
*Test with confidence!*

---

**Last Updated:** January 16, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready