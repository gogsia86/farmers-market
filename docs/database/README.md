# 🗄️ Database Documentation

> **Complete Prisma, PostgreSQL, and database management documentation**
>
> Your comprehensive resource for database operations, schema management, and Prisma patterns

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Directory Contents](#directory-contents)
- [Database Architecture](#database-architecture)
- [Schema Reference](#schema-reference)
- [Common Database Operations](#common-database-operations)
- [Prisma Patterns](#prisma-patterns)
- [Migrations](#migrations)
- [Seeding](#seeding)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

### Purpose

This directory contains all database-related documentation including:

- **Prisma 7** setup and configuration
- Database schema documentation
- Migration guides and strategies
- Performance optimization patterns
- Seeding and test data
- Database upgrade procedures

### Technology Stack

```yaml
ORM: Prisma 7 (latest stable)
Database: PostgreSQL 16+
Connection Pooling: Prisma Connection Pool
Migration Tool: Prisma Migrate
Schema Language: Prisma Schema Language (PSL)
Type Generation: Automatic TypeScript types
```

### Philosophy

**Database Excellence**

- Use canonical database import (`@/lib/database`)
- Never create multiple Prisma instances
- Optimize queries for performance
- Maintain referential integrity
- Follow agricultural consciousness in data modeling
- Enterprise-grade reliability (⭐⭐⭐⭐⭐)

### Who Should Use This

- 👨‍💻 **Backend Developers** - Database operations and queries
- 🗄️ **Database Administrators** - Schema management and optimization
- 🚀 **DevOps Engineers** - Database deployment and migrations
- 🧪 **QA Engineers** - Test data and database setup
- 🏗️ **Architects** - Data modeling and schema design

---

## ⚡ Quick Start

### For New Developers

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit DATABASE_URL in .env.local

# 3. Create database
createdb farmers_market_dev

# 4. Run migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Seed database with test data
npm run seed

# 7. Open Prisma Studio
npx prisma studio
```

### For Experienced Developers

```bash
# Quick database reset
npx prisma migrate reset --force

# View data visually
npx prisma studio

# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy
```

---

## 📚 Directory Contents

### Overview

```
database/
├── README.md (this file)                        # 📖 Navigation hub
│
├── DATABASE_SETUP_GUIDE.md                      # 🎯 Primary setup guide
├── DATABASE-SETUP-GUIDE.md                      # 📚 Alternative setup
├── DATABASE_SETUP.md                            # 🚀 Quick setup
├── DATABASE_AND_AUTH_SETUP_GUIDE.md             # 🔐 DB + Auth setup
│
├── DATABASE_SCHEMA.md                           # 📊 Schema overview
├── SCHEMA_REFERENCE.md                          # 📑 Complete schema ref
├── schema.production.reference.md               # 🏭 Production schema
├── DATABASE_SCHEMA_ADMIN_CHANGES.md             # 🔄 Schema changes
│
├── PRISMA_7_README.md                           # ✨ Prisma 7 overview
├── PRISMA_7_UPGRADE_GUIDE.md                    # 🆙 Upgrade guide
├── PRISMA_7_UPGRADE_ANALYSIS.md                 # 📊 Upgrade analysis
├── PRISMA_7_RISK_ASSESSMENT.md                  # ⚠️  Risk assessment
├── PRISMA_7_PHASE_6_STAGING_GUIDE.md            # 🎬 Staging guide
│
├── DATABASE_PERFORMANCE_INDEXES.md              # ⚡ Performance indexes
├── DATABASE-FIX-SUMMARY.md                      # 🔧 Fix history
├── DATABASE-SETUP-SUCCESS.md                    # ✅ Setup success
│
└── ../prisma/
    ├── schema.prisma                            # 🎯 Schema definition
    ├── migrations/                              # 📦 Migration history
    └── seed*.ts                                 # 🌱 Seed files

Total: 15 documentation files
```

---

## 🏗️ Database Architecture

### Canonical Database Access Pattern

```typescript
// ✅ CORRECT - Use canonical database import
import { database } from "@/lib/database";

// Usage in service layer
export class FarmService {
  async getFarms() {
    return await database.farm.findMany({
      include: { owner: true, products: true },
    });
  }
}

// ❌ WRONG - Never create new Prisma instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // DON'T DO THIS!
```

**Why This Matters:**

- ✅ Prevents connection pool exhaustion
- ✅ Ensures proper middleware execution
- ✅ Maintains consistent logging and tracing
- ✅ Follows singleton pattern

**Reference:** `docs/development/CRITICAL_FILES_REFERENCE.md`

---

### Database Singleton Implementation

```typescript
// lib/database.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const database =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}
```

**Features:**

- Singleton pattern prevents multiple instances
- Development query logging
- Production error logging only
- Hot reload safe (Next.js)

---

### Connection Architecture

```
┌─────────────────────────────────────────┐
│        Next.js Application              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Application Code               │   │
│  │  (Services, API Routes)         │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  Database Singleton             │   │
│  │  (@/lib/database)               │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  Prisma Client                  │   │
│  │  (Generated from schema)        │   │
│  └──────────────┬──────────────────┘   │
└─────────────────┼───────────────────────┘
                  │
                  │ Connection Pool
                  │ (Max: 10 connections)
                  │
┌─────────────────▼───────────────────────┐
│        PostgreSQL Database              │
│        (farmers_market_dev/prod)        │
└─────────────────────────────────────────┘
```

---

## 📊 Schema Reference

### Core Models Overview

```prisma
// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          Role      @default(CUSTOMER)
  passwordHash  String

  // Relations
  farms         Farm[]
  orders        Order[]
  reviews       Review[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Farm Management (Agricultural Core)
model Farm {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  location      Json      // { address, coordinates, region }

  // Agricultural Consciousness
  certifications String[]
  practiceType   String?  // "organic", "biodynamic", "conventional"
  seasonalInfo   Json?

  // Relations
  owner         User      @relation(fields: [ownerId], references: [id])
  ownerId       String
  products      Product[]

  status        FarmStatus @default(PENDING_VERIFICATION)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([ownerId])
  @@index([status])
}

// Product Catalog (Seasonal Awareness)
model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String
  description   String?

  // Pricing & Inventory
  price         Decimal   @db.Decimal(10, 2)
  unit          String    // "lb", "oz", "bunch", "dozen"
  inventory     Int       @default(0)

  // Agricultural Data
  category      String
  seasonality   String[]  // ["SPRING", "SUMMER", "FALL", "WINTER"]
  harvestDate   DateTime?

  // Relations
  farm          Farm      @relation(fields: [farmId], references: [id])
  farmId        String
  orderItems    OrderItem[]

  status        ProductStatus @default(ACTIVE)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([farmId, slug])
  @@index([farmId])
  @@index([category])
  @@index([status])
}

// Order Processing
model Order {
  id            String    @id @default(cuid())
  orderNumber   String    @unique

  // Customer
  customer      User      @relation(fields: [customerId], references: [id])
  customerId    String

  // Order Details
  items         OrderItem[]
  totalAmount   Decimal   @db.Decimal(10, 2)
  status        OrderStatus @default(PENDING)

  // Delivery
  deliveryAddress Json
  deliveryDate    DateTime?
  notes           String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([customerId])
  @@index([status])
  @@index([createdAt])
}

// Order Items (Join Table with Details)
model OrderItem {
  id            String    @id @default(cuid())

  order         Order     @relation(fields: [orderId], references: [id])
  orderId       String

  product       Product   @relation(fields: [productId], references: [id])
  productId     String

  quantity      Int
  priceAtTime   Decimal   @db.Decimal(10, 2)
  subtotal      Decimal   @db.Decimal(10, 2)

  createdAt     DateTime  @default(now())

  @@index([orderId])
  @@index([productId])
}

// Enums
enum Role {
  ADMIN
  FARMER
  CUSTOMER
}

enum FarmStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  INACTIVE
}

enum ProductStatus {
  ACTIVE
  OUT_OF_STOCK
  SEASONAL
  DISCONTINUED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  READY
  DELIVERED
  CANCELLED
}
```

**Total Models:** 15+ (including Review, Payment, Notification, etc.)

**Reference:** `SCHEMA_REFERENCE.md` for complete schema

---

## 🛠️ Common Database Operations

### Query Patterns

#### 1. Simple Query

```typescript
// Find all active farms
const farms = await database.farm.findMany({
  where: { status: "ACTIVE" },
  include: {
    owner: true,
    products: { where: { status: "ACTIVE" } },
  },
});
```

#### 2. Filtered Query with Pagination

```typescript
// Search farms with pagination
const farms = await database.farm.findMany({
  where: {
    name: { contains: searchTerm, mode: "insensitive" },
    status: "ACTIVE",
  },
  include: { owner: true },
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: "desc" },
});

// Get total count for pagination
const total = await database.farm.count({
  where: {
    /* same where clause */
  },
});
```

#### 3. Complex Query with Multiple Relations

```typescript
// Get order with all details
const order = await database.order.findUnique({
  where: { id: orderId },
  include: {
    customer: { select: { id: true, name: true, email: true } },
    items: {
      include: {
        product: {
          include: { farm: true },
        },
      },
    },
  },
});
```

#### 4. Aggregation Query

```typescript
// Get farm statistics
const stats = await database.product.groupBy({
  by: ["farmId"],
  where: { status: "ACTIVE" },
  _count: { id: true },
  _sum: { inventory: true },
  _avg: { price: true },
});
```

---

### Create Operations

#### 1. Simple Create

```typescript
const farm = await database.farm.create({
  data: {
    name: "Sunshine Farm",
    slug: "sunshine-farm",
    ownerId: userId,
    location: {
      address: "123 Farm Rd",
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
  },
});
```

#### 2. Create with Nested Relations

```typescript
const order = await database.order.create({
  data: {
    orderNumber: generateOrderNumber(),
    customerId: userId,
    totalAmount: 50.0,
    deliveryAddress: {
      /* address data */
    },
    items: {
      create: [
        {
          productId: "prod_1",
          quantity: 2,
          priceAtTime: 10.0,
          subtotal: 20.0,
        },
        {
          productId: "prod_2",
          quantity: 3,
          priceAtTime: 10.0,
          subtotal: 30.0,
        },
      ],
    },
  },
  include: { items: true },
});
```

#### 3. Bulk Create (Multiple Records)

```typescript
const products = await database.product.createMany({
  data: [
    { name: "Tomatoes", farmId, price: 5.0, unit: "lb" },
    { name: "Cucumbers", farmId, price: 3.0, unit: "lb" },
    { name: "Lettuce", farmId, price: 4.0, unit: "bunch" },
  ],
  skipDuplicates: true, // Skip if unique constraint fails
});
```

---

### Update Operations

#### 1. Simple Update

```typescript
const farm = await database.farm.update({
  where: { id: farmId },
  data: { status: "ACTIVE" },
});
```

#### 2. Update with Increment

```typescript
// Decrease inventory after purchase
const product = await database.product.update({
  where: { id: productId },
  data: {
    inventory: { decrement: quantity },
  },
});
```

#### 3. Conditional Update (Upsert)

```typescript
// Create or update
const farm = await database.farm.upsert({
  where: { slug: "sunshine-farm" },
  update: { name: "New Name" },
  create: {
    slug: "sunshine-farm",
    name: "Sunshine Farm",
    ownerId: userId,
  },
});
```

---

### Delete Operations

#### 1. Simple Delete

```typescript
await database.product.delete({
  where: { id: productId },
});
```

#### 2. Bulk Delete

```typescript
// Delete all inactive products
const result = await database.product.deleteMany({
  where: { status: "DISCONTINUED" },
});

console.log(`Deleted ${result.count} products`);
```

#### 3. Cascade Delete (via Schema)

```prisma
// In schema.prisma
model Farm {
  products Product[] // Will cascade delete if configured
}

model Product {
  farm   Farm   @relation(fields: [farmId], references: [id], onDelete: Cascade)
  farmId String
}
```

---

### Transaction Operations

#### 1. Sequential Transaction

```typescript
import { database } from "@/lib/database";

const result = await database.$transaction(async (tx) => {
  // 1. Create order
  const order = await tx.order.create({
    data: {
      /* order data */
    },
  });

  // 2. Update inventory for each product
  for (const item of orderItems) {
    await tx.product.update({
      where: { id: item.productId },
      data: { inventory: { decrement: item.quantity } },
    });
  }

  // 3. Create notification
  await tx.notification.create({
    data: {
      /* notification data */
    },
  });

  return order;
});
```

#### 2. Batch Transaction

```typescript
// All or nothing
const [order, ...updates] = await database.$transaction([
  database.order.create({ data: orderData }),
  database.product.update({
    where: { id: prod1 },
    data: { inventory: { decrement: 2 } },
  }),
  database.product.update({
    where: { id: prod2 },
    data: { inventory: { decrement: 1 } },
  }),
]);
```

---

## 🔄 Migrations

### Migration Workflow

```bash
# 1. Create new migration (development)
npx prisma migrate dev --name add_farm_certifications

# 2. Apply migrations (production)
npx prisma migrate deploy

# 3. Check migration status
npx prisma migrate status

# 4. Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

---

### Migration Best Practices

#### 1. Always Create Named Migrations

```bash
# ✅ GOOD - Descriptive name
npx prisma migrate dev --name add_seasonal_product_fields

# ❌ BAD - Generic name
npx prisma migrate dev
```

#### 2. Review Migration SQL Before Applying

```bash
# Generate migration without applying
npx prisma migrate dev --create-only --name your_migration

# Review generated SQL
cat prisma/migrations/TIMESTAMP_your_migration/migration.sql

# Apply if looks good
npx prisma migrate dev
```

#### 3. Test Migrations in Staging First

```bash
# Staging environment
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Verify in staging
# Then deploy to production
```

#### 4. Handle Data Migrations Carefully

```sql
-- migration.sql
-- Step 1: Add new column (nullable)
ALTER TABLE "Farm" ADD COLUMN "newField" TEXT;

-- Step 2: Backfill data
UPDATE "Farm" SET "newField" = 'default_value' WHERE "newField" IS NULL;

-- Step 3: Make non-nullable (if needed)
ALTER TABLE "Farm" ALTER COLUMN "newField" SET NOT NULL;
```

---

### Common Migration Scenarios

#### Adding a New Model

```prisma
// schema.prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int
  comment   String?
  farmId    String
  farm      Farm     @relation(fields: [farmId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([farmId])
  @@index([userId])
}
```

```bash
npx prisma migrate dev --name add_review_model
```

#### Adding a Field to Existing Model

```prisma
model Farm {
  // ... existing fields
  certifications String[] @default([]) // New field
}
```

```bash
npx prisma migrate dev --name add_farm_certifications
```

#### Renaming a Field (with data preservation)

```bash
# Create migration without applying
npx prisma migrate dev --create-only --name rename_farm_description

# Edit migration.sql to preserve data
# ALTER TABLE "Farm" RENAME COLUMN "description" TO "bio";

# Apply migration
npx prisma migrate dev
```

---

## 🌱 Seeding

### Seed Scripts

```bash
# Quick seed (essential data only)
npm run seed

# Comprehensive seed (full test data)
npm run seed:comprehensive

# Custom seed script
tsx prisma/seed-custom.ts
```

---

### Seed Script Example

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@farmersmarket.com" },
    update: {},
    create: {
      email: "admin@farmersmarket.com",
      name: "Admin User",
      role: "ADMIN",
      passwordHash: await hash("admin123", 10),
    },
  });

  console.log("✅ Created admin user");

  // 2. Create farmer user
  const farmer = await prisma.user.upsert({
    where: { email: "farmer@example.com" },
    update: {},
    create: {
      email: "farmer@example.com",
      name: "John Farmer",
      role: "FARMER",
      passwordHash: await hash("farmer123", 10),
    },
  });

  console.log("✅ Created farmer user");

  // 3. Create farm
  const farm = await prisma.farm.upsert({
    where: { slug: "sunshine-organic-farm" },
    update: {},
    create: {
      name: "Sunshine Organic Farm",
      slug: "sunshine-organic-farm",
      description: "Family-owned organic farm since 1995",
      ownerId: farmer.id,
      location: {
        address: "123 Farm Road, Valley, CA 95000",
        coordinates: { lat: 37.7749, lng: -122.4194 },
        region: "Bay Area",
      },
      certifications: ["USDA Organic", "Certified Biodynamic"],
      practiceType: "organic",
      status: "ACTIVE",
    },
  });

  console.log("✅ Created farm");

  // 4. Create products
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Organic Tomatoes",
        slug: "organic-tomatoes",
        description: "Fresh heirloom tomatoes",
        price: 5.99,
        unit: "lb",
        inventory: 100,
        farmId: farm.id,
        category: "Vegetables",
        seasonality: ["SUMMER", "FALL"],
        status: "ACTIVE",
      },
      {
        name: "Fresh Basil",
        slug: "fresh-basil",
        description: "Organic sweet basil",
        price: 3.49,
        unit: "bunch",
        inventory: 50,
        farmId: farm.id,
        category: "Herbs",
        seasonality: ["SPRING", "SUMMER"],
        status: "ACTIVE",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${products.count} products`);

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Reference:** `prisma/seed.ts` and `prisma/seed-comprehensive.ts`

---

## ⚡ Performance Optimization

### Indexing Strategy

```prisma
model Farm {
  id       String @id @default(cuid())
  ownerId  String
  status   FarmStatus
  slug     String @unique

  // Performance indexes
  @@index([ownerId])        // Queries by owner
  @@index([status])         // Filter by status
  @@index([createdAt])      // Sort by date
  @@fulltext([name, description]) // Full-text search
}
```

**Reference:** `DATABASE_PERFORMANCE_INDEXES.md`

---

### Query Optimization Patterns

#### 1. Use `select` Instead of Fetching All Fields

```typescript
// ❌ BAD - Fetches all fields
const users = await database.user.findMany();

// ✅ GOOD - Only needed fields
const users = await database.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

#### 2. Avoid N+1 Queries

```typescript
// ❌ BAD - N+1 query problem
const farms = await database.farm.findMany();
for (const farm of farms) {
  const products = await database.product.findMany({
    where: { farmId: farm.id },
  });
}

// ✅ GOOD - Single query with include
const farms = await database.farm.findMany({
  include: { products: true },
});
```

#### 3. Use Pagination

```typescript
// ✅ GOOD - Paginated results
const farms = await database.farm.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: "desc" },
});
```

#### 4. Use Parallel Queries When Independent

```typescript
// ✅ GOOD - Parallel execution
const [farms, products, orders] = await Promise.all([
  database.farm.findMany({ where: { status: "ACTIVE" } }),
  database.product.findMany({ where: { status: "ACTIVE" } }),
  database.order.findMany({ where: { status: "PENDING" } }),
]);
```

---

### Connection Pool Configuration

```typescript
// lib/database.ts
const database = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["error", "warn"],
  // Connection pool settings (via DATABASE_URL)
  // postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20
});
```

**Recommended Settings:**

- Development: `connection_limit=5`
- Production: `connection_limit=10`
- Serverless: Use Prisma Data Proxy or connection pooling service

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Can't reach database server"

**Symptom:** Connection errors when running migrations or queries

**Solution:**

```bash
# Check database is running
docker ps | grep postgres

# Start database
docker-compose up -d postgres

# Test connection
psql -h localhost -U postgres -d farmers_market_dev

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

---

#### 2. "Prisma Client not generated"

**Symptom:** Type errors or "Cannot find module @prisma/client"

**Solution:**

```bash
# Generate Prisma Client
npx prisma generate

# Verify generation
ls node_modules/.prisma/client

# Restart TypeScript server (in VS Code)
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

#### 3. Migration Conflicts

**Symptom:** "Migration failed" or "Migration is in a failed state"

**Solution:**

```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration (development only)
npx prisma migrate resolve --applied "MIGRATION_NAME"

# Or reset and re-migrate (CAUTION: deletes data)
npx prisma migrate reset
```

---

#### 4. Out of Sync Schema

**Symptom:** Schema doesn't match database

**Solution:**

```bash
# Pull database schema to Prisma
npx prisma db pull

# Or push Prisma schema to database (dev only)
npx prisma db push

# Then regenerate client
npx prisma generate
```

---

#### 5. Slow Queries

**Symptom:** Database operations taking too long

**Solution:**

```bash
# Enable query logging
# In lib/database.ts: log: ["query"]

# Check for missing indexes
# Review query plans in PostgreSQL

# Optimize queries
# - Add indexes
# - Use select instead of fetching all fields
# - Implement pagination
# - Use connection pooling
```

**Reference:** `DATABASE_PERFORMANCE_INDEXES.md`

---

### Getting Help

**Documentation:**

- Read `DATABASE_SETUP_GUIDE.md` for setup help
- Check `SCHEMA_REFERENCE.md` for schema questions
- Review `PRISMA_7_README.md` for Prisma 7 specifics

**Community:**

- [Prisma Discord](https://pris.ly/discord)
- [Prisma GitHub](https://github.com/prisma/prisma)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/prisma)

**Tools:**

- `npx prisma studio` - Visual database browser
- `npx prisma validate` - Validate schema syntax
- `npx prisma format` - Format schema file

---

## 🔗 Related Documentation

### Essential Reading

- 📖 **[Database Setup Guide](./DATABASE_SETUP_GUIDE.md)** - Initial database setup
- 📊 **[Schema Reference](./SCHEMA_REFERENCE.md)** - Complete schema documentation
- ✨ **[Prisma 7 README](./PRISMA_7_README.md)** - Prisma 7 features and patterns
- ⚡ **[Performance Indexes](./DATABASE_PERFORMANCE_INDEXES.md)** - Query optimization

### Setup & Configuration

- 🚀 **[Quick Setup](./DATABASE_SETUP.md)** - Fast setup guide
- 🔐 **[Database + Auth Setup](./DATABASE_AND_AUTH_SETUP_GUIDE.md)** - Combined setup
- 🔧 **[Database Fixes](./DATABASE-FIX-SUMMARY.md)** - Common fixes

### Prisma 7 Upgrade

- 🆙 **[Upgrade Guide](./PRISMA_7_UPGRADE_GUIDE.md)** - Step-by-step upgrade
- 📊 **[Upgrade Analysis](./PRISMA_7_UPGRADE_ANALYSIS.md)** - Impact analysis
- ⚠️ **[Risk Assessment](./PRISMA_7_RISK_ASSESSMENT.md)** - Migration risks
- 🎬 **[Staging Guide](./PRISMA_7_PHASE_6_STAGING_GUIDE.md)** - Staging deployment

### Architecture

- 🏗️ **[Architecture](../architecture/README.md)** - System architecture
- 💻 **[Development Guide](../development/README.md)** - Development patterns
- 🧪 **[Testing Guide](../testing/README.md)** - Database testing

### Operations

- 🚀 **[Deployment](../deployment/README.md)** - Database deployment
- 🐳 **[Docker Setup](../docker/README.md)** - Containerized database
- ⚙️ **[Configuration](../configuration/README.md)** - Environment config

---

## 📊 Directory Statistics

```yaml
Total Files: 15
Documentation Lines: ~8,000+
Database Models: 15+
Migration Files: 20+
Seed Scripts: 5

Key Guides:
  - Setup Guide: ⭐⭐⭐⭐⭐
  - Schema Reference: ⭐⭐⭐⭐⭐
  - Prisma 7 Guide: ⭐⭐⭐⭐⭐
  - Performance Guide: ⭐⭐⭐⭐⭐

Technology:
  - Prisma: 7.x (latest)
  - PostgreSQL: 16+
  - Connection Pooling: Built-in
  - Type Safety: 100%
```

---

## 🎯 Quick Navigation

### By Role

**👨‍💻 Backend Developer:**

- [Schema Reference](./SCHEMA_REFERENCE.md)
- [Query Patterns](#query-patterns)
- [Prisma Patterns](#prisma-patterns)
- [Performance](#performance-optimization)

**🗄️ Database Administrator:**

- [Setup Guide](./DATABASE_SETUP_GUIDE.md)
- [Migrations](#migrations)
- [Performance Indexes](./DATABASE_PERFORMANCE_INDEXES.md)
- [Troubleshooting](#troubleshooting)

**🚀 DevOps Engineer:**

- [Deployment Guide](../deployment/README.md)
- [Docker Setup](../docker/README.md)
- [Migration Deployment](#migrations)
- [Connection Pooling](#connection-pool-configuration)

**🧪 QA Engineer:**

- [Seeding](#seeding)
- [Test Data](../../prisma/seed-test.ts)
- [Database Reset](#migration-workflow)

### By Task

**🆕 Initial Setup:**

- Setup Guide → Environment Config → Migrations → Seeding

**🔄 Schema Changes:**

- Edit Schema → Create Migration → Test → Deploy

**🐛 Debugging:**

- Enable Query Logging → Prisma Studio → Check Indexes

**📈 Optimization:**

- Performance Indexes → Query Patterns → Connection Pooling

---

## ✨ Database Best Practices

> "Data is the foundation of agricultural consciousness - treat it with divine precision." 🌾⚡

### Core Principles

1. **Canonical Import** - Always use `@/lib/database`
2. **Type Safety** - Let Prisma generate types
3. **Performance** - Index properly, paginate, optimize queries
4. **Transactions** - Use for multi-step operations
5. **Migrations** - Version control all schema changes
6. **Seeding** - Reproducible test data
7. **Documentation** - Keep schema documented
8. **Testing** - Test database operations thoroughly

---

## 📝 Metadata

**Directory:** `docs/database/`  
**Purpose:** Database operations and Prisma documentation  
**Maintainers:** Backend Team + DevOps  
**Last Updated:** December 2024  
**Status:** ✅ Active - Prisma 7 Stable

**Quick Stats:**

- 📄 15 files
- 📝 ~8,000+ lines of documentation
- 🗄️ 15+ database models
- ⚡ Comprehensive indexes
- ⭐⭐⭐⭐⭐ Enterprise-grade quality

---

**🗄️ Database excellence with agricultural consciousness! 🌾✨**
