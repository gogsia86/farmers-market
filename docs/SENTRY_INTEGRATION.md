# 🔍 Sentry Integration Documentation

## Farmers Market Platform - Error Tracking & Monitoring

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Organization:** medicis-gang  
**Project:** farmers-market-prod

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Usage Guide](#usage-guide)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Features](#advanced-features)

---

## 🎯 Overview

Sentry is integrated into the Farmers Market Platform to provide comprehensive error tracking, performance monitoring, and debugging capabilities across all environments.

### Features

- ✅ **Automatic Error Capture**: Unhandled errors automatically sent to Sentry
- ✅ **Source Maps**: Readable stack traces with original TypeScript code
- ✅ **Session Replay**: Visual replay of user sessions with errors
- ✅ **Performance Monitoring**: Track slow operations and bottlenecks
- ✅ **Release Tracking**: Errors grouped by Git commit/release
- ✅ **User Context**: Track errors by user (without exposing PII)
- ✅ **Custom Context**: Agricultural-specific error contexts
- ✅ **Breadcrumbs**: Track user actions leading to errors
- ✅ **Multi-Runtime Support**: Client, Server, and Edge runtimes

---

## 🚀 Quick Start

### 1. Install Dependencies

Sentry is already installed in the project:

```bash
# Already included in package.json
@sentry/nextjs: ^10.32.1
```

### 2. Configure Environment Variables

Copy the Sentry configuration:

```bash
# Load Sentry environment variables
cp .env.sentry .env.local
```

Or manually add to your `.env.local`:

```bash
# Sentry DSN (Data Source Name)
SENTRY_DSN="https://e6ecf356e37511f0b892c248499c2976@o4508829495328768.ingest.us.sentry.io/4508829501227008"
NEXT_PUBLIC_SENTRY_DSN="https://e6ecf356e37511f0b892c248499c2976@o4508829495328768.ingest.us.sentry.io/4508829501227008"

# Sentry Auth Token (for source map uploads)
SENTRY_AUTH_TOKEN="e6ecf356e37511f0b892c248499c2976"

# Organization and Project
SENTRY_ORG="medicis-gang"
SENTRY_PROJECT="farmers-market-prod"
```

### 3. Test Integration

Run the test script to verify Sentry is configured correctly:

```bash
# Check configuration
npm run sentry:test

# Send test error to Sentry
npm run sentry:send-test

# Verbose output
npm run sentry:test:verbose
```

### 4. View Errors in Dashboard

Visit your Sentry dashboard:
- **URL**: https://sentry.io/organizations/medicis-gang/projects/farmers-market-prod/
- **Login**: Use your Sentry account credentials

---

## ⚙️ Configuration

### Configuration Files

The platform includes three Sentry configuration files for different Next.js runtimes:

#### 1. Client Configuration (`sentry.client.config.ts`)

Handles errors in the browser:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% in production
  replaysOnErrorSampleRate: 1.0, // Replay all sessions with errors
  replaysSessionSampleRate: 0.1, // Replay 10% of all sessions
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.browserProfilingIntegration(),
  ],
});
```

**Features:**
- Session replay for visual debugging
- Browser profiling for performance insights
- Automatic route change tracking
- User interaction breadcrumbs

#### 2. Server Configuration (`sentry.server.config.ts`)

Handles errors in Node.js server runtime:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2, // 20% in production
  integrations: [
    Sentry.httpIntegration(),
    Sentry.prismaIntegration(),
    Sentry.nodeProfilingIntegration(),
  ],
});
```

**Features:**
- HTTP request tracing
- Prisma query monitoring
- Node.js profiling
- Database error tracking

#### 3. Edge Configuration (`sentry.edge.config.ts`)

