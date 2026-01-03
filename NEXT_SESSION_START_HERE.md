# 🚀 Next Session - Start Here

**Last Session End**: Phase 1-2 Complete ✅
**Next Priority**: Phase 3 - Product Management
**Status**: All TypeScript errors resolved, farm creation flow complete

---

## 📊 Quick Status Check

### What's Done ✅
- ✅ Base service infrastructure (transaction handling, error management)
- ✅ UI component library (Card, Input, Label, Textarea, Button)
- ✅ Farm creation complete (page, form, server actions)
- ✅ Order service implemented
- ✅ Email service implemented
- ✅ Zero TypeScript errors
- ✅ All schema mismatches fixed

### What's Next 🎯
1. **Product Creation UI** (Highest Priority)
2. **Product Listing Pages**
3. **Farm Detail Page**
4. **Image Upload Integration**
5. **Shopping Cart**

---

## 🏃 Quick Start Commands

```bash
# 1. Start development environment
cd "Farmers Market Platform web and app"
docker-compose -f docker-compose.dev.yml up -d

# 2. Verify database connection
npx prisma studio
# Opens at http://localhost:5555

# 3. Start dev server
npm run dev
# Opens at http://localhost:3001

# 4. Type check (should show 0 errors)
npm run type-check

# 5. Test farm creation flow
# Navigate to: http://localhost:3001/farmer/farms/new
# Login as farmer test account (see seed data)
```

---

## 📁 Project Structure (Key Files)

```
src/
├── lib/
│   ├── services/
│   │   ├── base.service.ts         ✅ Complete - Use as parent class
│   │   ├── farm.service.ts         ✅ Complete - Reference pattern
│   │   ├── product.service.ts      ✅ Complete - Reference pattern
│   │   ├── order.service.ts        ✅ Complete
│   │   └── email.service.ts        ✅ Complete
│   └── database.ts                 ✅ Canonical DB import
│
├── components/
│   ├── ui/                         ✅ Complete component library
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── button.tsx
│   └── features/
│       └── farms/
│           └── create-farm-form.tsx ✅ Reference for product form
│
├── app/
│   ├── actions/
│   │   └── farm.actions.ts         ✅ Complete - Reference pattern
│   └── (farmer)/farmer/
│       └── farms/new/page.tsx      ✅ Complete - Reference pattern
│
└── types/                          📝 Add product types here
```

---

## 🎯 Phase 3: Product Management - Implementation Plan

### Step 1: Product Creation UI (Highest Priority)

#### Files to Create:

**1. Product Actions** (`src/app/actions/product.actions.ts`)
```typescript
// Pattern: Copy from farm.actions.ts, adapt for products
// Actions needed:
// - createProductAction(farmId, formData)
// - updateProductAction(productId, formData)
// - deleteProductAction(productId)
// - toggleProductAvailabilityAction(productId)
```

**2. Product Form** (`src/components/features/products/create-product-form.tsx`)
```typescript
// Pattern: Copy from create-farm-form.tsx, adapt for products
// Fields needed:
// - name (required)
// - description (required)
// - category (dropdown: VEGETABLES, FRUITS, DAIRY, etc.)
// - priceUSD (Decimal, required)
// - unit (lb, oz, bunch, each, etc.)
// - quantityAvailable (Decimal, optional)
// - organic (boolean checkbox)
// - seasonal (boolean)
// - tags (comma-separated)
// - imageUrls (placeholder for now)
```

**3. Product Creation Page** (`src/app/(farmer)/farmer/farms/[farmId]/products/new/page.tsx`)
```typescript
// Pattern: Copy from farms/new/page.tsx
// Check: User is farm owner
// Fetch: Farm details to display in header
// Pass: farmId to form component
```

#### Key Considerations:
- Use Decimal type for price and quantity
- Validate price > 0
- Category from Prisma enum (ProductCategory)
- Handle image URLs as JSON array (placeholder images for now)
- Seasonal toggle for availability tracking

---

### Step 2: Product Listing Pages

#### Files to Create:

**1. Customer Product Browse** (`src/app/(customer)/products/page.tsx`)
- Server component
- Fetch all available products
- Filter by category, farm, availability
- Pagination
- Search support

**2. Product Card Component** (`src/components/features/products/product-card.tsx`)
- Display: image, name, price, farm, organic badge
- Actions: Add to cart, view details
- Variants: grid view, list view

**3. Product Detail Page** (`src/app/(customer)/products/[slug]/page.tsx`)
- Full product information
- Farm information section
- Add to cart with quantity selector
- Reviews section
- Related products

**4. Farmer Product Management** (`src/app/(farmer)/farmer/farms/[farmId]/products/page.tsx`)
- List all products for farm
- Quick status toggles (available/unavailable)
- Edit/delete actions
- Stock level indicators

---

