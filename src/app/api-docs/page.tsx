import type { Metadata } from "next";
import { SwaggerUI } from "@/components/api-docs/SwaggerUI";

export const metadata: Metadata = {
  title: "API Documentation | Farmers Market Platform",
  description:
    "Interactive REST API documentation for the Farmers Market Platform",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * API Documentation Page
 *
 * Interactive Swagger UI for exploring and testing the Farmers Market Platform API.
 *
 * Features:
 * - Full OpenAPI 3.0.3 specification
 * - Interactive request/response testing
 * - Authentication support (JWT Bearer tokens)
 * - Comprehensive endpoint documentation
 * - Schema definitions and examples
 *
 * @route GET /api-docs
 */
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🌾 Farmers Market Platform API
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Enterprise-grade REST API - Version 1.0.0
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/docs/api"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                📖 API Guides
              </a>
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                ← Back to App
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Links */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold text-blue-900">Quick Links:</span>
            <a
              href="#tag/Authentication"
              className="text-blue-700 hover:text-blue-800"
            >
              Authentication
            </a>
            <a href="#tag/Farms" className="text-blue-700 hover:text-blue-800">
              Farms
            </a>
            <a
              href="#tag/Products"
              className="text-blue-700 hover:text-blue-800"
            >
              Products
            </a>
            <a href="#tag/Orders" className="text-blue-700 hover:text-blue-800">
              Orders
            </a>
            <a href="#tag/Cart" className="text-blue-700 hover:text-blue-800">
              Cart
            </a>
            <a
              href="#components/schemas"
              className="text-blue-700 hover:text-blue-800"
            >
              Schemas
            </a>
          </div>
        </div>
      </div>

      {/* Swagger UI Component */}
      <main className="container mx-auto px-4 py-6">
        <SwaggerUI />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>© 2025 Farmers Market Platform</span>
              <a href="/docs" className="text-blue-600 hover:text-blue-700">
                Documentation
              </a>
              <a
                href="https://github.com/yourusername/farmers-market"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                GitHub
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                ✓ Production Ready
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                OpenAPI 3.0.3
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
