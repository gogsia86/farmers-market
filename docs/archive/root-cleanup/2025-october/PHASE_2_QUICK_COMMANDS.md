# ⚡ Phase 2 Sprint 1: Quick Commands

## 🎯 Current Status

- ✅ API Endpoints: Created (8 endpoints)
- ⏳ Database Migration: Ready to run
- ⏳ UI Implementation: Pending

---

## 📋 Step-by-Step Commands

### Step 1: Update Prisma Schema (5 minutes)

```bash
# Open schema file
code farmers-market/prisma/schema.prisma

# Follow the instructions in:
# PRISMA_SCHEMA_UPDATES_COPY_PASTE.md

# Add User Management fields to users model
# Add audit_logs model
```

### Step 2: Run Migration (2 minutes)

```bash
cd farmers-market

# Run migration
npx prisma migrate dev --name add_user_management_fields

# You should see:
# ✔ Generated Prisma Client
# ✔ The migration has been applied
```

### Step 3: Verify Database (2 minutes)

```bash
# Open Prisma Studio
npx prisma studio

# Check:
# 1. users table → New columns visible
# 2. audit_logs table → Exists
# 3. Existing data intact
```

### Step 4: Test API Endpoints (5 minutes)

```bash
# Make sure dev server is running
npm run dev

# Test list users endpoint
curl http://localhost:3001/api/admin/users

# Test user details
curl http://localhost:3001/api/admin/users/USER_ID_HERE

# Test approval (replace USER_ID)
curl -X POST http://localhost:3001/api/admin/users/USER_ID_HERE/approve \
  -H "Content-Type: application/json" \
  -d '{"sendWelcomeEmail": true, "notes": "Testing Phase 2"}'
```

### Step 5: Check Audit Logs

```bash
# In Prisma Studio, check audit_logs table
# Should see entry for user approval
```

---

## 🚀 If Everything Works

### Next: Build User Management UI

**File to enhance**: `src/app/admin/customers/page.tsx`

**What to add:**

1. User table with search and filters
2. User detail modal
3. Approval modal
4. Suspension modal

**Reference documentation:**

- `PHASE_2_IMPLEMENTATION_PLAN.md` - Complete UI specs
- `PHASE_2_PROGRESS.md` - API examples

---

## 🆘 Troubleshooting

### Migration fails

```bash
# Check Prisma version
npx prisma --version

# Force regenerate
npx prisma generate

# Try db push instead (dev only)
npx prisma db push
```

### API returns errors

```bash
# Clear Next.js cache
rm -rf .next

# Restart server
npm run dev
```

### Cannot connect to database

```bash
# Check PostgreSQL is running
# Verify .env.local has DATABASE_URL

# Test connection
npx prisma db pull
```

---

## ✅ Success Checklist

Mark these as you complete them:

- [ ] Schema updated with new fields
- [ ] Migration created and applied
- [ ] Prisma Studio shows new columns
- [ ] API returns users with new fields
- [ ] Can approve a user via API
- [ ] Audit log entry created
- [ ] Ready to build UI

---

## 📚 Documentation Files

**Migration:**

- `PHASE_2_DATABASE_MIGRATION_GUIDE.md` - Detailed guide
- `PRISMA_SCHEMA_UPDATES_COPY_PASTE.md` - Copy/paste code
- This file - Quick commands

**Implementation:**

- `PHASE_2_IMPLEMENTATION_PLAN.md` - Full roadmap
- `PHASE_2_PROGRESS.md` - API documentation
- `PHASE_2_QUICK_START.md` - Setup guide

---

## 🎬 Ready? Start Here:

```bash
# 1. Update schema (5 min)
code farmers-market/prisma/schema.prisma
# Follow PRISMA_SCHEMA_UPDATES_COPY_PASTE.md

# 2. Run migration (2 min)
cd farmers-market
npx prisma migrate dev --name add_user_management_fields

# 3. Verify (2 min)
npx prisma studio

# 4. Test API (5 min)
curl http://localhost:3001/api/admin/users
```

**Total time**: 15 minutes to complete database setup! ⚡

---

**Status**: Ready to execute Phase 2 Sprint 1! 🚀
