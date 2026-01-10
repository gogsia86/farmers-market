/**
 * 🌟 Error Toast Components - Divine Agricultural Toast Notifications
 *
 * Comprehensive toast notification system with queue management,
 * auto-dismiss, animations, and agricultural consciousness.
 *
 * @module components/errors/error-toast
 */

"use client";

import type { AppError } from "@/lib/errors/types";
import { ErrorCategory, ErrorSeverity } from "@/lib/errors/types";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ============================================================================
// TOAST TYPES
// ============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  onDismiss?: () => void;
  error?: AppError;
  agricultural?: {
    season?: string;
    farmId?: string;
    consciousness?: string;
  };
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  position?: ToastPosition;
  agricultural?: {
    season?: string;
    farmId?: string;
    consciousness?: string;
  };
}

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// ============================================================================
// TOAST CONTEXT
// ============================================================================

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, message: string, options?: ToastOptions) => string;
  error: (title: string, message: string, options?: ToastOptions) => string;
  warning: (title: string, message: string, options?: ToastOptions) => string;
  info: (title: string, message: string, options?: ToastOptions) => string;
  errorFromAppError: (error: AppError, options?: ToastOptions) => string;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to use toast notifications
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// ============================================================================
// TOAST PROVIDER
// ============================================================================

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

/**
 * Toast provider with queue management
 */
