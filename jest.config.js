/**
 * DIVINE JEST CONFIGURATION - HP OMEN OPTIMIZED
 * Enterprise-grade testing setup with agricultural consciousness
 *
 * HP OMEN Specs:
 * - 64GB RAM
 * - 12 CPU threads
 * - Optimized for parallel test execution
 */

/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

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

    // Mock CSS modules
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Mock image imports
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/tests/__mocks__/fileMock.js",
  },

  // Test match patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{ts,tsx}",
    // Exclude Playwright tests from Jest
    "!<rootDir>/tests/e2e/**/*.{spec,test}.{ts,tsx}",
    "<rootDir>/tests/**/*.{spec,test}.{ts,tsx}",
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

  // Coverage provider (v8 is faster and more accurate)
  coverageProvider: "v8",

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Transform configuration - optimized for speed
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true, // Moved from deprecated globals
        },
        isolatedModules: true, // Faster compilation
        diagnostics: {
          ignoreCodes: [151001], // Ignore module resolution diagnostics
        },
      },
    ],
  },

  // Transform ignore patterns to fix coverage instrumentation
  transformIgnorePatterns: [
    "node_modules/(?!(test-exclude|babel-plugin-istanbul)/)",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/out/",
    "/dist/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/src/__tests__/benchmarks/",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Divine test timeout (generous for complex tests)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // ============================================
  // HP OMEN OPTIMIZATION - 12 THREADS + 64GB RAM
  // ============================================

  // Maximum workers for parallel execution
  // Use 10 workers (leave 2 threads for OS/IDE)
  maxWorkers: 10,

  // Worker idle memory limit (with 64GB we can be generous)
  workerIdleMemoryLimit: "2GB",

  // Cache configuration (leverage 64GB RAM)
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",

  // ============================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================

  // Bail after first test failure in CI (faster feedback)
  bail: process.env.CI ? 1 : 0,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Error on deprecated APIs
  errorOnDeprecated: false, // Disabled to avoid issues with dependencies

  // Notify about test results
  notify: false, // Disable for performance

  // Detect open handles (disable in CI for speed)
  detectOpenHandles: !process.env.CI,

  // Force exit (faster in CI)
  forceExit: process.env.CI,

  // ============================================
  // AGRICULTURAL CONSCIOUSNESS SETTINGS
  // ============================================

  // Display name for test runs
  displayName: {
    name: "FARMERS MARKET DIVINE TESTS",
    color: "green",
  },

  // Test results processor
  testResultsProcessor: undefined,

  // Watch plugins (for development)
  // watchPlugins: [
  //   "jest-watch-typeahead/filename",
  //   "jest-watch-typeahead/testname",
  // ],
};
