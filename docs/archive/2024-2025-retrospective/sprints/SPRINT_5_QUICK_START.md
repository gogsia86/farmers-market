# 🚀 Sprint 5 Quick Start Guide

**Sprint**: Settings & Configuration  
**Duration**: Week 9-10 (10 business days)  
**Status**: READY TO START  
**Goal**: Build comprehensive settings management system

---

## 📋 TL;DR

Sprint 5 creates a multi-level settings system (user/farm/system) with:
- Type-safe settings management with validation
- Redis-cached settings for performance
- Granular notification preferences (email/SMS/push/in-app)
- Business hours with timezone support
- Settings UI components

**Expected**: 8 technical debt items resolved, ~2,000 lines added, 0 TypeScript errors

---

## 🎯 Quick Overview

### What We're Building

```
┌─────────────────────────────────────┐
│     USER SETTINGS                   │
│  - Notifications (email/SMS/push)   │
│  - Display (theme/language/tz)      │
│  - Privacy (visibility/data)        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     FARM SETTINGS                   │
│  - Business hours (timezone aware)  │
│  - Delivery areas & fees            │
│  - Payment methods                  │
│  - Policies (return/cancellation)   │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     SYSTEM SETTINGS                 │
│  - Platform configuration           │
│  - Feature flags                    │
│  - Admin controls                   │
└─────────────────────────────────────┘
```

### Key Features

1. **Settings Inheritance**: System → Farm → User (hierarchical override)
2. **Multi-Channel Notifications**: Email + SMS + Push + In-App
3. **Timezone-Aware Business Hours**: Accurate open/closed status
4. **Type-Safe Settings**: Full TypeScript support with Zod validation
5. **Redis Caching**: <100ms settings load time
6. **Audit Trail**: Track all settings changes

---

## ⚡ Quick Start (5 Minutes)

### 1. Verify Prerequisites

```bash
# Check Redis is running
docker-compose up -d redis
redis-cli ping  # Should return "PONG"

# Check database connection
npx prisma db pull

# Verify no TypeScript errors
npm run type-check  # Should be 0 errors
```

### 2. Review Architecture

```bash
# Read full kickoff document
cat docs/sprints/SPRINT_5_SETTINGS_CONFIGURATION_KICKOFF.md

# Review existing email preferences (context)
cat src/lib/services/email-preferences.service.ts

# Check database schema
npx prisma studio
```

### 3. Create Feature Branch

```bash
git checkout -b sprint-5/settings-configuration
git push -u origin sprint-5/settings-configuration
```

---

## 📦 Implementation Checklist

### Phase 1: Database Schema (Day 1-2)

```bash
# Add to prisma/schema.prisma
```

**New Models to Create**:
- [ ] `UserSettings` - User preferences (theme, language, timezone, etc.)
- [ ] `NotificationPreferences` - Multi-channel notification settings
- [ ] `FarmSettings` - Farm configuration and policies
- [ ] `BusinessHours` - Operating hours with timezone support
- [ ] `SystemSettings` - Platform-wide key-value settings

**Migration**:
```bash
npx prisma migrate dev --name add_settings_system
npx prisma generate
npm run type-check  # Verify 0 errors
```

**Verification**:
```bash
npx prisma studio  # Visual verification
psql farmers_market_dev -c "\dt"  # List tables
```

---

### Phase 2: Service Layer (Day 3-4)

**Files to Create**:

#### 1. Type Definitions
```typescript
// src/types/settings.ts
export interface UserSettingsData { ... }
export interface FarmSettingsData { ... }
export interface NotificationPreferences { ... }
export interface BusinessHoursData { ... }
```

#### 2. Settings Service
```typescript
// src/lib/services/settings.service.ts
export class SettingsService {
  async getUserSettings(userId: string): Promise<UserSettingsData | null>
  async updateUserSettings(userId: string, updates: UpdateUserSettingsRequest): Promise<UserSettingsData>
  async getFarmSettings(farmId: string): Promise<FarmSettingsData | null>
  async isOpenNow(farmId: string): Promise<boolean>
  async getSystemSetting(key: string): Promise<any>
}
```

