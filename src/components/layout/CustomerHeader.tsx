/**
 * 🛒 CUSTOMER HEADER COMPONENT
 * Authenticated customer navigation with cart, notifications, and user menu
 *
 * Features:
 * - Shopping cart with item count
 * - Notifications bell with unread count
 * - User profile menu
 * - Search functionality
 * - Responsive mobile navigation
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

"use client";

import { Bell, Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";

interface CustomerHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function CustomerHeader({ user }: CustomerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  // Get cart count from store
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSearchClick = () => {
    router.push("/search");
  };

  const navigation = [
    { name: "Marketplace", href: "/marketplace/products" },
    { name: "Farms", href: "/farms" },
    { name: "Products", href: "/products" },
    { name: "My Orders", href: "/orders" },
  ];

  const userMenuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Account", href: "/account" },
    { name: "Orders", href: "/orders" },
    { name: "Favorites", href: "/dashboard/favorites" },
    { name: "Addresses", href: "/dashboard/addresses" },
    { name: "Reviews", href: "/dashboard/reviews" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold text-gray-900">
                Farmers Market
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="p-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search products"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Favorites */}
            <Link
              href="/dashboard/favorites"
              className="hidden sm:flex p-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Favorites"
              title="Favorites"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Notifications */}
            <button
              className="p-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge - replace with real count */}
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="p-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Shopping cart"
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden sm:block relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="User menu"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-2">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 py-2">
                      <Link
                        href="/api/auth/signout"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-gray-50 rounded-lg">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.name || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 mb-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu Links */}
            <div className="space-y-1 border-t border-gray-200 pt-4">
              {userMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <Link
                href="/api/auth/signout"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
