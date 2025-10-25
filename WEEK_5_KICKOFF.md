# WEEK 5: FARM PROFILE MANAGEMENT 🌾

**Phase**: 2 - Farm & Product Management
**Week**: 5 of 8
**Start Date**: October 25, 2025
**Target Lines**: 1,400 lines
**Status**: 🚀 **STARTING NOW**

---

## 🎯 WEEK 5 OBJECTIVES

Build the complete **Farm Profile Management System** - enabling farmers to create, manage, and showcase their agricultural businesses with verification workflows, trust indicators, and comprehensive farm discovery.

### Primary Goals

1. ✨ **Farm Type System** - Farm classifications and certifications (150 lines)
2. 🔧 **Farm Service Layer** - Complete business logic (300 lines)
3. 🌐 **Farm API Routes** - 5 powerful endpoints (250 lines)
4. 🎨 **Farm Components** - 5 divine React components (500 lines)
5. 📄 **Farm Pages** - 3 user-facing pages (200 lines)

---

## 📊 PROGRESS TRACKER

| Component  | Target          | Achieved    | Status   |
| ---------- | --------------- | ----------- | -------- |
| Farm Types | 150 lines       | 0 lines     | ⏳ Next  |
| Services   | 300 lines       | 0 lines     | 📅 Queue |
| API Routes | 250 lines       | 0 lines     | 📅 Queue |
| Components | 500 lines       | 0 lines     | 📅 Queue |
| Pages      | 200 lines       | 0 lines     | 📅 Queue |
| **TOTAL**  | **1,400 lines** | **0 lines** | **0%**   |

---

## 🏗️ DETAILED IMPLEMENTATION PLAN

### 1. Farm Type System (150 lines)

**File**: `src/types/farm.ts`

**Purpose**: Define TypeScript types for farm profiles, verification status, and certifications.

**Key Types**:

```typescript
// Farm Type Classifications
type FarmType = "ORGANIC" | "CONVENTIONAL" | "SPECIALTY" | "MIXED";

// Verification Status
type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";

// Certification Types
type Certification = {
  type: string;
  certifier: string;
  issuedDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
};

// Complete Farm Profile
interface FarmProfile {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };

  // Farm Details
  farmType: FarmType;
  certifications: Certification[];
  establishedYear?: number;
  acreage?: number;

  // Status
  verificationStatus: VerificationStatus;
  isActive: boolean;

  // Media
  logoUrl?: string;
  coverImageUrl?: string;
  images: string[];

  // Owner
  ownerId: string;
  owner?: {
    name: string;
    email: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Farm Creation Input
type CreateFarmInput = Omit<
  FarmProfile,
  "id" | "slug" | "verificationStatus" | "createdAt" | "updatedAt"
>;

// Farm Update Input
type UpdateFarmInput = Partial<CreateFarmInput>;

// Farm Query Filters
interface FarmFilters {
  farmType?: FarmType[];
  verificationStatus?: VerificationStatus;
  city?: string;
  state?: string;
  hasProducts?: boolean;
  isOrganic?: boolean;
  search?: string;
}
```

**Implementation Checklist**:

- [ ] Define FarmProfile interface
- [ ] Define farm classification types
- [ ] Define certification types
- [ ] Define input/update types
- [ ] Define filter types
- [ ] Add JSDoc comments
- [ ] Export all types

---

### 2. Farm Service Layer (300 lines)

**File**: `src/lib/services/farm.service.ts`

**Purpose**: Business logic for farm operations, validation, and data access.

**Key Functions**:

