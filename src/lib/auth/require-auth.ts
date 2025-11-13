/**
 * 🧠 DIVINE PATTERN: Authentication Guards
 * 📚 Reference: 05_TESTING_SECURITY_DIVINITY.instructions.md
 * 🌾 Domain: Authentication & Authorization
 * ⚡ Performance: Efficient session validation
 */

import { auth } from "./index";

/**
 * Require authentication - throws if user is not logged in
 * @returns Authenticated session
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session;
}

/**
 * Require admin role - throws if user is not an admin
 * @returns Authenticated admin session
 * @throws Error if not authenticated or not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(
    session.user.role
  );
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}

/**
 * Require farmer role - throws if user is not a farmer
 * @returns Authenticated farmer session
 * @throws Error if not authenticated or not farmer
 */
export async function requireFarmer() {
  const session = await requireAuth();
  if (session.user.role !== "FARMER") {
    throw new Error("Farmer access required");
  }
  return session;
}

/**
 * Require specific role - throws if user doesn't have required role
 * @param requiredRole Role required for access
 * @returns Authenticated session with required role
 * @throws Error if not authenticated or wrong role
 */
export async function requireRole(requiredRole: string) {
  const session = await requireAuth();
  if (session.user.role !== requiredRole) {
    throw new Error(`${requiredRole} access required`);
  }
  return session;
}
