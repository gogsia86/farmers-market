/**
 * ⚙️ CUSTOMER SETTINGS PAGE
 * Divine implementation of customer settings and configuration
 * Sprint 5: Settings & Configuration
 * Features: Notifications, Display, Privacy, Account Management
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerSettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings - Customer Dashboard",
  description: "Manage your account settings and preferences",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Customer Settings Page (Server Component)
 * Handles authentication and renders client component
 */
export default async function CustomerSettingsPage() {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/customer/settings");
  }

  // Redirect if not a customer
  if (session.user.role !== "CUSTOMER" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8"
      data-testid="customer-settings-page"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your preferences, privacy, and account settings
          </p>
        </div>

        {/* Settings Client Component */}
        <CustomerSettingsClient
          userId={session.user.id}
          userRole={session.user.role}
        />
      </div>
    </div>
  );
}
