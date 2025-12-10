/**
 * 🧪 JEST INTEGRATION TEST CONFIGURATION
 *
 * Separate Jest configuration for running integration tests with testcontainers.
 * This configuration starts a real PostgreSQL database for testing.
 *
 * Usage:
 *   npm run test:integration:db
 *   npx jest --config jest.config.integration.js
 *
 * @pattern Integration Testing with Testcontainers
 * @reference .github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md
 */

/** @type {import('jest').Config} */
module.exports = {
  // Test environment - Node for database operations
  testEnvironment: "node",

  // Setup files
  setupFiles: ["<rootDir>/jest.env.js"],

  // Global setup and teardown for testcontainers
  globalSetup: "<rootDir>/tests/integration/setup/jest.globalSetup.ts",
  globalTeardown: "<rootDir>/tests/integration/setup/jest.globalTeardown.ts",

  // TypeScript transformation
  preset: "ts-jest",

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
  },

  // Test match patterns - ONLY integration tests
  testMatch: [
    "<rootDir>/tests/integration/db/**/*.{spec,test}.{ts,tsx}",
    "<rootDir>/tests/integration/**/*.integration.{spec,test}.{ts,tsx}",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/out/",
    "/dist/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/src/__tests__/", // Unit tests handled by main config
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Extended timeout for database operations
  testTimeout: 60000, // 60 seconds for DB operations

  // Verbose output
  verbose: true,

  // Transform configuration
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true,
        },
        isolatedModules: true,
      },
    ],
  },

  // Transform ignore patterns
  transformIgnorePatterns: ["node_modules/(?!(testcontainers)/)"],

  // Run tests serially (important for database tests)
  maxWorkers: 1,

  // Cache configuration
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache-integration",

  // Don't bail on first failure - run all integration tests
  bail: 0,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Detect open handles (important for DB connections)
  detectOpenHandles: true,

  // Force exit after tests (important for container cleanup)
  forceExit: true,

  // Display name
  displayName: {
    name: "INTEGRATION TESTS",
    color: "cyan",
  },

  // Coverage settings for integration tests
  collectCoverageFrom: [
    "src/lib/services/**/*.{ts,tsx}",
    "src/lib/repositories/**/*.{ts,tsx}",
    "src/app/api/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],

  coverageDirectory: "<rootDir>/coverage/integration",
  coverageReporters: ["text", "lcov", "html"],

  // Environment variables for integration tests
  testEnvironmentOptions: {
    url: "http://localhost:3001",
  },
};
