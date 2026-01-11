// 🌾 Forgot Password Screen - Password Reset Flow
// Allows users to request a password reset email

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

interface FormErrors {
  email?: string;
  general?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // ========================================
  // 🔄 VALIDATION
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // 🎬 HANDLERS
  // ========================================

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear errors when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Call forgot password API
      await apiClient.auth.forgotPassword(email.trim().toLowerCase());

      // Show success state
      setEmailSent(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);

      const errorMessage = error?.response?.data?.message || error?.message;

      if (errorMessage?.toLowerCase().includes('not found')) {
        setErrors({
          email: 'No account found with this email address',
        });
      } else {
        setErrors({
          general: errorMessage || 'Failed to send reset email. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setEmail('');
  };

  // ========================================
  // 🎨 RENDER - SUCCESS STATE
  // ========================================

  if (emailSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>✉️</Text>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to:
            </Text>
            <Text style={styles.successEmail}>{email}</Text>
            <Text style={styles.successNote}>
              Please check your inbox and follow the link to reset your password.
              The link will expire in 1 hour.
            </Text>

            <View style={styles.successActions}>
              <Button
                onPress={handleBackToLogin}
                size="lg"
                style={styles.successButton}
              >
                Back to Login
              </Button>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the email? </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleResendEmail}
                >
                  Resend
                </Button>
              </View>
            </View>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              💡 If you don't see the email, check your spam folder
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // 🎨 RENDER - FORM STATE
  // ========================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🔒</Text>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email address and we'll send you
                instructions to reset your password.
              </Text>
            </View>

            {/* General Error */}
            {errors.general && (
              <View style={styles.generalError}>
                <Text style={styles.generalErrorText}>⚠️ {errors.general}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <Input
                label="Email Address"
                placeholder="john@example.com"
                value={email}
                onChangeText={handleEmailChange}
                error={errors.email}
                leftIcon="✉️"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />

              {/* Submit Button */}
              <Button
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                size="lg"
                style={styles.submitButton}
              >
                Send Reset Link
              </Button>

              {/* Back to Login */}
              <View style={styles.backContainer}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleBackToLogin}
                  disabled={loading}
                  leftIcon="←"
                >
                  Back to Login
                </Button>
              </View>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityNoteText}>
                🔐 Your security is our priority. The reset link will expire
                after 1 hour for your protection.
              </Text>
            </View>
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[8],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[4],
    lineHeight: 22,
  },
  generalError: {
    backgroundColor: theme.colors.semantic.error.light,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
  },
  generalErrorText: {
    ...theme.typography.styles.body2,
    color: theme.colors.semantic.error.dark,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing[4],
  },
  submitButton: {
    marginTop: theme.spacing[2],
  },
  backContainer: {
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  securityNote: {
    marginTop: theme.spacing[8],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.accent.sky.light,
    borderRadius: theme.borderRadius.md,
  },
  securityNoteText: {
    ...theme.typography.styles.caption,
    color: theme.colors.accent.sky.dark,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Success state styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing[6],
  },
  successTitle: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  successMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  successEmail: {
    ...theme.typography.styles.body1,
    color: theme.colors.primary.main,
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[4],
  },
  successNote: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[6],
    lineHeight: 20,
    marginBottom: theme.spacing[8],
  },
  successActions: {
    width: '100%',
    gap: theme.spacing[4],
  },
  successButton: {
    width: '100%',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
  helpContainer: {
    marginTop: theme.spacing[8],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.accent.water.light,
    borderRadius: theme.borderRadius.md,
  },
  helpText: {
    ...theme.typography.styles.caption,
    color: theme.colors.accent.water.dark,
    textAlign: 'center',
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default ForgotPasswordScreen;
