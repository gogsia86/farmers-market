# 🚀 SPRINT 5 QUICK REFERENCE GUIDE

**Sprint 5**: Settings & Configuration  
**Version**: 1.0.0  
**Last Updated**: 2024

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Component Usage](#component-usage)
3. [API Endpoints](#api-endpoints)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 QUICK START

### Import Settings Components

```typescript
// Farm settings components
import {
  BusinessHoursEditor,
  DeliveryZonesManager,
  PaymentMethodsSettings,
  FarmSettingsClient,
} from "@/components/features/settings";

// User settings components
import {
  NotificationSettings,
  DisplaySettings,
  PrivacySettings,
} from "@/components/settings";

// Types
import type {
  UserSettingsData,
  FarmSettingsData,
  BusinessHoursData,
  DeliveryArea,
} from "@/types/settings";

// Service
import { settingsService } from "@/lib/services/settings.service";
```

### Fetch Settings Data

```typescript
// Server component - fetch user settings
const userSettings = await settingsService.getUserSettings(userId);

// Server component - fetch farm settings
const farmSettings = await settingsService.getFarmSettings(farmId);

// Client component - API call
const response = await fetch(`/api/settings/user/${userId}`);
const { data } = await response.json();
```

---

## 🧩 COMPONENT USAGE

### BusinessHoursEditor

**Purpose**: Manage farm operating hours day-by-day

```tsx
"use client";

import { useState } from "react";
import { BusinessHoursEditor } from "@/components/features/settings";
import type { BusinessHoursData } from "@/types/settings";

function MyComponent() {
  const [hours, setHours] = useState<BusinessHoursData[]>([
    {
      dayOfWeek: "MONDAY",
      openTime: "09:00",
      closeTime: "17:00",
      closed: false,
    },
  ]);

  return (
    <BusinessHoursEditor
      value={hours}
      onChange={setHours}
      disabled={false}
    />
  );
}
```

**Features**:
- ✅ Multiple time slots per day
- ✅ Copy hours to other days
- ✅ Closed day management
- ✅ Real-time validation

---

### DeliveryZonesManager

**Purpose**: Configure delivery areas and fees

```tsx
"use client";

import { useState } from "react";
import { DeliveryZonesManager } from "@/components/features/settings";
import type { DeliveryArea } from "@/types/settings";

function MyComponent() {
  const [zones, setZones] = useState<DeliveryArea[]>([
    {
      name: "Downtown",
      postalCodes: ["12345", "12346"],
      radius: 10,
      deliveryFee: 5.00,
    },
  ]);

  return (
    <DeliveryZonesManager
      value={zones}
      onChange={setZones}
      farmLocation={{
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Farm Road, City, State 12345",
      }}
    />
  );
}
```

**Features**:
- ✅ Radius-based delivery
- ✅ Postal code zones
- ✅ Per-zone fees
- ✅ Zone validation

---

### PaymentMethodsSettings

**Purpose**: Configure accepted payment methods and deposits

```tsx
"use client";

import { useState } from "react";
import { PaymentMethodsSettings } from "@/components/features/settings";

function MyComponent() {
  const [methods, setMethods] = useState<string[]>(["CARD", "CASH"]);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(25);

  return (
    <PaymentMethodsSettings
      acceptedMethods={methods}
      onMethodsChange={setMethods}
      requireDeposit={requireDeposit}
      onRequireDepositChange={setRequireDeposit}
      depositPercentage={depositPercentage}
      onDepositPercentageChange={setDepositPercentage}
    />
  );
}
```

**Available Payment Methods**:
- `CARD` - Credit/Debit Card
- `CASH` - Cash on delivery
- `CHECK` - Check payment
- `BANK_TRANSFER` - Direct bank transfer
- `VENMO` - Venmo payment
- `PAYPAL` - PayPal payment

---

### FarmSettingsClient

**Purpose**: Complete farm settings orchestrator

```tsx
"use client";

import { FarmSettingsClient } from "@/components/features/settings";
import type { FarmSettingsData } from "@/types/settings";

function MyPage({ settings, farmId, farmLocation }: Props) {
  return (
    <FarmSettingsClient
      settings={settings}
      farmId={farmId}
      farmLocation={farmLocation}
      onSaveSuccess={() => {
        console.log("Settings saved!");
      }}
    />
  );
}
```

**Features**:
- ✅ Tab-based navigation
- ✅ Business hours, delivery, payment, policies, features
- ✅ Change detection
- ✅ Optimistic updates
- ✅ Error handling

---

### NotificationSettings

**Purpose**: User notification preferences

```tsx
"use client";

import { NotificationSettings } from "@/components/settings";
import type { NotificationPreferences } from "@/types/settings";

function MyComponent({ preferences }: Props) {
  const handleChange = (updates: Partial<NotificationPreferences>) => {
    // Save to API
    fetch(`/api/settings/user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ notifications: updates }),
    });
  };

  return (
    <NotificationSettings
      preferences={preferences}
      onChange={handleChange}
    />
  );
}
```

---

### DisplaySettings

**Purpose**: Display preferences (theme, language, timezone)

```tsx
"use client";

