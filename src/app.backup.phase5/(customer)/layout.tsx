/**
 * 🛒 CUSTOMER LAYOUT - Divine Customer Experience
 * Layout wrapper for all customer/consumer routes
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 *
 * Functional Requirements: FR-002 (Customer Management)
 *
 * Note: Authentication and authorization are handled by middleware.
 * This layout assumes the user is authenticated.
 */

import { auth } from "@/lib/auth";
import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { Footer } from "@/components/layout/Footer";

export default async function CustomerLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  // Get session (middleware ensures user is authenticated)
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Customer Header with Navigation */}
      <CustomerHeader user={session?.user} />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
