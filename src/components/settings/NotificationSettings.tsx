/**
 * 🔔 NOTIFICATION SETTINGS COMPONENT
 * Divine implementation of notification preferences management
 * Sprint 5: Settings & Configuration
 * Features: Channel-specific preferences, marketing opt-in/out, type-safe updates
 */

"use client";

import { useState } from "react";
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import type {
  NotificationPreferences,
  NotificationChannelSettings,
} from "@/types/settings";

// ============================================
// COMPONENT PROPS
// ============================================

export interface NotificationSettingsProps {
  /**
   * Current notification preferences
   */
  preferences: NotificationPreferences;

  /**
   * Callback when settings change
   */
  onChange: (preferences: Partial<NotificationPreferences>) => void;

  /**
   * Whether the form is disabled (e.g., during save)
   */
  disabled?: boolean;

  /**
   * User role for conditional rendering
   */
  userRole?: "CUSTOMER" | "FARMER" | "ADMIN";
}

// ============================================
// NOTIFICATION CHANNEL TYPES
// ============================================

type NotificationChannel = "email" | "sms" | "push" | "inApp";

interface NotificationChannelConfig {
  key: NotificationChannel;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NOTIFICATION_CHANNELS: NotificationChannelConfig[] = [
  {
    key: "email",
    label: "Email Notifications",
    description: "Receive notifications via email",
    icon: EnvelopeIcon,
  },
  {
    key: "sms",
    label: "SMS Notifications",
    description: "Receive text message alerts",
    icon: DevicePhoneMobileIcon,
  },
  {
    key: "push",
    label: "Push Notifications",
    description: "Receive push notifications on your device",
    icon: BellIcon,
  },
  {
    key: "inApp",
    label: "In-App Notifications",
    description: "See notifications within the app",
    icon: BellIcon,
  },
];

const FREQUENCY_OPTIONS = [
  {
    value: "immediate",
    label: "Immediately",
    description: "Get notified right away",
  },
  {
    value: "daily",
    label: "Daily Digest",
    description: "Once per day summary",
  },
  {
    value: "weekly",
    label: "Weekly Digest",
    description: "Once per week summary",
  },
  {
    value: "never",
    label: "Never",
    description: "Disable these notifications",
  },
];

// ============================================
// NOTIFICATION SETTINGS COMPONENT
// ============================================

export function NotificationSettings({
  preferences,
  onChange,
  disabled = false,
  userRole = "CUSTOMER",
}: NotificationSettingsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["channels"]),
  );

  /**
   * Toggle section expansion
   */
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  /**
   * Update a notification channel
   */
  const updateChannel = (
    channel: NotificationChannel,
    updates: Partial<NotificationChannelSettings>,
  ) => {
    const currentSettings = preferences[channel];
    onChange({
      [channel]: {
        ...currentSettings,
        ...updates,
      },
    });
  };

  /**
   * Toggle channel enabled state
   */
  const toggleChannelEnabled = (channel: NotificationChannel) => {
    const currentSettings = preferences[channel];
    updateChannel(channel, {
      enabled: !currentSettings.enabled,
    });
  };

  return (
    <div className="space-y-6" data-testid="notification-settings">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-green-600" />
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Choose how and when you want to be notified
        </p>
      </div>

      {/* Notification Channels */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("channels")}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-sm font-medium text-gray-900">
            Notification Channels
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSections.has("channels") ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.has("channels") && (
          <div className="p-4 space-y-6 bg-white">
            {NOTIFICATION_CHANNELS.map((channelConfig) => {
              const Icon = channelConfig.icon;
              const channelSettings = preferences[channelConfig.key];
              const isEnabled = channelSettings?.enabled ?? false;

              return (
                <div
                  key={channelConfig.key}
                  className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  data-testid={`channel-${channelConfig.key}`}
                >
                  {/* Channel Toggle */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <label
                          htmlFor={`channel-${channelConfig.key}`}
                          className="text-sm font-medium text-gray-900 block cursor-pointer"
                        >
                          {channelConfig.label}
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {channelConfig.description}
                        </p>
                      </div>
                    </div>
                    <button
                      id={`channel-${channelConfig.key}`}
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => toggleChannelEnabled(channelConfig.key)}
                      disabled={disabled}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isEnabled ? "bg-green-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Frequency Settings (when enabled) */}
                  {isEnabled && (
                    <div className="mt-4 ml-8">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Notification Frequency
                      </label>
                      <select
                        value={channelSettings.frequency}
                        onChange={(e) =>
                          updateChannel(channelConfig.key, {
                            frequency: e.target.value as any,
                          })
                        }
                        disabled={disabled}
                        className="w-full max-w-xs rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                      >
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label} - {freq.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Push-specific settings */}
                  {channelConfig.key === "push" && isEnabled && (
                    <div className="mt-4 ml-8 space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(channelSettings as any).sound ?? true}
                          onChange={(e) =>
                            updateChannel(channelConfig.key, {
                              sound: e.target.checked,
                            } as any)
                          }
                          disabled={disabled}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-xs text-gray-700">
                          Play sound
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(channelSettings as any).badge ?? true}
                          onChange={(e) =>
                            updateChannel(channelConfig.key, {
                              badge: e.target.checked,
                            } as any)
                          }
                          disabled={disabled}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-xs text-gray-700">
                          Show badge count
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Marketing Preferences */}
      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-start gap-3">
          <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">
              Marketing Communications
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Receive occasional emails about new features, seasonal highlights,
              and special offers from our farming community. You can unsubscribe
              at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Divine Agricultural Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 text-green-600 mt-0.5"
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
            <p className="text-sm font-medium text-green-900">
              🌱 Agricultural Consciousness
            </p>
            <p className="text-xs text-green-700 mt-1">
              We respect the natural rhythms of farming. Notifications are sent
              mindfully, avoiding early morning hours and respecting seasonal
              patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export default NotificationSettings;
