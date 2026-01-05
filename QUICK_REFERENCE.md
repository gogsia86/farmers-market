# 🚀 QUICK REFERENCE CARD

**Farmers Market Platform - Daily Development Guide**

---

## 🎯 QUICK START (Every Day)

```bash
# 1. Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:3001
```

---

## 🔑 TEST ACCOUNTS

```
Farmer:   farmer1@example.com   / password123
Customer: customer@example.com  / password123
Admin:    admin@example.com     / password123
```

---

## 📦 COMMON COMMANDS

### Development
```bash
npm run dev              # Start dev server (port 3001)
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # Check TypeScript
npm run lint             # Run linter
```

### Database
```bash
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio GUI
npm run seed             # Seed test data
npx prisma generate      # Regenerate Prisma Client

# Test connection
node scripts/test-db-connection.js
```

### Docker
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f postgres-dev

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres-dev

# Check running containers
docker ps
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

---

## 🗄️ DATABASE INFO

```
Host:     localhost:5432
Database: farmers_market
User:     farmers_user
Password: changeme123
URL:      postgresql://farmers_user:changeme123@localhost:5432/farmers_market
```

**Tables:** 84 (Users, Farms, Products, Orders, Payments, etc.)

---

## 📂 KEY DIRECTORIES

```
src/
├── app/              # Next.js pages & routes
├── components/       # React components
├── lib/              # Business logic & utilities
│   ├── database/    # Database singleton
│   └── services/    # Service layer
├── types/           # TypeScript types
└── hooks/           # Custom React hooks

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

---

## ✅ IMPORT PATTERNS

```typescript
// ✅ CORRECT - Use canonical database import
import { database } from "@/lib/database";

// ✅ Path aliases
import { Component } from "@/components/ui/Component";
import { farmService } from "@/lib/services/farm.service";
import type { Farm, Product } from "@/types";

// ❌ WRONG - Don't create new Prisma instances
import { PrismaClient } from "@prisma/client";
```

---

## 🎨 CODING STANDARDS

### Component Pattern
```typescript
// ✅ Server Component (default)
export default async function FarmPage({ params }) {
  const farm = await database.farm.findUnique({
    where: { id: params.id }
  });
  return <div>{farm.name}</div>;
}

// ✅ Client Component
"use client";
import { useState } from "react";

export function InteractiveMap({ location }) {
  const [zoom, setZoom] = useState(13);
  return <div>Map</div>;
}
```

### Service Pattern
```typescript
export class FarmService {
  async createFarm(farmData: CreateFarmRequest): Promise<Farm> {
    // Validation
    await this.validateFarmData(farmData);

    // Database operation
    return await database.farm.create({
      data: farmData
    });
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Database Connection Failed
```bash
# 1. Check Docker is running
docker ps

# 2. Restart database
docker-compose -f docker-compose.dev.yml restart postgres-dev

# 3. Test connection
node scripts/test-db-connection.js

# 4. Fix DATABASE_URL
node scripts/fix-database-url.js
```

### Port 3001 Already in Use
```bash
# Windows
netstat -ano | findstr :3001

# Use different port
PORT=3002 npm run dev
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Reset database (⚠️ deletes data)
npx prisma db push --force-reset
npm run seed
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

---

## 🎯 DEVELOPMENT WORKFLOW

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Develop with hot reload
npm run dev

# 3. Write tests
npm run test:watch

# 4. Check types & lint
npm run type-check
npm run lint

# 5. Commit
git add .
git commit -m "feat: your feature description"

# 6. Push
git push origin feature/your-feature
```

---

## 📊 PROJECT STATUS

**Current Phase:** Foundation Complete ✅
**Next Phase:** Core Features 🏗️

### Ready to Build
- [ ] Authentication system
- [ ] Farm management
- [ ] Product catalog
- [ ] Shopping cart
- [ ] Order processing
- [ ] Payment integration

---

## 🌐 URLS

- **Development:** http://localhost:3001
- **Network:** http://192.168.8.103:3001
- **Prisma Studio:** `npm run db:studio` → http://localhost:5555

---

## 📚 DOCUMENTATION

- **Main README:** [README.md](./README.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)
- **Divine Rules:** [.cursorrules](./.cursorrules)
- **Build Success:** [BUILD_SUCCESS.md](./BUILD_SUCCESS.md)

---

## 💡 DAILY CHECKLIST

**Morning Startup:**
- [ ] Start Docker: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Check containers: `docker ps`
- [ ] Start dev server: `npm run dev`
- [ ] Open browser: http://localhost:3001

**Before Commit:**
- [ ] Tests pass: `npm test`
- [ ] Types check: `npm run type-check`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`

**End of Day:**
- [ ] Commit your work
- [ ] Stop Docker: `docker-compose -f docker-compose.dev.yml down`

---

## 🚨 IMPORTANT NOTES

1. **Always** use `import { database } from "@/lib/database"`
2. **Never** create new PrismaClient instances
3. **Follow** divine agricultural patterns (see `.cursorrules`)
4. **Test** before committing (target: 80% coverage)
5. **Document** your code with clear comments

---

## 🎊 QUICK WINS

```bash
# Open database GUI
npm run db:studio

# Watch for changes in real-time
npm run dev

# See all available scripts
npm run

# Generate new migration
npx prisma migrate dev --name your-migration-name

# View database logs
docker-compose -f docker-compose.dev.yml logs -f postgres-dev
```

---

**Happy Coding! 🌾✨**

*Keep this card open while developing*
*Last Updated: January 3, 2026*
