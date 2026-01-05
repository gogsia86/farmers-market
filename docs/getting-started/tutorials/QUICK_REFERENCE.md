# ⚡ QUICK REFERENCE CARD

**Farmers Market Platform - Developer Cheat Sheet**

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Visit
http://localhost:3001
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Type check
npm run type-check

# Lint code
npm run lint

# Deploy to staging
vercel deploy

# Deploy to production
vercel deploy --prod
```

---

## 🗄️ Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed:basic

# Open Prisma Studio
npm run db:studio

# Reset database (DANGER!)
npx prisma migrate reset
```

---

## 🧪 Testing Patterns

### Direct Route Handler Testing (NEW!)

```typescript
import {
  testApiRoute,
  expectApiSuccess,
} from "@/tests/utils/route-test-helpers";
import { GET } from "@/app/api/products/route";

const response = await testApiRoute(GET, {
  searchParams: { page: "1" },
});
const data = await expectApiSuccess(response);
```

### Authenticated Route Testing

```typescript
import { testAuthenticatedApiRoute } from "@/tests/utils/route-test-helpers";

const response = await testAuthenticatedApiRoute(POST, {
  userId: "user_123",
  role: "FARMER",
  body: { name: "Tomatoes" },
});
```

---

## 📂 Key File Locations

```
src/
├── app/                    # Next.js App Router
│   ├── (customer)/        # Customer routes
│   ├── (farmer)/          # Farmer routes
│   ├── (admin)/           # Admin routes
│   └── api/               # API routes
├── components/            # React components
├── lib/
│   ├── services/         # Business logic
│   ├── database/         # DB singleton
│   └── auth/             # Authentication
└── tests/
    ├── utils/            # Test helpers
    └── e2e/              # E2E tests
```

---

## 🌐 Key URLs

### Local Development

- Homepage: http://localhost:3001
- Dashboard: http://localhost:3001/dashboard
- Account: http://localhost:3001/account
- Marketplace: http://localhost:3001/marketplace
- API Health: http://localhost:3001/api/health

### Staging

- Homepage: https://staging.farmersmarket.com
- API Health: https://staging.farmersmarket.com/api/health

---

## 🔧 Common Tasks

### Add New API Route

```typescript
// src/app/api/your-route/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Hello" });
}
```

### Test New API Route

```typescript
// src/__tests__/integration/your-route.test.ts
import { testApiRoute } from "@/tests/utils/route-test-helpers";
import { GET } from "@/app/api/your-route/route";

it("should work", async () => {
  const response = await testApiRoute(GET);
  expect(response.status).toBe(200);
});
```

### Add New E2E Test

```typescript
// tests/e2e/your-feature.spec.ts
import { test, expect } from "@playwright/test";

test("should do something", async ({ page }) => {
  await page.goto("/your-page");
  await expect(page.getByText("Hello")).toBeVisible();
});
```

---

## 🔐 Environment Variables

### Required for Development

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="http://localhost:3001"
```

### Required for Staging

See `.env.staging.example` for complete list

---

## 📚 Documentation

- `README.md` - Project overview
- `TASKS_COMPLETION_SUMMARY.md` - Recent work
- `STAGING_DEPLOYMENT_GUIDE.md` - Deployment
- `EXECUTIVE_SUMMARY.md` - High-level overview
- `.github/instructions/` - Divine patterns

---

## 🆘 Troubleshooting

### Tests Failing

```bash
# Clear cache
npm run clean:cache

# Regenerate Prisma
npx prisma generate

# Reset test DB
DATABASE_URL=$TEST_DATABASE_URL npm run db:reset
```

### Build Failing

```bash
# Check types
npm run type-check

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Database Issues

```bash
# Check connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Reset and reseed
npm run db:reset
```

---

## 🎯 Test Credentials (Development)

```
Customer:
  Email: test.customer@example.com
  Password: TestPass123!

Farmer:
  Email: test.farmer@example.com
  Password: TestPass123!

Admin:
  Email: test.admin@example.com
  Password: TestPass123!
```

---

## 📊 Health Checks

```bash
# Local health check
curl http://localhost:3001/api/health

# Staging health check
curl https://staging.farmersmarket.com/api/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2025-01-..."
# }
```

---

## 🚀 Quick Deploy to Staging

```bash
# 1. Setup environment
cp .env.staging.example .env.staging
# Edit with actual values

# 2. Run migrations
export STAGING_DATABASE_URL="postgresql://..."
./scripts/staging-migration.sh

# 3. Deploy
vercel deploy

# 4. Verify
curl https://staging.farmersmarket.com/api/health

# 5. Run E2E tests
BASE_URL=https://staging.farmersmarket.com npm run test:e2e
```

---

## 💡 Pro Tips

1. **Fast Tests**: Use direct route handler testing (10x faster!)
2. **E2E Coverage**: All critical paths tested
3. **Type Safety**: TypeScript strict mode enabled
4. **Divine Patterns**: Follow `.github/instructions/`
5. **Agricultural Consciousness**: Maintain farming domain awareness

---

## 🔗 Useful Commands

```bash
# Generate secure secret
openssl rand -base64 32

# Check port usage
lsof -i :3001

# Kill dev server
npm run kill-server

# View logs
vercel logs --follow

# Open Prisma Studio
npm run db:studio
```

---

## 📞 Need Help?

- Check `STAGING_DEPLOYMENT_GUIDE.md` for deployment
- Check `TASKS_COMPLETION_SUMMARY.md` for recent changes
- Check `.github/instructions/` for coding patterns
- Run `npm run test` to verify setup

---

**Version**: 1.0
**Last Updated**: January 2025
**Status**: ✅ Production Ready

_"Quick reference for quantum agricultural development"_ 🌾⚡