#### 3. Validation Logic
```typescript
validateUserSettings(updates: UpdateUserSettingsRequest): SettingsValidationResult
validateBusinessHours(hours: BusinessHoursData[]): SettingsValidationResult
```

**Testing**:
```bash
# Create test file
touch src/lib/services/__tests__/settings.service.test.ts

# Run tests
npm run test -- settings.service.test.ts
```

---

### Phase 3: API Endpoints (Day 5)

**Endpoints to Create**:

#### 1. User Settings
```typescript
// src/app/api/settings/user/route.ts
GET    /api/settings/user       // Get current user settings
PATCH  /api/settings/user       // Update user settings
```

#### 2. Farm Settings
```typescript
// src/app/api/settings/farm/[farmId]/route.ts
GET    /api/settings/farm/[farmId]       // Get farm settings
PATCH  /api/settings/farm/[farmId]       // Update farm settings (owner only)
```

#### 3. System Settings
```typescript
// src/app/api/settings/system/route.ts
GET    /api/settings/system     // Get public system settings
```

**Testing**:
```bash
# Test with curl
curl http://localhost:3000/api/settings/user

# Or use REST client
code tests/api/settings.http
```

---

### Phase 4: UI Components (Day 6-8)

**Components to Create**:

#### 1. Settings Page
```typescript
// src/app/(customer)/settings/page.tsx
export default function SettingsPage() {
  // Tabs: Notifications, Display, Privacy, Account
}
```

#### 2. Settings Components
```typescript
// src/components/settings/NotificationSettings.tsx
// src/components/settings/DisplaySettings.tsx
// src/components/settings/PrivacySettings.tsx
// src/components/settings/BusinessHoursEditor.tsx
```

**UI Framework**:
- Use existing Shadcn UI components (Switch, Select, Input)
- Follow Sprint 4 patterns for form handling
- Implement optimistic updates

---

### Phase 5: Integration & Testing (Day 9)

**Integration Tasks**:
- [ ] Connect notification preferences to email service
- [ ] Test settings inheritance (system → farm → user)
- [ ] Verify timezone conversions
- [ ] Test cache invalidation
- [ ] Performance testing

**Test Coverage**:
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

### Phase 6: Documentation & Deployment (Day 10)

**Documentation**:
- [ ] API endpoint documentation
- [ ] Settings schema documentation
- [ ] User guide (settings UI)
- [ ] Migration guide (from email preferences)

**Deployment Prep**:
- [ ] Environment variables configured
- [ ] Redis cache tested
- [ ] Migration script ready
- [ ] Rollback plan documented

---

## 🗄️ Database Schema Quick Reference

### UserSettings Model
```prisma
model UserSettings {
  id        String   @id @default(cuid())
  userId    String   @unique
  
  // Notification preferences (JSON)
  notificationPreferences Json?
  
  // Display
  theme            String   @default("light")
  language         String   @default("en")
  timezone         String   @default("UTC")
  
  // Privacy
  profileVisibility String   @default("public")
  showEmail         Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### FarmSettings Model
```prisma
model FarmSettings {
  id        String   @id @default(cuid())
  farmId    String   @unique
  
  businessHours BusinessHours[]
  
  // Delivery
  deliveryAreas Json?
  deliveryFee   Float?
  
  // Payment
  acceptedPaymentMethods String[]
  
  // Policies
  returnPolicy       String?
  cancellationPolicy String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### BusinessHours Model
```prisma
model BusinessHours {
  id              String   @id @default(cuid())
  farmSettingsId  String
  
  dayOfWeek       Int      // 0-6 (Sunday-Saturday)
  openTime        String   // "09:00"
  closeTime       String   // "17:00"
  timezone        String   @default("UTC")
  isClosed        Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🎨 API Examples

### Get User Settings
```bash
curl -X GET http://localhost:3000/api/settings/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": { "enabled": true, "frequency": "immediate" },
      "sms": { "enabled": false },
      "push": { "enabled": true, "sound": true }
    },
    "display": {
      "theme": "light",
      "language": "en",
      "timezone": "America/New_York"
    },
    "privacy": {
      "profileVisibility": "public",
      "showEmail": false
    }
  }
}
```

### Update User Settings
```bash
curl -X PATCH http://localhost:3000/api/settings/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display": {
      "theme": "dark",
      "timezone": "America/Los_Angeles"
    }
  }'
