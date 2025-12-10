/**
 * 🌾 Farmers Market Mobile App - Main Entry Point
 * Full-featured version with Stripe payment integration
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

// Store
import { useAuthStore } from "./src/stores/authStore";

// Providers
import { StripePaymentProvider } from "./src/providers/StripeProvider";

// Navigation
import RootNavigator from "./src/navigation/RootNavigator";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

/**
 * Main App Component
 */
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { hasHydrated } = useAuthStore();

  /**
   * Initialize app and wait for stores to hydrate
   */
  useEffect(() => {
    async function prepare() {
      try {
        console.log("🌾 Initializing Farmers Market App...");

        // Wait for auth store to hydrate from AsyncStorage
        let attempts = 0;
        while (!hasHydrated && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        // Log Stripe initialization status
        if (STRIPE_PUBLISHABLE_KEY) {
          console.log("💳 Stripe integration enabled");
        } else {
          console.warn(
            "⚠️ Stripe publishable key not found. Payment features may be limited.",
          );
        }

        console.log("✅ App initialization complete");
      } catch (error) {
        console.error("❌ App initialization error:", error);
      } finally {
        setAppIsReady(true);
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [hasHydrated]);

  // Show loading while app prepares
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>🌾 Loading Farmers Market...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripePaymentProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.com.farmersmarket"
        >
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </StripePaymentProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
});
