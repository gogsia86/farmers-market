/**
 * 👤 PROFILE SCREEN - Divine User Account Management
 *
 * Comprehensive user profile with:
 * - User information display and edit
 * - Order history quick access
 * - Address management
 * - Payment methods
 * - App settings
 * - Logout functionality
 *
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/api";
import { colors, spacing, typography, shadows, borderRadius } from "@/theme";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: "CUSTOMER" | "FARMER" | "ADMIN";
  createdAt: string;
  ordersCount?: number;
  totalSpent?: number;
  favoriteProductsCount?: number;
}

interface QuickStats {
  orders: number;
  favorites: number;
  reviews: number;
  loyalty: number;
}

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
  onPress: () => void;
  badge?: number | string;
  showArrow?: boolean;
  destructive?: boolean;
}

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  type: "toggle" | "navigation" | "action";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Addresses: undefined;
  PaymentMethods: undefined;
  Favorites: undefined;
  Settings: undefined;
  Help: undefined;
  Login: undefined;
  FarmerDashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Profile Header with Avatar and Basic Info
 */
const ProfileHeader: React.FC<{
  profile: UserProfile | null;
  onEditPress: () => void;
  isLoading: boolean;
}> = ({ profile, onEditPress, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.skeletonName} />
            <View style={styles.skeletonEmail} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {profile?.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile?.firstName?.charAt(0)?.toUpperCase() || "?"}
              {profile?.lastName?.charAt(0)?.toUpperCase() || ""}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>
          {profile?.role === "FARMER" && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🌾 Farmer</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Quick Stats Section
 */
const QuickStatsSection: React.FC<{
  stats: QuickStats;
  onStatPress: (stat: string) => void;
}> = ({ stats, onStatPress }) => {
  const statItems = [
    { key: "orders", label: "Orders", value: stats.orders, icon: "📦" },
    {
      key: "favorites",
      label: "Favorites",
      value: stats.favorites,
      icon: "❤️",
    },
    { key: "reviews", label: "Reviews", value: stats.reviews, icon: "⭐" },
    { key: "loyalty", label: "Points", value: stats.loyalty, icon: "🏆" },
  ];

  return (
    <View style={styles.statsContainer}>
      {statItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.statItem}
          onPress={() => onStatPress(item.key)}
        >
          <Text style={styles.statIcon}>{item.icon}</Text>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Menu Item Component
 */
const MenuItemComponent: React.FC<{
  item: MenuItem;
}> = ({ item }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, item.destructive && styles.menuItemDestructive]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuItemIcon}>{item.icon}</Text>
        <View style={styles.menuItemTextContainer}>
          <Text
            style={[
              styles.menuItemLabel,
              item.destructive && styles.menuItemLabelDestructive,
            ]}
          >
            {item.label}
          </Text>
          {item.description && (
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge !== undefined && (
          <View style={styles.menuItemBadge}>
            <Text style={styles.menuItemBadgeText}>{item.badge}</Text>
          </View>
        )}
        {item.showArrow !== false && (
          <Text style={styles.menuItemArrow}>→</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Setting Item with Toggle
 */
const SettingItemComponent: React.FC<{
  item: SettingItem;
}> = ({ item }) => {
  if (item.type === "toggle") {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingItemLeft}>
          <Text style={styles.settingIcon}>{item.icon}</Text>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.neutral[300], true: colors.primary[400] }}
          thumbColor={item.value ? colors.primary[600] : colors.neutral[100]}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{item.icon}</Text>
        <Text style={styles.settingLabel}>{item.label}</Text>
      </View>
      <Text style={styles.settingArrow}>→</Text>
    </TouchableOpacity>
  );
};

/**
 * Section Container
 */
const SectionContainer: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, isAuthenticated } = useAuthStore();

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<QuickStats>({
    orders: 0,
    favorites: 0,
    reviews: 0,
    loyalty: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.user.getProfile();
      const data = response.data || response;

      setProfile({
        id: data.id,
        email: data.email,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone,
        avatar: data.avatar || data.image,
        role: data.role || "CUSTOMER",
        createdAt: data.createdAt,
        ordersCount: data.ordersCount || data._count?.orders,
        totalSpent: data.totalSpent,
        favoriteProductsCount:
          data.favoriteProductsCount || data._count?.favorites,
      });

      // Update stats
      setStats({
        orders: data.ordersCount || data._count?.orders || 0,
        favorites: data.favoriteProductsCount || data._count?.favorites || 0,
        reviews: data.reviewsCount || data._count?.reviews || 0,
        loyalty: data.loyaltyPoints || 0,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Use user from auth store as fallback
      if (user) {
        setProfile({
          id: user.id || "user-id",
          email: user.email || "",
          firstName: user.firstName || user.name?.split(" ")[0] || "",
          lastName:
            user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
          phone: user.phone,
          avatar: user.avatar || user.image,
          role: (user.role as any) || "CUSTOMER",
          createdAt: user.createdAt || new Date().toISOString(),
        });
      }
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await fetchProfile();
    setIsLoading(false);
  }, [fetchProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfile();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  // ========================================
  // HANDLERS
  // ========================================

  const handleStatPress = (stat: string) => {
    switch (stat) {
      case "orders":
        navigation.navigate("Orders");
        break;
      case "favorites":
        navigation.navigate("Favorites");
        break;
      case "reviews":
        // Navigate to user reviews
        break;
      case "loyalty":
        // Navigate to loyalty program
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(
              "Coming Soon",
              "Account deletion will be available soon.",
            );
          },
        },
      ],
    );
  };

  // ========================================
  // MENU ITEMS
  // ========================================

  const accountMenuItems: MenuItem[] = [
    {
      id: "orders",
      icon: "📦",
      label: "My Orders",
      description: "View order history and track deliveries",
      onPress: () => navigation.navigate("Orders"),
      badge: stats.orders > 0 ? stats.orders : undefined,
    },
    {
      id: "addresses",
      icon: "📍",
      label: "Addresses",
      description: "Manage delivery addresses",
      onPress: () => navigation.navigate("Addresses"),
    },
    {
      id: "payments",
      icon: "💳",
      label: "Payment Methods",
      description: "Manage payment options",
      onPress: () => navigation.navigate("PaymentMethods"),
    },
    {
      id: "favorites",
      icon: "❤️",
      label: "Favorites",
      description: "Products you love",
      onPress: () => navigation.navigate("Favorites"),
      badge: stats.favorites > 0 ? stats.favorites : undefined,
    },
  ];

  // Add farmer dashboard if user is a farmer
  if (profile?.role === "FARMER") {
    accountMenuItems.unshift({
      id: "farmer-dashboard",
      icon: "🌾",
      label: "Farmer Dashboard",
      description: "Manage your farm and products",
      onPress: () => navigation.navigate("FarmerDashboard"),
    });
  }

  const supportMenuItems: MenuItem[] = [
    {
      id: "help",
      icon: "❓",
      label: "Help & Support",
      onPress: () => navigation.navigate("Help"),
    },
    {
      id: "feedback",
      icon: "💬",
      label: "Send Feedback",
      onPress: () => {
        Alert.alert(
          "Feedback",
          "Thank you for using Farmers Market! We value your feedback.",
        );
      },
    },
    {
      id: "about",
      icon: "ℹ️",
      label: "About",
      onPress: () => {
        Alert.alert(
          "Farmers Market",
          "Version 1.0.0\n\nConnecting local farmers with their community.\n\n🌾 Fresh • Local • Sustainable",
        );
      },
    },
  ];

  const settingItems: SettingItem[] = [
    {
      id: "push",
      icon: "🔔",
      label: "Push Notifications",
      type: "toggle",
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      id: "email",
      icon: "✉️",
      label: "Email Notifications",
      type: "toggle",
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
    {
      id: "dark",
      icon: "🌙",
      label: "Dark Mode",
      type: "toggle",
      value: darkMode,
      onToggle: setDarkMode,
    },
  ];

  // ========================================
  // RENDER
  // ========================================

  if (!isAuthenticated) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInEmoji}>👋</Text>
        <Text style={styles.notLoggedInTitle}>Welcome to Farmers Market</Text>
        <Text style={styles.notLoggedInText}>
          Sign in to access your profile, orders, and favorites.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          onEditPress={() => navigation.navigate("EditProfile")}
          isLoading={isLoading}
        />

        {/* Quick Stats */}
        <QuickStatsSection stats={stats} onStatPress={handleStatPress} />

        {/* Account Section */}
        <SectionContainer title="Account">
          {accountMenuItems.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </SectionContainer>

        {/* Settings Section */}
        <SectionContainer title="Settings">
          {settingItems.map((item) => (
            <SettingItemComponent key={item.id} item={item} />
          ))}
        </SectionContainer>

        {/* Support Section */}
        <SectionContainer title="Support">
          {supportMenuItems.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </SectionContainer>

        {/* Logout & Delete */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Farmers Market v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Farmers Market</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  // Screen Header
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingTop: Platform.OS === "ios" ? spacing[12] : spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  screenTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 24,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[24],
  },

  // Profile Header
  headerContainer: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[5],
    marginBottom: spacing[2],
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  roleBadge: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
    marginTop: spacing[2],
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary[700],
    fontWeight: typography.fontWeight.medium,
  },
  editButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },

  // Skeleton Loading
  skeletonName: {
    width: 120,
    height: 20,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
    marginBottom: spacing[2],
  },
  skeletonEmail: {
    width: 180,
    height: 16,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
  },

  // Quick Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[4],
    marginBottom: spacing[2],
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },

  // Section
  sectionContainer: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing[2],
    paddingTop: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  sectionContent: {},

  // Menu Item
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuItemDestructive: {
    backgroundColor: colors.error.light,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: spacing[3],
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  menuItemLabelDestructive: {
    color: colors.error.main,
  },
  menuItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  menuItemBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[2],
  },
  menuItemBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  menuItemArrow: {
    fontSize: 16,
    color: colors.text.tertiary,
  },

  // Setting Item
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    fontSize: 22,
    marginRight: spacing[3],
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  settingArrow: {
    fontSize: 16,
    color: colors.text.tertiary,
  },

  // Danger Zone
  dangerZone: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: spacing[2],
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  deleteButton: {
    alignItems: "center",
    paddingVertical: spacing[3],
  },
  deleteText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.main,
  },

  // Version Info
  versionContainer: {
    alignItems: "center",
    marginTop: spacing[6],
    paddingBottom: spacing[4],
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  copyrightText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },

  // Not Logged In
  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.background.primary,
  },
  notLoggedInEmoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  notLoggedInTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  notLoggedInText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[6],
    lineHeight: 22,
  },
  loginButton: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});

export default ProfileScreen;
