import { authConfig } from "@/lib/auth/config";
import {
  checkRateLimit,
  getClientIp,
  LOGIN_RATE_LIMIT,
} from "@/lib/rate-limit";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// NextAuth v4 expects authOptions
const handler = NextAuth(authConfig as any);

// Wrap POST handler with rate limiting
async function POST(request: NextRequest) {
  try {
    // Check if this is a credentials login attempt
    // NextAuth sends form data, not JSON, so we need to check the URL and content-type
    const url = new URL(request.url);
    const isCredentialsLogin = url.pathname.includes("/callback/credentials");
    const contentType = request.headers.get("content-type");

    // Only apply rate limiting for credentials login attempts
    if (isCredentialsLogin || contentType?.includes("application/x-www-form-urlencoded")) {
      // Apply rate limiting
      const ip = getClientIp(request);
      const rateLimit = checkRateLimit(ip, LOGIN_RATE_LIMIT);

      if (!rateLimit.allowed) {
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
          }
        );
      }

      // Add rate limit headers to response
      const response = await handler(request);
      response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimit.remaining.toString()
      );
      response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString());

      return response;
    }

    // For non-login requests, proceed normally
    return handler(request);
  } catch (error) {
    // If there's any error in rate limiting, proceed with the request
    // to avoid breaking authentication
    console.error("Rate limit check error:", error);
    return handler(request);
  }
}

export { handler as GET, POST };
