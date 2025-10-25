# 🚀 Phase 2: Management Tools - Implementation Plan

**Start Date**: December 2024
**Status**: 🚧 IN PROGRESS
**Goal**: Implement user management and farm verification systems

---

## 📋 Phase 2 Overview

Phase 2 focuses on building the core management tools that administrators need to maintain platform quality and handle day-to-day operations.

### Objectives

1. ✅ User Management System - Approve, suspend, and manage user accounts
2. ✅ Farm Verification Workflow - Review and verify farm applications
3. ✅ Enhanced Product Management - Complete CRUD operations
4. ✅ Order Processing - Handle order lifecycle
5. ✅ Customer Management - View and manage customer accounts

---

## 🎯 Sprint 1: User Management System (Week 1-2)

### 1.1 User Management Page Enhancement

**File**: `src/app/admin/customers/page.tsx`

**Features to Implement**:

#### User List View

- [ ] **Table with sortable columns**:
  - User ID, Name, Email, Role, Status, Joined Date, Last Active
- [ ] **Search functionality**: Search by name, email, or ID
- [ ] **Filter options**:
  - By Role (All, Admin, Farmer, Consumer)
  - By Status (All, Active, Suspended, Pending)
  - By Registration Date (Last 7 days, 30 days, 90 days, All time)
- [ ] **Pagination**: 20 users per page with page navigation
- [ ] **Bulk actions**: Select multiple users for batch operations

#### User Details Modal

- [ ] **User profile information**:
  - Avatar, Name, Email, Phone
  - Role and permissions
  - Registration date, Last login
  - Account status
- [ ] **Activity history**:
  - Login history (last 10 logins)
  - Recent orders (if consumer)
  - Managed farms (if farmer)
- [ ] **Admin actions**:
  - Approve registration
  - Suspend/Reactivate account
  - Change role
  - Reset password
  - Delete account (with confirmation)

#### User Approval Workflow

- [ ] **Pending registrations tab**:
  - List of users awaiting approval
  - Show registration details
  - Quick approve/reject buttons
- [ ] **Approval modal**:
  - Review user information
  - Add approval notes
  - Set initial permissions
  - Send welcome email option

#### User Suspension System

- [ ] **Suspension modal**:
  - Reason dropdown (Spam, Fraud, Policy Violation, Other)
  - Custom reason text field
  - Suspension duration (Temporary, Permanent)
  - Notify user option
- [ ] **Suspension history**:
  - List of all suspensions
  - Reason and date
  - Suspended by (admin name)
- [ ] **Reactivation**:
  - Review suspension reason
  - Add reactivation notes
  - Send reactivation notification

### 1.2 API Endpoints

**Files to Create**:

#### `src/app/api/admin/users/route.ts`

```typescript
// GET /api/admin/users - List all users with filters
// POST /api/admin/users - Create new user (admin)
```

#### `src/app/api/admin/users/[id]/route.ts`

```typescript
// GET /api/admin/users/[id] - Get user details
// PATCH /api/admin/users/[id] - Update user
// DELETE /api/admin/users/[id] - Delete user
```

#### `src/app/api/admin/users/[id]/approve/route.ts`

```typescript
// POST /api/admin/users/[id]/approve - Approve pending user
```

#### `src/app/api/admin/users/[id]/suspend/route.ts`

```typescript
// POST /api/admin/users/[id]/suspend - Suspend user account
// DELETE /api/admin/users/[id]/suspend - Reactivate user
```

#### `src/app/api/admin/users/[id]/role/route.ts`

```typescript
// PATCH /api/admin/users/[id]/role - Change user role
```

### 1.3 Database Schema Updates

**File**: `prisma/schema.prisma`

```prisma
model User {
  // ... existing fields ...

  // Add new fields for management
  approvedAt      DateTime?
  approvedBy      User?     @relation("ApprovedUsers", fields: [approvedById], references: [id])
  approvedById    String?

  suspendedAt     DateTime?
  suspendedBy     User?     @relation("SuspendedUsers", fields: [suspendedById], references: [id])
  suspendedById   String?
  suspensionReason String?
  suspensionDuration String? // TEMPORARY, PERMANENT

  lastLoginAt     DateTime?
  loginCount      Int       @default(0)

  // Relations
  approvedUsers   User[]    @relation("ApprovedUsers")
  suspendedUsers  User[]    @relation("SuspendedUsers")
  auditLogs       AuditLog[]
}

// New model for audit logging
model AuditLog {
  id          String   @id @default(cuid())
  action      String   // APPROVE_USER, SUSPEND_USER, CHANGE_ROLE, etc.
  entityType  String   // USER, FARM, PRODUCT, etc.
  entityId    String

  performedBy User     @relation(fields: [performedById], references: [id])
  performedById String

  oldValue    Json?
  newValue    Json?
  reason      String?

  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([performedById])
  @@index([createdAt])
}
```

