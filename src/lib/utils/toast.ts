/**
 * Toast Notification Utility
 * Wrapper around sonner for consistent toast notifications
 * @module lib/utils/toast
 */

import { toast as sonnerToast } from "sonner";

export interface ToastOptions {
  /**
   * Toast duration in milliseconds
   * @default 3000
   */
  duration?: number;

  /**
   * Toast position
   * @default 'top-right'
   */
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";

  /**
   * Custom description text
   */
  description?: string;

  /**
   * Action button
   */
  action?: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };

  /**
   * Cancel button
   */
  cancel?: {
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };

  /**
   * Custom icon (React element or emoji)
   */
  icon?: React.ReactNode;

  /**
   * Whether toast can be dismissed
   * @default true
   */
  dismissible?: boolean;
}

export interface PromiseToastMessages<T = any> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: any) => string);
}

/**
 * Toast notification utility
 * Provides a consistent API for showing toast notifications
 */
export const toast = {
  /**
   * Show a success toast
   *
   * @example
   * ```tsx
   * toast.success('Product added to cart!');
   *
   * toast.success('Order placed', {
   *   description: 'Your order #1234 has been confirmed',
   *   action: {
   *     label: 'View Order',
   *     onClick: () => router.push('/orders/1234')
   *   }
   * });
   * ```
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "top-right",
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      icon: options?.icon,
      dismissible: options?.dismissible ?? true,
    });
  },

  /**
   * Show an error toast
   *
   * @example
   * ```tsx
   * toast.error('Failed to add product');
   *
   * toast.error('Payment failed', {
   *   description: 'Please check your card details and try again',
   *   duration: 5000
   * });
   * ```
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration ?? 5000,
      position: options?.position ?? "top-right",
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      icon: options?.icon,
      dismissible: options?.dismissible ?? true,
    });
  },

  /**
   * Show an info toast
   *
   * @example
   * ```tsx
   * toast.info('New products available!');
   * ```
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "top-right",
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      icon: options?.icon,
      dismissible: options?.dismissible ?? true,
    });
  },

  /**
   * Show a warning toast
   *
   * @example
   * ```tsx
   * toast.warning('Low stock alert', {
   *   description: 'Only 3 items remaining'
   * });
   * ```
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "top-right",
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      icon: options?.icon,
      dismissible: options?.dismissible ?? true,
    });
  },

  /**
   * Show a loading toast
   * Returns a toast ID that can be used to dismiss or update the toast
   *
   * @example
   * ```tsx
   * const loadingToast = toast.loading('Processing payment...');
   *
   * try {
   *   await processPayment();
   *   toast.success('Payment successful', { id: loadingToast });
   * } catch (error) {
   *   toast.error('Payment failed', { id: loadingToast });
   * }
   * ```
   */
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      position: options?.position ?? "top-right",
      description: options?.description,
      dismissible: options?.dismissible ?? false,
    });
  },

  /**
   * Show a promise toast that automatically updates based on promise state
   *
   * @example
   * ```tsx
   * toast.promise(
   *   addToCart(productId),
   *   {
   *     loading: 'Adding to cart...',
   *     success: 'Added to cart!',
   *     error: 'Failed to add to cart'
   *   }
   * );
   *
   * // With dynamic messages
   * toast.promise(
   *   createOrder(data),
   *   {
   *     loading: 'Creating order...',
   *     success: (order) => `Order #${order.id} created successfully!`,
   *     error: (err) => `Failed to create order: ${err.message}`
   *   }
   * );
   * ```
   */
  promise: <T = any>(
    promise: Promise<T>,
    messages: PromiseToastMessages<T>,
    options?: ToastOptions,
  ): Promise<T> => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: options?.position ?? "top-right",
      duration: options?.duration,
    });
  },

  /**
   * Show a custom toast with full control
   *
   * @example
   * ```tsx
   * toast.custom((t) => (
   *   <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg">
   *     <img src="/logo.svg" className="h-8 w-8" />
   *     <div>
   *       <p className="font-semibold">New farm near you!</p>
   *       <p className="text-sm text-gray-600">Green Valley Farm just joined</p>
   *     </div>
   *   </div>
   * ));
   * ```
   */
  custom: (
    jsx: (id: string | number) => React.ReactElement,
    options?: ToastOptions,
  ) => {
    return sonnerToast.custom(jsx, {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "top-right",
      dismissible: options?.dismissible ?? true,
    });
  },

  /**
   * Dismiss a specific toast by ID
   *
   * @example
   * ```tsx
   * const toastId = toast.loading('Processing...');
   * // Later...
   * toast.dismiss(toastId);
   * ```
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   *
   * @example
   * ```tsx
   * toast.dismissAll();
   * ```
   */
  dismissAll: () => {
    return sonnerToast.dismiss();
  },
};

