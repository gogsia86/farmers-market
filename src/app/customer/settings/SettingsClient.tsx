/**
 * ⚙️ CUSTOMER SETTINGS CLIENT COMPONENT
 * Divine implementation of interactive settings management
 * Sprint 5: Settings & Configuration
 * Features: State management, API integration, real-time updates
 */

"use client";

import {
  DisplaySettings,
  NotificationSettings,
  PrivacySettings,
} from "@/components/settings";
import { createLogger } from "@/lib/utils/logger";
import type {
  DisplayPreferences,
  NotificationPreferences,
  PrivacySettings as PrivacyPreferences,
  UpdateUserSettingsRequest,
  UserSettingsData,
} from "@/types/settings";
import {
  BellIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

const settingsLogger = createLogger("CustomerSettingsClient");

// ============================================
// COMPONENT PROPS
// ============================================

export interface CustomerSettingsClientProps {
  userId: string;
  userRole?: "CUSTOMER" | "ADMIN";
}

// ============================================
// NAVIGATION TABS
// ============================================

type SettingsTab = "notifications" | "display" | "privacy" | "account";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: "notifications",
    label: "Notifications",
    icon: BellIcon,
    description: "Manage your notification preferences",
  },
  {
    id: "display",
    label: "Display",
    icon: ComputerDesktopIcon,
    description: "Customize how information is displayed",
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: ShieldCheckIcon,
    description: "Control your privacy settings",
  },
  {
    id: "account",
    label: "Account",
    icon: UserCircleIcon,
    description: "Manage your account information",
  },
];

// ============================================
// CUSTOMER SETTINGS CLIENT COMPONENT
// ============================================

export function CustomerSettingsClient({
  userId,
  userRole = "CUSTOMER",
}: CustomerSettingsClientProps) {
  // State
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Temporary settings (before save)
  const [tempSettings, setTempSettings] = useState<UserSettingsData | null>(
    null,
  );

  /**
   * Fetch user settings on mount
   */
  useEffect(() => {
    fetchSettings();
  }, [userId]);

  /**
   * Fetch settings from API
   */
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/settings/user");

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      if (data.success && data.data) {
        setSettings(data.data);
        setTempSettings(data.data);
      } else {
        throw new Error(data.error?.message || "Failed to load settings");
      }
    } catch (err) {
      settingsLogger.error("Error fetching settings", err instanceof Error ? err : new Error(String(err)), {
        userId,
      });
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update notification settings
   */
  const updateNotifications = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      if (!tempSettings) return;

      setTempSettings({
        ...tempSettings,
        notifications: {
          ...tempSettings.notifications,
          ...updates,
        },
      });
      setHasChanges(true);
      setSuccessMessage(null);
    },
    [tempSettings],
  );

  /**
   * Update display settings
   */
  const updateDisplay = useCallback(
    (updates: Partial<DisplayPreferences>) => {
      if (!tempSettings) return;

      setTempSettings({
        ...tempSettings,
        display: {
          ...tempSettings.display,
          ...updates,
        },
      });
      setHasChanges(true);
      setSuccessMessage(null);
    },
    [tempSettings],
  );

  /**
   * Update privacy settings
   */
  const updatePrivacy = useCallback(
    (updates: Partial<PrivacyPreferences>) => {
      if (!tempSettings) return;

      setTempSettings({
        ...tempSettings,
        privacy: {
          ...tempSettings.privacy,
          ...updates,
        },
      });
      setHasChanges(true);
      setSuccessMessage(null);
    },
    [tempSettings],
  );

  /**
   * Save settings to API
   */
  const saveSettings = async () => {
    if (!tempSettings || !hasChanges) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updates: UpdateUserSettingsRequest = {
        notifications: tempSettings.notifications,
        display: tempSettings.display,
        privacy: tempSettings.privacy,
      };

      const response = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();

      if (data.success && data.data) {
        setSettings(data.data);
        setTempSettings(data.data);
        setHasChanges(false);
        setSuccessMessage("Settings saved successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.error?.message || "Failed to save settings");
      }
    } catch (err) {
      settingsLogger.error("Error saving settings", err instanceof Error ? err : new Error(String(err)), {
        userId,
      });
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Discard changes
   */
  const discardChanges = () => {
    setTempSettings(settings);
    setHasChanges(false);
    setSuccessMessage(null);
    setError(null);
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (!tempSettings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ExclamationCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-900">
              Failed to Load Settings
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error || "An unexpected error occurred"}
            </p>
            <button
              onClick={fetchSettings}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="customer-settings-client">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-900">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav
            className="space-y-1 bg-white rounded-lg shadow-sm p-2"
            data-testid="settings-nav"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                      ? "bg-green-50 text-green-900"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-green-600" : "text-gray-400"
                      }`}
                  />
                  <span>{tab.label}</span>
                  {hasChanges && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-yellow-500"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Save/Discard Actions (Sticky on Desktop) */}
          {hasChanges && (
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4 space-y-2">
              <p className="text-xs font-medium text-gray-900 mb-3">
                You have unsaved changes
              </p>
              <button
                type="button"
                onClick={saveSettings}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={discardChanges}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Discard
              </button>
            </div>
          )}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === "notifications" && (
              <NotificationSettings
                preferences={tempSettings.notifications}
                onChange={updateNotifications}
                disabled={isSaving}
                userRole={userRole}
              />
            )}

            {activeTab === "display" && (
              <DisplaySettings
                preferences={tempSettings.display}
                onChange={updateDisplay}
                disabled={isSaving}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacySettings
                preferences={tempSettings.privacy}
                onChange={updatePrivacy}
                disabled={isSaving}
                userRole={userRole}
              />
            )}

            {activeTab === "account" && (
              <div className="space-y-6" data-testid="account-settings">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5 text-green-600" />
                    Account Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage your account details and security settings
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-blue-600 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Coming Soon
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Account management features (password change, email
                        update, two-factor authentication) will be available in
                        the next release.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Save/Discard Actions */}
          {hasChanges && (
            <div className="lg:hidden mt-6 bg-white rounded-lg shadow-sm p-4 space-y-2">
              <p className="text-xs font-medium text-gray-900 mb-3">
                You have unsaved changes
              </p>
              <button
                type="button"
                onClick={saveSettings}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={discardChanges}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Discard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================