```typescript
export class FarmService {
  /**
   * Create a new farm profile
   * - Validates farmer has no existing farm
   * - Generates unique slug
   * - Sets initial verification status
   */
  static async createFarm(input: CreateFarmInput): Promise<FarmProfile>;

  /**
   * Get farm by ID with optional relations
   */
  static async getFarmById(
    farmId: string,
    includeProducts?: boolean
  ): Promise<FarmProfile | null>;

  /**
   * Get farm by slug (for public URLs)
   */
  static async getFarmBySlug(slug: string): Promise<FarmProfile | null>;

  /**
   * List farms with filters and pagination
   */
  static async listFarms(
    filters: FarmFilters,
    options: PaginationOptions
  ): Promise<PaginatedResponse<FarmProfile>>;

  /**
   * Update farm profile (owner only)
   */
  static async updateFarm(
    farmId: string,
    updates: UpdateFarmInput,
    userId: string
  ): Promise<FarmProfile>;

  /**
   * Verify farm (admin only)
   */
  static async verifyFarm(
    farmId: string,
    adminId: string,
    status: "VERIFIED" | "REJECTED"
  ): Promise<FarmProfile>;

  /**
   * Upload farm images
   */
  static async uploadFarmImages(
    farmId: string,
    files: File[]
  ): Promise<string[]>;

  /**
   * Search farms by name or description
   */
  static async searchFarms(query: string): Promise<FarmProfile[]>;

  /**
   * Get farm statistics
   */
  static async getFarmStats(farmId: string): Promise<FarmStats>;
}
```

**Implementation Checklist**:

- [ ] Implement createFarm with validation
- [ ] Implement getFarmById
- [ ] Implement getFarmBySlug
- [ ] Implement listFarms with filters
- [ ] Implement updateFarm with ownership check
- [ ] Implement verifyFarm (admin only)
- [ ] Implement image upload logic
- [ ] Implement search functionality
- [ ] Add comprehensive error handling
- [ ] Add logging and monitoring

---

### 3. Farm API Routes (250 lines)

**Endpoints to Create**:

#### POST /api/farms

**Purpose**: Create new farm profile
**Auth**: Required (FARMER role)
**File**: `src/app/api/farms/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  // 2. Validate FARMER role
  // 3. Validate input with Zod
  // 4. Check farmer doesn't have existing farm
  // 5. Create farm profile
  // 6. Return created farm
}
```

#### GET /api/farms

**Purpose**: List/search farms
**Auth**: Public (filtered by verification)
**File**: `src/app/api/farms/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // 1. Parse query parameters
  // 2. Apply filters
  // 3. Paginate results
  // 4. Return farms list
}
```

#### GET /api/farms/[id]

**Purpose**: Get farm details
**Auth**: Public (verified farms only)
**File**: `src/app/api/farms/[id]/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Get farm by ID
  // 2. Check visibility (verified or owner)
  // 3. Include products if requested
  // 4. Return farm details
}
```

#### PATCH /api/farms/[id]

