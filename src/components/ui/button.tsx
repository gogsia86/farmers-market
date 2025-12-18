/**
 * 🔘 UNIFIED BUTTON COMPONENT
 * Standardized button with consistent sizing across all variants
 *
 * Variants:
 * - default: Standard gray button
 * - primary: Green CTA button (main actions)
 * - secondary: Gray secondary button
 * - outline: Border-only button
 * - ghost: Minimal hover-only button
 * - destructive: Red destructive button
 * - agricultural: Farm-themed button with earth tones
 *
 * Sizes:
 * - sm: Small (h-8, px-3, text-sm)
 * - default: Standard (h-10, px-6, py-2)
 * - lg: Large (h-12, px-8, text-lg)
 * - icon: Square icon-only (h-10, w-10)
 *
 * Reference: DESIGN_SYSTEM_ANALYSIS.md - Button Design System
 */

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "agricultural";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantClasses = {
      default:
        "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-500",
      primary:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400",
      outline:
        "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
      agricultural:
        "bg-agricultural-600 text-white hover:bg-agricultural-700 focus-visible:ring-agricultural-500 shadow-sm",
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      default: "h-10 px-6 py-2",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
