/**
 * NEXT.JS INSTRUMENTATION HOOK
 * Called automatically by Next.js before server starts
 *
 * This enables OpenTelemetry tracing with agricultural consciousness
 * for the Divine Farmers Market Platform.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only initialize tracing in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Check if tracing is explicitly enabled via environment variable
    const tracingEnabled = process.env.ENABLE_TRACING === "true";

    if (tracingEnabled) {
      try {
        const { initializeTracing } = await import(
          "./src/lib/tracing/instrumentation"
        );
        initializeTracing();
        console.log(
          "🌾 Divine Tracing initialized with agricultural consciousness",
        );
      } catch (error) {
        // Log error but don't crash the application
        console.warn("⚠️ Failed to initialize tracing:", error);
        console.log(
          "🌾 Application continuing without tracing instrumentation",
        );
      }
    } else {
      console.log(
        "🌾 Instrumentation hook registered (tracing disabled - set ENABLE_TRACING=true to enable)",
      );
    }
  }
}

/**
 * Called when there's an error during instrumentation
 * This is useful for debugging initialization issues
 */
export function onRequestError(
  error: Error,
  request: { path: string; method: string },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    renderSource: string;
  },
) {
  // Log instrumentation errors for debugging
  console.error("🚨 Instrumentation request error:", {
    error: error.message,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
  });
}