export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCountRef = useRef(0);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">): string => {
      const id = `toast-${Date.now()}-${toastCountRef.current++}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
        dismissible: toast.dismissible ?? true,
      };

      setToasts((prev) => {
        // Limit number of toasts
        const updated = [...prev, newToast];
        if (updated.length > maxToasts) {
          return updated.slice(updated.length - maxToasts);
        }
        return updated;
      });

      return id;
    },
    [defaultDuration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast: any) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message: string, options?: ToastOptions): string => {
      return addToast({
        type: "success",
        title,
        message,
        duration: options?.duration,
        dismissible: options?.dismissible,
        action: options?.action,
        agricultural: options?.agricultural,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message: string, options?: ToastOptions): string => {
      return addToast({
        type: "error",
        title,
        message,
        duration: options?.duration ?? 7000, // Longer for errors
        dismissible: options?.dismissible,
        action: options?.action,
        agricultural: options?.agricultural,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message: string, options?: ToastOptions): string => {
      return addToast({
        type: "warning",
        title,
        message,
        duration: options?.duration ?? 6000,
        dismissible: options?.dismissible,
        action: options?.action,
        agricultural: options?.agricultural,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message: string, options?: ToastOptions): string => {
      return addToast({
        type: "info",
        title,
        message,
        duration: options?.duration,
        dismissible: options?.dismissible,
        action: options?.action,
        agricultural: options?.agricultural,
      });
    },
    [addToast]
  );

  const errorFromAppError = useCallback(
    (appError: AppError, options?: ToastOptions): string => {
      const isAgricultural =
        appError.category === ErrorCategory.SEASONAL ||
        appError.category === ErrorCategory.BIODYNAMIC ||
        appError.category === ErrorCategory.AGRICULTURAL;

      return addToast({
        type: "error",
        title: appError.userDetails.title,
        message: appError.userDetails.message,
        duration: options?.duration ?? 7000,
        dismissible: options?.dismissible,
        action: options?.action,
        error: appError,
        agricultural: isAgricultural
          ? {
            consciousness: "DIVINE",
            ...options?.agricultural,
          }
          : options?.agricultural,
      });
    },
    [addToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    errorFromAppError,
    clearAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  return (
    <div
      className={cn("fixed z-50 flex flex-col gap-2 p-4", getPositionClasses(position))}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast: any) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function getPositionClasses(position: ToastPosition): string {
  switch (position) {
    case "top-left":
      return "top-0 left-0 items-start";
    case "top-center":
      return "top-0 left-1/2 -translate-x-1/2 items-center";
    case "top-right":
      return "top-0 right-0 items-end";
    case "bottom-left":
      return "bottom-0 left-0 items-start";
    case "bottom-center":
      return "bottom-0 left-1/2 -translate-x-1/2 items-center";
    case "bottom-right":
      return "bottom-0 right-0 items-end";
    default:
      return "top-0 right-0 items-end";
  }
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastVariants = cva(
  "relative flex items-start gap-3 w-full max-w-md p-4 rounded-lg shadow-lg border-2 transition-all duration-300 animate-in slide-in-from-top-5 fade-in",
  {
    variants: {
      type: {
        success: "bg-green-50 border-green-200 text-green-900",
        error: "bg-red-50 border-red-200 text-red-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
        info: "bg-blue-50 border-blue-200 text-blue-900",
      },
    },
  }
);

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(100);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onDismiss?.();
    }, 300); // Match exit animation duration
  }, [onRemove, toast.id, toast.onDismiss]);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(handleRemove, toast.duration);

      // Progress bar
      const progressInterval = 50; // Update every 50ms
      const steps = toast.duration / progressInterval;
      let currentStep = 0;

      progressIntervalRef.current = setInterval(() => {
        currentStep++;
        setProgress(((steps - currentStep) / steps) * 100);

        if (currentStep >= steps) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }, progressInterval);
    }

    // Always return cleanup function
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [toast.duration, handleRemove]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleMouseLeave = () => {
    if (toast.duration && toast.duration > 0) {
      const remainingTime = (progress / 100) * toast.duration;
      timerRef.current = setTimeout(handleRemove, remainingTime);

      // Resume progress
      const progressInterval = 50;
      const steps = remainingTime / progressInterval;
      let currentStep = 0;

      progressIntervalRef.current = setInterval(() => {
        currentStep++;
        setProgress(((steps - currentStep) / steps) * 100);

        if (currentStep >= steps) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }, progressInterval);
    }
  };

  const Icon = getToastIcon(toast.type);

  return (
    <div
      className={cn(
        toastVariants({ type: toast.type }),
        isExiting && "animate-out slide-out-to-top-5 fade-out"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current opacity-30 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm mb-1">{toast.title}</p>
        <p className="text-sm opacity-90">{toast.message}</p>

        {/* Agricultural context */}
        {toast.agricultural && (
          <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
            <span>🌾</span>
            {toast.agricultural.season && (
              <span>Season: {toast.agricultural.season}</span>
            )}
          </div>
        )}

        {/* Action button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleRemove();
            }}
            className="mt-2 text-sm font-medium hover:underline"
          >
            {toast.action.label}
          </button>
        )}

        {/* Error details */}
        {toast.error && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer hover:underline opacity-75">
              Error details
            </summary>
            <div className="mt-1 text-xs opacity-75 space-y-1">
              <div>Code: {toast.error.code}</div>
              <div>ID: {toast.error.errorId}</div>
            </div>
          </details>
        )}
      </div>

      {/* Dismiss button */}
      {toast.dismissible && (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function getToastIcon(type: ToastType) {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return AlertCircle;
    case "warning":
      return AlertTriangle;
    case "info":
      return Info;
    default:
      return Info;
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for error toasts with retry
 */
export function useErrorToast() {
  const toast = useToast();

  const showError = useCallback(
    (error: AppError | Error | string, onRetry?: () => void) => {
      if (typeof error === "string") {
        return toast.error("Error", error, {
          action: onRetry ? { label: "Retry", onClick: onRetry } : undefined,
        });
      }

      if (error instanceof Error && "code" in error && "userDetails" in error) {
        // AppError
        return toast.errorFromAppError(error as AppError, {
          action: onRetry ? { label: "Retry", onClick: onRetry } : undefined,
        });
      }

      // Regular Error
      return toast.error("Error", error.message, {
        action: onRetry ? { label: "Retry", onClick: onRetry } : undefined,
      });
    },
    [toast]
  );

  return {
    showError,
    success: toast.success,
    warning: toast.warning,
    info: toast.info,
  };
}

/**
 * Hook for agricultural toasts
 */
export function useAgriculturalToast(season?: string, farmId?: string) {
  const toast = useToast();

  const agricultural = {
    season,
    farmId,
    consciousness: "DIVINE",
  };

  return {
    success: (title: string, message: string, options?: ToastOptions) =>
      toast.success(title, message, { ...options, agricultural }),
    error: (title: string, message: string, options?: ToastOptions) =>
      toast.error(title, message, { ...options, agricultural }),
    warning: (title: string, message: string, options?: ToastOptions) =>
      toast.warning(title, message, { ...options, agricultural }),
    info: (title: string, message: string, options?: ToastOptions) =>
      toast.info(title, message, { ...options, agricultural }),
    errorFromAppError: (error: AppError, options?: ToastOptions) =>
      toast.errorFromAppError(error, { ...options, agricultural }),
  };
}

/**
 * Hook for undo toast notifications
 */
export function useUndoToast() {
  const toast = useToast();

  const showUndo = useCallback(
    (
      message: string,
      onUndo: () => void,
      options?: Omit<ToastOptions, "action">
    ): string => {
      return toast.info("Action completed", message, {
        ...options,
        duration: options?.duration ?? 5000,
        action: {
          label: "Undo",
          onClick: onUndo,
        },
      });
    },
    [toast]
  );

  return { showUndo };
}

// ============================================================================
// STANDALONE TOAST COMPONENT (for testing/storybook)
// ============================================================================

export interface StandaloneToastProps {
  type: ToastType;
  title: string;
  message: string;
  action?: ToastAction;
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Standalone toast component (not in provider)
 */
export function StandaloneToast({
  type,
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
}: StandaloneToastProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  const Icon = getToastIcon(type);

  return (
    <div
      className={cn(toastVariants({ type }), "w-full max-w-md")}
      role="alert"
    >
      <div className="flex-shrink-0 pt-0.5">
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-sm opacity-90">{message}</p>

        {action && (
          <button
            onClick={() => {
              action.onClick();
              handleDismiss();
            }}
            className="mt-2 text-sm font-medium hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ErrorCategory, ErrorSeverity };
