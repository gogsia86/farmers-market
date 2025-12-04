/**
 * 🌟 Dashboard Layout Component
 * Farmers Market Platform - Monitoring Dashboard
 *
 * Provides the main layout structure for the monitoring dashboard
 * including navigation, header, and content area.
 */

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================================
// TYPES
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "📊",
  },
  {
    label: "Workflows",
    href: "/dashboard/workflows",
    icon: "⚙️",
  },
  {
    label: "Alerts",
    href: "/dashboard/alerts",
    icon: "🔔",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: "📈",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "⚙️",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
              >
                <span className="text-2xl">🌾</span>
                <span>Farmers Market</span>
              </Link>
              <div className="hidden md:block">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  Monitoring
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Status Indicator */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Live
                </span>
              </div>
              <button
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Refresh dashboard"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex overflow-x-auto px-4 py-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-shrink-0 items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-900"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Farmers Market Platform</span> —
              Monitoring Dashboard
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="/docs" className="hover:text-gray-900 transition-colors">
                Documentation
              </a>
              <a
                href="/api/health"
                className="hover:text-gray-900 transition-colors"
              >
                API Health
              </a>
              <a
                href="/support"
                className="hover:text-gray-900 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
