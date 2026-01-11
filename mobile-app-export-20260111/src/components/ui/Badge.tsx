// 🌾 Badge Component - Status and Label Indicators
// Displays badges for certifications, statuses, and labels

import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'organic' | 'certified' | 'local' | 'fresh';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  testID,
}) => {
  const badgeStyles = [
    styles.badge,
    size === 'sm' && styles.badgeSm,
    size === 'md' && styles.badgeMd,
    size === 'lg' && styles.badgeLg,
    variant === 'primary' && styles.badgePrimary,
    variant === 'secondary' && styles.badgeSecondary,
    variant === 'success' && styles.badgeSuccess,
    variant === 'warning' && styles.badgeWarning,
    variant === 'error' && styles.badgeError,
    variant === 'info' && styles.badgeInfo,
    variant === 'organic' && styles.badgeOrganic,
    variant === 'certified' && styles.badgeCertified,
    variant === 'local' && styles.badgeLocal,
    variant === 'fresh' && styles.badgeFresh,
    style,
  ];

  const textStyles = [
    styles.text,
    size === 'sm' && styles.textSm,
    size === 'md' && styles.textMd,
    size === 'lg' && styles.textLg,
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'success' && styles.textSuccess,
    variant === 'warning' && styles.textWarning,
    variant === 'error' && styles.textError,
    variant === 'info' && styles.textInfo,
    variant === 'organic' && styles.textOrganic,
    variant === 'certified' && styles.textCertified,
    variant === 'local' && styles.textLocal,
    variant === 'fresh' && styles.textFresh,
    textStyle,
  ];

  return (
    <View style={badgeStyles} testID={testID}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  badgeMd: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
  },
  badgeLg: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  badgePrimary: {
    backgroundColor: theme.colors.primary.light,
  },
  badgeSecondary: {
    backgroundColor: theme.colors.secondary.light,
  },
  badgeSuccess: {
    backgroundColor: theme.colors.semantic.success.light,
  },
  badgeWarning: {
    backgroundColor: theme.colors.semantic.warning.light,
  },
  badgeError: {
    backgroundColor: theme.colors.semantic.error.light,
  },
  badgeInfo: {
    backgroundColor: theme.colors.semantic.info.light,
  },
  badgeOrganic: {
    backgroundColor: theme.colors.agricultural.organic.light,
  },
  badgeCertified: {
    backgroundColor: theme.colors.agricultural.certified.light,
  },
  badgeLocal: {
    backgroundColor: theme.colors.agricultural.local.light,
  },
  badgeFresh: {
    backgroundColor: theme.colors.agricultural.fresh.light,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  textSm: {
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.lineHeight.xs,
  },
  textMd: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
  },
  textLg: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.base,
  },
  textPrimary: {
    color: theme.colors.primary.dark,
  },
  textSecondary: {
    color: theme.colors.secondary.dark,
  },
  textSuccess: {
    color: theme.colors.semantic.success.dark,
  },
  textWarning: {
    color: theme.colors.semantic.warning.dark,
  },
  textError: {
    color: theme.colors.semantic.error.dark,
  },
  textInfo: {
    color: theme.colors.semantic.info.dark,
  },
  textOrganic: {
    color: theme.colors.agricultural.organic.dark,
  },
  textCertified: {
    color: theme.colors.agricultural.certified.dark,
  },
  textLocal: {
    color: theme.colors.agricultural.local.dark,
  },
  textFresh: {
    color: theme.colors.agricultural.fresh.dark,
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default Badge;
