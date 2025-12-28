/**
 * 📦 INVENTORY MANAGEMENT DASHBOARD DEMO PAGE
 *
 * Demonstrates dynamic loading of the InventoryDashboard component
 * for bundle size optimization.
 *
 * Divine Patterns:
 * - Dynamic import with loading skeleton
 * - Client-side only rendering
 * - Agricultural consciousness theme
 * - Performance optimized
 */

"use client";

import { InventoryDashboardDynamic } from "@/components/inventory/InventoryDashboardDynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Package, Boxes } from "lucide-react";
import Link from "next/link";

export default function InventoryDemoPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              href="/farmer/dashboard"
              className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-agricultural-100 p-3 rounded-lg">
                <Boxes className="h-6 w-6 text-agricultural-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Inventory Management Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Real-time inventory tracking and management
                </p>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Demo Mode - Dynamic Loading
                </h3>
                <p className="text-sm text-blue-700">
                  This page demonstrates dynamic component loading for optimal
                  bundle size. The inventory dashboard is loaded on-demand,
                  reducing initial page load time and improving performance.
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Inventory Dashboard Component */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <InventoryDashboardDynamic farmId="demo-farm-1" />
          </div>

          {/* Performance Info */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🚀 Performance Optimization
            </h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold mb-1">Dynamic Import</h3>
                <p className="text-sm text-gray-600">
                  The InventoryDashboard component is loaded dynamically using
                  Next.js dynamic imports. This reduces the initial bundle size
                  and improves page load performance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Loading Skeleton</h3>
                <p className="text-sm text-gray-600">
                  While the component loads, a skeleton UI is displayed to
                  maintain a smooth user experience and prevent layout shift.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Code Splitting</h3>
                <p className="text-sm text-gray-600">
                  Data tables, export utilities, and other heavy dependencies
                  are automatically split into separate chunks and loaded only
                  when needed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bundle Size Impact</h3>
                <p className="text-sm text-gray-600">
                  Expected savings: ~40-60 KB from main bundle. Heavy table
                  libraries and CSV processing utilities are deferred until user
                  interaction.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Agricultural Consciousness
                </h3>
                <p className="text-sm text-gray-600">
                  Inventory management with biodynamic awareness - track stock
                  levels, expiration dates, and seasonal availability with
                  divine precision.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Link
              href="/demos/analytics"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Analytics Demo
              </h3>
              <p className="text-sm text-gray-600">
                View the advanced analytics dashboard demo
              </p>
            </Link>
            <Link
              href="/demos/chat"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Chat Demo</h3>
              <p className="text-sm text-gray-600">
                Try the AI-powered chat assistant demo
              </p>
            </Link>
            <Link
              href="/farmer/dashboard"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-sm text-gray-600">
                Return to the main farmer dashboard
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
