# Technical Debt Resolution Plan

**Date Created**: 2025-01-20  
**Status**: Active  
**Priority**: High

---

## Executive Summary

This document tracks and prioritizes technical debt across the Farmers Market Platform codebase. All items discovered during the cognitive processing protocol integration and repository cleanup phase.

**Total Debt Items**: 61

- 57 TODO/FIXME markers
- 4 deprecated type definitions
- Mobile app dependency updates needed

---

## 1. TODO/FIXME Markers (57 Total)

### 🔴 Priority 1: Security & Core Functionality (Critical)

#### P1.1: Farm Ownership Verification

**Location**: `src/lib/controllers/order.controller.ts:426-436`  
**Status**: 🚨 SECURITY CRITICAL  
**Effort**: 2 hours

```typescript
// CURRENT (INSECURE)
async getFarmOrders(request: NextRequest, params: { farmId: string }) {
  return this.handleAuthenticatedRequest(request, async (_session) => {
    const farmId = params.farmId;
    // TODO: Add farm ownership verification
    // For now, allow all authenticated users (will be restricted in production)
  });
}

// REQUIRED FIX
async getFarmOrders(request: NextRequest, params: { farmId: string }) {
  return this.handleAuthenticatedRequest(request, async (session) => {
    const farmId = params.farmId;

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true }
    });

    if (!farm || farm.ownerId !== session.user.id) {
      throw new UnauthorizedError("Not authorized to view farm orders");
    }

    // Proceed with order retrieval...
  });
}
```

**Action**: Implement farm ownership check in all farm-specific endpoints.

---

#### P1.2: Search Functionality Implementation

**Location**: `src/components/layout/Header.tsx:20-23`  
**Status**: 🟡 USER FACING  
**Effort**: 4 hours

```typescript
// CURRENT (PLACEHOLDER)
const handleSearchClick = () => {
  // TODO: Implement search functionality
  console.log("Search clicked");
};

// REQUIRED FIX
const handleSearchClick = () => {
  if (searchQuery.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
  }
};
```

**Dependencies**:

- Products page search parameter handling (already exists)
- Search input state management (add useState)

**Action**: Quick 2-line fix to enable basic search navigation.

---

#### P1.3: Payment Processing Integration

**Location**: `src/lib/services/checkout.service.ts:724-734`  
**Status**: 🟡 BUSINESS CRITICAL  
**Effort**: 8 hours

```typescript
// CURRENT (MOCK)
async processPayment(orderId: string, paymentMethodId: string) {
  // TODO: Integrate with Stripe payment processing
  // For now, mark as paid immediately
  await this.database.order.update({
    where: { id: orderId },
    data: { status: "PAID" }
  });
}

// REQUIRED FIX
async processPayment(orderId: string, paymentMethodId: string) {
  const order = await this.database.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: "usd",
    payment_method: paymentMethodId,
    confirm: true,
    metadata: { orderId }
  });

  // Update order with payment info
  await this.database.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      stripePaymentIntentId: paymentIntent.id
    }
  });
}
```

**Dependencies**:

- Stripe SDK (already installed)
- Environment variables (already configured)

**Action**: Implement Stripe payment flow using existing infrastructure.

---

#### P1.4: Address Validation Service

**Location**: `src/lib/services/checkout.service.ts:439-443`  
**Status**: 🟢 ENHANCEMENT  
**Effort**: 6 hours

```typescript
// CURRENT (BASIC VALIDATION)
async validateShippingAddress(address: ShippingAddress) {
  if (!address.street || !address.city || !address.state || !address.zipCode) {
    throw new ValidationError("Incomplete address");
  }
  // TODO: Integrate with geocoding service for real validation
}

// REQUIRED FIX (Use existing geocoding service)
async validateShippingAddress(address: ShippingAddress) {
  const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;

  const geocoded = await geocodingService.geocode(fullAddress);

  if (!geocoded) {
    throw new ValidationError("Invalid address - cannot verify location");
  }

  return {
    ...address,
    coordinates: {
      lat: geocoded.latitude,
      lng: geocoded.longitude
    },
    verified: true
  };
}
```

