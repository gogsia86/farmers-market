// 🌾 Farmers Market Mobile App - Divine Button Component
// Comprehensive button with agricultural consciousness and quantum efficiency

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonIconPosition = 'left' | 'right';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  // Content
  children: React.ReactNode;

  // Variants & Styling
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;

  // State
  loading?: boolean;
  disabled?: boolean;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Agricultural Consciousness
  seasonal?: 'spring' | 'summer' | 'fall' | 'winter';

  // Custom Styles
  style?: ViewStyle;
  textStyle?: TextStyle;

  // Handlers
  onPress?: () => void;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  seasonal,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  // ========================================
  // 🎨 STYLE COMPUTATION
  // ========================================

  const isDisabled = disabled || loading;

  // Base button style
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`${variant}_disabled`],
    seasonal && getSeasonalStyle(seasonal),
    style,
  ];

  // Text style
  const buttonTextStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    isDisabled && styles.text_disabled,
    textStyle,
  ];

  // ========================================
  // 🎯 RENDER HELPERS
  // ========================================

  const renderIcon = (icon: React.ReactNode, position: ButtonIconPosition) => {
    if (!icon) return null;

    return (
      <View
        style={[
          styles.iconContainer,
          position === 'left' ? styles.iconLeft : styles.iconRight,
        ]}
      >
        {icon}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={getLoaderColor(variant)}
            size={size === 'sm' ? 'small' : 'small'}
          />
          <Text style={[buttonTextStyle, styles.loadingText]}>Loading...</Text>
        </View>
      );
    }

    return (
      <>
        {renderIcon(leftIcon, 'left')}
        <Text style={buttonTextStyle}>{children}</Text>
        {renderIcon(rightIcon, 'right')}
      </>
    );
  };

  // ========================================
  // 🎯 RENDER
  // ========================================

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// ========================================
// 🛠️ UTILITY FUNCTIONS
// ========================================

function getLoaderColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
    case 'success':
      return theme.colors.text.inverse;
    case 'outline':
    case 'ghost':
      return theme.colors.primary[500];
    default:
      return theme.colors.text.inverse;
  }
}

function getSeasonalStyle(season: 'spring' | 'summer' | 'fall' | 'winter'): ViewStyle {
  const seasonalColors = theme.colors.seasonal[season];
  return {
    backgroundColor: seasonalColors.primary,
    borderColor: seasonalColors.primary,
  };
}

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  // Base Styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
    ...theme.shadows.none,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },

  primary_disabled: {
    backgroundColor: theme.colors.primary[300],
    borderColor: theme.colors.primary[300],
  },

  secondary: {
    backgroundColor: theme.colors.secondary[400],
    borderColor: theme.colors.secondary[400],
  },

  secondary_disabled: {
    backgroundColor: theme.colors.secondary[200],
    borderColor: theme.colors.secondary[200],
  },

  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },

  outline_disabled: {
    borderColor: theme.colors.neutral[300],
  },

  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    ...theme.shadows.none,
  },

  ghost_disabled: {
    backgroundColor: 'transparent',
  },

  danger: {
    backgroundColor: theme.colors.error.main,
    borderColor: theme.colors.error.main,
  },

  danger_disabled: {
    backgroundColor: theme.colors.error.light,
    borderColor: theme.colors.error.light,
  },

  success: {
    backgroundColor: theme.colors.success.main,
    borderColor: theme.colors.success.main,
  },

  success_disabled: {
    backgroundColor: theme.colors.success.light,
    borderColor: theme.colors.success.light,
  },

  // Sizes
  size_sm: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    minHeight: 32,
  },

  size_md: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    minHeight: 44,
  },

  size_lg: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    minHeight: 52,
  },

  size_xl: {
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[8],
    minHeight: 60,
  },

  // Text Styles
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },

  text_primary: {
    color: theme.colors.text.inverse,
  },

  text_secondary: {
    color: theme.colors.text.inverse,
  },

  text_outline: {
    color: theme.colors.primary[500],
  },

  text_ghost: {
    color: theme.colors.primary[500],
  },

  text_danger: {
    color: theme.colors.text.inverse,
  },

  text_success: {
    color: theme.colors.text.inverse,
  },

  text_disabled: {
    opacity: 1,
  },

  text_sm: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.fontSize.sm * 1.5,
  },

  text_md: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.fontSize.base * 1.5,
  },

  text_lg: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.fontSize.lg * 1.5,
  },

  text_xl: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.fontSize.xl * 1.5,
  },

  // Icon Styles
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconLeft: {
    marginRight: theme.spacing[2],
  },

  iconRight: {
    marginLeft: theme.spacing[2],
  },

  // Loading Styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginLeft: theme.spacing[2],
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default Button;
