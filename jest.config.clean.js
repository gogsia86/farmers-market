/** @type {import('jest').Config} */
module.exports = {
  // 🌟 Divine Test Environment Configuration
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:3000",
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>',
  },

  // ⚡ Project Structure - Only test files in src/
  rootDir: ".",
  roots: ["<rootDir>/src"],

  // 🔮 Module Resolution
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src"],

  // 🎯 Test Setup
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Module resolution
  moduleNameMapper: {
    "^bcrypt$": "<rootDir>/__mocks__/bcrypt.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
    // Handle CSS and static assets
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "jest-transform-stub",
  },

  // File extensions to consider
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // 🚀 File Transformation
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
          target: "es2022",
        },
      },
    ],
  },

  // 📂 Test Patterns - Run ALL tests to find real issues
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/*.test.{ts,tsx}",
    // Exclude only non-Jest test files (Playwright E2E)
    "!<rootDir>/src/**/*.spec.{ts,tsx}",
    "!<rootDir>/src/**/*.bench.{ts,tsx}", // Keep benchmark exclusion
  ],

  // Minimal exclusions - only non-Jest test types
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/dist/",
    "/coverage/",
    "\\.e2e\\.", // E2E tests run separately with Playwright
    "\\.spec\\.", // Playwright spec files
    "\\.bench\\.", // Benchmark files
  ],

  // 📊 Coverage Configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/**/__tests__/**",
    "!src/types/**",
  ],

  // 🔮 Transform Ignore Patterns - Handle ESM modules and native modules
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth|jose|uuid|nanoid|@panva/hkdf|bcrypt|sharp)/)",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Test timeout
  testTimeout: 10000,

  // ⚡ Performance Configuration
  maxWorkers: "50%",

  // 🧪 Test Environment Configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // 📝 Output Configuration
  verbose: true,

  // Silence deprecation warnings
  silent: false,

  // 🌍 Global Configuration
  globals: {
    // Prevent native module loading
    __NATIVE_MODULES_MOCKED__: true,
  },
};
