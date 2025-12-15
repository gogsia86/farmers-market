/**
 * Server-Only Auth Utilities
 *
 * This module provides authentication utilities that can ONLY be used on the server.
 * It can safely import database and Node.js-specific modules.
 *
 * For client-side auth operations, use @/lib/auth/client instead.
 */

"use server";

import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Get current session (server-only)
 */
export async function getSession(): Promise<Session | null> {
  return await auth();
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized - Authentication required");
  }
  return session;
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: string): Promise<Session> {
  const session = await requireAuth();
  const userRole = (session.user as any)?.role;

  if (userRole !== role) {
    throw new Error(`Forbidden - ${role} role required`);
  }

  return session;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<Session> {
  return await requireRole("ADMIN");
}

/**
 * Require farmer role
 */
export async function requireFarmer(): Promise<Session> {
  return await requireRole("FARMER");
}

/**
 * Require customer role
 */
export async function requireCustomer(): Promise<Session> {
  return await requireRole("CUSTOMER");
}

/**
 * Check if current user has specific role (server-only)
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const userRole = (session.user as any)?.role;
  return userRole === role;
}

/**
 * Check if current user is admin (server-only)
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole("ADMIN");
}

/**
 * Check if current user is farmer (server-only)
 */
export async function isFarmer(): Promise<boolean> {
  return await hasRole("FARMER");
}

/**
 * Check if current user is customer (server-only)
 */
export async function isCustomer(): Promise<boolean> {
  return await hasRole("CUSTOMER");
}

/**
 * Get current user ID (server-only)
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Get current user email (server-only)
 */
export async function getUserEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email || null;
}

/**
 * Get current user name (server-only)
 */
export async function getUserName(): Promise<string | null> {
  const session = await auth();
  return session?.user?.name || null;
}

/**
 * Get current user role (server-only)
 */
export async function getUserRole(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;
  return (session.user as any)?.role || null;
}

/**
 * Verify user owns resource (server-only)
 */
export async function verifyOwnership(ownerId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  return userId === ownerId;
}

/**
 * Require user to own resource - throws if not owner
 */
export async function requireOwnership(ownerId: string): Promise<Session> {
  const session = await requireAuth();
  const userId = session.user?.id;

  if (userId !== ownerId) {
    throw new Error("Forbidden - You do not own this resource");
  }

  return session;
}

/**
 * Check if user can access resource (owner or admin)
 */
export async function canAccessResource(ownerId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const userId = session.user.id;
  const userRole = (session.user as any)?.role;

  return userId === ownerId || userRole === "ADMIN";
}

/**
 * Require user to have access to resource (owner or admin)
 */
export async function requireResourceAccess(ownerId: string): Promise<Session> {
  const session = await requireAuth();
  const userId = session.user?.id;
  const userRole = (session.user as any)?.role;

  if (userId !== ownerId && userRole !== "ADMIN") {
    throw new Error("Forbidden - You cannot access this resource");
  }

  return session;
}
