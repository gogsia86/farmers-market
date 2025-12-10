# 🧪 Integration Tests

This directory contains **true integration tests** that run against a real PostgreSQL database using [testcontainers](https://testcontainers.com/).

## 📁 Directory Structure

```
tests/integration/
├── README.md                 # This file
├── setup/                    # Test infrastructure
│   ├── testcontainers.ts     # PostgreSQL container management
│   ├── jest.globalSetup.ts   # Jest global setup (starts container)
│   └── jest.globalTeardown.ts # Jest global teardown (stops container)
├── fixtures/                 # Test data
│   └── seed.ts               # Database seeding with deterministic data
├── db/                       # Database integration tests
│   ├── order.repository.integration.test.ts
│   └── product.repository.integration.test.ts
└── ...
```

## 🚀 Running Integration Tests

### Prerequisites

1. **Docker** must be installed and running
2. **Node.js 20+** with npm

### Commands

```bash
# Run all integration tests
npm run test:integration:db

# Run with verbose output
npm run test:integration:db -- --verbose

# Run a specific test file
npm run test:integration:db -- order.repository

# Run with coverage
npm run test:integration:db -- --coverage
```

### Using an External Database

If you prefer not to use testcontainers, you can provide your own test database:

```bash
# Set the environment variable
export INTEGRATION_TEST_DATABASE_URL="postgresql://user:pass@localhost:5433/test_db"

# Run tests
npm run test:integration:db
```

## 🐳 How It Works

1. **Global Setup** (`jest.globalSetup.ts`):
   - Starts a PostgreSQL container using testcontainers
   - Runs Prisma migrations (`prisma db push`)
   - Seeds the database with test fixtures
   - Sets `DATABASE_URL` environment variable

2. **Test Execution**:
   - Each test file gets a fresh Prisma client connected to the container
   - Tests can clean/reseed database between test cases
   - Tests run serially (`maxWorkers: 1`) for database consistency

3. **Global Teardown** (`jest.globalTeardown.ts`):
   - Disconnects Prisma client
   - Stops and removes the PostgreSQL container

## 📊 Test Data (Fixtures)

Test data is defined in `fixtures/seed.ts` with **fixed UUIDs** for deterministic testing:

### Test IDs

```typescript
import { TEST_IDS } from "../fixtures/seed";

// Users
TEST_IDS.ADMIN_USER; // Admin user
TEST_IDS.FARMER_USER_1; // First farmer
TEST_IDS.FARMER_USER_2; // Second farmer
TEST_IDS.CUSTOMER_USER_1; // First customer
TEST_IDS.CUSTOMER_USER_2; // Second customer

// Farms
TEST_IDS.FARM_1; // Farm owned by FARMER_USER_1
TEST_IDS.FARM_2; // Farm owned by FARMER_USER_2

// Products
TEST_IDS.PRODUCT_TOMATOES; // In-stock vegetable
TEST_IDS.PRODUCT_LETTUCE; // In-stock vegetable
TEST_IDS.PRODUCT_CARROTS; // In-stock vegetable
TEST_IDS.PRODUCT_EGGS; // Dairy product
TEST_IDS.PRODUCT_HONEY; // Pantry item
TEST_IDS.PRODUCT_OUT_OF_STOCK; // Out of stock product

// Orders
TEST_IDS.ORDER_PENDING; // Pending order
TEST_IDS.ORDER_COMPLETED; // Delivered order
TEST_IDS.ORDER_CANCELLED; // Cancelled order
```

### Test Credentials

```typescript
import { TEST_CREDENTIALS } from "../fixtures/seed";

TEST_CREDENTIALS.ADMIN.email; // admin@test.farmersmarket.app
TEST_CREDENTIALS.FARMER_1.email; // farmer1@test.farmersmarket.app
TEST_CREDENTIALS.CUSTOMER_1.email; // customer1@test.farmersmarket.app
```

## ✍️ Writing Integration Tests

### Basic Test Structure

```typescript
import { PrismaClient } from "@prisma/client";
import {
  getTestPrismaClient,
  cleanTestDatabase,
} from "../setup/testcontainers";
import { TEST_IDS, seedMinimalTestData } from "../fixtures/seed";

let prisma: PrismaClient;

describe("🔗 My Integration Tests", () => {
  beforeAll(async () => {
    prisma = await getTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean and reseed for test isolation
    await cleanTestDatabase();
    await seedMinimalTestData(prisma);
  });

  it("should perform database operation", async () => {
    // Arrange - Use seeded test data
    const productId = TEST_IDS.PRODUCT_TOMATOES;

    // Act - Perform real database operation
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    // Assert - Verify results
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Test Organic Tomatoes");
  });
});
```

### Testing Transactions

```typescript
it("should rollback on error", async () => {
  const slug = `test-rollback-${Date.now()}`;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.create({
        data: { /* ... */ slug },
      });
      throw new Error("Intentional rollback");
    });
  } catch {
    // Expected
  }

  // Product should not exist due to rollback
  const product = await prisma.product.findFirst({
    where: { slug },
  });
  expect(product).toBeNull();
});
```

### Testing Constraints

```typescript
it("should enforce foreign key constraint", async () => {
  await expect(
    prisma.order.create({
      data: {
        customerId: "non-existent-id",
        // ...
      },
    }),
  ).rejects.toThrow();
});
```

## 🔄 Comparison: Unit vs Integration Tests

| Aspect       | Unit Tests (`src/__tests__/unit/`) | Integration Tests (`tests/integration/`) |
| ------------ | ---------------------------------- | ---------------------------------------- |
| Database     | Mocked                             | Real PostgreSQL (testcontainers)         |
| Speed        | Fast (~1ms/test)                   | Slower (~100ms/test)                     |
| Isolation    | Complete (mocks)                   | Per-test (clean + seed)                  |
| Coverage     | Logic, transformations             | DB operations, constraints               |
| Dependencies | None                               | Docker required                          |

## 🛠️ Troubleshooting

### Container Won't Start

```bash
# Check Docker is running
docker info

# Pull the image manually
docker pull postgis/postgis:16-3.4-alpine

# Check available ports
netstat -an | grep 5432
```

### Tests Timeout

Increase the timeout in `jest.config.integration.js`:

```javascript
testTimeout: 120000, // 2 minutes
```

### Database Connection Issues

```bash
# Check container logs
docker logs $(docker ps -q --filter "ancestor=postgis/postgis")

# Verify DATABASE_URL
echo $DATABASE_URL
```

### Cleanup Stale Containers

```bash
# Remove all test containers
docker ps -a | grep postgres | awk '{print $1}' | xargs docker rm -f
```

## 📈 Best Practices

1. **Use deterministic test data** - Fixed IDs enable predictable assertions
2. **Clean between tests** - Call `cleanTestDatabase()` in `beforeEach`
3. **Test real scenarios** - Integration tests should cover edge cases unit tests can't
4. **Keep tests focused** - One feature per test file
5. **Avoid test interdependence** - Each test should be runnable in isolation
6. **Use transactions for complex tests** - Ensures atomicity

## 🔄 CI/CD Integration

Integration tests run automatically in GitHub Actions via the **Integration & Contract Tests** workflow.

### Workflow Location

```
.github/workflows/integration-tests.yml
```

### Automatic Triggers

- **Push** to `main`, `master`, or `develop` branches
- **Pull requests** to those branches
- **Manual dispatch** via GitHub Actions UI

### Skipping Tests in PRs

Add labels to skip tests:

- `skip-integration` - Skip database integration tests
- `skip-contracts` - Skip Stripe contract tests

### Manual Workflow Options

When triggering manually:

- **Skip Stripe tests** - Skip all Stripe contract tests
- **Use Stripe live** - Run against Stripe test API instead of stripe-mock

### CI Environment

The CI workflow:

1. Pre-pulls the PostgreSQL image for faster startup
2. Uses testcontainers to spin up an ephemeral database
3. Runs Prisma migrations automatically
4. Seeds test data
5. Executes all integration tests
6. Uploads coverage reports as artifacts

### Required Secrets (for live Stripe tests)

```yaml
STRIPE_TEST_SECRET_KEY: sk_test_xxx # Only for live Stripe test mode
```

### Example CI Status Badges

```markdown
![Integration Tests](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/integration-tests.yml/badge.svg)
```

## 🔗 Related Documentation

- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Testcontainers Node.js](https://node.testcontainers.org/)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Stripe Mock](https://github.com/stripe/stripe-mock)
