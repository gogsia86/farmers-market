/**
 * 🌟 DIVINE REGISTER PAGE
 * Farmers Market Platform - User Registration
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
import RegisterForm from "@/components/auth/RegisterForm";

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = generateMetadata({
  title: "Register",
  description:
    "Create your Farmers Market Platform account. Join thousands of farmers and customers supporting local, sustainable agriculture. Get access to fresh, organic produce and connect directly with local farms.",
  path: "/auth/register",
  keywords: [
    "register",
    "sign up",
    "create account",
    "farmer registration",
    "customer registration",
    "join farmers market",
    "agricultural platform signup",
    "sustainable farming community",
    "local farm marketplace",
  ],
  noIndex: false,
  type: "website",
});

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; role?: string };
}) {
  // Check if user is already authenticated
  const session = await auth();
  if (session?.user) {
    redirect(searchParams.callbackUrl || "/dashboard");
  }

  // Generate structured data
  const webPageJsonLd = generateJsonLd("WebPage", {
    "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
    name: "Register - Farmers Market Platform",
    description:
      "Create your account to join the Farmers Market Platform community.",
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
          name: "Register",
          item: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
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
          href="#register-form"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Skip to registration form
        </a>

        <div className="w-full max-w-2xl space-y-8">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Join Our Community
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Connect with local farmers and support sustainable agriculture
            </p>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Why Join Farmers Market Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Access to fresh, organic produce
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Support local farmers directly
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Track orders and deliveries
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Join a sustainable community
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div
            id="register-form"
            className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-gray-100"
          >
            <RegisterForm
              callbackUrl={searchParams.callbackUrl}
              defaultRole={searchParams.role}
            />
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-green-50 via-white to-blue-50 text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div>
              <a
                href="/auth/login"
                className="inline-flex justify-center items-center w-full px-4 py-2 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Sign in to your account
              </a>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                By creating an account, you agree to our{" "}
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
