# ⚠️ CLEANUP ACTION REQUIRED - QUICK GUIDE

**Farmers Market Platform - Import Path Updates Needed**

---

## 🚨 IMMEDIATE ACTION REQUIRED

The project has been cleaned up and duplicate files removed. **You MUST update import paths** in your code to avoid build errors.

---

## 🔧 QUICK FIX COMMANDS

Run these **Find & Replace** operations in your IDE (VS Code: Ctrl+Shift+H):

### 1. Validation Imports

```
Find:    @/lib/validation/
Replace: @/lib/validations/
```

### 2. Remove .validation Suffix

```
Find (Regex):    from ["']@/lib/validations/(\w+)\.validation["']
Replace:         from "@/lib/validations/$1"
```

### 3. Test Utils Imports

```
Find:    @/test-utils/test-utils
Replace: @/lib/test-utils
```

### 4. Mock Imports

```
Find:    @/tests/mocks/
Replace: @tests/helpers/mocks/
```

### 5. Logging Imports (if any)

```
Find:    @/lib/logging/logger
Replace: @/lib/logger
```

---

## ✅ NEW CANONICAL IMPORTS

### Use These Imports Going Forward

```typescript
// ✅ Database (unchanged)
import { database } from "@/lib/database";

// ✅ Validations (NEW PATH - UPDATED)
import { validateFarm } from "@/lib/validations/farm";
import { validateProduct } from "@/lib/validations/product";
import { validateCart } from "@/lib/validations/cart";
import { validateOrder } from "@/lib/validations/order";
import { validateCrop } from "@/lib/validations/crop";

// ✅ Logger (NEW PATH)
import { logger, createLogger } from "@/lib/logger";

// ✅ Test Utils (NEW PATH)
import { render, screen } from "@/lib/test-utils";

// ✅ Mock Factories (NEW PATH)
import { createMockDatabase } from "@tests/helpers/mocks/database.mock";
import { createMockAuth } from "@tests/helpers/mocks/next-auth.mock";

// ✅ Test Helpers (NEW PATH)
import { createMockRequest } from "@tests/helpers/api-test-helpers";
import { createMockRoute } from "@tests/helpers/route-test-helpers";
```

---

## ❌ OLD IMPORTS (WILL BREAK)

```typescript
// ❌ DON'T USE - These paths no longer exist
import { validateFarm } from "@/lib/validation/farm.validation";
import { logger } from "@/lib/logging/logger";
import { render } from "@/test-utils/test-utils";
import { mockDb } from "@/tests/mocks/database.mock";
```

---

## 🗑️ WHAT WAS REMOVED

### Deleted Files/Directories

- ✅ `prisma/prisma.config.ts` (duplicate)
- ✅ `prisma/prisma.config.mjs` (duplicate)
- ✅ `src/lib/logging/` (use `src/lib/logger/` instead)
- ✅ `src/test-utils/` (use `src/lib/test-utils.tsx` instead)
- ✅ `src/lib/validation/` (use `src/lib/validations/` instead)
- ✅ `src/tests/` (moved to proper locations)
- ✅ `tests/__mocks__/` (moved to `__mocks__/`)
- ✅ `tests/mocks/` (moved to `tests/helpers/mocks/`)

### Documentation Archived

- ✅ 70+ old reports moved to `docs/reports/archive/`
- ✅ Root directory now has only 4 essential docs

---

## 🎯 VERIFY YOUR CODE

### Step 1: Update Imports

Run the find & replace operations above.

### Step 2: Check TypeScript

```bash
npm run type-check
```

### Step 3: Run Tests

```bash
npm run test
```

### Step 4: Build Project

```bash
npm run build
```

---

## 📁 NEW DIRECTORY STRUCTURE

```
src/
├── __tests__/              # All unit tests (unchanged)
├── lib/
│   ├── logger/            # ✅ SINGLE logging directory
│   ├── validations/       # ✅ SINGLE validation directory
│   ├── test-utils.tsx     # ✅ SINGLE test utils file
│   └── database.ts        # ✅ CANONICAL database import
│
tests/
├── e2e/                   # E2E tests
├── load/                  # Load tests
└── helpers/
    ├── mocks/             # ✅ NEW: Mock factories here
    ├── api-test-helpers.ts
    └── route-test-helpers.ts

__mocks__/                 # ✅ Jest module mocks (TypeScript)
├── @auth/
├── bcrypt.ts
├── sharp.ts
├── stripe.ts
└── next-auth.ts
```

---

## 🆘 TROUBLESHOOTING

### Build Errors?

- **Cause:** Import paths not updated
- **Fix:** Run find & replace operations above

### Test Failures?

- **Cause:** Mock imports pointing to old locations
- **Fix:** Update mock imports to `@tests/helpers/mocks/`

### Type Errors?

- **Cause:** Validation imports using old paths
- **Fix:** Update validation imports to `@/lib/validations/`

### Missing Files?

- **Cause:** Looking for deleted duplicates
- **Fix:** Use canonical paths documented above

---

## 📚 FULL DOCUMENTATION

For complete details, see:

- `CLEANUP_COMPLETION_REPORT.md` - Full cleanup report
- `DUPLICATE_FILES_RESOLUTION_REPORT.md` - Initial analysis

---

## ✅ CHECKLIST

Before continuing development:

- [ ] Run all 5 find & replace operations
- [ ] Run `npm run type-check` (should pass)
- [ ] Run `npm run test` (should pass)
- [ ] Run `npm run build` (should pass)
- [ ] Update any custom scripts with new paths
- [ ] Notify team members of changes
- [ ] Update any personal notes/bookmarks

---

## 🎉 BENEFITS

After completing these updates, you'll have:

✅ Clean, organized codebase  
✅ Single source of truth for all utilities  
✅ Consistent import patterns  
✅ Faster build times  
✅ Better developer experience  
✅ TypeScript-first mocks  
✅ Follows Next.js & Jest best practices

---

## 🚀 READY TO CODE

Once you've completed the import updates, you're ready to continue development with a clean, well-organized codebase!

**Questions?** Check the full cleanup report or ask the team.

---

_Clean code, clear mind, divine agriculture._ 🌾⚡
