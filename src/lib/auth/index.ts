import NextAuth from "next-auth";
import { authConfig } from "./config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

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