**Dependencies**:

- `geocodingService` (already exists at `src/lib/services/geocoding.service.ts`)

**Action**: Integrate existing geocoding service for address validation.

---

### 🟡 Priority 2: Observability & Production Readiness (High)

#### P2.1: Azure Application Insights Integration

**Locations**:

- `src/lib/api/error-handler.ts:370-380`
- `src/lib/security/rate-limiter.ts:527-537`
- `src/lib/security/csp.ts:281-285`

**Status**: 🟠 PRODUCTION REQUIRED  
**Effort**: 12 hours

**Implementation Plan**:

```typescript
// 1. Install dependencies
// npm install @azure/monitor-opentelemetry-exporter

// 2. Create telemetry service
// src/lib/telemetry/azure-insights.ts
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { trace } from "@opentelemetry/api";

export class AzureTelemetryService {
  private tracer = trace.getTracer("farmers-market-platform");

  async trackEvent(name: string, properties: Record<string, any>) {
    const span = this.tracer.startSpan(name);
    span.setAttributes(properties);
    span.end();
  }

  async trackException(error: Error, context?: Record<string, any>) {
    const span = this.tracer.startSpan("exception");
    span.recordException(error);
    if (context) span.setAttributes(context);
    span.end();
  }
}

// 3. Update error handler
function logError(error: unknown, context?: Record<string, any>): void {
  if (isDevelopment) {
    console.error("🔴 [Error Log]", { error, context });
  }

  // Production: Send to Azure Application Insights
  if (process.env.NODE_ENV === "production") {
    telemetryService.trackException(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  }
}

// 4. Update rate limiter
async function logRateLimitEvent(event: RateLimitEvent) {
  if (isDevelopment) {
    console.log("🛡️ Rate Limit:", event);
  }

  if (process.env.NODE_ENV === "production") {
    await telemetryService.trackEvent("RateLimitCheck", {
      identifier: event.identifier,
      status: event.success ? "allowed" : "blocked",
      remaining: event.remaining,
    });
  }
}
```

**Environment Variables Required**:

```env
AZURE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx
```

**Action**: Implement Azure Application Insights with OpenTelemetry integration.

---

#### P2.2: WebSocket Real-time Notifications

**Location**: `src/components/notifications/NotificationBell.tsx:64-74`  
**Status**: 🟢 ENHANCEMENT  
**Effort**: 16 hours

**Current State**: Polling-based notifications  
**Target State**: WebSocket push notifications

**Implementation Strategy**:

1. Set up WebSocket server (Socket.io or native WebSocket)
2. Implement connection management in NotificationBell
3. Add server-side notification broadcasting
4. Handle reconnection and offline scenarios

**Deferred**: Phase 5 - Real-time Features

---

#### P2.3: Email Notification Service

**Locations**:

- `src/lib/services/saved-searches/search-alert.service.ts:689-699`
- `src/lib/lazy/email.lazy.ts:124-127`

**Status**: 🟢 ENHANCEMENT  
**Effort**: 8 hours

**Current State**: Console logging placeholders  
**Target State**: SendGrid/AWS SES integration

**Implementation**:

```typescript
// Already have email service infrastructure
// Just need to configure SendGrid API key

// Environment variable
SENDGRID_API_KEY = SG.xxx;

// Usage (already structured)
import { emailService } from "@/lib/services/email.service";

async function sendEmailNotification(
  alert: Alert,
  evaluation: EvaluationResult,
) {
  await emailService.sendTemplate({
    to: alert.user.email,
    template: "search-alert",
    data: {
      userName: alert.user.name,
      alertType: alert.type,
      message: evaluation.message,
      products: evaluation.products,
    },
  });
}
```