Handles errors in Edge runtime (middleware, edge routes):

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.15, // 15% in production
  integrations: [
    Sentry.httpIntegration(),
  ],
});
```

**Features:**
- Edge-compatible integrations only
- Middleware error tracking
- Edge API route monitoring

### Next.js Configuration

Sentry is integrated via `next.config.mjs` using `withSentryConfig`:

```javascript
import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: "medicis-gang",
  project: "farmers-market-prod",
  
  // Source maps configuration
  sourcemaps: {
    assets: [
      ".next/static/chunks/**",
      ".next/server/**",
      ".next/static/css/**",
    ],
    deleteAfterUpload: false,
  },
  
  // Auth token for uploads
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Enable tunnel route to bypass ad-blockers
  tunnelRoute: "/monitoring",
  
  // Keep source maps for debugging
  hideSourceMaps: false,
});
```

---

## 🧪 Testing

### Available Test Scripts

```bash
# Check Sentry configuration
npm run sentry:test

# Send test errors to Sentry dashboard
npm run sentry:send-test

# Verbose output with all details
npm run sentry:test:verbose

# Full configuration check
npm run sentry:check
```

### Manual Testing

You can manually test Sentry in your application:

```typescript
import { sendTestError, getSentryStatus } from "@/lib/monitoring/sentry-utils";

// Check if Sentry is configured
const status = getSentryStatus();
console.log(status);
// { configured: true, environment: "development", dsn: "https://..." }

// Send a test error (development only)
sendTestError();
```

### Expected Test Results

After running `npm run sentry:send-test`, you should see:

1. ✅ 6 test events sent to Sentry
2. ✅ Events flushed successfully
3. ✅ Check dashboard for events

Types of test events:
- Basic error capture
- Error with context
- Message capture
- Error with breadcrumbs
- Agricultural-specific error
- Performance transaction

---

## 📖 Usage Guide

### Basic Error Tracking

#### Automatic Error Capture

Unhandled errors are automatically captured:

```typescript
// This error will be automatically sent to Sentry
throw new Error("Something went wrong!");
```

#### Manual Error Tracking

Use utility functions for more control:

```typescript
import { trackError } from "@/lib/monitoring/sentry-utils";

try {
  await riskyOperation();
} catch (error) {
  trackError(error as Error, {
    tags: { operation: "farm_creation" },
    extra: { farmId: "farm_123" },
  });
  
  // Handle error gracefully
  return { error: "Failed to create farm" };
}
```

### User Context

Track which users are experiencing errors:

```typescript
import { setUserContext, clearUserContext } from "@/lib/monitoring/sentry-utils";

// On login
setUserContext({
  id: user.id,
  name: user.name,
  role: user.role,
});

// On logout
clearUserContext();
```

**Note:** Only non-sensitive data (ID, role) is sent. Email and other PII are automatically stripped.

### API Error Tracking

Track API errors with HTTP context:

```typescript
import { trackApiError } from "@/lib/monitoring/sentry-utils";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await processOrder(data);
    return Response.json(result);
  } catch (error) {
    trackApiError(error as Error, {
      method: request.method,
      url: request.url,
      statusCode: 500,
      userId: session?.user?.id,
    });
    
    return Response.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
```

### Database Error Tracking

Track database errors with query context:

```typescript
import { trackDatabaseError } from "@/lib/monitoring/sentry-utils";

try {
  const farms = await database.farm.findMany({
    where: { status: "ACTIVE" },
  });
} catch (error) {
  trackDatabaseError(error as Error, {
    operation: "findMany",
    model: "Farm",
    duration: performanceTimer.end(),
  });
  
  throw error;
}
```

### Agricultural-Specific Tracking

Track domain-specific operations:

```typescript
import { trackAgriculturalOperation } from "@/lib/monitoring/sentry-utils";

trackAgriculturalOperation("create_farm", {
  farmType: "organic",
  cropCategory: "vegetables",
  season: "spring",
  region: "midwest",
  certifications: ["USDA_ORGANIC", "NON_GMO"],
  success: true,
  duration: 1234, // ms
});
```

### Performance Monitoring

Track custom performance metrics:

```typescript
import { startTransaction, trackPerformanceMetric } from "@/lib/monitoring/sentry-utils";

// Track a transaction
const endTransaction = startTransaction(
  "process_large_order",
  "business_logic",
  { orderSize: "large" }
);

try {
  await processOrder(largeOrder);
} finally {
  endTransaction();
}

// Track a custom metric
trackPerformanceMetric({
  name: "image_processing_time",
  value: 1234,
  unit: "ms",
  tags: { image_size: "large" },
});
```

### Breadcrumbs

Add breadcrumbs to track user actions:

```typescript
import { addBreadcrumb, addNavigationBreadcrumb } from "@/lib/monitoring/sentry-utils";

// Custom breadcrumb
addBreadcrumb("User clicked checkout button", {
  cartTotal: 150.00,
  itemCount: 5,
}, "user-action");

// Navigation breadcrumb
addNavigationBreadcrumb("/products", "/checkout");
```

### React Error Boundaries

Capture React component errors:

```typescript
import { captureErrorBoundaryError } from "@/lib/monitoring/sentry-utils";

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureErrorBoundaryError(error, {
      componentStack: errorInfo.componentStack,
    });
  }
}
```

---

## ✅ Best Practices

### 1. Error Context

Always provide context when tracking errors:

```typescript
// ❌ Bad - No context
trackError(error);

