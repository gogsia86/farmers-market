/** @type {import('jes  // 🔮 Module Resolution
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src"],

  // 🎯 Test Setup & Performance Profiling
  setupFilesAfterEnv: ["./jest.setup.js"],
  globalSetup: "./jest.nvtx-setup.js",
  globalTeardown: "./jest.nvtx-teardown.js",

  // 🚀 Parallel Execution Configuration
  maxWorkers: 12, // Match CPU threads
  maxConcurrency: 12,

  // ⚡ GPU Acceleration
  runner: "@jest-runner/electron/main",
  testRunner: "jest-electron/runner",

  // 🌟 Transform configuration for ES modulesfig} */
module.exports = {
  // 🌟 Divine Test Environment Configuration
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:3000",
    conditions: [""],
    html: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>',
    memoryLeakTracking: true, // Enable memory leak detection
    memoryCheckInterval: 1000, // Check memory every second
  },

  // 🎯 Watch Configuration
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // ⚡ Project Structure
  rootDir: ".",
  roots: ["<rootDir>/src", "<rootDir>/tests", "<rootDir>/e2e"],

  // 🔮 Module Resolution
  moduleDirectories: ["node_modules", "<rootDir>", "<rootDir>/src"],

  // � Test Setup
  setupFilesAfterEnv: ["../jest.setup.js"],

  // �🌟 Transform configuration for ES modules
  transformIgnorePatterns: [
    "/node_modules/(?!(@panva/hkdf|@auth/core|next-auth|jose)/)",
  ],

  // Module name mapping for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/types/(.*)$": "<rootDir>/types/$1",
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

  // 🔮 Transform Ignore Patterns - Handle ESM modules
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth|@next/.*|next/.*|jose|uuid|nanoid|@panva/hkdf)/)",
  ],

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)",
    "<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)",
    "<rootDir>/__tests__/**/*.(ts|tsx|js|jsx)",
  ],

  // 🎯 Divine Test Setup
  setupFilesAfterEnv: [
    "./jest.setup.js",
    "./profiling_scripts/cpu-affinity.js",
    "./jest.nvtx-marker.js",
  ],

  // 📊 Divine Coverage Configuration
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
    "!src/testing/**",
    "!src/mocks/**",
    "!src/**/constants.{ts,tsx}",
    "!src/styles/**",
  ],

  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html",
    "json",
    "json-summary",
    ["text-summary", { skipEmpty: true }],
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./src/components/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/lib/": {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  coveragePathIgnorePatterns: [
    "node_modules",
    "test-config",
    "interfaces",
    "jestGlobalMocks.ts",
    ".module.ts",
    "<rootDir>/src/app/main.ts",
    ".mock.ts",
  ],

  // Test timeout
  testTimeout: 10000,

  // ⚡ Divine Performance Configuration
  maxConcurrency: 32, // Maximize parallel execution for 32GB RAM, RTX 2070
  maxWorkers: "100%", // Use all available cores always
  workerIdleMemoryLimit: "2048MB", // 2GB per worker for large test suites
  slowTestThreshold: 2500, // Flag tests >2.5s for aggressive optimization
  cacheDirectory: "<rootDir>/.jest-cache", // Dedicated cache for faster runs

  // 🧪 Test Environment Configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  resetModules: true,

  // 📝 Output Configuration
  verbose: true,
  silent: false,
  bail: false,
  ci: process.env.CI === "true",
  detectOpenHandles: true,
  errorOnDeprecated: true,

  // 🌍 Global Configuration
  globals: {
    "process.env": {
      NODE_ENV: "test",
      NEXT_PUBLIC_API_URL: "http://localhost:3000/api",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },

  // ⏰ Timing Configuration
  fakeTimers: {
    enableGlobally: true,
    now: new Date("2025-10-21").getTime(),
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/build/",
    "<rootDir>/test/performance/",
  ],

  // 🎯 Error Handling
  notify: true,
  notifyMode: "failure-change",

  // 🛡️ Security & Profiling
  sandboxInjectedGlobals: ["Math"],
  globalSetup: "../jest.nvtx-setup.js",

  // 📈 Reporting
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports/junit",
        outputName: "jest-junit.xml",
        ancestorSeparator: " › ",
        uniqueOutputName: "false",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
    process.env.CI === "true" && ["github-actions", { silent: false }],
  ].filter(Boolean),

  // 🎨 Snapshot Configuration
  snapshotFormat: {
    printBasicPrototype: false,
    escapeString: true,
    printFunctionName: true,
    indent: 2,
  },
};