### Step 3: Farm Detail Page

**File**: `src/app/(public)/farms/[slug]/page.tsx`

**Sections**:
- Farm header (name, description, location, certifications)
- Products grid (all active products)
- Reviews section
- Contact information
- Map (Google Maps integration)

---

## 🔧 Code Patterns to Follow

### Service Layer Pattern
```typescript
// Extend BaseService
class ProductService extends BaseService {
  constructor() {
    super("ProductService");
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.withQuantumTransaction(async (tx) => {
      // Validation
      this.validateRequired(data, ["name", "farmId", "priceUSD"]);

      // Business logic
      const product = await tx.product.create({
        data: {
          ...data,
          slug: generateSlug(data.name),
        },
      });

      return product;
    });
  }
}
```

### Server Action Pattern
```typescript
"use server";

export async function createProductAction(
  farmId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // 2. Authorization check (farm ownership)
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true },
    });

    if (farm.ownerId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Extract and validate data
    const name = formData.get("name") as string;
    const priceUSD = parseFloat(formData.get("priceUSD") as string);
    // ... more fields

    if (!name || name.length < 3) {
      return { success: false, error: "Name must be at least 3 characters" };
    }

    // 4. Call service
    const product = await productService.createProduct({
      farmId,
      name,
      priceUSD,
      // ... other fields
    });

    // 5. Revalidate paths
    revalidatePath(`/farmer/farms/${farmId}/products`);
    revalidatePath("/products");

    return { success: true, product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### Form Component Pattern
```typescript
"use client";

export function CreateProductForm({ farmId }: { farmId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await createProductAction(farmId, formData);

    if (result.success) {
      router.push(`/farmer/farms/${farmId}/products`);
    } else {
      setError(result.error || "Failed to create product");
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={200}
          placeholder="Organic Heirloom Tomatoes"
        />
      </div>

      {/* More fields... */}

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="agricultural"
      >
        {isSubmitting ? "Creating..." : "Create Product"}
      </Button>
    </form>
  );
}
```

---

## 📋 Prisma Schema Reference (Key Models)

### Product Model
```prisma
model Product {
  id                  String              @id @default(cuid())
  farmId              String
  name                String              @db.VarChar(200)
  slug                String              @unique @db.VarChar(255)
  description         String?
  category            ProductCategory
  priceUSD            Decimal             @db.Decimal(10, 2)
  unit                String              @db.VarChar(50)  // "lb", "oz", "bunch", etc.
  quantityAvailable   Decimal?            @db.Decimal(10, 2)
  organic             Boolean             @default(false)
  imageUrls           Json?               // JSON array of image URLs
  tags                Json?               // JSON array of tags
  variants            Json?               // JSON for product variants
  pricing             Json?               // JSON for pricing tiers
  seasonal            Boolean             @default(false)
  availableFrom       DateTime?
  availableTo         DateTime?
  status              ProductStatus       @default(AVAILABLE)
  purchaseCount       Int                 @default(0)
  viewsCount          Int                 @default(0)
  cartAddsCount       Int                 @default(0)
  wishlistCount       Int                 @default(0)
  reviewCount         Int                 @default(0)
  averageRating       Decimal?            @db.Decimal(3, 2)
  farm                Farm                @relation(fields: [farmId], references: [id])
  // ... relations
}

enum ProductCategory {
  VEGETABLES
  FRUITS
  DAIRY
  MEAT
  EGGS
  BAKED_GOODS
  PRESERVES
  HONEY
  HERBS
  FLOWERS
  OTHER
}

enum ProductStatus {
  AVAILABLE
  OUT_OF_STOCK
  DISCONTINUED
  SEASONAL_UNAVAILABLE
}
```

---

## 🎨 UI Components Available

All components support variants and are fully typed:

```typescript
// Card
<Card variant="agricultural">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Input
<Input
  variant="default" // or "error", "success", "agricultural"
  inputSize="default" // or "sm", "lg"
  type="text"
  placeholder="..."
/>

// Button
<Button
  variant="agricultural" // or "default", "outline", "destructive", etc.
  size="default" // or "sm", "lg", "xl", "icon"
  loading={isLoading}
>
  Click Me
</Button>

// Label
<Label htmlFor="field">Field Name</Label>

// Textarea
<Textarea
  rows={4}
  placeholder="..."
/>
```

---

## 🔍 Common Tasks

### Add New Form Field
1. Add HTML input in form component
2. Extract value in server action
3. Validate the value
4. Pass to service method
5. Update TypeScript types if needed

### Handle Decimal Fields (Price, Quantity)
```typescript
// In form: use type="number" step="0.01"
<Input type="number" step="0.01" min="0" />

// In action: parse carefully
const price = parseFloat(formData.get("price") as string);
if (isNaN(price) || price <= 0) {
  return { success: false, error: "Invalid price" };
}

// In service: Prisma handles Decimal automatically
await database.product.create({
  data: { priceUSD: price }, // Will be converted to Decimal
});

// When reading: convert for display
const priceNumber = product.priceUSD.toNumber();
```

### Handle JSON Fields (Arrays)
```typescript
// Storage (in action):
const tags = formData.get("tags") as string;
const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);

