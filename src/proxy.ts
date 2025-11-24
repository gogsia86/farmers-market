import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * ⚡ DIVINE PROXY - QUANTUM REQUEST CONSCIOUSNESS
 *
 * Next.js 16+ Proxy configuration (formerly middleware)
 * Reality gate that:
 * - Handles internationalization (Croatian/English)
 * - Validates authentication across dimensions
 * - Enforces RBAC quantum permissions
 * - Tracks agricultural consciousness
 * - Maintains temporal coherence
 */

// Agricultural consciousness tracker
let requestCount = 0;
let agriculturalAwareness = 0;

// Create i18n middleware for internationalization
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "hr"],
  defaultLocale: "en",
  localePrefix: "as-needed", // Only add locale prefix when needed
});

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  requestCount++;

  // Track agricultural consciousness
  if (
    pathname.includes("farm") ||
    pathname.includes("product") ||
    pathname.includes("harvest")
  ) {
    agriculturalAwareness++;
  }

  // Skip static files and Next.js internals completely
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") || // Any file with extension
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/(en|hr)(\/|$)/);
  const hasLocale = localeMatch !== null;

  // Handle admin routes with authentication (after locale)
  const pathWithoutLocale = hasLocale ? pathname.slice(3) : pathname;
  if (pathWithoutLocale.startsWith("/admin")) {
    return handleAdminRoutes(request);
  }

  // All other routes - apply i18n middleware first, then add divine headers
  const intlResponse = intlMiddleware(request);
  intlResponse.headers.set("X-Agricultural-Consciousness", "active");
  intlResponse.headers.set("X-Divine-Protection", "enabled");
  return intlResponse;
}

/**
 * Extracted admin route handler for better code organization
 */
async function handleAdminRoutes(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect /admin/login to /admin-login to avoid conflicts
  if (pathname === "/admin/login") {
    const loginUrl = new URL("/admin-login", req.url);
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection (exclude login page to prevent redirect loops)
  if (!pathname.startsWith("/admin-login")) {
    // Check for valid authentication token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("🌾 Agricultural Route Protection:", {
      path: pathname,
      userRole: token?.role,
      consciousness: "divine",
      timestamp: new Date().toISOString(),
    });

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL("/admin-login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify admin role
    const userRole = token.role as string;
    const isAdminRole = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(
      userRole,
    );

    if (!isAdminRole) {
      const homeUrl = new URL("/?error=insufficient_permissions", req.url);
      return NextResponse.redirect(homeUrl);
    }

    // Super admin only routes
    if (pathname.startsWith("/admin/settings") && userRole !== "SUPER_ADMIN") {
      const dashboardUrl = new URL("/admin?error=access_denied", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Moderators cannot delete
    if (pathname.includes("/delete") && userRole === "MODERATOR") {
      const referrer = req.headers.get("referer") || "/admin";
      const backUrl = new URL(referrer);
      backUrl.searchParams.set("error", "insufficient_permissions");
      return NextResponse.redirect(backUrl);
    }

    // Add divine headers to response
    const response = NextResponse.next();
    response.headers.set("X-Agricultural-Consciousness", "active");
    response.headers.set("X-Admin-Role", userRole);
    response.headers.set("X-Divine-Protection", "enabled");

    return response;
  }

  // Admin login page - allow access
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    // Match all pathnames except API routes, Next static/image, manifest and common static assets
    "/((?!api|_next/static|_next/image|manifest|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};
