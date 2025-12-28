/**
 * 🔒 MONITORING ROUTES PROTECTION LAYOUT
 * Restricts access to monitoring routes to admin users only
 * Provides real-time platform monitoring and diagnostics
 */

import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Block in production unless explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_MONITORING !== "true"
  ) {
    notFound();
  }

  // Require authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/monitoring");
  }

  // Admin only access
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Admin Monitoring Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-blue-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Platform Monitoring
                </h1>
                <p className="text-xs text-blue-300">
                  Real-time system diagnostics & analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Live
              </span>
              <span className="text-xs text-blue-300">
                Admin: {session.user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Content */}
      <div className="container mx-auto px-4 py-6">{children}</div>

      {/* Footer Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              System Online
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">
              {process.env.NODE_ENV === "production"
                ? "Production"
                : "Development"}
            </span>
          </div>
          <div className="text-gray-400">
            🔒 Protected Route • Admin Access Only
          </div>
        </div>
      </div>
    </div>
  );
}
