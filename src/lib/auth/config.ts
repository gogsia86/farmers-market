/**
 * 🔐 NEXTAUTH V4 CONFIGURATION
 * Divine authentication with agricultural consciousness
 *
 * CANONICAL AUTH IMPLEMENTATION
 * This is the single source of truth for authentication configuration.
 *
 * Updated: January 2025
 * Version: NextAuth v4.24.x
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { database } from "@/lib/database";
import { compare } from "bcryptjs";
import type { UserRole, UserStatus } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

/**
 * NextAuth v4 Options Configuration
 */
export const authOptions: NextAuthOptions = {
  // Prisma adapter for database sessions
  adapter: PrismaAdapter(database) as Adapter,

  // JWT strategy for stateless sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          // Find user by email
          const user = await database.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true,
            },
          });

          // User not found or no password set
          if (!user || !user.password) {
            console.error("User not found or no password set");
            return null;
          }

          // Verify password
          const isValidPassword = await compare(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            console.error("Invalid password");
            return null;
          }

          // Check if user is active
          if (user.status !== "ACTIVE") {
            console.error("User account is not active:", user.status);
            return null;
          }

          // Allow all active users to login (role-based access control handled by middleware)
          const allowedRoles: UserRole[] = [
            "ADMIN",
            "SUPER_ADMIN",
            "MODERATOR",
            "FARMER",
            "CONSUMER",
          ];
          if (!allowedRoles.includes(user.role)) {
            console.error("User does not have required role:", user.role);
            return null;
          }

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.email,
            role: user.role,
            status: user.status,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  // Callbacks for session and JWT
  callbacks: {
    /**
     * JWT Callback - Called when JWT is created or updated
     * Add custom fields to the token
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role as UserRole;
        token.status = (user as any).status as UserStatus;
      }

      // Update session
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },

    /**
     * Session Callback - Called when session is checked
     * Add custom fields to the session
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as UserRole;
        (session.user as any).status = token.status as UserStatus;
        session.user.name =
          (token.name as string) || (token.email as string) || "User";
        session.user.email = token.email as string;
      }

      return session;
    },
  },

  // Events for logging
  events: {
    async signIn({ user }) {
      console.log(`✅ User signed in: ${user.email} (${(user as any).role})`);
    },
    async signOut({ token }) {
      console.log(`👋 User signed out: ${token?.email}`);
    },
    async createUser({ user }) {
      console.log(`👤 New user created: ${user.email}`);
    },
  },

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * NextAuth handler for App Router
 * Export GET and POST handlers
 */
const handler = NextAuth(authOptions);

export const handlers = {
  GET: handler,
  POST: handler,
};

// Export individual handlers for route.ts
export { handler as GET, handler as POST };

// Default export for convenience
export default handler;

/**
 * Server-side auth helper
 * Import getServerSession from next-auth for server components
 */
import { getServerSession as nextAuthGetServerSession } from "next-auth";

export async function auth() {
  return nextAuthGetServerSession(authOptions);
}

export const getServerSession = auth;

/**
 * Helper function to get current user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Helper function to require authentication
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session.user;
}

/**
 * Helper function to require specific role
 * Throws error if user doesn't have required role
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
): Promise<any> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes((session.user as any).role as UserRole)) {
    throw new Error(
      `Unauthorized: Required role ${roles.join(" or ")}, but user has ${(session.user as any).role}`,
    );
  }

  return session.user;
}

/**
 * Helper function to require admin role
 * Throws error if user is not an admin
 */
export async function requireAdmin() {
  return requireRole(["ADMIN", "SUPER_ADMIN", "MODERATOR"]);
}

/**
 * Helper function to require farmer role
 * Throws error if user is not a farmer or admin
 */
export async function requireFarmer() {
  return requireRole(["FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"]);
}

/**
 * Helper function to check if user has role
 * Returns boolean instead of throwing
 */
export async function hasRole(
  allowedRoles: UserRole | UserRole[],
): Promise<boolean> {
  try {
    await requireRole(allowedRoles);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(["ADMIN", "SUPER_ADMIN", "MODERATOR"]);
}

/**
 * Helper function to check if user is farmer
 */
export async function isFarmer(): Promise<boolean> {
  return hasRole(["FARMER", "ADMIN", "SUPER_ADMIN", "MODERATOR"]);
}

// Re-export signIn and signOut from next-auth/react for client components
export { signIn, signOut } from "@/lib/auth";

// Alias for compatibility with code expecting authConfig
export const authConfig = authOptions;
