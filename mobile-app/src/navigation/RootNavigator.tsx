/**
 * 🌾 Farmers Market Mobile App - Root Navigator
 * Simplified working version with only existing screens
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuthStore } from "../stores/authStore";

// Import existing screens
import LoginScreen from "../screens/auth/LoginScreen";

// Placeholder screens until we create them
const HomeScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderEmoji}>🏠</Text>
    <Text style={styles.placeholderTitle}>Home Screen</Text>
    <Text style={styles.placeholderText}>Coming Soon!</Text>
  </View>
);

const WelcomeScreen = ({ navigation }: any) => {
  return (
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
    </View>
  );
};

// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 */
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
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  // Placeholder styles
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
  },

  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  welcomeEmoji: {
    fontSize: 100,
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 27,
    paddingHorizontal: 20,
  },
  welcomeButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  welcomeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
