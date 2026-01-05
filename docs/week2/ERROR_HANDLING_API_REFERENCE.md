# 🌟 Error Handling Framework - Quick API Reference

**Version**: 1.0.0
**Last Updated**: November 15, 2025

---

## 📚 Table of Contents

1. [Error Types](#error-types)
2. [Error Handlers](#error-handlers)
3. [Error Logger](#error-logger)
4. [Error Boundaries](#error-boundaries)
5. [Error Display Components](#error-display-components)
6. [Toast System](#toast-system)
7. [Error Hooks](#error-hooks)
8. [Recovery Strategies](#recovery-strategies)
9. [Quick Examples](#quick-examples)

---

## Error Types

### Import
```typescript
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DatabaseError,
  ApiError,
  PaymentError,
  InventoryError,
  SeasonalViolationError,
  BiodynamicError,
  QuantumCoherenceError,
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  toAppError,
  isAppError
} from "@/lib/errors/types";
```

### Base Error: `AppError`
```typescript
const error = new AppError({
  message: string,
  code: string,
  severity: ErrorSeverity,
  category: ErrorCategory,
  userDetails: {
    title: string,
    message: string,
    suggestions?: string[],
    actions?: RecoveryAction[]
  },
  recoveryStrategy?: RecoveryStrategy,
  retryable?: boolean,
  metadata?: Partial<ErrorMetadata>
});
```

### Specific Errors

#### `ValidationError`
```typescript
new ValidationError({
  message: "Validation failed",
  field?: string,
  validationErrors: [
    { field: "email", message: "Invalid email", code: "INVALID_EMAIL" }
  ]
});
```

#### `NetworkError`
```typescript
new NetworkError({
  message: "Connection failed",
  statusCode?: number,
  endpoint?: string
});
```

#### `PaymentError`
```typescript
new PaymentError({
  message: "Payment failed",
  paymentMethod?: string,
  declineCode?: string
});
```

#### `SeasonalViolationError` (Divine)
```typescript
new SeasonalViolationError({
  message: "Cannot plant in winter",
  currentSeason: "WINTER",
  requiredSeason: "SPRING",
  operation: "PLANT_SEEDS"
});
```

### Type Guards
```typescript
if (isAppError(error)) { /* AppError */ }
if (isValidationError(error)) { /* ValidationError */ }
if (isNetworkError(error)) { /* NetworkError */ }
```

### Helper Functions
```typescript
const appError = toAppError(error); // Convert any error to AppError
const message = getErrorMessage(error); // Extract message safely
```

---

## Error Handlers

### Import
```typescript
import {
  toApiErrorResponse,
  toErrorResponse,
  withRetry,
  handleFetchError,
  handlePrismaError,
  handleStripeError,
  handleZodError,
  safeExecute
} from "@/lib/errors/handlers";
```

### Transform to API Response
```typescript
const apiResponse = toApiErrorResponse(error);
const nextResponse = toErrorResponse(error, 500);
```

### Retry with Backoff
```typescript
const result = await withRetry(
  async () => await operation(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error) => error.retryable
  }
);
```

### Fetch with Error Handling
```typescript
const data = await fetchWithErrorHandling<Product[]>(
  "/api/products",
  { method: "GET" }
);
```

### Handle Specific Errors
```typescript
// Prisma
try {
  await database.farm.create({ data });
} catch (error) {
  handlePrismaError(error, "createFarm");
}

// Stripe
try {
  await stripe.paymentIntents.create({ ... });
} catch (error) {
  handleStripeError(error);
}

// Zod
try {
  schema.parse(data);
} catch (error) {
  handleZodError(error);
}
```

### Safe Execution
```typescript
const result = await safeExecute(
  async () => await riskyOperation(),
  fallbackValue,
  (error) => console.error(error)
);
```

---

## Error Logger

### Import
```typescript
import { logger, logError, configureLogger } from "@/lib/errors/logger";
```

### Configure
```typescript
configureLogger({
  serviceName: "farmers-market-platform",
  environment: process.env.NODE_ENV,
  enableConsole: true,
  enableTracing: true,
  minSeverity: ErrorSeverity.INFO,
  externalEndpoint: process.env.ERROR_LOGGING_ENDPOINT
});
```

### Basic Logging
```typescript
logger.error(error, { context: "checkout" });
logger.errorWithContext(error, { userId: "123" });
```

### With OpenTelemetry Span
```typescript
logger.errorInSpan(error, span, { operation: "payment" });
```

### Divine Logging
```typescript
logger.divineError(error, {
  season: "SPRING",
  farmId: "farm_123",
  consciousness: "DIVINE"
});
```

### Error Aggregation
```typescript
logger.enableAggregation(100, 30000); // maxSize, flushInterval
logger.aggregateError(error);
logger.flushAggregated();
```

### Error Metrics
```typescript
const rate = logger.getErrorRate(); // Errors per minute
const breakdown = logger.getErrorBreakdown(); // By error code
```

---

## Error Boundaries

### Import
```typescript
import {
  ErrorBoundary,
  AgriculturalErrorBoundary,
  RouteErrorBoundary,
  AsyncBoundary
} from "@/components/errors/error-boundary";
```

### Basic Error Boundary
```typescript
<ErrorBoundary
  fallback={(error, reset) => <CustomError error={error} onReset={reset} />}
  onError={(error) => logError(error)}
  onReset={() => console.log("Reset")}
  maxRecoveryAttempts={3}
  recoveryCooldown={5000}
  autoRecover={true}
  recoveryDelay={3000}
>
  <App />
</ErrorBoundary>
```

### Agricultural Error Boundary
```typescript
<AgriculturalErrorBoundary
  season="SPRING"
  farmId="farm_123"
>
  <FarmManagement />
</AgriculturalErrorBoundary>
```

### Route Error Boundary
```typescript
<RouteErrorBoundary route="/checkout" showBreadcrumb={true}>
  <CheckoutPage />
</RouteErrorBoundary>
```

### Async Boundary (Suspense + Error)
```typescript
<AsyncBoundary loading={<Spinner />}>
  <AsyncComponent />
</AsyncBoundary>
```

---

## Error Display Components

### Import
```typescript
import {
  ErrorAlert,
  ErrorCard,
  InlineError,
  ErrorPage,
  AgriculturalErrorDisplay
} from "@/components/errors/error-display";
```

### Error Alert
```typescript
<ErrorAlert
  error={error}
  severity="ERROR"
  size="md"
  onDismiss={() => {}}
  onRetry={() => {}}
  dismissible={true}
  showIcon={true}
/>
```

### Error Card
```typescript
<ErrorCard
  error={error}
  onRetry={() => {}}
  onDismiss={() => {}}
  showDetails={true}
  actions={[
    { label: "Retry", action: retry, type: "primary" },
    { label: "Cancel", action: cancel, type: "secondary" }
  ]}
/>
```

### Inline Error (Forms)
```typescript
<InlineError message="Email is required" icon={true} />
```

### Error Page
```typescript
<ErrorPage
  error={error}
  onRetry={() => {}}
  onHome={() => router.push("/")}
  showSupport={true}
/>
```

### Agricultural Error Display
```typescript
<AgriculturalErrorDisplay
  error={error}
  season="SPRING"
  onRetry={() => {}}
/>
```

---

## Toast System

### Import
```typescript
import {
  ToastProvider,
  useToast,
  useErrorToast,
  useAgriculturalToast,
  useUndoToast
} from "@/components/errors/error-toast";
```

### Provider Setup
```typescript
<ToastProvider
  position="top-right" // top-left, top-center, top-right, bottom-*
  maxToasts={5}
  defaultDuration={5000}
>
  {children}
</ToastProvider>
```

### Basic Toast
```typescript
const toast = useToast();

toast.success("Success!", "Operation completed");
toast.error("Error!", "Something went wrong");
toast.warning("Warning!", "This action cannot be undone");
toast.info("Info", "New features available");

toast.clearAll();
```

### Toast with Actions
```typescript
toast.error("Error!", "Failed to save", {
  duration: 7000,
  action: {
    label: "Retry",
    onClick: () => retry()
  }
});
```

### Error Toast with AppError
```typescript
toast.errorFromAppError(appError, {
  action: { label: "Retry", onClick: retry }
});
```

### Error Toast Hook
```typescript
const errorToast = useErrorToast();

errorToast.showError(error, () => retry());
errorToast.success("Success!", "Saved");
```

### Agricultural Toast
```typescript
const agriToast = useAgriculturalToast("SPRING", "farm_123");

agriToast.success("Harvest!", "50 bushels collected");
agriToast.error("Drought!", "Water levels critical");
```

### Undo Toast
```typescript
const undoToast = useUndoToast();

undoToast.showUndo("Item deleted", () => restoreItem());
```

---

## Error Hooks

### Import
```typescript
import {
  useErrorHandler,
  useAsyncError,
  useErrorBoundary,
  useErrorState,
  useValidationError,
  useAgriculturalError
} from "@/hooks/use-error-handler";
```

### Error Handler Hook
```typescript
const { error, hasError, handleError, clearError, reset } = useErrorHandler({
  logErrors: true,
  onError: (error) => console.error(error),
  throwToBoundary: false
});

try {
  await operation();
} catch (err) {
  handleError(err);
}
```

### Async Error Hook
```typescript
const throwError = useAsyncError();

const handleClick = async () => {
  try {
    await fetchData();
  } catch (error) {
    throwError(error); // Caught by error boundary
  }
};
```

### Error Boundary Hook
```typescript
const { showBoundary, resetBoundary } = useErrorBoundary();

showBoundary(error); // Show error boundary
resetBoundary(); // Reset and retry
```

### Error State Hook
```typescript
const {
  error,
  isError,
  errorCount,
  lastError,
  setError,
  clearError,
  reset,
  isErrorType,
  isRetryable
} = useErrorState();

setError(error);
if (isRetryable) { /* retry */ }
```

### Validation Error Hook
```typescript
const validation = useValidationError();

validation.setError("email", "Email is required");
validation.hasError("email"); // true
validation.getError("email"); // "Email is required"
validation.clearError("email");
validation.clearAll();
validation.setErrors({ email: "...", password: "..." });
```

### Agricultural Error Hook
```typescript
const { error, handleError, agriculturalContext } = useAgriculturalError({
  season: "SPRING",
  farmId: "farm_123",
  logWithContext: true
});

try {
  await plantSeeds();
} catch (err) {
  handleError(err); // Logged with agricultural context
}
```

---

## Recovery Strategies

### Import
```typescript
import {
  useRetry,
  useFallback,
  useCircuitBreaker,
  useGracefulDegradation,
  useAgriculturalRecovery
} from "@/hooks/use-error-recovery";
```

### Retry Hook
```typescript
const retry = useRetry(
  async () => await fetchData(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    resetOnSuccess: true,
    onSuccess: () => console.log("Success!"),
    onFailure: (error) => console.log("Failed:", error)
  }
);

await retry.execute();
// retry.attempt, retry.isRetrying, retry.error, retry.canRetry
```

### Fallback Hook
```typescript
const fallback = useFallback(
  async () => await fetchProducts(),
  {
    fallback: [],
    cacheDuration: 5 * 60 * 1000,
    enableCache: true,
    onFallback: (error) => console.warn("Using fallback")
  }
);

await fallback.execute();
// fallback.data, fallback.isFallback, fallback.isLoading
```

### Circuit Breaker Hook
```typescript
const circuit = useCircuitBreaker(
  async () => await callAPI(),
  {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    onOpen: () => console.warn("Circuit opened!"),
    onClose: () => console.log("Circuit closed!")
  }
);

await circuit.execute();
// circuit.state, circuit.failures, circuit.successes, circuit.isOpen
```

### Graceful Degradation Hook
```typescript
const { execute, level, isDegraded } = useGracefulDegradation({
  levels: [
    async () => await fetchFromAPI(),
    async () => await fetchFromCache(),
    async () => await fetchFromLocal(),
    async () => defaultData
  ],
  onDegrade: (level) => console.warn(`Degraded to level ${level}`)
});

await execute();
```

### Agricultural Recovery Hook
```typescript
const recovery = useAgriculturalRecovery(
  async () => await plantSeeds(),
  {
    season: "SPRING",
    farmId: "farm_123",
    fallback: { planted: false },
    maxAttempts: 3,
    isSeasonalError: (error) => error.category === ErrorCategory.SEASONAL
  }
);

await recovery.execute();
// recovery.isFallback, recovery.agriculturalContext
```

---

## Quick Examples

### API Route Error Handling
```typescript
// app/api/farms/route.ts
import { toErrorResponse } from "@/lib/errors/handlers";
import { logError } from "@/lib/errors/logger";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const farm = await farmService.create(data);
    return NextResponse.json({ success: true, data: farm });
  } catch (error) {
    logError(error);
    return toErrorResponse(error);
  }
}
```

### Service Layer Error Handling
```typescript
// lib/services/farm.service.ts
import { handlePrismaError } from "@/lib/errors/handlers";

export class FarmService {
  async create(data: CreateFarmRequest): Promise<Farm> {
    try {
      return await database.farm.create({ data });
    } catch (error) {
      handlePrismaError(error, "createFarm");
    }
  }
}
```

### Component Error Handling
```typescript
// components/features/farm-form.tsx
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useToast } from "@/components/errors/error-toast";

export function FarmForm() {
  const { error, handleError, clearError } = useErrorHandler();
  const toast = useToast();

  const handleSubmit = async (data: FormData) => {
    try {
      await createFarm(data);
      toast.success("Success!", "Farm created");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert error={error} onDismiss={clearError} />}
      {/* form fields */}
    </form>
  );
}
```

### Retry with Toast
```typescript
const retry = useRetry(async () => await fetchData());
const toast = useToast();

const handleFetch = async () => {
  const result = await retry.execute();
  if (result) {
    toast.success("Success!", "Data loaded");
  } else {
    toast.error("Failed", "Could not load data after 3 attempts");
  }
};
```

### Form Validation
```typescript
const validation = useValidationError();

const handleSubmit = () => {
  validation.clearAll();

  if (!email) validation.setError("email", "Email is required");
  if (!password) validation.setError("password", "Password is required");

  if (validation.hasAnyError) return;

  // Submit form
};

return (
  <input
    {...props}
    className={validation.hasError("email") ? "error" : ""}
  />
  {validation.hasError("email") && (
    <InlineError message={validation.getError("email")!} />
  )}
);
```

### Agricultural Error with Toast
```typescript
const agriToast = useAgriculturalToast("SPRING", "farm_123");

try {
  await plantSeeds();
  agriToast.success("Planted!", "Seeds planted successfully");
} catch (error) {
  if (error instanceof SeasonalViolationError) {
    agriToast.warning("Seasonal Restriction", error.userDetails.message);
  } else {
    agriToast.error("Planting Failed", error.message);
  }
}
```

---

## Environment Variables

```env
# Error logging configuration
ERROR_LOGGING_ENDPOINT=https://your-logging-service.com/api/errors
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector.com
NODE_ENV=production
```

---

## Best Practices

1. **Always log errors**: Use `logger.error()` for all caught errors
2. **Use type guards**: Check error types with `isAppError()`, etc.
3. **Provide user details**: Include title, message, and suggestions
4. **Set recovery strategies**: Specify `retryable` and `recoveryStrategy`
5. **Handle at boundaries**: Use error boundaries for component errors
6. **Toast for non-blocking**: Use toasts for errors that don't block the UI
7. **Retry intelligently**: Don't retry validation or auth errors
8. **Cache when possible**: Use fallback with cache for resilience
9. **Track metrics**: Enable error aggregation and monitoring
10. **Test recovery**: Verify all recovery paths work

---

## Common Patterns

### Pattern 1: Try-Catch with Toast
```typescript
const toast = useToast();
try {
  await operation();
  toast.success("Success!", "Operation completed");
} catch (error) {
  toast.errorFromAppError(toAppError(error));
}
```

### Pattern 2: Retry with Fallback
```typescript
const retry = useRetry(async () => await fetchFromAPI());
const result = await retry.execute() || fallbackData;
```

### Pattern 3: Form with Validation
```typescript
const validation = useValidationError();
const toast = useToast();

const handleSubmit = async () => {
  validation.clearAll();
  // Validate fields...
  if (validation.hasAnyError) return;

  try {
    await submit();
    toast.success("Saved!", "Form submitted");
  } catch (error) {
    toast.error("Error", "Failed to save");
  }
};
```

### Pattern 4: Agricultural Error Handling
```typescript
const agriError = useAgriculturalError({ season: "SPRING" });
try {
  await farmOperation();
} catch (err) {
  agriError.handleError(err); // Logged with agricultural context
}
```

---

## Support

- **Documentation**: [Full Guide](./WEEK_2_DAY_9_COMPLETION_CERTIFICATE.md)
- **Examples**: [ErrorExamples.tsx](../../src/components/errors/ErrorExamples.tsx)
- **Issues**: Report via GitHub Issues
- **Questions**: Contact development team

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
