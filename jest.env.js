/**
 * Jest Environment Setup
 *
 * This file sets up environment variables for testing.
 * Loaded before tests run to ensure proper test environment configuration.
 */

// Set NODE_ENV to test
process.env.NODE_ENV = "test";

// Database configuration for testing
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://test:test@localhost:5432/farmers_market_test";

// NextAuth configuration for testing
process.env.NEXTAUTH_URL = "http://localhost:3001";
process.env.NEXTAUTH_SECRET =
  "test-secret-key-for-testing-only-do-not-use-in-production";

// API configuration for testing
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/api";

// Disable external services in tests
process.env.DISABLE_EMAIL_SENDING = "true";
process.env.DISABLE_REAL_PAYMENTS = "true";

// Stripe test keys (public keys are safe to commit)
process.env.STRIPE_SECRET_KEY = "sk_test_fake_key_for_testing";
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_fake_key_for_testing";

// Azure/OpenTelemetry - disable in tests
process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = "";
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "";

// Redis - use mock in tests
process.env.REDIS_URL = "redis://localhost:6379";
process.env.UPSTASH_REDIS_REST_URL = "";
process.env.UPSTASH_REDIS_REST_TOKEN = "";

// Feature flags for testing
process.env.ENABLE_ANALYTICS = "false";
process.env.ENABLE_ERROR_TRACKING = "false";

// Console logging
console.log("🧪 Jest environment configured for testing");
console.log(
  "📊 Database:",
  process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"),
);
console.log("🔐 Auth URL:", process.env.NEXTAUTH_URL);
