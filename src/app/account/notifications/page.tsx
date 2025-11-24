/**
 * 📧 EMAIL NOTIFICATION SETTINGS PAGE
 *
 * Manage email preferences for:
 * - Order notifications
 * - Product updates
 * - Farm newsletters
 * - Marketing emails
 * - Account security alerts
 *
 * DIVINE PRINCIPLES:
 * - User control over communications
 * - Clear opt-in/opt-out
 * - GDPR compliant
 * - Agricultural consciousness in messaging
 */

"use client";

import { Header } from "@/components/layout/Header";
import {
  Bell,
  CheckCircle,
  Leaf,
  Mail,
  MessageSquare,
  Save,
  Shield,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  category: "orders" | "products" | "marketing" | "security" | "social";
  enabled: boolean;
  icon: any;
}

export default function EmailNotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "order-confirmation",
      title: "Order Confirmations",
      description: "Get notified when your order is placed and confirmed",
      category: "orders",
      enabled: true,
      icon: ShoppingBag,
    },
    {
      id: "order-shipping",
      title: "Shipping Updates",
      description: "Track your order with delivery and shipping notifications",
      category: "orders",
      enabled: true,
      icon: Bell,
    },
    {
      id: "order-delivered",
      title: "Delivery Confirmations",
      description: "Know when your order has been successfully delivered",
      category: "orders",
      enabled: true,
      icon: CheckCircle,
    },
    {
      id: "product-restock",
      title: "Product Restocks",
      description:
        "Get notified when out-of-stock products become available again",
      category: "products",
      enabled: true,
      icon: Leaf,
    },
    {
      id: "product-new",
      title: "New Products",
      description:
        "Be the first to know about new products from your favorite farms",
      category: "products",
      enabled: false,
      icon: Leaf,
    },
    {
      id: "product-seasonal",
      title: "Seasonal Availability",
      description: "Get alerts when seasonal products are back in stock",
      category: "products",
      enabled: true,
      icon: Leaf,
    },
    {
      id: "farm-newsletters",
      title: "Farm Newsletters",
      description: "Receive updates and stories directly from farms you follow",
      category: "marketing",
      enabled: true,
      icon: Mail,
    },
    {
      id: "promotions",
      title: "Special Offers & Promotions",
      description: "Get exclusive deals and discounts from local farms",
      category: "marketing",
      enabled: false,
      icon: Mail,
    },
    {
      id: "weekly-digest",
      title: "Weekly Digest",
      description: "A curated summary of new products and farm updates",
      category: "marketing",
      enabled: false,
      icon: Mail,
    },
    {
      id: "security-login",
      title: "Login Alerts",
      description: "Security notifications when someone logs into your account",
      category: "security",
      enabled: true,
      icon: Shield,
    },
    {
      id: "security-password",
      title: "Password Changes",
      description: "Get notified when your password is changed",
      category: "security",
      enabled: true,
      icon: Shield,
    },
    {
      id: "messages",
      title: "Direct Messages",
      description: "Receive notifications when farms or customers message you",
      category: "social",
      enabled: true,
      icon: MessageSquare,
    },
    {
      id: "reviews",
      title: "Review Reminders",
      description: "Gentle reminders to review products you've purchased",
      category: "social",
      enabled: false,
      icon: MessageSquare,
    },
  ]);

  const [saved, setSaved] = useState(false);

  const toggleSetting = (id: string) => {
    setSettings(
      settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const handleSave = async () => {
    // TODO: Save settings to backend
    // await fetch('/api/user/notifications', { method: 'PUT', body: JSON.stringify(settings) })
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const categoryGroups = {
    orders: {
      title: "Order Notifications",
      description: "Stay updated on your order status",
      icon: ShoppingBag,
    },
    products: {
      title: "Product Updates",
      description: "Get alerts about product availability",
      icon: Leaf,
    },
    marketing: {
      title: "Marketing & Newsletters",
      description: "Promotional content and farm updates",
      icon: Mail,
    },
    security: {
      title: "Security Alerts",
      description: "Important account security notifications (recommended)",
      icon: Shield,
    },
    social: {
      title: "Social & Community",
      description: "Messages and community interactions",
      icon: MessageSquare,
    },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-agricultural-600">
                  Home
                </Link>
                <span>/</span>
                <Link href="/account" className="hover:text-agricultural-600">
                  Account
                </Link>
                <span>/</span>
                <span className="text-gray-900">Email Notifications</span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Email Notification Settings
              </h1>
              <p className="text-xl text-gray-600">
                Choose which emails you'd like to receive from us
              </p>
            </div>

            {/* Save Success Message */}
            {saved && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-900 font-medium">
                  Your notification preferences have been saved successfully!
                </span>
              </div>
            )}

            {/* Settings Groups */}
            <div className="space-y-6">
              {Object.entries(categoryGroups).map(([category, info]) => {
                const categorySettings = settings.filter(
                  (s) => s.category === category,
                );

                return (
                  <div
                    key={category}
                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-agricultural-50 to-green-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-agricultural-600 rounded-full flex items-center justify-center">
                          <info.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {info.title}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Settings List */}
                    <div className="divide-y divide-gray-200">
                      {categorySettings.map((setting) => {
                        const Icon = setting.icon;
                        return (
                          <div
                            key={setting.id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="mt-1">
                                  <Icon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {setting.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {setting.description}
                                  </p>
                                </div>
                              </div>

                              {/* Toggle Switch */}
                              <button
                                onClick={() => toggleSetting(setting.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-agricultural-600 focus:ring-offset-2 ${
                                  setting.enabled
                                    ? "bg-agricultural-600"
                                    : "bg-gray-200"
                                }`}
                                role="switch"
                                aria-checked={setting.enabled}
                                aria-label={`Toggle ${setting.title}`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    setting.enabled
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center justify-between bg-white rounded-2xl shadow-md p-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Save Your Preferences
                </h3>
                <p className="text-sm text-gray-600">
                  Changes will take effect immediately
                </p>
              </div>
              <button
                onClick={handleSave}
                className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                Save Settings
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">About Security Alerts</p>
                  <p>
                    We strongly recommend keeping security notifications enabled
                    to protect your account. These notifications help you stay
                    aware of important account activity.
                  </p>
                </div>
              </div>
            </div>

            {/* Unsubscribe Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>
                You can also unsubscribe from marketing emails by clicking the
                unsubscribe link at the bottom of any promotional email we send
                you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
