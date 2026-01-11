// 🌾 Register Screen - User Registration
// Complete registration flow with validation

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ========================================
  // 🔄 VALIDATION
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone.trim() && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    if (!acceptedTerms) {
      newErrors.general = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // 🎬 HANDLERS
  // ========================================

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear general error
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleRegister = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Call register API
      await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });

      // Show success message
      Alert.alert(
        'Success! 🎉',
        'Your account has been created successfully. Please log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific error messages
      const errorMessage = error?.response?.data?.message || error?.message;

      if (errorMessage?.toLowerCase().includes('email')) {
        setErrors({ email: 'This email is already registered' });
      } else {
        setErrors({
          general: errorMessage || 'Registration failed. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (): string => {
    const password = formData.password;
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;

    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = (): string => {
    const strength = getPasswordStrength();
    switch (strength) {
      case 'Weak': return theme.colors.semantic.error.main;
      case 'Fair': return theme.colors.semantic.warning.main;
      case 'Good': return theme.colors.accent.sky.main;
      case 'Strong': return theme.colors.semantic.success.main;
      default: return theme.colors.neutral[400];
    }
  };

  // ========================================
  // 🎨 RENDER
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
              <Text style={styles.emoji}>🌾</Text>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join our community of local farmers and food lovers
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
              {/* First Name */}
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                error={errors.firstName}
                leftIcon="👤"
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* Last Name */}
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                error={errors.lastName}
                leftIcon="👤"
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* Email */}
              <Input
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={errors.email}
                leftIcon="✉️"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />

              {/* Phone */}
              <Input
                label="Phone (optional)"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                error={errors.phone}
                leftIcon="📱"
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
              />

              {/* Password */}
              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={errors.password}
                leftIcon="🔒"
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="next"
              />

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <Text style={styles.passwordStrengthLabel}>
                    Password Strength:
                  </Text>
                  <Text
                    style={[
                      styles.passwordStrengthValue,
                      { color: getPasswordStrengthColor() },
                    ]}
                  >
                    {getPasswordStrength()}
                  </Text>
                </View>
              )}

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange('confirmPassword', value)
                }
                error={errors.confirmPassword}
                leftIcon="🔒"
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  leftIcon={acceptedTerms ? '☑️' : '⬜'}
                  style={styles.termsButton}
                >
                  I accept the Terms and Conditions
                </Button>
              </View>

              {/* Register Button */}
              <Button
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                size="lg"
                style={styles.registerButton}
              >
                Create Account
              </Button>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => navigation.navigate('Login' as never)}
                  disabled={loading}
                >
                  Log In
                </Button>
              </View>
            </View>

            {/* Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>
                "Supporting local farmers, one order at a time 🚜"
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
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  passwordStrengthLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  passwordStrengthValue: {
    ...theme.typography.styles.caption,
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  termsContainer: {
    marginTop: theme.spacing[2],
  },
  termsButton: {
    justifyContent: 'flex-start',
  },
  registerButton: {
    marginTop: theme.spacing[4],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  loginText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
  quoteContainer: {
    marginTop: theme.spacing[8],
    alignItems: 'center',
  },
  quote: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default RegisterScreen;
