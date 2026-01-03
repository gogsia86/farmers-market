// ============================================
// PRIVACY SETTINGS COMPONENT
// ============================================
// Sprint 5: Settings & Configuration
// Manages user privacy and data sharing preferences
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
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Users,
  Globe,
  AlertCircle,
} from "lucide-react";
import type { UserSettingsData, ProfileVisibility } from "@/types/settings";

interface PrivacySettingsProps {
  settings: UserSettingsData;
  onUpdate: (updates: Partial<UserSettingsData>) => void;
  disabled?: boolean;
}

/**
 * Privacy Settings Component
 * Provides UI for managing privacy and data sharing preferences
 */
export function PrivacySettings({
  settings,
  onUpdate,
  disabled = false,
}: PrivacySettingsProps) {
  const { privacy } = settings;

  /**
   * Update privacy settings
   */
  const updatePrivacy = (updates: Partial<typeof privacy>) => {
    onUpdate({
      privacy: {
        ...privacy,
        ...updates,
      },
    });
  };

  /**
   * Get visibility icon and description
   */
  const getVisibilityInfo = (visibility: ProfileVisibility) => {
    switch (visibility) {
      case "public":
        return {
          icon: <Globe className="h-4 w-4" />,
          label: "Public",
          description: "Anyone can view your profile",
          color: "text-blue-600 bg-blue-100",
        };
      case "friends":
        return {
          icon: <Users className="h-4 w-4" />,
          label: "Friends Only",
          description: "Only your connections can view your profile",
          color: "text-green-600 bg-green-100",
        };
      case "private":
        return {
          icon: <Lock className="h-4 w-4" />,
          label: "Private",
          description: "Only you can view your profile",
          color: "text-gray-600 bg-gray-100",
        };
    }
  };

  const visibilityInfo = getVisibilityInfo(privacy.profileVisibility);

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${visibilityInfo.color}`}>
                {visibilityInfo.icon}
              </div>
              <div>
                <CardTitle>Profile Visibility</CardTitle>
                <CardDescription>
                  Control who can view your profile
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">{visibilityInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visibility Selector */}
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => updatePrivacy({ profileVisibility: "public" })}
                disabled={disabled}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left
                  ${
                    privacy.profileVisibility === "public"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="p-2 rounded-lg bg-blue-100">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view your profile and activity
                  </p>
                </div>
                {privacy.profileVisibility === "public" && (
                  <Badge variant="default" className="ml-auto">
                    Active
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => updatePrivacy({ profileVisibility: "friends" })}
                disabled={disabled}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left
                  ${
                    privacy.profileVisibility === "friends"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Friends Only</p>
                  <p className="text-sm text-muted-foreground">
                    Only your connections can view your profile
                  </p>
                </div>
                {privacy.profileVisibility === "friends" && (
                  <Badge variant="default" className="ml-auto">
                    Active
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => updatePrivacy({ profileVisibility: "private" })}
                disabled={disabled}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left
                  ${
                    privacy.profileVisibility === "private"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="p-2 rounded-lg bg-gray-100">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Private</p>
                  <p className="text-sm text-muted-foreground">
                    Only you can view your profile
                  </p>
                </div>
                {privacy.profileVisibility === "private" && (
                  <Badge variant="default" className="ml-auto">
                    Active
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Choose what contact info is visible on your profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="show-email" className="font-medium">
                  Show Email Address
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display your email on your public profile
                </p>
              </div>
            </div>
            <Switch
              id="show-email"
              checked={privacy.showEmail}
              onCheckedChange={(checked) =>
                updatePrivacy({ showEmail: checked })
              }
              disabled={disabled}
            />
          </div>

          <Separator />

          {/* Show Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="show-phone" className="font-medium">
                  Show Phone Number
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display your phone number on your public profile
                </p>
              </div>
            </div>
            <Switch
              id="show-phone"
              checked={privacy.showPhone}
              onCheckedChange={(checked) =>
                updatePrivacy({ showPhone: checked })
              }
              disabled={disabled}
            />
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Even if contact information is hidden, farmers you order from
                will have access to your email and phone for order fulfillment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Control how others can communicate with you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Allow Messaging */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-messaging" className="font-medium">
                Allow Direct Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Let other users send you direct messages
              </p>
            </div>
            <Switch
              id="allow-messaging"
              checked={privacy.allowMessaging}
              onCheckedChange={(checked) =>
                updatePrivacy({ allowMessaging: checked })
              }
              disabled={disabled}
            />
          </div>

          {!privacy.allowMessaging && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  Direct messages are disabled. You can still communicate with
                  farmers through order messages.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle>Data Sharing</CardTitle>
              <CardDescription>
                Manage how your data is used and shared
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Sharing Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-sharing" className="font-medium">
                Share Data with Partners
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow us to share anonymized data with trusted partners
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={privacy.dataSharing}
              onCheckedChange={(checked) =>
                updatePrivacy({ dataSharing: checked })
              }
              disabled={disabled}
            />
          </div>

          {/* Data Sharing Info */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">What we share:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Anonymized purchase patterns and preferences</li>
              <li>General location data (city/region only)</li>
              <li>Product interests and categories</li>
            </ul>
            <p className="font-medium text-foreground mt-3">
              What we never share:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Your name, email, or phone number</li>
              <li>Specific order details or payment information</li>
              <li>Your exact location or address</li>
            </ul>
          </div>

          <Separator />

          {/* Privacy Policy Link */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Read our full privacy policy
            </p>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              View Policy →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Privacy Summary</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Profile:{" "}
                  <span className="font-medium">{visibilityInfo.label}</span>
                </p>
                <p>
                  Email visible:{" "}
                  <span className="font-medium">
                    {privacy.showEmail ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Phone visible:{" "}
                  <span className="font-medium">
                    {privacy.showPhone ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  Direct messages:{" "}
                  <span className="font-medium">
                    {privacy.allowMessaging ? "Enabled" : "Disabled"}
                  </span>
                </p>
                <p>
                  Data sharing:{" "}
                  <span className="font-medium">
                    {privacy.dataSharing ? "Enabled" : "Disabled"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