/**
 * Predefined toast messages for common scenarios
 */
export const ToastMessages = {
  // Auth
  loginSuccess: "Welcome back!",
  loginError: "Invalid email or password",
  logoutSuccess: "Logged out successfully",
  registerSuccess: "Account created successfully!",
  registerError: "Failed to create account",
  passwordResetSent: "Password reset email sent",
  passwordResetSuccess: "Password reset successfully",

  // Cart
  addToCartSuccess: "Added to cart",
  addToCartError: "Failed to add to cart",
  removeFromCartSuccess: "Removed from cart",
  updateCartSuccess: "Cart updated",
  clearCartSuccess: "Cart cleared",

  // Orders
  orderPlaced: "Order placed successfully!",
  orderPlacedError: "Failed to place order",
  orderCancelled: "Order cancelled",
  orderCancelledError: "Failed to cancel order",

  // Products
  productCreated: "Product created successfully",
  productCreatedError: "Failed to create product",
  productUpdated: "Product updated",
  productUpdatedError: "Failed to update product",
  productDeleted: "Product deleted",
  productDeletedError: "Failed to delete product",

  // Farms
  farmCreated: "Farm created successfully",
  farmCreatedError: "Failed to create farm",
  farmUpdated: "Farm updated",
  farmUpdatedError: "Failed to update farm",
  farmDeleted: "Farm deleted",
  farmDeletedError: "Failed to delete farm",

  // Favorites
  addToFavoritesSuccess: "Added to favorites",
  addToFavoritesError: "Failed to add to favorites",
  removeFromFavoritesSuccess: "Removed from favorites",

  // Reviews
  reviewSubmitted: "Review submitted successfully",
  reviewSubmittedError: "Failed to submit review",
  reviewUpdated: "Review updated",
  reviewDeleted: "Review deleted",

  // Profile
  profileUpdated: "Profile updated successfully",
  profileUpdatedError: "Failed to update profile",
  avatarUploaded: "Profile picture updated",
  avatarUploadError: "Failed to upload image",

  // Payments
  paymentSuccess: "Payment successful!",
  paymentError: "Payment failed",
  paymentProcessing: "Processing payment...",

  // File uploads
  uploadSuccess: "File uploaded successfully",
  uploadError: "Failed to upload file",
  uploading: "Uploading...",

  // Generic
  saveSuccess: "Saved successfully",
  saveError: "Failed to save",
  deleteSuccess: "Deleted successfully",
  deleteError: "Failed to delete",
  updateSuccess: "Updated successfully",
  updateError: "Failed to update",
  loadError: "Failed to load data",
  networkError: "Network error. Please try again.",
  unexpectedError: "An unexpected error occurred",
  permissionDenied: "You do not have permission to do that",
  validationError: "Please check the form for errors",
} as const;

/**
 * Helper function for form submission toasts
 *
 * @example
 * ```tsx
 * const handleSubmit = async (data) => {
 *   await toast.promise(
 *     submitForm(data),
 *     {
 *       loading: ToastMessages.saveSuccess,
 *       success: ToastMessages.saveSuccess,
 *       error: ToastMessages.saveError
 *     }
 *   );
 * };
 * ```
 */
export function toastFormSubmit<T>(
  promise: Promise<T>,
  entityName: string = "Item",
): Promise<T> {
  return toast.promise(promise, {
    loading: `Saving ${entityName.toLowerCase()}...`,
    success: `${entityName} saved successfully!`,
    error: (err) =>
      err?.message || `Failed to save ${entityName.toLowerCase()}`,
  });
}

/**
 * Helper function for delete confirmation toasts
 *
 * @example
 * ```tsx
 * const handleDelete = () => {
 *   toastDelete(
 *     deleteProduct(id),
 *     'Product'
 *   );
 * };
 * ```
 */
export function toastDelete<T>(
  promise: Promise<T>,
  entityName: string = "Item",
): Promise<T> {
  return toast.promise(promise, {
    loading: `Deleting ${entityName.toLowerCase()}...`,
    success: `${entityName} deleted successfully`,
    error: (err) =>
      err?.message || `Failed to delete ${entityName.toLowerCase()}`,
  });
}

export default toast;
