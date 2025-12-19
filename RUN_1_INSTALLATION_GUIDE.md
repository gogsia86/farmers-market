# 🚀 RUN 1: CORE INFRASTRUCTURE - INSTALLATION GUIDE

**Quick Start**: Get Run 1 components integrated and running in 10 minutes

---

## 📦 STEP 1: INSTALL DEPENDENCIES

```bash
# Install required packages
npm install react-dropzone @radix-ui/react-toast @radix-ui/react-progress class-variance-authority

# Verify installation
npm list react-dropzone @radix-ui/react-toast @radix-ui/react-progress
```

**Expected Output**:

```
├── react-dropzone@14.2.3
├── @radix-ui/react-toast@1.1.5
├── @radix-ui/react-progress@1.0.3
└── class-variance-authority@0.7.0
```

---

## 🔧 STEP 2: UPDATE ROOT LAYOUT

**File**: `src/app/layout.tsx`

Add the CartProvider and Toaster to your root layout:

```tsx
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartProvider>{children}</CartProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## ✅ STEP 3: VERIFY COMPONENTS EXIST

Check that all files were created:

```bash
# Check Cart Context
ls src/context/CartContext.tsx

# Check Image Upload
ls src/components/shared/ImageUpload.tsx

# Check Error Handler
ls src/lib/api/error-handler.ts

# Check Toast System
ls src/components/ui/toast.tsx
ls src/components/ui/toaster.tsx
ls src/hooks/use-toast.ts

# Check Progress Component
ls src/components/ui/progress.tsx
```

---

## 🔍 STEP 4: VERIFY EXISTING COMPONENTS

These should already exist in your project:

```bash
# Middleware (already exists)
ls src/middleware.ts

# Upload API (already exists)
ls src/app/api/upload/route.ts

# Error Boundary (already exists)
ls src/components/ErrorBoundary.tsx
```

---

## 🧪 STEP 5: TEST INTEGRATION

### Test 1: Cart Context

Create a test file: `src/app/test-cart/page.tsx`

```tsx
"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function TestCartPage() {
  const { addItem, items, totalAmount, removeItem } = useCart();

  const testProduct = {
    productId: "test-1",
    name: "Test Tomatoes",
    price: 5.99,
    maxStock: 10,
    farmName: "Test Farm",
    farmId: "farm-1",
    image: "/placeholder.jpg",
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cart Test</h1>

      <Button onClick={() => addItem(testProduct, 1)}>Add Test Product</Button>

      <div className="mt-4">
        <p>Items in cart: {items.length}</p>
        <p>Total: ${totalAmount.toFixed(2)}</p>
      </div>

      <div className="mt-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 items-center">
            <span>
              {item.name} x {item.quantity}
            </span>
            <Button onClick={() => removeItem(item.productId)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Visit**: http://localhost:3000/test-cart

**Expected**:

- ✅ Click "Add Test Product" → Toast appears
- ✅ Item appears in cart list
- ✅ Total updates
- ✅ Refresh page → Cart persists
- ✅ Click "Remove" → Item removed with toast

---

### Test 2: Toast System

Create: `src/app/test-toast/page.tsx`

```tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function TestToastPage() {
  const { toast } = useToast();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Toast Test</h1>

      <Button onClick={() => toast.success("Success!", "Operation completed")}>
        Success Toast
      </Button>

      <Button onClick={() => toast.error("Error!", "Something went wrong")}>
        Error Toast
      </Button>

      <Button onClick={() => toast.warning("Warning!", "Please be careful")}>
        Warning Toast
      </Button>

      <Button onClick={() => toast.info("Info", "Here is some information")}>
        Info Toast
      </Button>

      <Button
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: "Processing...",
            success: "Done!",
            error: "Failed!",
          })
        }
      >
        Promise Toast
      </Button>
    </div>
  );
}
```

**Visit**: http://localhost:3000/test-toast

**Expected**:

- ✅ Each button shows different toast variant
- ✅ Toasts auto-dismiss after 5 seconds
- ✅ Promise toast shows loading → success
- ✅ Multiple toasts stack (max 5)

---

### Test 3: Image Upload

Create: `src/app/test-upload/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";

export default function TestUploadPage() {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Upload Test</h1>

      <ImageUpload folder="test" maxFiles={3} onUploadComplete={setUrls} />

      <div className="mt-4">
        <p className="font-semibold">Uploaded URLs:</p>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {JSON.stringify(urls, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

**Visit**: http://localhost:3000/test-upload

**Expected**:

- ✅ Drag & drop area appears
- ✅ Click to select files works
- ✅ Progress bars show during upload
- ✅ Thumbnails appear after upload
- ✅ Remove button works
- ✅ URLs logged in console

---

### Test 4: Error Handler

Create: `src/app/api/test-error/route.ts`

```typescript
import {
  asyncHandler,
  NotFoundError,
  ValidationError,
} from "@/lib/api/error-handler";
import { NextResponse } from "next/server";

export const GET = asyncHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const errorType = searchParams.get("type");

  switch (errorType) {
    case "not-found":
      throw new NotFoundError("Resource not found");

    case "validation":
      throw new ValidationError("Invalid input data");

    case "server":
      throw new Error("Something went wrong");

    default:
      return NextResponse.json({ message: "Test endpoint working" });
  }
});
```

**Test with cURL**:

```bash
# Success
curl http://localhost:3000/api/test-error

