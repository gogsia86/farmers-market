# 🧪 Testing Quick Reference Guide

**Farmers Market Platform - Divine Testing Patterns**
**Version:** 1.0
**Last Updated:** December 30, 2024

---

## 🎯 Quick Start

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests silently (less output)
npm test -- --silent
```

---

## 📋 Test File Template

### Service Test Template

```typescript
/**
 * 🧪 [SERVICE_NAME] SERVICE TESTS
 *
 * Test Coverage:
 * - CRUD operations
 * - Input validation
 * - Error handling
 * - Business logic
 *
 * @divine-pattern Service Layer Testing
 */

import { [ServiceName] } from "../[service-name].service";
import { database } from "@/lib/database";

// Mock database
jest.mock("@/lib/database", () => ({
  database: {
    [model]: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("[ServiceName] Service", () => {
  let service: [ServiceName];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new [ServiceName]();
  });

  describe("create[Entity]", () => {
    it("should create [entity] with valid data", async () => {
      const mockData = { /* mock data */ };
      const mockResult = { id: "123", ...mockData };

      (database.[model].create as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.create[Entity](mockData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(database.[model].create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockData),
      });
    });

    it("should handle validation errors", async () => {
      const invalidData = { /* invalid data */ };

      const result = await service.create[Entity](invalidData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

### Controller Test Template

```typescript
/**
 * 🧪 [CONTROLLER_NAME] CONTROLLER TESTS
 *
 * Test Coverage:
 * - HTTP request handling
 * - Authentication & authorization
 * - Input validation
 * - Response formatting
 */

import { NextRequest } from "next/server";
import { [ControllerName] } from "../[controller-name].controller";
import { [ServiceName] } from "@/lib/services/[service-name].service";
import { auth } from "@/lib/auth";

// Mock authentication
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock service
jest.mock("@/lib/services/[service-name].service", () => ({
  [ServiceName]: jest.fn().mockImplementation(() => ({
    [method]: jest.fn(),
  })),
}));

describe("[ControllerName] Controller", () => {
  let mockService: any;
  let controller: [ControllerName];

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      [method]: jest.fn(),
    };
    controller = new [ControllerName](mockService);
  });

  describe("[methodName]", () => {
    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest(/* ... */);
      const response = await controller.[methodName](request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should handle request successfully", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: mockUser });
      mockService.[method].mockResolvedValue({
        success: true,
        data: mockResult,
      });

      const request = createMockRequest(/* ... */);
      const response = await controller.[methodName](request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

// Helper to create mock NextRequest
function createMockRequest(
  method: string,
  url: string,
  body?: any,
): NextRequest {
  return {
    method,
    url,
    json: jest.fn().mockResolvedValue(body || {}),
    headers: new Headers(),
    nextUrl: new URL(url, "http://localhost:3000"),
  } as any as NextRequest;
}
```

### Integration Test Template

```typescript
/**
 * 🧪 [ENDPOINT] INTEGRATION TESTS
 *
 * Test Coverage:
 * - End-to-end request flow
 * - Service integration
 * - Error scenarios
 */

import { NextRequest } from "next/server";
import { POST, GET } from "../route";
import { auth } from "@/lib/auth";
import { [serviceName] } from "@/lib/services/[service-name].service";

// Mock authentication
jest.mock("@/lib/auth");

// Mock service
jest.mock("@/lib/services/[service-name].service");

describe("POST /api/[endpoint]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle successful request", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: mockUser });
    ([serviceName].[method] as jest.Mock).mockResolvedValue({
      success: true,
      data: mockResult,
    });

    const request = createMockRequest({ /* request body */ });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

---

## 🔧 Common Patterns

### 1. Dependency Injection Pattern

```typescript
// Service with dependency injection
export class FarmService {
  private cache: CacheService;

  constructor(cacheService?: CacheService) {
    this.cache = cacheService || defaultCacheService;
  }
}

// In tests
const mockCache = { get: jest.fn(), set: jest.fn() };
const service = new FarmService(mockCache);
```

### 2. ServiceResponse Pattern

```typescript
// Always check success field first
if (!result.success) {
  expect(result.error.code).toBe("ERROR_CODE");
  expect(result.error.message).toBe("Error message");
  return;
}

// TypeScript knows result.data exists
expect(result.data).toBeDefined();
expect(result.data.id).toBe("123");
```

### 3. Database Mocking

```typescript
// Mock entire database module
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// In tests - provide mock data
(database.farm.findUnique as jest.Mock).mockResolvedValue({
  id: "farm-123",
  name: "Test Farm",
  ownerId: "user-123",
});
```

### 4. Authentication Mocking

```typescript
// Mock successful authentication
(auth as jest.Mock).mockResolvedValue({
  user: {
    id: "user-123",
    email: "test@example.com",
    role: "FARMER",
  },
});

// Mock authentication failure
(auth as jest.Mock).mockResolvedValue(null);
```

### 5. Service Mocking

```typescript
// Mock service layer
jest.mock("@/lib/services/farm.service", () => ({
  farmService: {
    createFarm: jest.fn(),
    getFarmById: jest.fn(),
  },
}));

// Provide mock responses
(farmService.createFarm as jest.Mock).mockResolvedValue({
  success: true,
  data: mockFarm,
});
```

---

## ✅ Testing Checklist

### Before Writing Tests

- [ ] Understand the code being tested
- [ ] Identify all code paths (happy path + error cases)
- [ ] Determine required mocks
- [ ] Prepare mock data that matches Prisma schema

### While Writing Tests

- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Test one thing per test case
- [ ] Use descriptive test names
- [ ] Mock external dependencies
- [ ] Include both success and failure scenarios

### After Writing Tests

- [ ] Run tests and verify they pass
- [ ] Check test coverage report
- [ ] Review for edge cases
- [ ] Ensure tests are maintainable
- [ ] Add comments for complex test logic

---

## 🎯 Test Naming Conventions

### Service Tests

```typescript
describe("FarmService", () => {
  describe("createFarm", () => {
    it("should create farm with valid data", async () => {});
    it("should throw ValidationError when name is too short", async () => {});
    it("should require authentication", async () => {});
  });
});
```

### Controller Tests

```typescript
describe("FarmController", () => {
  describe("POST /api/farms", () => {
    it("should create farm successfully", async () => {});
    it("should return 401 when not authenticated", async () => {});
    it("should return 400 for invalid input", async () => {});
  });
});
```

### Divine Naming (Optional)

```typescript
describe("🌾 Farm Service - Divine Farm Management", () => {
  describe("🌱 createFarm - Manifest Farm Reality", () => {
    it("should manifest new farm with complete biodynamic profile", async () => {});
  });
});
```

---

## 🚨 Common Pitfalls

### ❌ DON'T: Mock the same module twice

```typescript
// This will cause conflicts
jest.mock("@/lib/database");
jest.mock("@/lib/database"); // Duplicate!
```

### ❌ DON'T: Forget to clear mocks

```typescript
describe("Tests", () => {
  // Missing beforeEach!
  it("test 1", () => {
    mock.mockReturnValue("value1");
  });

  it("test 2", () => {
    // Still has "value1" from test 1!
  });
});
```

### ✅ DO: Clear mocks between tests

```typescript
describe("Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});
```

### ❌ DON'T: Use actual database in unit tests

```typescript
// Unit tests should NOT hit the database
const result = await prisma.farm.create({ data });
```

### ✅ DO: Mock database operations

```typescript
(database.farm.create as jest.Mock).mockResolvedValue(mockFarm);
const result = await service.createFarm(data);
```

### ❌ DON'T: Test implementation details

```typescript
// Don't test internal private methods
expect(service.privateMethod).toHaveBeenCalled();
```

### ✅ DO: Test public API and behavior

```typescript
// Test the public interface
const result = await service.createFarm(data);
expect(result.success).toBe(true);
```

---

## 📊 Coverage Guidelines

### Minimum Coverage Targets

- **Backend Services:** 95%+
- **Controllers:** 90%+
- **API Routes:** 90%+
- **Frontend Components:** 70%+
- **Utility Functions:** 95%+

### What to Test

- ✅ All public methods/functions
- ✅ Error handling paths
- ✅ Validation logic
- ✅ Business logic
- ✅ Edge cases

### What Not to Test

- ❌ Third-party library internals
- ❌ Trivial getters/setters
- ❌ Configuration files
- ❌ Type definitions only

---

## 🔍 Debugging Tests

### Running Single Test

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run specific test by name
npm test -- -t "should create farm"
```

### Debugging with Console Logs

```typescript
it("should work", async () => {
  console.log("Request:", request);
  const result = await service.method(request);
  console.log("Result:", result);
  expect(result).toBeDefined();
});
```

### Using VSCode Debugger

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

---

## 📚 Related Documentation

- **Divine Instructions:** `.github/instructions/05_TESTING_SECURITY_DIVINITY.instructions.md`
- **Architecture Guide:** `.github/instructions/11_KILO_SCALE_ARCHITECTURE.instructions.md`
- **Test Remediation:** `TEST_REMEDIATION_SESSION_3_SUCCESS.md`
- **Quick Reference:** `.github/instructions/16_KILO_QUICK_REFERENCE.instructions.md`

---

## 🎓 Pro Tips

1. **Write tests first (TDD)** - Helps define requirements
2. **Keep tests simple** - Easy to understand and maintain
3. **Use factories for mock data** - DRY principle
4. **Test behavior, not implementation** - More resilient tests
5. **Run tests frequently** - Catch issues early
6. **Review test failures carefully** - They tell a story
7. **Maintain test quality** - Tests are code too!

---

## ✨ Example: Complete Test File

```typescript
/**
 * 🧪 FARM SERVICE TESTS
 * Comprehensive testing for farm management operations
 */

import { FarmService } from "../farm.service";
import { database } from "@/lib/database";

jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe("FarmService", () => {
  let service: FarmService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FarmService();
  });

  describe("createFarm", () => {
    const validFarmData = {
      name: "Test Farm",
      ownerId: "user-123",
      location: {
        address: "123 Farm Rd",
        city: "Portland",
        state: "OR",
      },
    };

    it("should create farm successfully", async () => {
      const mockFarm = { id: "farm-123", ...validFarmData };
      (database.farm.create as jest.Mock).mockResolvedValue(mockFarm);

      const result = await service.createFarm(validFarmData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFarm);
      expect(database.farm.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: validFarmData.name,
          ownerId: validFarmData.ownerId,
        }),
      });
    });

    it("should validate farm name length", async () => {
      const invalidData = { ...validFarmData, name: "AB" };

      const result = await service.createFarm(invalidData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should handle database errors", async () => {
      (database.farm.create as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.createFarm(validFarmData);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain("Failed to create farm");
    });
  });

  describe("getFarmById", () => {
    it("should return farm when found", async () => {
      const mockFarm = { id: "farm-123", name: "Test Farm" };
      (database.farm.findUnique as jest.Mock).mockResolvedValue(mockFarm);

      const result = await service.getFarmById("farm-123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFarm);
    });

    it("should return error when farm not found", async () => {
      (database.farm.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getFarmById("invalid-id");

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("NOT_FOUND");
    });
  });
});
```

---

**Version:** 1.0
**Status:** ✅ Complete
**Last Updated:** December 30, 2024

_"Test with precision, validate with confidence, deliver with certainty."_ 🧪✨