import { DisplaySettings } from "@/components/settings";
import type { DisplayPreferences } from "@/types/settings";

function MyComponent({ preferences }: Props) {
  return (
    <DisplaySettings
      preferences={preferences}
      onChange={(updates) => {
        // Save updates
      }}
    />
  );
}
```

---

### PrivacySettings

**Purpose**: Privacy and data sharing preferences

```tsx
"use client";

import { PrivacySettings } from "@/components/settings";
import type { PrivacySettings as PrivacyPrefs } from "@/types/settings";

function MyComponent({ preferences }: Props) {
  return (
    <PrivacySettings
      preferences={preferences}
      onChange={(updates) => {
        // Save updates
      }}
    />
  );
}
```

---

## 🔌 API ENDPOINTS

### User Settings

#### GET `/api/settings/user/[userId]`

**Fetch user settings**

```typescript
// Request
GET /api/settings/user/user_123

// Response
{
  "success": true,
  "data": {
    "notifications": {
      "email": { "enabled": true, "frequency": "INSTANT" },
      "sms": { "enabled": false },
      "push": { "enabled": true }
    },
    "display": {
      "theme": "LIGHT",
      "language": "en",
      "timezone": "America/New_York"
    },
    "privacy": {
      "profileVisibility": "PUBLIC",
      "showEmail": false,
      "showPhone": false
    }
  }
}
```

#### PATCH `/api/settings/user/[userId]`

**Update user settings**

```typescript
// Request
PATCH /api/settings/user/user_123
Content-Type: application/json

{
  "notifications": {
    "email": { "enabled": true, "frequency": "DAILY" }
  }
}

// Response
{
  "success": true,
  "data": { /* updated settings */ }
}
```

---

### Farm Settings

#### GET `/api/settings/farm/[farmId]`

**Fetch farm settings**

```typescript
// Request
GET /api/settings/farm/farm_456

// Response
{
  "success": true,
  "data": {
    "businessHours": [
      {
        "dayOfWeek": "MONDAY",
        "openTime": "09:00",
        "closeTime": "17:00",
        "closed": false
      }
    ],
    "deliveryAreas": [
      {
        "name": "Downtown",
        "postalCodes": ["12345"],
        "radius": 10,
        "deliveryFee": 5.00
      }
    ],
    "acceptedPaymentMethods": ["CARD", "CASH"],
    "requireDepositOnOrders": false,
    "depositPercentage": 25,
    "policies": {
      "cancellationPolicy": "...",
      "returnPolicy": "...",
      "termsAndConditions": "..."
    },
    "features": {
      "enablePreOrders": true,
      "enableSubscriptions": false,
      "enableGiftCards": false
    }
  }
}
```

#### PATCH `/api/settings/farm/[farmId]`

**Update farm settings**

```typescript
// Request
PATCH /api/settings/farm/farm_456
Content-Type: application/json

{
  "businessHours": [ /* updated hours */ ],
  "deliveryFee": 7.50
}

// Response
{
  "success": true,
  "data": { /* updated settings */ }
}
```

---

## 🎯 COMMON PATTERNS

### Pattern 1: Fetching Settings in Server Component

```typescript
// app/farmer/settings/page.tsx
import { auth } from "@/lib/auth";
import { settingsService } from "@/lib/services/settings.service";

export default async function SettingsPage() {
  const session = await auth();
  const settings = await settingsService.getUserSettings(session.user.id);
  
  if (!settings) {
    throw new Error("Failed to load settings");
  }

  return <SettingsUI settings={settings} />;
}
```

---

### Pattern 2: Updating Settings from Client Component

```typescript
"use client";

import { useState } from "react";

export function SettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/settings/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const { data } = await response.json();
      setSettings(data); // Update with server response
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {/* Form fields */}
    </form>
  );
}
```

---

### Pattern 3: Optimistic Updates

```typescript
"use client";

import { useState, useTransition } from "react";

