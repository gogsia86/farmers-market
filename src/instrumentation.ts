import * as Sentry from "@sentry/nextjs";
import { validateEnv } from "./lib/env-validator";

export async function register() {
  // Validate environment variables at startup
  try {
    validateEnv();
  } catch (error) {
    console.error("Failed to validate environment variables:", error);
    // In production, we might want to fail fast
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
