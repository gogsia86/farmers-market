/**
 * 🔒 PRIVACY SETTINGS COMPONENT
 * Divine implementation of privacy preferences management
 * Sprint 5: Settings & Configuration
 * Features: Profile visibility, contact privacy, messaging, data sharing
 */

"use client";

import { useState } from "react";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import type { PrivacySettings as PrivacyPreferences } from "@/types/settings";

// ============================================
// COMPONENT PROPS
// ============================================

export interface PrivacySettingsProps {
  /**
   * Current privacy preferences
   */
  preferences: PrivacyPreferences;

  /**
   * Callback when settings change
   */
  onChange: (preferences: Partial<PrivacyPreferences>) => void;

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
// CONFIGURATION
// ============================================

const PROFILE_VISIBILITY_OPTIONS = [
  {
    value: "public" as const,
    label: "Public",
    description: "Anyone can view your profile",
    icon: EyeIcon,
  },
  {
    value: "friends" as const,
    label: "Connections Only",
    description: "Only people you've interacted with",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    value: "private" as const,
    label: "Private",
    description: "Hidden from public view",
    icon: EyeSlashIcon,
  },
];

interface PrivacyToggleConfig {
  key: keyof PrivacyPreferences;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultValue: boolean;
  roleSpecific?: Array<"CUSTOMER" | "FARMER" | "ADMIN">;
  warning?: string;
}

const PRIVACY_TOGGLES: PrivacyToggleConfig[] = [
  {
    key: "showEmail",
    label: "Show Email Address",
    description: "Display your email on your public profile",
    icon: LockClosedIcon,
    defaultValue: false,
    warning: "Email will be visible to all users",
  },
  {
    key: "showPhone",
    label: "Show Phone Number",
    description: "Display your phone number on your public profile",
    icon: LockClosedIcon,
    defaultValue: false,
    warning: "Phone number will be visible to all users",
  },
  {
    key: "allowMessaging",
    label: "Allow Direct Messages",
    description: "Let other users send you messages",
    icon: ChatBubbleLeftRightIcon,
    defaultValue: true,
  },
  {
    key: "dataSharing",
    label: "Share Analytics Data",
    description: "Help improve the platform by sharing anonymized usage data",
    icon: ChartBarIcon,
    defaultValue: true,
  },
];

// ============================================
// PRIVACY SETTINGS COMPONENT
// ============================================

export function PrivacySettings({
  preferences,
  onChange,
  disabled = false,
  userRole = "CUSTOMER",
}: PrivacySettingsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["visibility", "contact"]),
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
   * Update a privacy preference
   */
  const updatePreference = <K extends keyof PrivacyPreferences>(
    key: K,
    value: PrivacyPreferences[K],
  ) => {
    onChange({ [key]: value });
  };

  /**
   * Filter toggles by role
   */
  const filteredToggles = PRIVACY_TOGGLES.filter((toggle) => {
    if (!toggle.roleSpecific) return true;
    return toggle.roleSpecific.includes(userRole);
  });

  return (
    <div className="space-y-6" data-testid="privacy-settings">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          Privacy & Security
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Control who can see your information and how your data is used
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("visibility")}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-sm font-medium text-gray-900">
            Profile Visibility
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSections.has("visibility") ? "rotate-180" : ""
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

        {expandedSections.has("visibility") && (
          <div className="p-4 bg-white">
            <div className="space-y-3">
              {PROFILE_VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected =
                  preferences.profileVisibility === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updatePreference("profileVisibility", option.value)
                    }
                    disabled={disabled}
                    className={`w-full flex items-start gap-4 p-4 border-2 rounded-lg transition-all hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                    data-testid={`visibility-${option.value}`}
                  >
                    <Icon
                      className={`h-6 w-6 mt-0.5 flex-shrink-0 ${
                        isSelected ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-green-900" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </span>
                        {isSelected && (
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Contact & Communication Privacy */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("contact")}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-sm font-medium text-gray-900">
            Contact & Communication
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSections.has("contact") ? "rotate-180" : ""
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

        {expandedSections.has("contact") && (
          <div className="p-4 space-y-4 bg-white">
            {filteredToggles.map((toggle) => {
              const Icon = toggle.icon;
              const isEnabled = preferences[toggle.key] ?? toggle.defaultValue;

              return (
                <div
                  key={toggle.key}
                  className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                  data-testid={`privacy-toggle-${toggle.key}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label
                        htmlFor={`privacy-${toggle.key}`}
                        className="text-sm font-medium text-gray-900 block cursor-pointer"
                      >
                        {toggle.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {toggle.description}
                      </p>
                      {toggle.warning && isEnabled && (
                        <div className="mt-2 flex items-start gap-1.5 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          <svg
                            className="h-4 w-4 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span>{toggle.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    id={`privacy-${toggle.key}`}
                    type="button"
                    role="switch"
                    aria-checked={Boolean(isEnabled)}
                    onClick={() =>
                      updatePreference(toggle.key, !isEnabled as any)
                    }
                    disabled={disabled}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ml-4 ${
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
              );
            })}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("data")}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-sm font-medium text-gray-900">
            Data Management
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSections.has("data") ? "rotate-180" : ""
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

        {expandedSections.has("data") && (
          <div className="p-4 space-y-4 bg-white">
            <div className="space-y-3">
              <button
                type="button"
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={disabled}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Download Your Data
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Get a copy of all your data in machine-readable format
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={disabled}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Delete Account
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      Permanently delete your account and all associated data
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divine Agricultural Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">
              🔒 Your Privacy Matters
            </p>
            <p className="text-xs text-green-700 mt-1">
              We take your privacy seriously. Your data is encrypted, never sold
              to third parties, and you have full control over what information
              is shared. Learn more in our{" "}
              <a href="/privacy" className="underline hover:text-green-900">
                Privacy Policy
              </a>
              .
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

export default PrivacySettings;
