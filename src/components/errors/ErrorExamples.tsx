/**
 * 🌟 Error Handling Examples - Divine Agricultural Error Patterns
 *
 * Comprehensive examples demonstrating all error handling components,
 * hooks, and recovery strategies with agricultural consciousness.
 *
 * @module components/errors/ErrorExamples
 */

"use client";

import {
  useErrorHandler,
  useValidationError
} from "@/hooks/use-error-handler";
import {
  useAgriculturalRecovery,
  useCircuitBreaker,
  useFallback,
  useRetry
} from "@/hooks/use-error-recovery";
import {
  ErrorCategory,
  NetworkError,
  PaymentError,
  SeasonalViolationError
} from "@/lib/errors/types";
import { logger } from '@/lib/monitoring/logger';
import { useState } from "react";
import {
  AgriculturalErrorBoundary,
  ErrorBoundary
} from "./error-boundary";
import {
  AgriculturalErrorDisplay,
  ErrorAlert,
  ErrorCard,
  InlineError
} from "./error-display";
import {
  ToastProvider,
  useAgriculturalToast,
  useErrorToast,
  useToast,
  useUndoToast
} from "./error-toast";

// ============================================================================
// EXAMPLE 1: ERROR BOUNDARY USAGE
// ============================================================================

/**
 * Example: Basic error boundary with fallback
 */
