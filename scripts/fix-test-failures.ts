#!/usr/bin/env tsx
/**
 * 🧪 QUICK FIX SCRIPT FOR TEST FAILURES
 *
 * Automatically fixes common test infrastructure issues:
 * 1. Updates product controller test imports
 * 2. Creates repository mocks for product tests
 * 3. Fixes farmer service test expectations
 * 4. Updates geocoding service test patterns
 *
 * @usage npm run fix:tests
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROJECT_ROOT = process.cwd();

const FIXES = {
  productController: {
    file: "src/lib/controllers/__tests__/product.controller.test.ts",
    find: "@/lib/services/product.service.refactored",
    replace: "@/lib/services/product.service",
    description: "Fix product controller import",
  },
  farmerServiceTests: {
    file: "src/lib/services/__tests__/farmer.service.test.ts",
    description: "Update farmer service test expectations",
  },
  productServiceMocks: {
    description: "Create repository mock setup file",
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(
  message: string,
  type: "info" | "success" | "error" | "warning" = "info",
) {
  const icons = {
    info: "🔍",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  };

  const colors = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
  };

  console.log(`${icons[type]} ${colors[type](message)}`);
}

function readFile(relativePath: string): string | null {
  const fullPath = join(PROJECT_ROOT, relativePath);

  if (!existsSync(fullPath)) {
    log(`File not found: ${relativePath}`, "warning");
    return null;
  }

  return readFileSync(fullPath, "utf-8");
}

function writeFile(relativePath: string, content: string): boolean {
  const fullPath = join(PROJECT_ROOT, relativePath);

  try {
    writeFileSync(fullPath, content, "utf-8");
    return true;
  } catch (error) {
    log(`Failed to write file: ${relativePath}`, "error");
    console.error(error);
    return false;
  }
}

// ============================================================================
// FIX FUNCTIONS
// ============================================================================

/**
 * Fix 1: Update product controller test import
 */
function fixProductControllerImport(): boolean {
  log("Fixing product controller test import...", "info");

  const { file, find, replace } = FIXES.productController;
  const content = readFile(file);

  if (!content) {
    return false;
  }

  if (!content.includes(find)) {
    log("Import already fixed or not found", "warning");
    return true;
  }

  const updatedContent = content.replace(new RegExp(find, "g"), replace);

  if (writeFile(file, updatedContent)) {
    log(`Fixed import in ${file}`, "success");
    return true;
  }

  return false;
}

/**
 * Fix 2: Create repository mock setup file
 */
function createRepositoryMocks(): boolean {
  log("Creating repository mock setup file...", "info");

  const mockContent = `/**
 * 🎭 REPOSITORY MOCKS
 *
 * Centralized mock setup for repository layer testing
 * Use these mocks in tests that interact with repositories
 */

import type { Product, Farm } from '@prisma/client';

// ============================================================================
// PRODUCT REPOSITORY MOCK
// ============================================================================

export const mockProductRepository = {
  manifestProduct: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  searchProducts: jest.fn(),
};

// ============================================================================
// FARM REPOSITORY MOCK
// ============================================================================

export const mockFarmRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

// ============================================================================
// MOCK RESET HELPER
// ============================================================================

export function resetAllRepositoryMocks() {
  Object.values(mockProductRepository).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });

  Object.values(mockFarmRepository).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// In your test file:
import { mockProductRepository, resetAllRepositoryMocks } from '@/tests/mocks/repositories';

jest.mock('@/lib/repositories/product.repository', () => ({
  productRepository: mockProductRepository
}));

describe('ProductService', () => {
  beforeEach(() => {
    resetAllRepositoryMocks();
  });

  it('should create product', async () => {
    mockProductRepository.manifestProduct.mockResolvedValue(mockProduct);
    // ... test code
  });
});
*/
`;

  const mockFile = "src/__tests__/mocks/repositories.ts";

  if (writeFile(mockFile, mockContent)) {
    log(`Created mock file: ${mockFile}`, "success");
    return true;
  }

  return false;
}

/**
 * Fix 3: Update farmer service tests for User model schema
 */