```

### Check Farm Open Status
```bash
curl -X GET http://localhost:3000/api/settings/farm/farm-123/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isOpen": true,
    "nextOpenTime": null,
    "nextCloseTime": "2025-01-15T17:00:00Z",
    "timezone": "America/New_York"
  }
}
```

---

## 🔧 Service Usage Examples

### SettingsService

```typescript
import { settingsService } from "@/lib/services/settings.service";

// Get user settings (cached)
const settings = await settingsService.getUserSettings(userId);

// Update settings
const updated = await settingsService.updateUserSettings(userId, {
  display: {
    theme: "dark",
    timezone: "America/Los_Angeles"
  },
  notifications: {
    email: {
      enabled: true,
      frequency: "daily"
    }
  }
});

// Check if farm is open
const isOpen = await settingsService.isOpenNow(farmId);

// Get system setting
const maintenanceMode = await settingsService.getSystemSetting("maintenance_mode");
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// src/lib/services/__tests__/settings.service.test.ts
describe("SettingsService", () => {
  it("should create default settings for new user", async () => {
    const settings = await settingsService.createDefaultUserSettings("user-123");
    expect(settings.display.theme).toBe("system");
    expect(settings.notifications.email.enabled).toBe(true);
  });

  it("should validate timezone", () => {
    const result = settingsService.validateUserSettings({
      display: { timezone: "Invalid/Timezone" }
    });
    expect(result.isValid).toBe(false);
  });

  it("should check business hours correctly", async () => {
    const isOpen = await settingsService.isOpenNow("farm-123");
    expect(typeof isOpen).toBe("boolean");
  });
});
```

### Integration Tests
```typescript
// src/app/api/settings/__tests__/user.test.ts
describe("User Settings API", () => {
  it("should get user settings", async () => {
    const response = await fetch("/api/settings/user");
    expect(response.status).toBe(200);
  });

  it("should update settings", async () => {
    const response = await fetch("/api/settings/user", {
      method: "PATCH",
      body: JSON.stringify({ display: { theme: "dark" } })
    });
    expect(response.status).toBe(200);
  });
});
```

---

## 📊 Performance Targets

### Response Times
- Settings load (cached): **<50ms**
- Settings load (uncached): **<200ms**
- Settings update: **<300ms**
- Cache hit rate: **>90%**

### Caching Strategy
```typescript
// Cache keys
settings:user:{userId}      // TTL: 1 hour
settings:farm:{farmId}      // TTL: 1 hour
settings:system:{key}       // TTL: 24 hours

// Invalidation on update
await redis.del(`settings:user:${userId}`);
await redis.del(`settings:farm:${farmId}`);
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Timezone Confusion
**Problem**: Business hours showing incorrect open/closed status  
**Solution**: Always store and compare in UTC, convert to local for display
```typescript
// ✅ CORRECT
const now = new Date();
const currentTimeUTC = now.toISOString();

// ❌ WRONG
const currentTime = now.toLocaleTimeString();
```

### Pitfall 2: Cache Stale Data
**Problem**: Settings not updating immediately  
**Solution**: Invalidate cache on every update
```typescript
// ✅ CORRECT
await database.userSettings.update({ ... });
await redis.del(`settings:user:${userId}`);

// ❌ WRONG
await database.userSettings.update({ ... });
// Forgot to invalidate cache!
```

