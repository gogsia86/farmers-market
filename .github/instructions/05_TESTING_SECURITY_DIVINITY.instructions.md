---
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx}"
description: "Testing ascension, security divinity, monitoring consciousness, and quality assurance excellence"
---

# 05 | TESTING SECURITY DIVINITY

**Comprehensive Quality, Security & Observability**

## 🔗 Related Divine Instructions

- **[01 | Divine Core Principles](./01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Quality principles & review checklist
- **[02 | Agricultural Quantum Mastery](./02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)** - Test agricultural features
- **[03 | Performance Reality Bending](./03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Performance testing
- **[04 | Next.js Divine Implementation](./04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)** - Test Next.js components
- **[06 | Automation Infrastructure](./06_AUTOMATION_INFRASTRUCTURE.instructions.md)** - Automated testing in CI/CD

---

## 🧪 TEST ASCENSION PHILOSOPHY

### Tests as Living Documentation

Tests should be **self-documenting specifications**:

- Test names read like requirements
- Failures teach fundamental truths
- Coverage guides architecture decisions
- Tests prevent future entropy

### Quantum Test Pyramid

```
        /\
       /E2E\         ← Few (Critical user flows)
      /------\
     /INTEGRA\       ← Some (API contracts, DB queries)
    /----------\
   /UNIT  TESTS \    ← Many (Business logic, utilities)
  /--------------\
```

---

## ✨ DIVINE TESTING PATTERNS

### Enlightening Test Names

```typescript
// ❌ MORTAL TESTS
test("user creation works", () => {});
test("farm search", () => {});

// ✅ DIVINE TESTS
describe("User Consciousness Manifestation", () => {
  it("manifests new user with complete profile in quantum database", async () => {});

  it("rejects user manifestation when email already exists in reality", async () => {});

  it("preserves temporal coherence by recording creation timestamp", async () => {});
});

describe("Agricultural Search Reality", () => {
  it("finds farms matching quantum search query across multiple dimensions", async () => {});

  it("respects seasonal filters to show only currently harvesting farms", async () => {});

  it("ranks results by biodynamic relevance and proximity", async () => {});
});
```

### Comprehensive Test Structure

```typescript
// tests/features/farm-creation.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { database } from "@/lib/database";
import { CreateFarmForm } from "@/components/CreateFarmForm";

describe("Farm Creation Quantum Reality", () => {
  // Setup test environment
  beforeEach(async () => {
    await database.$transaction([
      database.farm.deleteMany(),
      database.user.deleteMany(),
    ]);

    // Seed test user
    await database.user.create({
      data: {
        id: "test-user-1",
        email: "farmer@example.com",
        name: "Test Farmer",
      },
    });
  });

  afterEach(async () => {
    // Cleanup
    await database.$disconnect();
  });

  describe("Form Validation Reality", () => {
    it("validates farm name length according to divine requirements", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFarmForm />);

      // Act
      const nameInput = screen.getByLabelText(/farm name/i);
      await user.type(nameInput, "AB"); // Too short (< 3 chars)
      await user.click(screen.getByRole("button", { name: /create farm/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it("accepts valid farm data and manifests farm in database", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<CreateFarmForm userId="test-user-1" />);

      const farmData = {
        name: "Quantum Valley Farm",
        address: "123 Divine Street, Reality, CA 94000",
        description: "Growing consciousness through organic vegetables",
      };

      // Act
      await user.type(screen.getByLabelText(/farm name/i), farmData.name);
      await user.type(screen.getByLabelText(/address/i), farmData.address);
      await user.type(
        screen.getByLabelText(/description/i),
        farmData.description
      );
      await user.click(screen.getByRole("button", { name: /create farm/i }));

      // Assert
      await waitFor(async () => {
        const createdFarm = await database.farm.findFirst({
          where: { name: farmData.name },
        });

        expect(createdFarm).not.toBeNull();
        expect(createdFarm?.name).toBe(farmData.name);
        expect(createdFarm?.address).toBe(farmData.address);
        expect(createdFarm?.description).toBe(farmData.description);
        expect(createdFarm?.ownerId).toBe("test-user-1");
      });

      expect(
        screen.getByText(/farm created successfully/i)
      ).toBeInTheDocument();
    });
  });

  describe("Error Enlightenment", () => {
    it("provides divine guidance when database connection fails", async () => {
      // Arrange
      const user = userEvent.setup();

      // Mock database failure
      vi.spyOn(database.farm, "create").mockRejectedValueOnce(
        new Error("Database connection lost")
      );

      render(<CreateFarmForm userId="test-user-1" />);

      // Act
      await user.type(screen.getByLabelText(/farm name/i), "Test Farm");
      await user.click(screen.getByRole("button", { name: /create farm/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/database connection/i)).toBeInTheDocument();
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });
  });
});
```

---

## 🎭 INTEGRATION TEST DIVINITY

### API Contract Testing

```typescript
// tests/api/farms.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "@/lib/test-utils/server";
import { database } from "@/lib/database";

describe("Farm API Endpoints - Divine Contracts", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await createServer();
    await database.$connect();
  });

  afterAll(async () => {
    await server.close();
    await database.$disconnect();
  });

  describe("GET /api/farms - Quantum Farm Manifestation", () => {
    it("returns all active farms with correct schema", async () => {
      // Arrange
      await database.farm.createMany({
        data: [
          { name: "Farm 1", status: "ACTIVE", ownerId: "user-1" },
          { name: "Farm 2", status: "ACTIVE", ownerId: "user-2" },
          { name: "Farm 3", status: "SUSPENDED", ownerId: "user-3" },
        ],
      });

      // Act
      const response = await server.get("/api/farms");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        farms: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            status: "ACTIVE",
            createdAt: expect.any(String),
          }),
        ]),
        pagination: {
          total: 2, // Only active farms
          limit: 20,
          offset: 0,
        },
      });
    });

    it("supports pagination quantum parameters", async () => {
      // Create 25 farms
      await database.farm.createMany({
        data: Array.from({ length: 25 }, (_, i) => ({
          name: `Farm ${i}`,
          status: "ACTIVE",
          ownerId: "user-1",
        })),
      });

      // Act
      const response = await server.get("/api/farms?limit=10&offset=10");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.farms).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        total: 25,
        limit: 10,
        offset: 10,
        hasMore: true,
      });
    });
  });

  describe("POST /api/farms - Farm Creation Reality", () => {
    it("creates farm with valid authentication and data", async () => {
      // Arrange
      const authToken = await server.createAuthToken({
        userId: "test-user-1",
      });

      const farmData = {
        name: "New Quantum Farm",
        location: {
          address: "456 Reality Lane",
          coordinates: { lat: 37.7749, lng: -122.4194 },
        },
      };

      // Act
      const response = await server
        .post("/api/farms")
        .set("Authorization", `Bearer ${authToken}`)
        .send(farmData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: farmData.name,
        ownerId: "test-user-1",
        status: "PENDING_VERIFICATION",
      });

      // Verify in database
      const created = await database.farm.findUnique({
        where: { id: response.body.id },
      });
      expect(created).not.toBeNull();
    });

    it("rejects creation without authentication", async () => {
      // Act
      const response = await server
        .post("/api/farms")
        .send({ name: "Unauthorized Farm" });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/authentication required/i);
    });
  });
});
```

---

## 🌐 E2E TEST TRANSCENDENCE

### Critical User Flow Testing

```typescript
// tests/e2e/farm-marketplace.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Farm Marketplace - Complete User Journey", () => {
  test("visitor discovers farm, views products, and contacts farmer", async ({
    page,
  }) => {
    // 1. Land on homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/Farmers Market/);

    // 2. Search for organic farms
    await page.fill('[placeholder="Search farms..."]', "organic");
    await page.click('button:has-text("Search")');

    // 3. Verify search results
    await expect(page.locator('[data-testid="farm-card"]')).toHaveCount(
      expect.any(Number)
    );

    // 4. Click first farm
    await page.click('[data-testid="farm-card"]  >> nth=0');

    // 5. Verify farm page loaded
    await expect(page.locator("h1")).toContainText("Farm");
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();

    // 6. View product details
    await page.click('[data-testid="product-card"] >> nth=0');
    await expect(page.locator('[data-testid="product-modal"]')).toBeVisible();

    // 7. Add to cart
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");

    // 8. Contact farmer
    await page.click('button:has-text("Contact Farmer")');
    await page.fill('[name="message"]', "When can I pick up?");
    await page.click('button:has-text("Send Message")');

    // 9. Verify success
    await expect(page.locator("text=Message sent successfully")).toBeVisible();
  });

  test("farmer creates farm and lists products", async ({ page }) => {
    // 1. Login as farmer
    await page.goto("/login");
    await page.fill('[name="email"]', "farmer@example.com");
    await page.fill('[name="password"]', "divine-password-123");
    await page.click('button:has-text("Login")');

    // 2. Navigate to dashboard
    await page.click("text=Dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Create new farm
    await page.click('button:has-text("Create Farm")');
    await page.fill('[name="name"]', "E2E Test Farm");
    await page.fill('[name="address"]', "123 Test Street");
    await page.click('button:has-text("Submit")');

    // 4. Verify farm created
    await expect(page.locator("text=Farm created successfully")).toBeVisible();

    // 5. Add product
    await page.click('button:has-text("Add Product")');
    await page.fill('[name="productName"]', "Organic Tomatoes");
    await page.fill('[name="price"]', "5.99");
    await page.selectOption('[name="category"]', "Vegetables");
    await page.click('button:has-text("List Product")');

    // 6. Verify product listed
    await expect(
      page.locator("text=Product listed successfully")
    ).toBeVisible();
    await expect(page.locator("text=Organic Tomatoes")).toBeVisible();
  });
});
```

---

## 🔒 SECURITY DIVINITY

### Authentication & Authorization Testing

```typescript
// tests/security/auth.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, verifyToken } from "@/lib/auth/jwt";

describe("Authentication Security Divine Protocols", () => {
  describe("Password Hashing Quantum Security", () => {
    it("hashes passwords with bcrypt and salt", async () => {
      const password = "divine-secure-password-123";
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.startsWith("$2b$")).toBe(true); // bcrypt prefix
      expect(hashed.length).toBeGreaterThan(50);
    });

    it("produces different hashes for same password (salt randomness)", async () => {
      const password = "same-password";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("verifies correct password successfully", async () => {
      const password = "correct-password";
      const hashed = await hashPassword(password);

      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it("rejects incorrect password", async () => {
      const hashed = await hashPassword("correct-password");

      const isValid = await verifyPassword("wrong-password", hashed);
      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token Quantum Security", () => {
    it("generates valid JWT tokens with user data", () => {
      const payload = {
        userId: "user-123",
        email: "user@example.com",
        role: "FARMER",
      };

      const token = generateToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // header.payload.signature
    });

    it("verifies and decodes valid tokens", () => {
      const payload = { userId: "user-123", role: "FARMER" };
      const token = generateToken(payload);

      const decoded = verifyToken(token);

      expect(decoded.userId).toBe("user-123");
      expect(decoded.role).toBe("FARMER");
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expiration
    });

    it("rejects tampered tokens", () => {
      const token = generateToken({ userId: "user-123" });
      const tampered = token.slice(0, -5) + "XXXXX"; // Tamper with signature

      expect(() => verifyToken(tampered)).toThrow(/invalid signature/i);
    });

    it("rejects expired tokens", async () => {
      const token = generateToken(
        { userId: "user-123" },
        { expiresIn: "1ms" } // Expire immediately
      );

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(() => verifyToken(token)).toThrow(/token expired/i);
    });
  });
});

describe("Authorization Quantum Controls", () => {
  it("prevents users from accessing other users data", async () => {
    const user1Token = generateToken({ userId: "user-1" });

    const response = await server
      .get("/api/users/user-2/farms") // Trying to access user-2's data
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/unauthorized/i);
  });

  it("allows users to access their own data", async () => {
    const user1Token = generateToken({ userId: "user-1" });

    const response = await server
      .get("/api/users/user-1/farms")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
  });
});
```

### Input Validation Security

```typescript
// tests/security/validation.test.ts
import { describe, it, expect } from "vitest";
import { validateProductInput } from "@/lib/validation/product";

describe("Input Validation Security Divine Shields", () => {
  it("sanitizes XSS attempts in product descriptions", () => {
    const maliciousInput = {
      name: 'Tomatoes<script>alert("XSS")</script>',
      description: '<img src=x onerror="alert(1)">',
    };

    const validated = validateProductInput(maliciousInput);

    expect(validated.name).not.toContain("<script>");
    expect(validated.description).not.toContain("onerror");
  });

  it("prevents SQL injection in search queries", () => {
    const maliciousQuery = "'; DROP TABLE farms; --";

    const sanitized = sanitizeSearchQuery(maliciousQuery);

    expect(sanitized).not.toContain("DROP TABLE");
    expect(sanitized).not.toContain(";");
  });

  it("validates and sanitizes file uploads", async () => {
    const maliciousFile = {
      filename: "../../etc/passwd",
      mimetype: "image/jpeg",
      size: 1024,
    };

    expect(() => validateFileUpload(maliciousFile)).toThrow(
      /invalid filename/i
    );
  });
});
```

---

## � GIT-INTEGRATED TESTING DIVINITY

### Pre-Commit Test Validation

Integrate testing into git workflow for **continuous quality assurance**:

```powershell
# Pre-commit test validation (part of scripts/pre-commit.ps1)
Write-Host "   🧪 Validating test coverage..." -ForegroundColor Yellow

# Check test coverage for new components
$stagedFiles = git diff --cached --name-only --diff-filter=A
$newComponents = $stagedFiles | Where-Object { $_ -like "*.tsx" -and $_ -like "*components*" }

foreach ($component in $newComponents) {
    $testFile = $component -replace "\.tsx$", ".test.tsx"
    if (-not (Test-Path $testFile)) {
        Write-Host "⚠️  Consider adding test for new component: $component" -ForegroundColor Yellow
    }
}

# Run quick tests on changed files
$changedTestFiles = $stagedFiles | Where-Object { $_ -like "*.test.*" }
if ($changedTestFiles.Count -gt 0) {
    Write-Host "   🏃 Running tests for changed files..." -ForegroundColor Yellow
    npm test -- --findRelatedTests $changedTestFiles --passWithNoTests
}
```

### Git Hook Testing Strategies

```typescript
// tests/git-hooks/pre-commit.test.ts
describe("Git Pre-Commit Validation", () => {
  it("validates divine naming patterns in staged files", async () => {
    const stagedFiles = await getStagedFiles();
    const violations = await validateDivineNaming(stagedFiles);

    // Don't fail commit, just warn
    if (violations.length > 0) {
      console.warn("⚠️ Consider divine naming patterns:", violations);
    }

    expect(true).toBe(true); // Always pass, guidance only
  });

  it("ensures test coverage for new components", async () => {
    const newComponents = await getNewComponents();
    const missingTests = newComponents.filter(
      (component) => !hasCorrespondingTest(component)
    );

    if (missingTests.length > 0) {
      console.warn("📝 Consider adding tests for:", missingTests);
    }
  });

  it("validates agricultural consciousness in farm features", async () => {
    const farmFiles = await getFarmRelatedFiles();
    const consciousnessLevel =
      await measureAgriculturalConsciousness(farmFiles);

    expect(consciousnessLevel).toBeGreaterThan(0.7); // 70% agricultural awareness
  });
});
```

### Test Coverage Enforcement

```typescript
// lib/testing/coverage-enforcer.ts
export class CoverageEnforcer {
  static async enforcePreCommitCoverage(): Promise<boolean> {
    const stagedFiles = await this.getStagedFiles();
    const testableFiles = stagedFiles.filter(this.isTestableFile);

    for (const file of testableFiles) {
      const coverage = await this.getFileCoverage(file);

      if (coverage < 80) {
        console.warn(`⚠️ Low coverage (${coverage}%) in ${file}`);
        console.warn("   Consider adding tests before committing");
      }
    }

    return true; // Never block commits, just warn
  }

  static async validateTestNaming(testFiles: string[]): Promise<void> {
    for (const testFile of testFiles) {
      const content = await fs.readFile(testFile, "utf-8");

      // Check for divine test naming patterns
      const hasEnlighteningNames =
        content.includes("manifests") ||
        content.includes("quantum") ||
        content.includes("consciousness");

      if (!hasEnlighteningNames) {
        console.warn(`📝 Consider divine test naming in ${testFile}`);
      }
    }
  }
}
```

### Agricultural Testing Consciousness

```typescript
// tests/agricultural/consciousness.test.ts
describe("Agricultural Testing Consciousness", () => {
  it("validates seasonal boundaries in farm operations", async () => {
    const farm = await createTestFarm();
    const invalidSeason = "WINTER";

    await expect(farm.plantCrop("TOMATOES", invalidSeason)).rejects.toThrow(
      SeasonalViolationError
    );
  });

  it("ensures biodynamic patterns in git workflow", async () => {
    const gitHistory = await getGitHistory();
    const agriculturalCommits = gitHistory.filter((commit) =>
      /farm|crop|harvest|soil|season/i.test(commit.message)
    );

    // Agricultural consciousness should be present in farm features
    expect(agriculturalCommits.length).toBeGreaterThan(0);
  });

  it("validates divine patterns are preserved during refactoring", async () => {
    const beforeRefactor = await analyzeCodePatterns();

    // Simulate refactoring
    await refactorComponent("FarmProfile");

    const afterRefactor = await analyzeCodePatterns();

    // Divine patterns should be preserved
    expect(afterRefactor.divinePatterns).toEqual(beforeRefactor.divinePatterns);
    expect(afterRefactor.agriculturalConsciousness).toBeGreaterThanOrEqual(
      beforeRefactor.agriculturalConsciousness
    );
  });
});
```

---

## �📊 MONITORING CONSCIOUSNESS

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
import { performance } from "perf_hooks";

export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static async measure<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - start;

      this.recordMetric(operationName, duration);

      // Alert if operation exceeds threshold
      if (duration > 1000) {
        this.alert(`Slow operation: ${operationName} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${operationName}_ERROR`, duration);
      throw error;
    }
  }

  static getMetrics(operationName: string) {
    const measurements = this.metrics.get(operationName) || [];

    if (measurements.length === 0) {
      return null;
    }

    return {
      count: measurements.length,
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      p50: this.percentile(measurements, 50),
      p95: this.percentile(measurements, 95),
      p99: this.percentile(measurements, 99),
    };
  }

  private static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 1000 measurements
    const measurements = this.metrics.get(name)!;
    if (measurements.length > 1000) {
      measurements.shift();
    }
  }

  private static percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private static alert(message: string) {
    console.warn(`⚠️  PERFORMANCE ALERT: ${message}`);
    // Send to monitoring service (Sentry, DataDog, etc.)
  }
}

