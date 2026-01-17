// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // DSN from environment variable
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Organization and project
  // org: medicis-gang
  // project: farmers-market-prod

  // Adjust this value in production, or use tracesSampler for greater control
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production to optimize performance and costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Replay configuration for session replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions for replay

  // Environment detection
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

  // Release tracking (Git SHA from Vercel)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,

  // Integrations for better error tracking
  integrations: [
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Set sampling rate for performance monitoring
      tracingOrigins: ["localhost", /^\//],
      // Propagate traces to backend
      tracePropagationTargets: ["localhost", /^https:\/\/[^/]*\.vercel\.app/],
    }),

    // Session replay for debugging
    Sentry.replayIntegration({
      // Mask all text and images by default for privacy
      maskAllText: true,
      blockAllMedia: true,
      // Network details for debugging
      networkDetailAllowUrls: [window.location.origin],
    }),

    // Browser profiling for performance insights
    Sentry.browserProfilingIntegration(),
  ],

  // Before sending to Sentry, clean up sensitive data
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
      return null;
    }

    // Filter out non-error console logs
    if (event.level === "log" || event.level === "info") {
      return null;
    }

    // Remove sensitive data from request headers
    if (event.request?.headers) {
      delete event.request.headers["Authorization"];
      delete event.request.headers["Cookie"];
      delete event.request.headers["X-Auth-Token"];
    }

    // Sanitize user data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    /^Non-Error promise rejection captured/,
    /Extension context invalidated/,
    // Network errors that are expected
    /Failed to fetch/,
    /NetworkError/,
    /Network request failed/,
    // React hydration mismatches (common in dev)
    /Hydration failed/,
    /There was an error while hydrating/,
    /Text content does not match/,
    // Canceled requests (user navigation)
    /AbortError/,
    /The user aborted a request/,
    // Chunk loading errors (retry mechanisms handle these)
    /Loading chunk \d+ failed/,
    /ChunkLoadError/,
    // ResizeObserver errors (non-critical)
    /ResizeObserver loop limit exceeded/,
    /ResizeObserver loop completed with undelivered notifications/,
  ],

  // Don't send errors from certain URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // Development tools
    /webpack-internal/i,
  ],

  // Tag all events with additional context
  initialScope: {
    tags: {
      platform: "browser",
      framework: "next.js",
      deployment: process.env.NEXT_PUBLIC_VERCEL_ENV || "local",
    },
  },

  // Performance monitoring configuration
  beforeTransaction(event) {
    // Sample transactions based on environment
    if (process.env.NODE_ENV === "development") {
      return event;
    }

    // In production, sample based on transaction name
    const transactionName = event.transaction || "";

    // Always capture API routes and critical paths
    if (
      transactionName.includes("/api/") ||
      transactionName.includes("/checkout") ||
      transactionName.includes("/payment")
    ) {
      return event;
    }

    // Sample other transactions at lower rate
    if (Math.random() > 0.1) {
      return null;
    }

    return event;
  },

  // Maximum breadcrumbs to keep (console logs, navigation, etc.)
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
  transportOptions: {
    // Retry failed requests
    retry: {
      maxRetries: 3,
    },
  },
});

// Export Sentry for use in the app
export { Sentry };

// Log initialization in development
if (process.env.NODE_ENV === "development") {
  console.log("🔍 Sentry Client initialized", {
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? "✓ Configured" : "✗ Missing",
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local-dev",
  });
}