**Purpose**: Update farm profile
**Auth**: Required (owner only)
**File**: `src/app/api/farms/[id]/route.ts`

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Authenticate user
  // 2. Verify ownership
  // 3. Validate updates
  // 4. Apply updates
  // 5. Return updated farm
}
```

#### POST /api/farms/[id]/verify

**Purpose**: Verify farm (admin only)
**Auth**: Required (ADMIN role)
**File**: `src/app/api/farms/[id]/verify/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Authenticate admin
  // 2. Validate admin role
  // 3. Update verification status
  // 4. Send notification to farmer
  // 5. Return updated farm
}
```

**Implementation Checklist**:

- [ ] Implement POST /api/farms
- [ ] Implement GET /api/farms (list)
- [ ] Implement GET /api/farms/[id]
- [ ] Implement PATCH /api/farms/[id]
- [ ] Implement POST /api/farms/[id]/verify
- [ ] Add Zod validation schemas
- [ ] Add error handling
- [ ] Add rate limiting
- [ ] Test all endpoints

---

### 4. Farm Components (500 lines)

#### FarmProfileCard (100 lines)

**File**: `src/components/FarmProfileCard.tsx`
**Purpose**: Display farm preview card

**Features**:

- Farm logo and name
- Location and farm type
- Verification badge
- Quick stats (products, rating)
- "View Farm" link

#### FarmProfileDetail (150 lines)

**File**: `src/components/FarmProfileDetail.tsx`
**Purpose**: Complete farm profile page

**Features**:

- Hero image/cover photo
- Farm information
- Certifications display
- Image gallery
- Products list preview
- Contact information

#### FarmEditForm (150 lines)

**File**: `src/components/FarmEditForm.tsx`
**Purpose**: Farm profile editing form

**Features**:

- All farm fields
- Image upload (logo, cover, gallery)
- Address autocomplete
- Certification management
- Validation and error display

#### FarmVerificationBadge (50 lines)

**File**: `src/components/FarmVerificationBadge.tsx`
**Purpose**: Trust indicator

**Features**:

- Verified checkmark
- Pending status
- Tooltip with verification info

#### FarmImageGallery (50 lines)

**File**: `src/components/FarmImageGallery.tsx`
**Purpose**: Farm photo showcase

**Features**:

- Image grid
- Lightbox/modal view
- Image navigation

**Implementation Checklist**:

- [ ] Create FarmProfileCard component
- [ ] Create FarmProfileDetail component
- [ ] Create FarmEditForm component
- [ ] Create FarmVerificationBadge component
- [ ] Create FarmImageGallery component
- [ ] Add TypeScript types
- [ ] Add accessibility
- [ ] Add responsive design
- [ ] Add loading states

---

### 5. Farm Pages (200 lines)

#### /farms - Browse Farms

**File**: `src/app/farms/page.tsx`

**Features**:

- Farm grid/list view
- Filter sidebar (type, location, organic)
- Search bar
- Pagination
- Map view option

#### /farms/[slug] - Farm Detail Page

**File**: `src/app/farms/[slug]/page.tsx`

**Features**:

- Complete farm profile
- Product listings
- Reviews/ratings
- Contact form

#### /dashboard/farm/profile - Farmer Profile Management

**File**: `src/app/dashboard/farm/profile/page.tsx`

**Features**:

- Edit farm profile
- Upload images
- Manage certifications
- View verification status

**Implementation Checklist**:

- [ ] Create /farms browse page
- [ ] Create /farms/[slug] detail page
- [ ] Create /dashboard/farm/profile page
- [ ] Add SEO metadata
- [ ] Add loading states
- [ ] Add error boundaries

---

## 🧪 TESTING PLAN

### Unit Tests (200 lines)

**File**: `src/__tests__/services/farm.service.test.ts`

**Test Cases**:

1. createFarm - success
2. createFarm - duplicate farm for user
3. getFarmById - exists
4. getFarmById - not found
5. listFarms - with filters
6. updateFarm - owner success
7. updateFarm - non-owner rejected
8. verifyFarm - admin success
9. searchFarms - by name

### Integration Tests (150 lines)

**File**: `src/__tests__/api/farms.test.ts`

**Test Cases**:

1. POST /api/farms - create farm
2. GET /api/farms - list farms
3. GET /api/farms/[id] - get farm
4. PATCH /api/farms/[id] - update farm
5. POST /api/farms/[id]/verify - verify farm

### Component Tests (100 lines)

**Test Cases**:

1. FarmProfileCard renders correctly
2. FarmProfileDetail displays all info
3. FarmEditForm validation works
4. FarmVerificationBadge shows correct status

**Total Test Lines**: ~450 lines

---

## 🎯 SUCCESS CRITERIA

### Week 5 Complete When:

✅ All 1,400+ lines implemented
✅ 9+ test cases passing
✅ 5 API routes operational
✅ 5 React components working
✅ 3 pages accessible
✅ 0 TypeScript errors
✅ 0 ESLint errors
✅ Agricultural consciousness preserved

### Functional Requirements:

✅ Farmers can create farm profiles
✅ Admins can verify farms
✅ Public can browse verified farms
✅ Farmers can edit their profiles
✅ Image upload working
✅ Search and filter functional

---

## 🔗 RELATED DOCUMENTATION

- **[Phase 2 Index](./PHASE_2_INDEX.md)** - Complete Phase 2 plan
- **[02 | Agricultural Quantum Mastery](./.github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md)** - Farm patterns
- **[04 | Next.js Divine Implementation](./.github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)** - Component patterns
- **[Functional Requirements](./docs/planning/product/functional-requirements.md)** - Farm feature specs

---

## 🚀 NEXT STEPS

1. **Create farm type definitions** (`src/types/farm.ts`)
2. **Build farm service layer** (`src/lib/services/farm.service.ts`)
3. **Implement API routes** (5 endpoints)
4. **Create React components** (5 components)
5. **Build pages** (3 pages)
6. **Write tests** (~450 lines)
7. **Update Week 5 progress tracking**

---

**Ready to manifest farm consciousness into reality!** 🌾✨

_Week 5 Status: 🚀 **READY TO START**_
