import { requireAdmin } from "@/lib/auth";
import {
    ArrowRightStartOnRectangleIcon,
    BanknotesIcon,
    Bars3Icon,
    BellIcon,
    BuildingStorefrontIcon,
    ChartBarIcon,
    CogIcon,
    ShoppingBagIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Force dynamic rendering for all admin pages
export const dynamic = "force-dynamic";

/**
 * Modern Horizontal Admin Layout
 * Clean, compact top navigation design
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdmin();

  // Icon mapping for serialization safety
  const iconMap = {
    ChartBarIcon,
    UserGroupIcon,
    BuildingStorefrontIcon,
    ShoppingBagIcon,
    BanknotesIcon,
    CogIcon,
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", iconName: "ChartBarIcon" as const },
    { name: "Users", href: "/admin/users", iconName: "UserGroupIcon" as const },
    { name: "Farms", href: "/admin/farms", iconName: "BuildingStorefrontIcon" as const },
    { name: "Products", href: "/admin/products", iconName: "ShoppingBagIcon" as const },
    { name: "Orders", href: "/admin/orders", iconName: "ShoppingBagIcon" as const },
    { name: "Financial", href: "/admin/financial", iconName: "BanknotesIcon" as const },
    { name: "Settings", href: "/admin/settings", iconName: "CogIcon" as const },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link
                href="/admin"
                className="flex items-center space-x-2 flex-shrink-0"
              >
                <span className="text-2xl">🌾</span>
                <span className="text-lg font-bold text-gray-900">
                  Farmers Market Admin
                </span>
              </Link>

              {/* Horizontal Menu */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = iconMap[item.iconName];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Status, Notifications, Profile */}
            <div className="flex items-center space-x-3">
              {/* System Status */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-800">
                  Online
                </span>
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Notifications"
                aria-label="View notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {session.user.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">{session.user.role}</p>
                  </div>
                </div>

                <button
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  title="Logout"
                >
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Open menu"
                aria-label="Open navigation menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
