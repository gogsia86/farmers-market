import { database } from "@/lib/database/index";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: "/admin-login",
    error: "/admin-login",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
      }
      return session;
    },
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User & { role?: UserRole };
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(database) as any,
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

// Export a helper to get auth from next-auth
import NextAuth from "next-auth";
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
