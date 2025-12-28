/**
 * 🔐 DIVINE AUTH UTILITIES - NEXTAUTH V5 (AUTH.JS)
 * Quantum authentication with agricultural consciousness
 *
 * Updated: January 2025
 * Version: NextAuth v5.0.0-beta.30 (Auth.js)
 *
 * CANONICAL IMPORT POINT
 * This file re-exports all authentication utilities from the config
 * for easy importing throughout the application.
 *
 * Usage: import { auth, requireAuth, signIn, useSession } from "@/lib/auth"
 *
 * MIGRATION NOTES:
 * - Migrated from NextAuth v4 to v5
 * - handlers.GET and handlers.POST replaced GET/POST direct exports
 * - auth() replaces getServerSession()
 */

// Re-export all auth utilities from the canonical config
export {
  // Core auth functions (NextAuth v5)
  auth,
  signIn,
  signOut,
  handlers,
  authOptions, // Compatibility export
  getServerSession, // Compatibility alias for auth()
  // Helper functions
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireFarmer,
  hasRole,
  isAdmin,
  isFarmer,
} from "@/lib/auth/config";

// Re-export client-side functions from next-auth/react
export { useSession, SessionProvider } from "next-auth/react";

// Re-export isAuthenticated from index
export { isAuthenticated } from "@/lib/auth/index";

// Export types for convenience
export type { UserRole } from "@/types/core-entities";
