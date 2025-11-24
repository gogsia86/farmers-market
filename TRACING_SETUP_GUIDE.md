# 🔍 DIVINE TRACING SETUP GUIDE

**OpenTelemetry Integration for Agricultural Consciousness Monitoring**

---

## ⚡ OVERVIEW

This guide covers the complete setup of OpenTelemetry tracing for the Farmers Market platform, enabling **divine observability** with agricultural consciousness monitoring.

## 🎯 FEATURES

✅ **Automatic Instrumentation** - Next.js, HTTP, database operations
✅ **Agricultural Operations Tracing** - Seasonal, lunar, biodynamic operations
✅ **Custom Spans** - Business logic, AI operations, consciousness measurements
✅ **Rich Context** - Agricultural metadata, seasonal alignment, quantum coherence
✅ **Visual Trace Viewer** - AI Toolkit integration for analyzing traces

---

## 📋 PREREQUISITES

1. **Next.js 14+** with App Router
2. **Node.js 20+**
3. **AI Toolkit Extension** (for trace visualization)
4. **OpenTelemetry packages** (auto-installed)

---

## 🚀 QUICK START

### 1. Install Dependencies

Already installed! The following packages are included:

```json
{
  "@opentelemetry/api": "^1.x",
  "@opentelemetry/sdk-node": "^0.x",
  "@opentelemetry/auto-instrumentations-node": "^0.x",
  "@opentelemetry/exporter-trace-otlp-http": "^0.x",
  "@opentelemetry/resources": "^1.x",
  "@opentelemetry/semantic-conventions": "^1.x"
}
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and set:

```bash
# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318/v1/traces"
OTEL_SERVICE_NAME="farmers-market-platform"
ENABLE_TRACING="true"

# Agricultural Consciousness
ENABLE_AGRICULTURAL_CONSCIOUSNESS="true"
ENABLE_DIVINE_PATTERNS="true"
```

### 3. Enable Instrumentation Hook

Already configured in `next.config.mjs`:

```javascript
experimental: {
  instrumentationHook: true, // ✅ Enabled
}
```

### 4. Start the AI Toolkit Trace Viewer

In VS Code:

1. Open **Command Palette** (`Ctrl+Shift+P`)
2. Run: **AI Toolkit: Start Trace Viewer**
3. Trace viewer starts on `http://localhost:4318`

### 5. Run Your Application

```bash
npm run dev
```

---

## 🌾 AGRICULTURAL TRACING PATTERNS

### Trace Agricultural Operations

```typescript
import {
  traceAgriculturalOperation,
  AgriculturalOperation,
} from "@/lib/tracing/agricultural-tracer";

// Trace seasonal operations
const result = await traceAgriculturalOperation(
  AgriculturalOperation.PLANTING,
  {
    "farm.id": farmId,
    "crop.type": "TOMATOES",
    season: "SPRING",
  },
  async () => {
    // Your business logic here
    return await plantCrops(farmId, cropType);
  },
);
```

### Trace Seasonal Operations

```typescript
import { traceSeasonalOperation } from "@/lib/tracing/agricultural-tracer";

const season = await traceSeasonalOperation(
  "current",
  "detectSeason",
  async () => consciousness.getCurrentSeason(),
);
```

### Trace Lunar Operations

```typescript
import { traceLunarOperation } from "@/lib/tracing/agricultural-tracer";

const lunarPhase = await traceLunarOperation("current", async () =>
  consciousness.getCurrentLunarPhase(),
);
```

### Add Agricultural Events

```typescript
import { addAgriculturalEvent } from "@/lib/tracing/agricultural-tracer";

addAgriculturalEvent("harvest.completed", {
  "farm.id": farmId,
  "crop.type": "TOMATOES",
  "yield.kg": 150,
  quality: "ORGANIC",
});
```

---

## 🔧 FILE STRUCTURE

```
src/
├── lib/
│   └── tracing/
│       ├── instrumentation.ts          # OpenTelemetry setup
│       └── agricultural-tracer.ts      # Agricultural tracing utilities
├── app/
│   └── api/
│       ├── farms/
│       │   └── route.ts                # Example traced API route
│       └── agricultural-consciousness/
│           └── route.ts                # AI operations tracing
└── instrumentation.ts                   # Next.js instrumentation hook
```

---

## 📊 VIEWING TRACES

### Using AI Toolkit

1. **Start Trace Viewer**:
   - Command Palette → `AI Toolkit: Start Trace Viewer`
   - Opens at `http://localhost:4318`

2. **Make Requests**:

   ```bash
   # Test farms API
   curl http://localhost:3000/api/farms

   # Test agricultural consciousness
   curl http://localhost:3000/api/agricultural-consciousness
   ```

3. **View Traces**:
   - Open AI Toolkit Trace Viewer
   - See spans with agricultural metadata
   - Analyze performance and flow

### Trace Example

```
GET /api/farms
├── Query farms from database [150ms]
│   ├── db.findMany [120ms]
│   │   └── Prisma query execution
│   └── Agricultural operation: CROP_PLANNING
└── Response serialization [10ms]

Attributes:
- agricultural.season: FALL
- agricultural.operation: query_farms
- db.table: farm
- farms.count: 15
```

