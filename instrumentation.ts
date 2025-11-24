/**
 * NEXT.JS INSTRUMENTATION HOOK
 * Called automatically by Next.js before server starts
 * Perfect for initializing tracing!
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log(
      "🌾 Instrumentation hook registered (tracing disabled for now)",
    );
    // Temporarily disabled - OpenTelemetry auto-instrumentation needs proper setup
    // const { initializeTracing } = await import(
    //   "./src/lib/tracing/instrumentation"
    // );
    // initializeTracing();
  }
}