# Not Found Error
curl http://localhost:3000/api/test-error?type=not-found

# Validation Error
curl http://localhost:3000/api/test-error?type=validation

# Server Error
curl http://localhost:3000/api/test-error?type=server
```

**Expected Response Format**:

```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "path": "/api/test-error"
}
```

---

### Test 5: Middleware

**Test Protected Routes**:

1. **Logout** (if logged in)
2. **Try to access**: http://localhost:3000/dashboard
3. **Expected**: Redirect to `/login?callbackUrl=/dashboard`

4. **Login as FARMER**
5. **Try to access**: http://localhost:3000/dashboard/admin
6. **Expected**: Redirect to `/dashboard?error=insufficient_permissions`

7. **Login as ADMIN**
8. **Try to access**: http://localhost:3000/dashboard/admin
9. **Expected**: Access granted

---

## 🎯 STEP 6: UPDATE EXISTING API ROUTES

Replace manual error handling with `asyncHandler`:

**Before**:

```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json();
    // ... logic
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
```

**After**:

```typescript
import { asyncHandler, NotFoundError } from "@/lib/api/error-handler";

export const POST = asyncHandler(async (req) => {
  const data = await req.json();
  // ... logic
  if (!result) throw new NotFoundError("Item not found");
  return NextResponse.json(result);
});
```

---

## 🔍 STEP 7: VERIFY CLOUDINARY CONFIG

Check that Cloudinary environment variables are set:

**File**: `.env.local`

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Test Upload API**:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg" \
  -F "folder=test"
```

**Expected Response**:

```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "test/...",
  "width": 800,
  "height": 600
}
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Cannot find module 'react-dropzone'"

**Solution**:

```bash
npm install react-dropzone
```

### Issue 2: Toast not appearing

**Solution**: Verify `<Toaster />` is in root layout:

```tsx
// src/app/layout.tsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster /> {/* Must be here */}
      </body>
    </html>
  );
}
```

### Issue 3: Cart not persisting

**Solution**: Check localStorage in DevTools:

- Open DevTools → Application → Local Storage
- Look for key: `farmers-market-cart`
- Should contain JSON array of cart items

### Issue 4: Image upload fails

**Solution**: Check Cloudinary credentials:

```bash
# Verify env vars are loaded
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Check upload API logs
npm run dev
# Upload image and check terminal output
```

### Issue 5: Middleware redirects not working

**Solution**: Check NextAuth configuration:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  // ...
  secret: process.env.NEXTAUTH_SECRET, // Must be set
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        role: token.role, // Must include role
      },
    }),
  },
};
```

### Issue 6: TypeScript errors

**Solution**: Add type definitions:

```typescript
// src/types/cart.ts
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  farmName: string;
  farmId: string;
  image?: string;
  category?: string;
}
```

---

## ✅ VERIFICATION CHECKLIST

After installation, verify each component:

- [ ] **Dependencies installed** (npm list shows all packages)
- [ ] **CartProvider wrapped in layout**
- [ ] **Toaster added to layout**
- [ ] **Cart test page works** (add/remove items)
- [ ] **Toast test page works** (all variants appear)
- [ ] **Image upload test works** (files upload successfully)
- [ ] **Error handler test works** (proper error responses)
- [ ] **Middleware works** (protected routes redirect)
- [ ] **Cart persists** (survives page refresh)
- [ ] **No TypeScript errors** (npm run build succeeds)

---

## 🚀 NEXT STEPS

Once all checks pass, you're ready for **Run 2: Search & Discovery**!

**Next components**:

1. Product Filters UI
2. Search API with pagination
3. Loading Skeletons
4. React Query Setup

---

## 📚 ADDITIONAL RESOURCES

### Documentation

- [React Dropzone](https://react-dropzone.js.org/)
- [Radix UI Toast](https://www.radix-ui.com/primitives/docs/components/toast)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### Example Implementations

- Cart Context: `src/context/CartContext.tsx`
- Image Upload: `src/components/shared/ImageUpload.tsx`
- Error Handler: `src/lib/api/error-handler.ts`
- Toast Hook: `src/hooks/use-toast.ts`

### Support

- Check existing tests: `src/__tests__/`
- Review error logs: `npm run dev` terminal output
- Debug with DevTools: Console, Network, Application tabs

---

**Installation Time**: ~10 minutes  
**Testing Time**: ~15 minutes  
**Total**: ~25 minutes to complete Run 1

✅ **Status**: Ready for integration
