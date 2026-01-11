// 🧠 DIVINE PATTERN: Invoice Download Component
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Order Management & Invoice Generation
// ⚡ Performance: Optimized PDF download with analytics tracking

"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { logger } from "@/lib/monitoring/logger";

interface InvoiceDownloadButtonProps {
  orderId: string;
  orderNumber?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * InvoiceDownloadButton Component
 *
 * Provides PDF invoice download functionality with:
 * - Loading states
 * - Error handling
 * - Analytics tracking
 * - Agricultural consciousness
 */
export function InvoiceDownloadButton({
  orderId,
  orderNumber,
  variant = "primary",
  size = "md",
  className = "",
}: InvoiceDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const { trackDownloadInvoice, trackError } = useAnalytics();

  const handleDownload = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Track download attempt
      trackDownloadInvoice(orderId);

      // Fetch invoice PDF
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate invoice");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderNumber || orderId}.pdf`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Success notification
      toast.success("Invoice downloaded successfully! 🌾", {
        description: `Invoice for order ${orderNumber || orderId}`,
      });
    } catch (error) {
      logger.error("Invoice download failed:", {
        error: error instanceof Error ? error.message : String(error),
      });

      // Track error
      trackError({
        message:
          error instanceof Error ? error.message : "Invoice download failed",
        page: "/orders",
        fatal: false,
      });

      // Error notification
      toast.error("Failed to download invoice", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  // Variant styles
  const variantStyles = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    outline: "border-2 border-green-600 text-green-600 hover:bg-green-50",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        flex items-center gap-2 rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      aria-label={`Download invoice for order ${orderNumber || orderId}`}
      title="Download PDF invoice"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Download Invoice</span>
        </>
      )}
    </button>
  );
}

/**
 * Compact Invoice Download Button (icon only)
 */
export function InvoiceDownloadIconButton({
  orderId,
  orderNumber,
  className = "",
}: Pick<InvoiceDownloadButtonProps, "orderId" | "orderNumber" | "className">) {
  const [loading, setLoading] = useState(false);
  const { trackDownloadInvoice, trackError } = useAnalytics();

  const handleDownload = async () => {
    if (loading) return;

    setLoading(true);

    try {
      trackDownloadInvoice(orderId);

      const response = await fetch(`/api/orders/${orderId}/invoice`);

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded! 🌾");
    } catch (error) {
      trackError({
        message:
          error instanceof Error ? error.message : "Invoice download failed",
        page: "/orders",
        fatal: false,
      });

      toast.error("Failed to download invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        p-2 rounded-lg text-green-600 hover:bg-green-50
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={`Download invoice for order ${orderNumber || orderId}`}
      title="Download invoice"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Download className="w-5 h-5" />
      )}
    </button>
  );
}