await database.product.create({
  data: {
    tags: tagsArray, // Prisma converts to JSON
  },
});

// Retrieval:
const product = await database.product.findUnique({...});
const tags = product.tags as string[]; // Type assertion needed
```

---

## 🐛 Troubleshooting

### TypeScript Errors
```bash
# Always run type check before committing
npm run type-check

# Common fixes:
# 1. Missing import: Check if type is exported from @prisma/client
# 2. Wrong field name: Check schema with `npx prisma studio`
# 3. Decimal handling: Use .toNumber() for display
```

### Schema Mismatch
```bash
# View current schema
cat prisma/schema.prisma | grep -A 20 "model Product"

# Push changes to dev DB
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### Database Connection Issues
```bash
# Check Docker status
docker ps

# Restart databases
docker-compose -f docker-compose.dev.yml restart

# Test connection
node scripts/test-db-connection.js
```

---

## 📚 Reference Documentation

### Key Files to Reference:
1. **Farm Creation Flow**: `src/app/(farmer)/farmer/farms/new/page.tsx`
2. **Form Pattern**: `src/components/features/farms/create-farm-form.tsx`
3. **Server Actions**: `src/app/actions/farm.actions.ts`
4. **Service Layer**: `src/lib/services/farm.service.ts`
5. **Base Service**: `src/lib/services/base.service.ts`

### Divine Instructions:
Located in `.github/instructions/`:
- `01_DIVINE_CORE_PRINCIPLES.instructions.md` - Architecture
- `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md` - Next.js patterns
- `10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md` - Feature patterns
- `16_KILO_QUICK_REFERENCE.instructions.md` - Quick patterns

---

## ✅ Pre-Flight Checklist

Before starting new development:

- [ ] Docker containers running (`docker ps`)
- [ ] Database accessible (`npx prisma studio`)
- [ ] Dev server running (`npm run dev`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Reviewed farm creation flow for patterns
- [ ] Product schema reviewed (`prisma/schema.prisma`)
- [ ] Test user credentials ready (see seed script)

---

## 🎯 Success Criteria for Phase 3

### Product Creation (Complete when):
- [ ] Product creation form renders correctly
- [ ] All fields validate properly
- [ ] Server action creates product successfully
- [ ] Product appears in database (verify in Prisma Studio)
- [ ] Redirects to product list after creation
- [ ] No TypeScript errors
- [ ] Handles errors gracefully

### Product Listing (Complete when):
- [ ] Products display in grid/list
- [ ] Pagination works
- [ ] Category filter works
- [ ] Search works (basic text search)
- [ ] Product card shows all key info
- [ ] Links to product detail page
- [ ] Farmer can see their products only

### Farm Detail Page (Complete when):
- [ ] Farm info displays correctly
- [ ] Products grid shows farm products
- [ ] Reviews section displays (if any)
- [ ] Contact info visible
- [ ] Map integration (Google Maps)
- [ ] SEO metadata configured

---

## 💡 Quick Tips

1. **Copy-Paste Pattern**: Use farm creation flow as template for products
2. **Type Safety**: Always import types from `@prisma/client`
3. **Database Import**: Always use `import { database } from "@/lib/database"`
4. **Decimal Fields**: Use `step="0.01"` for price inputs
5. **Validation**: Client-side (HTML5) + Server-side (service layer)
6. **Auth Flow**: Check session → verify ownership → proceed
7. **Error Handling**: Use try-catch in actions, return `{ success, error }`
8. **Path Revalidation**: Always revalidate after mutations

---

## 🚀 Let's Continue!

You're ready to implement Phase 3: Product Management.

Start with: **Product Creation UI**

```bash
# 1. Start environment
docker-compose -f docker-compose.dev.yml up -d
npm run dev

# 2. Create product actions file
# Copy pattern from: src/app/actions/farm.actions.ts

# 3. Create product form component
# Copy pattern from: src/components/features/farms/create-farm-form.tsx

# 4. Create product creation page
# Copy pattern from: src/app/(farmer)/farmer/farms/new/page.tsx

# 5. Test the flow!
```

**Good luck! The foundation is solid. Build with confidence.** 🌾

---

**Questions or Issues?**
- Reference: `CONTINUOUS_DEVELOPMENT_PROGRESS.md` for complete context
- Check: `.cursorrules` for divine coding patterns
- Review: Existing farm flow for proven patterns

**Status**: Ready for Phase 3 Product Management 🎯
