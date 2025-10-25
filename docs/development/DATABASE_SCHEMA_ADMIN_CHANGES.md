# Database Schema Changes for Admin Dashboard

**Date**: November 2025
**Sprint**: Sprint 9 - Admin Dashboard Implementation
**Status**: ✅ Schema Updated, Prisma Client Generated

---

## 📋 Summary

Successfully updated the Prisma schema to support the Admin Dashboard feature. All changes have been made to `prisma/schema.prisma` and the Prisma client has been regenerated.

---

## 🔧 Changes Made

### 1. **Updated UserRole Enum**

**Location**: Lines 27-33

```prisma
enum UserRole {
  CONSUMER
  FARMER
  ADMIN
  SUPER_ADMIN  // Full system access, can delete users and change settings
  MODERATOR    // Limited admin access, can view and approve but not delete
}
```

**Purpose**: Added two new admin roles for granular permission control:

- `SUPER_ADMIN`: Full system access - can delete users, change settings, perform all admin actions
- `MODERATOR`: Limited admin access - can view and approve but cannot delete

---

### 2. **Added FarmVerificationStatus Enum**

**Location**: Lines 49-53

```prisma
enum FarmVerificationStatus {
  PENDING      // Awaiting admin review
  VERIFIED     // Admin approved
  REJECTED     // Admin rejected
}
```

**Purpose**: Track farm verification workflow status through admin approval process.

---

### 3. **Updated User Model - Admin Approval Fields**

**Location**: Lines 209-216 (after `status` field)

```prisma
// Admin Approval & Suspension Fields
approvedBy       String?   // Admin user ID who approved this user
approvedAt       DateTime? // When user was approved
suspendedBy      String?   // Admin user ID who suspended this user
suspendedAt      DateTime? // When user was suspended
suspensionReason String?   @db.Text // Reason for suspension
```

**Purpose**: Track admin actions on user accounts (approval, suspension) with full audit trail.

**Also Added Relation**:

```prisma
adminActions    AdminAction[]    @relation("AdminActions") // Actions performed by this admin
```

---

### 4. **Updated Farm Model - Verification Fields**

**Location**: Lines 338-343 (after `status` field)

```prisma
// Admin Verification Fields
verificationStatus FarmVerificationStatus @default(PENDING)
verifiedBy         String?   // Admin user ID who verified this farm
verifiedAt         DateTime? // When farm was verified
rejectionReason    String?   @db.Text // Reason for rejection if REJECTED
```

**Purpose**: Track farm verification workflow through admin review process.

---

### 5. **Added AdminActionType Enum**

**Location**: Lines 199-209

```prisma
enum AdminActionType {
  USER_APPROVED
  USER_SUSPENDED
  USER_DELETED
  USER_REACTIVATED
  FARM_VERIFIED
  FARM_REJECTED
  FARM_SUSPENDED
  ORDER_REFUNDED
  PRODUCT_REMOVED
  SETTING_CHANGED
  ANNOUNCEMENT_CREATED
}
```

**Purpose**: Define all types of admin actions for comprehensive audit logging.

---

### 6. **Created AdminAction Model**

**Location**: Lines 344-370

```prisma
model AdminAction {
  id          String          @id @default(cuid())
  type        AdminActionType // Type of admin action performed
  adminId     String          // Admin who performed the action
  admin       User            @relation("AdminActions", fields: [adminId], references: [id])

  // Target Information
  targetId    String?         // ID of affected entity (user, farm, order, etc.)
  targetType  String?         @db.VarChar(50) // "User", "Farm", "Order", "Product"

  // Action Details
  description String          @db.Text // Human-readable description
  metadata    Json?           // Additional structured data (old values, new values, etc.)

  // Audit Trail
  ipAddress   String?         @db.VarChar(45) // IPv6 max length
  userAgent   String?         @db.VarChar(500)
  createdAt   DateTime        @default(now())

  @@index([adminId])
  @@index([type])
  @@index([createdAt])
  @@index([targetId, targetType])
  @@map("admin_actions")
}
```

**Purpose**: Complete audit log for all admin actions with full context and metadata.

**Key Features**:

- Tracks who performed action (`adminId`)
- What action was performed (`type`)
- What was affected (`targetId`, `targetType`)
- When it happened (`createdAt`)
- How it happened (`ipAddress`, `userAgent`)
- Additional context (`metadata` JSON field)

---

## 📊 Database Tables Affected

