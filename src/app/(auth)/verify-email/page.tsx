/**
 * ✉️ EMAIL VERIFICATION PAGE
 * Divine email verification with token validation and agricultural consciousness
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 * @reference 05_TESTING_SECURITY_DIVINITY.instructions.md
 */

"use client";

import { Button } from "@/components/ui/button";
import { authLogger } from "@/lib/utils/logger";
import { AlertCircle, CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Verify email on mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid or missing verification token.");
        setIsVerifying(false);
        return;
      }

      try {
        // TODO: Implement email verification API call
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Email verification failed");
        }

        setIsSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify email. The link may have expired.",
        );
        authLogger.error("Email verification error", err instanceof Error ? err : new Error(String(err)), {
          hasToken: !!token,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    try {
      // TODO: Implement resend verification email API call
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      setResendSuccess(true);
    } catch (err) {
      setError("Failed to resend verification email. Please try again later.");
      authLogger.error("Resend verification email failed", err instanceof Error ? err : new Error(String(err)));
    } finally {
      setResendLoading(false);
    }
  };

  // Verifying State
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Loading Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            </div>

            {/* Loading Message */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Verifying Your Email
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Please wait while we verify your email address...
            </p>

            {/* Loading Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-green-600 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>

          {/* Divine Note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            🌾 Agricultural consciousness is verifying your identity
          </p>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Email Verified Successfully!
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Your email has been verified. You can now sign in to your account
              and start exploring our farmers market platform.
            </p>

            {/* Auto-redirect message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 text-center">
                Redirecting to login page in 3 seconds...
              </p>
            </div>

            {/* Manual Link */}
            <Link href="/login?verified=true" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Login Now
              </Button>
            </Link>
          </div>

          {/* Divine Note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            ✨ Welcome to the divine agricultural community!
          </p>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Verification Failed
          </h1>
          <div className="mb-8">
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-600">
                <p className="font-medium mb-1">Unable to Verify Email</p>
                <p>
                  {error || "The verification link is invalid or has expired."}
                </p>
              </div>
            </div>
          </div>

          {/* Resend Success Message */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-600">
                  <p className="font-medium mb-1">Verification Email Sent</p>
                  <p>Please check your inbox for a new verification link.</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Resend Verification */}
            <Button
              onClick={handleResendVerification}
              disabled={resendLoading || resendSuccess}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="resend-verification-button"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Email Sent
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            {/* Back to Login */}
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              Need help?{" "}
              <Link
                href="/support"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Divine Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          🌾 Email verification protected by divine agricultural consciousness
        </p>
      </div>
    </div>
  );
}