**Action**: Configure SendGrid and enable email sending (infrastructure already exists).

---

### 🟢 Priority 3: Future Enhancements (Low)

#### P3.1: Redis Caching Layer

**References**: Multiple files mention Redis caching  
**Effort**: 20 hours  
**Status**: 📋 BACKLOG

**Target Areas**:

- Product catalog caching
- Farm profile caching
- Search results caching
- Session data caching

**Deferred**: Phase 6 - Performance Optimization

---

#### P3.2: Advanced Search Features

**References**: Multiple TODO markers for search improvements  
**Effort**: 24 hours  
**Status**: 📋 BACKLOG

**Features**:

- Full-text search with Algolia/Elasticsearch
- Faceted filtering
- Search suggestions/autocomplete
- Search analytics

**Deferred**: Phase 7 - Enhanced Discovery

---

#### P3.3: Push Notification Service

**Location**: `src/lib/services/saved-searches/search-alert.service.ts:714-724`  
**Effort**: 12 hours  
**Status**: 📋 BACKLOG

**Integration Options**:

- Firebase Cloud Messaging (FCM)
- OneSignal
- AWS SNS

**Deferred**: Phase 5 - Mobile Enhancement

---

## 2. Deprecated Type Definitions (4 Total)

### D1: `src/types/product.ts` - ExtendedProduct

**Status**: ✅ RESOLVED (Aliased)  
**Current Implementation**:

```typescript
/**
 * @deprecated Consider using ProductWithRelations from @/types/core-entities
 */
export type ExtendedProduct = ProductWithRelations;
```

**Migration Path**: Already aliased to core type. No breaking changes.

**Action Required**: Monitor usage, remove in v2.0.0

---

### D2: `src/features/farm-management/types/farm.types.ts` - PaginatedResult

**Status**: ✅ RESOLVED (Aliased)  
**Current Implementation**:

```typescript
/**
 * @deprecated Use PaginatedResponse<T> from core-entities instead
 */
export interface PaginatedResult<T> extends PaginatedResponse<T> {}
```

**Migration Path**: Already extends core type. No breaking changes.

**Action Required**: Update import statements gradually, remove in v2.0.0

---

### D3: `src/lib/database.ts` - Legacy Re-export

**Status**: ✅ RESOLVED (Re-export)  
**Current Implementation**:

```typescript
/**
 * @deprecated Use @/lib/database/index instead (preferred canonical location)
 */
export { database } from "@/lib/database/index";
```

**Migration Path**: Re-exports canonical location. No breaking changes.

**Action Required**: Update imports to use `@/lib/database/index`, remove re-export in v2.0.0

---

### D4: `src/lib/security/csp.ts` - object-src Directive

**Status**: ✅ ACCEPTABLE  
**Reason**: Browser compatibility for older clients

**Current Implementation**:

```typescript
// Objects (deprecated but included for older browsers)
"object-src": ["'none'"],
```

**Action Required**: None - this is intentional for security and compatibility

---

## 3. Mobile App Dependencies

### Current Versions

```json
{
  "expo": "^54.0.25",
  "react-native": "0.73.6",
  "react": "18.2.0"
}
```

### Latest Stable Versions

```json
{
  "expo": "^52.0.0", // SDK 52 (stable)
  "react-native": "0.76.5", // Latest stable
  "react": "18.3.1" // Latest stable
}
```

### Update Strategy

#### Option 1: Conservative (Recommended)

**Timeline**: Q2 2025  
**Approach**: Update to Expo SDK 51 first, then 52

```bash
# Step 1: Backup
git checkout -b mobile-update-expo-51

# Step 2: Update to SDK 51
npx expo install expo@^51.0.0 --fix
npx expo install --fix  # Auto-update compatible packages

# Step 3: Test thoroughly
npm run ios
npm run android

# Step 4: If stable, upgrade to SDK 52
npx expo install expo@^52.0.0 --fix
```

