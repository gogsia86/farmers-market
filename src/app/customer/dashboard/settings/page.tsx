// ============================================
// CUSTOMER SETTINGS PAGE
// ============================================
// Sprint 5: Settings & Configuration
// Main settings page with tabbed interface for user preferences
// Following divine agricultural patterns with type safety

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLogger } from "@/lib/utils/logger";
import type { UserSettingsData } from "@/types/settings";
import { AlertCircle, Bell, Eye, Lock, Save, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import settings components
import { DisplaySettings, NotificationSettings, PrivacySettings } from "./_components";

// Create logger for settings page
const settingsLogger = createLogger("CustomerSettings");

/**
 * Customer Settings Page
 * Provides interface for managing user preferences across multiple categories
 */
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<string>("notifications");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer/dashboard/settings");
    }
  }, [status, router]);

  // Fetch user settings on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  /**
   * Fetch current user settings from API
   */
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/settings/user");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to load settings");
      }

      setSettings(data.data);
    } catch (err) {
      settingsLogger.error("Failed to fetch user settings", err instanceof Error ? err : new Error(String(err)));
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save settings changes to API
   */
  const handleSaveSettings = async () => {
    if (!settings || !hasChanges) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to save settings");
      }

      setSettings(data.data);
      setHasChanges(false);
      setSuccessMessage("Settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      settingsLogger.error("Failed to save user settings", err instanceof Error ? err : new Error(String(err)));
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update settings locally and mark as changed
   */
  const updateSettings = (updates: Partial<UserSettingsData>) => {
    setSettings((prev) => (prev ? { ...prev, ...updates } : null));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  /**
   * Discard unsaved changes
   */
  const handleDiscardChanges = () => {
    fetchSettings();
    setHasChanges(false);
    setSuccessMessage(null);
    setError(null);
  };

  // Loading state
  if (loading || status === "loading") {
    return <SettingsSkeleton />;
  }

  // Error state
  if (!settings) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">
                Failed to Load Settings
              </CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {error || "An unexpected error occurred"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchSettings} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and notification settings
          </p>
        </div>

        {/* Save/Discard Actions */}
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="mr-2">
              Unsaved Changes
            </Badge>
            <Button
              variant="outline"
              onClick={handleDiscardChanges}
              disabled={saving}
            >
              Discard
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-2 py-3">
            <div className="h-2 w-2 rounded-full bg-green-600" />
            <p className="text-sm text-green-900 font-medium">
              {successMessage}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-900 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings
            settings={settings}
            onUpdate={updateSettings}
            disabled={saving}
          />
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-4">
          <DisplaySettings
            settings={settings}
            onUpdate={updateSettings}
            disabled={saving}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <PrivacySettings
            settings={settings}
            onUpdate={updateSettings}
            disabled={saving}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your communication preferences and contact methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Preferred Contact Method
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={settings.contactMethod}
                  onChange={(e) =>
                    updateSettings({
                      contactMethod: e.target.value as "email" | "sms" | "both",
                    })
                  }
                  disabled={saving}
                >
                  <option value="email">Email Only</option>
                  <option value="sms">SMS Only</option>
                  <option value="both">Both Email & SMS</option>
                </select>
              </div>

              {/* Communication Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Communication Frequency
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={settings.communicationFrequency}
                  onChange={(e) =>
                    updateSettings({
                      communicationFrequency: e.target.value as
                        | "minimal"
                        | "normal"
                        | "all",
                    })
                  }
                  disabled={saving}
                >
                  <option value="minimal">Minimal (Only Essential)</option>
                  <option value="normal">Normal (Recommended)</option>
                  <option value="all">All Updates</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Control how often we reach out to you
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed Save Bar (Mobile) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 lg:hidden">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Badge variant="secondary">Unsaved Changes</Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                disabled={saving}
              >
                Discard
              </Button>
              <Button size="sm" onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for settings page
 */
function SettingsSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-12 w-full bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