// ✅ Good - Rich context
trackError(error, {
  tags: {
    operation: "checkout",
    payment_method: "stripe",
  },
  extra: {
    orderId: order.id,
    amount: order.total,
    items: order.items.length,
  },
});
```

### 2. Sensitive Data

Never log sensitive information:

```typescript
// ❌ Bad - Contains PII
trackError(error, {
  extra: {
    email: user.email,
    password: user.password,
    creditCard: payment.cardNumber,
  },
});

// ✅ Good - No PII
trackError(error, {
  extra: {
    userId: user.id,
    paymentMethod: payment.method,
  },
});
```

Sentry is configured to automatically strip:
- Authorization headers
- Cookie data
- Email addresses
- API tokens
- Passwords

### 3. Error Levels

Use appropriate error levels:

```typescript
// Fatal - Critical errors requiring immediate attention
trackError(error, { tags: { critical: "true" } }, "fatal");

// Error - Standard errors
trackError(error, {}, "error");

// Warning - Non-critical issues
trackError(error, {}, "warning");
```

### 4. Sampling

Use sampling to control costs and noise:

```typescript
// Production sampling rates (configured in sentry.*.config.ts)
- Client: 10% traces, 100% errors, 10% sessions
- Server: 20% traces, 100% errors
- Edge: 15% traces, 100% errors
```

### 5. Error Grouping

Help Sentry group similar errors:

```typescript
// Tag errors with operation names
trackError(error, {
  tags: {
    operation: "create_farm", // Groups all farm creation errors
    farm_type: "organic",
  },
});
```

### 6. Performance Impact

Minimize performance overhead:

```typescript
// ❌ Bad - Tracking every operation
for (const item of items) {
  trackMessage(`Processing item ${item.id}`);
}

// ✅ Good - Batch or sample
if (items.length > 100) {
  trackMessage(`Processing large batch: ${items.length} items`);
}
```

---

## 🔧 Troubleshooting

### Issue: "Sentry not configured"

**Symptoms:**
```
❌ SENTRY_DSN not configured
```

**Solution:**
1. Check `.env.local` contains `SENTRY_DSN`
2. Restart development server
3. Run `npm run sentry:test` to verify

### Issue: "Events not appearing in dashboard"

**Symptoms:**
- Test errors sent successfully
- Dashboard shows no events

**Solution:**
1. Check environment filter in dashboard (dev/staging/production)
2. Wait 30-60 seconds for events to process
3. Verify DSN matches project in dashboard
4. Check project permissions in Sentry

### Issue: "Source maps not working"

**Symptoms:**
- Stack traces show minified code
- Can't identify original file locations

**Solution:**
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check build logs for source map upload success
3. Ensure `hideSourceMaps: false` in `next.config.mjs`
4. Rebuild application: `npm run build`

### Issue: "Too many events / rate limiting"

**Symptoms:**
```
Error: Event dropped due to rate limiting
```

**Solution:**
1. Review `ignoreErrors` in config files
2. Increase sampling rates if too aggressive
3. Filter out noisy errors (network timeouts, 404s)
4. Upgrade Sentry plan if needed

### Issue: "Performance overhead"

**Symptoms:**
- Application slower with Sentry enabled
- High memory usage

**Solution:**
1. Reduce `tracesSampleRate` in production
2. Disable session replay for non-critical pages
3. Use `ignoreTransactions` to skip health checks
4. Profile with Sentry disabled to compare

---

## 🚀 Advanced Features

### Custom Integrations

Add custom Sentry integrations:

```typescript
import * as Sentry from "@sentry/nextjs";
import { CustomIntegration } from "./custom-integration";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new CustomIntegration({
      // Custom options
    }),
  ],
});
```

### Release Tracking

Track deploys and group errors by release:

```typescript
// Automatically configured in next.config.mjs
release: process.env.VERCEL_GIT_COMMIT_SHA,

