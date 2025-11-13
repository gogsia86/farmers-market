import { getServerSession } from "next-auth/next";
import { authConfig } from "./config";

// NextAuth v4 uses getServerSession
export const auth = () => getServerSession(authConfig);

// Export config
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
    session.user.role
  );
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}
