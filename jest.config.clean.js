/** @type {import('jest').Config} */
module.exports = {
  // 🌟 Divine Test Environment Configuration
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:3000",
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>',
  },

  // ⚡ Project Structure
  rootDir: ".",
  roots: ["<rootDir>/src"],

  // 🔮 Module Resolution
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src"],

  // 🎯 Test Setup
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

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

  // 🔮 Transform Ignore Patterns - Handle ESM modules
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth|jose|uuid|nanoid|@panva/hkdf)/)",
  ],

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)",
  ],

  // 📊 Coverage Configuration
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

  // 🌍 Global Configuration
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react-jsx",
      },
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/build/",
  ],
};
