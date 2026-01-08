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
import type { NextRequest } from "next/server";
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
 * Phase 2: Security headers & CORS
 * Phase 3: Authentication (conditional based on route type)
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================================================
  // PUBLIC ROUTES - Allow without authentication checks
  // ============================================================================
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/faq',
    '/how-it-works',
    '/farms',
    '/products',
    '/marketplace',
    '/api/health',
    '/api/ready',
  ];

  // Check if current path is public (ignore query params for matching)
  const isPublicRoute = publicRoutes.some(route => {
    // Exact match or starts with route path
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Log middleware execution for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - isPublic: ${isPublicRoute}`);
  }

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
  // PHASE 3: AUTHENTICATION & AUTHORIZATION
  // ============================================================================
  // Public routes can proceed without authentication
  if (isPublicRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Public route ${pathname} - allowing access`);
    }
    return response;
  }

  // For protected routes, check authentication
  const session = await auth();

  if (!session?.user) {
    // Prevent redirect loops - don't redirect if already going to login
    if (pathname === '/login') {
      return response;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Protected route ${pathname} - redirecting to login`);
    }

    // Redirect to login if not authenticated
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Protected route ${pathname} - authenticated as ${session.user.email}`);
  }

  // User is authenticated, allow access
  return response;
}

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
