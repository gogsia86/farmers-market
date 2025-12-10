/**
 * 📝 EDIT PROFILE SCREEN - Divine Profile Modification
 *
 * Allows users to edit their profile information including:
 * - First name and last name
 * - Phone number
 * - Profile avatar
 * - Email (read-only display)
 *
 * @reference .github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiClient } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EditProfile"
>;

// ============================================
// VALIDATION HELPERS
// ============================================

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// ============================================
// FORM INPUT COMPONENT
// ============================================

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        !editable && styles.inputDisabled,
        error && styles.inputError,
        multiline && styles.inputMultiline,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      editable={editable}
      maxLength={maxLength}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// ============================================
// AVATAR SELECTOR COMPONENT
// ============================================

interface AvatarSelectorProps {
  avatar?: string;
  firstName: string;
  lastName: string;
  onSelectAvatar: () => void;
  isUploading: boolean;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  avatar,
  firstName,
  lastName,
  onSelectAvatar,
  isUploading,
}) => {
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  return (
    <View style={styles.avatarContainer}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={onSelectAvatar}
        disabled={isUploading}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        {isUploading && (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}
        <View style={styles.cameraButton}>
          <Text style={styles.cameraIcon}>📷</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.avatarHint}>Tap to change photo</Text>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, updateUser } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: undefined,
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, _setIsUploadingAvatar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Original data for comparison
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(
    null,
  );

  // ========================================
  // LOAD PROFILE DATA
  // ========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (originalData) {
      const changed =
        formData.firstName !== originalData.firstName ||
        formData.lastName !== originalData.lastName ||
        formData.phone !== originalData.phone ||
        formData.avatar !== originalData.avatar;
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.user.getProfile();
      const profile = response.data || response;

      const profileData: ProfileFormData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        avatar: profile.avatar,
      };

      setFormData(profileData);
      setOriginalData(profileData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Fallback to auth store user data
      if (user) {
        const fallbackData: ProfileFormData = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          avatar: user.avatar,
        };
        setFormData(fallbackData);
        setOriginalData(fallbackData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // FORM HANDLERS
  // ========================================

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateName(formData.firstName)) {
      newErrors.firstName = "First name must be 2-50 characters";
    }

    if (!validateName(formData.lastName)) {
      newErrors.lastName = "Last name must be 2-50 characters";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // AVATAR HANDLING
  // ========================================

  const handleSelectAvatar = async () => {
    // In a real implementation, this would use expo-image-picker
    Alert.alert(
      "Change Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => handleTakePhoto(),
        },
        {
          text: "Choose from Library",
          onPress: () => handleChooseFromLibrary(),
        },
        {
          text: "Remove Photo",
          onPress: () => handleRemovePhoto(),
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  const handleTakePhoto = async () => {
    // TODO: Implement camera capture with expo-image-picker
    Alert.alert(
      "Coming Soon",
      "Camera capture will be available in the next update.",
    );
  };

  const handleChooseFromLibrary = async () => {
    // TODO: Implement image picker with expo-image-picker
    Alert.alert(
      "Coming Soon",
      "Photo library access will be available in the next update.",
    );
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: undefined }));
  };

  // ========================================
  // SAVE PROFILE
  // ========================================

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      };

      const response = await apiClient.user.updateProfile(updateData);
      const updatedProfile = response.data || response;

      // Update auth store
      if (updateUser) {
        updateUser({
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          phone: updatedProfile.phone,
          avatar: updatedProfile.avatar,
        });
      }

      Alert.alert("Success", "Your profile has been updated successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      Alert.alert(
        "Update Failed",
        error.message ||
          "There was an error updating your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================
  // DISCARD CHANGES HANDLER
  // ========================================

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  // ========================================
  // RENDER
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            !hasChanges && styles.headerButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#22C55E" />
          ) : (
            <Text
              style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <AvatarSelector
          avatar={formData.avatar}
          firstName={formData.firstName}
          lastName={formData.lastName}
          onSelectAvatar={handleSelectAvatar}
          isUploading={isUploadingAvatar}
        />

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <FormInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => handleInputChange("firstName", text)}
            placeholder="Enter your first name"
            error={errors.firstName}
            autoCapitalize="words"
            maxLength={50}
          />

          <FormInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => handleInputChange("lastName", text)}
            placeholder="Enter your last name"
            error={errors.lastName}
            autoCapitalize="words"
            maxLength={50}
          />

          <FormInput
            label="Email"
            value={user?.email || ""}
            onChangeText={() => {}}
            placeholder="Email address"
            editable={false}
            keyboardType="email-address"
          />

          <FormInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
            placeholder="Enter your phone number"
            error={errors.phone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Info Notice */}
        <View style={styles.infoNotice}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Your email address cannot be changed. Contact support if you need to
            update it.
          </Text>
        </View>

        {/* Agricultural Consciousness */}
        <View style={styles.consciousnessCard}>
          <Text style={styles.consciousnessEmoji}>🌾</Text>
          <Text style={styles.consciousnessTitle}>Farm-Fresh Connection</Text>
          <Text style={styles.consciousnessText}>
            Your profile helps local farmers personalize your experience and
            connect you with the freshest seasonal produce.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
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
  headerButton: {
    minWidth: 60,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cancelText: {
    fontSize: 16,
    color: "#6B7280",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
    textAlign: "right",
  },
  saveTextDisabled: {
    color: "#9CA3AF",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Avatar
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 42,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIcon: {
    fontSize: 18,
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  // Form
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputMultiline: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#EF4444",
  },

  // Info Notice
  infoNotice: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },

  // Agricultural Consciousness
  consciousnessCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  consciousnessEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  consciousnessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8,
  },
  consciousnessText: {
    fontSize: 14,
    color: "#15803D",
    textAlign: "center",
    lineHeight: 20,
  },
});