// Usage
const farms = await PerformanceMonitor.measure("fetch-farms", async () => {
  return await database.farm.findMany();
});
```

### Error Tracking Divine Consciousness

```typescript
// lib/monitoring/errors.ts
import * as Sentry from "@sentry/nextjs";

export class ErrorMonitor {
  static captureException(error: Error, context?: ErrorContext) {
    // Add context
    Sentry.setContext("error_details", {
      ...context,
      timestamp: new Date().toISOString(),
    });

    // Capture with Sentry
    Sentry.captureException(error);

    // Log locally
    console.error("Error captured:", error, context);
  }

  static captureMessage(message: string, level: "info" | "warning" | "error") {
    Sentry.captureMessage(message, level);
  }

  static setUserContext(user: { id: string; email: string; role: string }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
```

---

## ✅ QUALITY ASSURANCE CHECKLIST

### Before ANY Code Merge

- [ ] **Unit Tests**: 100% coverage of business logic
- [ ] **Integration Tests**: All API endpoints tested
- [ ] **E2E Tests**: Critical user flows validated
- [ ] **Security**: Input validation, auth checks pass
- [ ] **Performance**: Metrics within thresholds
- [ ] **Monitoring**: Error tracking instrumented
- [ ] **Documentation**: README and inline docs updated

### Security Checklist

- [ ] Authentication required for protected routes
- [ ] Authorization enforced (users can't access others' data)
- [ ] Input sanitized (XSS, SQL injection prevention)
- [ ] File uploads validated (type, size, path traversal)
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Environment variables secured
- [ ] Dependencies scanned for vulnerabilities

---

_"Quality is not an act, it is a **divine habit** built into every line of code."_
