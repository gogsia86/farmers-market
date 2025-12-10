# 🗺️ Geocoding Service Test Fixes

## Issue

Geocoding service tests are failing with:

```
TypeError: GeocodingService.calculateDistance is not a function
TypeError: GeocodingService.geocodeAddress is not a function
```

## Root Cause

The service implementation likely uses instance methods, not static methods,
but the tests are importing and calling static methods.

## Fix Options

### Option 1: Update Tests to Use Instance Methods

```typescript
// Before:
import { GeocodingService } from '@/lib/services/geocoding.service';
const distance = GeocodingService.calculateDistance(...);

// After:
import { geocodingService } from '@/lib/services/geocoding.service';
const distance = await geocodingService.calculateDistance(...);
```

### Option 2: Update Service to Export Static Methods

```typescript
// In geocoding.service.ts:
export class GeocodingService {
  static calculateDistance(...) { ... }
  static geocodeAddress(...) { ... }
}
```

### Option 3: Mock the Service Properly

```typescript
jest.mock("@/lib/services/geocoding.service", () => ({
  geocodingService: {
    calculateDistance: jest.fn(),
    geocodeAddress: jest.fn(),
  },
}));
```

## Recommended Approach

1. Check actual service implementation
2. Update tests to match implementation pattern
3. Use singleton export for consistency with other services

## Implementation Steps

1. Review `src/lib/services/geocoding.service.ts`
2. Identify if methods are static or instance-based
3. Update all test files to match
4. Ensure mock setup matches actual exports
