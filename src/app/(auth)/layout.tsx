/**
 * AUTH ROUTE GROUP LAYOUT
 * Layout for authentication pages (login, signup, admin-login, etc.)
 */

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
      {/* Header with Logo */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">🌾</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Farmers Market
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} Farmers Market Platform. All rights
          reserved.
        </p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy" className="hover:text-green-600">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-green-600">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-green-600">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
