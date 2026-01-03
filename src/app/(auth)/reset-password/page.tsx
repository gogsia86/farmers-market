/**
 * 🔐 RESET PASSWORD PAGE
 * Divine password reset with token validation and agricultural consciousness
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authLogger } from "@/lib/utils/logger";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link.",
      );
    }
  }, [token]);

  // Password strength validation
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setValidationErrors(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation checks
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError("Please fix the password validation errors");
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Implement password reset API call
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again or request a new reset link.",
      );
      authLogger.error("Password reset error", err instanceof Error ? err : new Error(String(err)), {
        hasToken: !!token,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Password Reset Successful!
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Your password has been updated successfully. You can now sign in
              with your new password.
            </p>

            {/* Auto-redirect message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 text-center">
                Redirecting to login page in 3 seconds...
              </p>
            </div>

            {/* Manual Link */}
            <Link href="/login" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Login Now
              </Button>
            </Link>
          </div>

          {/* Divine Note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            🌾 Your account security is divinely protected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set New Password
            </h1>
            <p className="text-gray-600">
              Create a strong password to secure your account
            </p>
          </div>

          {/* Token Error */}
          {!token && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-600">
                  <p className="font-medium mb-1">Invalid Reset Link</p>
                  <p>
                    This password reset link is invalid or has expired.{" "}
                    <Link
                      href="/forgot-password"
                      className="underline hover:no-underline"
                    >
                      Request a new one
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={isSubmitting || !token}
                  className="w-full pr-10"
                  data-testid="reset-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={isSubmitting || !token}
                  className="w-full pr-10"
                  data-testid="reset-confirm-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {password && validationErrors.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Password Requirements:
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !token || validationErrors.length > 0}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="reset-password-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">🌱</span>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <Link
              href="/support"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Contact Support
            </Link>
          </p>
        </div>

        {/* Divine Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          ✨ Password reset secured with divine agricultural consciousness
        </p>
      </div>
    </div>
  );
}
