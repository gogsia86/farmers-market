# ⚡ Quick Reference - Build Optimizations

> **Fast reference guide for all optimization features**

---

## 🚀 Quick Commands

### Type Safety
```bash
# Check types
npm run type-check

# Watch types in real-time
npm run type-check:watch

# Pretty type output
npm run lint:types
```

### Prisma Validation
```bash
# Validate Prisma queries
npm run validate:prisma

# Auto-fix issues
npm run validate:prisma:fix
```

### Build & Deploy
```bash
# Local build with all checks
npm run build:prod

# Standard build
npm run build

# Build with bundle analysis
npm run build:analyze
```

### Quality Checks
```bash
# Run all checks
npm run quality

# Auto-fix everything
npm run quality:fix

# Full validation suite
npm run validate:all
```

---

## 🛡️ Type-Safe Database Usage

### Import the Safe Wrapper
```typescript
// ❌ DON'T USE
import { database } from '@/lib/database';

// ✅ ALWAYS USE
import { safeDatabase } from '@/lib/database-safe';
```

### Basic Queries
```typescript
import { safeDatabase } from '@/lib/database-safe';

// Find many with autocomplete
const orders = await safeDatabase.order.findMany({
  include: {
    customer: true,  // ✅ TypeScript knows this exists
    items: {
      include: {
        product: true
      }
    }
  }
});
```

### Pre-Built Query Helpers
```typescript
import { orderQueries } from '@/lib/database-safe';

// Get orders with all details
const orders = await orderQueries.findManyWithDetails({
  where: { status: 'PENDING' },
  take: 10
});

// Get customer orders
const customerOrders = await orderQueries.findByCustomer(customerId);

// Get order with full details
const order = await orderQueries.findUniqueWithDetails({ id: orderId });
```

### Product Queries
```typescript
import { productQueries } from '@/lib/database-safe';

// Products with relations
const products = await productQueries.findManyWithDetails({
  where: { status: 'ACTIVE' },
  take: 20
});

// Product by slug
const product = await productQueries.findBySlugWithDetails(slug);
```

### User Queries
```typescript
import { userQueries } from '@/lib/database-safe';

// User with all relations
const user = await userQueries.findWithRelations({ id: userId });

// User by email (for auth)
const user = await userQueries.findByEmail(email);
```

### Farm Queries
```typescript
import { farmQueries } from '@/lib/database-safe';

// Farms with stats
const farms = await farmQueries.findManyWithStats();

// Farm by slug
const farm = await farmQueries.findBySlugWithDetails(slug);
```

---

## 🔍 Common Prisma Mistakes & Fixes

### Mistake 1: Wrong Relation Name
```typescript
// ❌ WRONG - Runtime error
const orders = await database.order.findMany({
  include: { user: true }  // 'user' doesn't exist on Order!
});

// ✅ CORRECT
const orders = await safeDatabase.order.findMany({
  include: { customer: true }  // Autocomplete shows 'customer'
});
```

### Mistake 2: Missing Relations
```typescript
// ❌ WRONG - Incomplete data
const orders = await database.order.findMany();
// orders[0].customer → undefined (not loaded)

// ✅ CORRECT - Use helper
const orders = await orderQueries.findManyWithDetails();
// orders[0].customer → loaded automatically
```

### Mistake 3: Inefficient Queries
```typescript
// ❌ WRONG - N+1 query problem
const orders = await database.order.findMany();
for (const order of orders) {
  const customer = await database.user.findUnique({ 
    where: { id: order.customerId } 
  });
}

// ✅ CORRECT - Single query with include
const orders = await orderQueries.findManyWithDetails();
// All customers loaded in one query
```

---

## 📦 Schema Quick Reference

### Order Model Relations
```typescript
Order {
  customer: User          // ✅ Use 'customer', NOT 'user'
  items: OrderItem[]
  farm: Farm
  deliveryAddress: UserAddress
  Payment: Payment
  reviews: Review[]
  refunds: Refund[]
}
```

