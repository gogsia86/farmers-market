/**
 * JEST INTEGRATION TEST CONFIGURATION
 * Separate configuration for API integration tests
 *
 * KEY DIFFERENCE FROM jest.config.cjs:
 * - Uses jest.integration.setup.cjs which does NOT mock the database
 * - Allows real database operations for integration testing
 * - Uses test database (configured via DATABASE_URL in .env.test)
 *
 * HP OMEN Specs:
 * - 64GB RAM
 * - 12 CPU threads
 * - Optimized for parallel test execution
 */

/** @type {import('jest').Config} */
module.exports = {
  // Test environment - Node.js for API/service tests
  testEnvironment: "node",

  // Setup files - INTEGRATION TEST SETUP (no database mocking)
  setupFiles: ["<rootDir>/jest.env.cjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.integration.setup.cjs"],

  // Module paths
  modulePaths: ["<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/tests/(.*)$": "<rootDir>/tests/$1",

    // Mock next-auth ESM modules (still needed)
    "^next-auth$": "<rootDir>/__mocks__/next-auth.ts",
    "^next-auth/(.*)$": "<rootDir>/__mocks__/next-auth.ts",
    "^@auth/(.*)$": "<rootDir>/__mocks__/@auth/prisma-adapter.ts",

    // Mock CSS modules
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Mock image imports
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // Test match patterns - ONLY integration tests
  testMatch: [
    "<rootDir>/src/__tests__/integration/**/*.test.{ts,tsx}",
    "<rootDir>/tests/integration/**/*.test.{ts,tsx}",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/out/",
    "/dist/",
    "/tests/e2e/",
    "/tests/visual/",
    "/tests/mobile/",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/index.{ts,tsx}",
    "!src/types/**",
  ],

  // Coverage provider
  coverageProvider: "v8",

  // Coverage thresholds for integration tests
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Transform configuration
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      {
        presets: [["next/babel", { "preset-react": { runtime: "automatic" } }]],
      },
    ],
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!(test-exclude|babel-plugin-istanbul|@auth|nanoid|uuid|chalk|pino|pino-pretty)/)",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Test timeout (generous for database operations)
  testTimeout: 30000, // 30s for integration tests

  // Verbose output
  verbose: true,

  // ============================================
  // HP OMEN OPTIMIZATION
  // ============================================

  // Maximum workers (fewer for integration tests due to database connections)
  maxWorkers: process.env.CI ? 2 : 4,

  // Worker idle memory limit
  workerIdleMemoryLimit: "2GB",

  // Cache configuration
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache-integration",

  // ============================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================

  // Don't bail on first failure (see all integration test results)
  bail: 0,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Keep modules for performance
  resetModules: false,

  // Detect open handles (important for database connections)
  detectOpenHandles: true,

  // Don't force exit (let database cleanup properly)
  forceExit: false,

  // Run tests in parallel (maxWorkers controls parallelism)
  // Set to true if database conflicts occur

  // ============================================
  // DISPLAY SETTINGS
  // ============================================

  displayName: {
    name: "INTEGRATION TESTS",
    color: "blue",
  },

  // Global setup/teardown for database
  // globalSetup: "<rootDir>/tests/integration/globalSetup.ts",
  // globalTeardown: "<rootDir>/tests/integration/globalTeardown.ts",
};
