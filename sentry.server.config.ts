// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN from environment variable
  dsn: process.env.SENTRY_DSN,

  // Organization and project
  // org: medicis-gang
  // project: farmers-market-prod

  // Adjust this value in production, or use tracesSampler for greater control
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production to optimize performance and costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Environment detection
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

  // Release tracking (Git SHA from Vercel)
  release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,

  // Server-side integrations for better error tracking
  integrations: [
    // HTTP integration for request tracing
    Sentry.httpIntegration(),

    // Prisma integration for database query tracing
    Sentry.prismaIntegration(),
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

    // Sanitize database queries
    if (event.contexts?.db && typeof event.contexts.db === "object") {
      // Remove sensitive SQL values
      const dbContext = event.contexts.db as { statement?: string };
      if (dbContext.statement && typeof dbContext.statement === "string") {
        dbContext.statement = dbContext.statement
          .replace(/'[^']*'/g, "'[REDACTED]'")
          .replace(/"[^"]*"/g, '"[REDACTED]"');
      }
    }

    // Add custom context for agricultural operations
    if (event.contexts) {
      event.contexts.agricultural = {
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
    // Prisma connection errors (handled by retry logic)
    /Can't reach database server/,
    /Connection pool timeout/,
    // Next.js build errors (not runtime)
    /Module not found/,
    // Aborted requests (user navigation)
    /AbortError/,
    /The operation was aborted/,
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
      platform: "server",
      framework: "next.js",
      runtime: "nodejs",
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

    // Always capture API routes and critical paths
    if (
      transactionName.includes("/api/checkout") ||
      transactionName.includes("/api/payment") ||
      transactionName.includes("/api/orders") ||
      transactionName.includes("POST") ||
      transactionName.includes("DELETE")
    ) {
      return 1.0;
    }

    // Sample GET requests at lower rate
    if (transactionName.includes("GET")) {
      return 0.1;
    }

    // Health checks and static assets - very low sampling
    if (
      transactionName.includes("/api/health") ||
      transactionName.includes("/_next/static")
    ) {
      return 0.01;
    }

    // Default sampling rate
    return process.env.NODE_ENV === "production" ? 0.2 : 1.0;
  },

  // Profile sampling rate
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Maximum breadcrumbs to keep (console logs, HTTP requests, etc.)
  maxBreadcrumbs: 100,

  // Attach stack traces to all messages
  attachStacktrace: true,

  // Send client reports (usage statistics)
  sendClientReports: true,

  // Auto-session tracking
  autoSessionTracking: true,

  // Enable normalization of data
  normalizeDepth: 5,

  // Maximum value length before truncation
  maxValueLength: 2000,

  // Transport options for sending to Sentry
  transportOptions: {},

  // Enable logs integration
  enableLogs: true,

  // Capture console messages
  captureConsole: {
    levels: ["error", "warn"],
  },
});

// Export Sentry for use in the app
export { Sentry };

// Log initialization in development
if (process.env.NODE_ENV === "development") {
  console.log("🔍 Sentry Server initialized", {
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    dsn: process.env.SENTRY_DSN ? "✓ Configured" : "✗ Missing",
    release: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
    tracing: "enabled",
    profiling: "enabled",
  });
}
