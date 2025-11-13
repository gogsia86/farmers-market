// 🧠 DIVINE PATTERN: Sentry Client-Side Initialization
// 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
// 🌾 Domain: Client-Side Error Tracking
// ⚡ Performance: Agricultural Consciousness in Browser Error Monitoring

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Set agricultural context
  beforeSend(event) {
    // Add agricultural platform tags
    event.tags = {
      ...event.tags,
      platform: "farmers-market",
      "agricultural-consciousness": "active",
      runtime: "client",
    };

    // Filter sensitive data
    if (event.request?.url) {
      const url = new URL(event.request.url);
      // Remove sensitive query params
      url.searchParams.delete("token");
      url.searchParams.delete("password");
      event.request.url = url.toString();
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Network errors
    "NetworkError",
    "Failed to fetch",
    // React hydration warnings (non-critical)
    "Hydration failed",
    "Text content does not match",
  ],

  // Browser integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
  ],

  // Trace propagation targets
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/[^/]*\.farmersmarket\.com/,
  ],

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
});
