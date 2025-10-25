// ⚡ Divine Jest Configuration - CORRECTED
// Fixes path mapping and module resolution issues

module.exports = {
  displayName: 'Farmers Market Tests',
  testEnvironment: 'node',

  // Test file locations
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],

  // ✅ FIXED: Correct path mapping (removed duplicate Farmers-Market)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/',
  },

  // Transform TypeScript files
  transform: {
    '^.+\.tsx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/**',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/Farmers-Market/node_modules/',
  ],

  // Timeout for long-running tests
  testTimeout: 10000,

  // Verbose output
  verbose: true,
};
