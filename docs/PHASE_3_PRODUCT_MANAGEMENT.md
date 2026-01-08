# 🌾 Phase 3: Product Management UI - Implementation Plan

**Status:** Ready for Implementation
**Priority:** P0 - Critical Blocker
**Estimated Time:** 4-6 hours
**Blocking Test:** Farmer Product Management (MVP Bot)

---

## 📋 OVERVIEW

This phase implements the complete product management interface for farmers, enabling them to:
- Create new products with full details
- Edit existing products
- Upload product images
- Manage inventory and pricing
- Delete/archive products
- View product analytics

**Success Criteria:**
- ✅ Farmer can create products via `/farmer/products/new`
- ✅ Product form has all required fields with correct IDs
- ✅ Product list displays on farmer dashboard
- ✅ Product editing works at `/farmer/products/[id]/edit`
- ✅ Image upload functionality works
- ✅ MVP bot product management test passes

---

## 🎯 REQUIRED COMPONENTS

### 1. Product List Page (`/farmer/products`)
**File:** `src/app/(farmer)/farmer/products/page.tsx`

**Features:**
- Display all farmer's products in a grid/table
- Filter by status (ACTIVE, DRAFT, ARCHIVED)
- Search products by name
- Quick actions (Edit, Delete, Archive)
- Product stats (views, sales, inventory)
- "Add New Product" button

**Test Attributes:**
- `data-testid="product-list"`
- `data-testid="product-card-{id}"`
- `data-testid="add-product-button"`
- `data-testid="edit-product-{id}"`
- `data-testid="delete-product-{id}"`

---

### 2. Product Creation Page (`/farmer/products/new`)
**File:** `src/app/(farmer)/farmer/products/new/page.tsx`

**Features:**
- Full product creation form
- Image upload with preview
- Category selection
- Price and inventory management
- Save as draft or publish
- Form validation

**Required Form Fields (with exact IDs for bot compatibility):**
```typescript
{
  id: "name",              // Product name (required)
  id: "description",       // Product description (required)
  id: "price",            // Price in dollars (required)
  id: "category",         // Category select (required)
  id: "stock",            // Stock quantity (alt: "quantity")
  id: "unit",             // Unit of measure (lb, oz, bunch, etc.)
  id: "sku",              // SKU (optional)
  id: "image",            // Image upload input (type="file")
}
```

---

### 3. Product Edit Page (`/farmer/products/[id]/edit`)
**File:** `src/app/(farmer)/farmer/products/[id]/edit/page.tsx`

**Features:**
- Pre-filled form with existing product data
- Update all product fields
- Replace product images
- Version history (optional)
- Delete product option

---

### 4. Product Form Component
**File:** `src/components/features/products/ProductForm.tsx`

**Reusable form component for both create and edit:**

```typescript
interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  farmId: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
  sku?: string;
  images: File[] | string[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}
```

**Validation Rules:**
- Name: 3-100 characters, required
- Description: 10-2000 characters, required
- Price: Positive number, max 2 decimals, required
- Category: Must exist in categories list, required
- Stock: Non-negative integer, required
- Unit: From predefined list (lb, oz, kg, bunch, each), required
- Images: Max 5 images, max 5MB each, JPG/PNG/WEBP only

---

## 🔌 API ENDPOINTS

### 1. Create Product - `POST /api/products`
**File:** `src/app/api/products/route.ts` (update existing)

```typescript
Request Body:
{
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  unit: string;
  sku?: string;
  farmId: string;
  images?: string[]; // URLs after upload
  status: 'DRAFT' | 'ACTIVE';
}

Response:
{
  success: true;
  data: {
    id: string;
    name: string;
    slug: string;
    // ... full product object
  }
}
```

**Business Logic:**
1. Validate user is farmer and owns the farm
2. Validate all required fields
3. Check for duplicate SKU within farm
4. Generate unique slug from product name
5. Create product in database
6. Link to category
7. Update farm's product count
8. Return created product

---

### 2. Update Product - `PUT /api/products/[id]`
**File:** `src/app/api/products/[id]/route.ts` (update existing)

