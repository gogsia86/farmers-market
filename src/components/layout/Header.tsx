/**
 * SITE HEADER - MAIN NAVIGATION WITH CART
 *
 * Divine header component with:
 * - Logo and branding
 * - Navigation links
 * - Cart badge with drawer
 * - User menu (future)
 */

"use client";

import UserMenu from "@/components/auth/UserMenu";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import SearchBar from "@/components/search/SearchBar";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold text-agricultural-600">
                Farmers Market
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-2xl">
              <SearchBar />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
              <Link
                href="/products"
                className="text-gray-700 hover:text-agricultural-600 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/farms"
                className="text-gray-700 hover:text-agricultural-600 transition-colors"
              >
                Farms
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-agricultural-600 transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Right side - Cart & User */}
            <div className="flex items-center gap-4">
              {/* Cart Badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-agricultural-600 transition-colors"
                aria-label={`Shopping cart with ${cart.itemCount} items`}
              >
                <ShoppingCart className="h-6 w-6" />

                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-agricultural-600 text-xs font-bold text-white">
                    {cart.itemCount > 99 ? "99+" : cart.itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
