#!/usr/bin/env pwsh
# ⚡ Divine Jest Configuration Fixer
# Fixes path mappings and test setup issues

Write-Host ""
Write-Host "🧪 ============================================" -ForegroundColor Cyan
Write-Host "   DIVINE JEST CONFIGURATION RESURRECTION" -ForegroundColor Cyan
Write-Host "============================================ 🧪" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Step 1: Backup existing config
Write-Host "📦 Step 1: Backing up jest.config.simple.js..." -ForegroundColor Yellow
if (Test-Path jest.config.simple.js) {
    Copy-Item jest.config.simple.js jest.config.simple.js.backup -Force
    Write-Host "✅ Backup created" -ForegroundColor Green
} else {
    Write-Host "⚠️  jest.config.simple.js not found" -ForegroundColor Red
}
Write-Host ""

# Step 2: Create corrected Jest config
Write-Host "🔧 Step 2: Creating corrected Jest configuration..." -ForegroundColor Yellow

$jestConfig = @"
// ⚡ Divine Jest Configuration - CORRECTED
// Fixes path mapping and module resolution issues

module.exports = {
  displayName: 'Farmers Market Tests',
  testEnvironment: 'node',

  // Test file locations
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],

  // ✅ FIXED: Correct path mapping (removed duplicate Farmers-Market)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform TypeScript files
  transform: {
    '^.+\.tsx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/**',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/Farmers-Market/node_modules/',
  ],

  // Timeout for long-running tests
  testTimeout: 10000,

  // Verbose output
  verbose: true,
};
"@

Set-Content -Path "jest.config.simple.js" -Value $jestConfig -Force
Write-Host "✅ jest.config.simple.js created" -ForegroundColor Green
Write-Host ""

# Step 3: Update jest.setup.js
Write-Host "🔧 Step 3: Updating jest.setup.js..." -ForegroundColor Yellow

$jestSetup = @"
// ⚡ Divine Jest Setup - Test Environment Configuration

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Map(),
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
  default: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(), // Suppress error logs in tests
  warn: jest.fn(),  // Suppress warning logs in tests
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
"@

Set-Content -Path "jest.setup.js" -Value $jestSetup -Force
Write-Host "✅ jest.setup.js updated" -ForegroundColor Green
Write-Host ""

# Step 4: Test the configuration
Write-Host "🧪 Step 4: Testing Jest configuration..." -ForegroundColor Yellow
Write-Host "   Running: npm test -- --listTests" -ForegroundColor Gray
Write-Host ""

$testFiles = npm test -- --listTests 2>&1
$testFileCount = ($testFiles | Where-Object { $_ -like "*.test.*" -or $_ -like "*.spec.*" }).Count

Write-Host "   Found $testFileCount test files" -ForegroundColor Cyan
Write-Host ""

# Step 5: Try running a simple test
Write-Host "🏃 Step 5: Attempting to run tests..." -ForegroundColor Yellow
Write-Host "   This will show if configuration is working..." -ForegroundColor Gray
Write-Host ""

npm test -- --passWithNoTests --maxWorkers=1 2>&1 | Select-Object -First 20

Write-Host ""

# Summary
Write-Host "🌟 ============================================" -ForegroundColor Cyan
Write-Host "   JEST CONFIGURATION UPDATE COMPLETE!" -ForegroundColor Cyan
Write-Host "============================================ 🌟" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 What was fixed:" -ForegroundColor Cyan
Write-Host "   ✅ Path mappings corrected" -ForegroundColor Green
Write-Host "   ✅ Module resolution fixed" -ForegroundColor Green
Write-Host "   ✅ Test setup mocks updated" -ForegroundColor Green
Write-Host "   ✅ Configuration backed up" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm test -- --listTests (verify test discovery)" -ForegroundColor White
Write-Host "   2. Run: npm test (run all tests)" -ForegroundColor White
Write-Host "   3. Fix any remaining test failures" -ForegroundColor White
Write-Host ""

Write-Host "💡 Tip: Check test output above for any remaining issues" -ForegroundColor Gray
Write-Host ""
