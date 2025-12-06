/**
 * 🔒 DEMO ROUTES PROTECTION LAYOUT
 * Restricts access to demo routes to admin users only
 * Blocks access in production environment
 */

import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function DemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Block in production unless explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEMOS !== "true"
  ) {
    notFound();
  }

  // Require authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/demos");
  }

  // Admin only access
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      <div className="bg-yellow-100 border-b-4 border-yellow-500 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-700"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ DEMO ENVIRONMENT - Admin Only Access
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                This section is for testing and demonstration purposes only.
                Changes made here may not persist.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-8">{children}</div>

      {/* Footer Notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 px-4 py-2">
        <div className="container mx-auto">
          <p className="text-xs text-yellow-800 text-center">
            🔒 Protected Route • Admin Access Only •{" "}
            {process.env.NODE_ENV === "production"
              ? "Production Mode"
              : "Development Mode"}
          </p>
        </div>
      </div>
    </div>
  );
}
