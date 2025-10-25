/** @type {import('jest').Config} */
const config = {
  // 🌟 Divine Test Environment Configuration
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:3000",
    customExportConditions: [""],
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>',
  },

  // ⚡ Project Structure
  rootDir: ".",
  roots: ["<rootDir>/src"],

  // 🔮 Module Resolution
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src"],

  // Module name mapping for path aliases
  moduleNameMapper: {
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

  // 🚀 Quantum File Transformation
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
              development: false,
              refresh: false,
            },
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          target: "es2022",
        },
        sourceMaps: "inline",
        module: {
          type: "es6",
        },
      },
    ],
    // Transform static assets
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      ["jest-transform-stub", { stripMetadata: true }],
  },

  // 🔮 Transform Ignore Patterns - Handle ESM modules like next-auth
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth|@next/.*|next/.*)/)",
  ],

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)",
    "<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)",
  ],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Global setup for integration tests
  globalSetup: "<rootDir>/tests/setup/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/setup/globalTeardown.ts",

  // Test timeout
  testTimeout: 10000,

  // 📊 Coverage Configuration
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx,js,jsx}",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx,js,jsx}",
    "!src/**/*.spec.{ts,tsx,js,jsx}",
    "!src/types/**",
    "!src/**/index.{ts,tsx,js,jsx}",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/build/",
  ],

  // 🎯 Error Handling
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};

module.exports = config;
