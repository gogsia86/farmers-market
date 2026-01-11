// 🌾 LoadingSpinner Component - Loading State Indicator
// Displays loading spinners with optional overlay

import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  message?: string;
  visible?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = theme.colors.primary.main,
  fullScreen = false,
  overlay = false,
  message,
  visible = true,
  style,
  testID,
}) => {
  if (!visible) return null;

  // Full-screen modal overlay
  if (fullScreen) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenContent}>
            <ActivityIndicator size={size} color={color} testID={testID} />
            {message && (
              <Text style={styles.fullScreenMessage}>{message}</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // Overlay within current screen
  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} testID={testID} />
          {message && <Text style={styles.overlayMessage}>{message}</Text>}
        </View>
      </View>
    );
  }

  // Inline spinner
  return (
    <View style={[styles.inlineContainer, style]} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  // Full-screen modal styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[8],
    alignItems: 'center',
    minWidth: 150,
    ...theme.shadows.lg,
  },
  fullScreenMessage: {
    marginTop: theme.spacing[4],
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },

  // Overlay styles
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.overlay,
  },
  overlayContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    alignItems: 'center',
    ...theme.shadows.md,
  },
  overlayMessage: {
    marginTop: theme.spacing[3],
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },

  // Inline styles
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  inlineMessage: {
    marginTop: theme.spacing[2],
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default LoadingSpinner;
