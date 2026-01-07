// 🌾 Modal Component - Dialog and Overlay Component
// Customizable modal for alerts, confirmations, and dialogs

import React from 'react';
import {
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';
import { Button } from './Button';

// ========================================
// 🎯 TYPES & INTERFACES
// ========================================

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  variant?: 'center' | 'bottom' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  primaryButton?: {
    text: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  testID?: string;
}

// ========================================
// 🎨 COMPONENT
// ========================================

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  variant = 'center',
  size = 'md',
  showCloseButton = true,
  closeOnBackdropPress = true,
  animationType = 'fade',
  primaryButton,
  secondaryButton,
  style,
  testID,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const getContainerStyles = () => {
    const baseStyles = [styles.container];

    if (variant === 'center') {
      baseStyles.push(styles.centerContainer);
    } else if (variant === 'bottom') {
      baseStyles.push(styles.bottomContainer);
    } else if (variant === 'fullscreen') {
      baseStyles.push(styles.fullscreenContainer);
    }

    return baseStyles;
  };

  const getModalStyles = () => {
    const baseStyles = [styles.modal];

    if (variant === 'center') {
      baseStyles.push(styles.centerModal);
      if (size === 'sm') baseStyles.push(styles.modalSm);
      if (size === 'md') baseStyles.push(styles.modalMd);
      if (size === 'lg') baseStyles.push(styles.modalLg);
    } else if (variant === 'bottom') {
      baseStyles.push(styles.bottomModal);
    } else if (variant === 'fullscreen') {
      baseStyles.push(styles.fullscreenModal);
    }

    baseStyles.push(style);
    return baseStyles;
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <View style={getContainerStyles()}>
        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessibilityLabel="Close modal"
          accessibilityRole="button"
        />

        {/* Modal Content */}
        <View style={getModalStyles()}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Body */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer with Buttons */}
          {(primaryButton || secondaryButton) && (
            <View style={styles.footer}>
              {secondaryButton && (
                <Button
                  variant="ghost"
                  onPress={secondaryButton.onPress}
                  style={styles.secondaryButton}
                >
                  {secondaryButton.text}
                </Button>
              )}
              {primaryButton && (
                <Button
                  variant={primaryButton.variant || 'primary'}
                  onPress={primaryButton.onPress}
                  loading={primaryButton.loading}
                  disabled={primaryButton.loading}
                  style={styles.primaryButton}
                >
                  {primaryButton.text}
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

// ========================================
// 🎨 PRESET MODALS
// ========================================

export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}) => {
  const getEmoji = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      variant="center"
      size="sm"
      showCloseButton={false}
      primaryButton={{
        text: buttonText,
        onPress: onClose,
      }}
    >
      <View style={styles.alertContent}>
        <Text style={styles.alertEmoji}>{getEmoji()}</Text>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
    </Modal>
  );
};

export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'primary',
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      variant="center"
      size="sm"
      showCloseButton={false}
      primaryButton={{
        text: confirmText,
        onPress: onConfirm,
        variant: variant,
        loading: loading,
      }}
      secondaryButton={{
        text: cancelText,
        onPress: onClose,
      }}
    >
      <Text style={styles.confirmMessage}>{message}</Text>
    </Modal>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  fullscreenContainer: {
    justifyContent: 'center',
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Modal Styles
  modal: {
    backgroundColor: theme.colors.background.primary,
    ...theme.shadows.lg,
  },
  centerModal: {
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: theme.spacing[6],
    maxHeight: '80%',
  },
  bottomModal: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
  },
  fullscreenModal: {
    flex: 1,
    marginTop: 0,
    borderRadius: 0,
  },

  // Size Variants
  modalSm: {
    maxWidth: 320,
  },
  modalMd: {
    maxWidth: 480,
  },
  modalLg: {
    maxWidth: 640,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[100],
    marginLeft: theme.spacing[2],
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },

  // Body
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing[3],
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },

  // Alert Modal Styles
  alertContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
  },
  alertEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing[4],
  },
  alertTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  alertMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Confirm Modal Styles
  confirmMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default Modal;
