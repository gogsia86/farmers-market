# Database Schema

## Overview
Database schema design and management for the NextJS application.

## Dependencies
- [Core Architecture DNA](../CORE/ARCHITECTURE_DNA.instructions.md)
- [Security Framework](../SECURITY_DIVINITY/SECURITY_GUIDE.instructions.md)
- [Performance Alchemy](../PERFORMANCE_ALCHEMY/INDEX.instructions.md)

## Schema Design

### Core Models

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Farm {
  id        String   @id @default(cuid())
  name      String
  location  Json
  owner     User     @relation(fields: [ownerId], references: [id])
  ownerId   String
  crops     Crop[]
  resources Resource[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Crop {
  id           String   @id @default(cuid())
  name         String
  type         String
  status       String
  plantedDate  DateTime
  harvestDate  DateTime?
  farm         Farm     @relation(fields: [farmId], references: [id])
  farmId       String
  metrics      Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Resource {
  id        String   @id @default(cuid())
  type      String
  name      String
  quantity  Float
  unit      String
  farm      Farm     @relation(fields: [farmId], references: [id])
  farmId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  farms     Farm[]
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Schema Migrations

```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Query Optimization

### Indexed Fields
```prisma
model Farm {
  id        String   @id @default(cuid())
  name      String   @index
  ownerId   String   @index
  // ... other fields
}

model Crop {
  id        String   @id @default(cuid())
  farmId    String   @index
  status    String   @index
  // ... other fields
}
```

### Relation Loading
```typescript
// Efficient relation loading
const farm = await prisma.farm.findUnique({
  where: { id: farmId },
  include: {
    crops: {
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        status: true,
      }
    }
  }
});

// Paginated queries
const crops = await prisma.crop.findMany({
  where: { farmId },
  take: 10,
  skip: page * 10,
  orderBy: { plantedDate: 'desc' }
});
```

## Data Validation

### Zod Schema
```typescript
import { z } from 'zod';

export const FarmSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  resources: z.array(
    z.object({
      type: z.string(),
      quantity: z.number().positive(),
      unit: z.string()
    })
  ).optional()
});

export const CropSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  plantedDate: z.date(),
  harvestDate: z.date().optional(),
  metrics: z.record(z.any()).optional()
});
```