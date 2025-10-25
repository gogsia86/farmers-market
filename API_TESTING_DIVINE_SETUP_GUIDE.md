# 🧪 DIVINE API TESTING SETUP GUIDE

## ⚡ Agricultural Database Testing Strategy

The API tests are failing because they need proper database setup. Here's your divine guidance for **agricultural consciousness testing perfection**:

## 🔧 Current Test Infrastructure Status

✅ **Jest Configuration**: Working with 63 tests passing
✅ **Test Environment**: `.env.test` configured for PostgreSQL
✅ **Test Seed Data**: `prisma/seed-test.ts` with agricultural consciousness
❌ **Database Connection**: API tests need database setup

## 🌾 Divine Solution: 3 Approaches

### 1. 🏆 **RECOMMENDED: In-Memory SQLite for Agricultural Speed**

Best for divine development velocity with agricultural consciousness:

```typescript
// jest.config.js - Add test database setup
const customJestConfig = {
  // ... existing config
  globalSetup: "<rootDir>/tests/setup/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/setup/globalTeardown.ts",
};
```

Create test database setup:

```typescript
// tests/setup/globalSetup.ts
import { execSync } from "child_process";

export default async function globalSetup() {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "file:./test.db";

  // Run migrations for test database
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  execSync("npx prisma db seed", { stdio: "inherit" });
}
```

### 2. 🐳 **DIVINE: Docker Test Container**

For full agricultural ecosystem testing:

```yaml
# docker-compose.test.yml
version: "3.8"
services:
  test-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: farmers_market_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data # In-memory for speed
```

Run tests with:

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run API tests with proper database
npm run test:api

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### 3. 🔧 **QUICK FIX: Enhanced API Test Mocking**

Immediate solution for current tests:

```typescript
// tests/setup/apiTestSetup.ts
export const mockPrismaWithAgriculturalConsciousness = () => {
  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    // Agricultural consciousness methods
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    $disconnect: jest.fn(),
  };

  // Setup realistic responses
  mockPrisma.product.findUnique.mockImplementation((args) => {
    if (args.where.id === "not-found") return null;
    return {
      id: args.where.id,
      name: "Divine Tomatoes",
      price: 4.99,
      farmId: "farm-1",
      categoryId: "cat-1",
      consciousness: "agricultural",
    };
  });

  return mockPrisma;
};
```

## 🚀 Quick Implementation Steps

### **Immediate Fix (5 minutes)**

1. **Update API test mocking**:

```bash
# Create enhanced test setup
mkdir -p tests/setup
```

2. **Fix current failing tests**:

```typescript
// In your API tests, replace PrismaClient mock with:
import { mockPrismaWithAgriculturalConsciousness } from "@/tests/setup/apiTestSetup";

const mockPrisma = mockPrismaWithAgriculturalConsciousness();
```

### **Divine Long-term Solution (15 minutes)**

1. **Setup test database container**:

```bash
# Create docker-compose.test.yml (see above)
docker-compose -f docker-compose.test.yml up -d
```

2. **Create test npm scripts**:

```json
// package.json
{
  "scripts": {
    "test:api": "cross-env NODE_ENV=test jest --testPathPattern=api",
    "test:db:setup": "docker-compose -f docker-compose.test.yml up -d",
    "test:db:teardown": "docker-compose -f docker-compose.test.yml down"
  }
}
```

3. **Run with divine consciousness**:

```bash
npm run test:db:setup
npm run test:api
npm run test:db:teardown
```

## 🌟 Agricultural Consciousness Testing Commands

```bash
# Quick API test with enhanced mocking
npm test -- --testPathPattern="api" --setupFilesAfterEnv="<rootDir>/tests/setup/apiTestSetup.ts"

# Full integration test with real database
npm run test:db:setup && npm run test:api && npm run test:db:teardown

# Divine development mode with test database running
npm run test:db:setup
npm test -- --watch --testPathPattern="api"
```

## 📊 Expected Results After Setup

```
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
API Tests:   ✅ All passing with agricultural consciousness
Database:    ✅ Proper isolation and cleanup
Performance: ✅ Fast execution with proper mocking
```

## 🎯 Which Approach to Choose?

- **🏃 Need quick fix now**: Enhanced API test mocking (#3)
- **🏗️ Building for long-term**: Docker test container (#2)
- **⚡ Maximum divine speed**: In-memory SQLite (#1)

Choose your path based on your immediate divine agricultural development needs!

---

**Agricultural Testing Consciousness**: Ready for API transcendence ⚡
**Database Strategy**: Quantum-ready for divine development 🌾
**Test Coverage**: Expanding towards 100% agricultural perfection 🌟
