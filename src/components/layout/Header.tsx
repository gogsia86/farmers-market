/**
 * 🧠 DIVINE PATTERN: Main Navigation Header Component
 * 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * 🌾 Domain: Platform Navigation
 * ⚡ Performance: Client-side interactivity for mobile menu
 */

"use client";

import { SimpleLanguageButton } from "@/components/i18n";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  const handleSearchClick = () => {
    // TODO: Implement search functionality
    console.log("Search clicked");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-agricultural-200 py-4 lg:border-none">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-agricultural-700">
                🌾 Farmers Market
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="ml-10 hidden space-x-8 lg:flex">
            <Link
              href="/"
              className="text-base font-medium text-gray-700 hover:text-agricultural-700 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/farms"
              data-testid="browse-farms-link"
              className="text-base font-medium text-gray-700 hover:text-agricultural-700 transition-colors"
            >
              Farms
            </Link>
            <Link
              href="/products"
              className="text-base font-medium text-gray-700 hover:text-agricultural-700 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-base font-medium text-gray-700 hover:text-agricultural-700 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Right side icons */}
          <div className="ml-10 flex items-center space-x-4">
            <button
              onClick={handleSearchClick}
              className="p-2 text-gray-700 hover:text-agricultural-700 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language Selector - Always visible */}
            <SimpleLanguageButton />

            <Link
              href="/cart"
              data-testid="cart-button"
              className="p-2 text-gray-700 hover:text-agricultural-700 transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -top-1 -right-1 bg-agricultural-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className="p-2 text-gray-700 hover:text-agricultural-700 transition-colors"
              aria-label="User account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-button"
              className="lg:hidden p-2 text-gray-700 hover:text-agricultural-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div data-testid="mobile-menu" className="lg:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agricultural-700 hover:bg-agricultural-50 rounded-md transition-colors"
            >
              Home
            </Link>
            <Link
              href="/farms"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agricultural-700 hover:bg-agricultural-50 rounded-md transition-colors"
            >
              Farms
            </Link>
            <Link
              href="/products"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agricultural-700 hover:bg-agricultural-50 rounded-md transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agricultural-700 hover:bg-agricultural-50 rounded-md transition-colors"
            >
              About
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
