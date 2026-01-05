/**
 * ⚙️ USER SETTINGS PAGE - Divine Configuration Experience
 * Comprehensive settings management for user profiles, notifications, and preferences
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { SettingsClient } from "@/components/features/settings/SettingsClient";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings | Farmers Market Platform",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  // ==========================================================================
  // AUTHENTICATION CHECK
  // ==========================================================================
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/settings");
  }

  const userId = session.user.id;

  // ==========================================================================
  // FETCH USER DATA
  // ==========================================================================
  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      emailVerified: true,
      phoneVerified: true,
      dietaryPreferences: true,
      notificationPreferences: true,
      privacySettings: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // ==========================================================================
  // FETCH USER SETTINGS
  // ==========================================================================
  const userSettings = await database.userSettings.findUnique({
    where: { userId },
  });

  // ==========================================================================
  // FETCH USER ADDRESSES
  // ==========================================================================
  const addresses = await database.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  // ==========================================================================
  // FETCH NOTIFICATION PREFERENCES V2
  // ==========================================================================
  const notificationPreferencesV2 = await database.notificationPreferencesV2.findUnique({
    where: { userId },
  });

  // ==========================================================================
  // PREPARE SETTINGS DATA
  // ==========================================================================
  const settingsData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      name: user.name || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    settings: userSettings
      ? {
        theme: userSettings.theme,
        language: userSettings.language,
        timezone: userSettings.timezone,
        distanceUnit: userSettings.distanceUnit,
        currency: userSettings.currency,
        profileVisibility: userSettings.profileVisibility,
        showEmail: userSettings.showEmail,
        showPhone: userSettings.showPhone,
        allowMessaging: userSettings.allowMessaging,
        dataSharing: userSettings.dataSharing,
        contactMethod: userSettings.contactMethod,
        communicationFrequency: userSettings.communicationFrequency,
      }
      : {
        theme: "light",
        language: "en",
        timezone: "UTC",
        distanceUnit: "miles",
        currency: "USD",
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        allowMessaging: true,
        dataSharing: false,
        contactMethod: "email",
        communicationFrequency: "normal",
      },
    addresses: addresses.map((addr) => ({
      id: addr.id,
      type: addr.type,
      label: addr.label || "",
      street: addr.street,
      street2: addr.street2 || "",
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString(),
    })),
    notificationPreferences: notificationPreferencesV2
      ? {
        emailEnabled: notificationPreferencesV2.emailEnabled,
        emailFrequency: notificationPreferencesV2.emailFrequency,
        smsEnabled: notificationPreferencesV2.smsEnabled,
        smsFrequency: notificationPreferencesV2.smsFrequency,
        pushEnabled: notificationPreferencesV2.pushEnabled,
        pushFrequency: notificationPreferencesV2.pushFrequency,
        inAppEnabled: notificationPreferencesV2.inAppEnabled,
        inAppSound: notificationPreferencesV2.inAppSound,
        inAppBadge: notificationPreferencesV2.inAppBadge,
      }
      : {
        emailEnabled: true,
        emailFrequency: "immediate",
        smsEnabled: false,
        smsFrequency: "immediate",
        pushEnabled: true,
        pushFrequency: "immediate",
        inAppEnabled: true,
        inAppSound: true,
        inAppBadge: true,
      },
    dietaryPreferences: user.dietaryPreferences as any,
    privacySettings: user.privacySettings as any,
  };

  // ==========================================================================
  // RENDER CLIENT COMPONENT
  // ==========================================================================
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Client Component */}
        <SettingsClient initialData={settingsData} />
      </div>
    </main>
  );
}
