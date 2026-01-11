/**
 * 🔔 TOAST UI COMPONENT
 * Divine toast notification component with variants
 */

"use client";

import { X } from "lucide-react";
import * as React from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  onDismiss?: () => void;
}

// ============================================================================
// TOAST COMPONENT
// ============================================================================

export function Toast({
  id,
  title,
  description,
  action,
  variant = "default",
  onDismiss,
}: ToastProps) {
  const variantStyles = {
    default: "bg-white border-gray-200 text-gray-900",
    destructive: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const iconStyles = {
    default: "text-gray-500",
    destructive: "text-red-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return "✓";
      case "destructive":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "📢";
    }
  };

  return (
    <div
      id={id}
      className={`pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-lg transition-all ${variantStyles[variant]}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 text-xl ${iconStyles[variant]}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="ml-3 flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="mt-1 text-sm opacity-90">{description}</div>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 inline-flex flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Dismiss notification"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// TOAST VIEWPORT (Container)
// ============================================================================

export interface ToastViewportProps {
  children: React.ReactNode;
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
}

export function ToastViewport({
  children,
  position = "top-right",
}: ToastViewportProps) {
  const positionStyles = {
    "top-right": "top-0 right-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <div
      className={`fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px] ${positionStyles[position]}`}
    >
      {children}
    </div>
  );
}
