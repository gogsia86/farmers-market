// 🌾 Farmers Market Mobile App - Divine Input Component
// Comprehensive text input with agricultural consciousness and full validation support

import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "../../theme";

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export interface InputProps extends Omit<TextInputProps, "style"> {
  // Labels & Help Text
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // State
  disabled?: boolean;
  required?: boolean;

  // Password
  isPassword?: boolean;

  // Styling
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;

  // Callbacks
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  helperText,
  error,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  isPassword = false,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  onChangeText,
  onFocus,
  onBlur,
  value,
  ...props
}) => {
  // ========================================
  // 🔄 STATE
  // ========================================

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ========================================
  // 🎨 STYLE COMPUTATION
  // ========================================

  const getInputContainerStyles = (): ViewStyle[] => {
    const styles: ViewStyle[] = [baseStyles.inputContainer];

    if (isFocused) {
      styles.push(baseStyles.inputContainerFocused);
    }

    if (error) {
      styles.push(baseStyles.inputContainerError);
    }

    if (disabled) {
      styles.push(baseStyles.inputContainerDisabled);
    }

    if (inputContainerStyle) {
      styles.push(inputContainerStyle);
    }

    return styles;
  };

  // ========================================
  // 🎯 RENDER HELPERS
  // ========================================

  const renderLabel = () => {
    if (!label) return null;

    return (
      <View style={baseStyles.labelContainer}>
        <Text style={[baseStyles.label, labelStyle]}>
          {label}
          {required && <Text style={baseStyles.required}> *</Text>}
        </Text>
      </View>
    );
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return <View style={baseStyles.leftIcon}>{leftIcon}</View>;
  };

  const renderRightIcon = () => {
    // Password toggle takes priority
    if (isPassword) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={baseStyles.rightIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={baseStyles.passwordToggle}>
            {showPassword ? "🙈" : "👁️"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (!rightIcon) return null;

    return <View style={baseStyles.rightIcon}>{rightIcon}</View>;
  };

  const renderHelperText = () => {
    if (error) {
      return <Text style={baseStyles.errorText}>{error}</Text>;
    }

    if (helperText) {
      return <Text style={baseStyles.helperText}>{helperText}</Text>;
    }

    return null;
  };

  // ========================================
  // 🎯 RENDER
  // ========================================

  return (
    <View style={[baseStyles.container, containerStyle]}>
      {renderLabel()}

      <View style={getInputContainerStyles()}>
        {renderLeftIcon()}

        <TextInput
          style={[
            baseStyles.input,
            leftIcon && baseStyles.inputWithLeftIcon,
            (rightIcon || isPassword) && baseStyles.inputWithRightIcon,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {renderRightIcon()}
      </View>

      {renderHelperText()}
    </View>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const baseStyles = StyleSheet.create({
  // Container
  container: {
    marginBottom: theme.spacing[4],
  },

  // Label
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[2],
  },

  label: {
    ...theme.typography.styles.label,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  required: {
    color: theme.colors.error.main,
    fontWeight: theme.typography.fontWeight.bold,
  },

  // Input Container
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing[3],
    minHeight: 48,
  },

  inputContainerFocused: {
    borderColor: theme.colors.border.focus,
    borderWidth: 2,
    backgroundColor: theme.colors.background.primary,
    ...theme.shadows.sm,
  },

  inputContainerError: {
    borderColor: theme.colors.error.main,
    borderWidth: 2,
    backgroundColor: theme.colors.error.light,
  },

  inputContainerDisabled: {
    backgroundColor: theme.colors.neutral[100],
    borderColor: theme.colors.border.light,
    opacity: 0.6,
  },

  // Input Field
  input: {
    flex: 1,
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: 0,
  },

  inputWithLeftIcon: {
    marginLeft: 0,
  },

  inputWithRightIcon: {
    marginRight: 0,
  },

  // Icons
  leftIcon: {
    marginRight: theme.spacing[2],
    justifyContent: "center",
    alignItems: "center",
  },

  rightIcon: {
    marginLeft: theme.spacing[2],
    justifyContent: "center",
    alignItems: "center",
  },

  passwordToggle: {
    fontSize: 20,
  },

  // Helper & Error Text
  helperText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
    marginLeft: theme.spacing[1],
  },

  errorText: {
    ...theme.typography.styles.caption,
    color: theme.colors.error.main,
    marginTop: theme.spacing[1],
    marginLeft: theme.spacing[1],
    fontWeight: theme.typography.fontWeight.medium,
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default Input;
