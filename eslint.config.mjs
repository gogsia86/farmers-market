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
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

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
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Jest test files configuration
  {
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/jest.setup.js",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
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
    },
  },

  // All files - general rules
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      // General best practices
      "no-debugger": "error",
      "no-alert": "warn",
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "quote-props": ["warn", "as-needed"],

      // Style preferences
      "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1 }],
      "no-trailing-spaces": "warn",
      "eol-last": ["warn", "always"],
      "comma-dangle": ["warn", "always-multiline"],
      semi: ["warn", "always"],
      quotes: ["warn", "double", { avoidEscape: true }],
    },
  },
];

export default eslintConfig;
