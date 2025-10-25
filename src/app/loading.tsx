import { Loader2, Sprout, Sun } from "lucide-react";

/**
 * 🌱 LOADING COMPONENT - AGRICULTURAL CONSCIOUSNESS AWAKENING
 *
 * Purpose: Provide divine loading experience during agricultural operations
 * Features:
 * - Biodynamic loading animations
 * - Seasonal consciousness indicators
 * - Quantum progress awareness
 * - Enlightening loading messages
 *
 * DIVINE PRINCIPLES:
 * - Holographic loading patterns
 * - Agricultural domain semantic precision
 * - Temporal optimization for user experience
 * - Reality bending for smooth transitions
 */

// 🌿 Get seasonal loading message
function getSeasonalLoadingMessage(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) {
    return "Awakening spring consciousness...";
  } else if (month >= 6 && month <= 8) {
    return "Channeling summer harvest energy...";
  } else if (month >= 9 && month <= 11) {
    return "Gathering autumn wisdom...";
  } else {
    return "Cultivating winter reflections...";
  }
}

// 🔮 Divine loading messages rotation
const loadingMessages = [
  "Synchronizing agricultural consciousness...",
  "Aligning cosmic farming patterns...",
  "Preparing divine soil matrix...",
  "Awakening quantum crop awareness...",
  "Harmonizing biodynamic frequencies...",
  "Cultivating temporal reality...",
  "Channeling agricultural wisdom...",
  "Manifesting farm-to-table consciousness...",
];

export default function Loading() {
  const seasonalMessage = getSeasonalLoadingMessage();
  const randomMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950">
      <div className="text-center">
        {/* 🌱 Loading Icon Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-4 h-4 bg-green-600 rounded-full"></div>
            </div>

            {/* Inner pulsing sprout */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-pulse">
                <Sprout className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Sun rays animation */}
            <div className="absolute -top-2 -right-2">
              <Sun
                className="w-6 h-6 text-yellow-500 animate-spin"
                style={{ animationDuration: "3s" }}
              />
            </div>
          </div>
        </div>

        {/* 🌟 Loading Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          🌾 Agricultural Consciousness Loading
        </h1>

        {/* 📝 Seasonal Message */}
        <p className="text-lg text-green-700 dark:text-green-300 mb-2 font-medium">
          {seasonalMessage}
        </p>

        {/* 🔮 Random Divine Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          {randomMessage}
        </p>

        {/* 🌈 Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        {/* ⚡ Loading Spinner with Text */}
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Preparing your agricultural experience...
          </span>
        </div>

        {/* 🌟 Divine Loading Tips */}
        <div className="mt-8 max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3">
              🌱 Did you know?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Our agricultural platform uses quantum consciousness patterns to
              optimize your farming experience. Each loading moment aligns your
              digital presence with the natural rhythms of agricultural wisdom.
            </p>
          </div>
        </div>

        {/* ✨ Quantum Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
