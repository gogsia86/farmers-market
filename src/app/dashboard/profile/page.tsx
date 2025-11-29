/**
 * CONSUMER PROFILE PAGE - WIREFRAME IMPLEMENTATION
 *
 * Complete profile management with:
 * - Personal information editing
 * - Avatar upload
 * - Password change
 * - Notification preferences
 * - Account settings
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  dietaryPreferences: string[];
  notificationPreferences: {
    email: {
      orderUpdates: boolean;
      promotions: boolean;
      newsletter: boolean;
    };
    sms: {
      orderUpdates: boolean;
      deliveryAlerts: boolean;
    };
    push: {
      orderUpdates: boolean;
      newProducts: boolean;
    };
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: null,
    dietaryPreferences: [],
    notificationPreferences: {
      email: {
        orderUpdates: true,
        promotions: true,
        newsletter: false,
      },
      sms: {
        orderUpdates: true,
        deliveryAlerts: true,
      },
      push: {
        orderUpdates: true,
        newProducts: false,
      },
    },
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard/profile");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile");
      const data = await response.json();

      if (data.success) {
        setProfile({
          firstName: data.profile.firstName || "",
          lastName: data.profile.lastName || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          avatar: data.profile.avatar || null,
          dietaryPreferences: data.profile.dietaryPreferences || [],
          notificationPreferences: data.profile.notificationPreferences || profile.notificationPreferences,
        });
        setAvatarPreview(data.profile.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 5MB" });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "File must be an image" });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("firstName", profile.firstName);
      formData.append("lastName", profile.lastName);
      formData.append("phone", profile.phone);
      formData.append("dietaryPreferences", JSON.stringify(profile.dietaryPreferences));

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: `${profile.firstName} ${profile.lastName}`,
            image: data.profile.avatar,
          },
        });
        setAvatarFile(null);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validation
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationPreferences: profile.notificationPreferences,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Notification preferences updated!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update preferences" });
      }
    } catch (error) {
      console.error("Notification update error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const toggleDietaryPreference = (pref: string) => {
    setProfile((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter((p) => p !== pref)
        : [...prev.dietaryPreferences, pref],
    }));
  };

  if (status === "loading" || loading) {
    return <ProfileSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your profile, password, and notification preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-2 border-green-200"
                : "bg-red-50 text-red-800 border-2 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "profile"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "password"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                🔒 Password
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                🔔 Notifications
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="p-6">
              {/* Avatar Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Picture
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                          👤
                        </div>
                      )}
                    </div>
                    {avatarFile && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="btn-outline cursor-pointer inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      Choose Photo
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-8" />

              {/* Personal Information */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    className="input-field bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="input-field"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <hr className="my-8" />

              {/* Dietary Preferences */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dietary Preferences
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us personalize your shopping experience
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  "Organic",
                  "Vegan",
                  "Vegetarian",
                  "Gluten-Free",
                  "Dairy-Free",
                  "Keto",
                  "Paleo",
                  "Non-GMO",
                  "Local Only",
                ].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleDietaryPreference(pref)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      profile.dietaryPreferences.includes(pref)
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {profile.dietaryPreferences.includes(pref) && "✓ "}
                    {pref}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-green flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => fetchProfile()}
                  className="btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Password
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Ensure your account is using a strong password
              </p>

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    At least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                  className="btn-outline"
                  disabled={saving}
                >
                  Clear
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <form onSubmit={handleNotificationsSubmit} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose how you want to be notified
              </p>

              {/* Email Notifications */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-3">📧 Email</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.email.orderUpdates}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            email: {
                              ...profile.notificationPreferences.email,
                              orderUpdates: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">
                        Notifications about your order status
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.email.promotions}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            email: {
                              ...profile.notificationPreferences.email,
                              promotions: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Promotions</p>
                      <p className="text-sm text-gray-600">
                        Special offers from your favorite farms
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.email.newsletter}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            email: {
                              ...profile.notificationPreferences.email,
                              newsletter: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Newsletter</p>
                      <p className="text-sm text-gray-600">
                        Weekly updates and farming tips
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-3">💬 SMS</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.sms.orderUpdates}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            sms: {
                              ...profile.notificationPreferences.sms,
                              orderUpdates: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">
                        Text alerts for order changes
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.sms.deliveryAlerts}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            sms: {
                              ...profile.notificationPreferences.sms,
                              deliveryAlerts: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Delivery Alerts</p>
                      <p className="text-sm text-gray-600">
                        When your order is out for delivery
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-3">🔔 Push</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.push.orderUpdates}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            push: {
                              ...profile.notificationPreferences.push,
                              orderUpdates: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">
                        Browser notifications for orders
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.push.newProducts}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            push: {
                              ...profile.notificationPreferences.push,
                              newProducts: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">New Products</p>
                      <p className="text-sm text-gray-600">
                        When farms add new seasonal items
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-green flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-24 bg-gray-200 rounded-full w-24 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
