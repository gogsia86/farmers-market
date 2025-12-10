/**
 * 🔐 DIVINE AUTH UTILITIES - NEXTAUTH V4
 * Quantum authentication with agricultural consciousness
 *
 * Updated: January 2025
 * Version: NextAuth v4.24.x
 *
 * CANONICAL IMPORT POINT
 * This file re-exports all authentication utilities from the config
 * for easy importing throughout the application.
 *
 * Usage: import { auth, requireAuth, signIn } from "@/lib/auth"
 */

// Re-export all auth utilities from the canonical config
export {
  // Core auth functions
  auth,
  authOptions,
  handlers,
  GET,
  POST,
  getServerSession,
  // Helper functions
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireFarmer,
  hasRole,
  isAdmin,
  isFarmer,
  // Client-side functions (re-exported from next-auth/react)
  signIn,
  signOut,
} from "@/lib/auth/config";

// Re-export isAuthenticated from index
export { isAuthenticated } from "@/lib/auth/index";

// Export types for convenience
export type { UserRole } from "@/types/core-entities";
