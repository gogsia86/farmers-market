"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUIComponent = dynamic(
  () => import("swagger-ui-react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    ),
  },
);

// Import Swagger UI styles
import "swagger-ui-react/swagger-ui.css";

/**
 * SwaggerUI Component
 *
 * Interactive Swagger UI component for API documentation.
 * Dynamically imports Swagger UI React to avoid SSR issues.
 *
 * Features:
 * - Client-side only rendering
 * - Custom styling and theme
 * - JWT authentication support
 * - Loads OpenAPI spec from /api/openapi.json
 *
 * @component
 */
export function SwaggerUI() {
  const [isClient, setIsClient] = useState(false);
  const [authToken, setAuthToken] = useState<string>("");

  useEffect(() => {
    setIsClient(true);

    // Try to load auth token from localStorage
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  // Custom request interceptor to add auth token
  const requestInterceptor = (req: any) => {
    if (authToken && !req.headers.Authorization) {
      req.headers.Authorization = `Bearer ${authToken}`;
    }
    return req;
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-wrapper">
      {/* Auth Token Input (Optional) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label
              htmlFor="auth-token"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              🔐 JWT Authentication Token (Optional)
            </label>
            <input
              id="auth-token"
              type="text"
              placeholder="Paste your JWT token here to test authenticated endpoints..."
              value={authToken}
              onChange={(e) => {
                setAuthToken(e.target.value);
                localStorage.setItem("authToken", e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 Get your token by logging in via{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                POST /api/auth/signin
              </code>{" "}
              or use the NextAuth session token from your browser cookies.
            </p>
          </div>
          {authToken && (
            <button
              onClick={() => {
                setAuthToken("");
                localStorage.removeItem("authToken");
              }}
              className="mt-6 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Swagger UI */}
      <div className="swagger-ui-container bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SwaggerUIComponent
          url="/api/openapi.json"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={3}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          tryItOutEnabled={true}
          requestInterceptor={requestInterceptor}
          persistAuthorization={true}
          deepLinking={true}
          displayOperationId={false}
        />
      </div>

      {/* Custom CSS for Swagger UI */}
      <style>{`
        /* Container styling */
        .swagger-ui-wrapper {
          @apply w-full max-w-full;
        }

        .swagger-ui-container {
          @apply overflow-x-auto;
        }

        /* Swagger UI custom theme */
        .swagger-ui {
          @apply font-sans;
        }

        .swagger-ui .topbar {
          display: none !important;
        }

        .swagger-ui .info {
          @apply mb-8;
        }

        .swagger-ui .info .title {
          @apply text-3xl font-bold text-gray-900;
        }

        .swagger-ui .info .description {
          @apply text-gray-700 leading-relaxed;
        }

        .swagger-ui .scheme-container {
          @apply bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6;
        }

        .swagger-ui .opblock-tag {
          @apply border-b border-gray-200 py-4;
        }

        .swagger-ui .opblock-tag-section {
          @apply mb-6;
        }

        .swagger-ui .opblock {
          @apply border border-gray-200 rounded-lg mb-4 shadow-sm;
        }

        .swagger-ui .opblock.opblock-get {
          @apply border-l-4 border-l-blue-500;
        }

        .swagger-ui .opblock.opblock-post {
          @apply border-l-4 border-l-green-500;
        }

        .swagger-ui .opblock.opblock-put {
          @apply border-l-4 border-l-orange-500;
        }

        .swagger-ui .opblock.opblock-delete {
          @apply border-l-4 border-l-red-500;
        }

        .swagger-ui .opblock.opblock-patch {
          @apply border-l-4 border-l-purple-500;
        }

        .swagger-ui .opblock-summary {
          @apply cursor-pointer;
        }

        .swagger-ui .btn {
          @apply font-medium transition-colors;
        }

        .swagger-ui .btn.execute {
          @apply bg-blue-600 hover:bg-blue-700 text-white border-0;
        }

        .swagger-ui .btn.cancel {
          @apply bg-gray-500 hover:bg-gray-600 text-white border-0;
        }

        .swagger-ui .response-col_status {
          @apply font-semibold;
        }

        .swagger-ui .response.success {
          @apply bg-green-50 border-green-200;
        }

        .swagger-ui .response.error {
          @apply bg-red-50 border-red-200;
        }

        .swagger-ui table {
          @apply w-full border-collapse;
        }

        .swagger-ui table thead tr {
          @apply bg-gray-50;
        }

        .swagger-ui table tbody tr {
          @apply border-b border-gray-200;
        }

        .swagger-ui .parameter__name {
          @apply font-semibold text-gray-900;
        }

        .swagger-ui .parameter__type {
          @apply text-sm text-gray-600;
        }

        .swagger-ui .model-box {
          @apply bg-gray-50 border border-gray-200 rounded p-4;
        }

        .swagger-ui .model-title {
          @apply font-semibold text-gray-900;
        }

        .swagger-ui pre {
          @apply bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto;
        }

        .swagger-ui code {
          @apply bg-gray-100 text-gray-900 px-1 py-0.5 rounded text-sm font-mono;
        }

        .swagger-ui pre code {
          @apply bg-transparent text-gray-100 p-0;
        }

        /* Response/Request sections */
        .swagger-ui .responses-wrapper,
        .swagger-ui .request-body {
          @apply mt-4;
        }

        .swagger-ui .highlight-code {
          @apply bg-gray-900 rounded-lg;
        }

        .swagger-ui .highlight-code pre {
          @apply m-0 p-4;
        }

        /* Authorization */
        .swagger-ui .auth-wrapper {
          @apply mb-6;
        }

        .swagger-ui .authorization__btn {
          @apply bg-green-600 hover:bg-green-700 text-white;
        }

        .swagger-ui .authorization__btn.locked {
          @apply bg-green-700;
        }

        .swagger-ui .authorization__btn.unlocked {
          @apply bg-gray-400;
        }

        /* Filter */
        .swagger-ui .filter-container {
          @apply mb-6;
        }

        .swagger-ui .operation-filter-input {
          @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500;
        }

        /* Loading state */
        .swagger-ui .loading-container {
          @apply flex items-center justify-center py-12;
        }

        /* Try it out */
        .swagger-ui .try-out__btn {
          @apply bg-blue-600 hover:bg-blue-700 text-white;
        }

        /* Parameters table */
        .swagger-ui .parameters-col_description {
          @apply text-gray-700;
        }

        .swagger-ui .parameter__in {
          @apply text-xs text-gray-500 uppercase tracking-wide;
        }

        /* Response samples */
        .swagger-ui .response-col_links {
          @apply text-sm;
        }

        /* Markdown rendering */
        .swagger-ui .markdown p {
          @apply mb-2;
        }

        .swagger-ui .markdown ul {
          @apply list-disc list-inside mb-2;
        }

        .swagger-ui .markdown ol {
          @apply list-decimal list-inside mb-2;
        }

        .swagger-ui .markdown h1 {
          @apply text-2xl font-bold mb-4;
        }

        .swagger-ui .markdown h2 {
          @apply text-xl font-bold mb-3;
        }

        .swagger-ui .markdown h3 {
          @apply text-lg font-semibold mb-2;
        }

        /* Scrollbar styling */
        .swagger-ui-container::-webkit-scrollbar {
          @apply w-2 h-2;
        }

        .swagger-ui-container::-webkit-scrollbar-track {
          @apply bg-gray-100;
        }

        .swagger-ui-container::-webkit-scrollbar-thumb {
          @apply bg-gray-400 rounded;
        }

        .swagger-ui-container::-webkit-scrollbar-thumb:hover {
          @apply bg-gray-500;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .swagger-ui .opblock-summary {
            @apply text-sm;
          }

          .swagger-ui .opblock-body {
            @apply text-sm;
          }

          .swagger-ui table {
            @apply text-xs;
          }
        }
      `}</style>
    </div>
  );
}
