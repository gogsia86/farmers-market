// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN from environment variable
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Organization and project
  // org: medicis-gang
  // project: farmers-market-prod

  // Adjust this value in production, or use tracesSampler for greater control
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production to optimize performance and costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.15 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Environment detection
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

  // Release tracking (Git SHA from Vercel)
  release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,

  // Edge runtime has limited integrations
  // Only use integrations that work in edge runtime
  integrations: [
    // HTTP integration for request tracing
    Sentry.httpIntegration(),
  ],

  // Before sending to Sentry, clean up sensitive data
  beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Filter out non-error console logs
    if (event.level === "log" || event.level === "info") {
      return null;
    }

    // Remove sensitive data from request headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-auth-token"];
      delete event.request.headers["x-api-key"];
    }

    // Sanitize query strings
    if (event.request?.query_string) {
      // Remove sensitive query parameters
      if (typeof event.request.query_string === "string") {
        const sanitized = event.request.query_string
          .replace(/token=[^&]*/gi, "token=[REDACTED]")
          .replace(/key=[^&]*/gi, "key=[REDACTED]")
          .replace(/apiKey=[^&]*/gi, "apiKey=[REDACTED]")
          .replace(/password=[^&]*/gi, "password=[REDACTED]");
        event.request.query_string = sanitized;
      }
    }

    // Sanitize user data
    if (event.user) {
      // Keep user ID for tracking but remove PII
      const userId = event.user.id;
      event.user = { id: userId };
    }

    // Add custom context for edge runtime
    if (event.contexts) {
      event.contexts.edge = {
        runtime: "edge",
        platform: "Farmers Market",
        version: process.env.APP_VERSION || "1.0.0",
      };
    }

    return event;
  },

  // Ignore certain errors that are expected or non-critical
  ignoreErrors: [
    // Expected auth errors
    /Unauthorized/,
    /Authentication required/,
    /Invalid credentials/,
    /Token expired/,
    // Expected validation errors
    /Validation failed/,
    /Invalid input/,
    // Network errors that are expected
    /ECONNREFUSED/,
    /ENOTFOUND/,
    /ETIMEDOUT/,
    /Network request failed/,
    // Aborted requests (user navigation)
    /AbortError/,
    /The operation was aborted/,
    // Rate limiting (expected behavior)
    /Rate limit exceeded/,
    /Too many requests/,
  ],

  // Ignore transactions for certain URLs
  ignoreTransactions: [
    // Health checks
    /\/api\/health/,
    /\/api\/metrics/,
    // Static assets
    /\/_next\/static/,
    /\/_next\/image/,
    /\/favicon\.ico/,
    // Monitoring endpoints
    /\/monitoring/,
  ],

  // Tag all events with additional context
  initialScope: {
    tags: {
      platform: "edge",
      framework: "next.js",
      runtime: "edge",
      deployment: process.env.VERCEL_ENV || "local",
    },
  },

  // Performance monitoring configuration
  tracesSampler(samplingContext: {
    parentSampled?: boolean;
    name?: string;
    [key: string]: unknown;
  }) {
    // Always capture errors
    if (samplingContext.parentSampled === false) {
      return 0;
    }

    const transactionName = samplingContext.name || "";

    // Middleware - sample at medium rate
    if (transactionName.includes("middleware")) {
      return 0.3;
    }

    // API routes - high sampling for mutations
    if (
      transactionName.includes("/api/checkout") ||
      transactionName.includes("/api/payment") ||
      transactionName.includes("POST") ||
      transactionName.includes("DELETE")
    ) {
      return 1.0;
    }

    // Auth routes - medium sampling
    if (
      transactionName.includes("/api/auth") ||
      transactionName.includes("/login") ||
      transactionName.includes("/register")
    ) {
      return 0.5;
    }

    // Health checks and static assets - very low sampling
    if (
      transactionName.includes("/api/health") ||
      transactionName.includes("/_next/static")
    ) {
      return 0.01;
    }

    // Default sampling rate for edge runtime
    return process.env.NODE_ENV === "production" ? 0.15 : 1.0;
  },

  // Maximum breadcrumbs to keep (console logs, HTTP requests, etc.)
  maxBreadcrumbs: 50,

  // Attach stack traces to all messages
  attachStacktrace: true,

  // Send client reports (usage statistics)
  sendClientReports: true,

  // Auto-session tracking
  autoSessionTracking: true,

  // Enable normalization of data
  normalizeDepth: 5,

  // Maximum value length before truncation
  maxValueLength: 1000,

  // Transport options for sending to Sentry
  transportOptions: {},

  // Disable PII by default for privacy
  sendDefaultPii: false,

  // Enable logs integration (limited in edge runtime)
  enableLogs: false,
});

// Export Sentry for use in the app
export { Sentry };

// Log initialization in development
if (process.env.NODE_ENV === "development") {
  console.log("🔍 Sentry Edge initialized", {
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    dsn:
      process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
        ? "✓ Configured"
        : "✗ Missing",
    release: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    runtime: "edge",
  });
}
