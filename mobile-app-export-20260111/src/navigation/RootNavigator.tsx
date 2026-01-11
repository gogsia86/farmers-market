/**
 * 🌾 Farmers Market Mobile App - Root Navigator
 * Complete navigation structure with all screens
 *
 * Navigation Architecture:
 * - Auth Stack (Welcome, Login, Register, ForgotPassword)
 * - Main Tab Navigator (Home, Products, Cart, Orders, Profile)
 * - Stack screens for detail views
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { theme } from "../theme";

// ========================================
// 🧭 NAVIGATION TYPES
// ========================================

export type RootStackParamList = {
  // Auth
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  // Main
  MainTabs: undefined;
  // Stack Screens
  ProductDetail: { productId: string };
  FarmDetail: { farmId: string };
  OrderDetail: { orderId: string };
  Checkout: undefined;
  Search: undefined;
  Farms: undefined;
  Favorites: undefined;
  Deals: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ScreenProps {
  navigation: NavigationProp;
}

interface DetailScreenProps<T extends keyof RootStackParamList> {
  navigation: NavigationProp;
  route: RouteProp<RootStackParamList, T>;
}

// ========================================
// 📱 SCREEN IMPORTS
// ========================================

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";

// Main Screens
import HomeScreen from "../screens/home/HomeScreen";
import ProductListScreen from "../screens/products/ProductListScreen";
import CartScreen from "../screens/cart/CartScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";

// ========================================
// 🎯 PLACEHOLDER SCREENS
// ========================================

// Register Screen Placeholder
const RegisterScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>📝</Text>
    <Text style={styles.placeholderTitle}>Create Account</Text>
    <Text style={styles.placeholderText}>Registration coming soon!</Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Forgot Password Screen Placeholder
const ForgotPasswordScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🔑</Text>
    <Text style={styles.placeholderTitle}>Reset Password</Text>
    <Text style={styles.placeholderText}>Password reset coming soon!</Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Product Detail Screen Placeholder
const ProductDetailScreen = ({
  route,
  navigation,
}: DetailScreenProps<"ProductDetail">) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🥬</Text>
    <Text style={styles.placeholderTitle}>Product Details</Text>
    <Text style={styles.placeholderText}>
      Product ID: {route.params?.productId || "N/A"}
    </Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Farm Detail Screen Placeholder
const FarmDetailScreen = ({
  route,
  navigation,
}: DetailScreenProps<"FarmDetail">) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🌾</Text>
    <Text style={styles.placeholderTitle}>Farm Details</Text>
    <Text style={styles.placeholderText}>
      Farm ID: {route.params?.farmId || "N/A"}
    </Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Order Detail Screen Placeholder
const OrderDetailScreen = ({
  route,
  navigation,
}: DetailScreenProps<"OrderDetail">) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>📦</Text>
    <Text style={styles.placeholderTitle}>Order Details</Text>
    <Text style={styles.placeholderText}>
      Order ID: {route.params?.orderId || "N/A"}
    </Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Checkout Screen Placeholder
const CheckoutScreenPlaceholder = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>💳</Text>
    <Text style={styles.placeholderTitle}>Checkout</Text>
    <Text style={styles.placeholderText}>Secure checkout coming soon!</Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Profile Screen Placeholder
const ProfileScreen = (_props: ScreenProps) => {
  const { logout, user } = useAuthStore();

  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderEmoji}>👤</Text>
      <Text style={styles.placeholderTitle}>Profile</Text>
      <Text style={styles.placeholderText}>
        {user?.name || user?.email || "Guest User"}
      </Text>
      <TouchableOpacity style={styles.placeholderButton} onPress={logout}>
        <Text style={styles.placeholderButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Search Screen Placeholder
const SearchScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🔍</Text>
    <Text style={styles.placeholderTitle}>Search</Text>
    <Text style={styles.placeholderText}>
      Search functionality coming soon!
    </Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Farms List Screen Placeholder
const FarmsScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🌾</Text>
    <Text style={styles.placeholderTitle}>Farms</Text>
    <Text style={styles.placeholderText}>Farm listings coming soon!</Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Favorites Screen Placeholder
const FavoritesScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>❤️</Text>
    <Text style={styles.placeholderTitle}>Favorites</Text>
    <Text style={styles.placeholderText}>Your favorites coming soon!</Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Deals Screen Placeholder
const DealsScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🏷️</Text>
    <Text style={styles.placeholderTitle}>Deals</Text>
    <Text style={styles.placeholderText}>Special deals coming soon!</Text>
    <TouchableOpacity
      style={styles.placeholderButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.placeholderButtonText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// Welcome Screen
const WelcomeScreen = ({ navigation }: ScreenProps) => (
  <View style={styles.welcomeContainer}>
    <Text style={styles.welcomeEmoji}>🌾</Text>
    <Text style={styles.welcomeTitle}>Welcome to Farmers Market</Text>
    <Text style={styles.welcomeSubtitle}>
      Fresh, local produce from your favorite farmers
    </Text>
    <TouchableOpacity
      style={styles.welcomeButton}
      onPress={() => navigation.navigate("Login")}
    >
      <Text style={styles.welcomeButtonText}>Get Started</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.guestButton}
      onPress={() => navigation.navigate("MainTabs")}
    >
      <Text style={styles.guestButtonText}>Continue as Guest</Text>
    </TouchableOpacity>
  </View>
);

// Navigation types are defined at the top of the file

// ========================================
// 🧭 NAVIGATORS
// ========================================

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Tab Bar Icon Component
const TabBarIcon = ({
  icon,
  focused,
  badge,
}: {
  icon: string;
  focused: boolean;
  badge?: number;
}) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </Text>
    {badge && badge > 0 && (
      <View style={styles.tabBadge}>
        <Text style={styles.tabBadgeText}>{badge > 99 ? "99+" : badge}</Text>
      </View>
    )}
  </View>
);

// Main Tabs Navigator
const MainTabsNavigator = () => {
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductListScreen}
        options={{
          tabBarLabel: "Products",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="🥬" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="🛒" focused={focused} badge={cartCount} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="📦" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ========================================
// 🚀 ROOT NAVIGATOR
// ========================================

export default function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        </>
      )}

      {/* Modal/Stack Screens accessible from anywhere */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="FarmDetail"
        component={FarmDetailScreen}
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="Farms"
        component={FarmsScreen}
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="Deals"
        component={DealsScreen}
        options={{ presentation: "card" }}
      />
    </Stack.Navigator>
  );
}

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  // Tab Bar
  tabBar: {
    backgroundColor: theme.colors.background.primary,
    borderTopColor: theme.colors.border.light,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  tabIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  tabIcon: {
    fontSize: 24,
    opacity: 0.6,
  },

  tabIconFocused: {
    opacity: 1,
  },

  tabBadge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error.main,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  tabBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: "700",
  },

  // Placeholder Screens
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    padding: 24,
  },

  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },

  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },

  placeholderText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
  },

  placeholderButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },

  placeholderButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },

  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    padding: 24,
  },

  welcomeEmoji: {
    fontSize: 100,
    marginBottom: 32,
  },

  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },

  welcomeSubtitle: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 27,
    paddingHorizontal: 20,
  },

  welcomeButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    marginBottom: 16,
  },

  welcomeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: "600",
  },

  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  guestButtonText: {
    color: theme.colors.primary[500],
    fontSize: 16,
    fontWeight: "500",
  },
});
