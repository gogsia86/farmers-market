/**
 * Next.js Middleware - Enhanced with Security
 *
 * Handles:
 * - Route redirects for restructured paths
 * - Authentication checks (NextAuth v5)
 * - Role-based access control
 * - Security headers (CSP, HSTS, etc.)
 * - CORS configuration
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 *
 * Updated: January 2025
 * NextAuth v5 (Auth.js) Migration + Security Headers
 */

import { auth } from "@/lib/auth/config";
import { applyCORSHeaders, applySecurityHeaders, getProductionCORSConfig } from "@/lib/security/headers";
import type { NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware Runtime Configuration
 * Use Node.js runtime to avoid Turbopack NFT file generation issues
 */
export const runtime = "nodejs";

/**
 * Middleware function with NextAuth v5 integration
 *
 * Phase 1: Handle redirects for restructured routes
 * Phase 2: Authentication (handled by NextAuth v5 authorized callback)
 */
export default auth((request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // ============================================================================
  // PHASE 1: ROUTE REDIRECTS (Redundant Nesting Removal)
  // ============================================================================

  // Redirect old admin routes
  if (pathname.startsWith("/admin/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/admin/admin", "/admin");
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // Redirect old farmer routes
  if (pathname.startsWith("/farmer/farmer")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/farmer/farmer", "/farmer");
    return NextResponse.redirect(url, 301);
  }

  // Redirect old monitoring routes
  if (pathname.startsWith("/monitoring/monitoring")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/monitoring/monitoring", "/monitoring");
    return NextResponse.redirect(url, 301);
  }

  // ============================================================================
  // PHASE 2: SECURITY HEADERS & CORS
  // ============================================================================

  // Create response
  const response = NextResponse.next();

  // Apply security headers (CSP, HSTS, X-Frame-Options, etc.)
  applySecurityHeaders(response, {
    enableCSP: true,
    enableHSTS: process.env.NODE_ENV === 'production',
    environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
  });

  // Apply CORS headers for API routes
  if (pathname.startsWith('/api')) {
    applyCORSHeaders(response, request, getProductionCORSConfig());
  }

  // ============================================================================
  // FUTURE: Add enhanced authentication and RBAC here
  // ============================================================================
  // Phase 3+ will add:
  // - Check session
  // - Verify user roles
  // - Protect routes based on role
  // See: src/lib/middleware/route-config.ts for configuration

  return response;
}) as NextMiddleware;

/**
 * Middleware configuration
 * Define which routes should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
