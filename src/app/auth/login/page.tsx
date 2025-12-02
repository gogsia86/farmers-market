/**
 * 🌟 DIVINE LOGIN PAGE
 * Farmers Market Platform - Authentication
 * Version: 1.0.0
 *
 * Features:
 * - Next.js 15 App Router
 * - NextAuth v5 integration
 * - Comprehensive SEO metadata
 * - WCAG AAA accessibility
 * - Server-side rendering
 * - Agricultural consciousness patterns
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { generateMetadata, generateJsonLd } from "@/lib/utils/metadata";
import LoginForm from "@/components/auth/LoginForm";

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = generateMetadata({
  title: "Login",
  description:
    "Sign in to your Farmers Market Platform account. Access your farm dashboard, manage products, track orders, and connect with local sustainable agriculture.",
  path: "/auth/login",
  keywords: [
    "login",
    "sign in",
    "farmer login",
    "customer login",
    "farmers market account",
    "farm dashboard access",
    "agricultural platform login",
    "sustainable farming access",
  ],
  noIndex: false,
  type: "website",
});

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  // Check if user is already authenticated
  const session = await auth();
  if (session?.user) {
    redirect(searchParams.callbackUrl || "/dashboard");
  }

  // Generate structured data
  const webPageJsonLd = generateJsonLd("WebPage", {
    "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
    name: "Login - Farmers Market Platform",
    description:
      "Sign in to access your Farmers Market Platform account and dashboard.",
    isPartOf: {
      "@type": "WebSite",
      "@id": process.env.NEXT_PUBLIC_BASE_URL,
      name: "Farmers Market Platform",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: process.env.NEXT_PUBLIC_BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Login",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        },
      ],
    },
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
        {/* Skip to main content for accessibility */}
        <a
          href="#login-form"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Skip to login form
        </a>

        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg"
                aria-hidden="true"
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Sign in to access your dashboard and connect with sustainable
              agriculture
            </p>
          </div>

          {/* Error Message */}
          {searchParams.error && (
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
                  <h3 className="text-sm font-medium text-red-800">
                    Authentication Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {searchParams.error === "CredentialsSignin"
                        ? "Invalid email or password. Please try again."
                        : "An error occurred during sign in. Please try again."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div
            id="login-form"
            className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-gray-100"
          >
            <LoginForm callbackUrl={searchParams.callbackUrl} />
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <div className="text-sm">
              <a
                href="/auth/forgot-password"
                className="font-medium text-green-600 hover:text-green-500 focus:outline-none focus:underline focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              >
                Forgot your password?
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-green-50 via-white to-blue-50 text-gray-500">
                  New to Farmers Market?
                </span>
              </div>
            </div>

            <div>
              <a
                href="/auth/register"
                className="inline-flex justify-center items-center w-full px-4 py-2 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Create an account
              </a>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                By signing in, you agree to our{" "}
                <a
                  href="/legal/terms"
                  className="text-green-600 hover:text-green-500 underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/legal/privacy"
                  className="text-green-600 hover:text-green-500 underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
