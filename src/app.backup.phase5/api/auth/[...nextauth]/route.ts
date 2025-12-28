/**
 * NEXTAUTH V5 (AUTH.JS) API ROUTE
 * Divine authentication endpoint for Next.js App Router
 *
 * Updated: January 2025
 * Version: NextAuth v5.0.0-beta.30 (Auth.js)
 *
 * MIGRATION NOTES:
 * - NextAuth v5 uses a simpler export pattern
 * - handlers are exported directly from the config
 * - No need to call NextAuth() again here
 */

import { handlers } from "@/lib/auth/config";

// Export the handlers directly
export const { GET, POST } = handlers;

// Export dynamic config for App Router
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
