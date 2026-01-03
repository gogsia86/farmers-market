# 🌾 Sprint 5: Settings & Configuration - Kickoff Document

**Sprint Duration**: Week 9-10 (10 business days)  
**Sprint Goal**: Build comprehensive settings management system and configuration framework  
**Status**: 🚀 READY TO START  
**Created**: January 2025  
**Last Updated**: January 2025

---

## 📋 Executive Summary

Sprint 5 focuses on building a robust settings and configuration management system for the Farmers Market Platform. This sprint will create the foundation for user preferences, business configuration, and system settings management.

### What We're Building

1. **Settings Database Schema** - Multi-level settings storage (user, farm, system)
2. **Settings Service Layer** - Type-safe settings management with validation
3. **Configuration API** - RESTful endpoints for settings CRUD operations
4. **Settings UI Components** - Reusable settings management interfaces
5. **Business Hours System** - Farm operating hours with timezone support
6. **Notification Preferences** - Granular notification control beyond email
7. **Payment Method Storage** - Secure payment preferences management

### Sprint Context

- **Builds On**: Sprint 4 (Email Enhancements)
- **Enables**: User customization, farm configuration, admin controls
- **Technical Debt Addressed**: 8 items (~14% reduction)
- **Expected Code Addition**: ~2,000 lines

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Settings Infrastructure** ✅
   - Create multi-tenant settings architecture
   - Implement hierarchical configuration (system → farm → user)
   - Build type-safe settings service with validation
   - Add settings caching layer

2. **User Preferences** ✅
   - Notification preferences (email, SMS, push, in-app)
   - Display preferences (theme, language, timezone)
   - Privacy settings (profile visibility, data sharing)
   - Communication preferences (contact methods, frequency)

3. **Farm Configuration** ✅
   - Business hours with timezone support
   - Delivery area configuration
   - Payment methods and terms
   - Farm policies (return, cancellation)

4. **System Settings** ✅
   - Platform-wide configuration
   - Feature flags system
   - Admin-controlled settings
   - Environment-specific overrides

### Success Criteria

**Functionality** ✅

- [ ] All settings CRUD operations work correctly
- [ ] Settings inheritance (system → farm → user) functions properly
- [ ] Business hours support multiple time zones
- [ ] Notification preferences integrate with existing email system
- [ ] Payment method storage is PCI-compliant

**Quality** ✅

- [ ] 0 TypeScript errors maintained
- [ ] 100% type safety for all settings
- [ ] Comprehensive input validation
- [ ] Settings changes are auditable

**Performance** ✅

- [ ] Settings queries cached (Redis/memory)
- [ ] Settings load in <100ms
- [ ] Batch updates supported
- [ ] Optimistic UI updates

**Documentation** ✅

- [ ] Settings schema documented
- [ ] API endpoints documented
- [ ] Settings UI patterns documented
- [ ] Migration guide for existing preferences

---

## 📊 Current State Analysis

### What We Have (From Sprint 4)

**Email Preferences System** ✅

```typescript
// src/lib/services/email-preferences.service.ts
interface EmailPreferences {
  userId: string;
  farmUpdates: boolean;
  orderConfirmation: boolean;
  newsletter: boolean;
  // ... 15 email types
}
```

**Strengths**:

- ✅ Email-specific preferences working
- ✅ Token-based unsubscribe functional
- ✅ Integration with email service
- ✅ Type-safe implementation

**Limitations**:

- ❌ Only covers email notifications
- ❌ No SMS/push notification settings
- ❌ No display/UI preferences
- ❌ No farm business configuration
- ❌ No system-wide settings

### What We Need (Sprint 5)

**Comprehensive Settings System** 🎯

1. **Multi-Level Settings Architecture**

```typescript
// System Settings (platform-wide)
interface SystemSettings {
  platformName: string;
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
  // ...
}

// Farm Settings (per-farm)
interface FarmSettings {
  farmId: string;
  businessHours: BusinessHours[];
  deliveryAreas: DeliveryArea[];
  paymentMethods: PaymentMethod[];
  policies: FarmPolicies;
  // ...
}

// User Settings (per-user)
interface UserSettings {
  userId: string;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacySettings;
  // ...
}
```