| Table           | Changes                                                   | Impact                                    |
| --------------- | --------------------------------------------------------- | ----------------------------------------- |
| `users`         | Added 6 new fields for admin approval/suspension tracking | Enables admin user management workflow    |
| `farms`         | Added 4 new fields for verification tracking              | Enables admin farm approval workflow      |
| `admin_actions` | NEW TABLE                                                 | Complete audit trail of all admin actions |

---

## 🎯 Business Capabilities Enabled

1. **Granular Admin Permissions**

   - Super admins can perform all actions
   - Moderators can review/approve but not delete
   - Clear role hierarchy

2. **User Management**

   - Admins can approve new users
   - Admins can suspend problematic users
   - Full audit trail of who did what

3. **Farm Verification**

   - Farms start as PENDING
   - Admins verify or reject with reasons
   - Track verification history

4. **Comprehensive Audit Logging**
   - Every admin action recorded
   - IP address and user agent captured
   - Metadata field for detailed context
   - Fast queries by admin, type, date, or target

---

## 📈 Schema Statistics

- **New Enums**: 2 (FarmVerificationStatus, AdminActionType)
- **Updated Enums**: 1 (UserRole)
- **Updated Models**: 2 (User, Farm)
- **New Models**: 1 (AdminAction)
- **New Fields**: 15 total
- **New Indexes**: 4 (on AdminAction model)
- **Total Schema Lines**: 1,035 (from 979)

---

## ✅ Validation Completed

- [x] Prisma schema syntax valid (no errors)
- [x] Enum values defined correctly
- [x] Foreign key relations configured
- [x] Indexes added for query performance
- [x] Field types appropriate (String?, DateTime?, Json?)
- [x] Comments added for developer clarity
- [x] Prisma client regenerated successfully

---

## 🚀 Next Steps

1. **Create Database Migration**

   ```bash
   cd farmers-market
   npx prisma migrate dev --name add_admin_features
   ```

2. **Seed Admin User**

   - Update `prisma/seed.ts` to create test admin user
   - Run `npx prisma db seed`

3. **Implement Admin Authentication**

   - Update NextAuth configuration
   - Create admin login page
   - Add middleware protection

4. **Build Admin UI**
   - Admin layout with sidebar
   - Dashboard with stats
   - User/farm management pages

---

## 📚 Related Documentation

- **Spec**: `docs/planning/product/admin-dashboard-spec.md` (Lines 77-173 - Database Schema)
- **Sprint**: `docs/planning/execution/sprint-backlog.md` (Sprint 9 - Admin Dashboard)
- **Architecture**: `docs/planning/technical/architecture.md`

---

## 🔍 Database Migration Preview

When migration is run, the following SQL will be generated:

**Add columns to `users` table**:

```sql
ALTER TABLE users ADD COLUMN approvedBy TEXT;
ALTER TABLE users ADD COLUMN approvedAt TIMESTAMP;
ALTER TABLE users ADD COLUMN suspendedBy TEXT;
ALTER TABLE users ADD COLUMN suspendedAt TIMESTAMP;
ALTER TABLE users ADD COLUMN suspensionReason TEXT;
```

**Update UserRole enum**:

```sql
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';
```

**Create FarmVerificationStatus enum**:

```sql
CREATE TYPE "FarmVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
```

**Add columns to `farms` table**:

```sql
ALTER TABLE farms ADD COLUMN verificationStatus "FarmVerificationStatus" DEFAULT 'PENDING';
ALTER TABLE farms ADD COLUMN verifiedBy TEXT;
ALTER TABLE farms ADD COLUMN verifiedAt TIMESTAMP;
ALTER TABLE farms ADD COLUMN rejectionReason TEXT;
```

**Create admin_actions table**:

```sql
CREATE TABLE admin_actions (
  id TEXT PRIMARY KEY,
  type "AdminActionType" NOT NULL,
  adminId TEXT NOT NULL REFERENCES users(id),
  targetId TEXT,
  targetType VARCHAR(50),
  description TEXT NOT NULL,
  metadata JSONB,
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_adminId ON admin_actions(adminId);
CREATE INDEX idx_admin_actions_type ON admin_actions(type);
CREATE INDEX idx_admin_actions_createdAt ON admin_actions(createdAt);
CREATE INDEX idx_admin_actions_target ON admin_actions(targetId, targetType);
```

---

**Status**: ✅ Schema changes complete. Ready for migration.
**Last Updated**: November 21, 2025 (Sprint 9, Day 1)
