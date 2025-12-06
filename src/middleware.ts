/**
 * ⚡ DIVINE MIDDLEWARE - QUANTUM REQUEST CONSCIOUSNESS
 *
 * Next.js Middleware with comprehensive authentication and authorization
 *
 * Divine Patterns Applied:
 * - Single source of truth for route protection
 * - Role-based access control (RBAC)
 * - Agricultural consciousness tracking
 * - Performance reality bending (minimal overhead)
 *
 * Features:
 * - Centralized authentication for all protected routes
 * - Role-based route protection (Admin, Farmer, Customer)
 * - Smart redirects based on user role
 * - Action-level restrictions (e.g., moderators can't delete)
 * - Agricultural route tracking for analytics
 *
 * @module Middleware
 */

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types/core-entities";
import {
  isPublicRoute,
  isAuthRoute,
  isApiRoute,
  isSystemRoute,
  hasRequiredRole,
  isActionRestricted,
  getLoginUrl,
  getDefaultRedirectUrl,
  getAccessDeniedUrl,
  isAgriculturalRoute,
} from "@/lib/middleware/route-config";

// ============================================================================
// GLOBAL CONSCIOUSNESS TRACKING
// ============================================================================

let requestCount = 0;
let agriculturalAwareness = 0;

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const baseUrl = request.url;

  // Increment request counter
  requestCount++;

  // Track agricultural consciousness
  if (isAgriculturalRoute(pathname)) {
    agriculturalAwareness++;
  }

  // ========================================
  // SKIP MIDDLEWARE FOR SYSTEM ROUTES
  // ========================================

  // Skip static files, Next.js internals, and API routes
  if (isSystemRoute(pathname) || isApiRoute(pathname)) {
    return NextResponse.next();
  }

  // ========================================
  // REDIRECT LEGACY ROUTES
  // ========================================

  // Redirect /register to /signup (removed duplicate route)
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // ========================================
  // PUBLIC ROUTES
  // ========================================

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    response.headers.set("X-Agricultural-Consciousness", "active");
    response.headers.set("X-Public-Route", "true");
    return response;
  }

  // ========================================
  // AUTHENTICATION CHECK
  // ========================================

  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("🛡️  Middleware Auth Check:", {
    path: pathname,
    authenticated: !!token,
    userRole: token?.role || "none",
    timestamp: new Date().toISOString(),
  });

  // ========================================
  // AUTH ROUTES (Login/Signup)
  // ========================================

  // If user is already authenticated and trying to access auth routes,
  // redirect to their role-based dashboard
  if (isAuthRoute(pathname)) {
    if (token) {
      const userRole = token.role as UserRole;
      const redirectUrl = getDefaultRedirectUrl(userRole);
      console.log(`✅ Already authenticated, redirecting to ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Allow unauthenticated users to access auth routes
    return NextResponse.next();
  }

  // ========================================
  // PROTECTED ROUTES - REQUIRE AUTH
  // ========================================

  // If not authenticated, redirect to login
  if (!token) {
    console.log("❌ Not authenticated, redirecting to login");
    const loginUrl = getLoginUrl(pathname, baseUrl);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated - check role-based access
  const userRole = token.role as UserRole;

  // ========================================
  // ROLE-BASED AUTHORIZATION
  // ========================================

  // Check if user has required role for this route
  if (!hasRequiredRole(userRole, pathname)) {
    console.log(`❌ Insufficient permissions for ${userRole} on ${pathname}`);
    const accessDeniedUrl = getAccessDeniedUrl(
      baseUrl,
      "insufficient_permissions",
    );
    return NextResponse.redirect(accessDeniedUrl);
  }

  // ========================================
  // ACTION-LEVEL RESTRICTIONS
  // ========================================

  // Check if action is restricted for user role (e.g., moderators can't delete)
  if (isActionRestricted(userRole, pathname)) {
    console.log(`❌ Action restricted for ${userRole} on ${pathname}`);
    const referrer =
      request.headers.get("referer") || getDefaultRedirectUrl(userRole);
    const backUrl = new URL(referrer);
    backUrl.searchParams.set("error", "action_restricted");
    return NextResponse.redirect(backUrl);
  }

  // ========================================
  // SUPER ADMIN ONLY ROUTES
  // ========================================

  // Extra check for super admin only routes (settings, critical admin functions)
  if (pathname.startsWith("/admin/settings") && userRole !== "SUPER_ADMIN") {
    console.log(`❌ Super admin only route accessed by ${userRole}`);
    const dashboardUrl = new URL("/admin?error=super_admin_only", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // ========================================
  // SUCCESS - ADD DIVINE HEADERS
  // ========================================

  console.log(`✅ Access granted: ${userRole} -> ${pathname}`);

  const response = NextResponse.next();

  // Add divine consciousness headers
  response.headers.set("X-Agricultural-Consciousness", "active");
  response.headers.set("X-Divine-Protection", "enabled");
  response.headers.set("X-User-Role", userRole);
  response.headers.set("X-Request-Count", requestCount.toString());
  response.headers.set(
    "X-Agricultural-Awareness",
    agriculturalAwareness.toString(),
  );

  // Add agricultural consciousness for farm-related routes
  if (isAgriculturalRoute(pathname)) {
    response.headers.set("X-Route-Type", "agricultural");
  }

  return response;
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

/**
 * Configure which routes this middleware runs on
 *
 * This matcher excludes:
 * - API routes (handled by API route auth)
 * - Next.js static files (_next/static, _next/image)
 * - Common static assets (images, icons, manifest)
 *
 * All other routes will be processed by the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, robots.txt, sitemap.xml
     * - Common image extensions
     */
    "/((?!api|_next/static|_next/image|manifest|favicon.ico|robots.txt|sitemap.xml|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};