export function ErrorBoundaryExample() {
  const [shouldError, setShouldError] = useState(false);

  const ProblematicComponent = () => {
    if (shouldError) {
      throw new Error("Something went wrong in the component!");
    }
    return <div className="p-4 bg-green-50 rounded">✅ Component working fine</div>;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Boundary Example</h3>
      <button
        onClick={() => setShouldError(!shouldError)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {shouldError ? "Fix Component" : "Break Component"}
      </button>

      <ErrorBoundary
        fallback={(error, reset) => (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-900">Error caught by boundary!</p>
            <p className="text-sm text-red-700">{error.message}</p>
            <button
              onClick={() => {
                setShouldError(false);
                reset();
              }}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Reset
            </button>
          </div>
        )}
        onError={(error) => logger.info("Error boundary caught:", error)}
        maxRecoveryAttempts={3}
        autoRecover={false}
      >
        <ProblematicComponent />
      </ErrorBoundary>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: AGRICULTURAL ERROR BOUNDARY
// ============================================================================

/**
 * Example: Agricultural error boundary with seasonal context
 */
export function AgriculturalErrorBoundaryExample() {
  const [season] = useState("SPRING");
  const [shouldError, setShouldError] = useState(false);

  const FarmComponent = () => {
    if (shouldError) {
      throw new SeasonalViolationError({
        message: "Cannot harvest in spring",
        currentSeason: "SPRING",
        requiredSeason: "FALL",
        operation: "HARVEST",
      });
    }
    return (
      <div className="p-4 bg-green-50 rounded border border-green-200">
        <p className="font-semibold text-green-900">🌱 Spring Planting Active</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Agricultural Error Boundary</h3>
      <button
        onClick={() => setShouldError(!shouldError)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {shouldError ? "Fix Operation" : "Trigger Seasonal Error"}
      </button>

      <AgriculturalErrorBoundary season={season} farmId="farm_123">
        <FarmComponent />
      </AgriculturalErrorBoundary>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: ERROR DISPLAY COMPONENTS
// ============================================================================

/**
 * Example: Various error display components
 */
export function ErrorDisplayExample() {
  const [showAlert, setShowAlert] = useState(true);
  const [showCard, setShowCard] = useState(true);

  const networkError = new NetworkError({
    message: "Failed to fetch data from server",
    statusCode: 503,
    endpoint: "/api/products",
  });

  const paymentError = new PaymentError({
    message: "Your card was declined",
    paymentMethod: "card",
    declineCode: "insufficient_funds",
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Error Display Components</h3>

      {/* Error Alert */}
      {showAlert && (
        <div>
          <p className="text-sm font-medium mb-2">Error Alert:</p>
          <ErrorAlert
            error={networkError}
            onDismiss={() => setShowAlert(false)}
            onRetry={() => logger.info("Retrying...")}
          />
        </div>
      )}

      {/* Error Card */}
      {showCard && (
        <div>
          <p className="text-sm font-medium mb-2">Error Card:</p>
          <ErrorCard
            error={paymentError}
            showDetails={true}
            onDismiss={() => setShowCard(false)}
            onRetry={() => logger.info("Retrying payment...")}
            actions={[
              {
                label: "Update Card",
                action: () => logger.info("Updating card..."),
                type: "primary",
              },
              {
                label: "Use Different Method",
                action: () => logger.info("Selecting method..."),
                type: "secondary",
              },
            ]}
          />
        </div>
      )}

      {/* Inline Error */}
      <div>
        <p className="text-sm font-medium mb-2">Inline Error (for forms):</p>
        <InlineError message="Email address is required" />
      </div>

      {/* Agricultural Error Display */}
      <div>
        <p className="text-sm font-medium mb-2">Agricultural Error Display:</p>
        <AgriculturalErrorDisplay
          error={
            new SeasonalViolationError({
              message: "Planting not available",
              currentSeason: "WINTER",
              requiredSeason: "SPRING",
              operation: "PLANT_SEEDS",
            })
          }
          season="WINTER"
          onRetry={() => logger.info("Checking season...")}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: TOAST NOTIFICATIONS
// ============================================================================

/**
 * Example: Toast notification system
 */
export function ToastNotificationExample() {
  const toast = useToast();
  const errorToast = useErrorToast();
  const undoToast = useUndoToast();
  const agriToast = useAgriculturalToast("SPRING", "farm_123");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Toast Notifications</h3>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => toast.success("Success!", "Operation completed successfully")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Success Toast
        </button>

        <button
          onClick={() => toast.error("Error!", "Something went wrong")}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Error Toast
        </button>

        <button
          onClick={() =>
            toast.warning("Warning!", "This action cannot be undone", {
              duration: 7000,
            })
          }
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Warning Toast
        </button>

        <button
          onClick={() =>
            toast.info("Info", "New features available", {
              action: {
                label: "Learn More",
                onClick: () => logger.info("Learn more clicked"),
              },
            })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Info Toast with Action
        </button>

        <button
          onClick={() =>
            errorToast.showError(
              new NetworkError({
                message: "Connection failed",
                statusCode: 503,
                endpoint: "/api/data",
              }),
              () => logger.info("Retrying...")
            )
          }
          className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
        >
          Error with Retry
        </button>

        <button
          onClick={() =>
            undoToast.showUndo("Item deleted", () => logger.info("Undo clicked"))
          }
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Undo Toast
        </button>

        <button
          onClick={() =>
            agriToast.success("Harvest Complete!", "50 bushels of wheat harvested")
          }
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        >
          Agricultural Toast
        </button>

        <button
          onClick={() => toast.clearAll()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: ERROR HANDLER HOOK
// ============================================================================

/**
 * Example: Manual error handling hook
 */
export function ErrorHandlerExample() {
  const { error, hasError, handleError, clearError } = useErrorHandler({
    logErrors: true,
    onError: (err) => logger.info("Error handled:", err),
  });

  const simulateError = () => {
    try {
      throw new Error("Simulated error from user action");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Handler Hook</h3>

      <button
        onClick={simulateError}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Trigger Error
      </button>

      {hasError && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="font-semibold text-red-900">Error Caught:</p>
          <p className="text-sm text-red-700 mb-2">{error.message}</p>
          <button
            onClick={clearError}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Clear Error
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: VALIDATION ERROR HOOK
// ============================================================================

/**
 * Example: Form validation errors
 */
export function ValidationErrorExample() {
  const validation = useValidationError();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = () => {
    validation.clearAll();

    if (!formData.email) {
      validation.setError("email", "Email is required");
    } else if (!formData.email.includes("@")) {
      validation.setError("email", "Please enter a valid email");
    }

    if (!formData.password) {
      validation.setError("password", "Password is required");
    } else if (formData.password.length < 8) {
      validation.setError("password", "Password must be at least 8 characters");
    }

    if (!validation.hasAnyError) {
      logger.info("Form submitted", { dataformData: { data: formData } });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Validation Error Hook</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded ${validation.hasError("email") ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validation.hasError("email") && (
            <InlineError message={validation.getError("email")!} />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full px-3 py-2 border rounded ${validation.hasError("password") ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validation.hasError("password") && (
            <InlineError message={validation.getError("password")!} />
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: RETRY HOOK
// ============================================================================

/**
 * Example: Retry with exponential backoff
 */
export function RetryExample() {
  const [count, setCount] = useState(0);

  const retry = useRetry(
    async () => {
      setCount((c) => c + 1);
      if (count < 2) {
        throw new Error("Still failing...");
      }
      return "Success!";
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      onSuccess: () => logger.info("Retry succeeded!"),
      onFailure: (error) => logger.info("All retries failed:", error),
    }
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Retry Hook (Exponential Backoff)</h3>

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm mb-2">
          Attempts: {retry.attempt} / 3
        </p>
        <p className="text-sm mb-2">Count: {count}</p>
        <p className="text-sm">
          Status: {retry.isRetrying ? "Retrying..." : "Ready"}
        </p>
      </div>

      <button
        onClick={() => {
          setCount(0);
          retry.execute();
        }}
        disabled={retry.isRetrying}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {retry.isRetrying ? "Retrying..." : "Start Retry Test"}
      </button>

      {retry.error && (
        <ErrorAlert error={retry.error} onDismiss={retry.reset} />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: FALLBACK HOOK
// ============================================================================

/**
 * Example: Fallback data strategy
 */
export function FallbackExample() {
  const fallback = useFallback(
    async () => {
      // Simulate API call that might fail
      if (Math.random() > 0.5) {
        throw new Error("API call failed");
      }
      return ["Fresh Data 1", "Fresh Data 2", "Fresh Data 3"];
    },
    {
      fallback: ["Cached Data 1", "Cached Data 2"],
      cacheDuration: 5 * 60 * 1000,
      enableCache: true,
      onFallback: (error) => logger.info("Using fallback:", error),
    }
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Fallback Strategy Hook</h3>

      <button
        onClick={() => fallback.execute()}
        disabled={fallback.isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {fallback.isLoading ? "Loading..." : "Fetch Data"}
      </button>

      {fallback.isFallback && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ Using cached/fallback data
          </p>
        </div>
      )}

      {fallback.data && (
        <div className="p-4 bg-gray-50 rounded">
          <p className="font-medium mb-2">Data:</p>
          <ul className="list-disc list-inside text-sm">
            {fallback.data.map((item: any, i: any) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: CIRCUIT BREAKER
// ============================================================================

/**
 * Example: Circuit breaker pattern
 */
export function CircuitBreakerExample() {
  const [failureRate, setFailureRate] = useState(0.3);

  const circuit = useCircuitBreaker(
    async () => {
      if (Math.random() < failureRate) {
        throw new Error("Service failure");
      }
      return "Success!";
    },
    {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 10000,
      onOpen: () => logger.info("Circuit opened!"),
      onClose: () => logger.info("Circuit closed!"),
    }
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Circuit Breaker Pattern</h3>

      <div className="p-4 bg-gray-50 rounded space-y-2">
        <p className="text-sm">
          Circuit State: <span className="font-bold">{circuit.state}</span>
        </p>
        <p className="text-sm">Failures: {circuit.failures}</p>
        <p className="text-sm">Successes: {circuit.successes}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Failure Rate: {(failureRate * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={failureRate * 100}
          onChange={(e) => setFailureRate(Number(e.target.value) / 100)}
          className="w-full"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => circuit.execute()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Call Service
        </button>
        <button
          onClick={() => circuit.reset()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset Circuit
        </button>
      </div>

      {circuit.isOpen && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800 font-semibold">
            ⚠️ Circuit is OPEN - Service temporarily unavailable
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 10: AGRICULTURAL RECOVERY
// ============================================================================

/**
 * Example: Agricultural error recovery with consciousness
 */
export function AgriculturalRecoveryExample() {
  const [season, setSeason] = useState<"SPRING" | "SUMMER" | "FALL" | "WINTER">("SPRING");

  const recovery = useAgriculturalRecovery(
    async () => {
      if (season === "WINTER") {
        throw new SeasonalViolationError({
          message: "Cannot plant in winter",
          currentSeason: "WINTER",
          requiredSeason: "SPRING",
          operation: "PLANT_SEEDS",
        });
      }
      return { planted: true, season };
    },
    {
      season,
      farmId: "farm_123",
      fallback: { planted: false, season: "UNKNOWN" },
      maxAttempts: 2,
      isSeasonalError: (error) => error.category === ErrorCategory.SEASONAL,
    }
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Agricultural Recovery (Divine Pattern)</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Season:</label>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="SPRING">🌱 Spring</option>
          <option value="SUMMER">☀️ Summer</option>
          <option value="FALL">🍂 Fall</option>
          <option value="WINTER">❄️ Winter</option>
        </select>
      </div>

      <div className="p-4 bg-green-50 rounded border border-green-200">
        <p className="text-sm">
          <span className="font-medium">🌾 Agricultural Context:</span>
        </p>
        <p className="text-sm">Season: {recovery.agriculturalContext.season}</p>
        <p className="text-sm">
          Consciousness: {recovery.agriculturalContext.consciousness}
        </p>
      </div>

      <button
        onClick={() => recovery.execute()}
        disabled={recovery.isRetrying}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {recovery.isRetrying ? "Processing..." : "Plant Seeds"}
      </button>

      {recovery.isFallback && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ Using fallback due to seasonal restrictions
          </p>
        </div>
      )}

      {recovery.error && <ErrorAlert error={recovery.error} />}
    </div>
  );
}

// ============================================================================
// MASTER EXAMPLE CONTAINER
// ============================================================================

/**
 * Master container with all examples
 */
export function ErrorHandlingExamples() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            🌟 Error Handling Framework Examples
          </h1>
          <p className="text-gray-600">
            Comprehensive demonstration of all error handling components and patterns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <ErrorBoundaryExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <AgriculturalErrorBoundaryExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow col-span-full">
            <ErrorDisplayExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <ToastNotificationExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <ErrorHandlerExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <ValidationErrorExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <RetryExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <FallbackExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <CircuitBreakerExample />
          </div>

          <div className="p-6 bg-white rounded-lg shadow col-span-full">
            <AgriculturalRecoveryExample />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorHandlingExamples;
