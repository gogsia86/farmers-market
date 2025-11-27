/**
 * ⚙️ FARMER SETTINGS PAGE
 * Divine implementation of farm settings and configuration
 * Features: Farm profile, notifications, account settings, preferences
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  BuildingStorefrontIcon,
  BellIcon,
  UserCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your farm settings and preferences",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FarmerSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch farm details
  const farm = await database.farm.findFirst({
    where: { ownerId: session.user.id },
    include: {
      certifications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!farm) {
    redirect("/onboarding/farm");
  }

  // Fetch user details
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      emailVerified: true,
    },
  });

  // Parse farm location
  const location =
    typeof farm.location === "string"
      ? JSON.parse(farm.location)
      : farm.location;

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="settings-page">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your farm profile and account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav
              className="space-y-1 bg-white rounded-lg shadow-sm p-4"
              data-testid="settings-nav"
            >
              <a
                href="#farm-profile"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md bg-green-50 hover:bg-green-100"
              >
                <BuildingStorefrontIcon className="mr-3 h-5 w-5 text-green-600" />
                Farm Profile
              </a>
              <a
                href="#account"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                Account
              </a>
              <a
                href="#notifications"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <BellIcon className="mr-3 h-5 w-5 text-gray-400" />
                Notifications
              </a>
              <a
                href="#payments"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <CreditCardIcon className="mr-3 h-5 w-5 text-gray-400" />
                Payments
              </a>
              <a
                href="#security"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400" />
                Security
              </a>
              <a
                href="#preferences"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <GlobeAltIcon className="mr-3 h-5 w-5 text-gray-400" />
                Preferences
              </a>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farm Profile Section */}
            <div
              id="farm-profile"
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="farm-profile-section"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Farm Profile
                </h2>
                <button
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                  data-testid="edit-farm-button"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-6">
                {/* Farm Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name
                  </label>
                  <p className="text-sm text-gray-900" data-testid="farm-name">
                    forecasting {farm.name}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p
                    className="text-sm text-gray-900"
                    data-testid="farm-description"
                  >
                    {farm.description || "No description provided"}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p
                    className="text-sm text-gray-900"
                    data-testid="farm-location"
                  >
                    {location?.address || "No address provided"}
                  </p>
                </div>

                {/* Farm Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Size
                    </label>
                    <p className="text-sm text-gray-900">
                      {farm.farmSize
                        ? `${farm.farmSize} acres`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        farm.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : farm.status === "PENDING_VERIFICATION"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                      data-testid="farm-status"
                    >
                      {farm.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {farm.contactEmail || user?.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <p className="text-sm text-gray-900">
                      {farm.contactPhone || user?.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  {farm.certifications.length > 0 ? (
                    <div className="space-y-2">
                      {farm.certifications.slice(0, 3).map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {cert.type.replace("_", " ")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {cert.certifierName}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              cert.status === "VERIFIED"
                                ? "bg-green-100 text-green-700"
                                : cert.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {cert.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No certifications added
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div
              id="account"
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="account-section"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Account Information
                </h2>
                <button
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                  data-testid="edit-account-button"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "Not set"}
                    </p>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                    {user?.emailVerified && (
                      <span className="inline-flex items-center text-xs text-green-600 mt-1">
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-sm text-gray-900">
                      {user?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div
              id="notifications"
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="notifications-section"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New Order Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      Get notified when you receive new orders
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    role="switch"
                    aria-checked="true"
                    data-testid="new-orders-toggle"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order Status Updates
                    </p>
                    <p className="text-xs text-gray-500">
                      Notifications for order status changes
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    role="switch"
                    aria-checked="true"
                    data-testid="status-updates-toggle"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Low Stock Alerts
                    </p>
                    <p className="text-xs text-gray-500">
                      Alert when products are running low
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    role="switch"
                    aria-checked="true"
                    data-testid="low-stock-toggle"
                  >
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Marketing Emails
                    </p>
                    <p className="text-xs text-gray-500">
                      Updates about new features and tips
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    role="switch"
                    aria-checked="false"
                    data-testid="marketing-toggle"
                  >
                    <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div
              id="payments"
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="payments-section"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Settings
                </h2>
                <button
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                  data-testid="manage-payments-button"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Bank Account
                        </p>
                        <p className="text-xs text-gray-500">••••••••1234</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Connected
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                  <CreditCardIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No secondary payment method
                  </p>
                  <button className="mt-2 text-sm font-medium text-green-600 hover:text-green-700">
                    Add payment method
                  </button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div
              id="security"
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="security-section"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Security
              </h2>

              <div className="space-y-4">
                <button
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  data-testid="change-password-button"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Change Password
                    </p>
                    <p className="text-xs text-gray-500">
                      Update your password regularly for security
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
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

                <button
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  data-testid="two-factor-button"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-gray-500">
                      Add an extra layer of security
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
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

            {/* Preferences Section */}
            <div
              id="preferences"
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="preferences-section"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Preferences
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                    data-testid="language-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                    data-testid="timezone-select"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                    data-testid="date-format-select"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div
              className="bg-red-50 rounded-lg border border-red-200 p-6"
              data-testid="danger-zone"
            >
              <h2 className="text-lg font-semibold text-red-900 mb-4">
                Danger Zone
              </h2>
              <div className="space-y-3">
                <button
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-red-300 bg-white hover:bg-red-50"
                  data-testid="deactivate-farm-button"
                >
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

                <button
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-red-300 bg-white hover:bg-red-50"
                  data-testid="delete-account-button"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-900">
                      Delete Account
                    </p>
                    <p className="text-xs text-red-600">
                      Permanently delete your account and all data
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
          </div>
        </div>
      </div>
    </div>
  );
}
