// 🧠 DIVINE PATTERN: PWA Registration & Installation
// 📚 Reference: 03_PERFORMANCE_REALITY_BENDING.instructions.md
// 🌾 Domain: Progressive Web App Agricultural Consciousness
// ⚡ Performance: Offline-First Architecture

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

/**
 * PWA Install Prompt Component
 * Handles service worker registration and install prompt
 */
export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true);
                  console.log("[PWA] New version available");
                }
              });
            }
          });

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      console.log("[PWA] App is running in standalone mode");
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);

      // Show install banner if not dismissed recently
      const lastDismissed = localStorage.getItem("pwa-install-dismissed");
      const now = Date.now();
      if (
        !lastDismissed ||
        now - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000
      ) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      console.log("[PWA] App installed successfully");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    console.log("[PWA] User choice:", outcome);

    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }

    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleUpdate = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      });
    }
  };

  // Don't show banner if already installed or no prompt available
  if (isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <>
      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold mb-1">Update Available</p>
              <p className="text-sm text-blue-100">
                A new version of the app is ready
              </p>
            </div>
            <button
              onClick={handleUpdate}
              className="ml-3 px-3 py-1.5 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white rounded-lg shadow-lg border border-agricultural-200 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-agricultural-400 hover:text-agricultural-600"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-agricultural-100 flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-agricultural-900">
              Install Farmers Market
            </h3>
            <p className="mt-1 text-xs text-agricultural-600">
              Add to your home screen for quick access and offline support
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-agricultural-600 text-white rounded-md text-xs font-medium hover:bg-agricultural-500"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-agricultural-100 text-agricultural-700 rounded-md text-xs font-medium hover:bg-agricultural-200"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook to check if app is installed
 */
export function useIsInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  return isInstalled;
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
