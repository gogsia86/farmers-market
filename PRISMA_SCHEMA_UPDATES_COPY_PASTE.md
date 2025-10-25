# 📋 Prisma Schema Updates - Copy & Paste Ready

## Instructions

1. Open `farmers-market/prisma/schema.prisma`
2. Find the `users` model
3. Add the new fields (Section A)
4. Add the new `audit_logs` model at the end (Section B)
5. Save the file
6. Run migration command

---

## Section A: Add to `users` Model

**Location:** Inside the `users` model, after `updatedAt` and before the relations section

```prisma
  // ===== USER MANAGEMENT FIELDS (Phase 2) =====
  // Approval tracking
  approvedAt       DateTime?
  approvedById     String?
  approvedBy       users?   @relation("UserApprovals", fields: [approvedById], references: [id], onDelete: SetNull)

  // Suspension tracking
  suspendedAt      DateTime?
  suspendedById    String?
  suspendedBy      users?   @relation("UserSuspensions", fields: [suspendedById], references: [id], onDelete: SetNull)
  suspensionReason String?  @db.Text
  suspensionDuration String? // "TEMPORARY" or "PERMANENT"

  // Audit trail relations (add to relations section)
  auditLogs        audit_logs[] @relation("AuditLogPerformedBy")
  approvalsGiven   users[]     @relation("UserApprovals")
  suspensionsGiven users[]     @relation("UserSuspensions")
```

**Full `users` model should look like this:**

```prisma
model users {
  id                      String              @id @default(cuid())
  email                   String              @unique @db.VarChar(255)
  password                String?             @db.VarChar(255)
  firstName               String?             @db.VarChar(100)
  lastName                String?             @db.VarChar(100)
  phone                   String?             @db.VarChar(20)
  avatar                  String?             @db.VarChar(500)
  role                    UserRole            @default(CONSUMER)
  status                  UserStatus          @default(ACTIVE)
  emailVerified           Boolean             @default(false)
  emailVerifiedAt         DateTime?
  phoneVerified           Boolean             @default(false)
  phoneVerifiedAt         DateTime?
  verificationToken       String?             @unique @db.VarChar(255)
  verificationExpiry      DateTime?
  resetToken              String?             @unique @db.VarChar(255)
  resetTokenExpiry        DateTime?
  dietaryPreferences      Json?
  notificationPreferences Json?
  privacySettings         Json?
  lastLoginAt             DateTime?
  lastLoginIP             String?             @db.VarChar(45)
  loginCount              Int                 @default(0)
  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt

  // ===== USER MANAGEMENT FIELDS (Phase 2) =====
  // Approval tracking
  approvedAt       DateTime?
  approvedById     String?
  approvedBy       users?   @relation("UserApprovals", fields: [approvedById], references: [id], onDelete: SetNull)

  // Suspension tracking
  suspendedAt      DateTime?
  suspendedById    String?
  suspendedBy      users?   @relation("UserSuspensions", fields: [suspendedById], references: [id], onDelete: SetNull)
  suspensionReason String?  @db.Text
  suspensionDuration String? // "TEMPORARY" or "PERMANENT"

  // Relations
  accounts                accounts[]
  cart_items              cart_items[]
  farm_team_members       farm_team_members[]
  farms                   farms[]
  messages                messages[]
  notifications           notifications[]
  orders                  orders[]
  quality_issues          quality_issues[]
  reviews                 reviews[]
  sessions                sessions[]
  user_addresses          user_addresses[]
  auditLogs               audit_logs[]        @relation("AuditLogPerformedBy")
  approvalsGiven          users[]             @relation("UserApprovals")
  suspensionsGiven        users[]             @relation("UserSuspensions")

  @@index([createdAt])
  @@index([email])
  @@index([role, status])
}
```

---

## Section B: New `audit_logs` Model

**Location:** Add this **entire new model** before the enums section (after all other models)

```prisma
model audit_logs {
  id            String   @id @default(cuid())
  action        String   @db.VarChar(100)
  entityType    String   @db.VarChar(50)
  entityId      String   @db.VarChar(255)
  performedById String
  performedBy   users    @relation("AuditLogPerformedBy", fields: [performedById], references: [id], onDelete: Cascade)
  oldValue      Json?
  newValue      Json?
  reason        String?  @db.Text
  ipAddress     String?  @db.VarChar(45)
  userAgent     String?  @db.Text
  createdAt     DateTime @default(now())

  @@index([entityType, entityId])
  @@index([performedById])
  @@index([createdAt])
  @@index([action])
}
```

---

## Migration Command

After saving the schema file, run:

```bash
cd farmers-market
npx prisma migrate dev --name add_user_management_fields
```

This will:

1. Generate SQL migration
2. Apply to database
3. Regenerate Prisma Client

---

## Verification

```bash
# Open database viewer
npx prisma studio

# Check users table for new columns:
# - approvedAt, approvedById, suspendedAt, suspendedById,
# - suspensionReason, suspensionDuration

# Check audit_logs table exists
```

---

## Quick Test

```bash
# Test API endpoint
curl http://localhost:3001/api/admin/users

# Should return users with new fields (null values initially)
```

---

**That's it!** Schema is ready for Phase 2 User Management. 🎉
