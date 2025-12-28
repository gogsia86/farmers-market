/**
 * Next.js Middleware
 *
 * Handles:
 * - Route redirects for restructured paths
 * - Authentication checks (NextAuth v5)
 * - Role-based access control
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 *
 * Updated: January 2025
 * NextAuth v5 (Auth.js) Migration
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";

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
  // FUTURE: Add authentication and RBAC here
  // ============================================================================
  // TODO: Phase 2+ will add authentication middleware
  // - Check session
  // - Verify user roles
  // - Protect routes based on role
  // See: src/lib/middleware/route-config.ts for configuration

  // Continue to next middleware or route handler
  return NextResponse.next();
}) as any;

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
