/**
 * 🎨 DISPLAY SETTINGS COMPONENT
 * Divine implementation of display preferences management
 * Sprint 5: Settings & Configuration
 * Features: Theme, language, timezone, distance units, currency
 */

"use client";

import { useState } from "react";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import type { DisplayPreferences } from "@/types/settings";

// ============================================
// COMPONENT PROPS
// ============================================

export interface DisplaySettingsProps {
  /**
   * Current display preferences
   */
  preferences: DisplayPreferences;

  /**
   * Callback when settings change
   */
  onChange: (preferences: Partial<DisplayPreferences>) => void;

  /**
   * Whether the form is disabled (e.g., during save)
   */
  disabled?: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const THEMES = [
  {
    value: "light" as const,
    label: "Light",
    description: "Bright and clear",
    icon: SunIcon,
  },
  {
    value: "dark" as const,
    label: "Dark",
    description: "Easy on the eyes",
    icon: MoonIcon,
  },
  {
    value: "system" as const,
    label: "System",
    description: "Matches system",
    icon: ComputerDesktopIcon,
  },
];

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "UTC-9" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)", offset: "UTC-10" },
  { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", offset: "UTC+11" },
];

const DISTANCE_UNITS = [
  { value: "miles" as const, label: "Miles (mi)", system: "Imperial" },
  { value: "kilometers" as const, label: "Kilometers (km)", system: "Metric" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
];

// ============================================
// DISPLAY SETTINGS COMPONENT
// ============================================

export function DisplaySettings({
  preferences,
  onChange,
  disabled = false,
}: DisplaySettingsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["theme", "regional"]),
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
   * Update a display preference
   */
  const updatePreference = <K extends keyof DisplayPreferences>(
    key: K,
    value: DisplayPreferences[K],
  ) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-6" data-testid="display-settings">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ComputerDesktopIcon className="h-5 w-5 text-green-600" />
          Display Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Customize how information is displayed throughout the platform
        </p>
      </div>

      {/* Theme Selection */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("theme")}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-sm font-medium text-gray-900">Theme</span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSections.has("theme") ? "rotate-180" : ""
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

        {expandedSections.has("theme") && (
          <div className="p-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => {
                const Icon = theme.icon;
                const isSelected = preferences.theme === theme.value;

                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => updatePreference("theme", theme.value)}
                    disabled={disabled}
                    className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                    data-testid={`theme-${theme.value}`}
                  >
                    <Icon
                      className={`h-8 w-8 mb-2 ${
                        isSelected ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-green-900" : "text-gray-700"
                      }`}
                    >
                      {theme.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {theme.description}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
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
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Regional Settings */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("regional")}
          className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-sm font-medium text-gray-900">
            Regional Settings
          </span>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSections.has("regional") ? "rotate-180" : ""
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

        {expandedSections.has("regional") && (
          <div className="p-4 space-y-6 bg-white">
            {/* Language */}
            <div data-testid="language-setting">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => updatePreference("language", e.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                Select your preferred language for the interface
              </p>
            </div>

            {/* Timezone */}
            <div data-testid="timezone-setting">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => updatePreference("timezone", e.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                All dates and times will be displayed in this timezone
              </p>
            </div>

            {/* Distance Unit */}
            <div data-testid="distance-unit-setting">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                Distance Unit
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DISTANCE_UNITS.map((unit) => {
                  const isSelected = preferences.distanceUnit === unit.value;

                  return (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() =>
                        updatePreference("distanceUnit", unit.value)
                      }
                      disabled={disabled}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                      data-testid={`distance-unit-${unit.value}`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-green-900" : "text-gray-700"
                        }`}
                      >
                        {unit.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {unit.system}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Used for displaying distances to farms and delivery zones
              </p>
            </div>

            {/* Currency */}
            <div data-testid="currency-setting">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => updatePreference("currency", e.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">
                All prices will be displayed in this currency
              </p>
            </div>
          </div>
        )}
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
            <p className="text-sm font-medium text-green-900">🌍 Local First</p>
            <p className="text-xs text-green-700 mt-1">
              Your regional preferences help us show you relevant local farms,
              seasonal produce, and delivery options in your area.
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

export default DisplaySettings;
