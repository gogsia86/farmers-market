/**
 * 🔐 AUTHENTICATION UTILITIES
 * NextAuth v4 wrapper functions
 *
 * This file re-exports all authentication utilities from the config
 * for easy importing throughout the application.
 *
 * CANONICAL IMPORT: import { auth, requireAuth } from "@/lib/auth"
 */

// Re-export everything from config directly (avoiding circular imports)
export {
  auth,
  authOptions,
  handlers,
  GET,
  POST,
  getServerSession,
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireFarmer,
  hasRole,
  isAdmin,
  isFarmer,
  signIn,
  signOut,
} from "./config";

// Export types for convenience
export type { UserRole } from "@/types/core-entities";

/**
 * Helper to check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { auth } = await import("./config");
  const session = await auth();
  return !!session?.user;
}

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