2. **Settings Inheritance**

```typescript
// User settings override farm settings override system settings
const effectiveSettings = {
  ...systemSettings,
  ...farmSettings,
  ...userSettings,
};
```

3. **Business Hours with Timezone Support**

```typescript
interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  timezone: string; // "America/New_York"
  isClosed: boolean;
}
```

4. **Granular Notification Preferences**

```typescript
interface NotificationPreferences {
  email: EmailChannelSettings;
  sms: SMSChannelSettings;
  push: PushChannelSettings;
  inApp: InAppChannelSettings;
}

interface EmailChannelSettings {
  enabled: boolean;
  frequency: "immediate" | "daily" | "weekly";
  quietHours: { start: string; end: string };
  types: EmailTypePreferences; // Existing email prefs
}
```

---

## 🏗️ Technical Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  Settings UI Components, Forms, Toggles, Time Pickers       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js)                      │
│  /api/settings/user, /api/settings/farm,                    │
│  /api/settings/system, /api/settings/business-hours         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                              │
│  SettingsService, BusinessHoursService,                     │
│  NotificationPreferencesService                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  CACHING LAYER (Redis)                       │
│  settings:{userId}, settings:{farmId}, settings:system       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE LAYER (Prisma)                       │
│  UserSettings, FarmSettings, SystemSettings,                │
│  BusinessHours, NotificationPreferences                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Read Settings**:

   ```
   UI → API → Service → Cache (hit) → Return
                      ↓
                      Cache (miss) → Database → Cache → Return
   ```

2. **Update Settings**:

   ```
   UI → API → Service → Validate → Database → Invalidate Cache → Return
   ```

3. **Settings Inheritance**:
   ```
   System Settings (base) → Farm Settings (override) → User Settings (final)
   ```

---

## 📦 Deliverables

### P5.1: Database Schema Updates ✅ PRIORITY 1

**Estimated Effort**: 6 hours  
**Dependencies**: None

#### New Models

```prisma
// ============================================
// USER SETTINGS
// ============================================
model UserSettings {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Notification Preferences
  notificationPreferences Json? // NotificationPreferences type

  // Display Preferences
  theme            String   @default("light") // "light" | "dark" | "system"
  language         String   @default("en")
  timezone         String   @default("UTC")
  distanceUnit     String   @default("miles") // "miles" | "kilometers"
  currency         String   @default("USD")

  // Privacy Settings
  profileVisibility String   @default("public") // "public" | "friends" | "private"
  showEmail         Boolean  @default(false)
  showPhone         Boolean  @default(false)
  allowMessaging    Boolean  @default(true)
  dataSharing       Boolean  @default(false)

  // Communication Preferences
  contactMethod     String   @default("email") // "email" | "sms" | "both"
  communicationFrequency String @default("normal") // "minimal" | "normal" | "all"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("user_settings")
}

// ============================================
// NOTIFICATION PREFERENCES (Granular)
// ============================================
model NotificationPreferences {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Email Channel
  emailEnabled        Boolean @default(true)
  emailFrequency      String  @default("immediate") // "immediate" | "daily" | "weekly"
  emailQuietHoursStart String? // "22:00"
  emailQuietHoursEnd   String? // "08:00"

  // SMS Channel
  smsEnabled          Boolean @default(false)
  smsFrequency        String  @default("immediate")
  smsQuietHoursStart  String?
  smsQuietHoursEnd    String?

  // Push Notifications
  pushEnabled         Boolean @default(true)
  pushFrequency       String  @default("immediate")
  pushQuietHoursStart String?
  pushQuietHoursEnd   String?

  // In-App Notifications
  inAppEnabled        Boolean @default(true)
  inAppSound          Boolean @default(true)
  inAppBadge          Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("notification_preferences")
}

// ============================================
// FARM SETTINGS
// ============================================
model FarmSettings {
  id        String   @id @default(cuid())
  farmId    String   @unique
  farm      Farm     @relation(fields: [farmId], references: [id], onDelete: Cascade)

  // Business Configuration
  businessHours BusinessHours[]

  // Delivery Configuration
  deliveryAreas Json? // DeliveryArea[] type
  deliveryFee   Float?
  minOrderValue Float?

  // Payment Configuration
  acceptedPaymentMethods String[] // ["CARD", "CASH", "CHECK"]
  requireDepositOnOrders Boolean  @default(false)
  depositPercentage      Float?

  // Policies
  returnPolicy       String?
  cancellationPolicy String?
  termsAndConditions String?

  // Features
  enablePreOrders    Boolean @default(false)
  enableSubscriptions Boolean @default(false)
  enableGiftCards    Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([farmId])
  @@map("farm_settings")
}

// ============================================
// BUSINESS HOURS
// ============================================
model BusinessHours {
  id            String   @id @default(cuid())
  farmSettingsId String
  farmSettings  FarmSettings @relation(fields: [farmSettingsId], references: [id], onDelete: Cascade)

  dayOfWeek     Int      // 0-6 (Sunday-Saturday)
  openTime      String   // "09:00"
  closeTime     String   // "17:00"
  timezone      String   @default("UTC")
  isClosed      Boolean  @default(false)

  // Seasonal overrides
  effectiveFrom DateTime?
  effectiveTo   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([farmSettingsId, dayOfWeek])
  @@index([farmSettingsId])
  @@map("business_hours")
}

// ============================================
// SYSTEM SETTINGS
// ============================================
model SystemSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  type      String   // "string" | "number" | "boolean" | "json"
  category  String   // "platform" | "feature" | "security" | "integration"

  description String?
  isPublic    Boolean  @default(false) // Can be read by frontend
  isEditable  Boolean  @default(true)  // Can be changed via UI

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@index([isPublic])
  @@map("system_settings")
}
```

