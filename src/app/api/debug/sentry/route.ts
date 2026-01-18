/**
 * 🔍 SENTRY DEBUG ENDPOINT
 *
 * Tests Sentry integration by sending a test error
 * Part of Wave 2: Integration Verification
 *
 * Usage:
 *   GET  /api/debug/sentry        - Send test error to Sentry
 *   POST /api/debug/sentry        - Send custom test error
 *
 * ⚠️ SECURITY: Only available in development or with debug token
 */

import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Security check
function isAuthorized(request: NextRequest): boolean {
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasDebugToken =
    request.headers.get("x-debug-token") === process.env.DEBUG_TOKEN;

  return isDevelopment || hasDebugToken;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "This endpoint is only available in development mode or with x-debug-token header",
      },
      { status: 403 }
    );
  }

  // Check if Sentry is configured
  const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!sentryDsn) {
    return NextResponse.json(
      {
        success: false,
        error: "Sentry is not configured",
        details: {
          missingVariable: "SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN",
          hint: "Add SENTRY_DSN to your .env.local file",
          example: "SENTRY_DSN=https://public@sentry.io/project-id",
          getDsn: "https://sentry.io/settings/YOUR_ORG/projects/YOUR_PROJECT/keys/",
        },
      },
      { status: 500 }
    );
  }

  try {
    // Add breadcrumbs for context
    Sentry.addBreadcrumb({
      category: "debug",
      message: "Debug endpoint called",
      level: "info",
      data: {
        endpoint: "/api/debug/sentry",
        method: "GET",
        timestamp: new Date().toISOString(),
      },
    });

    Sentry.addBreadcrumb({
      category: "test",
      message: "Preparing to send test error",
      level: "info",
    });

    // Set tags for this test
    Sentry.setTag("test_type", "api-endpoint");
    Sentry.setTag("test_source", "debug-endpoint");
    Sentry.setTag("environment_test", process.env.NODE_ENV || "unknown");

    // Set user context
    Sentry.setUser({
      id: "debug-test-user",
      username: "Debug Tester",
      email: "debug@farmers-market.test",
    });

    // Create a test error with stack trace
    const testError = new Error("🧪 Test error from Sentry debug endpoint");
    testError.stack = `Error: 🧪 Test error from Sentry debug endpoint
    at GET (src/app/api/debug/sentry/route.ts:90:25)
    at handler (src/app/api/debug/sentry/route.ts:85:12)
    at processRequest (node_modules/next/dist/server/lib/router.js:150:18)`;

    // Capture the exception
    const eventId = Sentry.captureException(testError, {
      tags: {
        test: "debug-endpoint",
        intentional: "true",
      },
      level: "error",
      extra: {
        testInfo: "This is a test error from the debug endpoint",
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV,
      },
    });

    // Also send a test message
    const messageId = Sentry.captureMessage(
      "🧪 Test message from Sentry debug endpoint",
      {
        level: "info",
        tags: {
          test: "debug-endpoint",
          type: "message",
        },
        extra: {
          note: "This is a test message to verify Sentry messaging works",
        },
      }
    );

    // Flush to ensure events are sent immediately
    await Sentry.flush(2000);

    return NextResponse.json({
      success: true,
      message: "Test error and message sent to Sentry successfully",
      sentry: {
        configured: true,
        dsnSet: true,
        eventsSent: 2,
        errorEventId: eventId,
        messageEventId: messageId,
      },
      instructions: {
        checkDashboard: "Visit https://sentry.io/ to see the events",
        searchByEventId: `Search for event ID: ${eventId}`,
        note: "Events may take a few seconds to appear in the dashboard",
        filterByTag: "Filter by tag 'test:debug-endpoint' to find these test events",
      },
      nextSteps: [
        "1. Visit your Sentry dashboard at https://sentry.io/",
        `2. Look for error event with ID: ${eventId}`,
        "3. Verify breadcrumbs and context are captured",
        "4. Check that stack traces are readable",
        "5. If stack traces are minified, upload source maps",
      ],
      links: {
        dashboard: "https://sentry.io/",
        eventUrl: eventId
          ? `https://sentry.io/organizations/YOUR_ORG/issues/?query=${eventId}`
          : null,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Try to capture this error to Sentry as well
    try {
      Sentry.captureException(error);
    } catch {
      // Ignore if Sentry fails
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test error to Sentry",
        details: {
          errorMessage,
          possibleCauses: [
            "Invalid Sentry DSN format",
            "Network connectivity issues",
            "Sentry service unavailable",
            "Rate limiting",
          ],
          troubleshooting: [
            "1. Verify SENTRY_DSN is correctly formatted",
            "2. Check network connectivity",
            "3. Test with: npm run sentry:test",
            "4. Review Sentry dashboard for rate limits",
          ],
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "This endpoint is only available in development mode",
      },
      { status: 403 }
    );
  }

  const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!sentryDsn) {
    return NextResponse.json(
      {
        success: false,
        error: "Sentry is not configured",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { errorMessage, level, tags, extra } = body;

    // Send custom error
    const eventId = Sentry.captureMessage(errorMessage || "Custom test error", {
      level: (level as any) || "error",
      tags: {
        test: "debug-endpoint",
        custom: "true",
        ...tags,
      },
      extra: {
        customTest: true,
        timestamp: new Date().toISOString(),
        ...extra,
      },
    });

    await Sentry.flush(2000);

    return NextResponse.json({
      success: true,
      message: "Custom error sent to Sentry",
      eventId,
      sentMessage: errorMessage || "Custom test error",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send custom error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
