// 🧠 DIVINE PATTERN: Sentry Edge Runtime Initialization
// 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
// 🌾 Domain: Edge Runtime Error Tracking
// ⚡ Performance: Agricultural Consciousness at the Edge

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
      runtime: "edge",
    };

    return event;
  },

  // Ignore certain errors
  ignoreErrors: ["NetworkError", "Failed to fetch"],

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
});