#### Option 2: Direct Upgrade (Risky)

**Timeline**: Immediate (not recommended without QA)  
**Approach**: Jump to Expo SDK 52

```bash
npx expo install expo@^52.0.0 --fix
npx expo install --fix
```

### Breaking Changes to Review

**Expo SDK 51 → 52**:

- New architecture enabled by default (Fabric + TurboModules)
- Changes to navigation library compatibility
- Stripe React Native may need update

**React Native 0.73 → 0.76**:

- Hermes improvements
- New architecture stabilization
- Breaking changes in native modules

### Risk Assessment

| Risk                            | Impact | Mitigation                                      |
| ------------------------------- | ------ | ----------------------------------------------- |
| Breaking API changes            | High   | Thorough testing on staging                     |
| Native module compatibility     | Medium | Check @stripe/stripe-react-native compatibility |
| iOS/Android build issues        | Medium | Update native build tools                       |
| Development workflow disruption | Low    | Update only on feature branch                   |

### Recommendation

**Status**: 🟡 DEFER TO Q2 2025  
**Reason**:

1. Current versions (Expo 54, RN 0.73) are stable and working
2. No critical security vulnerabilities
3. No blocking feature requirements
4. Web platform is primary focus (Phase 1-4)

**Action**: Schedule mobile app modernization for Q2 2025 after web platform stabilizes.

---

## 4. Documentation TODOs (18 Total)

### Status: ℹ️ INFORMATIONAL ONLY

**Locations**:

- `.github/instructions/*.md` - Examples and templates
- `docs/archive/**/*.md` - Historical documentation
- `docs/api/*.md` - Placeholder calculations

**Assessment**: These are reference examples, not actionable code debt.

**Action**: No action required - these provide helpful context.

---

## Execution Timeline

### Sprint 1 (Week 1-2): Security Critical

- [ ] P1.1: Farm ownership verification (2h)
- [ ] P1.2: Search functionality (4h)
- [ ] P1.3: Payment processing integration (8h)

**Total Effort**: 14 hours

---

### Sprint 2 (Week 3-4): Production Readiness

- [ ] P1.4: Address validation (6h)
- [ ] P2.1: Azure Application Insights (12h)

**Total Effort**: 18 hours

---

### Sprint 3 (Week 5-6): Enhancements

- [ ] P2.3: Email notifications (8h)
- [ ] Code cleanup: Remove resolved TODOs

**Total Effort**: 12 hours

---

### Q2 2025: Mobile & Advanced Features

- [ ] Mobile app dependency updates (16h)
- [ ] P2.2: WebSocket notifications (16h)
- [ ] P3 items as capacity allows

---

## Metrics & Tracking

### Technical Debt Score

- **Initial**: 61 items (57 TODO + 4 deprecated)
- **Target Sprint 1**: 54 items (−7 critical)
- **Target Sprint 2**: 52 items (−2 production)
- **Target Sprint 3**: 40 items (−12 resolved TODOs)

### Success Criteria

- ✅ Zero security-critical TODOs
- ✅ Production observability enabled
- ✅ Payment processing functional
- ✅ Search feature operational

---

## Maintenance

**Review Frequency**: Monthly  
**Owner**: Engineering Lead  
**Last Updated**: 2025-01-20  
**Next Review**: 2025-02-20

---

## References

- [Cognitive Processing Protocol](../.cursorrules)
- [Repository Cleanup Report](./archive/cleanup-phases/REPOSITORY_ANALYSIS_AND_CLEANUP.md)
- [Divine Instruction Files](../.github/instructions/)
- [Issue Tracking](https://github.com/your-org/farmers-market-platform/issues)

---

**Status**: 📋 ACTIVE TRACKING  
**Priority**: 🔴 HIGH  
**Confidence**: ✅ COMPREHENSIVE ANALYSIS COMPLETE
