# 🎯 TypeScript Usage Patterns & Best Practices

**Version:** 1.0.0  
**Last Updated:** January 10, 2025  
**Status:** ✅ Production Ready  
**Audience:** All Developers

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Type Safety Fundamentals](#type-safety-fundamentals)
3. [Branded Types](#branded-types)
4. [Discriminated Unions](#discriminated-unions)
5. [Type Guards & Narrowing](#type-guards--narrowing)
6. [Generic Patterns](#generic-patterns)
7. [Utility Types](#utility-types)
8. [API Response Types](#api-response-types)
9. [React Component Typing](#react-component-typing)
10. [Server Actions Typing](#server-actions-typing)
11. [Prisma Type Integration](#prisma-type-integration)
12. [Zod Schema Integration](#zod-schema-integration)
13. [Error Handling Patterns](#error-handling-patterns)
14. [Async/Promise Patterns](#asyncpromise-patterns)
15. [Advanced Patterns](#advanced-patterns)
16. [Anti-Patterns](#anti-patterns)
17. [Performance Considerations](#performance-considerations)

---

## 📖 Overview

This guide documents TypeScript patterns used throughout the Farmers Market Platform. All code follows **strict mode** with zero tolerance for `any` types.

### Key Principles

1. **Type Safety First:** Never compromise type safety for convenience
2. **Explicit Over Implicit:** Make types clear and obvious
3. **Domain Modeling:** Use types to model business domain
4. **No `any`:** Use `unknown` for truly dynamic types
5. **Inference Where Clear:** Let TypeScript infer when obvious

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": false
  }
}
```

---

## 🔐 Type Safety Fundamentals

### Never Use `any`

```typescript
// ❌ BAD - Type safety lost
function processData(data: any) {
  return data.value; // No type checking
}

// ✅ GOOD - Use unknown for truly dynamic types
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data structure');
}

// ✅ BETTER - Use generics with constraints
function processData<T extends { value: string }>(data: T): string {
  return data.value;
}

// ✅ BEST - Use Zod for runtime validation
const DataSchema = z.object({
  value: z.string()
});

function processData(data: unknown) {
  const validated = DataSchema.parse(data);
  return validated.value;
}
```

### Explicit Return Types

```typescript
// ❌ BAD - Implicit return type
function getFarm(id: string) {
  return database.farm.findUnique({ where: { id } });
}

// ✅ GOOD - Explicit return type
async function getFarm(id: string): Promise<Farm | null> {
  return await database.farm.findUnique({ where: { id } });
}

// ✅ EXCELLENT - With error handling type
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function getFarm(id: string): Promise<Result<Farm>> {
  try {
    const farm = await database.farm.findUnique({ where: { id } });
    if (!farm) {
      return { success: false, error: new Error('Farm not found') };
    }
    return { success: true, data: farm };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Non-Null Assertions

```typescript
// ❌ BAD - Non-null assertion without validation
function getUser(id: string) {
  const user = users.find(u => u.id === id)!; // Dangerous!
  return user.name;
}

// ✅ GOOD - Proper null checking
function getUser(id: string): string {
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error(`User ${id} not found`);
  }
  return user.name;
}

// ✅ BETTER - Return optional
function getUser(id: string): string | undefined {
  const user = users.find(u => u.id === id);
  return user?.name;
}
```

---

## 🏷️ Branded Types

Branded types prevent mixing incompatible IDs and primitive types.

### Basic Branded Type Pattern

```typescript
// Brand helper
type Brand<K, T> = K & { readonly __brand: T };

// Domain IDs
export type FarmId = Brand<string, "FarmId">;
export type UserId = Brand<string, "UserId">;
export type ProductId = Brand<string, "ProductId">;
export type OrderId = Brand<string, "OrderId">;

// Constructors
export const FarmId = (id: string): FarmId => {
  if (!id.startsWith('farm_')) {
    throw new Error('Invalid FarmId format');
  }
  return id as FarmId;
};

export const UserId = (id: string): UserId => {
  if (!id.startsWith('user_')) {
    throw new Error('Invalid UserId format');
  }
  return id as UserId;
};

// Type guards
export const isFarmId = (id: unknown): id is FarmId => {
  return typeof id === 'string' && id.startsWith('farm_');
};

export const isUserId = (id: unknown): id is UserId => {
  return typeof id === 'string' && id.startsWith('user_');
};
```

### Usage Examples

```typescript
// ✅ Type-safe function signatures
async function getFarm(id: FarmId): Promise<Farm> {
  return database.farm.findUnique({ where: { id } });
}

async function getUser(id: UserId): Promise<User> {
  return database.user.findUnique({ where: { id } });
}

// ✅ Type safety enforced at compile time
const farmId = FarmId("farm_123");
const userId = UserId("user_456");

await getFarm(farmId);  // ✅ OK
await getUser(userId);  // ✅ OK

// ❌ Compile-time error
await getFarm(userId);  // Error: UserId not assignable to FarmId
await getFarm("farm_123");  // Error: string not assignable to FarmId
```

### Branded Types for Business Logic

```typescript
// Price that must be positive
export type PositivePrice = Brand<number, "PositivePrice">;

export const PositivePrice = (value: number): PositivePrice => {
  if (value <= 0) {
    throw new Error('Price must be positive');
  }
  return value as PositivePrice;
};

// Email that has been validated
export type ValidatedEmail = Brand<string, "ValidatedEmail">;

export const ValidatedEmail = (email: string): ValidatedEmail => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email as ValidatedEmail;
};

// Usage
interface Product {
  id: ProductId;
  name: string;
  price: PositivePrice;
  farmerEmail: ValidatedEmail;
}

function createProduct(data: {
  name: string;
  price: number;
  email: string;
}): Product {
  return {
    id: ProductId(`product_${crypto.randomUUID()}`),
    name: data.name,
    price: PositivePrice(data.price),  // Validates > 0
    farmerEmail: ValidatedEmail(data.email)  // Validates format
  };
}
```

---

## 🔀 Discriminated Unions

Use discriminated unions for type-safe state machines and polymorphic data.

### State Machine Pattern

```typescript
// Farm approval workflow
type FarmStatus =
  | { status: 'DRAFT'; draftedAt: Date; draftedBy: UserId }
  | { status: 'PENDING_VERIFICATION'; submittedAt: Date; submittedBy: UserId }
  | { status: 'UNDER_REVIEW'; reviewStartedAt: Date; reviewedBy: UserId }
  | { status: 'ACTIVE'; activatedAt: Date; verifiedBy: UserId; certificateUrl: string }
  | { status: 'SUSPENDED'; suspendedAt: Date; reason: string; suspendedBy: UserId }
  | { status: 'REJECTED'; rejectedAt: Date; reason: string; rejectedBy: UserId }
  | { status: 'ARCHIVED'; archivedAt: Date };

// Type-safe exhaustiveness checking
function handleFarmStatus(farm: FarmStatus): string {
  switch (farm.status) {
    case 'DRAFT':
      return `Draft created ${farm.draftedAt.toLocaleDateString()} by ${farm.draftedBy}`;
    
    case 'PENDING_VERIFICATION':
      return `Submitted ${farm.submittedAt.toLocaleDateString()}`;
    
    case 'UNDER_REVIEW':
      return `Under review by ${farm.reviewedBy} since ${farm.reviewStartedAt.toLocaleDateString()}`;
    
    case 'ACTIVE':
      return `Active since ${farm.activatedAt.toLocaleDateString()}`;
    
    case 'SUSPENDED':
      return `Suspended: ${farm.reason}`;
    
    case 'REJECTED':
      return `Rejected: ${farm.reason}`;
    
    case 'ARCHIVED':
      return `Archived ${farm.archivedAt.toLocaleDateString()}`;
    
    default:
      // TypeScript error if we miss a case
      const _exhaustive: never = farm;
      return _exhaustive;
  }
}
```

### API Response Union Pattern

```typescript
// Success/Error discriminated union
type ApiResponse<T> =
  | { success: true; data: T; meta?: ResponseMeta }
  | { success: false; error: ApiError };

type ApiError = 
  | { code: 'VALIDATION_ERROR'; message: string; fields: Record<string, string[]> }
  | { code: 'NOT_FOUND'; message: string; resource: string; id: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'FORBIDDEN'; message: string; requiredRole?: string }
  | { code: 'INTERNAL_ERROR'; message: string; requestId: string };

// Type-safe response handlers
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data;
  }

  switch (response.error.code) {
    case 'VALIDATION_ERROR':
      throw new ValidationError(response.error.message, response.error.fields);
    
    case 'NOT_FOUND':
      throw new NotFoundError(response.error.resource, response.error.id);
    
    case 'UNAUTHORIZED':
      redirect('/login');
    
    case 'FORBIDDEN':
      throw new ForbiddenError(response.error.message, response.error.requiredRole);
    
    case 'INTERNAL_ERROR':
      throw new InternalError(response.error.message, response.error.requestId);
    
    default:
      const _exhaustive: never = response.error;
      throw new Error('Unknown error');
  }
}
```

### Event Pattern

```typescript
// Domain events
type DomainEvent =
  | { type: 'FARM_CREATED'; farmId: FarmId; ownerId: UserId; timestamp: Date }
  | { type: 'FARM_APPROVED'; farmId: FarmId; approvedBy: UserId; timestamp: Date }
  | { type: 'PRODUCT_CREATED'; productId: ProductId; farmId: FarmId; timestamp: Date }
  | { type: 'ORDER_PLACED'; orderId: OrderId; customerId: UserId; total: number; timestamp: Date }
  | { type: 'ORDER_FULFILLED'; orderId: OrderId; farmerId: UserId; timestamp: Date };

// Type-safe event handler
function handleEvent(event: DomainEvent): void {
  switch (event.type) {
    case 'FARM_CREATED':
      logger.info('Farm created', { farmId: event.farmId, ownerId: event.ownerId });
      break;
    
    case 'FARM_APPROVED':
      notificationService.send(event.farmId, 'Your farm has been approved!');
      break;
    
    case 'PRODUCT_CREATED':
      cache.invalidate(`farm:${event.farmId}:products`);
      break;
    
    case 'ORDER_PLACED':
      emailService.sendOrderConfirmation(event.customerId, event.orderId);
      break;
    
    case 'ORDER_FULFILLED':
      emailService.sendFulfillmentNotification(event.orderId);
      break;
    
    default:
      const _exhaustive: never = event;
      throw new Error('Unknown event type');
  }
}
```

---

## 🛡️ Type Guards & Narrowing

### Basic Type Guards

```typescript
// Primitive type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Usage
function processValue(value: unknown): string {
  if (isString(value)) {
    return value.toUpperCase(); // TypeScript knows it's a string
  }
  
  if (isNumber(value)) {
    return value.toFixed(2); // TypeScript knows it's a number
  }
  
  throw new Error('Invalid value type');
}
```

### Object Shape Guards

```typescript
// Guard for specific object shape
interface Farm {
  id: string;
  name: string;
  ownerId: string;
}

function isFarm(value: unknown): value is Farm {
  return (
    isObject(value) &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'ownerId' in value &&
    typeof value.ownerId === 'string'
  );
}

// Usage
function processFarm(data: unknown): Farm {
  if (!isFarm(data)) {
    throw new Error('Invalid farm data');
  }
  
  // TypeScript knows data is Farm
  return {
    id: data.id,
    name: data.name,
    ownerId: data.ownerId
  };
}
```

### Array Type Guards

```typescript
// Guard for array of specific type
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isFarmArray(value: unknown): value is Farm[] {
  return Array.isArray(value) && value.every(isFarm);
}

// Usage
function processItems(items: unknown): string[] {
  if (isStringArray(items)) {
    return items.map(item => item.toUpperCase());
  }
  
  if (isFarmArray(items)) {
    return items.map(farm => farm.name);
  }
  
  throw new Error('Invalid items type');
}
```

### Discriminated Union Guards

```typescript
// Narrow discriminated unions
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

function isError<T>(result: Result<T>): result is { success: false; error: Error } {
  return result.success === false;
}

// Usage
async function getFarmSafely(id: string): Promise<Farm> {
  const result = await getFarm(id);
  
  if (isSuccess(result)) {
    return result.data; // TypeScript knows data exists
  }
  
  throw result.error; // TypeScript knows error exists
}
```

---

## 🎨 Generic Patterns

### Basic Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Usage
const farm = { id: 'farm_123', name: 'Green Valley' };
const name = getProperty(farm, 'name'); // Type: string
const id = getProperty(farm, 'id');     // Type: string
```

### Generic Repository Pattern

```typescript
// Base repository interface
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementation
class BaseRepository<T extends { id: string }> implements Repository<T> {
  constructor(private model: any) {}

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findMany(filter?: Partial<T>): Promise<T[]> {
    return await this.model.findMany({ where: filter });
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    return await this.model.create({ data });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}

// Usage
const farmRepository = new BaseRepository<Farm>(database.farm);
const farm = await farmRepository.findById('farm_123');
```

### Generic Response Wrapper

```typescript
// Paginated response
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    pageSize,
    hasNext: page * pageSize < total,
    hasPrevious: page > 1
  };
}

// Usage
const farms = await database.farm.findMany({ skip, take });
const total = await database.farm.count();
const response = createPaginatedResponse(farms, total, page, pageSize);
```

### Advanced Generic Constraints

```typescript
// Generic with multiple constraints
interface Identifiable {
  id: string;
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

function sortByDate<T extends Identifiable & Timestamped>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt.getTime();
    const bTime = b.createdAt.getTime();
    return order === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

// Usage
const farms = await farmRepository.findMany();
const sorted = sortByDate(farms); // Works because Farm has id and timestamps
```

---

## 🛠️ Utility Types

### Built-in Utility Types

```typescript
// Partial - Make all properties optional
type PartialFarm = Partial<Farm>;

// Required - Make all properties required
type RequiredConfig = Required<Config>;

// Pick - Select specific properties
type FarmSummary = Pick<Farm, 'id' | 'name' | 'status'>;

// Omit - Exclude specific properties
type CreateFarmInput = Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>;

// Record - Create object type with specific keys
type FarmsByStatus = Record<FarmStatus, Farm[]>;

// Extract - Extract types from union
type SuccessStatus = Extract<FarmStatus, 'ACTIVE' | 'VERIFIED'>;

// Exclude - Remove types from union
type ErrorStatus = Exclude<FarmStatus, 'ACTIVE' | 'VERIFIED'>;

// ReturnType - Get function return type
type GetFarmResult = ReturnType<typeof getFarm>;

// Parameters - Get function parameters
type GetFarmParams = Parameters<typeof getFarm>;
```

### Custom Utility Types

```typescript
// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Nullable
type Nullable<T> = T | null;

// Optional (null or undefined)
type Optional<T> = T | null | undefined;

// Unwrap Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// Unwrap Array
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

// Usage
interface Farm {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  verified: boolean;
}

// Make only name and description optional
type UpdateFarmInput = PartialBy<Farm, 'name' | 'description'>;

// Deep readonly farm
type ImmutableFarm = DeepReadonly<Farm>;
```

### Domain-Specific Utilities

```typescript
// Entity with common fields
type Entity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// API input (without server-generated fields)
type ApiInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// API update (partial without server fields)
type ApiUpdate<T> = Partial<ApiInput<T>>;

// Usage
type FarmEntity = Entity<Farm>;
type CreateFarmInput = ApiInput<Farm>;
type UpdateFarmInput = ApiUpdate<Farm>;
```

---

## 📡 API Response Types

### Standard Response Structure

```typescript
// Base response
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

// Error details
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
  requestId: string;
}

// Response metadata
interface ResponseMeta {
  pagination?: PaginationMeta;
  requestId: string;
  duration?: number;
  cached?: boolean;
  version: string;
}

// Pagination metadata
interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### Response Builders

```typescript
// Success response builder
export function successResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId: generateRequestId(),
      version: 'v1',
      ...meta
    }
  };
}

// Error response builder
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
    }
  };
}

// Paginated response builder
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): ApiResponse<T[]> {
  return successResponse(items, {
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      hasNext: page * pageSize < total,
      hasPrevious: page > 1
    }
  });
}
```

### Type-Safe API Endpoints

```typescript
// Define all API endpoints
interface ApiEndpoints {
  'GET /api/farms': {
    query: { page?: number; pageSize?: number; status?: string };
    response: ApiResponse<Farm[]>;
  };
  
  'GET /api/farms/:id': {
    params: { id: string };
    response: ApiResponse<Farm>;
  };
  
  'POST /api/farms': {
    body: CreateFarmInput;
    response: ApiResponse<Farm>;
  };
  
  'PUT /api/farms/:id': {
    params: { id: string };
    body: UpdateFarmInput;
    response: ApiResponse<Farm>;
  };
  
  'DELETE /api/farms/:id': {
    params: { id: string };
    response: ApiResponse<void>;
  };
}

// Type-safe fetch wrapper
async function apiCall<K extends keyof ApiEndpoints>(
  endpoint: K,
  options: {
    params?: ApiEndpoints[K] extends { params: infer P } ? P : never;
    query?: ApiEndpoints[K] extends { query: infer Q } ? Q : never;
    body?: ApiEndpoints[K] extends { body: infer B } ? B : never;
  } = {}
): Promise<ApiEndpoints[K] extends { response: infer R } ? R : never> {
  // Implementation
  const url = buildUrl(endpoint, options.params, options.query);
  const response = await fetch(url, {
    method: getMethod(endpoint),
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return await response.json();
}

// Usage - fully type-safe
const farm = await apiCall('GET /api/farms/:id', {
  params: { id: 'farm_123' }
});

const created = await apiCall('POST /api/farms', {
  body: { name: 'New Farm', description: '...' }
});
```

---

## ⚛️ React Component Typing

### Functional Component Patterns

```typescript
// ❌ DON'T use React.FC
const BadComponent: React.FC<{ name: string }> = ({ name }) => {
  return <div>{name}</div>;
};

// ✅ DO use explicit props interface
interface GoodComponentProps {
  name: string;
  age?: number;
  onSave?: (name: string) => void;
}

export function GoodComponent({ name, age, onSave }: GoodComponentProps) {
  return (
    <div>
      <h1>{name}</h1>
      {age && <p>Age: {age}</p>}
      {onSave && <button onClick={() => onSave(name)}>Save</button>}
    </div>
  );
}
```

### Props with Children

```typescript
// Simple children
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return <div className={className}>{children}</div>;
}

// Render prop pattern
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

export function List<T>({ items, renderItem, emptyMessage }: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage ?? 'No items'}</p>;
  }
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Usage
<List<Farm>
  items={farms}
  renderItem={(farm) => <FarmCard farm={farm} />}
/>
```

### Event Handlers

```typescript
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange?: (field: string, value: string) => void;
}

export function Form({ onSubmit, onChange }: FormProps) {
  // Type-safe event handlers
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.name, e.target.value);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked', e.currentTarget);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} />
      <button type="submit" onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### Hooks Typing

```typescript
// useState with explicit type
const [farms, setFarms] = useState<Farm[]>([]);
const [farm, setFarm] = useState<Farm | null>(null);

// useRef with element type
const inputRef = useRef<HTMLInputElement>(null);

// useEffect dependencies
useEffect(() => {
  fetchFarms();
}, [fetchFarms]); // TypeScript checks dependencies

// Custom hook with generics
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}

// Usage
const [farms, setFarms] = useLocalStorage<Farm[]>('farms', []);
```

### Forwarding Refs

```typescript
interface InputProps {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
        {error && <span>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## 🔄 Server Actions Typing

### Basic Server Action

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

// Input schema
const CreateFarmSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string()
  })
});

// Input type
type CreateFarmInput = z.infer<typeof CreateFarmSchema>;

// Return type
type CreateFarmResult = 
  | { success: true; data: Farm }
  | { success: false; error: { code: string; message: string; details?: unknown } };

// Server action
export async function createFarm(
  input: CreateFarmInput
): Promise<CreateFarmResult> {
  try {
    // Validate
    const validated = CreateFarmSchema.parse(input);
    
    // Get session
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      };
    }
    
    // Create farm
    const farm = await database.farm.create({
      data: {
        ...validated,
        ownerId: session.user.id,
        status: 'PENDING_VERIFICATION'
      }
    });
    
    // Revalidate
    revalidatePath('/farms');
    revalidatePath(`/farmers/${session.user.id}`);
    
    return { success: true, data: farm };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.flatten()
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create farm'
      }
    };
  }
}
```

### FormData Server Action

```typescript
"use server";

export async function createFarmFromFormData(
  formData: FormData
): Promise<CreateFarmResult> {
  // Extract and parse FormData
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    location: JSON.parse(formData.get("location") as string)
  };
  
  // Reuse validation logic
  return await createFarm(rawData);
}
```

### Server Action with File Upload

```typescript
"use server";

export async function uploadFarmImage(
  farmId: string,
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const file = formData.get("image") as File;
    
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }
    
    // Upload to storage
    const url = await uploadToStorage(file);
    
    // Update database
    await database.farm.update({
      where: { id: farmId },
      data: { imageUrl: url }
    });
    
    revalidatePath(`/farms/${farmId}`);
    
    return { success: true, url };
    
  } catch (error) {
    return { success: false, error: 'Upload failed' };
  }
}
```

---

## 🗄️ Prisma Type Integration

### Type-Only Imports

```typescript
// ✅ Always use type-only imports for Prisma types
import type { Farm, Product, User, Prisma } from "@prisma/client";

// ❌ Never import Prisma Client directly (use singleton)
// import { PrismaClient } from "@prisma/client"; // FORBIDDEN
```

### Prisma Types with Relations

```typescript
// Include relations
type FarmWithOwner = Prisma.FarmGetPayload<{
  include: { owner: true }
}>;

type FarmWithProducts = Prisma.FarmGetPayload<{
  include: {
    products: {
      where: { status: 'ACTIVE' }
    }
  }
}>;

// Select specific fields
type FarmSummary = Prisma.FarmGetPayload<{
  select: {
    id: true;
    name: true;
    status: true;
  }
}>;

// Complex nested relations
type FarmWithEverything = Prisma.FarmGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      }
    };
    products: {
      where: { status: 'ACTIVE' };
      include: {
        category: true;
      }
    };
    location: true;
    _count: {
      select: {
        products: true;
        orders: true;
      }
    };
  }
}>;
```

### Prisma Input Types

```typescript
// Create input
type CreateFarmInput = Prisma.FarmCreateInput;

