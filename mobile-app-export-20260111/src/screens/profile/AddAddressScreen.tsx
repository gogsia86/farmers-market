/**
 * 📍 ADD ADDRESS SCREEN - Divine Address Management
 *
 * Mobile screen for adding new shipping addresses with:
 * - Form validation
 * - Address type selection (Home, Work, Other)
 * - Default address toggle
 * - State/Country selection
 * - Agricultural consciousness
 *
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, { useState } from "react";
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
  AddAddress: undefined;
  EditAddress: { addressId: string };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddAddress"
>;

interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  instructions: string;
}

interface FormErrors {
  label?: string;
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

const ADDRESS_TYPES = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "work", label: "Work", icon: "🏢" },
  { id: "farm", label: "Farm", icon: "🌾" },
  { id: "other", label: "Other", icon: "📍" },
];

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// ============================================
// COMPONENTS
// ============================================

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  keyboardType?: "default" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  multiline = false,
  numberOfLines = 1,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <TextInput
      style={[
        styles.textInput,
        error ? styles.textInputError : null,
        multiline ? styles.textInputMultiline : null,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      maxLength={maxLength}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

interface AddressTypeButtonProps {
  type: { id: string; label: string; icon: string };
  isSelected: boolean;
  onPress: () => void;
}

const AddressTypeButton: React.FC<AddressTypeButtonProps> = ({
  type,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.typeIcon}>{type.icon}</Text>
    <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
      {type.label}
    </Text>
  </TouchableOpacity>
);

interface StatePickerProps {
  value: string;
  onSelect: (state: string) => void;
  error?: string;
}

const StatePicker: React.FC<StatePickerProps> = ({
  value,
  onSelect,
  error,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedState = US_STATES.find((s) => s.code === value);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        State<Text style={styles.required}> *</Text>
      </Text>
      <TouchableOpacity
        style={[styles.pickerButton, error ? styles.textInputError : null]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerButtonText,
            !selectedState && styles.pickerPlaceholder,
          ]}
        >
          {selectedState ? selectedState.name : "Select State"}
        </Text>
        <Text style={styles.pickerArrow}>{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.stateList}>
          <ScrollView style={styles.stateScrollView} nestedScrollEnabled>
            {US_STATES.map((state) => (
              <TouchableOpacity
                key={state.code}
                style={[
                  styles.stateItem,
                  value === state.code && styles.stateItemSelected,
                ]}
                onPress={() => {
                  onSelect(state.code);
                  setIsExpanded(false);
                }}
              >
                <Text
                  style={[
                    styles.stateItemText,
                    value === state.code && styles.stateItemTextSelected,
                  ]}
                >
                  {state.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    label: "home",
    fullName: "",
    phone: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    isDefault: false,
    instructions: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form field
  const updateField = (
    field: keyof AddressFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format phone number
  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Handle phone input
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    updateField("phone", formatted);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form.");
      return;
    }

    setIsSubmitting(true);

    try {
      const addressData = {
        label: formData.label,
        fullName: formData.fullName.trim(),
        phone: formData.phone.replace(/\D/g, ""),
        street: formData.street.trim(),
        street2: formData.street2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state,
        zipCode: formData.zipCode.trim(),
        country: formData.country,
        isDefault: formData.isDefault,
        instructions: formData.instructions.trim() || undefined,
      };

      await apiClient.user.addAddress(addressData);

      Alert.alert(
        "Address Added! 🎉",
        "Your new address has been saved successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error("Add address error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add address. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Add Address</Text>
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
          {/* Address Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Type</Text>
            <View style={styles.typeContainer}>
              {ADDRESS_TYPES.map((type) => (
                <AddressTypeButton
                  key={type.id}
                  type={type}
                  isSelected={formData.label === type.id}
                  onPress={() => updateField("label", type.id)}
                />
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <InputField
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => updateField("fullName", text)}
              placeholder="John Smith"
              error={errors.fullName}
              required
              autoCapitalize="words"
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChangeText={handlePhoneChange}
              placeholder="(555) 123-4567"
              error={errors.phone}
              required
              keyboardType="phone-pad"
              maxLength={14}
            />
          </View>

          {/* Address Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>

            <InputField
              label="Street Address"
              value={formData.street}
              onChangeText={(text) => updateField("street", text)}
              placeholder="123 Harvest Lane"
              error={errors.street}
              required
              autoCapitalize="words"
            />

            <InputField
              label="Apartment, Suite, etc."
              value={formData.street2}
              onChangeText={(text) => updateField("street2", text)}
              placeholder="Apt 4B (optional)"
              autoCapitalize="words"
            />

            <InputField
              label="City"
              value={formData.city}
              onChangeText={(text) => updateField("city", text)}
              placeholder="Springfield"
              error={errors.city}
              required
              autoCapitalize="words"
            />

            <StatePicker
              value={formData.state}
              onSelect={(state) => updateField("state", state)}
              error={errors.state}
            />

            <InputField
              label="ZIP Code"
              value={formData.zipCode}
              onChangeText={(text) => updateField("zipCode", text)}
              placeholder="62701"
              error={errors.zipCode}
              required
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Delivery Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>

            <InputField
              label="Special Instructions"
              value={formData.instructions}
              onChangeText={(text) => updateField("instructions", text)}
              placeholder="Gate code, leave at door, etc. (optional)"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Default Address Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Set as Default Address</Text>
                <Text style={styles.toggleDescription}>
                  This address will be pre-selected at checkout
                </Text>
              </View>
              <Switch
                value={formData.isDefault}
                onValueChange={(value) => updateField("isDefault", value)}
                trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
                thumbColor={formData.isDefault ? "#22C55E" : "#9CA3AF"}
              />
            </View>
          </View>

          {/* Agricultural Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>🌾</Text>
            <Text style={styles.tipText}>
              Adding accurate address details helps local farmers deliver fresh
              produce directly to your doorstep!
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
            <Text style={styles.submitButtonText}>Save Address</Text>
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

  // Keyboard view
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

  // Address Type
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  typeButtonSelected: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  typeLabelSelected: {
    color: "#22C55E",
    fontWeight: "600",
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
  required: {
    color: "#EF4444",
  },
  textInput: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  textInputMultiline: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },

  // State Picker
  pickerButton: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#111827",
  },
  pickerPlaceholder: {
    color: "#9CA3AF",
  },
  pickerArrow: {
    fontSize: 12,
    color: "#6B7280",
  },
  stateList: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 200,
  },
  stateScrollView: {
    maxHeight: 200,
  },
  stateItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  stateItemSelected: {
    backgroundColor: "#F0FDF4",
  },
  stateItemText: {
    fontSize: 14,
    color: "#374151",
  },
  stateItemTextSelected: {
    color: "#22C55E",
    fontWeight: "600",
  },

  // Toggle
  toggleContainer: {
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

export default AddAddressScreen;
