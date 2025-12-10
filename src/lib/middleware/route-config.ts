/**
 * MIDDLEWARE ROUTE CONFIGURATION
 * Centralized route protection and role-based access control
 *
 * Divine Patterns Applied:
 * - Single source of truth for route protection
 * - Role-based access control (RBAC)
 * - Agricultural consciousness in route design
 *
 * @module RouteConfig
 */

import type { UserRole } from "@/types/core-entities";

// ============================================================================
// ROUTE PATTERNS
// ============================================================================

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/marketplace",
  "/farms",
  "/farms/*",
  "/products",
  "/products/*",
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/(auth)/*",
];

/**
 * Auth routes - redirect to dashboard if already logged in
 */
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/register",
  "/(auth)/login",
  "/(auth)/signup",
  "/(auth)/admin-login",
  "/(auth)/farmer-login",
];

/**
 * API routes - skip middleware (handled by API route auth)
 */
export const API_ROUTES = ["/api/*", "/api/auth/*"];

/**
 * Static and system routes - skip middleware entirely
 */
export const SYSTEM_ROUTES = [
  "/_next/*",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/*.png",
  "/*.jpg",
  "/*.jpeg",
  "/*.gif",
  "/*.svg",
  "/*.ico",
  "/*.webp",
];

// ============================================================================
// ROLE-BASED ROUTE PROTECTION
// ============================================================================

/**
 * Route protection configuration
 * Maps route patterns to required roles
 */
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  // Admin routes - ADMIN, SUPER_ADMIN, MODERATOR
  "/admin": ["ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/admin/*": ["ADMIN", "SUPER_ADMIN", "MODERATOR"],

  // Super Admin only routes
  "/admin/settings": ["SUPER_ADMIN"],
  "/admin/settings/*": ["SUPER_ADMIN"],
  "/admin/users": ["SUPER_ADMIN", "ADMIN"],
  "/admin/users/*": ["SUPER_ADMIN", "ADMIN"],

  // Farmer routes - FARMER only
  "/farmer": ["FARMER"],
  "/farmer/*": ["FARMER"],
  "/(farmer)/*": ["FARMER"],

  // Consumer routes - CONSUMER only (or any authenticated user)
  "/dashboard": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/dashboard/*": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/orders": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/orders/*": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/cart": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/checkout": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/(customer)/*": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],

  // Profile and settings - any authenticated user
  "/profile": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
  "/settings": ["CONSUMER", "FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"],
};

/**
 * Restricted actions - paths that certain roles cannot access
 * Primarily for moderators who can view but not delete
 */
export const RESTRICTED_ACTIONS: Record<string, UserRole[]> = {
  "*/delete": ["MODERATOR"], // Moderators cannot delete
  "*/delete/*": ["MODERATOR"],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a route is public (no auth required)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Check if a route is an auth route (login/signup)
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => {
    return pathname === route || pathname.startsWith(route.replace("/*", ""));
  });
}

/**
 * Check if a route is an API route
 */
export function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some((route) => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname.startsWith(route);
  });
}

/**
 * Check if a route is a system route (static files, etc.)
 */
export function isSystemRoute(pathname: string): boolean {
  return SYSTEM_ROUTES.some((route) => {
    if (route.startsWith("/*.")) {
      const ext = route.slice(2);
      return pathname.endsWith(ext);
    }
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route;
  });
}

/**
 * Get required roles for a specific route
 * Returns null if route is public, empty array if auth required but no specific roles
 */
export function getRequiredRoles(pathname: string): UserRole[] | null {
  // Check if public route
  if (isPublicRoute(pathname)) {
    return null;
  }

  // Check for exact match first
  const exactMatch = PROTECTED_ROUTES[pathname];
  if (exactMatch) {
    return exactMatch;
  }

  // Check for pattern match (wildcard routes)
  for (const [pattern, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pattern.endsWith("/*")) {
      const basePattern = pattern.slice(0, -2);
      if (pathname.startsWith(basePattern)) {
        return roles;
      }
    }
  }

  // Default: require authentication but no specific role
  return [];
}

/**
 * Check if user has required role for a route
 */
export function hasRequiredRole(userRole: UserRole, pathname: string): boolean {
  const requiredRoles = getRequiredRoles(pathname);

  // Public route - no role required
  if (requiredRoles === null) {
    return true;
  }

  // Auth required but no specific role - any authenticated user
  if (requiredRoles.length === 0) {
    return true;
  }

  // Check if user has one of the required roles
  return requiredRoles.includes(userRole);
}

/**
 * Check if action is restricted for user role
 */
export function isActionRestricted(
  userRole: UserRole,
  pathname: string,
): boolean {
  for (const [pattern, restrictedRoles] of Object.entries(RESTRICTED_ACTIONS)) {
    const regex = new RegExp(pattern.replace("*", ".*"));
    if (regex.test(pathname)) {
      return restrictedRoles.includes(userRole);
    }
  }
  return false;
}

/**
 * Get login redirect URL based on intended destination
 */
export function getLoginUrl(pathname: string, baseUrl: string): string {
  // Admin routes -> admin login
  if (pathname.startsWith("/admin")) {
    const url = new URL("/(auth)/admin-login", baseUrl);
    url.searchParams.set("callbackUrl", pathname);
    return url.toString();
  }

  // Farmer routes -> farmer login (or general login)
  if (pathname.startsWith("/farmer") || pathname.startsWith("/(farmer)")) {
    const url = new URL("/login", baseUrl);
    url.searchParams.set("callbackUrl", pathname);
    url.searchParams.set("role", "farmer");
    return url.toString();
  }

  // Default -> general login
  const url = new URL("/login", baseUrl);
  url.searchParams.set("callbackUrl", pathname);
  return url.toString();
}

/**
 * Get redirect URL after successful login based on user role
 */
export function getDefaultRedirectUrl(userRole: UserRole): string {
  switch (userRole) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "MODERATOR":
      return "/admin";
    case "FARMER":
      return "/farmer/dashboard";
    case "CONSUMER":
      return "/dashboard";
    default:
      return "/";
  }
}

/**
 * Get access denied redirect URL
 */
export function getAccessDeniedUrl(baseUrl: string, reason?: string): string {
  const url = new URL("/", baseUrl);
  url.searchParams.set("error", reason || "insufficient_permissions");
  return url.toString();
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS TRACKING
// ============================================================================

/**
 * Check if route is agriculturally conscious
 * (for tracking and analytics)
 */
export function isAgriculturalRoute(pathname: string): boolean {
  return (
    pathname.includes("farm") ||
    pathname.includes("product") ||
    pathname.includes("harvest") ||
    pathname.includes("crop") ||
    pathname.includes("soil") ||
    pathname.includes("season") ||
    pathname.includes("marketplace")
  );
}
