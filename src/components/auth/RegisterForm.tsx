/**
 * 🌟 DIVINE REGISTER FORM COMPONENT
 * Farmers Market Platform - User Registration Form
 * Version: 1.0.0
 *
 * Features:
 * - Client-side form handling
 * - React Hook Form + Zod validation
 * - Role selection (Customer/Farmer)
 * - Password strength validation
 * - Accessible form inputs
 * - Loading states and error handling
 * - Agricultural consciousness patterns
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["CUSTOMER", "FARMER"]),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s()-]/g, ""));
        },
        { message: "Invalid phone number" },
      ),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface RegisterFormProps {
  callbackUrl?: string;
  defaultRole?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RegisterForm({
  callbackUrl = "/dashboard",
  defaultRole = "CUSTOMER",
}: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole as "CUSTOMER" | "FARMER",
      phone: "",
      agreeToTerms: false,
    },
  });

  // Watch password for strength indicator
  const password = watch("password");

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 12.5;
    return Math.min(strength, 100);
  };

  // Update password strength when password changes
  useState(() => {
    setPasswordStrength(calculatePasswordStrength(password || ""));
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          phone: data.phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error?.message || "Registration failed. Please try again.",
        );
        setIsLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration successful but auto-login failed
        router.push("/auth/login?registered=true");
        return;
      }

      if (signInResult?.ok) {
        // Successful registration and login
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const selectedRole = watch("role");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Global Form Error */}
      {error && (
        <div
          className="rounded-md bg-red-50 p-4 border border-red-200"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`
              relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-200
              ${
                selectedRole === "CUSTOMER"
                  ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                  : "border-gray-300 hover:border-green-400"
              }
            `}
          >
            <input
              type="radio"
              value="CUSTOMER"
              className="sr-only"
              disabled={isLoading}
              {...register("role")}
            />
            <svg
              className={`h-8 w-8 mb-2 ${
                selectedRole === "CUSTOMER" ? "text-green-600" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              Buy Products
            </span>
            <span className="text-xs text-gray-500 text-center mt-1">
              As a customer
            </span>
          </label>

          <label
            className={`
              relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-200
              ${
                selectedRole === "FARMER"
                  ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                  : "border-gray-300 hover:border-green-400"
              }
            `}
          >
            <input
              type="radio"
              value="FARMER"
              className="sr-only"
              disabled={isLoading}
              {...register("role")}
            />
            <svg
              className={`h-8 w-8 mb-2 ${
                selectedRole === "FARMER" ? "text-green-600" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              Sell Products
            </span>
            <span className="text-xs text-gray-500 text-center mt-1">
              As a farmer
            </span>
          </label>
        </div>
        {errors.role && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          aria-required="true"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2
            sm:text-sm transition-colors
            ${
              errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-green-500 focus:ring-green-500"
            }
          `}
          placeholder="John Doe"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2
            sm:text-sm transition-colors
            ${
              errors.email
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-green-500 focus:ring-green-500"
            }
          `}
          placeholder="you@example.com"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p
            id="email-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Field (Optional) */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Phone number <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2
            sm:text-sm transition-colors
            ${
              errors.phone
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-green-500 focus:ring-green-500"
            }
          `}
          placeholder="+1 (555) 123-4567"
          disabled={isLoading}
          {...register("phone")}
        />
        {errors.phone && (
          <p
            id="phone-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-required="true"
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={
            errors.password
              ? "password-error password-strength"
              : "password-strength"
          }
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2
            sm:text-sm transition-colors
            ${
              errors.password
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-green-500 focus:ring-green-500"
            }
          `}
          placeholder="Create a strong password"
          disabled={isLoading}
          {...register("password")}
        />
        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-2" id="password-strength" aria-live="polite">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <span>Password strength:</span>
              <span
                className={`font-medium ${
                  passwordStrength < 50
                    ? "text-red-600"
                    : passwordStrength < 75
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {passwordStrength < 50
                  ? "Weak"
                  : passwordStrength < 75
                    ? "Medium"
                    : "Strong"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  passwordStrength < 50
                    ? "bg-red-600"
                    : passwordStrength < 75
                      ? "bg-yellow-600"
                      : "bg-green-600"
                }`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>
        )}
        {errors.password && (
          <p
            id="password-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-required="true"
          aria-invalid={errors.confirmPassword ? "true" : "false"}
          aria-describedby={
            errors.confirmPassword ? "confirmPassword-error" : undefined
          }
          className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2
            sm:text-sm transition-colors
            ${
              errors.confirmPassword
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-green-500 focus:ring-green-500"
            }
          `}
          placeholder="Re-enter your password"
          disabled={isLoading}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p
            id="confirmPassword-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            type="checkbox"
            aria-required="true"
            aria-invalid={errors.agreeToTerms ? "true" : "false"}
            aria-describedby={errors.agreeToTerms ? "terms-error" : undefined}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
            disabled={isLoading}
            {...register("agreeToTerms")}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor="agreeToTerms"
            className="text-gray-700 cursor-pointer"
          >
            I agree to the{" "}
            <a
              href="/legal/terms"
              className="text-green-600 hover:text-green-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/legal/privacy"
              className="text-green-600 hover:text-green-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </label>
          {errors.agreeToTerms && (
            <p
              id="terms-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full flex justify-center items-center py-2.5 px-4 border border-transparent
            rounded-md shadow-sm text-sm font-medium text-white
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            transition-all duration-200
            ${
              isLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
            }
          `}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating your account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </div>
    </form>
  );
}
