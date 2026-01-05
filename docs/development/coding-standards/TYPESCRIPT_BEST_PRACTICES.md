# 📘 TYPESCRIPT BEST PRACTICES GUIDE

**Farmers Market Platform - Divine TypeScript Excellence**

---

## 🎯 TABLE OF CONTENTS

1. [Null Safety](#null-safety)
2. [Type Assertions](#type-assertions)
3. [Prisma Schema Alignment](#prisma-schema-alignment)
4. [Component Props](#component-props)
5. [API Route Types](#api-route-types)
6. [Error Handling](#error-handling)
7. [Import Paths](#import-paths)
8. [Common Pitfalls](#common-pitfalls)

---

## 1️⃣ NULL SAFETY

### ✅ Always Check Optional Values

```typescript
// ❌ BAD - Can crash if searchParams is null
const query = searchParams.get("q");

// ✅ GOOD - Safe null handling
const query = searchParams?.get("q") || "";

// ✅ BETTER - Explicit undefined check
const query = searchParams?.get("q") ?? "";
```

### URLSearchParams Patterns

```typescript
// ❌ BAD
function Component({ searchParams }: { searchParams: URLSearchParams }) {
  const params = new URLSearchParams(searchParams.toString());
}

// ✅ GOOD
function Component({ searchParams }: { searchParams: URLSearchParams | null }) {
  const params = new URLSearchParams(searchParams?.toString() || "");
}
```

### Optional Chaining Best Practices

```typescript
// ✅ Access nested properties safely
const farmName = user?.farms?.[0]?.name || "No farm";

// ✅ Method calls
const upperName = product?.name?.toUpperCase() || "";

// ✅ Array access
const firstImage = product?.images?.[0] ?? "/placeholder.jpg";
```

---

## 2️⃣ TYPE ASSERTIONS

### When to Use `as`

```typescript
// ✅ GOOD - When you know the exact type
const status = (isActive ? "ACTIVE" : "INACTIVE") as ProductStatus;

// ✅ GOOD - Casting to more specific type
const farmId = params.id as FarmId;

// ❌ BAD - Avoiding type checking
const anything = someValue as any;
```

### Type Narrowing (Better than Assertions)

```typescript
// ✅ BETTER - Use type guards
function isProductAvailable(state: string): state is "AVAILABLE" | "IN_STOCK" {
  return state === "AVAILABLE" || state === "IN_STOCK";
}

if (isProductAvailable(product.state)) {
  // TypeScript knows state is one of the valid values
  console.log(product.state); // Type-safe!
}
```

### Const Assertions

```typescript
// ✅ Create readonly literal types
const SEASONS = ["SPRING", "SUMMER", "FALL", "WINTER"] as const;
type Season = (typeof SEASONS)[number]; // "SPRING" | "SUMMER" | "FALL" | "WINTER"

// ✅ Object literals
const CONFIG = {
  maxProducts: 100,
  cacheTime: 3600,
} as const;
```

---

## 3️⃣ PRISMA SCHEMA ALIGNMENT

### Always Check Your Schema

```prisma
// schema.prisma
model User {
  id     String  @id
  farms  Farm[]  // ✅ Array relationship (plural)
  orders Order[] // ✅ Array relationship (plural)
}

model Farm {
  id      String  @id
  owner   User    @relation(fields: [ownerId], references: [id])
  ownerId String
}
```

### Correct TypeScript Usage

```typescript
// ❌ BAD - Assumes singular
const farm = await database.user.findUnique({
  where: { id },
  include: { farm: true }, // ❌ Schema has 'farms' not 'farm'
});

// ✅ GOOD - Matches schema
const user = await database.user.findUnique({
  where: { id },
  include: {
    farms: true, // ✅ Plural matches schema
    orders: true, // ✅ Plural matches schema
  },
});

// Usage
if (user.farms.length > 0) {
  console.log(user.farms[0].name);
}
```

### Include vs Select

```typescript
// ✅ Use 'select' for specific fields
const user = await database.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    farms: {
      select: {
        id: true,
        name: true,
      },
      take: 1, // Get only first farm
    },
  },
});

// ✅ Use 'include' for relations
const product = await database.product.findUnique({
  where: { id },
  include: {
    farm: true, // Include full farm object
    reviews: true, // Include all reviews
  },
});
```

---

## 4️⃣ COMPONENT PROPS

### Readonly Props Pattern

```typescript
// ✅ DIVINE PATTERN - Readonly props
interface QuantumButtonProps {
  readonly variant: "primary" | "secondary";
  readonly size: "sm" | "md" | "lg";
  readonly onClick?: () => void;
  readonly children: React.ReactNode;
}

export function QuantumButton(props: Readonly<QuantumButtonProps>) {
  // Props are immutable
}
```

### Extending HTML Elements

```typescript
// ✅ Extend native element props
interface QuantumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
}

export function QuantumInput({
  label,
  error,
  ...inputProps
}: QuantumInputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span>{error}</span>}
    </div>
  );
}
```

### Optional vs Required

```typescript
// ✅ Make intent clear
interface FarmProfileProps {
  // Required props
  readonly farmId: string;
  readonly farmName: string;

  // Optional props
  readonly showLocation?: boolean;
  readonly onUpdate?: (farm: Farm) => void;

  // With default values
  readonly variant?: "default" | "compact"; // defaults to "default"
}
```

---

## 5️⃣ API ROUTE TYPES

### Next.js 14 Route Handlers

```typescript
import { NextRequest, NextResponse } from "next/server";

// ✅ Type the request and response
export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    // Type your response data
    const data: { products: Product[]; total: number } = {
      products: await fetchProducts(query),
      total: await countProducts(query),
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// ✅ POST with typed body
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductInput = await request.json();

    // Validate with Zod
    const validated = productSchema.parse(body);

    const product = await database.product.create({
      data: validated,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
}
```

### Dynamic Routes

```typescript
// app/products/[id]/page.tsx
interface PageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ProductPage({
  params,
  searchParams
}: PageProps) {
  const product = await getProduct(params.id);
  const variant = searchParams?.variant || "default";

  return <ProductView product={product} variant={variant} />;
}

// ✅ Generate metadata
export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: `${product.name} | Farmers Market`,
    description: product.description,
  };
}
```

---

## 6️⃣ ERROR HANDLING

### Typed Error Handling

```typescript
// ✅ Create custom error types
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = "NotFoundError";
  }
}

// ✅ Type-safe error checking
try {
  const data = await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation issues:", error.issues);
  } else if (error instanceof NotFoundError) {
    console.log("Resource not found:", error.message);
  } else if (error instanceof Error) {
    console.log("Generic error:", error.message);
  } else {
    console.log("Unknown error:", error);
  }
}
```

### Zod Error Handling

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

// ✅ Safe parsing
const result = schema.safeParse(data);

if (!result.success) {
  // Access error details
  console.log(result.error.issues); // ✅ 'issues' not 'errors'

  // Format for API response
  return {
    error: "Validation failed",
    details: result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

// Use validated data
const validData = result.data;
```

---

## 7️⃣ IMPORT PATHS

### Path Aliases Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Correct Import Patterns

```typescript
// ✅ GOOD - Use path aliases
import { database } from "@/lib/database";
import { Season } from "@/types/agricultural";
import { QuantumButton } from "@/components/ui/QuantumButton";

// ❌ BAD - Relative paths
import { database } from "../../../lib/database";
import { Season } from "../../../types/agricultural";

// ❌ BAD - Wrong extension
import { Season } from "@/types/agricultural.types";

// ❌ BAD - Missing @/ prefix
import { Season } from "types/agricultural";
```

### Type-Only Imports

```typescript
// ✅ Import only types (better tree-shaking)
import type { Product, Farm } from "@/types";
import type { Metadata } from "next";

// ❌ Mixing types and values
import { Product, database } from "@/lib"; // Bad practice
```

---

## 8️⃣ COMMON PITFALLS

### 1. Forgetting Async/Await

```typescript
// ❌ BAD - Missing await
const user = database.user.findUnique({ where: { id } });
console.log(user.name); // Error: user is a Promise!

// ✅ GOOD
const user = await database.user.findUnique({ where: { id } });
console.log(user?.name);
```

### 2. Array Methods Return Type

```typescript
// ❌ BAD - find() can return undefined
const product = products.find((p) => p.id === id);
console.log(product.name); // May crash!

// ✅ GOOD
const product = products.find((p) => p.id === id);
if (product) {
  console.log(product.name);
}

// ✅ BETTER - With default
const product = products.find((p) => p.id === id) ?? defaultProduct;
```

### 3. Enum vs Union Types

```typescript
// ❌ Use enums sparingly
enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ✅ BETTER - Union types
type ProductStatus = "ACTIVE" | "INACTIVE";

// ✅ With const array for iteration
const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
type ProductStatus = (typeof PRODUCT_STATUSES)[number];
```

### 4. Mutating Props

```typescript
// ❌ BAD - Mutating props
function Component({ items }: { items: string[] }) {
  items.push("new"); // Mutates parent's array!
  return <div>{items.length}</div>;
}

// ✅ GOOD - Create new array
function Component({ items }: { readonly items: readonly string[] }) {
  const newItems = [...items, "new"];
  return <div>{newItems.length}</div>;
}
```

### 5. Type vs Interface

```typescript
// ✅ Use 'type' for unions, primitives, tuples
type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
type Coordinate = [number, number];
type ID = string | number;

// ✅ Use 'interface' for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Extend interfaces
interface Farmer extends User {
  farmId: string;
  certifications: string[];
}
```

---

## 🎓 ADVANCED PATTERNS

### Branded Types

```typescript
// Create distinct types from primitives
type UserId = string & { readonly brand: unique symbol };
type FarmId = string & { readonly brand: unique symbol };

function getUserId(id: string): UserId {
  return id as UserId;
}

// ✅ Type safety
const userId = getUserId("user-123");
const farmId = "farm-456" as FarmId;

// These can't be mixed!
function getUser(id: UserId) { ... }
// getUser(farmId); // ❌ Type error!
```

### Conditional Types

```typescript
// Type changes based on condition
type ResponseData<T extends boolean> = T extends true
  ? { success: true; data: Product[] }
  : { success: false; error: string };

async function fetchProducts<T extends boolean>(
  shouldSucceed: T,
): Promise<ResponseData<T>> {
  if (shouldSucceed) {
    return { success: true, data: [] } as ResponseData<T>;
  }
  return { success: false, error: "Failed" } as ResponseData<T>;
}
```

### Mapped Types

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Usage
interface Product {
  id: string;
  name: string;
  price: number;
}

type UpdateProduct = Partial<Product>; // All optional
type ImmutableProduct = Readonly<Product>; // All readonly
```

---

## ✅ CHECKLIST

Before committing TypeScript code:

- [ ] No `any` types (unless absolutely necessary)
- [ ] Null checks on optional values (`?.` operator)
- [ ] Prisma queries match schema.prisma
- [ ] Component props are readonly
- [ ] API routes have typed responses
- [ ] Error handling is type-safe
- [ ] Import paths use `@/` aliases
- [ ] Zod validation for user input
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)

---

## 📚 RESOURCES

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Prisma TypeScript](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/use-custom-model-and-field-names)
- [Zod Documentation](https://zod.dev/)

---

_"Types are not restrictions - they are divine guidance toward perfect code."_

**Last Updated**: October 25, 2025
**Version**: 1.0.0
