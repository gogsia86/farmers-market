import { database } from "@/lib/database/index";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin-login",
    error: "/admin-login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAdminLoginPage = nextUrl.pathname === "/admin-login";

      // Allow access to login page
      if (isAdminLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // Protect admin routes
      if (isAdminRoute) {
        if (!isLoggedIn) {
          return false;
        }
        const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(
          auth.user.role as string
        );
        if (!isAdmin) {
          return Response.redirect(
            new URL("/?error=admin_access_required", nextUrl)
          );
        }
        return true;
      }

      return true;
    },
  },
  adapter: PrismaAdapter(database),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await database.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValidPassword = await compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Verify user has admin role
          const isAdmin = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(
            user.role
          );
          if (!isAdmin) {
            return null;
          }

          return {
            id: user.id,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.email,
            email: user.email,
            role: user.role,
            status: user.status || "ACTIVE",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
};
