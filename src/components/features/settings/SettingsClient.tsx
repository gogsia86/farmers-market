"use client";

/**
 * ⚙️ SETTINGS CLIENT - Divine Settings Management
 * Comprehensive tabbed settings interface for user preferences
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Check,
  Globe,
  Home,
  Lock,
  Mail,
  MapPin,
  Moon,
  Phone,
  Save,
  Shield,
  Sun,
  User,
  X
} from "lucide-react";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface SettingsData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    phone: string;
    avatar: string;
    role: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  settings: {
    theme: string;
    language: string;
    timezone: string;
    distanceUnit: string;
    currency: string;
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    allowMessaging: boolean;
    dataSharing: boolean;
    contactMethod: string;
    communicationFrequency: string;
  };
  addresses: Array<{
    id: string;
    type: string;
    label: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  notificationPreferences: {
    emailEnabled: boolean;
    emailFrequency: string;
    smsEnabled: boolean;
    smsFrequency: string;
    pushEnabled: boolean;
    pushFrequency: string;
    inAppEnabled: boolean;
    inAppSound: boolean;
    inAppBadge: boolean;
  };
  dietaryPreferences: any;
  privacySettings: any;
}

interface SettingsClientProps {
  initialData: SettingsData;
}

type Tab = "profile" | "notifications" | "privacy" | "preferences" | "addresses";

// ============================================================================
// COMPONENT
// ============================================================================

export function SettingsClient({ initialData }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [userData, setUserData] = useState(initialData.user);
  const [settings, setSettings] = useState(initialData.settings);
  const [notifications, setNotifications] = useState(initialData.notificationPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error("Failed to save notification preferences");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================================================
  // TAB CONFIGURATION
  // ==========================================================================

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "privacy" as Tab, label: "Privacy", icon: Shield },
    { id: "preferences" as Tab, label: "Preferences", icon: Globe },
    { id: "addresses" as Tab, label: "Addresses", icon: MapPin },
  ];

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab: any) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Success/Error Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          <Check className="h-5 w-5" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <X className="h-5 w-5" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="rounded-lg bg-white shadow">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Profile Information</h2>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userData.firstName}
                    onChange={(e) =>
                      setUserData({ ...userData, firstName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userData.lastName}
                    onChange={(e) =>
                      setUserData({ ...userData, lastName: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="mt-2 bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {userData.emailVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Not verified</span>
                  )}
                </p>
              </div>

              <div>
                <Label htmlFor="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="mt-2"
                  placeholder="+1 (555) 123-4567"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {userData.phoneVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Not verified</span>
                  )}
                </p>
              </div>

              <div className="flex justify-end border-t pt-6">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Notification Preferences
            </h2>
            <div className="space-y-6">
              {/* Channel Preferences */}
              <div>
                <h3 className="mb-4 font-medium text-gray-900">Notification Channels</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailEnabled}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          emailEnabled: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive notifications via text message
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsEnabled}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          smsEnabled: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in the app
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.pushEnabled}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          pushEnabled: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>

              {/* Notification Frequencies */}
              <div>
                <h3 className="mb-4 font-medium text-gray-900">Notification Frequency</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="emailFrequency">Email Frequency</Label>
                    <select
                      id="emailFrequency"
                      value={notifications.emailFrequency}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          emailFrequency: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                      disabled={!notifications.emailEnabled}
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="smsFrequency">SMS Frequency</Label>
                    <select
                      id="smsFrequency"
                      value={notifications.smsFrequency}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          smsFrequency: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                      disabled={!notifications.smsEnabled}
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="pushFrequency">Push Notification Frequency</Label>
                    <select
                      id="pushFrequency"
                      value={notifications.pushFrequency}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          pushFrequency: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                      disabled={!notifications.pushEnabled}
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* In-App Notification Settings */}
              <div>
                <h3 className="mb-4 font-medium text-gray-900">In-App Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">In-App Notifications</p>
                      <p className="text-sm text-gray-500">Show notifications within the app</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.inAppEnabled}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          inAppEnabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Sound</p>
                      <p className="text-sm text-gray-500">Play sound for notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.inAppSound}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          inAppSound: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      disabled={!notifications.inAppEnabled}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Badge Count</p>
                      <p className="text-sm text-gray-500">Show unread notification count</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.inAppBadge}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          inAppBadge: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      disabled={!notifications.inAppEnabled}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end border-t pt-6">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === "privacy" && (
          <div className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Privacy Settings</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <select
                  id="profileVisibility"
                  value={settings.profileVisibility}
                  onChange={(e) =>
                    setSettings({ ...settings, profileVisibility: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="public">Public - Anyone can see your profile</option>
                  <option value="friends">Friends Only - Only people you follow</option>
                  <option value="private">Private - Only you can see</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Show Email Address</p>
                      <p className="text-sm text-gray-500">
                        Let others see your email on your profile
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, showEmail: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Show Phone Number</p>
                      <p className="text-sm text-gray-500">
                        Let others see your phone on your profile
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, showPhone: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Allow Messaging</p>
                      <p className="text-sm text-gray-500">
                        Let farms and other users send you messages
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowMessaging}
                    onChange={(e) =>
                      setSettings({ ...settings, allowMessaging: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Data Sharing</p>
                      <p className="text-sm text-gray-500">
                        Share anonymized data to improve the platform
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dataSharing}
                    onChange={(e) =>
                      setSettings({ ...settings, dataSharing: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>
              </div>

              <div className="flex justify-end border-t pt-6">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Display & Language Preferences
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="theme">
                  <div className="flex items-center gap-2">
                    {settings.theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    Theme
                  </div>
                </Label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div>
                <Label htmlFor="distanceUnit">Distance Unit</Label>
                <select
                  id="distanceUnit"
                  value={settings.distanceUnit}
                  onChange={(e) =>
                    setSettings({ ...settings, distanceUnit: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="miles">Miles</option>
                  <option value="kilometers">Kilometers</option>
                </select>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-green-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <div className="flex justify-end border-t pt-6">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Home className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </div>

            {initialData.addresses.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-12 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No saved addresses
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Add a delivery address to speed up checkout
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {initialData.addresses.map((address: any) => (
                  <div
                    key={address.id}
                    className="rounded-lg border border-gray-200 p-4 hover:border-green-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {address.label || address.type}
                          </h3>
                          {address.isDefault && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {address.street}
                          {address.street2 && `, ${address.street2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">{address.country}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
