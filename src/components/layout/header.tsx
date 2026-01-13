"use client";

/**
 * 🌾 Main Navigation Header
 * Primary navigation with authentication, cart badge, and user menu
 *
 * Features:
 * - Real authentication integration (NextAuth v5)
 * - Live cart count with CartBadge component
 * - User role-based navigation
 * - Mobile responsive menu
 * - Optimistic UI updates
 * - No hydration mismatch - server session passed via SessionProvider
 */

import { CartBadge } from "@/components/features/cart/cart-badge";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/core-entities";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Store,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Real auth state from NextAuth
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const userId = user?.id;
  const userRole = user?.role as UserRole | undefined;

  // Prevent hydration mismatch by only rendering auth UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Base navigation (available to all)
  const baseNavigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Farms", href: "/farms" },
    { name: "About", href: "/about" },
  ];

  // Role-specific dashboard links
  const getDashboardLink = () => {
    if (!isAuthenticated || !userRole) return "/dashboard";

    switch (userRole) {
      case "ADMIN":
        return "/admin";
      case "FARMER":
        return "/farmer/dashboard";
      case "CONSUMER":
        return "/customer/dashboard";
      default:
        return "/dashboard";
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-green-700">
              Farmers Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {baseNavigation.map((item: any) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-green-700 ${
                  isActive(item.href) ? "text-green-700" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Badge with Mini-Cart - only show when mounted to prevent hydration issues */}
            {mounted && (
              <CartBadge
                userId={userId}
                showMiniCart={true}
                variant="ghost"
                size="sm"
              />
            )}

            {/* User Menu / Auth - prevent hydration mismatch */}
            {!mounted ? (
              // Loading skeleton during hydration
              <div className="hidden md:flex md:items-center md:space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-700"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm font-medium">
                    {user.name || "Account"}
                  </span>
                </Button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        {userRole && (
                          <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            {userRole.toLowerCase()}
                          </span>
                        )}
                      </div>

                      {/* Dashboard Link */}
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>

                      {/* My Orders (Consumer/Farmer) */}
                      {(userRole === "CONSUMER" || userRole === "FARMER") && (
                        <Link
                          href="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                      )}

                      {/* My Farm (Farmer only) */}
                      {userRole === "FARMER" && (
                        <Link
                          href="/farmer/farms"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Store className="mr-2 h-4 w-4" />
                          My Farm
                        </Link>
                      )}

                      {/* Settings */}
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>

                      <hr className="my-1" />

                      {/* Sign Out */}
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-green-700"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button - always show */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - only render when mounted */}
        {mounted && mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="space-y-2">
              {baseNavigation.map((item: any) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  <hr className="my-2" />
                  <Link
                    href={getDashboardLink()}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/orders"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {userRole === "FARMER" && (
                    <Link
                      href="/farmer/farms"
                      className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Farm
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block rounded-lg bg-green-600 px-3 py-2 text-base font-medium text-white hover:bg-green-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
