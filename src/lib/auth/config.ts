/**
 * 🔐 NEXTAUTH V5 (AUTH.JS) CONFIGURATION
 * Divine authentication with agricultural consciousness
 *
 * CANONICAL AUTH IMPLEMENTATION
 * This is the single source of truth for authentication configuration.
 *
 * Updated: January 2025
 * Version: NextAuth v5.0.0-beta.30 (Auth.js)
 *
 * MIGRATION NOTES:
 * - Migrated from NextAuth v4 to v5
 * - Uses new auth() export pattern
 * - Simplified configuration structure
 * - Improved type safety
 */

import { database } from "@/lib/database";
import { authLogger } from "@/lib/utils/logger";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole, UserStatus } from "@prisma/client";
import { compare } from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Extend NextAuth types to include our custom fields
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      image?: string | null;
    };
  }

  interface User {
    role: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

/**
 * NextAuth v5 Configuration
 */
const nextAuthResult = NextAuth({
  // Prisma adapter for database sessions
  adapter: PrismaAdapter(database) as any,

  // JWT strategy for stateless sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Authentication providers
  providers: [
    Credentials({
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
      async authorize(credentials: any) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          authLogger.warn("Missing credentials in login attempt");
          return null;
        }

        try {
          // Find user by email
          const user = await database.user.findUnique({
            where: { email: credentials.email as string },
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
            authLogger.warn("User not found or no password set", {
              email: credentials.email as string,
            });
            return null;
          }

          // Verify password
          const isValidPassword = await compare(
            credentials.password as string,
            user.password,
          );

          if (!isValidPassword) {
            authLogger.warn("Invalid password attempt", {
              email: credentials.email as string,
            });
            return null;
          }

          // Check if user is active
          if (user.status !== "ACTIVE") {
            authLogger.warn("User account is not active", {
              email: user.email,
              status: user.status,
            });
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
            authLogger.warn("User does not have required role", {
              email: user.email,
              role: user.role,
            });
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
          authLogger.error(
            "Authorization error",
            error instanceof Error ? error : new Error(String(error)),
          );
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
    async jwt({ token, user, trigger, session }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
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
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.name =
          (token.name as string) || (token.email as string) || "User";
        session.user.email = token.email as string;
      }

      return session;
    },

    /**
     * Authorized Callback - Simplified (middleware handles most auth)
     * Always return true to prevent NextAuth from redirecting
     * Actual auth checks are done in middleware for better control
     */
    authorized() {
      // Always return true - middleware handles authentication
      return true;
    },

    /**
     * Redirect Callback - Ensures proper redirect URL for sign in/out
     * Forces production domain to prevent deployment URL issues
     */
    async redirect({ url, baseUrl }: any) {
      // Use production domain from env or fallback
      const productionUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://farmers-market-platform.vercel.app";

      // If url starts with '/', prepend production domain
      if (url.startsWith("/")) {
        return `${productionUrl}${url}`;
      }

      // If url is relative to baseUrl, replace with production
      try {
        const urlObj = new URL(url);
        const prodObj = new URL(productionUrl);

        // If same hostname as production, allow it
        if (urlObj.hostname === prodObj.hostname) {
          return url;
        }

        // Otherwise, redirect to production home
        return productionUrl;
      } catch {
        // Invalid URL, default to production home
        return productionUrl;
      }
    },
  },

  // Events for logging
  events: {
    async signIn({ user }: any) {
      authLogger.info("User signed in", {
        email: user.email,
        role: user.role,
      });
    },
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      authLogger.info("User signed out", {
        email: token?.email,
      });
    },
    async createUser({ user }) {
      authLogger.info("New user created", {
        email: user.email,
      });
    },
  },

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Trust host in production
  trustHost: true,
});

/**
 * Export auth functions with explicit types to avoid inference issues
 */
export const handlers = nextAuthResult.handlers;
export const auth: any = nextAuthResult.auth;
export const signIn: any = nextAuthResult.signIn;
export const signOut: any = nextAuthResult.signOut;

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
  if (!roles.includes(session.user.role)) {
    throw new Error(
      `Unauthorized: Required role ${roles.join(" or ")}, but user has ${session.user.role}`,
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

/**
 * V4 Compatibility Exports
 * These provide backward compatibility with v4 code
 */
export const authOptions: any = {
  adapter: PrismaAdapter(database),
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {},
  events: {},
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// Alias for compatibility
export const authConfig: any = authOptions;

// Compatibility export for getServerSession (v4 pattern)
export const getServerSession: typeof auth = auth;

// NOTE: Do NOT re-export signIn/signOut here as it causes circular dependencies
// Use @/lib/auth/client for client-side auth utilities
// Use @/lib/auth/server for server-side auth utilities