```typescript
Request Body:
{
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  stock?: number;
  unit?: string;
  sku?: string;
  images?: string[];
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

Response:
{
  success: true;
  data: Product;
}
```

**Business Logic:**
1. Verify product exists
2. Verify user owns the farm
3. Validate updated fields
4. Update slug if name changed
5. Update product in database
6. Return updated product

---

### 3. Delete Product - `DELETE /api/products/[id]`
**File:** `src/app/api/products/[id]/route.ts` (update existing)

```typescript
Response:
{
  success: true;
  message: "Product deleted successfully"
}
```

**Business Logic:**
1. Verify ownership
2. Check for active orders
3. Soft delete (set status to ARCHIVED) if has orders
4. Hard delete if no order history
5. Update farm's product count

---

### 4. Get Farmer Products - `GET /api/products?farmId={id}`
**File:** `src/app/api/products/route.ts` (update existing)

```typescript
Query Params:
- farmId: string (filter by farm)
- status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' (optional)
- search: string (optional)
- page: number (default: 1)
- pageSize: number (default: 20)

Response:
{
  success: true;
  data: Product[];
  meta: {
    pagination: {
      page: 1,
      pageSize: 20,
      totalPages: 3,
      totalItems: 45,
      hasNext: true,
      hasPrevious: false
    }
  }
}
```

---

## 📸 IMAGE UPLOAD SYSTEM

### 1. Image Upload Endpoint - `POST /api/upload/images`
**File:** `src/app/api/upload/images/route.ts` (new)

**Features:**
- Accept multipart/form-data
- Validate file types (JPG, PNG, WEBP)
- Validate file size (max 5MB per file)
- Resize images (800x800 for product, 200x200 for thumbnail)
- Upload to storage (local or S3/Cloudinary)
- Return image URLs

```typescript
Request:
Content-Type: multipart/form-data
- files: File[] (up to 5 files)
- productId?: string (optional, for organizing)

Response:
{
  success: true;
  data: {
    images: [
      {
        url: "https://storage.../product_123_1.jpg",
        thumbnail: "https://storage.../product_123_1_thumb.jpg",
        filename: "product_123_1.jpg",
        size: 245678
      }
    ]
  }
}
```

---

### 2. Image Upload Service
**File:** `src/lib/services/image-upload.service.ts` (new)

```typescript
export class ImageUploadService {
  async uploadProductImages(files: File[]): Promise<ImageUploadResult[]> {
    // Validate files
    // Resize images
    // Generate unique filenames
    // Upload to storage
    // Return URLs
  }

  async deleteImage(url: string): Promise<void> {
    // Remove from storage
  }

  private async resizeImage(file: File, width: number, height: number): Promise<Buffer> {
    // Use sharp or similar library
  }
}
```

**Dependencies:**
```bash
npm install sharp
npm install @aws-sdk/client-s3 # if using S3
# OR
npm install cloudinary # if using Cloudinary
```

---

## 🎨 UI COMPONENTS

### 1. Product Form UI
**File:** `src/components/features/products/ProductForm.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Product Information                             │
│  ┌────────────────────────────────────────┐    │
│  │ Product Name *                          │    │
│  └────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────┐    │
│  │ Description *                           │    │
│  │                                         │    │
│  │                                         │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  Pricing & Inventory                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Price │  │Stock │  │Unit  │  │SKU   │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                  │
│  Categorization                                  │
│  ┌────────────────────────────────────────┐    │
│  │ Category *          [Dropdown]          │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  Product Images                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ +  │ │    │ │    │ │    │ │    │           │
│  └────┘ └────┘ └────┘ └────┘ └────┘           │
│  Upload up to 5 images                          │
│                                                  │
│  ┌────────────┐  ┌────────────┐                │
│  │ Save Draft │  │   Publish  │                │
│  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────┘
```

---

### 2. Product Card Component
**File:** `src/components/features/products/ProductCard.tsx`

**For displaying products in list view:**

```typescript
interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

<ProductCard
  product={product}
  data-testid={`product-card-${product.id}`}
  showActions={true}
/>
```