// Update input
type UpdateFarmInput = Prisma.FarmUpdateInput;

// Where clause
type FarmWhereInput = Prisma.FarmWhereInput;

// Order by
type FarmOrderByInput = Prisma.FarmOrderByWithRelationInput;
```

### Repository with Prisma Types

```typescript
export class FarmRepository {
  private readonly defaultIncludes = {
    owner: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    location: true,
    _count: {
      select: {
        products: true
      }
    }
  } as const;
  
  type FarmWithDefaults = Prisma.FarmGetPayload<{
    include: typeof this.defaultIncludes;
  }>;
  
  async findById(id: string): Promise<FarmWithDefaults | null> {
    return await database.farm.findUnique({
      where: { id },
      include: this.defaultIncludes
    });
  }
  
  async findMany(
    where?: Prisma.FarmWhereInput,
    orderBy?: Prisma.FarmOrderByWithRelationInput
  ): Promise<FarmWithDefaults[]> {
    return await database.farm.findMany({
      where,
      orderBy,
      include: this.defaultIncludes
    });
  }
}
```

---

## ✅ Zod Schema Integration

### Schema Definition and Type Inference

```typescript
import { z } from "zod";

// Define schema
export const CreateFarmSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().length(2).regex(/^[A-Z]{2}$/),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    })
  }),
  
  certifications: z.array(z.enum([
    'ORGANIC',
    'NON_GMO',
    'BIODYNAMIC',
    'RAINFOREST_ALLIANCE'
  ])).default([]),
  
  farmSize: z.number().positive().max(100000),
  
  contactEmail: z.string().email(),
  
  contactPhone: z.string()
    .regex(/^\+?1?\d{10,14}$/)
    .optional(),
  
  website: z.string().url().optional()
});

