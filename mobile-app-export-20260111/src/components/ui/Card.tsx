// 🌾 Card Component - Content Container with Shadow
// Versatile card component for displaying grouped content

import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  onPress,
  disabled = false,
  testID,
}) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    padding === 'none' && styles.paddingNone,
    padding === 'sm' && styles.paddingSm,
    padding === 'md' && styles.paddingMd,
    padding === 'lg' && styles.paddingLg,
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          ...cardStyles,
          pressed && !disabled && styles.pressed,
        ]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

// ========================================
// 🎨 CARD HEADER COMPONENT
// ========================================

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

// ========================================
// 🎨 CARD BODY COMPONENT
// ========================================

export interface CardBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, style }) => {
  return <View style={[styles.body, style]}>{children}</View>;
};

// ========================================
// 🎨 CARD FOOTER COMPONENT
// ========================================

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...theme.shadows.md,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  flat: {
    backgroundColor: theme.colors.background.secondary,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: theme.spacing[2],
  },
  paddingMd: {
    padding: theme.spacing[4],
  },
  paddingLg: {
    padding: theme.spacing[6],
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing[3],
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginTop: theme.spacing[3],
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default Card;