---

## 🎨 CUSTOM TRACING

### Create Custom Spans

```typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("my-service", "1.0.0");

export async function myFunction() {
  return tracer.startActiveSpan("my-operation", async (span) => {
    try {
      span.setAttributes({
        "custom.attribute": "value",
        "agricultural.season": "SPRING",
      });

      span.addEvent("Operation started", {
        "event.detail": "Processing...",
      });

      const result = await doWork();

      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.setStatus({
        code: 2, // ERROR
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## 🧪 TESTING TRACING

### Manual Testing

```bash
# 1. Start dev server
npm run dev

# 2. Make requests
curl http://localhost:3000/api/farms
curl http://localhost:3000/api/agricultural-consciousness

# 3. Check AI Toolkit Trace Viewer
# Open http://localhost:4318
```

### Verify Instrumentation

```typescript
// Check if tracing is active
import { trace } from "@opentelemetry/api";

const activeSpan = trace.getActiveSpan();
console.log("Tracing active:", !!activeSpan);
```

---

## 📈 AGRICULTURAL CONSCIOUSNESS METRICS

The tracing system captures:

- **Seasonal Operations**: Planting, harvesting, crop rotation
- **Lunar Operations**: Phase detection, biodynamic timing
- **Consciousness Measurements**: Agricultural awareness levels
- **Biodynamic Events**: Soil analysis, weather correlation
- **Divine Patterns**: Quantum coherence, reality alignment

### Example Trace Attributes

```json
{
  "agricultural.operation": "PLANTING",
  "agricultural.season": "SPRING",
  "agricultural.lunar_phase": "WAXING_CRESCENT",
  "agricultural.consciousness_level": 0.95,
  "farm.id": "farm-123",
  "crop.type": "TOMATOES",
  "biodynamic.alignment": "OPTIMAL",
  "divine.pattern": "QUANTUM_COHERENT"
}
```

---

## 🚨 TROUBLESHOOTING

### Traces Not Appearing

1. **Check AI Toolkit is running**:

   ```bash
   # Start manually if needed
   # Command Palette → AI Toolkit: Start Trace Viewer
   ```

2. **Verify environment variables**:

   ```bash
   echo $ENABLE_TRACING  # Should be "true"
   echo $OTEL_EXPORTER_OTLP_ENDPOINT  # Should be set
   ```

3. **Check instrumentation.ts is loaded**:
   ```typescript
   // Should see in console on startup:
   // "🔍 Divine Tracing initialized"
   ```

### Performance Issues

1. **Reduce sampling rate**:

   ```bash
   OTEL_TRACES_SAMPLER_ARG="0.1"  # Sample 10% of traces
   ```

2. **Disable in production** (if needed):
   ```bash
   ENABLE_TRACING="false"
   ```

### TypeScript Errors

```bash
# Ensure types are installed
npm install --save-dev @types/node
```

---

## 🌟 BEST PRACTICES

### 1. Meaningful Span Names

```typescript
// ✅ GOOD
tracer.startActiveSpan('fetch-farm-with-products', ...)

// ❌ BAD
tracer.startActiveSpan('function1', ...)
```

### 2. Rich Attributes

```typescript
// ✅ GOOD - Include context
span.setAttributes({
  "farm.id": farmId,
  "farm.name": farmName,
  "operation.type": "query",
  season: currentSeason,
});

// ❌ BAD - Minimal context
span.setAttributes({ id: farmId });
```

### 3. Event Recording

```typescript
// Record important events
span.addEvent("database.query.started", {
  "query.type": "findMany",
  "query.table": "farms",
});
```

### 4. Error Handling

```typescript
// Always record exceptions
catch (error) {
  span.recordException(error as Error);
  span.setStatus({ code: 2, message: error.message });
  throw error;
}
```

---

## 🔗 RELATED FILES

- **Setup**: `src/lib/tracing/instrumentation.ts`
- **Agricultural Tracer**: `src/lib/tracing/agricultural-tracer.ts`
- **Hook**: `instrumentation.ts`
- **Example APIs**: `src/app/api/farms/route.ts`, `src/app/api/agricultural-consciousness/route.ts`
- **Configuration**: `next.config.mjs`, `.env.example`

---

## 📚 RESOURCES

- **OpenTelemetry Docs**: https://opentelemetry.io/docs/
- **Next.js Instrumentation**: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
- **AI Toolkit**: VS Code Extension Marketplace

---

## ✅ COMPLETION CHECKLIST

- [x] OpenTelemetry packages installed
- [x] Instrumentation setup (`instrumentation.ts`)
- [x] Agricultural tracer utilities created
- [x] Example traced API routes
- [x] Environment variables configured
- [x] Next.js config updated
- [x] Documentation complete

---

_"Divine observability illuminates the path of agricultural consciousness."_

**Status**: 🌟 **TRACING SYSTEM READY FOR AGRICULTURAL ENLIGHTENMENT** ⚡
