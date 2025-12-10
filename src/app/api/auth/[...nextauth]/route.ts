/**
 * NEXTAUTH V4 API ROUTE
 * Divine authentication endpoint for Next.js App Router
 *
 * Updated: January 2025
 * Version: NextAuth v4.24.x with App Router support
 */

import { authOptions } from "@/lib/auth/config";
import NextAuth from "next-auth";

/**
 * NextAuth handler for App Router
 * NextAuth v4 returns a single handler function that handles both GET and POST
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Export dynamic config for App Router
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
