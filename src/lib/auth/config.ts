/**
 * NEXTAUTH V5 (AUTH.JS) CONFIGURATION
 * Divine authentication with agricultural consciousness
 *
 * Updated: January 2025
 * Version: NextAuth v5.0.0-beta
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { database } from "@/lib/database";
import { compare } from "bcryptjs";
import type { UserRole, UserStatus } from "@prisma/client";

/**
 * NextAuth v5 Configuration
 * New API with better App Router support
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
    signIn: "/admin-login",
    error: "/admin-login",
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
            console.error("User not found or no password set");
            return null;
          }

          // Verify password
          const isValidPassword = await compare(
            credentials.password as string,
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

          // Verify admin/farmer role for admin login
          const allowedRoles: UserRole[] = [
            "ADMIN",
            "SUPER_ADMIN",
            "MODERATOR",
            "FARMER",
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
        token.role = user.role as UserRole;
        token.status = user.status as UserStatus;
      }

      // Update session (NextAuth v5 feature)
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
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }

      return session;
    },

    /**
     * Authorized Callback - Control page access
     * Called by middleware to check if user can access route
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Public routes - always allow
      const publicRoutes = [
        "/",
        "/login",
        "/admin-login",
        "/register",
        "/register-farm",
        "/farms",
        "/products",
        "/about",
        "/contact",
      ];

      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isPublicRoute) {
        return true;
      }

      // Protected routes - require authentication
      if (!auth?.user) {
        return false;
      }

      // Admin routes - require admin role
      if (pathname.startsWith("/admin")) {
        const adminRoles: UserRole[] = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];
        return adminRoles.includes(auth.user.role as UserRole);
      }

      // Farmer routes - require farmer or admin role
      if (pathname.startsWith("/farmer") || pathname.startsWith("/dashboard")) {
        const farmerRoles: UserRole[] = [
          "FARMER",
          "ADMIN",
          "SUPER_ADMIN",
          "MODERATOR",
        ];
        return farmerRoles.includes(auth.user.role as UserRole);
      }

      // Default - allow if authenticated
      return true;
    },
  },

  // Events for logging
  events: {
    async signIn({ user, account: _account, profile: _profile }) {
      console.log(`✅ User signed in: ${user.email} (${user.role})`);
    },
    async signOut(params) {
      const token = "token" in params ? params.token : null;
      console.log(`👋 User signed out: ${token?.email}`);
    },
    async createUser({ user }) {
      console.log(`👤 New user created: ${user.email}`);
    },
  },

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === "development",

  // Trust host in production
  trustHost: true,
});

export const { handlers, signIn, signOut } = nextAuthResult;
export const auth: any = nextAuthResult.auth;
export const authConfig = nextAuthResult;

/**
 * Export type-safe auth helper
 * Use this in Server Components and API routes
 */
export const getServerSession: any = auth;

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
  if (!roles.includes(session.user.role as UserRole)) {
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
