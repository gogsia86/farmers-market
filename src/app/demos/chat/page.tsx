/**
 * 💬 AI CHAT ASSISTANT DEMO PAGE
 *
 * Demonstrates dynamic loading of the OllamaChatBot component
 * for bundle size optimization.
 *
 * Divine Patterns:
 * - Dynamic import with loading skeleton
 * - Client-side only rendering
 * - Agricultural consciousness theme
 * - AI-powered assistance
 * - Performance optimized
 */

"use client";

import { OllamaChatBotDynamic } from "@/components/features/ai/OllamaChatBotDynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ChatDemoPage() {
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
                <MessageSquare className="h-6 w-6 text-agricultural-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Chat Assistant
                </h1>
                <p className="text-gray-600 mt-1">
                  Intelligent agricultural assistance powered by Ollama
                </p>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Demo Mode - Dynamic Loading
                </h3>
                <p className="text-sm text-blue-700">
                  This page demonstrates dynamic component loading for optimal
                  bundle size. The AI chat component is loaded on-demand,
                  reducing initial page load time and deferring heavy AI
                  libraries until needed.
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Chat Component */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <OllamaChatBotDynamic />
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
                  The OllamaChatBot component is loaded dynamically using
                  Next.js dynamic imports. This reduces the initial bundle size
                  and improves page load performance significantly.
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
                  AI libraries (Ollama client), WebSocket connections, and other
                  heavy dependencies are automatically split into separate
                  chunks and loaded only when needed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bundle Size Impact</h3>
                <p className="text-sm text-gray-600">
                  Expected savings: ~60-80 KB from main bundle. Heavy AI/ML
                  libraries and WebSocket utilities are deferred until the chat
                  interface is actually used.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Agricultural Intelligence
                </h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered assistance for farming operations, crop
                  planning, pest management, and more. The assistant understands
                  agricultural context and biodynamic practices.
                </p>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ✨ AI Assistant Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  🌾 Crop Recommendations
                </h3>
                <p className="text-sm text-gray-600">
                  Get personalized crop suggestions based on season, soil, and
                  climate conditions.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  🐛 Pest Management
                </h3>
                <p className="text-sm text-gray-600">
                  Identify pests and receive organic treatment recommendations.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  📅 Seasonal Planning
                </h3>
                <p className="text-sm text-gray-600">
                  Plan planting and harvest schedules optimized for your region.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  💰 Market Insights
                </h3>
                <p className="text-sm text-gray-600">
                  Get pricing trends and market demand analysis for your crops.
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
              href="/demos/inventory"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Inventory Demo
              </h3>
              <p className="text-sm text-gray-600">
                View the inventory management dashboard demo
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
