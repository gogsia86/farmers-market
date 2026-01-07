import { LoginForm } from "@/components/features/auth/LoginForm";
import type { Metadata } from "next";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Login | Farmers Market Platform",
  description: "Sign in to your Farmers Market account",
};

// Loading fallback component
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8 animate-pulse">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4" />
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
        </div>
        <div className="space-y-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>
          <div className="h-12 bg-gray-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

// Error fallback component
function LoginError() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Login Form</h2>
          <p className="text-gray-600">
            There was an error loading the login page. Please refresh or try again later.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Refresh Page
          </button>
          <a
            href="/"
            className="block w-full text-center bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </a>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Common Issues:</strong>
          </p>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Clear browser cache and cookies</li>
            <li>Try a different browser</li>
            <li>Contact support if issue persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
