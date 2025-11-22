/**
 * NEXTAUTH V5 API ROUTE
 * Divine authentication endpoint with rate limiting
 *
 * Updated: January 2025
 * Version: NextAuth v5.0.0-beta
 */

import { handlers } from "@/lib/auth/config";
import {
  checkRateLimit,
  getClientIp,
  LOGIN_RATE_LIMIT,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET handler for NextAuth v5
 * Handles authentication requests (sign in page, callbacks, etc.)
 */
async function GET(request: NextRequest) {
  try {
    return await handlers.GET(request);
  } catch (error) {
    console.error("NextAuth GET error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }
}

/**
 * POST handler for NextAuth v5 with rate limiting
 * Handles sign in, sign out, and other POST requests
 */
async function POST(request: NextRequest) {
  try {
    // Check if this is a credentials login attempt
    const url = new URL(request.url);
    const isCredentialsLogin =
      url.pathname.includes("/callback/credentials") ||
      url.searchParams.get("callbackUrl") !== null;
    const contentType = request.headers.get("content-type");

    // Apply rate limiting for login attempts
    if (
      isCredentialsLogin ||
      contentType?.includes("application/x-www-form-urlencoded")
    ) {
      const ip = getClientIp(request);
      const rateLimit = checkRateLimit(ip, LOGIN_RATE_LIMIT);

      if (!rateLimit.allowed) {
        console.warn(
          `🚨 Rate limit exceeded for IP: ${ip} (${rateLimit.remaining}/${rateLimit.limit})`,
        );

        return NextResponse.json(
          {
            error: "Too many login attempts",
            message: `Please try again in ${rateLimit.resetTime} seconds`,
            retryAfter: rateLimit.resetTime,
          },
          {
            status: 429,
            headers: {
              "Retry-After": rateLimit.resetTime.toString(),
              "X-RateLimit-Limit": rateLimit.limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": rateLimit.resetTime.toString(),
            },
          },
        );
      }

      // Execute NextAuth handler
      const response = await handlers.POST(request);

      // Add rate limit headers to successful responses
      if (response) {
        response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
        response.headers.set(
          "X-RateLimit-Remaining",
          rateLimit.remaining.toString(),
        );
        response.headers.set(
          "X-RateLimit-Reset",
          rateLimit.resetTime.toString(),
        );
      }

      return response;
    }

    // For non-login requests, proceed without rate limiting
    return await handlers.POST(request);
  } catch (error) {
    console.error("NextAuth POST error:", error);

    // If rate limiting fails, still try to authenticate
    // (fail open for reliability)
    try {
      return await handlers.POST(request);
    } catch (innerError) {
      console.error("NextAuth inner POST error:", innerError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 },
      );
    }
  }
}

// Export handlers for NextAuth v5
export { GET, POST };

// Export dynamic config
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