### Pitfall 3: Settings Inheritance Not Working
**Problem**: User settings not overriding farm settings  
**Solution**: Merge settings in correct order
```typescript
// ✅ CORRECT
const effectiveSettings = {
  ...systemSettings,
  ...farmSettings,
  ...userSettings,  // Last wins
};
```

---

## 🎯 Success Criteria Checklist

### Functionality ✅
- [ ] User can view and update their settings
- [ ] Farm owners can configure business hours
- [ ] Business hours respect timezone
- [ ] Notification preferences work across all channels
- [ ] Settings inheritance (system → farm → user) works

### Quality ✅
- [ ] 0 TypeScript errors maintained
- [ ] All settings are type-safe
- [ ] Comprehensive validation
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing

### Performance ✅
- [ ] Settings load in <100ms (cached)
- [ ] Cache hit rate >90%
- [ ] API responses <200ms
- [ ] No N+1 queries

### Documentation ✅
- [ ] API endpoints documented
- [ ] Settings schema documented
- [ ] User guide created
- [ ] Code comments complete

---

## 📈 Sprint Metrics

### Technical Debt Resolution
- **Items to Resolve**: 8
- **Current Total**: 40 items
- **Target After Sprint**: 32 items
- **Reduction**: 20%

### Code Addition
- **Estimated Lines**: ~2,000
- **New Files**: ~15
- **Test Files**: ~5
- **Documentation**: ~1,000 lines

### Time Allocation
- Database Schema: 12 hours
- Service Layer: 16 hours
- API Endpoints: 8 hours
- UI Components: 12 hours
- Testing: 10 hours
- Documentation: 6 hours
- **Total**: ~64 hours (~1.5 weeks)

---

## 🔗 Related Resources

### Documentation
- [Sprint 5 Kickoff (Full)](./docs/sprints/SPRINT_5_SETTINGS_CONFIGURATION_KICKOFF.md)
- [Sprint 4 Complete](./SPRINT_4_COMPLETE.md)
- [Technical Debt Status](./docs/current/TECHNICAL_DEBT.md)
- [Email Preferences Service](./src/lib/services/email-preferences.service.ts)

### External References
- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [IANA Timezone Database](https://www.iana.org/time-zones)

---

## 🚀 Daily Progress Template

Copy this to track your progress:

```markdown
## Day X Progress

### Completed ✅
- [ ] Task 1
- [ ] Task 2

### In Progress 🔄
- [ ] Task 3

### Blocked ⚠️
- [ ] Task 4 (reason)

### Questions ❓
- Question 1
- Question 2

### Tomorrow's Plan 📅
- [ ] Task 5
- [ ] Task 6
```

---

## 💬 Support

### Get Help
- **Architecture Questions**: Review Sprint 4 patterns
- **Database Issues**: Check Prisma documentation
- **API Patterns**: See existing API routes
- **Testing**: Follow Jest/Vitest patterns

### Useful Commands
```bash
# Type checking
npm run type-check

# Run specific test
npm run test -- settings.service.test.ts

# Watch mode
npm run test:watch

# Database UI
npx prisma studio

# Redis CLI
redis-cli --scan --pattern "settings:*"

# Clear Redis cache
redis-cli FLUSHALL
```

---

## ✅ Ready to Start!

**Next Steps**:
1. Read full kickoff document
2. Create feature branch
3. Start with database schema
4. Follow implementation checklist
5. Track progress daily

**Remember**:
- Maintain 0 TypeScript errors
- Write tests as you go
- Document everything
- Ask questions early
- Review Sprint 4 patterns

---

**Sprint Status**: 🚀 READY TO START  
**Expected Duration**: 10 business days  
**Expected Outcome**: Complete settings system operational  

Let's build enterprise-grade settings management! 🌾⚡