# 🚀 Phase 2 Quick Start Guide

**Date**: December 2024
**Goal**: Get Phase 2 User Management System running

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Update Database Schema

```bash
cd farmers-market

# Open Prisma schema
code prisma/schema.prisma
```

Add the following to your `User` model:

```prisma
model User {
  // ... existing fields ...

  // Approval tracking
  approvedAt       DateTime?
  approvedById     String?

  // Suspension tracking
  suspendedAt      DateTime?
  suspendedById    String?
  suspensionReason String?    @db.Text
  suspensionDuration String?  // TEMPORARY, PERMANENT

  // Login tracking
  lastLoginAt      DateTime?
  loginCount       Int        @default(0)

  // Relations
  auditLogs        AuditLog[] @relation("AuditLogs")
}
```

Add new `AuditLog` model:

```prisma
model AuditLog {
  id            String   @id @default(cuid())
  action        String   // APPROVE_USER, SUSPEND_USER, etc.
  entityType    String   // USER, FARM, PRODUCT
  entityId      String

  performedById String
  performedBy   User     @relation("AuditLogs", fields: [performedById], references: [id])

  oldValue      Json?
  newValue      Json?
  reason        String?  @db.Text

  createdAt     DateTime @default(now())

  @@index([entityType, entityId])
  @@index([performedById])
  @@index([createdAt])
}
```

### Step 2: Run Migration

```bash
npx prisma migrate dev --name add_user_management_fields
npx prisma generate
```

### Step 3: Test API Endpoints

```bash
# Start dev server (if not running)
npm run dev

# In a new terminal, test the API:

# 1. List all users
curl http://localhost:3001/api/admin/users

# 2. Get user details (replace USER_ID with actual ID from list)
curl http://localhost:3001/api/admin/users/USER_ID

# 3. Search for users
curl "http://localhost:3001/api/admin/users?search=admin"
```

---

## 📋 What's Working Now

### ✅ Available API Endpoints

1. **GET `/api/admin/users`** - List users with filters
2. **POST `/api/admin/users`** - Create new user
3. **GET `/api/admin/users/[id]`** - Get user details
4. **PATCH `/api/admin/users/[id]`** - Update user
5. **DELETE `/api/admin/users/[id]`** - Delete user (soft)
6. **POST `/api/admin/users/[id]/approve`** - Approve user
7. **POST `/api/admin/users/[id]/suspend`** - Suspend user
8. **DELETE `/api/admin/users/[id]/suspend`** - Reactivate user

---

## 🎯 Next Steps

### Option A: Test with Postman/Thunder Client

1. Install Thunder Client extension in VS Code
2. Import API collection (create one from endpoints above)
3. Test each endpoint manually

### Option B: Build UI (Recommended)

1. Enhance the Customers page:

   ```bash
   code farmers-market/src/app/admin/customers/page.tsx
   ```

2. Add user management components:
   - User table with filters
   - User detail modal
   - Approval workflow
   - Suspension modal

---

## 📊 Example API Usage

### Search for Farmers

```bash
curl "http://localhost:3001/api/admin/users?role=FARMER&status=ACTIVE"
```

**Response**:

```json
{
  "users": [
    {
      "id": "...",
      "name": "Ana Romana",
      "email": "ana.romana@email.com",
      "role": "FARMER",
      "status": "ACTIVE",
      "_count": {
        "farms": 1,
        "orders": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

### Approve a User

```bash
curl -X POST http://localhost:3001/api/admin/users/USER_ID/approve \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "sendWelcomeEmail": true,
    "notes": "Verified via phone"
  }'
```

### Suspend a User

```bash
curl -X POST http://localhost:3001/api/admin/users/USER_ID/suspend \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "reason": "SPAM",
    "customReason": "Repeatedly posting promotional content",
    "duration": "TEMPORARY",
    "notifyUser": true
  }'
```

---

## 🔧 Troubleshooting

### Database Migration Issues

```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Then re-seed
npx prisma db seed
```

### Authentication Errors

Make sure you're logged in as admin:

1. Visit `http://localhost:3001/admin/login`
2. Use credentials: `admin@farmersmarket.app` / `DivineAdmin123!`
3. Copy session cookie from browser DevTools
4. Include in API requests

### Import Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

---

## 📚 Documentation

- **Full Implementation Plan**: `PHASE_2_IMPLEMENTATION_PLAN.md`
- **Progress Tracker**: `PHASE_2_PROGRESS.md`
- **Feature Roadmap**: `ADMIN_FEATURES_ROADMAP.md`

---

## ✅ Checklist

Before continuing to UI implementation:

- [ ] Database migration ran successfully
- [ ] Prisma client regenerated
- [ ] Dev server restarted
- [ ] Can list users via API
- [ ] Can get user details via API
- [ ] Authentication working
- [ ] No console errors

---

**Status**: 🚧 API Complete - Ready for UI Implementation
**Next**: Build user management UI components
**Timeline**: Days 3-5 for UI, then move to Farm Verification

---

_Generated: December 2024_
_Phase 2 Sprint 1: User Management API ✅ Complete_
