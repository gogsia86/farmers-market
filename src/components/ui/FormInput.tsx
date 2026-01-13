"use client";

/**
 * ♿ ACCESSIBLE FORM INPUT COMPONENT
 * WCAG 2.1 AA Compliant Input with comprehensive ARIA support
 *
 * Features:
 * - Proper label association
 * - Error states with aria-invalid and aria-describedby
 * - Required field indicators
 * - Screen reader friendly
 * - Keyboard navigation support
 * - Visual feedback for validation states
 */

import { clsx } from "clsx";
import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Unique identifier for the input - required for accessibility */
  id: string;
  /** Label text - required for accessibility */
  label: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Icon to display before the input */
  icon?: ReactNode;
  /** Whether to hide the label visually (still accessible to screen readers) */
  srOnlyLabel?: boolean;
  /** Container class name */
  containerClassName?: string;
  /** Label class name */
  labelClassName?: string;
}

/**
 * Accessible form input component with WCAG 2.1 AA compliance
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      icon,
      srOnlyLabel = false,
      required = false,
      disabled = false,
      className,
      containerClassName,
      labelClassName,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);

    // Build aria-describedby with error, helper text, and custom values
    const describedByIds = [
      hasError && errorId,
      helperText && helperId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={clsx("space-y-2", containerClassName)}>
        {/* Label */}
        <label
          htmlFor={id}
          className={clsx(
            "block text-sm font-medium",
            srOnlyLabel
              ? "sr-only"
              : hasError
                ? "text-red-700"
                : disabled
                  ? "text-gray-400"
                  : "text-gray-700",
            labelClassName
          )}
        >
          {label}
          {required && (
            <span
              className="ml-1 text-red-500"
              aria-label="required"
              role="presentation"
            >
              *
            </span>
          )}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Icon (if provided) */}
          {icon && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-required={required}
            aria-invalid={hasError}
            aria-describedby={describedByIds || undefined}
            className={clsx(
              "w-full rounded-lg border px-4 py-2.5 text-sm transition-all duration-200",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2",
              // Icon spacing
              icon && "pl-10",
              // Error state
              hasError
                ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200"
                : // Disabled state
                  disabled
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                  : // Normal state
                    "border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200",
              // Hover state (when not disabled or error)
              !disabled && !hasError && "hover:border-gray-400",
              className
            )}
            {...props}
          />
        </div>

        {/* Helper Text */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className="text-sm text-gray-600"
            role="note"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {hasError && (
          <div
            id={errorId}
            className="flex items-start gap-1.5"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

/**
 * Example Usage:
 *
 * <FormInput
 *   id="email"
 *   label="Email Address"
 *   type="email"
 *   required
 *   error={errors.email}
 *   helperText="We'll never share your email"
 *   icon={<MailIcon />}
 *   placeholder="you@example.com"
 *   autoComplete="email"
 * />
 */
