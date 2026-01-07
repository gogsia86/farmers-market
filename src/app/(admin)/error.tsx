"use client";

/**
 * 👨‍💼 ADMIN ROUTES ERROR BOUNDARY
 *
 * Catches errors in admin-facing routes
 * Provides administrative-specific error recovery
 */

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/monitoring/logger";
import { AlertTriangle, Home, RefreshCcw, Shield } from "lucide-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error("Admin route error", { error: error.message,
      digest: error.digest,
      stack: error.stack,
      context: "admin-routes",
      severity: "HIGH",
    });
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-xl w-full bg-card border border-border rounded-xl shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 blur-lg rounded-full animate-pulse" />
            <div className="relative bg-destructive/10 p-3 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            👨‍💼 Admin Dashboard Issue
          </h2>
          <p className="text-muted-foreground mb-2">
            We encountered an issue with the admin dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            This error has been logged and the development team has been notified.
          </p>
        </div>

        {/* Developer Details */}
        {isDevelopment && (
          <div className="mb-6">
            <details className="bg-muted p-3 rounded-lg border border-border text-sm">
              <summary className="cursor-pointer font-semibold text-foreground hover:text-primary">
                🔍 Error Details (Dev Only)
              </summary>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="font-semibold">Message:</span>
                  <pre className="mt-1 bg-background p-2 rounded text-xs overflow-x-auto">
                    {error.message}
                  </pre>
                </div>
                {error.digest && (
                  <div>
                    <span className="font-semibold">Digest:</span>
                    <code className="block mt-1 text-xs text-muted-foreground">
                      {error.digest}
                    </code>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <span className="font-semibold">Stack:</span>
                    <pre className="mt-1 bg-background p-2 rounded text-xs overflow-x-auto max-h-48">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Recovery Actions */}
        <div className="space-y-3">
          <Button
            onClick={reset}
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-5 w-5" />
            Try Again
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => (window.location.href = "/admin/dashboard")}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Dashboard
            </Button>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Need technical assistance?{" "}
            <a
              href="/admin/support"
              className="text-primary hover:underline font-medium"
            >
              Admin Support
            </a>
            {error.digest && (
              <>
                {" • "}
                Error ID: <code className="bg-muted px-1 rounded">{error.digest}</code>
              </>
            )}
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
            🔒 This is a secure admin area. All actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