**Display:**
- Product image (with fallback)
- Product name
- Price
- Stock level with color coding (red < 10, yellow < 50, green >= 50)
- Category badge
- Status badge (DRAFT/ACTIVE/ARCHIVED)
- Quick actions (Edit, Delete)

---

### 3. Image Upload Component
**File:** `src/components/features/products/ImageUpload.tsx`

**Features:**
- Drag & drop support
- Multiple file selection
- Image preview before upload
- Progress indicator
- Remove image option
- Reorder images (drag & drop)

```typescript
interface ImageUploadProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  onUpload: (files: File[]) => Promise<string[]>;
  existingImages?: string[];
  onChange: (images: string[]) => void;
}
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests
**File:** `tests/unit/components/ProductForm.test.tsx`

```typescript
describe('ProductForm', () => {
  it('should render all required fields', () => {
    // Verify all fields present
  });

  it('should validate required fields', () => {
    // Submit empty form, check errors
  });

  it('should validate price format', () => {
    // Test invalid prices
  });

  it('should validate stock quantity', () => {
    // Test negative stock
  });

  it('should submit valid form data', () => {
    // Fill form, submit, verify API call
  });
});
```

---

### Integration Tests
**File:** `tests/integration/api/products.test.ts`

```typescript
describe('POST /api/products', () => {
  it('should create product with valid data', async () => {
    const response = await authenticatedFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(validProductData)
    });
    expect(response.status).toBe(201);
  });

  it('should reject product from non-farmer', async () => {
    // Test with customer role
    expect(response.status).toBe(403);
  });

  it('should validate required fields', async () => {
    // Test with missing fields
    expect(response.status).toBe(400);
  });
});
```

---

### E2E Tests (MVP Bot)
**File:** `scripts/mvp-validation-bot.ts` (existing)

**Test Flow:**
```typescript
// 1. Login as farmer
await page.goto('/login');
await page.fill('#email', 'farmer@example.com');
await page.fill('#password', 'password');
await page.click('button[type="submit"]');

// 2. Navigate to products
await page.goto('/farmer/products/new');

// 3. Fill product form
await page.fill('#name', 'Organic Tomatoes');
await page.fill('#description', 'Fresh organic tomatoes from our farm');
await page.fill('#price', '4.99');
await page.selectOption('#category', 'Vegetables');
await page.fill('#stock', '100');
await page.selectOption('#unit', 'lb');

// 4. Upload image (optional for basic test)
// await page.setInputFiles('#image', './test-image.jpg');

// 5. Submit form
await page.click('button[type="submit"]');

// 6. Verify success
await expect(page.locator('text=Product created successfully')).toBeVisible();
await expect(page).toHaveURL(/\/farmer\/products\/prod_\w+/);
```

---

## 📊 DATABASE SCHEMA VERIFICATION

Ensure Prisma schema has required fields:

```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String   @db.Text
  price         Decimal  @db.Decimal(10, 2)
  stock         Int      @default(0)
  unit          String   // 'lb', 'oz', 'kg', 'bunch', 'each'
  sku           String?  @unique
  status        ProductStatus @default(ACTIVE) // ACTIVE, DRAFT, ARCHIVED

  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])

  farmId        String
  farm          Farm     @relation(fields: [farmId], references: [id])

  images        ProductImage[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([farmId])
  @@index([categoryId])
  @@index([status])
  @@index([slug])
}

model ProductImage {
  id         String   @id @default(cuid())
  url        String
  thumbnail  String
  filename   String
  size       Int
  order      Int      @default(0)

  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())

  @@index([productId])
}

