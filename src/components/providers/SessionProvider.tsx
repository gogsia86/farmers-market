/**
 * 🔐 CLIENT-SIDE SESSION PROVIDER
 * Divine authentication provider with agricultural consciousness
 *
 * This is a client-side wrapper for NextAuth v5's SessionProvider.
 * It must be a client component to work with React hooks.
 *
 * Version: NextAuth v5.0.0-beta.30 (Auth.js)
 * Updated: January 2025
 */

"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Client-side SessionProvider wrapper
 *
 * Usage in server components:
 * ```tsx
 * import { SessionProvider } from "@/components/providers/SessionProvider";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>{children}</SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      session={session}
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
