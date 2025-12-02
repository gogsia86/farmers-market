/**
 * ONBOARDING TOUR SYSTEM
 * Guided tours for new users across different pages
 *
 * Features:
 * - Multi-step tours for different pages
 * - Local storage persistence
 * - Spotlight highlighting
 * - Smooth animations
 * - Skip/complete functionality
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// TYPES
// ============================================

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Tour {
  id: string;
  path: string;
  steps: TourStep[];
  startDelay?: number; // Delay before showing tour (ms)
}

// ============================================
// TOUR DEFINITIONS
// ============================================

const TOURS: Tour[] = [
  // Homepage Tour
  {
    id: "homepage-tour",
    path: "/",
    startDelay: 1000,
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "🌾 Welcome to Farmers Market!",
        content:
          "Discover fresh, local produce directly from verified farms. Let's take a quick tour!",
        position: "center",
      },
      {
        id: "search",
        target: "#search-bar",
        title: "🔍 Find Fresh Produce",
        content:
          "Search for products, farms, or locations. We'll show you the best matches nearby.",
        position: "bottom",
      },
      {
        id: "featured-farms",
        target: "#featured-farms",
        title: "🌾 Meet Local Farmers",
        content:
          "Browse verified farms in your area. Each farm is carefully vetted for quality and sustainability.",
        position: "top",
      },
      {
        id: "categories",
        target: "#categories",
        title: "🥬 Browse by Category",
        content:
          "Explore products by category - from fresh vegetables to dairy, honey, and more!",
        position: "top",
      },
      {
        id: "complete",
        target: "body",
        title: "✅ You're All Set!",
        content:
          "Start exploring fresh local produce. You can always access help from the menu.",
        position: "center",
      },
    ],
  },

  // Farmer Dashboard Tour
  {
    id: "farmer-dashboard-tour",
    path: "/farmer/dashboard",
    startDelay: 500,
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "🌾 Welcome to Your Farm Dashboard!",
        content:
          "Manage your farm, products, orders, and analytics all in one place.",
        position: "center",
      },
      {
        id: "add-product",
        target: "#add-product-button",
        title: "📦 Add Your Products",
        content:
          "List your fresh produce with photos, prices, and inventory. Make it easy for customers to find you!",
        position: "bottom",
      },
      {
        id: "orders",
        target: "#orders-section",
        title: "📋 Manage Orders",
        content:
          "View and fulfill customer orders. Update status and communicate with buyers seamlessly.",
        position: "left",
      },
      {
        id: "analytics",
        target: "#analytics-section",
        title: "📊 Track Performance",
        content:
          "Monitor sales, views, and revenue. Get insights to grow your farm business.",
        position: "left",
      },
      {
        id: "profile",
        target: "#farm-profile-link",
        title: "✏️ Complete Your Profile",
        content:
          "Add photos, certifications, and your story. A complete profile builds trust with customers.",
        position: "bottom",
      },
    ],
  },

  // Products Page Tour
  {
    id: "products-tour",
    path: "/products",
    startDelay: 1000,
    steps: [
      {
        id: "filters",
        target: "#product-filters",
        title: "🎯 Filter Your Search",
        content:
          "Narrow down products by category, price, organic certification, and distance.",
        position: "right",
      },
      {
        id: "sort",
        target: "#sort-dropdown",
        title: "🔄 Sort Results",
        content:
          "Sort by relevance, price, distance, or newest arrivals to find exactly what you need.",
        position: "bottom",
      },
      {
        id: "product-card",
        target: ".product-card:first-child",
        title: "🛒 Product Details",
        content:
          "Click any product to see full details, farm information, reviews, and add to cart.",
        position: "left",
      },
    ],
  },

  // Checkout Tour
  {
    id: "checkout-tour",
    path: "/checkout",
    startDelay: 500,
    steps: [
      {
        id: "delivery",
        target: "#delivery-options",
        title: "🚚 Choose Delivery",
        content:
          "Select home delivery or farm pickup. Delivery options and fees vary by farm.",
        position: "right",
      },
      {
        id: "payment",
        target: "#payment-section",
        title: "💳 Secure Payment",
        content:
          "We use Stripe for secure payments. Your information is encrypted and safe.",
        position: "right",
      },
      {
        id: "review",
        target: "#order-review",
        title: "✅ Review Your Order",
        content:
          "Double-check items, delivery details, and total before completing your order.",
        position: "left",
      },
    ],
  },

  // Customer Account Tour
  {
    id: "customer-account-tour",
    path: "/account",
    startDelay: 1000,
    steps: [
      {
        id: "orders",
        target: "#order-history",
        title: "📦 Your Orders",
        content:
          "Track current orders and view past purchases. Reorder your favorites with one click!",
        position: "right",
      },
      {
        id: "favorites",
        target: "#favorites-section",
        title: "❤️ Saved Favorites",
        content:
          "Save your favorite farms and products for quick access later.",
        position: "right",
      },
      {
        id: "addresses",
        target: "#addresses-section",
        title: "📍 Delivery Addresses",
        content:
          "Manage multiple delivery addresses for home, work, or gift deliveries.",
        position: "right",
      },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function OnboardingTour() {
  const pathname = usePathname();
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Check if tour should be shown
  useEffect(() => {
    const tour = TOURS.find((t) => t.path === pathname);
    if (!tour) {
      setIsVisible(false);
      setActiveTour(null);
      return;
    }

    const hasSeenTour = localStorage.getItem(`tour-completed-${tour.id}`);
    if (hasSeenTour) {
      return;
    }

    // Delay before showing tour
    const timer = setTimeout(() => {
      setActiveTour(tour);
      setCurrentStepIndex(0);
      setIsVisible(true);
    }, tour.startDelay || 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Update target element and position when step changes
  useEffect(() => {
    if (!activeTour || !isVisible) return;

    const currentStep = activeTour.steps[currentStepIndex];
    if (!currentStep) return;

    // Find target element
    if (currentStep.target === "body") {
      setTargetElement(null);
      setTooltipPosition({ top: 0, left: 0 });
      return;
    }

    const element = document.querySelector(currentStep.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      calculateTooltipPosition(element, currentStep.position);

      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeTour, currentStepIndex, isVisible]);

  // Calculate tooltip position based on target element
  const calculateTooltipPosition = useCallback(
    (element: HTMLElement, position: string) => {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      const offset = 20;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = rect.top - tooltipHeight - offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + offset;
          break;
        case "center":
          top = window.innerHeight / 2 - tooltipHeight / 2;
          left = window.innerWidth / 2 - tooltipWidth / 2;
          break;
      }

      // Keep tooltip within viewport
      top = Math.max(
        20,
        Math.min(top, window.innerHeight - tooltipHeight - 20),
      );
      left = Math.max(
        20,
        Math.min(left, window.innerWidth - tooltipWidth - 20),
      );

      setTooltipPosition({ top, left });
    },
    [],
  );

  // Handlers
  const handleNext = useCallback(() => {
    if (!activeTour) return;

    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  }, [activeTour, currentStepIndex]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    if (!activeTour) return;
    localStorage.setItem(`tour-completed-${activeTour.id}`, "true");
    setIsVisible(false);
    setActiveTour(null);
  }, [activeTour]);

  const handleComplete = useCallback(() => {
    if (!activeTour) return;
    localStorage.setItem(`tour-completed-${activeTour.id}`, "true");
    setIsVisible(false);
    setActiveTour(null);
  }, [activeTour]);

  if (!isVisible || !activeTour) return null;

  const currentStep = activeTour.steps[currentStepIndex];
  if (!currentStep) return null;

  const isLastStep = currentStepIndex === activeTour.steps.length - 1;
  const isCenterPosition = currentStep.position === "center";

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Spotlight on target element */}
          {targetElement && !isCenterPosition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: targetElement.getBoundingClientRect().top - 8,
                left: targetElement.getBoundingClientRect().left - 8,
                width: targetElement.getBoundingClientRect().width + 16,
                height: targetElement.getBoundingClientRect().height + 16,
                boxShadow:
                  "0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-[10000] bg-white rounded-xl shadow-2xl max-w-md"
            style={{
              top: isCenterPosition ? "50%" : tooltipPosition.top,
              left: isCenterPosition ? "50%" : tooltipPosition.left,
              transform: isCenterPosition ? "translate(-50%, -50%)" : undefined,
            }}
          >
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close tour"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="pr-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentStep.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentStep.content}
                </p>

                {/* Optional Action Button */}
                {currentStep.action && (
                  <button
                    onClick={currentStep.action.onClick}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
                  >
                    {currentStep.action.label}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                {/* Progress */}
                <div className="flex items-center gap-2">
                  {activeTour.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStepIndex
                          ? "w-8 bg-green-600"
                          : index < currentStepIndex
                            ? "w-2 bg-green-600"
                            : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  {isLastStep ? (
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Got it!
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Step Counter */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  Step {currentStepIndex + 1} of {activeTour.steps.length}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// HELPER: Reset Tours (for testing)
// ============================================

export function resetAllTours() {
  TOURS.forEach((tour) => {
    localStorage.removeItem(`tour-completed-${tour.id}`);
  });
}

// ============================================
// HELPER: Start Specific Tour
// ============================================

export function startTour(tourId: string) {
  localStorage.removeItem(`tour-completed-${tourId}`);
  window.location.reload();
}
