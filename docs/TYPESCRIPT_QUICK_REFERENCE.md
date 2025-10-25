# 🚀 TYPESCRIPT QUICK REFERENCE

**Fast lookup for common TypeScript patterns in Farmers Market**

---

## 🎯 NULL SAFETY CHEATSHEET

```typescript
// Optional chaining
const value = obj?.prop?.nested?.value;

// Nullish coalescing
const result = value ?? "default";

// Both together
const name = user?.profile?.name ?? "Anonymous";

// Array access
const firstItem = array?.[0];

// Function calls
const result = fn?.();
```

---

## 🔄 PRISMA QUICK PATTERNS

```typescript
// Find one
const user = await database.user.findUnique({
  where: { id },
  include: { farms: true, orders: true },
});

// Find many with filters
const products = await database.product.findMany({
  where: {
    category: "VEGETABLES",
    inStock: true,
  },
  take: 20,
  skip: offset,
  orderBy: { createdAt: "desc" },
});

// Create with relations
const farm = await database.farm.create({
  data: {
    name: "New Farm",
    owner: { connect: { id: userId } },
  },
});

// Update
const updated = await database.user.update({
  where: { id },
  data: { name: "New Name" },
});

// Count
const total = await database.product.count({
  where: { farmId },
});
```

---

## 🎨 COMPONENT PROPS

```typescript
// Basic props
interface Props {
  readonly title: string;
  readonly count: number;
}

// With children
interface Props {
  readonly children: React.ReactNode;
}

// Extend HTML element
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant: "primary" | "secondary";
}

// Optional props
interface Props {
  readonly required: string;
  readonly optional?: string;
}
```

---

## 🌐 API ROUTES

```typescript
// GET handler
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q") || "";

  const data = await fetchData(query);
  return NextResponse.json(data);
}

// POST handler
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = schema.parse(body);

  const result = await createItem(validated);
  return NextResponse.json(result, { status: 201 });
}

// Error response
return NextResponse.json({ error: "Message" }, { status: 400 });
```

---

## 📝 ZOD VALIDATION

```typescript
import { z } from "zod";

// Basic schema
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

// Parse (throws on error)
const data = schema.parse(input);

// Safe parse
const result = schema.safeParse(input);
if (!result.success) {
  console.log(result.error.issues);
} else {
  console.log(result.data);
}

// Enum
const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

// Array
const arraySchema = z.array(z.string());

// Union
const unionSchema = z.union([z.string(), z.number()]);
```

---

## 🎭 TYPE GUARDS

```typescript
// Check if value is defined
if (value !== null && value !== undefined) {
  // value is defined
}

// Better: type guard function
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

if (isDefined(user)) {
  console.log(user.name); // TypeScript knows user exists
}

// Check array
if (Array.isArray(value)) {
  value.forEach(item => { ... });
}

// instanceof check
if (error instanceof Error) {
  console.log(error.message);
}
```

---

## 🔧 UTILITY TYPES

```typescript
// Partial - all optional
type UpdateUser = Partial<User>;

// Required - all required
type RequiredUser = Required<User>;

// Pick - select fields
type UserName = Pick<User, "name" | "email">;

// Omit - exclude fields
type UserWithoutPassword = Omit<User, "password">;

// Record - object with specific shape
type UserMap = Record<string, User>;

// ReturnType - infer return type
type Result = ReturnType<typeof myFunction>;
```

---

## ⚡ COMMON FIXES

### searchParams Error

```typescript
// ❌ Error: Object is possibly 'null'
const params = new URLSearchParams(searchParams.toString());

// ✅ Fix
const params = new URLSearchParams(searchParams?.toString() || "");
```

### Prisma Field Mismatch

```typescript
// ❌ Error: Property 'farm' does not exist
const user = await database.user.findUnique({
  where: { id },
  include: { farm: true }, // ❌ Schema has 'farms' not 'farm'
});

// ✅ Fix: Check schema.prisma
const user = await database.user.findUnique({
  where: { id },
  include: { farms: true }, // ✅ Match schema
});
```

### Credentials Type Error

```typescript
// ❌ Error: Type 'string | undefined'
const user = await database.user.findUnique({
  where: { email: credentials.email },
});

// ✅ Fix: Explicit casting
const user = await database.user.findUnique({
  where: { email: credentials.email as string },
});
```

### Zod Error Access

```typescript
// ❌ Error: Property 'errors' does not exist
console.log(validation.error.errors);

// ✅ Fix: Use 'issues'
console.log(validation.error.issues);
```

---

## 📚 QUICK COMMANDS

```bash
# Check types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch

# Check specific file
npx tsc --noEmit src/app/page.tsx

# Count errors
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

---

## 🔗 RELATED DOCS

- [Full Best Practices Guide](./TYPESCRIPT_BEST_PRACTICES.md)
- [TypeScript Fix Report](../TYPESCRIPT_FIX_REPORT.md)
- [Divine Core Principles](../.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md)

---

**Last Updated**: October 25, 2025
