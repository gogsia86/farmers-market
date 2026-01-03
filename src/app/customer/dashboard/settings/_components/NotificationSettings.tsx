// ============================================
// NOTIFICATION SETTINGS COMPONENT
// ============================================
// Sprint 5: Settings & Configuration
// Manages user notification preferences across all channels
// Following divine agricultural patterns with type safety

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { UserSettingsData, NotificationFrequency } from "@/types/settings";

interface NotificationSettingsProps {
  settings: UserSettingsData;
  onUpdate: (updates: Partial<UserSettingsData>) => void;
  disabled?: boolean;
}

/**
 * Notification Settings Component
 * Provides UI for managing notification preferences across email, SMS, push, and in-app channels
 */
export function NotificationSettings({
  settings,
  onUpdate,
  disabled = false,
}: NotificationSettingsProps) {
  const { notifications } = settings;

  /**
   * Update a specific notification channel
   */
  const updateChannel = (
    channel: "email" | "sms" | "push" | "inApp",
    updates: any,
  ) => {
    onUpdate({
      notifications: {
        ...notifications,
        [channel]: {
          ...notifications[channel],
          ...updates,
        },
      },
    });
  };

  /**
   * Get badge variant based on notification status
   */
  const getStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 border-green-200"
      >
        <Volume2 className="h-3 w-3 mr-1" />
        Enabled
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        <VolumeX className="h-3 w-3 mr-1" />
        Disabled
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Receive updates via email</CardDescription>
              </div>
            </div>
            {getStatusBadge(notifications.email.enabled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled" className="font-medium">
                Enable Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={notifications.email.enabled}
              onCheckedChange={(checked) =>
                updateChannel("email", { enabled: checked })
              }
              disabled={disabled}
            />
          </div>

          <Separator />

          {/* Frequency Selector */}
          <div className="space-y-2">
            <Label htmlFor="email-frequency" className="font-medium">
              Email Frequency
            </Label>
            <Select
              value={notifications.email.frequency}
              onValueChange={(value) =>
                updateChannel("email", {
                  frequency: value as NotificationFrequency,
                })
              }
              disabled={disabled || !notifications.email.enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often you want to receive email notifications
            </p>
          </div>

          {/* Quiet Hours */}
          {notifications.email.quietHours && (
            <div className="space-y-2">
              <Label className="font-medium">Quiet Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="email-quiet-start"
                    className="text-xs text-muted-foreground"
                  >
                    Start Time
                  </Label>
                  <input
                    id="email-quiet-start"
                    type="time"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={notifications.email.quietHours.start}
                    onChange={(e) =>
                      updateChannel("email", {
                        quietHours: {
                          ...notifications.email.quietHours!,
                          start: e.target.value,
                        },
                      })
                    }
                    disabled={disabled || !notifications.email.enabled}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="email-quiet-end"
                    className="text-xs text-muted-foreground"
                  >
                    End Time
                  </Label>
                  <input
                    id="email-quiet-end"
                    type="time"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={notifications.email.quietHours.end}
                    onChange={(e) =>
                      updateChannel("email", {
                        quietHours: {
                          ...notifications.email.quietHours!,
                          end: e.target.value,
                        },
                      })
                    }
                    disabled={disabled || !notifications.email.enabled}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                No notifications will be sent during these hours
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Receive updates via text message
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(notifications.sms.enabled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-enabled" className="font-medium">
                Enable SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={notifications.sms.enabled}
              onCheckedChange={(checked) =>
                updateChannel("sms", { enabled: checked })
              }
              disabled={disabled}
            />
          </div>

          <Separator />

          {/* Frequency Selector */}
          <div className="space-y-2">
            <Label htmlFor="sms-frequency" className="font-medium">
              SMS Frequency
            </Label>
            <Select
              value={notifications.sms.frequency}
              onValueChange={(value) =>
                updateChannel("sms", {
                  frequency: value as NotificationFrequency,
                })
              }
              disabled={disabled || !notifications.sms.enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              SMS charges may apply based on your mobile plan
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Receive updates on your mobile device
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(notifications.push.enabled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled" className="font-medium">
                Enable Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your mobile device
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={notifications.push.enabled}
              onCheckedChange={(checked) =>
                updateChannel("push", { enabled: checked })
              }
              disabled={disabled}
            />
          </div>

          <Separator />

          {/* Frequency Selector */}
          <div className="space-y-2">
            <Label htmlFor="push-frequency" className="font-medium">
              Push Frequency
            </Label>
            <Select
              value={notifications.push.frequency}
              onValueChange={(value) =>
                updateChannel("push", {
                  frequency: value as NotificationFrequency,
                })
              }
              disabled={disabled || !notifications.push.enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sound & Badge Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-sound" className="font-medium">
                  Notification Sound
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play sound for push notifications
                </p>
              </div>
              <Switch
                id="push-sound"
                checked={notifications.push.sound}
                onCheckedChange={(checked) =>
                  updateChannel("push", { sound: checked } as any)
                }
                disabled={disabled || !notifications.push.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-badge" className="font-medium">
                  Badge Count
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show badge count on app icon
                </p>
              </div>
              <Switch
                id="push-badge"
                checked={notifications.push.badge}
                onCheckedChange={(checked) =>
                  updateChannel("push", { badge: checked } as any)
                }
                disabled={disabled || !notifications.push.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>
                  Receive updates within the app
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(notifications.inApp.enabled)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-enabled" className="font-medium">
                Enable In-App Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show notifications while using the app
              </p>
            </div>
            <Switch
              id="inapp-enabled"
              checked={notifications.inApp.enabled}
              onCheckedChange={(checked) =>
                updateChannel("inApp", { enabled: checked })
              }
              disabled={disabled}
            />
          </div>

          <Separator />

          {/* Frequency Selector */}
          <div className="space-y-2">
            <Label htmlFor="inapp-frequency" className="font-medium">
              In-App Frequency
            </Label>
            <Select
              value={notifications.inApp.frequency}
              onValueChange={(value) =>
                updateChannel("inApp", {
                  frequency: value as NotificationFrequency,
                })
              }
              disabled={disabled || !notifications.inApp.enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Notification Summary</p>
              <p className="text-sm text-muted-foreground">
                You have{" "}
                {
                  [
                    notifications.email.enabled,
                    notifications.sms.enabled,
                    notifications.push.enabled,
                    notifications.inApp.enabled,
                  ].filter(Boolean).length
                }{" "}
                notification channel(s) enabled. You can adjust these settings
                at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
