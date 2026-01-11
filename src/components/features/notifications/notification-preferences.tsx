/**
 * 🔔 Notification Preferences Component - Divine User Preferences System
 * Allows users to configure notification preferences across all channels
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferences {
  id: string;
  userId: string;
  emailOrders: boolean;
  emailReviews: boolean;
  emailPromotions: boolean;
  emailNewsletter: boolean;
  inAppOrders: boolean;
  inAppReviews: boolean;
  inAppMessages: boolean;
  pushOrders: boolean;
  pushReviews: boolean;
  pushPromotions: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface NotificationPreferencesProps {
  className?: string;
  onSave?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function NotificationPreferencesComponent({
  className = "",
  onSave,
}: NotificationPreferencesProps) {
  const [userPreferences, setUserPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch current preferences
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications/preferences");
      const data: ApiResponse<NotificationPreferences> = await response.json();

      if (data.success && data.data) {
        setUserPreferences(data.data);
      } else {
        setError(data.error?.message || "Failed to load preferences");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load preferences",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Update preference
  const updatePreference = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    if (!userPreferences) return;

    setUserPreferences({
      ...userPreferences,
      [key]: value,
    });
    setSuccessMessage(null);
  };

  // Save preferences
  const savePreferences = async () => {
    if (!userPreferences) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrders: userPreferences.emailOrders,
          emailReviews: userPreferences.emailReviews,
          emailPromotions: userPreferences.emailPromotions,
          emailNewsletter: userPreferences.emailNewsletter,
          inAppOrders: userPreferences.inAppOrders,
          inAppReviews: userPreferences.inAppReviews,
          inAppMessages: userPreferences.inAppMessages,
          pushOrders: userPreferences.pushOrders,
          pushReviews: userPreferences.pushReviews,
          pushPromotions: userPreferences.pushPromotions,
        }),
      });

      const data: ApiResponse<NotificationPreferences> = await response.json();

      if (data.success) {
        setSuccessMessage("✅ Preferences saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        onSave?.();
      } else {
        setError(data.error?.message || "Failed to save preferences");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preferences",
      );
    } finally {
      setSaving(false);
    }
  };

  // Enable all notifications
  const enableAll = () => {
    if (!userPreferences) return;

    setUserPreferences({
      ...userPreferences,
      emailOrders: true,
      emailReviews: true,
      emailPromotions: true,
      emailNewsletter: true,
      inAppOrders: true,
      inAppReviews: true,
      inAppMessages: true,
      pushOrders: true,
      pushReviews: true,
      pushPromotions: true,
    });
    setSuccessMessage(null);
  };

  // Disable optional notifications (keep essential ones)
  const disableOptional = () => {
    if (!userPreferences) return;

    setUserPreferences({
      ...userPreferences,
      emailOrders: true, // Keep essential
      emailReviews: false,
      emailPromotions: false,
      emailNewsletter: false,
      inAppOrders: true, // Keep essential
      inAppReviews: false,
      inAppMessages: true, // Keep essential
      pushOrders: true, // Keep essential
      pushReviews: false,
      pushPromotions: false,
    });
    setSuccessMessage(null);
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

  if (!userPreferences) return null;

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
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={enableAll}
            className="px-4 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
          >
            ✅ Enable All
          </button>
          <button
            onClick={disableOptional}
            className="px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            📌 Essential Only
          </button>
        </div>

        {/* Email Notifications */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📧 Email Notifications
          </h3>

          <div className="space-y-2 pl-4">
            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">
                  Confirmations, shipping, and delivery notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.emailOrders}
                onChange={(e) =>
                  updatePreference("emailOrders", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Reviews & Ratings</p>
                <p className="text-sm text-gray-600">
                  New reviews on your products or farms
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.emailReviews}
                onChange={(e) =>
                  updatePreference("emailReviews", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Promotions & Offers</p>
                <p className="text-sm text-gray-600">
                  Special deals, discounts, and seasonal offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.emailPromotions}
                onChange={(e) =>
                  updatePreference("emailPromotions", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-600">
                  Weekly digest, farming tips, and community updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.emailNewsletter}
                onChange={(e) =>
                  updatePreference("emailNewsletter", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            💬 In-App Notifications
          </h3>

          <div className="space-y-2 pl-4">
            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">
                  Real-time order status updates in the app
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.inAppOrders}
                onChange={(e) =>
                  updatePreference("inAppOrders", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Reviews & Ratings</p>
                <p className="text-sm text-gray-600">
                  New reviews and ratings notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.inAppReviews}
                onChange={(e) =>
                  updatePreference("inAppReviews", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Messages</p>
                <p className="text-sm text-gray-600">
                  Direct messages from farmers and customers
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.inAppMessages}
                onChange={(e) =>
                  updatePreference("inAppMessages", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🔔 Push Notifications
          </h3>

          <div className="space-y-2 pl-4">
            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-600">
                  Mobile push notifications for order status
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.pushOrders}
                onChange={(e) =>
                  updatePreference("pushOrders", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Reviews & Ratings</p>
                <p className="text-sm text-gray-600">
                  Push alerts for new reviews
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.pushReviews}
                onChange={(e) =>
                  updatePreference("pushReviews", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition">
              <div>
                <p className="font-medium text-gray-900">Promotions & Offers</p>
                <p className="text-sm text-gray-600">
                  Push alerts for special deals and offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={userPreferences.pushPromotions}
                onChange={(e) =>
                  updatePreference("pushPromotions", e.target.checked)
                }
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
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
            <strong>💡 Tip:</strong> You'll always receive critical
            notifications (like payment confirmations and security alerts)
            regardless of your userPreferences.
          </p>
        </div>

        {/* Last Updated */}
        {userPreferences.updatedAt && (
          <p className="text-xs text-gray-500 text-center">
            Last updated: {new Date(userPreferences.updatedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Default export for convenience
export default NotificationPreferencesComponent;
