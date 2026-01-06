// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Disable tracing to prevent source map warnings
  tracesSampleRate: 0,

  // Disable logs to prevent source map warnings
  enableLogs: false,

  // Disable PII to prevent source map warnings
  sendDefaultPii: false,

  // Disable source map features
  enableTracing: false,

  // Minimal integrations
  integrations: [],

  // Debug mode disabled
  debug: false,

  // Environment
  environment: process.env.NODE_ENV || "production",
});
