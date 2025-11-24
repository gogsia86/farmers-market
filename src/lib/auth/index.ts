/**
 * 🔐 AUTHENTICATION UTILITIES
 * NextAuth v5 wrapper functions
 */

import { auth as nextAuthAuth } from "@/lib/auth";
import { authConfig } from "./config";

// NextAuth v5 uses auth() directly from @/auth
export const auth: any = nextAuthAuth;

// Export config for compatibility
export const authOptions = authConfig;

// Helper to require authentication
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session;
}

// Helper to require admin role
export async function requireAdmin() {
  const session = await requireAuth();
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(
    session.user.role,
  );
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}

// Helper to check specific roles
export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new Error(`Required role: ${roles.join(" or ")}`);
  }
  return session;
}

// Helper to get current user or null
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
