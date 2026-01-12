/**
 * JEST CONFIGURATION - HP OMEN OPTIMIZED
 * Enterprise-grade testing setup for Farmers Market Platform
 *
 * HP OMEN Specs:
 * - 64GB RAM
 * - 12 CPU threads
 * - Optimized for parallel test execution
 *
 * Test Framework: Jest (unit/integration tests)
 * E2E Framework: Playwright (separate config in playwright.config.ts)
 *
 * NOTE ON COVERAGE:
 * Coverage thresholds are set to current baseline levels.
 * Increase these thresholds as test coverage improves.
 */

/** @type {import('jest').Config} */
module.exports = {
  // Test environment - Node.js for API/service tests
  // Use jsdom for component tests if needed (install jest-environment-jsdom)
  testEnvironment: "node",

  // Setup files - Load environment BEFORE any imports
  setupFiles: ["<rootDir>/jest.env.cjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],

  // TypeScript transformation - Using Next.js/Babel transformer

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

    // Mock next-auth ESM modules
    "^next-auth$": "<rootDir>/__mocks__/next-auth.ts",
    "^next-auth/(.*)$": "<rootDir>/__mocks__/next-auth.ts",
    "^@auth/(.*)$": "<rootDir>/__mocks__/@auth/prisma-adapter.ts",

    // Mock CSS modules
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",

    // Mock image imports
    "\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // Test match patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{ts,tsx}",
  ],

  // Temporarily exclude DOM-dependent tests until jsdom can be installed
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/out/",
    "/dist/",
    "/tests/", // Exclude all Playwright tests (e2e, accessibility, mobile, api, database, chaos, etc.)
    "<rootDir>/src/__tests__/benchmarks/",
    // Temporarily exclude DOM-dependent component tests
    "Toast.test.tsx",
    "animation-accessibility.test.tsx",
    "banner-animations.test.tsx",
    "toast-animations.test.tsx",
    "animation-performance.test.ts",
    "debug-matchMedia.test.ts",
    // Store tests that use React hooks (require DOM)
    "checkoutStore.test.ts",
    "cartStore.test.ts",
    // Hook tests (require DOM)
    "useAgriculturalConsciousness.test.ts",
    "useQuantumConsciousness.test.ts",
    "useComponentConsciousness.test.ts",
    "useSeasonalConsciousness.test.ts",
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
      // Realistic baseline thresholds - increase as coverage improves
      // Long-term target: branches: 80, functions: 80, lines: 80, statements: 80
      branches: 50,
      functions: 50,
      lines: 40,
      statements: 40,
    },
  },

  // Transform configuration - using Next.js built-in transformer
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      {
        presets: [["next/babel", { "preset-react": { runtime: "automatic" } }]],
      },
    ],
  },

  // Transform ignore patterns to fix coverage instrumentation and ESM modules
  transformIgnorePatterns: [
    "node_modules/(?!(test-exclude|babel-plugin-istanbul|@auth|nanoid|uuid|chalk|pino|pino-pretty)/)",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Test timeout (generous for complex async tests)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // ============================================
  // HP OMEN OPTIMIZATION - 12 THREADS + 64GB RAM
  // ============================================

  // Maximum workers for parallel execution
  // Dynamic based on environment (CI vs local)
  maxWorkers: process.env.CI ? 4 : 10,

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

  // Clear mocks between tests (essential for test isolation)
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Automatically clear mock calls and instances between every test
  resetModules: false, // Keep false for performance

  // Error on deprecated APIs
  errorOnDeprecated: false, // Disabled to avoid issues with dependencies

  // Notify about test results
  notify: false, // Disable for performance

  // Detect open handles (disable in CI for speed)
  detectOpenHandles: !process.env.CI,

  // Force exit (faster in CI)
  forceExit: process.env.CI,

  // Run tests in random order (helps catch test interdependencies)
  randomize: false, // Set to true to enable random order

  // Collect coverage from all files, not just tested ones
  collectCoverage: process.env.COLLECT_COVERAGE === "true",

  // ============================================
  // DISPLAY SETTINGS
  // ============================================

  // Display name for test runs
  displayName: {
    name: "FARMERS MARKET TESTS",
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
