/**
 * Global Test Setup
 * Runs before all tests to configure the testing environment
 */

// Mock environment variables (using Object.defineProperty to avoid read-only error)
Object.defineProperty(process.env, "NODE_ENV", {
  value: "test",
  writable: true,
});
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.NEXTAUTH_SECRET = "test-secret-key-for-testing";
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Extend test timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
declare global {
  var testTimeout: (ms: number) => Promise<void>;
}

global.testTimeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
