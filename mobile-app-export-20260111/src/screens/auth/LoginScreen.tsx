// 🌾 Farmers Market Mobile App - Login Screen
// Divine authentication with agricultural consciousness

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { theme } from "../../theme";
import { useAuthStore } from "../../stores/authStore";

// ========================================
// 🎯 TYPES
// ========================================

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const LoginScreen = ({ navigation }: any) => {
  // ========================================
  // 🔄 STATE
  // ========================================

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [rememberMe, setRememberMe] = useState(true);

  const { login, isLoading, error: authError, clearError } = useAuthStore();

  // ========================================
  // 🔄 EFFECTS
  // ========================================

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, []);

  useEffect(() => {
    // Show alert if auth error occurs
    if (authError) {
      Alert.alert(
        "Login Failed",
        authError || "Invalid credentials. Please try again.",
        [{ text: "OK", onPress: clearError }],
      );
    }
  }, [authError]);

  // ========================================
  // 🎯 VALIDATION
  // ========================================

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleEmailChange = (text: string) => {
    setFormData({ ...formData, email: text.trim().toLowerCase() });

    // Clear email error when user starts typing
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };

  const handlePasswordChange = (text: string) => {
    setFormData({ ...formData, password: text });

    // Clear password error when user starts typing
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const handleLogin = async () => {
    // Clear any previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);

      // Success! Navigation will be handled by RootNavigator
      // based on authentication state change
    } catch (error: any) {
      // Error handling is done via useEffect watching authError
      console.error("Login error:", error);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleGuestContinue = () => {
    // TODO: Implement guest browsing
    Alert.alert(
      "Guest Mode",
      "Guest browsing will be available soon. Please log in or register.",
      [{ text: "OK" }],
    );
  };

  // ========================================
  // 🎯 RENDER
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🌾</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to access fresh, local produce from your favorite farmers
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={handleEmailChange}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              error={errors.email}
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
              required
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              isPassword
              autoCapitalize="none"
              autoComplete="password"
              error={errors.password}
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              required
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
              style={styles.loginButton}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest Continue */}
            <Button
              variant="outline"
              onPress={handleGuestContinue}
              fullWidth
              size="md"
            >
              Continue as Guest
            </Button>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Agricultural Quote */}
          <View style={styles.quote}>
            <Text style={styles.quoteText}>
              "To plant a garden is to believe in tomorrow"
            </Text>
            <Text style={styles.quoteAuthor}>- Audrey Hepburn</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing[6],
    paddingTop: theme.spacing[12],
  },

  // Header
  header: {
    marginBottom: theme.spacing[8],
    alignItems: "center",
  },

  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },

  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: "center",
  },

  subtitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: theme.spacing[4],
    lineHeight: theme.typography.fontSize.base * 1.5,
  },

  // Form
  form: {
    marginBottom: theme.spacing[6],
  },

  inputIcon: {
    fontSize: 20,
  },

  // Options Row
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },

  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing[2],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
  },

  checkmark: {
    color: theme.colors.primary[500],
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
  },

  rememberMeText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },

  forgotPasswordText: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Buttons
  loginButton: {
    marginBottom: theme.spacing[4],
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing[6],
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.main,
  },

  dividerText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.tertiary,
    paddingHorizontal: theme.spacing[3],
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing[6],
  },

  footerText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },

  footerLink: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Quote
  quote: {
    marginTop: theme.spacing[8],
    paddingTop: theme.spacing[6],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    alignItems: "center",
  },

  quoteText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.tertiary,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: theme.spacing[1],
  },

  quoteAuthor: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    textAlign: "center",
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default LoginScreen;
