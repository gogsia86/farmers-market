/**
 * Notification Preferences Component
 * Allows users to configure their notification preferences across all channels
 * Supports Email, SMS, Push, and In-App notification preferences
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";

type NotificationCategory =
  | "ORDERS"
  | "PAYMENTS"
  | "FARM_UPDATES"
  | "PRODUCT_ALERTS"
  | "MESSAGES"
  | "MARKETING"
  | "SYSTEM";

interface ChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
}

interface CategoryPreferences {
  category: NotificationCategory;
  label: string;
  description: string;
  channels: ChannelPreference[];
}

interface NotificationPreferencesData {
  categories: CategoryPreferences[];
  globalMute: boolean;
}

interface NotificationPreferencesProps {
  userId: string;
  className?: string;
  onSave?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function NotificationPreferences({
  userId,
  className = "",
  onSave,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferencesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Default preferences structure
  const defaultPreferences: NotificationPreferencesData = {
    globalMute: false,
    categories: [
      {
        category: "ORDERS",
        label: "Orders & Fulfillment",
        description: "Order confirmations, status updates, and delivery notifications",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: true },
          { channel: "PUSH", enabled: true },
          { channel: "IN_APP", enabled: true },
        ],
      },
      {
        category: "PAYMENTS",
        label: "Payments & Billing",
        description: "Payment receipts, refunds, and billing updates",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: true },
          { channel: "PUSH", enabled: true },
          { channel: "IN_APP", enabled: true },
        ],
      },
      {
        category: "FARM_UPDATES",
        label: "Farm Updates",
        description: "New farms, farm approvals, and farm status changes",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: false },
          { channel: "PUSH", enabled: true },
          { channel: "IN_APP", enabled: true },
        ],
      },
      {
        category: "PRODUCT_ALERTS",
        label: "Product Alerts",
        description: "Low stock alerts, new products, and price changes",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: false },
          { channel: "PUSH", enabled: true },
          { channel: "IN_APP", enabled: true },
        ],
      },
      {
        category: "MESSAGES",
        label: "Messages & Reviews",
        description: "New messages, reviews, and community interactions",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: false },
          { channel: "PUSH", enabled: true },
          { channel: "IN_APP", enabled: true },
        ],
      },
      {
        category: "MARKETING",
        label: "Marketing & Promotions",
        description: "Newsletters, special offers, and seasonal updates",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: false },
          { channel: "PUSH", enabled: false },
          { channel: "IN_APP", enabled: true },
        ],
      },
      {
        category: "SYSTEM",
        label: "System Notifications",
        description: "Account security, maintenance, and important updates",
        channels: [
          { channel: "EMAIL", enabled: true },
          { channel: "SMS", enabled: false },
          { channel: "PUSH", enabled: true },
          { channel: "IN_APP", enabled: true },
        ],
      },
    ],
  };

  // Fetch current preferences
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setPreferences(data.data);
      } else {
        // Use default preferences if none exist
        setPreferences(defaultPreferences);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  // Toggle channel for a category
  const toggleChannel = (categoryIndex: number, channelIndex: number) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const category = newPreferences.categories[categoryIndex];
    if (!category) return;

    const channel = category.channels[channelIndex];
    if (!channel) return;

    channel.enabled = !channel.enabled;

    setPreferences(newPreferences);
    setSuccessMessage(null);
  };

  // Toggle global mute
  const toggleGlobalMute = () => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      globalMute: !preferences.globalMute,
    });
    setSuccessMessage(null);
  };

  // Enable all channels for a category
  const enableAllChannels = (categoryIndex: number) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const category = newPreferences.categories[categoryIndex];
    if (!category) return;

    category.channels = category.channels.map((ch) => ({ ...ch, enabled: true }));

    setPreferences(newPreferences);
    setSuccessMessage(null);
  };

  // Disable all channels for a category
  const disableAllChannels = (categoryIndex: number) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const category = newPreferences.categories[categoryIndex];
    if (!category) return;

    category.channels = category.channels.map((ch) => ({ ...ch, enabled: false }));

    setPreferences(newPreferences);
    setSuccessMessage(null);
  };

  // Save preferences
  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          preferences,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Preferences saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        onSave?.();
      } else {
        setError(data.error || "Failed to save preferences");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  // Get channel icon
  const getChannelIcon = (channel: NotificationChannel): string => {
    const icons: Record<NotificationChannel, string> = {
      EMAIL: "📧",
      SMS: "📱",
      PUSH: "🔔",
      IN_APP: "💬",
    };
    return icons[channel];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>⚙️ Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>⚙️ Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to receive notifications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">✅ {successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Global Mute */}
        <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">🔕 Mute All Notifications</p>
              <p className="text-sm text-gray-600 mt-1">
                Temporarily disable all notifications (except critical system alerts)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.globalMute}
                onChange={toggleGlobalMute}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notification Categories</h3>

          {preferences.categories.map((category, categoryIndex) => (
            <div
              key={category.category}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{category.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => enableAllChannels(categoryIndex)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Enable All
                  </button>
                  <span className="text-xs text-gray-400">|</span>
                  <button
                    onClick={() => disableAllChannels(categoryIndex)}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Channel Toggles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {category.channels.map((channel, channelIndex) => (
                  <label
                    key={channel.channel}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${channel.enabled
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={channel.enabled}
                      onChange={() => toggleChannel(categoryIndex, channelIndex)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex items-center gap-1">
                      <span>{getChannelIcon(channel.channel)}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {channel.channel}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "💾 Save Preferences"}
          </button>
          <button
            onClick={fetchPreferences}
            disabled={saving}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            🔄 Reset
          </button>
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> You'll always receive critical notifications (like
            payment failures and security alerts) via email, regardless of your
            preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