export function QuickToggle({ enabled, onChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useState(enabled);

  const handleToggle = () => {
    // Optimistic update
    setOptimisticValue(!optimisticValue);

    // Start transition for actual update
    startTransition(async () => {
      try {
        await onChange(!enabled);
      } catch (error) {
        // Revert on error
        setOptimisticValue(enabled);
      }
    });
  };

  return (
    <button onClick={handleToggle} disabled={isPending}>
      {optimisticValue ? "Enabled" : "Disabled"}
    </button>
  );
}
```

---

### Pattern 4: Using Settings Service

```typescript
import { settingsService } from "@/lib/services/settings.service";

// Get settings
const settings = await settingsService.getUserSettings(userId);

// Update settings
await settingsService.updateUserSettings(userId, {
  notifications: { email: { enabled: false } }
});

// Get farm settings
const farmSettings = await settingsService.getFarmSettings(farmId);

// Update farm settings
await settingsService.updateFarmSettings(farmId, {
  deliveryFee: 10.00
});
```

---

### Pattern 5: Validation with Zod

```typescript
import { z } from "zod";

const BusinessHoursSchema = z.object({
  dayOfWeek: z.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
    "FRIDAY", "SATURDAY", "SUNDAY"
  ]),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  closed: z.boolean(),
});

// Validate
const result = BusinessHoursSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: TypeScript Error - "Cannot find module '@/components/features/settings'"

**Solution**: Ensure the index file exists:
```typescript
// src/components/features/settings/index.ts
export { BusinessHoursEditor } from "./BusinessHoursEditor";
export { DeliveryZonesManager } from "./DeliveryZonesManager";
export { PaymentMethodsSettings } from "./PaymentMethodsSettings";
export { FarmSettingsClient } from "./FarmSettingsClient";
```

---

### Issue: "settings is possibly null"

**Solution**: Add null check:
```typescript
const settings = await settingsService.getUserSettings(userId);
if (!settings) {
  throw new Error("Settings not found");
}
// Now settings is guaranteed to be non-null
```

---

### Issue: Cache not invalidating after update

**Solution**: Ensure cache key invalidation:
```typescript
import { redis } from "@/lib/redis";

// After update
await redis.del(`settings:user:${userId}`);
await redis.del(`settings:farm:${farmId}`);
```

---

### Issue: Component not updating after API call

**Solution**: Use proper state management:
```typescript
const [settings, setSettings] = useState(initialSettings);

const handleUpdate = async (updates) => {
  const response = await fetch(...);
  const { data } = await response.json();
  setSettings(data); // ✅ Update local state
};
```

---

### Issue: Business hours validation failing

**Solution**: Ensure proper time format:
```typescript
// ✅ Correct format
openTime: "09:00"  // HH:MM (24-hour)
closeTime: "17:00"

// ❌ Wrong format
openTime: "9:00"   // Missing leading zero
closeTime: "5 PM"  // 12-hour format
```

---

## 📚 TYPE REFERENCE

### Core Types

```typescript
// User Settings
interface UserSettingsData {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacySettings;
}

// Farm Settings
interface FarmSettingsData {
  businessHours: BusinessHoursData[];
  deliveryAreas: DeliveryArea[];
  deliveryFee?: number;
  minOrderValue?: number;
  acceptedPaymentMethods: string[];
  requireDepositOnOrders: boolean;
  depositPercentage?: number;
  policies: FarmPolicies;
  features: FarmFeatures;
}

// Business Hours
interface BusinessHoursData {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

// Delivery Area
interface DeliveryArea {
  name: string;
  postalCodes: string[];
  radius?: number;
  deliveryFee: number;
}
```

---

## ✅ BEST PRACTICES

### 1. Always Use Canonical Database Import
```typescript
// ✅ Correct
import { database } from "@/lib/database";

// ❌ Wrong
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
```

### 2. Handle Loading States
```typescript
const [isSaving, setIsSaving] = useState(false);

return (
  <button disabled={isSaving}>
    {isSaving ? "Saving..." : "Save Settings"}
  </button>
);
```

### 3. Show User Feedback
```typescript
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);

{error && <ErrorAlert message={error} />}
{success && <SuccessAlert message="Settings saved!" />}
```

### 4. Validate Before Saving
```typescript
const handleSave = async () => {
  // Client-side validation
  if (!validateBusinessHours(hours)) {
    setError("Invalid business hours");
    return;
  }

  // Proceed with save
  await saveSettings();
};
```

### 5. Use Optimistic Updates
```typescript
// Update UI immediately
setLocalState(newValue);

// Then sync with server
try {
  await updateServer(newValue);
} catch {
  // Revert on error
  setLocalState(oldValue);
}
```

---

## 🎓 ADDITIONAL RESOURCES

- **Full Documentation**: `/docs/SPRINT_5_COMPLETION.md`
- **API Specifications**: `/docs/api/settings.md`
- **Component Library**: `/docs/components/`
- **Type Definitions**: `/src/types/settings.ts`

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

*"Settings management made divine."* 🌾⚡