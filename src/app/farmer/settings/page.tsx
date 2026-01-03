/**
 * 🚜 FARMER SETTINGS PAGE
 * Divine implementation of comprehensive farm settings and configuration
 * Sprint 5: Complete settings management with business hours, delivery, payments
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { settingsService } from "@/lib/services/settings.service";
import { FarmSettingsClient } from "@/components/features/settings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DisplaySettings } from "@/components/settings/DisplaySettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import {
  BuildingStorefrontIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Settings | Farmers Market Platform",
  description: "Manage your farm settings and preferences",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Farmer Settings Page - Server Component
 * Handles authentication, data fetching, and renders settings UI
 */
export default async function FarmerSettingsPage() {
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  // Fetch farm details
  const farm = await database.farm.findFirst({
    where: { ownerId: session.user.id },
    include: {
      certifications: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!farm) {
    redirect("/register-farm");
  }

  // Fetch user details
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      emailVerified: true,
    },
  });

  // Fetch user settings (with fallback)
  const userSettings = await settingsService.getUserSettings(session.user.id);
  if (!userSettings) {
    throw new Error("Failed to load user settings");
  }

  // Fetch farm settings (with fallback)
  const farmSettings = await settingsService.getFarmSettings(farm.id);
  if (!farmSettings) {
    throw new Error("Failed to load farm settings");
  }

  // Parse farm location
  const location =
    typeof farm.location === "string"
      ? JSON.parse(farm.location)
      : farm.location;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      className="min-h-screen bg-gray-50 py-8"
      data-testid="farmer-settings-page"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your farm profile, business hours, delivery zones, and
            account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav
              className="space-y-1 bg-white rounded-lg shadow-sm p-4 sticky top-4"
              data-testid="settings-nav"
            >
              <a
                href="#farm-settings"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
              >
                <BuildingStorefrontIcon className="mr-3 h-5 w-5 text-green-600" />
                Farm Settings
              </a>
              <a
                href="#account-settings"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                Account Settings
              </a>
              <a
                href="#notifications"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <BellIcon className="mr-3 h-5 w-5 text-gray-400" />
                Notifications
              </a>
              <a
                href="#preferences"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                Preferences
              </a>
            </nav>

            {/* Farm Info Card */}
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900">
                  {farm.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {location?.address || "No location"}
                </p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      farm.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : farm.status === "PENDING" ||
                            farm.status === "SUSPENDED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {farm.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Farm Settings Section */}
            <section
              id="farm-settings"
              className="scroll-mt-8"
              data-testid="farm-settings-section"
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Farm Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure your farm's business hours, delivery zones,
                    payment methods, and policies
                  </p>
                </div>

                <FarmSettingsClient
                  settings={farmSettings}
                  farmId={farm.id}
                  farmLocation={location}
                  onSaveSuccess={() => {
                    // Refresh handled by client component
                  }}
                />
              </div>
            </section>

            {/* Account Settings Section */}
            <section
              id="account-settings"
              className="scroll-mt-8"
              data-testid="account-settings-section"
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Account Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your personal account information
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Profile Info */}
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || "User"}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {user?.name || "Not set"}
                      </h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {user?.emailVerified && (
                        <span className="inline-flex items-center text-xs text-green-600 mt-2">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Email Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <p className="text-sm text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <p className="text-sm text-gray-900">
                        {user?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Edit Profile
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Change Password
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Two-Factor Auth
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section
              id="notifications"
              className="scroll-mt-8"
              data-testid="notifications-section"
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Notification Preferences
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Control how and when you receive notifications
                  </p>
                </div>

                <NotificationSettings
                  preferences={userSettings.notifications}
                  onChange={(newSettings) => {
                    // Handle notification settings update
                    fetch(`/api/settings/user/${session.user.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ notifications: newSettings }),
                    });
                  }}
                />
              </div>
            </section>

            {/* Preferences Section */}
            <section
              id="preferences"
              className="scroll-mt-8"
              data-testid="preferences-section"
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Display & Privacy Preferences
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize your display settings and privacy options
                  </p>
                </div>

                <div className="space-y-8">
                  <DisplaySettings
                    preferences={userSettings.display}
                    onChange={(newSettings) => {
                      // Handle display settings update
                      fetch(`/api/settings/user/${session.user.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ display: newSettings }),
                      });
                    }}
                  />

                  <div className="border-t border-gray-200 pt-6">
                    <PrivacySettings
                      preferences={userSettings.privacy}
                      onChange={(newSettings) => {
                        // Handle privacy settings update
                        fetch(`/api/settings/user/${session.user.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ privacy: newSettings }),
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="scroll-mt-8" data-testid="danger-zone">
              <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-700 mb-4">
                  These actions are permanent and cannot be undone. Please
                  proceed with caution.
                </p>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 rounded-lg border border-red-300 bg-white hover:bg-red-50 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-900">
                        Deactivate Farm
                      </p>
                      <p className="text-xs text-red-600">
                        Temporarily disable your farm from the marketplace
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 rounded-lg border border-red-300 bg-white hover:bg-red-50 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-900">
                        Delete Account
                      </p>
                      <p className="text-xs text-red-600">
                        Permanently delete your account and all farm data
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