---

## 🌾 Sprint 2: Farm Verification System (Week 2-3)

### 2.1 Farm Verification Page

**File**: `src/app/admin/farms/page.tsx` (NEW)

**Features to Implement**:

#### Farm List View

- [ ] **Table with farm information**:
  - Farm ID, Name, Owner, Location, Status, Products Count
- [ ] **Status badges**:
  - 🟢 Active (verified and operational)
  - 🟡 Pending (awaiting verification)
  - 🔴 Suspended (temporarily disabled)
  - ⚫ Rejected (verification failed)
- [ ] **Filter by status**: Quick tabs for each status
- [ ] **Search**: By farm name, owner, or location
- [ ] **Sort options**: By date, name, products count

#### Farm Detail Modal

- [ ] **Farm information**:
  - Name, Description, Location
  - Owner details
  - Contact information
  - Certifications claimed
- [ ] **Image gallery**:
  - Farm photos (uploaded by farmer)
  - Product images
  - Certification documents
- [ ] **Verification checklist**:
  - ✅ Business registration verified
  - ✅ Location confirmed
  - ✅ Certifications validated
  - ✅ Product authenticity checked
- [ ] **Products list**: All products from this farm
- [ ] **Performance metrics**:
  - Total sales
  - Customer ratings
  - Order fulfillment rate

#### Verification Workflow

- [ ] **Pending farms queue**:
  - List of farms awaiting verification
  - Sort by submission date
  - Priority flag for urgent reviews
- [ ] **Verification form**:
  - Checklist of verification steps
  - Upload supporting documents
  - Add verification notes
  - Approve/Reject decision
- [ ] **Rejection reasons**:
  - Incomplete information
  - Invalid certifications
  - Policy violations
  - Fraudulent activity
- [ ] **Communication**:
  - Send verification status emails
  - Request additional information
  - Approval/rejection notifications

#### Farm Management Actions

- [ ] **Suspend farm**:
  - Reason selection
  - Temporary or permanent
  - Hide from marketplace
  - Notify owner
- [ ] **Reactivate farm**:
  - Review suspension reason
  - Add reactivation notes
  - Make visible in marketplace
- [ ] **Update farm details**:
  - Edit name, description
  - Update location
  - Modify certifications
- [ ] **Feature farm**:
  - Mark as featured on homepage
  - Set featured duration
  - Featured badge display

### 2.2 Farm API Endpoints

**Files to Create**:

#### `src/app/api/admin/farms/route.ts`

```typescript
// GET /api/admin/farms - List all farms with filters
```

#### `src/app/api/admin/farms/[id]/route.ts`

```typescript
// GET /api/admin/farms/[id] - Get farm details
// PATCH /api/admin/farms/[id] - Update farm
// DELETE /api/admin/farms/[id] - Delete farm
```

#### `src/app/api/admin/farms/[id]/verify/route.ts`

```typescript
// POST /api/admin/farms/[id]/verify - Approve farm
// POST /api/admin/farms/[id]/reject - Reject farm
```

#### `src/app/api/admin/farms/[id]/suspend/route.ts`

```typescript
// POST /api/admin/farms/[id]/suspend - Suspend farm
// DELETE /api/admin/farms/[id]/suspend - Reactivate farm
```

### 2.3 Farm Schema Updates

**File**: `prisma/schema.prisma`

```prisma
enum FarmStatus {
  ACTIVE
  PENDING_VERIFICATION
  SUSPENDED
  REJECTED
  INACTIVE
}

model Farm {
  // ... existing fields ...

  status          FarmStatus @default(PENDING_VERIFICATION)

  // Verification fields
  verifiedAt      DateTime?
  verifiedBy      User?      @relation("VerifiedFarms", fields: [verifiedById], references: [id])
  verifiedById    String?
  verificationNotes String?  @db.Text

  rejectedAt      DateTime?
  rejectedBy      User?      @relation("RejectedFarms", fields: [rejectedById], references: [id])
  rejectedById    String?
  rejectionReason String?    @db.Text

  suspendedAt     DateTime?
  suspendedBy     User?      @relation("SuspendedFarms", fields: [suspendedById], references: [id])
  suspendedById   String?
  suspensionReason String?   @db.Text

  featured        Boolean    @default(false)
  featuredUntil   DateTime?

  // Performance metrics
  totalSales      Decimal    @default(0) @db.Decimal(10, 2)
  orderCount      Int        @default(0)
  averageRating   Decimal?   @db.Decimal(2, 1)

  // Relations
  verifiedFarms   User[]     @relation("VerifiedFarms")
  rejectedFarms   User[]     @relation("RejectedFarms")
  suspendedFarms  User[]     @relation("SuspendedFarms")
}
```

---

## 📦 Sprint 3: Enhanced Product Management (Week 3)

