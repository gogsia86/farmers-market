/**
 * 🤖 AI Assistant Page (Customer)
 *
 * Interactive AI assistant for customers to get help with products,
 * orders, and general platform questions.
 *
 * @page /ai-assistant
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AIAssistantClient from "./AIAssistantClient";

export const metadata = {
  title: "AI Assistant | Farmers Market",
  description:
    "Get instant help from our AI assistant. Ask questions about products, orders, farms, and more.",
  keywords: ["ai assistant", "customer support", "help", "chatbot"],
};

export default async function AIAssistantPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/ai-assistant");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get instant answers to your questions about products, orders, farms,
            and more. Our AI assistant is here to help 24/7.
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            emoji="📦"
            title="Track Orders"
            description="Get order status and delivery updates"
          />
          <QuickActionCard
            emoji="🌾"
            title="Find Products"
            description="Discover fresh produce and farms"
          />
          <QuickActionCard
            emoji="❓"
            title="Get Help"
            description="Ask any question about the platform"
          />
        </div>
      </div>

      {/* Chat Interface */}
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto">
            <div className="h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-lg animate-pulse" />
          </div>
        }
      >
        <AIAssistantClient
          userName={session.user.name || "there"}
          userEmail={session.user.email || undefined}
        />
      </Suspense>

      {/* Features & Tips */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span>💡</span>
            Tips for Better Assistance
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">
                •
              </span>
              <span>
                <strong>Be specific:</strong> Include order numbers, product
                names, or farm names when asking questions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">
                •
              </span>
              <span>
                <strong>Ask follow-ups:</strong> The AI remembers your
                conversation context
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">
                •
              </span>
              <span>
                <strong>Try examples:</strong> "What's fresh this week?", "Where
                is my order?", "Tell me about organic farms"
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">
                •
              </span>
              <span>
                <strong>Need human help?</strong> The AI can connect you with
                our support team
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="max-w-4xl mx-auto mt-6">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          🔒 Your conversations are private and secure. We use AI to provide
          instant assistance while protecting your data.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Quick Action Card Component
// ============================================================================

function QuickActionCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-default">
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