// Or manually set
Sentry.init({
  release: "farmers-market@1.2.3",
});
```

### Custom Scopes

Create isolated error contexts:

```typescript
Sentry.withScope((scope) => {
  scope.setTag("section", "checkout");
  scope.setLevel("warning");
  scope.setContext("checkout_details", {
    total: order.total,
    items: order.items.length,
  });
  
  Sentry.captureMessage("Checkout attempted");
});
```

### Async Error Tracking

Wrap async functions:

```typescript
import { withErrorTracking } from "@/lib/monitoring/sentry-utils";

const processOrder = withErrorTracking(
  async (order: Order) => {
    // Process order logic
    return result;
  },
  { tags: { operation: "process_order" } }
);
```

### Filtering Events

Customize which events are sent:

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  beforeSend(event, hint) {
    // Don't send test errors
    if (event.tags?.test === "true") {
      return null;
    }
    
    // Modify event before sending
    event.contexts = {
      ...event.contexts,
      custom: {
        environment: "agricultural",
      },
    };
    
    return event;
  },
});
```

### Session Replay Configuration

Fine-tune session replay:

```typescript
Sentry.replayIntegration({
  // Privacy settings
  maskAllText: true,
  blockAllMedia: true,
  
  // Network details
  networkDetailAllowUrls: [window.location.origin],
  
  // Sample rate
  sessionSampleRate: 0.1,
  errorSampleRate: 1.0,
});
```

---

## 📊 Dashboard Usage

### Viewing Errors

1. Navigate to **Issues** tab
2. Filter by environment (dev/staging/production)
3. Sort by frequency or recency
4. Click issue for details:
   - Stack trace
   - Breadcrumbs
   - User context
   - Request data

### Creating Alerts

1. Navigate to **Alerts** → **Create Alert**
2. Choose alert type:
   - Issue alerts (new/frequent errors)
   - Metric alerts (performance thresholds)
3. Set conditions and notifications
4. Test alert with test error

### Performance Monitoring

1. Navigate to **Performance** tab
2. View transaction summaries
3. Identify slow operations
4. Drill down into specific traces

### Session Replay

1. Navigate to **Replays** tab
2. Filter by error/session type
3. Watch user session replay
4. See console logs and network requests

---

## 📚 Additional Resources

### Documentation

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- **API Reference**: https://docs.sentry.io/platforms/javascript/configuration/

### Dashboard

- **Organization**: https://sentry.io/organizations/medicis-gang/
- **Project**: https://sentry.io/organizations/medicis-gang/projects/farmers-market-prod/
- **Settings**: https://sentry.io/settings/medicis-gang/projects/farmers-market-prod/

### Support

- **GitHub Issues**: https://github.com/getsentry/sentry-javascript/issues
- **Discord**: https://discord.gg/sentry
- **Stack Overflow**: Tag `sentry`

---

## 📝 Changelog

### Version 1.0.0 (January 2025)

- ✅ Initial Sentry integration
- ✅ Client, server, and edge runtime support
- ✅ Custom utility functions
- ✅ Agricultural-specific tracking
- ✅ Test scripts and documentation
- ✅ Source map configuration
- ✅ Session replay setup
- ✅ Performance monitoring

---

## 🤝 Contributing

To improve Sentry integration:

1. Test changes with `npm run sentry:send-test`
2. Verify in dashboard before deploying
3. Update this documentation
4. Follow security best practices

---

**Made with 🌾 by the Farmers Market Platform Team**