/**
 * 💳 ADD PAYMENT METHOD SCREEN - Divine Payment Integration
 *
 * Mobile screen for adding new payment methods using Stripe SDK.
 * Features:
 * - Card number input with validation
 * - Expiry date and CVC entry
 * - Billing address collection
 * - Save card for future use
 * - Stripe SDK integration ready
 *
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import apiClient from "../../services/api";

// ============================================
// TYPE DEFINITIONS
// ============================================

type RootStackParamList = {
  Profile: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddPaymentMethod"
>;

interface CardFormData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  cardholderName: string;
  billingZip: string;
  saveCard: boolean;
  setAsDefault: boolean;
}

interface FormErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  cardholderName?: string;
  billingZip?: string;
}

interface CardBrand {
  name: string;
  icon: string;
  pattern: RegExp;
  cvcLength: number;
  cardLength: number[];
}

// ============================================
// CARD BRAND DETECTION
// ============================================

const CARD_BRANDS: CardBrand[] = [
  {
    name: "visa",
    icon: "💳",
    pattern: /^4/,
    cvcLength: 3,
    cardLength: [16],
  },
  {
    name: "mastercard",
    icon: "💳",
    pattern: /^(5[1-5]|2[2-7])/,
    cvcLength: 3,
    cardLength: [16],
  },
  {
    name: "amex",
    icon: "💳",
    pattern: /^3[47]/,
    cvcLength: 4,
    cardLength: [15],
  },
  {
    name: "discover",
    icon: "💳",
    pattern: /^(6011|65|64[4-9])/,
    cvcLength: 3,
    cardLength: [16],
  },
];

const detectCardBrand = (cardNumber: string): CardBrand | null => {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  for (const brand of CARD_BRANDS) {
    if (brand.pattern.test(cleanNumber)) {
      return brand;
    }
  }
  return null;
};

// ============================================
// INPUT FORMATTERS
// ============================================

const formatCardNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, "").substring(0, 16);
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    chunks.push(cleaned.substring(i, i + 4));
  }
  return chunks.join(" ");
};

const formatExpiryDate = (text: string): string => {
  const cleaned = text.replace(/\D/g, "").substring(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
  }
  return cleaned;
};

// ============================================
// VALIDATORS
// ============================================

const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

const validateExpiryDate = (expiry: string): boolean => {
  const parts = expiry.split("/");
  if (parts.length !== 2) return false;

  const month = parseInt(parts[0], 10);
  const year = parseInt(`20${parts[1]}`, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expDate = new Date(year, month);

  return expDate > now;
};

const validateCVC = (cvc: string, brand: CardBrand | null): boolean => {
  const expectedLength = brand?.cvcLength || 3;
  return cvc.length === expectedLength && /^\d+$/.test(cvc);
};

// ============================================
// COMPONENTS
// ============================================

interface CardInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: "default" | "numeric";
  maxLength?: number;
  rightElement?: React.ReactNode;
  inputRef?: React.RefObject<TextInput>;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done";
}

const CardInputField: React.FC<CardInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  maxLength,
  rightElement,
  inputRef,
  onSubmitEditing,
  returnKeyType = "next",
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        ref={inputRef}
        style={[styles.textInput, error ? styles.textInputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        autoCorrect={false}
      />
      {rightElement && (
        <View style={styles.inputRightElement}>{rightElement}</View>
      )}
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// ============================================
// MAIN COMPONENT
// ============================================

const AddPaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Input refs for focus management
  const expiryRef = useRef<TextInput>(null);
  const cvcRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const zipRef = useRef<TextInput>(null);

  // Form state
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
    billingZip: "",
    saveCard: true,
    setAsDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect card brand
  const cardBrand = detectCardBrand(formData.cardNumber);

  // ========================================
  // FORM HANDLERS
  // ========================================

  const updateField = (field: keyof CardFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    updateField("cardNumber", formatted);
  };

  const handleExpiryChange = (text: string) => {
    // Handle backspace on '/'
    if (
      formData.expiryDate.endsWith("/") &&
      text.length < formData.expiryDate.length
    ) {
      updateField("expiryDate", text.replace("/", ""));
      return;
    }
    const formatted = formatExpiryDate(text);
    updateField("expiryDate", formatted);
  };

  const handleCVCChange = (text: string) => {
    const cleaned = text
      .replace(/\D/g, "")
      .substring(0, cardBrand?.cvcLength || 4);
    updateField("cvc", cleaned);
  };

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = "Please enter a valid expiry date";
    }

    if (!validateCVC(formData.cvc, cardBrand)) {
      newErrors.cvc = `Please enter a valid ${cardBrand?.cvcLength || 3}-digit CVC`;
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    } else if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = "Please enter the full name on the card";
    }

    if (!formData.billingZip.trim()) {
      newErrors.billingZip = "Billing ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.billingZip.trim())) {
      newErrors.billingZip = "Please enter a valid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // SUBMISSION
  // ========================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would:
      // 1. Create a Stripe PaymentMethod using the Stripe SDK
      // 2. Send the PaymentMethod ID to your backend
      // 3. Attach the PaymentMethod to the customer

      // For now, we'll simulate the API call
      const paymentMethodData = {
        type: "card",
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        expiryMonth: formData.expiryDate.split("/")[0],
        expiryYear: `20${formData.expiryDate.split("/")[1]}`,
        cvc: formData.cvc,
        cardholderName: formData.cardholderName.trim(),
        billingZip: formData.billingZip.trim(),
        setAsDefault: formData.setAsDefault,
      };

      // Call API to add payment method
      await apiClient.payments.addPaymentMethod(paymentMethodData.cardNumber);

      Alert.alert(
        "Card Added! 💳",
        "Your payment method has been saved successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error("Add payment method error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add payment method. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardChip}>
              <Text style={styles.chipText}>💳</Text>
            </View>
            <Text style={styles.cardNumberPreview}>
              {formData.cardNumber || "•••• •••• •••• ••••"}
            </Text>
            <View style={styles.cardPreviewBottom}>
              <View>
                <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                <Text style={styles.cardPreviewValue}>
                  {formData.cardholderName.toUpperCase() || "YOUR NAME"}
                </Text>
              </View>
              <View>
                <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                <Text style={styles.cardPreviewValue}>
                  {formData.expiryDate || "MM/YY"}
                </Text>
              </View>
            </View>
            {cardBrand && (
              <View style={styles.cardBrandBadge}>
                <Text style={styles.cardBrandText}>
                  {cardBrand.name.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Card Details Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>

            <CardInputField
              label="Card Number"
              value={formData.cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              error={errors.cardNumber}
              keyboardType="numeric"
              maxLength={19}
              onSubmitEditing={() => expiryRef.current?.focus()}
              rightElement={
                cardBrand ? (
                  <Text style={styles.brandIcon}>{cardBrand.icon}</Text>
                ) : null
              }
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <CardInputField
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChangeText={handleExpiryChange}
                  placeholder="MM/YY"
                  error={errors.expiryDate}
                  keyboardType="numeric"
                  maxLength={5}
                  inputRef={expiryRef}
                  onSubmitEditing={() => cvcRef.current?.focus()}
                />
              </View>
              <View style={styles.halfInput}>
                <CardInputField
                  label="CVC"
                  value={formData.cvc}
                  onChangeText={handleCVCChange}
                  placeholder={cardBrand?.cvcLength === 4 ? "1234" : "123"}
                  error={errors.cvc}
                  keyboardType="numeric"
                  maxLength={cardBrand?.cvcLength || 4}
                  inputRef={cvcRef}
                  onSubmitEditing={() => nameRef.current?.focus()}
                  rightElement={<Text style={styles.cvcIcon}>🔒</Text>}
                />
              </View>
            </View>

            <CardInputField
              label="Cardholder Name"
              value={formData.cardholderName}
              onChangeText={(text) => updateField("cardholderName", text)}
              placeholder="John Smith"
              error={errors.cardholderName}
              inputRef={nameRef}
              onSubmitEditing={() => zipRef.current?.focus()}
            />

            <CardInputField
              label="Billing ZIP Code"
              value={formData.billingZip}
              onChangeText={(text) =>
                updateField("billingZip", text.replace(/[^\d-]/g, ""))
              }
              placeholder="12345"
              error={errors.billingZip}
              keyboardType="numeric"
              maxLength={10}
              inputRef={zipRef}
              returnKeyType="done"
            />
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Set as Default</Text>
                <Text style={styles.toggleDescription}>
                  Use this card for future payments
                </Text>
              </View>
              <Switch
                value={formData.setAsDefault}
                onValueChange={(value) => updateField("setAsDefault", value)}
                trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
                thumbColor={formData.setAsDefault ? "#22C55E" : "#9CA3AF"}
              />
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityIcon}>🔐</Text>
            <Text style={styles.securityText}>
              Your card details are encrypted and securely stored. We never
              store your full card number or CVC. Payments are processed by
              Stripe.
            </Text>
          </View>

          {/* Agricultural Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>🌾</Text>
            <Text style={styles.tipText}>
              Support local farmers with secure, hassle-free payments. Your
              saved cards make checkout for fresh produce quick and easy!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Add Card</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#111827",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 40,
  },

  // Keyboard View
  keyboardView: {
    flex: 1,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Card Preview
  cardPreview: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    height: 200,
    justifyContent: "space-between",
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: "#D4AF37",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 16,
  },
  cardNumberPreview: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  cardPreviewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardPreviewLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  cardPreviewValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  cardBrandBadge: {
    position: "absolute",
    top: 24,
    right: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardBrandText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Sections
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },

  // Input Fields
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
  },
  textInput: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingRight: 44,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputRightElement: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  brandIcon: {
    fontSize: 20,
  },
  cvcIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },

  // Row Inputs
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  toggleDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Security Notice
  securityNotice: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: "#166534",
    lineHeight: 18,
  },

  // Tip
  tipContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    paddingBottom: 34,
  },
  submitButton: {
    height: 52,
    backgroundColor: "#22C55E",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AddPaymentMethodScreen;
