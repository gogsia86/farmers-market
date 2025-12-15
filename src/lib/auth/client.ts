/**
 * Client-Safe Auth Utilities
 *
 * This module provides authentication utilities that are safe to use in client components.
 * NO database imports or Node.js-specific modules are used here.
 *
 * For server-side auth operations, use @/lib/auth/server instead.
 */

import type { Session } from "next-auth";

// Re-export client-safe NextAuth functions
export { signIn, signOut, useSession } from "next-auth/react";

// Re-export types
export type { Session } from "next-auth";

/**
 * Client-safe type guard to check if user is authenticated
 */
export function isAuthenticated(session: Session | null): session is Session {
  return !!session?.user;
}

/**
 * Client-safe check if user has a specific role
 */
export function hasRole(session: Session | null, role: string): boolean {
  if (!session?.user) return false;
  return (session.user as any).role === role;
}

/**
 * Client-safe check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, "ADMIN");
}

/**
 * Client-safe check if user is farmer
 */
export function isFarmer(session: Session | null): boolean {
  return hasRole(session, "FARMER");
}

/**
 * Client-safe check if user is customer
 */
export function isCustomer(session: Session | null): boolean {
  return hasRole(session, "CUSTOMER");
}

/**
 * Get user ID from session (client-safe)
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null;
}

/**
 * Get user email from session (client-safe)
 */
export function getUserEmail(session: Session | null): string | null {
  return session?.user?.email || null;
}

/**
 * Get user name from session (client-safe)
 */
export function getUserName(session: Session | null): string | null {
  return session?.user?.name || null;
}

/**
 * Get user role from session (client-safe)
 */
export function getUserRole(session: Session | null): string | null {
  if (!session?.user) return null;
  return (session.user as any).role || null;
}

/**
 * Client-safe session status check
 */
export function getSessionStatus(
  status: "authenticated" | "loading" | "unauthenticated",
): {
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
} {
  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}
