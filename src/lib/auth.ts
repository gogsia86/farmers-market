/**
 * DIVINE AUTH UTILITIES - NEXTAUTH V5
 * Quantum authentication with agricultural consciousness
 *
 * Updated: January 2025
 * Version: NextAuth v5.0.0-beta
 *
 * This file re-exports all authentication utilities from the config
 * for easy importing throughout the application.
 */

// Re-export NextAuth v5 core functions
export {
  auth,
  signIn,
  signOut,
  handlers,
  getServerSession,
} from "@/lib/auth/config";

// Re-export helper functions
export {
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireFarmer,
  hasRole,
  isAdmin,
  isFarmer,
} from "@/lib/auth/config";

// Export types for use in components
// Note: Commenting out to avoid conflicts with Prisma User type
// export type { User, Session } from "next-auth";

/**
 * USAGE EXAMPLES:
 *
 * 1. In Server Components:
 * ```typescript
 * import { auth } from "@/lib/auth";
 *
 * export default async function Page() {
 *   const session = await auth();
 *   if (!session) {
 *     redirect("/login");
 *   }
 *   return <div>Hello {session.user.name}</div>;
 * }
 * ```
 *
 * 2. In API Routes:
 * ```typescript
 * import { requireAuth } from "@/lib/auth";
 *
 * export async function GET() {
 *   const user = await requireAuth();
 *   // User is guaranteed to exist here
 *   return NextResponse.json({ user });
 * }
 * ```
 *
 * 3. Require Specific Role:
 * ```typescript
 * import { requireAdmin } from "@/lib/auth";
 *
 * export async function POST() {
 *   const user = await requireAdmin();
 *   // User is guaranteed to be admin
 *   return NextResponse.json({ message: "Admin action" });
 * }
 * ```
 *
 * 4. Check Role Without Throwing:
 * ```typescript
 * import { hasRole } from "@/lib/auth";
 *
 * export default async function Page() {
 *   const isAdminUser = await hasRole(["ADMIN", "SUPER_ADMIN"]);
 *   return (
 *     <div>
 *       {isAdminUser && <AdminPanel />}
 *       <RegularContent />
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Legacy compatibility interface
 * Maintains backward compatibility with old auth.ts structure
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "FARMER" | "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
  status?: "ACTIVE" | "SUSPENDED" | "DELETED";
}

export interface Session {
  user: User;
  expires: string;
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { auth } = await import("@/lib/auth/config");
  const session = await auth();
  return !!session?.user;
}