#### Migration Script

```bash
# Create migration
npx prisma migrate dev --name add_settings_system

# Apply to database
npx prisma migrate deploy
```

---

### P5.2: Settings Service Layer ✅ PRIORITY 2

**Estimated Effort**: 12 hours  
**Dependencies**: P5.1 (Database Schema)

#### Type Definitions

```typescript
// src/types/settings.ts

// ============================================
// USER SETTINGS TYPES
// ============================================
export interface NotificationChannelSettings {
  enabled: boolean;
  frequency: "immediate" | "daily" | "weekly" | "never";
  quietHours?: {
    start: string; // "22:00"
    end: string; // "08:00"
  };
}

export interface NotificationPreferences {
  email: NotificationChannelSettings;
  sms: NotificationChannelSettings;
  push: NotificationChannelSettings & {
    sound: boolean;
    badge: boolean;
  };
  inApp: NotificationChannelSettings;
}

export interface DisplayPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  distanceUnit: "miles" | "kilometers";
  currency: string;
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showEmail: boolean;
  showPhone: boolean;
  allowMessaging: boolean;
  dataSharing: boolean;
}

export interface UserSettingsData {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacySettings;
  contactMethod: "email" | "sms" | "both";
  communicationFrequency: "minimal" | "normal" | "all";
}

// ============================================
// FARM SETTINGS TYPES
// ============================================
export interface BusinessHoursData {
  dayOfWeek: number; // 0-6
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  timezone: string;
  isClosed: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface DeliveryArea {
  zipCode?: string;
  city?: string;
  radius?: number; // miles/km
  deliveryFee?: number;
}

export interface FarmPolicies {
  returnPolicy?: string;
  cancellationPolicy?: string;
  termsAndConditions?: string;
}

export interface FarmSettingsData {
  businessHours: BusinessHoursData[];
  deliveryAreas: DeliveryArea[];
  deliveryFee?: number;
  minOrderValue?: number;
  acceptedPaymentMethods: string[];
  requireDepositOnOrders: boolean;
  depositPercentage?: number;
  policies: FarmPolicies;
  features: {
    enablePreOrders: boolean;
    enableSubscriptions: boolean;
    enableGiftCards: boolean;
  };
}

// ============================================
// SYSTEM SETTINGS TYPES
// ============================================
export interface SystemSettingData {
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json";
  category: "platform" | "feature" | "security" | "integration";
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================
export interface UpdateUserSettingsRequest {
  notifications?: Partial<NotificationPreferences>;
  display?: Partial<DisplayPreferences>;
  privacy?: Partial<PrivacySettings>;
  contactMethod?: "email" | "sms" | "both";
  communicationFrequency?: "minimal" | "normal" | "all";
}

export interface UpdateFarmSettingsRequest {
  businessHours?: BusinessHoursData[];
  deliveryAreas?: DeliveryArea[];
  deliveryFee?: number;
  minOrderValue?: number;
  acceptedPaymentMethods?: string[];
  requireDepositOnOrders?: boolean;
  depositPercentage?: number;
  policies?: Partial<FarmPolicies>;
  features?: Partial<FarmSettingsData["features"]>;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}
```

