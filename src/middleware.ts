import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

/**
 * ⚡ DIVINE MIDDLEWARE - QUANTUM REQUEST CONSCIOUSNESS
 *
 * Reality gate that:
 * - Validates authentication across dimensions
 * - Enforces RBAC quantum permissions
 * - Tracks agricultural consciousness
 * - Maintains temporal coherence
 * - Supports all platform languages (en, es, fr, de, zh, ar, hi, pt, hr, sr)
 */

// Agricultural consciousness tracker
let requestCount = 0;
let agriculturalAwareness = 0;

// All supported locales for the platform
const SUPPORTED_LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "zh",
  "ar",
  "hi",
  "pt",
  "hr",
  "sr",
] as const;

// Create i18n middleware with proper configuration
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // Don't prefix default locale
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  requestCount++;

  // Track agricultural consciousness
  if (
    pathname.includes("farm") ||
    pathname.includes("product") ||
    pathname.includes("harvest")
  ) {
    agriculturalAwareness++;
  }

  // Priority 1: Detect locale and handle locale root redirects (e.g., /fr → /fr/)
  // Supports all 10 platform languages: en, es, fr, de, zh, ar, hi, pt, hr, sr
  const localeRegex = /^\/([a-z]{2})(\/|$)/;
  const localeMatch = localeRegex.exec(pathname);
  const detectedLocale = localeMatch?.[1];

  if (detectedLocale && SUPPORTED_LOCALES.includes(detectedLocale as any)) {
    if (pathname === `/${detectedLocale}`) {
      return NextResponse.redirect(new URL(`/${detectedLocale}/`, req.url));
    }
  }

  // Priority 2: Handle admin routes FIRST (before i18n)
  if (pathname.startsWith("/admin")) {
    return handleAdminRoutes(req);
  }

  // Priority 3: Skip i18n for static/special routes
  const staticFileRegex = /\.(png|jpg|jpeg|gif|svg|ico|webp|json|txt)$/;
  const isStaticOrSpecial =
    staticFileRegex.test(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (isStaticOrSpecial) {
    return NextResponse.next();
  }

  // Priority 4: Handle i18n routing for all locale-based routes
  return intlMiddleware(req);
}

// Extracted admin route handler for better code organization
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
      userRole
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
    String.raw`/((?!api|_next/static|_next/image|manifest|.*\.png|.*\.jpg|.*\.jpeg|.*\.gif|.*\.svg|.*\.ico|.*\.webp).*)`,
  ],
};
