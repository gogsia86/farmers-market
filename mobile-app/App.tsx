/**
 * 🌾 Farmers Market Mobile App - Main Entry Point
 * Simplified working version with minimal dependencies
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

// Navigation
import RootNavigator from "./src/navigation/RootNavigator";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

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
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
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
