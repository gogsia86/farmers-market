# 🗄️ Phase 2: Database Migration Guide

## Step 1: Update Prisma Schema

Add these fields and model to your `prisma/schema.prisma` file:

### A. Add User Management Fields to `users` model

Find the `users` model and add these fields **after the existing fields** (before the relations section):

```prisma
model users {
  // ... existing fields ...

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

  // Activity tracking (lastLoginAt and loginCount already exist!)
  // lastLoginAt      DateTime?  // ✅ Already exists
  // loginCount       Int        @default(0)  // ✅ Already exists

  // Audit trail relations
  auditLogs        audit_logs[] @relation("AuditLogPerformedBy")
  approvalsGiven   users[]     @relation("UserApprovals")
  suspensionsGiven users[]     @relation("UserSuspensions")

  // ... existing relations (accounts, cart_items, etc.) ...
}
```

### B. Create New `audit_logs` Model

Add this **new model** at the end of your schema file (before the enums):

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

## Step 2: Run the Migration

### Option A: Generate Migration (Recommended for Production)

```bash
cd farmers-market

# Create migration
npx prisma migrate dev --name add_user_management_fields

# This will:
# 1. Create SQL migration file
# 2. Apply migration to database
# 3. Regenerate Prisma Client

# Verify migration worked
npx prisma studio
```

### Option B: Prototype/Development Only

```bash
cd farmers-market

# Push schema changes directly (no migration history)
npx prisma db push

# Regenerate Prisma Client
npx prisma generate
```

## Step 3: Verify Database Changes

### Using Prisma Studio

```bash
npx prisma studio
```

**Check:**

1. Open `users` table → Verify new columns: `approvedAt`, `approvedById`, `suspendedAt`, `suspendedById`, `suspensionReason`, `suspensionDuration`
2. Check for `audit_logs` table → Should exist with all columns
3. Verify existing data still intact

### Using SQL Query (Optional)

```sql
-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check audit_logs table exists
SELECT COUNT(*) FROM audit_logs;
```

## Step 4: Test the API Endpoints

### 1. List Users (with new fields)

```bash
curl http://localhost:3001/api/admin/users
```

**Expected Response:**

```json
{
  "users": [
    {
      "id": "...",
      "email": "admin@farmersmarket.app",
      "firstName": "Mile",
      "lastName": "Mochwara",
      "role": "ADMIN",
      "status": "ACTIVE",
      "approvedAt": null, // ✅ New field
      "suspendedAt": null, // ✅ New field
      "lastLoginAt": "...",
      "loginCount": 5
    }
  ],
  "pagination": { "total": 9, "page": 1, "limit": 20 }
}
```

### 2. Approve a User

```bash
# Get a user ID first
USER_ID="USER_ID_HERE"

# Approve user
curl -X POST http://localhost:3001/api/admin/users/$USER_ID/approve \
  -H "Content-Type: application/json" \
  -d '{
    "sendWelcomeEmail": true,
    "notes": "Approved during Phase 2 testing"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "User approved successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "approvedAt": "2025-10-21T...", // ✅ Now populated
    "approvedById": "ADMIN_ID",
    "status": "ACTIVE"
  }
}
```

### 3. Check Audit Logs

```bash
# View audit logs in Prisma Studio
npx prisma studio
# Navigate to audit_logs table
```

**You should see:**

- Action: "USER_APPROVED"
- Entity Type: "USER"
- Performed By: Admin user ID
- Old Value: {"status": "PENDING"}
- New Value: {"status": "ACTIVE", "approvedAt": "..."}

## Step 5: Restart Development Server

```bash
# The migration might require a server restart
npm run dev
```

## Common Issues & Solutions

### Issue 1: Migration Fails - "Column already exists"

**Cause:** Fields were manually added before

**Solution:**

```bash
# Reset database (DEVELOPMENT ONLY!)
npx prisma migrate reset

# Or create a new migration that handles existing data
npx prisma migrate dev --create-only --name fix_user_management
# Edit the generated SQL file to add IF NOT EXISTS checks
# Then apply: npx prisma migrate deploy
```

### Issue 2: Relation Error - "Self-relation"

**Cause:** Prisma self-relations require specific naming

**Solution:** Make sure the relation fields match exactly:

```prisma
approvedBy       users?   @relation("UserApprovals", fields: [approvedById], references: [id])
approvalsGiven   users[]  @relation("UserApprovals")
```

### Issue 3: API Returns 500 Error

**Cause:** Prisma Client not regenerated

**Solution:**

```bash
npx prisma generate
npm run dev
```

### Issue 4: Cannot Read Property of undefined

**Cause:** Old Prisma Client cached

**Solution:**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

## Rollback Plan (If Needed)

### If Migration Fails

```bash
# View migration history
npx prisma migrate status

# Rollback last migration (if supported by your Prisma version)
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Or reset and start fresh (DEVELOPMENT ONLY!)
npx prisma migrate reset
npx prisma db seed
```

## Success Checklist ✅

- [ ] Prisma schema updated with new fields
- [ ] Migration created and applied successfully
- [ ] Prisma Client regenerated
- [ ] `users` table has new columns (check with Prisma Studio)
- [ ] `audit_logs` table created
- [ ] API endpoint returns new fields
- [ ] Can approve a user successfully
- [ ] Audit log entry created
- [ ] Development server restarted
- [ ] No console errors

## Next Steps

After successful migration:

1. **Build User Management UI** (Days 1-3)
   - Enhance `src/app/admin/customers/page.tsx`
   - Create user detail modal
   - Add approval/suspension workflows

2. **Test End-to-End** (Day 3)
   - Search and filter users
   - Approve pending users
   - Suspend active users
   - Reactivate suspended users
   - Verify audit logs

3. **Continue to Sprint 2** (Week 2)
   - Farm Verification System
   - Similar pattern: API → Migration → UI

---

**Ready to proceed?** Run the migration and let's build the UI! 🚀