// Infer TypeScript type from schema
export type CreateFarmInput = z.infer<typeof CreateFarmSchema>;

// Update schema (partial)
export const UpdateFarmSchema = CreateFarmSchema.partial();
export type UpdateFarmInput = z.infer<typeof UpdateFarmSchema>;
```

### Validation Helpers

```typescript
// Safe parse with result type
function validateFarm(
  data: unknown
): { success: true; data: CreateFarmInput } | { success: false; errors: z.ZodError } {
  const result = CreateFarmSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

// Throw on invalid
function validateFarmStrict(data: unknown): CreateFarmInput {
  return CreateFarmSchema.parse(data);
}
```

### Zod with Branded Types

```typescript
// Branded email schema
export const EmailSchema = z.string()
  .email()
  .transform((val) => val as ValidatedEmail);

// Branded ID schema
export const FarmIdSchema = z.string()
  .startsWith('farm_')
  .transform((val) => val as FarmId);

// Usage in larger schema
export const UpdateFarmSchema = z.object({
  id: FarmIdSchema,
  name: z.string().optional(),
  contactEmail: EmailSchema.optional()
});
```

---

## 🚨 Error Handling Patterns

### Custom Error Classes

```typescript
// Base error class
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    public requiredRole?: string
  ) {
    super(message, 'FORBIDDEN', 403);
  }
}
```

### Try-Catch Patterns

```typescript
// ✅ Proper error handling
async function getFarm(id: string): Promise<Farm> {
  try {
    const farm = await database.farm.findUnique({ where: { id } });
    
    if (!farm) {
      throw new NotFoundError('Farm', id);
    }
    
    return farm;
    
  } catch (error) {
    // Type guard for our custom errors
    if (error instanceof AppError) {
      throw error; // Re-throw custom errors
    }
    
    // Log unexpected errors
    logger.error('Unexpected error in getFarm', { error, id });
    
    // Wrap in generic error
    throw new AppError(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500
    );
  }
}
```

### Result Type Pattern

```typescript
// Result type for operations that might fail
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helper functions
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage
async function getFarmSafe(id: string): Promise<Result<Farm, AppError>> {
  try {
    const farm = await database.farm.findUnique({ where: { id } });
    
    if (!farm) {
      return Err(new NotFoundError('Farm', id));
    }
    
    return Ok(farm);
    
  } catch (error) {
    return Err(new AppError('Database error', 'DATABASE_ERROR'));
  }
}

