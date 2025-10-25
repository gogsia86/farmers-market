import { ArrowLeft, Home, Search, Sprout } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

/**
 * 🌾 NOT FOUND PAGE - AGRICULTURAL CONSCIOUSNESS GUIDANCE
 *
 * Purpose: Handle 404 errors with divine agricultural wisdom
 * Features:
 * - Semantic path redirection with farming intelligence
 * - Biodynamic search suggestions
 * - Cosmic navigation restoration
 * - Enlightening user guidance
 *
 * DIVINE PRINCIPLES:
 * - Agricultural domain semantic precision
 * - Holographic component patterns for lost souls
 * - Temporal optimization for path discovery
 * - Reality bending for navigation harmony
 */

export const metadata: Metadata = {
  title: "🌾 Lost in the Fields - Farmers Market",
  description:
    "This agricultural path has not been cultivated yet. Let us guide you back to fertile ground.",
};

// 🌿 Get seasonal navigation suggestions
function getSeasonalSuggestions(): string[] {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) {
    return [
      "Spring Planting Guide",
      "Seed Catalog",
      "Garden Planning Tools",
      "Early Season Crops",
    ];
  } else if (month >= 6 && month <= 8) {
    return [
      "Summer Harvest Calendar",
      "Irrigation Systems",
      "Pest Management",
      "Fresh Produce Market",
    ];
  } else if (month >= 9 && month <= 11) {
    return [
      "Autumn Harvest Festival",
      "Preservation Techniques",
      "Winter Prep Guide",
      "Root Vegetable Storage",
    ];
  } else {
    return [
      "Winter Planning",
      "Greenhouse Management",
      "Seed Selection",
      "Next Season Preparation",
    ];
  }
}

// 🔮 Divine agricultural suggestions
function getAgriculturalSuggestions(): {
  label: string;
  href: string;
  icon: string;
}[] {
  return [
    { label: "Farmers Dashboard", href: "/admin", icon: "🚜" },
    { label: "Crop Management", href: "/admin/crops", icon: "🌱" },
    { label: "Market Analytics", href: "/admin/analytics", icon: "📊" },
    { label: "User Management", href: "/admin/users", icon: "👥" },
    { label: "Order Management", href: "/admin/orders", icon: "📦" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];
}

export default function NotFound() {
  const seasonalSuggestions = getSeasonalSuggestions();
  const agriculturalSuggestions = getAgriculturalSuggestions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-green-200 dark:border-green-800">
          {/* 🌾 Lost in Fields Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900 dark:to-yellow-900 rounded-full flex items-center justify-center shadow-lg">
              <Sprout className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* 🌱 Divine Lost Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              🌾 Lost in the Agricultural Fields
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              This path has not been cultivated in our divine agricultural
              consciousness yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Let our farming wisdom guide you back to fertile digital ground.
            </p>
          </div>

          {/* 🔍 Seasonal Suggestions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-green-600" />
              Seasonal Agricultural Suggestions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {seasonalSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300"
                >
                  🌿 {suggestion}
                </div>
              ))}
            </div>
          </div>

          {/* 🚜 Agricultural Navigation */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              🚜 Agricultural Platform Navigation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {agriculturalSuggestions.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 🎯 Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Agricultural Home
            </Link>

            <button
              onClick={() => globalThis.window.history.back()}
              className="flex-1 border border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Previous Field
            </button>
          </div>

          {/* 🌟 Divine Agricultural Wisdom */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🌟 Agricultural Wisdom:
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              &quot;Not all who wander in the fields are lost. Sometimes the
              best discoveries happen when we stray from the beaten path and
              explore new agricultural territories.&quot;
            </p>
          </div>

          {/* 🔗 Quick Links Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Need help? Check our{" "}
              <Link
                href="/admin/help"
                className="text-green-600 hover:text-green-700 underline"
              >
                Agricultural Documentation
              </Link>{" "}
              or{" "}
              <Link
                href="/admin/contact"
                className="text-green-600 hover:text-green-700 underline"
              >
                Contact Divine Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
