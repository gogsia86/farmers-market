/**
 * 🔐 FORGOT PASSWORD PAGE
 * Divine password reset flow with agricultural consciousness
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authLogger } from "@/lib/utils/logger";
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // TODO: Implement password reset API call
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      authLogger.error("Password reset request failed", err instanceof Error ? err : new Error(String(err)), {
        email: email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email for privacy
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
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
              Check Your Email
            </h1>
            <div className="text-center space-y-4 mb-8">
              <p className="text-gray-600">
                We've sent password reset instructions to:
              </p>
              <p className="text-lg font-semibold text-green-600 break-all">
                {email}
              </p>
              <p className="text-sm text-gray-500">
                If you don't see the email, check your spam folder or try again.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Return to Login
                </Button>
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
              >
                Didn't receive email? Try again
              </button>
            </div>
          </div>

          {/* Divine Note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            🌾 Agricultural consciousness guides your password recovery
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
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
                className="w-full"
                data-testid="forgot-password-email"
              />
            </div>

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
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="forgot-password-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">🌱</span>
                  Sending Instructions...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Instructions
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
          ✨ All password resets are securely processed with divine agricultural
          consciousness
        </p>
      </div>
    </div>
  );
}
