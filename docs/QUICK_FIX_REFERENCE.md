# 🚨 Quick Fix Reference - Database Seeding Issues

> **Quick troubleshooting guide for common seeding errors**

---

## 🔥 Common Errors & Instant Fixes

### 1. "Column does not exist" Error

```bash
# Error: column farms.payoutSchedule does not exist
# Fix: Add missing column
docker exec farmers-market-db-dev psql -U farmers_user -d farmers_market \
  -c "ALTER TABLE farms ADD COLUMN IF NOT EXISTS \"payoutSchedule\" JSONB;"
```

### 2. "Module not found" Error

```bash
# Error: Cannot find module '@prisma/client/runtime/library'
# Fix: Regenerate Prisma client
npx prisma generate
```

### 3. "SASL: client password must be a string"

```bash
# Error: Database connection failed
# Fix: Set DATABASE_URL in .env
echo 'DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market"' >> .env
```

### 4. "Connection refused" Error

```bash
# Error: connect ECONNREFUSED ::1:5432
# Fix: Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres-dev
```

### 5. "Unknown argument stockQuantity"

```typescript
// Error: Field doesn't exist
// Fix: Change field name
stockQuantity: 50,  // ❌ Wrong
quantityAvailable: 50,  // ✅ Correct
```

### 6. "Invalid value for argument category"

```typescript
// Error: HERBS is not a valid ProductCategory
// Fix: Use valid enum value
category: "HERBS",        // ❌ Wrong
category: "VEGETABLES",   // ✅ Correct
```

---

## ⚡ One-Command Fixes

### Full Reset & Reseed

```bash
npx prisma migrate reset --force && npm run seed
```

### Fix Missing Columns

```bash
docker exec farmers-market-db-dev psql -U farmers_user -d farmers_market \
  -c "ALTER TABLE farms ADD COLUMN IF NOT EXISTS \"payoutSchedule\" JSONB;"
```

### Regenerate Everything

```bash
npx prisma generate && npm run seed
```

### Check Database Status

```bash
docker ps | grep postgres && npx prisma migrate status
```

---

## 📋 Pre-Seeding Checklist

- [ ] PostgreSQL is running: `docker ps | grep postgres`
- [ ] .env file has DATABASE_URL set
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Prisma client generated: `npx prisma generate`

---

## 🎯 Valid Enum Values

### ProductCategory

```
VEGETABLES | FRUITS | DAIRY | EGGS | MEAT | POULTRY |
SEAFOOD | PANTRY | BEVERAGES | BAKED_GOODS |
PREPARED_FOODS | FLOWERS | OTHER
```

### UserRole

```
FARMER | CONSUMER | ADMIN
```

### FarmStatus

```
PENDING | ACTIVE | SUSPENDED | INACTIVE
```

---

## 🔧 Type Conversions

### Coordinates & Decimals

```typescript
// ❌ WRONG
latitude: "40.0150";
price: "6.99";

// ✅ CORRECT
import { Prisma } from "@prisma/client";
latitude: new Prisma.Decimal(40.015);
price: new Prisma.Decimal(6.99);
```

---

## 🚀 Quick Commands

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# Run seed
npm run seed

# Check health
npm run bot:check

# Start dev server
npm run dev
```

---

## 🆘 Emergency Reset

```bash
# Nuclear option - destroys all data
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev
npx prisma migrate deploy
npx prisma generate
npm run seed
```

---

## 📞 Test Credentials

```
Farmers:
  farmer1@example.com / password123
  farmer2@example.com / password123
  farmer3@example.com / password123

Customer:
  customer@example.com / password123

Admin:
  admin@example.com / password123
```

---

**Quick Link**: [Full Documentation](./SEEDING_COMPLETE.md)
