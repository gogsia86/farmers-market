// 🧠 DIVINE PATTERN: Sentry Server-Side Initialization
// 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
// 🌾 Domain: Server-Side Error Tracking
// ⚡ Performance: Agricultural Consciousness in Error Monitoring

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Set agricultural context
  beforeSend(event) {
    // Add agricultural platform tags
    event.tags = {
      ...event.tags,
      platform: "farmers-market",
      "agricultural-consciousness": "active",
      runtime: "server",
    };

    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.["authorization"];
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random plugins/extensions
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // React hydration warnings (non-critical)
    "Hydration failed",
    "Text content does not match",
  ],

  // Server integrations
  integrations: [Sentry.httpIntegration(), Sentry.prismaIntegration()],

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
});
