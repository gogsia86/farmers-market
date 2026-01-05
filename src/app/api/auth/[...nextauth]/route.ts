/**
 * 🔐 NEXTAUTH V5 API ROUTE HANDLER
 * Divine authentication endpoint with agricultural consciousness
 *
 * This file exports the NextAuth v5 request handlers for all auth-related
 * API routes (/api/auth/*)
 *
 * CANONICAL AUTH ROUTE
 * All authentication requests flow through this endpoint.
 *
 * Version: NextAuth v5.0.0-beta.30 (Auth.js)
 * Updated: January 2025
 */

import { handlers } from "@/lib/auth/config";

// Export the NextAuth v5 handlers
// These handle GET and POST requests to /api/auth/*
export const { GET, POST } = handlers;

/**
 * Route Configuration
 * This ensures the route works correctly with Next.js App Router
 */
export const runtime = "nodejs"; // Use Node.js runtime
export const dynamic = "force-dynamic"; // Always dynamic (no caching)

/**
 * SUPPORTED ENDPOINTS:
 *
 * GET /api/auth/session - Get current session
 * POST /api/auth/session - Update session
 * GET /api/auth/csrf - Get CSRF token
 * POST /api/auth/signin - Sign in
 * POST /api/auth/signout - Sign out
 * GET /api/auth/callback/:provider - OAuth callback
 * POST /api/auth/callback/:provider - OAuth callback
 * GET /api/auth/signin/:provider - Sign in with provider
 * GET /api/auth/signout - Sign out page
 * GET /api/auth/error - Error page
 *
 * All endpoints are handled by the NextAuth v5 handlers.
 */
