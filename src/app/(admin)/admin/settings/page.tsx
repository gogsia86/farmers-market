import { requireAdmin } from "@/lib/auth";
import {
  BellIcon,
  BuildingStorefrontIcon,
  CogIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

/**
 * Divine System Configuration - Platform Consciousness Control Portal
 * Manage agricultural marketplace divine settings and quantum parameters
 */
export default async function AdminSettingsPage() {
  await requireAdmin(); // Ensure divine settings access

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                Platform Consciousness Settings
              </h1>
              <p className="mt-1 text-sm text-agricultural-600">
                Configure divine parameters and agricultural quantum marketplace
                settings
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Settings Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Platform Configuration */}
            <div className="bg-white rounded-lg shadow border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <div className="flex items-center">
                  <CogIcon className="h-6 w-6 text-agricultural-600 mr-3" />
                  <h3 className="text-lg font-medium text-agricultural-900">
                    Platform Configuration
                  </h3>
                </div>
                <p className="mt-1 text-sm text-agricultural-500">
                  Core platform settings and operational parameters
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Farmers Market"
                    className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="15"
                    min="0"
                    max="100"
                    step="0.1"
                    className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                  />
                  <p className="mt-1 text-sm text-agricultural-500">
                    Commission taken from each order
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Maximum Delivery Radius (miles)
                  </label>
                  <input
                    type="number"
                    defaultValue="50"
                    min="1"
                    max="200"
                    className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Allow new farm registrations
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Require farm verification before activation
                  </label>
                </div>
              </div>
            </div>

            {/* User Management Settings */}
            <div className="bg-white rounded-lg shadow border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <div className="flex items-center">
                  <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-medium text-agricultural-900">
                    User Management
                  </h3>
                </div>
                <p className="mt-1 text-sm text-agricultural-500">
                  User registration and account management settings
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Require email verification for new accounts
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Require admin approval for farmer accounts
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Password Requirements
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Minimum 8 characters
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Require special characters
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Two-factor authentication required
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    min="5"
                    max="1440"
                    className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <div className="flex items-center">
                  <BellIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-lg font-medium text-agricultural-900">
                    Notification Management
                  </h3>
                </div>
                <p className="mt-1 text-sm text-agricultural-500">
                  Configure system notifications and alerts
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-3">
                    Email Notifications
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Order confirmations
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Payment notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Marketing emails
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-agricultural-700">
                        Admin alerts
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    SMTP Configuration
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="SMTP Host"
                      className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                    <input
                      type="number"
                      placeholder="Port (587)"
                      className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                    <input
                      type="email"
                      placeholder="From Email"
                      className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-medium text-agricultural-900">
                    Security & API Configuration
                  </h3>
                </div>
                <p className="mt-1 text-sm text-agricultural-500">
                  Security settings and API integrations
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Stripe Configuration
                  </label>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Stripe Publishable Key"
                      className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                    <input
                      type="password"
                      placeholder="Stripe Secret Key"
                      className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                    <input
                      type="text"
                      placeholder="Webhook Endpoint Secret"
                      className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Rate Limiting
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-agricultural-500 mb-1">
                        API Requests per minute
                      </label>
                      <input
                        type="number"
                        defaultValue="100"
                        className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-agricultural-500 mb-1">
                        Login attempts per hour
                      </label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Enable CSRF protection
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Force HTTPS in production
                  </label>
                </div>
              </div>
            </div>

            {/* System Maintenance */}
            <div className="bg-white rounded-lg shadow border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="h-6 w-6 text-orange-600 mr-3" />
                  <h3 className="text-lg font-medium text-agricultural-900">
                    System Maintenance
                  </h3>
                </div>
                <p className="mt-1 text-sm text-agricultural-500">
                  Platform maintenance and operational controls
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-agricultural-700">
                    Maintenance mode (disables public access)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-agricultural-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="The platform is currently undergoing maintenance. Please check back soon."
                    className="block w-full px-3 py-2 border border-agricultural-300 rounded-md shadow-sm focus:ring-agricultural-500 focus:border-agricultural-500"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-agricultural-300 rounded-md shadow-sm text-sm font-medium text-agricultural-700 bg-white hover:bg-agricultural-50"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Export System Logs
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Clear Cache
                  </button>

                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Reset Database (DANGEROUS)
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white rounded-lg shadow border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <div className="flex items-center">
                  <CogIcon className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-medium text-agricultural-900">
                    Feature Flags
                  </h3>
                </div>
                <p className="mt-1 text-sm text-agricultural-500">
                  Enable or disable platform features
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-agricultural-700">
                    Online Payments (Stripe)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm text-agricultural-700">
                    Product Reviews & Ratings
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm text-agricultural-700">
                    Quality Guarantee System
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm text-agricultural-700">
                    Farm Team Management
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm text-agricultural-700">
                    Multi-Farm Cart Support
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm text-agricultural-700">
                    Farmers Market Integration
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-agricultural-600 focus:ring-agricultural-500 border-agricultural-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-6 py-3 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-agricultural-500 focus:ring-offset-2"
            >
              Save All Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
