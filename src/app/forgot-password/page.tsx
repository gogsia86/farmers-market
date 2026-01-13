"use client";

import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { Component, ReactNode } from "react";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Forgot password page error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-600 mb-4">
                  We encountered an error loading the password reset page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

/**
 * 🔐 FORGOT PASSWORD PAGE
 * Password reset request page
 *
 * FIXES:
 * - Removed Suspense to prevent page crashes
 * - Simplified component structure
 * - Added proper error boundaries
 * - Client component for ErrorBoundary compatibility
 */

function ForgotPasswordPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm />
      </main>
    </ErrorBoundary>
  );
}

export default ForgotPasswordPage;