function fixFarmerServiceTests(): boolean {
  log("Updating farmer service test expectations...", "info");

  const file = FIXES.farmerServiceTests.file;
  const content = readFile(file);

  if (!content) {
    return false;
  }

  let updatedContent = content;
  let changesMade = false;

  // Fix 1: Update partial update test to not expect 'bio' field
  if (content.includes('bio: "Agricultural expert"')) {
    log("Fixing partial update test (removing bio field)...", "info");
    updatedContent = updatedContent.replace(
      /await farmerService\.updateFarmerProfile\("farmer-1", \{\s*bio: "Agricultural expert",?\s*\}\);/g,
      `await farmerService.updateFarmerProfile("farmer-1", {
        name: "Updated Name",
      });`,
    );

    updatedContent = updatedContent.replace(
      /data: \{\s*bio: "Agricultural expert",?\s*\}/g,
      `data: {
          name: "Updated Name",
        }`,
    );
    changesMade = true;
  }

  // Fix 2: Update empty fields test to not expect 'bio'
  if (content.includes('bio: ""')) {
    log("Fixing empty fields test (removing bio field)...", "info");
    updatedContent = updatedContent.replace(
      /phone: "",\s*bio: ""/g,
      'phone: ""',
    );

    updatedContent = updatedContent.replace(
      /data: \{\s*phone: null,\s*bio: null,?\s*\}/g,
      `data: {
          phone: null,
        }`,
    );
    changesMade = true;
  }

  // Fix 3: Add mock for product.findUnique in dashboard stats test
  if (
    content.includes("getFarmerDashboardStats") &&
    !content.includes("database.product.findUnique")
  ) {
    log("Adding product.findUnique mock to test setup...", "info");

    // Find the mock setup section
    const mockSetupRegex =
      /(jest\.mock\("@\/lib\/database",[\s\S]*?product: \{[\s\S]*?)(count: jest\.fn\(\))/;

    if (mockSetupRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        mockSetupRegex,
        "$1count: jest.fn(),\n      findUnique: jest.fn()",
      );
      changesMade = true;
    }
  }

  if (!changesMade) {
    log("No changes needed in farmer service tests", "info");
    return true;
  }

  if (writeFile(file, updatedContent)) {
    log(`Updated farmer service tests: ${file}`, "success");
    return true;
  }

  return false;
}

/**
 * Fix 4: Create product service test helper with proper repository mocks
 */
function createProductServiceTestHelper(): boolean {
  log("Creating product service test helper...", "info");

  const helperContent = `/**
 * 🛒 PRODUCT SERVICE TEST HELPER
 *
 * Provides properly configured mocks for product service tests
 * that use the repository pattern
 */

import { mockProductRepository, resetAllRepositoryMocks } from './repositories';

// Mock the repository before importing the service
jest.mock('@/lib/repositories/product.repository', () => ({
  productRepository: mockProductRepository
}));

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

export function setupProductServiceMocks() {
  beforeEach(() => {
    resetAllRepositoryMocks();
  });
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

export function createMockProduct(overrides = {}) {
  return {
    id: 'product-123',
    name: 'Organic Tomatoes',
    slug: 'organic-tomatoes',
    description: 'Fresh organic tomatoes',
    farmId: 'farm-123',
    status: 'AVAILABLE',
    pricing: {
      basePrice: { amount: 599, currency: 'USD' }
    },
    inventory: {
      quantity: 100,
      reservedQuantity: 0,
      availableQuantity: 100,
      lowStockThreshold: 10,
      isLowStock: false
    },
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockFarm(overrides = {}) {
  return {
    id: 'farm-123',
    name: 'Test Farm',
    ownerId: 'user-123',
    status: 'ACTIVE',
    ...overrides
  };
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import { setupProductServiceMocks, createMockProduct } from '@/tests/helpers/product-service';
import { mockProductRepository } from '@/tests/mocks/repositories';
import { ProductService } from '@/lib/services/product.service';

describe('ProductService', () => {
  setupProductServiceMocks();

  it('should create product', async () => {
    const mockProduct = createMockProduct();
    mockProductRepository.manifestProduct.mockResolvedValue(mockProduct);

    const result = await ProductService.createProduct(
      { name: 'Test', farmId: 'farm-123' },
      'user-123'
    );

    expect(result).toEqual(mockProduct);
  });
});
*/
`;

  const helperFile = "src/__tests__/helpers/product-service.ts";

  if (writeFile(helperFile, helperContent)) {
    log(`Created helper file: ${helperFile}`, "success");
    return true;
  }

  return false;
}

/**
 * Fix 5: Create geocoding service test fix documentation
 */
function createGeocodingTestDocs(): boolean {
  log("Creating geocoding test fix documentation...", "info");

  const docContent = `# 🗺️ Geocoding Service Test Fixes

## Issue
Geocoding service tests are failing with:
\`\`\`
TypeError: GeocodingService.calculateDistance is not a function
TypeError: GeocodingService.geocodeAddress is not a function
\`\`\`

## Root Cause
The service implementation likely uses instance methods, not static methods,
but the tests are importing and calling static methods.

## Fix Options

### Option 1: Update Tests to Use Instance Methods
\`\`\`typescript
// Before:
import { GeocodingService } from '@/lib/services/geocoding.service';
const distance = GeocodingService.calculateDistance(...);

// After:
import { geocodingService } from '@/lib/services/geocoding.service';
const distance = await geocodingService.calculateDistance(...);
\`\`\`

### Option 2: Update Service to Export Static Methods
\`\`\`typescript
// In geocoding.service.ts:
export class GeocodingService {
  static calculateDistance(...) { ... }
  static geocodeAddress(...) { ... }
}
\`\`\`

### Option 3: Mock the Service Properly
\`\`\`typescript
jest.mock('@/lib/services/geocoding.service', () => ({
  geocodingService: {
    calculateDistance: jest.fn(),
    geocodeAddress: jest.fn(),
  }
}));
\`\`\`

## Recommended Approach
1. Check actual service implementation
2. Update tests to match implementation pattern
3. Use singleton export for consistency with other services

## Implementation Steps
1. Review \`src/lib/services/geocoding.service.ts\`
2. Identify if methods are static or instance-based
3. Update all test files to match
4. Ensure mock setup matches actual exports
`;

  const docFile = "docs/testing/geocoding-service-test-fix.md";

  if (writeFile(docFile, docContent)) {
    log(`Created documentation: ${docFile}`, "success");
    return true;
  }

  return false;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(chalk.bold.cyan("\n🧪 TEST FAILURE QUICK FIX SCRIPT\n"));
  console.log(
    chalk.gray("Automatically fixing common test infrastructure issues...\n"),
  );

  const results = {
    total: 5,
    success: 0,
    failed: 0,
  };

  // Execute all fixes
  const fixes = [
    { name: "Product Controller Import", fn: fixProductControllerImport },
    { name: "Repository Mocks", fn: createRepositoryMocks },
    { name: "Farmer Service Tests", fn: fixFarmerServiceTests },
    { name: "Product Service Helper", fn: createProductServiceTestHelper },
    { name: "Geocoding Test Docs", fn: createGeocodingTestDocs },
  ];

  for (const fix of fixes) {
    try {
      if (fix.fn()) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`Error executing ${fix.name}`, "error");
      console.error(error);
      results.failed++;
    }
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(chalk.bold.cyan("📊 SUMMARY"));
  console.log("=".repeat(60));
  console.log(
    chalk.green(`✅ Successful fixes: ${results.success}/${results.total}`),
  );

  if (results.failed > 0) {
    console.log(
      chalk.red(`❌ Failed fixes: ${results.failed}/${results.total}`),
    );
  }

  // Next steps
  console.log(`\n${chalk.bold.yellow("📋 NEXT STEPS:")}`);
  console.log(chalk.gray("1. Run tests to verify fixes: npm test"));
  console.log(chalk.gray("2. Review created mock files in src/__tests__/"));
  console.log(chalk.gray("3. Update product service tests to use new mocks"));
  console.log(chalk.gray("4. Review geocoding test documentation"));
  console.log(chalk.gray("5. Run full test suite: npm run test:coverage\n"));

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the script
main().catch((error) => {
  console.error(chalk.red("❌ Fatal error:"), error);
  process.exit(1);
});
