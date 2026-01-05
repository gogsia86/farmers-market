/**
 * 🔔 TOASTER COMPONENT
 * Toast notification renderer with animation
 */

"use client";

import { useToast } from "@/hooks/use-toast";
import { Toast, ToastViewport } from "./toast";

// ============================================================================
// TOASTER COMPONENT
// ============================================================================

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastViewport position="top-right">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-top-full fade-in duration-300"
        >
          <Toast
            id={toast.id}
            title={toast.title}
            description={toast.description}
            action={toast.action}
            variant={toast.variant}
            onDismiss={() => dismiss(toast.id)}
          />
        </div>
      ))}
    </ToastViewport>
  );
}
