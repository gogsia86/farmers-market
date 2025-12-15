/**
 * USER MENU COMPONENT - AUTHENTICATED USER DROPDOWN
 *
 * Divine dropdown menu for authenticated users.
 * Shows user info, navigation, and logout option.
 *
 * Features:
 * - User avatar with initials
 * - Profile link
 * - Dashboard access
 * - Settings
 * - Logout
 */

"use client";

import { Menu, Transition } from "@headlessui/react";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth";
import Link from "next/link";
import { Fragment } from "react";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-agricultural-600 transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const { user } = session;
  const initials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 rounded-full bg-agricultural-600 flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.name?.split(" ")[0] || "User"}
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* User Info */}
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard"
                  className={`${
                    active
                      ? "bg-agricultural-50 text-agricultural-700"
                      : "text-gray-700"
                  } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`${
                    active
                      ? "bg-agricultural-50 text-agricultural-700"
                      : "text-gray-700"
                  } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/orders"
                  className={`${
                    active
                      ? "bg-agricultural-50 text-agricultural-700"
                      : "text-gray-700"
                  } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  My Orders
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/favorites"
                  className={`${
                    active
                      ? "bg-agricultural-50 text-agricultural-700"
                      : "text-gray-700"
                  } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/settings"
                  className={`${
                    active
                      ? "bg-agricultural-50 text-agricultural-700"
                      : "text-gray-700"
                  } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>

          {/* Sign Out */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? "bg-red-50 text-red-700" : "text-gray-700"
                  } group flex w-full items-center gap-3 px-4 py-2 text-sm`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
