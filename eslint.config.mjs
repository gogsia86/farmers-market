import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Ignore patterns first
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/.jest-cache/**",
      "**/public/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/.husky/**",
      "**/cleanup-backup-*/**",
      "**/docs/archive/**",
      "**/src/app.backup.phase5/**",
      "**/*.backup/**",
      "**/.backup/**",
    ],
  },

  // Base JavaScript config
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        // Don't require project for faster linting
        // project: "./tsconfig.json",
        // tsconfigRootDir: __dirname,
      },
      globals: {
        React: "readonly",
        JSX: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off", // Disabled - too noisy, TypeScript handles this

      // Disable base rules that are handled by TypeScript
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },

  // JavaScript and JSX files configuration
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        Promise: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
      },
    },
    rules: {
      "prefer-const": "warn",
      "no-console": "off",
      "no-unused-vars": "off", // Disabled - too noisy
    },
  },

  // Jest test files configuration
  {
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/jest.setup.js",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/__mocks__/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: {
        jest: "readonly",
        expect: "readonly",
        test: "readonly",
        it: "readonly",
        describe: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // Mobile app files configuration - React Native specific
  {
    files: ["**/mobile-app/**/*.{ts,tsx}"],
    rules: {
      // Allow any in mobile app for API responses and navigation
      "@typescript-eslint/no-explicit-any": "off",
      // Allow alerts in mobile app (React Native Alert API)
      "no-alert": "off",
    },
  },

  // Scripts and utilities - development tools
  {
    files: ["**/scripts/**/*.{ts,js}", "**/prisma/**/*.ts"],
    rules: {
      // Scripts often use dynamic typing
      "@typescript-eslint/no-explicit-any": "off",
      // Allow console in scripts
      "no-console": "off",
      // Allow alerts in scripts
      "no-alert": "off",
    },
  },

  // API route handlers and server code
  {
    files: ["**/src/app/api/**/*.ts", "**/src/lib/**/*.ts"],
    rules: {
      // Relax any rule for API handlers dealing with dynamic data
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Component files - allow any for event handlers and props
  {
    files: ["**/src/components/**/*.tsx", "**/src/app/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-alert": "off", // Allow alert/confirm in UI components
    },
  },

  // Type definition files
  {
    files: ["**/types/**/*.ts", "**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Hooks and stores
  {
    files: ["**/hooks/**/*.ts", "**/stores/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Server actions
  {
    files: ["**/src/app/actions/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // i18n files
  {
    files: ["**/src/i18n/**/*.ts", "**/src/i18n.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Test utilities and helpers
  {
    files: [
      "**/tests/helpers/**/*.ts",
      "**/tests/utils/**/*.ts",
      "**/src/lib/test-utils.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // K6 load test files configuration
  {
    files: [
      "**/tests/load/**/*.js",
      "**/tests/load/**/*.ts",
      "**/tests/performance/**/*.k6.js",
    ],
    languageOptions: {
      globals: {
        // K6 built-in globals
        __ENV: "readonly",
        __VU: "readonly",
        __ITER: "readonly",
        __K6_EXECUTION_CONTEXT_ID: "readonly",
        open: "readonly",
        // Common JS globals used in k6
        console: "readonly",
        JSON: "readonly",
        Math: "readonly",
        Date: "readonly",
        encodeURIComponent: "readonly",
        decodeURIComponent: "readonly",
      },
    },
    rules: {
      // K6 allows duplicate keys in thresholds objects for different percentiles
      "no-dupe-keys": "off",
      // K6 globals are defined by the runtime
      "no-undef": "off",
      // K6 scripts often use regex patterns that ESLint flags
      "no-useless-escape": "off",
      // Allow console statements in load tests
      "no-console": "off",
    },
  },

  // All files - general rules
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      // General best practices
      "no-debugger": "error",
      "no-alert": "off", // Allow alert/confirm - legitimate browser API usage
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "off", // Disabled - too noisy
      "prefer-template": "off", // Disabled - stylistic preference
      "object-shorthand": "off", // Disabled - stylistic preference
      "quote-props": "off", // Disabled - too noisy with Accept headers

      // Style preferences - disabled for cleaner output
      "no-multiple-empty-lines": "off",
      "no-trailing-spaces": "off",
      "eol-last": "off",
      "comma-dangle": "off",
      semi: "off",
      quotes: "off",
    },
  },
];

export default eslintConfig;