enum ProductStatus {
  ACTIVE
  DRAFT
  ARCHIVED
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### Authorization Checks
```typescript
// Verify user is farmer
if (session.user.role !== 'FARMER') {
  return { error: 'Only farmers can create products' };
}

// Verify user owns the farm
const farm = await database.farm.findUnique({
  where: { id: farmId },
  select: { ownerId: true }
});

if (farm.ownerId !== session.user.id) {
  return { error: 'You do not own this farm' };
}
```

### Input Validation
```typescript
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive().multipleOf(0.01),
  categoryId: z.string().cuid(),
  stock: z.number().int().nonnegative(),
  unit: z.enum(['lb', 'oz', 'kg', 'g', 'bunch', 'each', 'dozen']),
  sku: z.string().max(50).optional(),
  farmId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'DRAFT']).default('ACTIVE')
});
```

### File Upload Security
```typescript
// Validate file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Validate file size (5MB max)
const MAX_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}

// Sanitize filename
const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Step 1: API Endpoints (2 hours)
- [ ] Update `POST /api/products` endpoint
- [ ] Update `PUT /api/products/[id]` endpoint
- [ ] Update `DELETE /api/products/[id]` endpoint
- [ ] Update `GET /api/products` with farmer filtering
- [ ] Create `POST /api/upload/images` endpoint
- [ ] Test all endpoints with Postman/curl

### Step 2: Product Form Component (1.5 hours)
- [ ] Create `ProductForm.tsx` component
- [ ] Add all required form fields with correct IDs
- [ ] Implement client-side validation
- [ ] Add error handling and display
- [ ] Add loading states
- [ ] Test form submission

### Step 3: Product Pages (1.5 hours)
- [ ] Create `/farmer/products` list page
- [ ] Create `/farmer/products/new` page
- [ ] Create `/farmer/products/[id]/edit` page
- [ ] Add navigation between pages
- [ ] Add test attributes to all elements

### Step 4: Image Upload (1 hour)
- [ ] Create `ImageUpload.tsx` component
- [ ] Implement drag & drop
- [ ] Add image preview
- [ ] Integrate with upload endpoint
- [ ] Add error handling

### Step 5: Testing (1 hour)
- [ ] Write unit tests for ProductForm
- [ ] Write integration tests for API endpoints
- [ ] Run MVP bot to verify farmer product test passes
- [ ] Manual testing of full flow
- [ ] Fix any bugs found

### Step 6: Polish & Documentation (30 min)
- [ ] Add loading skeletons
- [ ] Add success/error toast notifications
- [ ] Update documentation
- [ ] Add code comments
- [ ] Git commit and push

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables
```env
# Image Upload
UPLOAD_MAX_SIZE_MB=5
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# Storage (choose one)
# Local Storage
UPLOAD_DIR=./public/uploads/products

# OR AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=farmersmarket-products
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Database Migrations
```bash
# If schema changes are needed
npx prisma migrate dev --name add_product_fields

# Push schema to database
npx prisma db push

# Seed with categories if needed
npm run db:seed
```

---

## 📈 SUCCESS METRICS

### Before Implementation
- MVP Bot Success Rate: 33% (2/6 tests passing)
- Farmer Product Test: ❌ FAIL

### After Implementation
- MVP Bot Success Rate: 50%+ (3/6 tests passing)
- Farmer Product Test: ✅ PASS
- Average form completion time: < 2 minutes
- Image upload success rate: > 95%
- API response time: < 500ms

---

## 🔗 RELATED DOCUMENTATION

- **API Documentation:** `docs/API.md`
- **Database Schema:** `prisma/schema.prisma`
- **Component Library:** `src/components/README.md`
- **Testing Guide:** `docs/TESTING.md`
- **MVP Bot Reference:** `docs/BOT_QUICK_REFERENCE.md`

---

## 💡 TIPS & BEST PRACTICES

1. **Use React Server Components** for data fetching on product list page
2. **Use Client Components** for forms with interactivity
3. **Implement optimistic updates** for better UX
4. **Add loading skeletons** instead of spinners
5. **Use Zod** for both client and server validation
6. **Cache product lists** with 5-minute revalidation
7. **Compress images** before upload to save bandwidth
8. **Add analytics** to track product creation success rate
9. **Use toast notifications** for user feedback
10. **Add keyboard shortcuts** for power users (Ctrl+S to save)

---

**Status:** Ready to implement
**Next Phase:** Phase 4 - Customer Browse & Search
**Estimated Total Time:** 4-6 hours
**Priority:** P0 - Must complete before launch
