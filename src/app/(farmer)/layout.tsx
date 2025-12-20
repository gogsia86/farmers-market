/**
 * 🚜 FARMER LAYOUT - Divine Agricultural Interface
 * Layout wrapper for all farmer routes
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 *
 * Functional Requirements: FR-003 (Farmer Management)
 *
 * Note: Authentication and authorization are handled by middleware.
 * This layout assumes the user is authenticated and has FARMER role.
 */

import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default async function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session (middleware ensures user is authenticated and has FARMER role)
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/farmer/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold text-agricultural-600">
                Farmers Market
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {/* Public Pages */}
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-home"
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className="text-sm text-gray-600 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-marketplace"
              >
                Marketplace
              </Link>
              <Link
                href="/farms"
                className="text-sm text-gray-600 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-farms"
              >
                Farms
              </Link>
              <Link
                href="/products"
                className="text-sm text-gray-600 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-products"
              >
                Products
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* Farmer Dashboard Links */}
              <Link
                href="/farmer/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-dashboard"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/farmer/products"
                className="flex items-center gap-2 text-gray-700 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-products"
              >
                <CubeIcon className="h-5 w-5" />
                <span>Products</span>
              </Link>
              <Link
                href="/farmer/orders"
                className="flex items-center gap-2 text-gray-700 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-orders"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              <Link
                href="/farmer/analytics"
                className="flex items-center gap-2 text-gray-700 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-analytics"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
              <Link
                href="/farmer/settings"
                className="flex items-center gap-2 text-gray-700 hover:text-agricultural-600 transition-colors"
                data-testid="nav-link-settings"
              >
                <CogIcon className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700" data-testid="user-name">
                {session?.user?.name || session?.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                data-testid="logout-button"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-around py-2 overflow-x-auto">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-2 py-2 text-gray-600 hover:text-agricultural-600 flex-shrink-0"
          >
            <GlobeAltIcon className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/marketplace"
            className="flex flex-col items-center gap-1 px-2 py-2 text-gray-600 hover:text-agricultural-600 flex-shrink-0"
          >
            <BuildingStorefrontIcon className="h-5 w-5" />
            <span className="text-xs">Market</span>
          </Link>
          <div className="h-8 w-px bg-gray-300 mx-1"></div>
          <Link
            href="/farmer/dashboard"
            className="flex flex-col items-center gap-1 px-2 py-2 text-gray-700 hover:text-agricultural-600 flex-shrink-0"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link
            href="/farmer/products"
            className="flex flex-col items-center gap-1 px-2 py-2 text-gray-700 hover:text-agricultural-600 flex-shrink-0"
          >
            <CubeIcon className="h-6 w-6" />
            <span className="text-xs">Products</span>
          </Link>
          <Link
            href="/farmer/orders"
            className="flex flex-col items-center gap-1 px-2 py-2 text-gray-700 hover:text-agricultural-600 flex-shrink-0"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link
            href="/farmer/analytics"
            className="flex flex-col items-center gap-1 px-2 py-2 text-gray-700 hover:text-agricultural-600 flex-shrink-0"
          >
            <ChartBarIcon className="h-6 w-6" />
            <span className="text-xs">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Farmers Market Platform. All rights reserved.</p>
            <p className="mt-1">Divine Agricultural E-Commerce 🌾</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
