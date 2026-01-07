// 🌾 Avatar Component - User Profile Pictures
// Displays user avatars with fallback to initials

import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export interface AvatarProps {
  imageUri?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  testID?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const Avatar: React.FC<AvatarProps> = ({
  imageUri,
  name,
  size = 'md',
  variant = 'circle',
  backgroundColor,
  textColor,
  style,
  testID,
}) => {
  // Generate initials from name
  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  // Generate consistent color from name
  const getBackgroundColor = (fullName?: string): string => {
    if (backgroundColor) return backgroundColor;
    if (!fullName) return theme.colors.neutral[400];

    const colors = [
      theme.colors.primary.main,
      theme.colors.secondary.main,
      theme.colors.accent.sky.main,
      theme.colors.accent.water.main,
      theme.colors.seasonal.spring.main,
      theme.colors.seasonal.summer.main,
      theme.colors.seasonal.fall.main,
      theme.colors.seasonal.winter.main,
    ];

    // Simple hash function to pick a consistent color
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  const txtColor = textColor || theme.colors.text.inverse;

  const containerStyles = [
    styles.container,
    size === 'xs' && styles.containerXs,
    size === 'sm' && styles.containerSm,
    size === 'md' && styles.containerMd,
    size === 'lg' && styles.containerLg,
    size === 'xl' && styles.containerXl,
    variant === 'circle' && styles.circle,
    variant === 'rounded' && styles.rounded,
    variant === 'square' && styles.square,
    !imageUri && { backgroundColor: bgColor },
    style,
  ];

  const textStyles = [
    styles.text,
    size === 'xs' && styles.textXs,
    size === 'sm' && styles.textSm,
    size === 'md' && styles.textMd,
    size === 'lg' && styles.textLg,
    size === 'xl' && styles.textXl,
    { color: txtColor },
  ];

  return (
    <View style={containerStyles} testID={testID}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={textStyles}>{initials}</Text>
      )}
    </View>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  containerXs: {
    width: 24,
    height: 24,
  },
  containerSm: {
    width: 32,
    height: 32,
  },
  containerMd: {
    width: 48,
    height: 48,
  },
  containerLg: {
    width: 64,
    height: 64,
  },
  containerXl: {
    width: 96,
    height: 96,
  },
  circle: {
    borderRadius: 9999,
  },
  rounded: {
    borderRadius: theme.borderRadius.lg,
  },
  square: {
    borderRadius: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  textXs: {
    fontSize: 10,
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 18,
  },
  textLg: {
    fontSize: 24,
  },
  textXl: {
    fontSize: 36,
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default Avatar;