### 3.1 Product Management Enhancements

**File**: `src/app/admin/products/page.tsx` (ENHANCE EXISTING)

**Additional Features**:

- [ ] **Product approval workflow**: Review products before listing
- [ ] **Bulk edit**: Update multiple products at once
- [ ] **Image management**: Upload, crop, and optimize images
- [ ] **Inventory alerts**: Low stock notifications
- [ ] **Price history**: Track price changes over time
- [ ] **Featured products**: Mark products for homepage display

### 3.2 Product API Enhancements

- [ ] **Bulk operations**: `/api/admin/products/bulk`
- [ ] **Approval**: `/api/admin/products/[id]/approve`
- [ ] **Feature**: `/api/admin/products/[id]/feature`

---

## 🛒 Sprint 4: Order Processing (Week 4)

### 4.1 Order Management Page

**File**: `src/app/admin/orders/page.tsx` (ENHANCE EXISTING)

**Features**:

- [ ] **Order status workflow**:
  - Pending → Processing → Shipped → Delivered
  - Cancel/Refund options
- [ ] **Order details modal**: Full order information
- [ ] **Communication**: Email notifications for status changes
- [ ] **Shipping management**: Add tracking numbers
- [ ] **Payment status**: Track payments and refunds

---

## 🔔 Additional Features

### Notification System

**File**: `src/components/admin/NotificationCenter.tsx`

- [ ] **Real-time notifications**: New orders, pending verifications
- [ ] **Notification bell**: Badge with unread count
- [ ] **Notification panel**: Dropdown with recent notifications
- [ ] **Mark as read**: Individual and bulk actions

### Activity Feed

**File**: `src/components/admin/ActivityFeed.tsx`

- [ ] **Recent activities**: Live feed of platform activities
- [ ] **Filters**: By action type, user, date
- [ ] **Details**: Expandable activity details

---

## 📊 Success Metrics

### User Management

- ✅ User approval time < 5 minutes
- ✅ Suspension workflow complete
- ✅ Role management functional
- ✅ Activity tracking accurate

### Farm Verification

- ✅ Verification time < 24 hours
- ✅ All verification steps documented
- ✅ Communication workflow complete
- ✅ Performance metrics tracked

### Product Management

- ✅ Bulk operations functional
- ✅ Image management smooth
- ✅ Inventory alerts working
- ✅ Featured products display correctly

### Order Processing

- ✅ Status workflow complete
- ✅ Email notifications sent
- ✅ Tracking integration works
- ✅ Payment status accurate

---

## 🧪 Testing Plan

### Unit Tests

- [ ] User management API endpoints
- [ ] Farm verification logic
- [ ] Product approval workflow
- [ ] Order status transitions

### Integration Tests

- [ ] User approval → notification → email
- [ ] Farm verification → marketplace visibility
- [ ] Product approval → listing → search
- [ ] Order processing → status → notification

### E2E Tests

- [ ] Complete user approval workflow
- [ ] Complete farm verification workflow
- [ ] Bulk product operations
- [ ] Order lifecycle management

---

## 📚 Documentation

### API Documentation

- [ ] Document all new endpoints
- [ ] Add request/response examples
- [ ] Include error codes
- [ ] Authentication requirements

### User Guides

- [ ] Admin user management guide
- [ ] Farm verification procedures
- [ ] Product management best practices
- [ ] Order processing workflows

---

## 🚀 Deployment Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Database migrations ready
- [ ] API documentation complete
- [ ] User guides written
- [ ] Security audit passed

### Deployment Steps

1. [ ] Run database migrations
2. [ ] Deploy backend changes
3. [ ] Deploy frontend changes
4. [ ] Verify all features working
5. [ ] Monitor for errors

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan Phase 3 improvements

---

## 📅 Timeline

**Week 1**: User Management System foundation
**Week 2**: User Management completion + Farm Verification start
**Week 3**: Farm Verification completion + Product enhancements
**Week 4**: Order Processing + Testing + Documentation

**Total Duration**: 4 weeks
**Target Completion**: End of January 2025

---

## 🎯 Next Immediate Steps

1. **Create User Management API** (Day 1-2)
   - Implement user list endpoint with filters
   - Create user detail endpoint
   - Add approval/suspension endpoints

2. **Build User Management UI** (Day 3-5)
   - Enhance customers page with new features
   - Create user detail modal
   - Implement approval workflow UI

3. **Create Farm Verification API** (Day 6-7)
   - Implement farm list endpoint
   - Create verification endpoints
   - Add suspension/reactivation

4. **Build Farm Verification UI** (Day 8-10)
   - Create new farms management page
   - Build verification workflow
   - Implement farm detail modal

---

_Generated: December 2024_
_Status: 🚧 Phase 2 Started_
_Next: Begin User Management API implementation_