#### Settings Service Implementation

```typescript
// src/lib/services/settings.service.ts

import { database } from "@/lib/database";
import { redis } from "@/lib/redis";
import type {
  UserSettingsData,
  UpdateUserSettingsRequest,
  SettingsValidationResult,
} from "@/types/settings";

const CACHE_TTL = 3600; // 1 hour

export class SettingsService {
  // ============================================
  // USER SETTINGS
  // ============================================

  async getUserSettings(userId: string): Promise<UserSettingsData | null> {
    // Check cache first
    const cacheKey = `settings:user:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const settings = await database.userSettings.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!settings) {
      return null;
    }

    // Transform to UserSettingsData
    const userSettings: UserSettingsData = {
      notifications: settings.notificationPreferences as any,
      display: {
        theme: settings.theme as any,
        language: settings.language,
        timezone: settings.timezone,
        distanceUnit: settings.distanceUnit as any,
        currency: settings.currency,
      },
      privacy: {
        profileVisibility: settings.profileVisibility as any,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        allowMessaging: settings.allowMessaging,
        dataSharing: settings.dataSharing,
      },
      contactMethod: settings.contactMethod as any,
      communicationFrequency: settings.communicationFrequency as any,
    };

    // Cache for future requests
    await redis.set(cacheKey, JSON.stringify(userSettings), { ex: CACHE_TTL });

    return userSettings;
  }

  async createDefaultUserSettings(userId: string): Promise<UserSettingsData> {
    const settings = await database.userSettings.create({
      data: {
        userId,
        theme: "system",
        language: "en",
        timezone: "UTC",
        distanceUnit: "miles",
        currency: "USD",
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        allowMessaging: true,
        dataSharing: false,
        contactMethod: "email",
        communicationFrequency: "normal",
        notificationPreferences: {
          email: {
            enabled: true,
            frequency: "immediate",
          },
          sms: {
            enabled: false,
            frequency: "immediate",
          },
          push: {
            enabled: true,
            frequency: "immediate",
            sound: true,
            badge: true,
          },
          inApp: {
            enabled: true,
            frequency: "immediate",
          },
        },
      },
    });

    return this.getUserSettings(userId) as Promise<UserSettingsData>;
  }

  async updateUserSettings(
    userId: string,
    updates: UpdateUserSettingsRequest,
  ): Promise<UserSettingsData> {
    // Validate updates
    const validation = this.validateUserSettings(updates);
    if (!validation.isValid) {
      throw new Error(
        `Invalid settings: ${validation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    // Build update data
    const updateData: any = {};

    if (updates.display) {
      Object.assign(updateData, updates.display);
    }

    if (updates.privacy) {
      Object.assign(updateData, updates.privacy);
    }

    if (updates.contactMethod) {
      updateData.contactMethod = updates.contactMethod;
    }

    if (updates.communicationFrequency) {
      updateData.communicationFrequency = updates.communicationFrequency;
    }

    if (updates.notifications) {
      // Merge with existing notifications
      const existing = await this.getUserSettings(userId);
      updateData.notificationPreferences = {
        ...(existing?.notifications || {}),
        ...updates.notifications,
      };
    }

    // Update database
    await database.userSettings.update({
      where: { userId },
      data: updateData,
    });

    // Invalidate cache
    await redis.del(`settings:user:${userId}`);

    return this.getUserSettings(userId) as Promise<UserSettingsData>;
  }

  validateUserSettings(
    updates: UpdateUserSettingsRequest,
  ): SettingsValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    // Validate timezone
    if (updates.display?.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: updates.display.timezone });
      } catch {
        errors.push({
          field: "display.timezone",
          message: "Invalid timezone",
        });
      }
    }

    // Validate quiet hours
    if (updates.notifications?.email?.quietHours) {
      const { start, end } = updates.notifications.email.quietHours;
      if (!this.isValidTimeString(start) || !this.isValidTimeString(end)) {
        errors.push({
          field: "notifications.email.quietHours",
          message: "Invalid time format (use HH:MM)",
        });
      }
    }

    // Warning: Disabling all notifications
    if (updates.notifications) {
      const allDisabled = Object.values(updates.notifications).every(
        (channel) => channel.enabled === false,
      );
      if (allDisabled) {
        warnings.push({
          field: "notifications",
          message: "All notification channels are disabled",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private isValidTimeString(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  // ============================================
  // FARM SETTINGS
  // ============================================

  async getFarmSettings(farmId: string): Promise<FarmSettingsData | null> {
    const cacheKey = `settings:farm:${farmId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const settings = await database.farmSettings.findUnique({
      where: { farmId },
      include: {
        businessHours: true,
      },
    });

    if (!settings) {
      return null;
    }

    const farmSettings: FarmSettingsData = {
      businessHours: settings.businessHours.map((bh) => ({
        dayOfWeek: bh.dayOfWeek,
        openTime: bh.openTime,
        closeTime: bh.closeTime,
        timezone: bh.timezone,
        isClosed: bh.isClosed,
        effectiveFrom: bh.effectiveFrom || undefined,
        effectiveTo: bh.effectiveTo || undefined,
      })),
      deliveryAreas: (settings.deliveryAreas as any) || [],
      deliveryFee: settings.deliveryFee || undefined,
      minOrderValue: settings.minOrderValue || undefined,
      acceptedPaymentMethods: settings.acceptedPaymentMethods,
      requireDepositOnOrders: settings.requireDepositOnOrders,
      depositPercentage: settings.depositPercentage || undefined,
      policies: {
        returnPolicy: settings.returnPolicy || undefined,
        cancellationPolicy: settings.cancellationPolicy || undefined,
        termsAndConditions: settings.termsAndConditions || undefined,
      },
      features: {
        enablePreOrders: settings.enablePreOrders,
        enableSubscriptions: settings.enableSubscriptions,
        enableGiftCards: settings.enableGiftCards,
      },
    };

    await redis.set(cacheKey, JSON.stringify(farmSettings), { ex: CACHE_TTL });

    return farmSettings;
  }

  async isOpenNow(farmId: string, timezone?: string): Promise<boolean> {
    const settings = await this.getFarmSettings(farmId);
    if (!settings) {
      return false;
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || settings.businessHours[0]?.timezone || "UTC",
    });

    const todayHours = settings.businessHours.find(
      (bh) => bh.dayOfWeek === dayOfWeek,
    );

    if (!todayHours || todayHours.isClosed) {
      return false;
    }

    return (
      currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
    );
  }

  // ============================================
  // SYSTEM SETTINGS
  // ============================================

  async getSystemSetting(key: string): Promise<any> {
    const cacheKey = `settings:system:${key}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const setting = await database.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    await redis.set(cacheKey, JSON.stringify(setting.value), { ex: CACHE_TTL });

    return setting.value;
  }

  async getPublicSystemSettings(): Promise<Record<string, any>> {
    const settings = await database.systemSettings.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
      },
    });

    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}

export const settingsService = new SettingsService();
```

---

### P5.3: Settings API Endpoints ✅ PRIORITY 3

**Estimated Effort**: 8 hours  
**Dependencies**: P5.2 (Service Layer)

#### User Settings API

```typescript
// src/app/api/settings/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsService } from "@/lib/services/settings.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    let settings = await settingsService.getUserSettings(session.user.id);

    // Create default if not exists
    if (!settings) {
      settings = await settingsService.createDefaultUserSettings(
        session.user.id,
      );
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch settings",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const updates = await request.json();

    const settings = await settingsService.updateUserSettings(
      session.user.id,
      updates,
    );

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update settings",
      },
      { status: 400 },
    );
  }
}
```

#### Farm Settings API

```typescript
// src/app/api/settings/farm/[farmId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsService } from "@/lib/services/settings.service";
import { database } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } },
) {
  try {
    const settings = await settingsService.getFarmSettings(params.farmId);

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Farm settings not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching farm settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch farm settings",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { farmId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: params.farmId },
      select: { ownerId: true },
    });

    if (!farm || farm.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const updates = await request.json();

    // Update logic here (implement in service)
    // const settings = await settingsService.updateFarmSettings(params.farmId, updates);

    return NextResponse.json({
      success: true,
      message: "Farm settings updated",
    });
  } catch (error) {
    console.error("Error updating farm settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update farm settings",
      },
      { status: 400 },
    );
  }
}
```

#### System Settings API

```typescript
// src/app/api/settings/system/route.ts
import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/lib/services/settings.service";

// Public system settings (no auth required)
export async function GET(request: NextRequest) {
  try {
    const settings = await settingsService.getPublicSystemSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch system settings",
      },
      { status: 500 },
    );
  }
}
```

---

### P5.4: Settings UI Components ✅ PRIORITY 4

**Estimated Effort**: 10 hours  
**Dependencies**: P5.3 (API Endpoints)

#### Settings Page Layout

```typescript
// src/app/(customer)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DisplaySettings } from "@/components/settings/DisplaySettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="display">
          <DisplaySettings />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="account">
          <div>Account settings coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### Notification Settings Component

```typescript
// src/components/settings/NotificationSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function NotificationSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/user");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (path: string[], value: any) => {
    setSaving(true);
    try {
      const updates = buildUpdateObject(path, value);
      const response = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        toast({
          title: "Success",
          description: "Settings updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Manage how you receive notifications from the platform.
        </p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Notifications</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="email-enabled">Enable email notifications</Label>
          <Switch
            id="email-enabled"
            checked={settings?.notifications?.email?.enabled}
            onCheckedChange={(checked) =>
              updateSetting(["notifications", "email", "enabled"], checked)
            }
            disabled={saving}
          />
        </div>

        {/* More email settings... */}
      </div>

      {/* SMS Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">SMS Notifications</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="sms-enabled">Enable SMS notifications</Label>
          <Switch
            id="sms-enabled"
            checked={settings?.notifications?.sms?.enabled}
            onCheckedChange={(checked) =>
              updateSetting(["notifications", "sms", "enabled"], checked)
            }
            disabled={saving}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Push Notifications</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="push-enabled">Enable push notifications</Label>
          <Switch
            id="push-enabled"
            checked={settings?.notifications?.push?.enabled}
            onCheckedChange={(checked) =>
              updateSetting(["notifications", "push", "enabled"], checked)
            }
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}

function buildUpdateObject(path: string[], value: any): any {
  const result: any = {};
  let current = result;

  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = {};
    current = current[path[i]];
  }

  current[path[path.length - 1]] = value;
  return result;
}
```

---

## 🧪 Testing Strategy

### Unit Tests

**Priority**: HIGH  
**Estimated Effort**: 6 hours

```typescript
// src/lib/services/__tests__/settings.service.test.ts

import { settingsService } from "../settings.service";
import { database } from "@/lib/database";

describe("SettingsService", () => {
  describe("getUserSettings", () => {
    it("should return user settings", async () => {
      const settings = await settingsService.getUserSettings("user-123");
      expect(settings).toBeDefined();
      expect(settings?.display.theme).toBe("light");
    });

    it("should return null for non-existent user", async () => {
      const settings = await settingsService.getUserSettings("non-existent");
      expect(settings).toBeNull();
    });
  });

  describe("validateUserSettings", () => {
    it("should validate timezone", () => {
      const result = settingsService.validateUserSettings({
        display: { timezone: "America/New_York" },
      });
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid timezone", () => {
      const result = settingsService.validateUserSettings({
        display: { timezone: "Invalid/Timezone" },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("isOpenNow", () => {
    it("should check business hours correctly", async () => {
      // Mock farm with business hours
      const isOpen = await settingsService.isOpenNow("farm-123");
      expect(typeof isOpen).toBe("boolean");
    });
  });
});
```

### Integration Tests

**Priority**: MEDIUM  
**Estimated Effort**: 4 hours

```typescript
// src/app/api/settings/__tests__/user.test.ts

import { GET, PATCH } from "../user/route";
import { auth } from "@/lib/auth";

jest.mock("@/lib/auth");

describe("User Settings API", () => {
  beforeEach(() => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    });
  });

  describe("GET /api/settings/user", () => {
    it("should return user settings", async () => {
      const request = new Request("http://localhost/api/settings/user");
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it("should require authentication", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request("http://localhost/api/settings/user");
      const response = await GET(request as any);

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/settings/user", () => {
    it("should update settings", async () => {
      const request = new Request("http://localhost/api/settings/user", {
        method: "PATCH",
        body: JSON.stringify({
          display: { theme: "dark" },
        }),
      });

      const response = await PATCH(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
```

---

## 📚 Documentation Requirements

### Code Documentation

- [x] JSDoc comments for all public methods
- [x] Type definitions with descriptions
- [x] Validation error messages
- [x] Cache key documentation

### User Documentation

- [ ] Settings overview guide
- [ ] Notification preferences guide
- [ ] Business hours setup guide
- [ ] Privacy settings explanation

### Technical Documentation

- [ ] Settings architecture diagram
- [ ] Settings inheritance flow
- [ ] API endpoint reference
- [ ] Migration guide from email preferences

---

## 🔧 Environment Setup

### Environment Variables

```env
# Redis (for settings cache)
REDIS_URL=redis://localhost:6379

# Feature flags
FEATURE_SETTINGS_V2=true
FEATURE_SMS_NOTIFICATIONS=false
FEATURE_PUSH_NOTIFICATIONS=true
```

---

## 📊 Success Metrics

### Technical Metrics

- [ ] 0 TypeScript errors maintained
- [ ] Settings load in <100ms (cached)
- [ ] Settings API response time <200ms
- [ ] Cache hit rate >90%

### Functional Metrics

- [ ] All settings CRUD operations work
- [ ] Settings inheritance works correctly
- [ ] Business hours timezone conversion accurate
- [ ] Notification preferences integrate with email system

### Business Metrics

- [ ] User engagement with settings page
- [ ] Notification opt-out rate
- [ ] Farm business hours completion rate

---

## ⚠️ Risks & Mitigation

### Risk 1: Settings Migration Complexity

**Impact**: MEDIUM  
**Likelihood**: MEDIUM

**Mitigation**:

- Create migration script for existing email preferences
- Test migration with subset of users first
- Provide rollback mechanism
- Document migration process

### Risk 2: Cache Invalidation Issues

**Impact**: MEDIUM  
**Likelihood**: LOW

**Mitigation**:

- Use consistent cache key patterns
- Implement cache versioning
- Add manual cache flush endpoint
- Monitor cache hit/miss rates

### Risk 3: Timezone Handling Complexity

**Impact**: HIGH  
**Likelihood**: MEDIUM

**Mitigation**:

- Use established timezone libraries (date-fns-tz)
- Validate timezone strings
- Test with multiple timezones
- Provide timezone selection UI

---

## 🗓️ Implementation Timeline

### Week 1: Foundation (Days 1-5)

**Day 1-2**: Database Schema & Migration

- Create Prisma schema updates
- Write migration script
- Test migration locally
- Document schema changes

**Day 3-4**: Service Layer

- Implement SettingsService
- Add validation logic
- Write unit tests
- Add caching layer

**Day 5**: API Endpoints

- Create user settings API
- Create farm settings API
- Create system settings API
- Test API endpoints

### Week 2: UI & Polish (Days 6-10)

**Day 6-7**: UI Components

- Build settings page layout
- Create notification settings UI
- Create display settings UI
- Create privacy settings UI

**Day 8**: Business Hours UI

- Build business hours editor
- Add timezone selector
- Test with multiple timezones

**Day 9**: Integration & Testing

- Integration tests
- End-to-end testing
- Performance testing
- Bug fixes

**Day 10**: Documentation & Deployment

- Complete documentation
- Deployment preparation
- Sprint review
- Sprint retrospective

---

## 🎯 Sprint Completion Criteria

### Core Functionality ✅

- [ ] All settings models created and migrated
- [ ] Settings service layer implemented
- [ ] All API endpoints functional
- [ ] Settings UI components working
- [ ] Cache layer operational

### Quality Standards ✅

- [ ] 0 TypeScript errors
- [ ] All new code type-safe
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code reviewed and approved

### Documentation ✅

- [ ] Settings schema documented
- [ ] API endpoints documented
- [ ] Service methods documented
- [ ] User guide created

### Production Ready ✅

- [ ] Environment variables configured
- [ ] Redis cache working
- [ ] Migration tested
- [ ] Performance validated

---

## 📖 Related Documentation

### Previous Sprints

- [Sprint 4: Email Enhancements Complete](./SPRINT_4_EMAIL_ENHANCEMENTS_COMPLETE.md)
- [Sprint 3: Email Notifications Complete](./SPRINT_3_EMAIL_NOTIFICATIONS_COMPLETE.md)
- [Technical Debt Journey Summary](../../TECHNICAL_DEBT_JOURNEY_SUMMARY.md)

### Technical References

- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)

---

## 🚀 Getting Started

### Step 1: Review Sprint Plan

```bash
# Read this document thoroughly
cat docs/sprints/SPRINT_5_SETTINGS_CONFIGURATION_KICKOFF.md
```

### Step 2: Set Up Environment

```bash
# Ensure Redis is running
docker-compose up -d redis

# Verify connection
redis-cli ping
```

### Step 3: Create Database Schema

```bash
# Review Prisma schema changes
git diff prisma/schema.prisma

# Create migration
npx prisma migrate dev --name add_settings_system

# Verify migration
npx prisma studio
```

### Step 4: Start Development

```bash
# Create feature branch
git checkout -b sprint-5/settings-configuration

# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch
```

---

## 📞 Support & Resources

### Questions?

- Architecture decisions: Review [TECHNICAL_DEBT.md](../../docs/current/TECHNICAL_DEBT.md)
- Implementation patterns: See Sprint 4 code examples
- Database queries: Check existing services

### Useful Commands

```bash
# Check TypeScript errors
npm run type-check

# Run all tests
npm run test

# Check Prisma schema
npx prisma validate

# View database in UI
npx prisma studio

# Check Redis cache
redis-cli --scan --pattern "settings:*"
```

---

## ✅ Final Notes

Sprint 5 builds comprehensive settings infrastructure that will serve as the foundation for user customization, farm configuration, and system administration. This sprint focuses on:

1. **Type Safety** - All settings are strongly typed
2. **Performance** - Redis caching for fast access
3. **Scalability** - Multi-level settings architecture
4. **User Experience** - Intuitive settings UI

**Expected Outcomes**:

- ✅ Complete settings system operational
- ✅ 8 technical debt items resolved
- ✅ ~2,000 lines of production-ready code
- ✅ Zero TypeScript errors maintained
- ✅ Comprehensive documentation

Let's build enterprise-grade settings management! 🌾⚡

---

**Sprint Status**: 🚀 READY TO START  
**Next Review**: Day 5 (Mid-Sprint Check-in)  
**Sprint Demo**: Day 10

**Previous Sprint**: [Sprint 4 Complete](../../SPRINT_4_COMPLETE.md)  
**Technical Debt Status**: [40 items remaining](../../docs/current/TECHNICAL_DEBT.md)
