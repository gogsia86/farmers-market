/**
 * ⚡ JEST ENVIRONMENT LOADER
 * Load test environment variables BEFORE any module imports
 * This runs before setupFilesAfterEnv and before any test files
 */

const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Path to .env.test file
const envTestPath = path.resolve(__dirname, ".env.test");

// Check if .env.test exists
if (fs.existsSync(envTestPath)) {
  console.log("✅ Loading test environment from .env.test");
  const result = dotenv.config({ path: envTestPath });

  if (result.error) {
    console.error("❌ Error loading .env.test:", result.error.message);
  } else {
    console.log("✅ Test environment loaded successfully");
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);
  }
} else {
  console.warn("⚠️  No .env.test file found, using default environment");
  // Try to load default .env as fallback
  dotenv.config();
}

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

// Ensure critical test environment variables are set
const requiredVars = {
  NODE_ENV: "test",
  NEXTAUTH_SECRET: "test-secret-key-for-integration-tests-only",
  NEXTAUTH_URL: "http://localhost:3001",
};

// Set defaults for required variables if not set
Object.entries(requiredVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    console.log(`⚙️  Setting default ${key}`);
    process.env[key] = value;
  }
});

// Log environment status
console.log("\n🧪 Test Environment Configuration:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log("");