### Product Model Relations
```typescript
Product {
  farm: Farm
  category: Category
  reviews: Review[]
  orderItems: OrderItem[]
  cartItems: CartItem[]
  tags: Tag[]
}
```

### User Model Relations
```typescript
User {
  orders: Order[]        // As customer
  addresses: UserAddress[]
  reviews: Review[]
  cart: Cart
  wishlist: Wishlist
  farm: Farm            // If farmer
  notifications: Notification[]
}
```

---

## 🔧 Troubleshooting

### Issue: Type errors after git pull
```bash
npm ci
prisma generate
npm run type-check
```

### Issue: Prisma relation errors
```bash
npm run validate:prisma:fix
```

### Issue: Build fails on Vercel
```bash
# Test locally first
npm run build:prod

# Check logs
vercel logs
```

### Issue: Slow TypeScript
```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall
npm ci
```

---

## 🎯 Pre-Commit Checklist

```bash
# 1. Type check
npm run type-check

# 2. Validate Prisma
npm run validate:prisma

# 3. Lint
npm run lint:fix

# 4. Format
npm run format

# 5. Test (optional but recommended)
npm test
```

---

## 📊 Build Performance Tips

### Faster Development
```bash
# Use Turbopack
npm run dev:turbo

# Watch types separately
npm run type-check:watch
```

### Faster Builds
```bash
# Skip telemetry
export NEXT_TELEMETRY_DISABLED=1

# More memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Build
npm run build
```

### Faster CI/CD
- ✅ Use npm ci instead of npm install
- ✅ Cache node_modules
- ✅ Skip type-check on Vercel (done in CI)
- ✅ Use --no-engine for Prisma

---

## 🔐 Environment Variables

### Required for Build
```bash
SKIP_ENV_VALIDATION=true
NEXT_TELEMETRY_DISABLED=1
```

### Required for Runtime
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

---

## 📝 VSCode Snippets

### Add to `.vscode/settings.json`
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Add to `.vscode/snippets.code-snippets`
```json
{
  "Safe Prisma Query": {
    "prefix": "prisma",
    "body": [
      "import { safeDatabase } from '@/lib/database-safe';",
      "",
      "const ${1:data} = await safeDatabase.${2:model}.findMany({",
      "  where: { $3 },",
      "  include: {",
      "    $4",
      "  }",
      "});"
    ]
  }
}
```

---

## 🚨 Common Errors & Solutions

### Error: "Property 'user' does not exist on type 'Order'"
**Solution**: Use `customer` instead of `user`
```typescript
include: { customer: true }  // NOT user
```

### Error: "Cannot find module '@/lib/database-safe'"
**Solution**: File not imported correctly
```typescript
import { safeDatabase } from '@/lib/database-safe';
```

### Error: "Prisma Client not generated"
**Solution**: Regenerate Prisma client
```bash
prisma generate
```

### Error: "Type checking takes too long"
**Solution**: Use incremental compilation
```bash
npm run type-check:watch  # In separate terminal
```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/database-safe.ts` | Type-safe Prisma wrapper |
| `scripts/validation/validate-prisma-usage.ts` | Prisma validator |
| `docs/BUILD_OPTIMIZATIONS.md` | Full documentation |
| `vercel.json` | Deployment config |
| `next.config.mjs` | Next.js config |
| `tsconfig.json` | TypeScript config |

---

## 🎓 Best Practices Summary

1. ✅ Always use `safeDatabase` instead of `database`
2. ✅ Use pre-built query helpers for common patterns
3. ✅ Run `npm run validate:prisma` before committing
4. ✅ Keep TypeScript strict mode enabled
5. ✅ Use autocomplete for relation names
6. ✅ Test builds locally before pushing
7. ✅ Monitor bundle size with `npm run build:analyze`
8. ✅ Keep dependencies up to date

---

## 🔗 Quick Links

- [Full Documentation](./BUILD_OPTIMIZATIONS.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Last Updated**: January 2025  
**Need Help?** Check the full docs or ask in #engineering

---

✨ **Keep Building!** ✨