// Consumer
const result = await getFarmSafe('farm_123');

if (result.ok) {
  console.log(result.value.name);
} else {
  console.error(result.error.message);
}
```

---

## ⏱️ Async/Promise Patterns

### Async Function Return Types

```typescript
// ✅ Explicit Promise return type
async function fetchFarms(): Promise<Farm[]> {
  return await database.farm.findMany();
}

// ✅ With error handling
async function fetchFarmsSafe(): Promise<Result<Farm[]>> {
  try {
    const farms = await database.farm.findMany();
    return { success: true, data: farms };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Promise.all with Type Safety

```typescript
// Parallel execution with different types
async function getFarmData(farmId: string) {
  const [farm, products, reviews, owner] = await Promise.all([
    database.farm.findUnique({ where: { id: farmId } }),
    database.product.findMany({ where: { farmId } }),
    database.review.findMany({ where: { farmId } }),
    database.user.findUnique({ where: { id: farm.ownerId } })
  ]);
  
  // TypeScript knows exact types
  return { farm, products, reviews, owner };
}
```

### Async Iterators

```typescript
// Async generator
async function* fetchFarmsBatch(
  batchSize: number = 100
): AsyncGenerator<Farm[], void, unknown> {
  let cursor: string | undefined;
  
  while (true) {
    const farms = await database.farm.findMany({
      take: batchSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined
    });
    
    if (farms.length === 0) break;
    
    yield farms;
    cursor = farms[farms.length - 1]?.id;
  }
}

// Usage
for await (const batch of fetchFarmsBatch(100)) {
  console.log(`Processing ${batch.length} farms`);
  await processFarms(batch);
}
```

---

## 🚫 Anti-Patterns

### What NOT to Do

```typescript
// ❌ DON'T use `any`
function process(data: any) {
  return data.value;
}

// ❌ DON'T use type assertions without validation
function getUser(data: unknown) {
  return data as User; // Dangerous!
}

// ❌ DON'T ignore type errors with `@ts-ignore`
// @ts-ignore
const result = unsafeOperation();

// ❌ DON'T use non-null assertions without checking
const user = users.find(u => u.id === id)!; // Might be undefined!

// ❌ DON'T use index signatures without bounds checking
function getValue(obj: Record<string, string>, key: string) {
  return obj[key]; // Might be undefined!
}

// ❌ DON'T mutate readonly types
function modify(arr: readonly string[]) {
  arr.push('new'); // Error (but shows wrong pattern)
}

// ❌ DON'T use function overloads when generics suffice
function identity(value: string): string;
function identity(value: number): number;
function identity(value: boolean): boolean;
function identity(value: any): any {
  return value;
}

// Better: Use generics
function identity<T>(value: T): T {
  return value;
}
```

---

## ⚡ Performance Considerations

### Type Inference vs Explicit Types

```typescript
// ✅ Inference OK for local variables
const farms = await database.farm.findMany(); // Type inferred

// ✅ Explicit types for function signatures
async function getFarms(): Promise<Farm[]> {
  return await database.farm.findMany();
}

// ✅ Explicit types for complex expressions
const farmsByStatus: Record<FarmStatus, Farm[]> = farms.reduce(
  (acc, farm) => {
    if (!acc[farm.status]) {
      acc[farm.status] = [];
    }
    acc[farm.status].push(farm);
    return acc;
  },
  {} as Record<FarmStatus, Farm[]>
);
```

### Avoid Expensive Type Operations

```typescript
// ❌ Expensive: Recursive type that's too deep
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ✅ Better: Limit recursion depth
type DeepPartial<T, Depth extends number = 3> = 
  Depth extends 0
    ? T
    : T extends object
      ? { [P in keyof T]?: DeepPartial<T[P], Prev<Depth>> }
      : T;
```

---

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [.cursorrules](../../.cursorrules) - Project-specific patterns
- [Prisma Type Safety](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety)

---

**Last Updated:** January 10, 2025  
**Maintained By:** Engineering Team  
**Version:** 1.0.0

_"Type safety is not optional—it's the foundation of reliable software."_ 🛡️