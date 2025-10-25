# 🔐 Admin Dashboard - Detailed Implementation Specification

**Feature**: Admin Dashboard & Management System
**Sprint**: Sprint 9 (Nov 4-17, 2025)
**Story Points**: 13 points
**Priority**: HIGH (P0)
**Status**: Planning Phase
**Created**: October 21, 2025

---

## 🎯 Executive Summary

The Admin Dashboard provides platform administrators with tools to manage users, farms, orders, and monitor system health. This is the first of three admin features (Dashboard → User Management → Analytics) that will give administrators full control over the Farmers Market platform.

**Business Value:**

- Enable platform moderation and quality control
- Monitor system health and key metrics
- Manage user approvals and farm verifications
- Provide insights for business decisions

**Technical Scope:**

- Admin authentication system separate from regular users
- Role-based access control (ADMIN, SUPER_ADMIN, MODERATOR)
- Dashboard with real-time platform statistics
- Foundation for future admin features (User Management, Analytics)

---

## 📊 Current System State

### Existing Infrastructure ✅

**Authentication:**

- ✅ NextAuth.js v5 configured and working
- ✅ Session management with JWT tokens
- ✅ User model with `role` field (CONSUMER, FARMER)

**Database:**

- ✅ PostgreSQL with Prisma ORM
- ✅ User, Farm, Product, Order models complete
- ✅ Indexes optimized for queries

**Frontend:**

- ✅ Next.js 14 App Router
- ✅ React Server Components
- ✅ Tailwind CSS + Agricultural Design System
- ✅ Component library (Button, Card, Input, etc.)

### What Needs to be Added 🔴

**Database Schema:**

- 🔴 Add ADMIN, SUPER_ADMIN, MODERATOR roles to UserRole enum
- 🔴 Add `status` field to User model (ACTIVE, SUSPENDED, DELETED)
- 🔴 Add `approvedBy`, `approvedAt` fields for user approval workflow
- 🔴 Add `verificationStatus` to Farm model (PENDING, VERIFIED, REJECTED)
- 🔴 Create AdminAction audit log model

**Routes & Pages:**

- 🔴 `/admin/login` - Admin-only login page
- 🔴 `/admin` - Main dashboard
- 🔴 `/admin/layout.tsx` - Admin layout with navigation
- 🔴 Middleware protection for `/admin/*` routes

**API Endpoints:**

- 🔴 `POST /api/admin/auth` - Admin authentication
- 🔴 `GET /api/admin/stats` - Dashboard statistics
- 🔴 `GET /api/admin/activity` - Recent activity feed

**Components:**

- 🔴 AdminNav - Sidebar navigation
- 🔴 StatsCard - Metric display component
- 🔴 ActivityFeed - Recent actions list
- 🔴 AdminGuard - Route protection wrapper

---

## 🗄️ Database Schema Changes

### 1. Update UserRole Enum

```prisma
// prisma/schema.prisma

enum UserRole {
  CONSUMER
  FARMER
  ADMIN         // ← ADD: Platform administrator
  SUPER_ADMIN   // ← ADD: Full system access
  MODERATOR     // ← ADD: Limited admin access
}
```

### 2. Add User Status Field

```prisma
enum UserStatus {
  ACTIVE        // Normal user, full access
  SUSPENDED     // Temporarily banned
  DELETED       // Soft deleted, can't login
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  password      String
  role          UserRole    @default(CONSUMER)
  status        UserStatus  @default(ACTIVE)    // ← ADD

  // Admin approval fields
  approvedBy    String?                          // ← ADD: Admin who approved
  approvedAt    DateTime?                        // ← ADD: Approval timestamp
  suspendedBy   String?                          // ← ADD: Admin who suspended
  suspendedAt   DateTime?                        // ← ADD: Suspension timestamp
  suspensionReason String?  @db.Text             // ← ADD: Why suspended

  // ... existing fields ...
  farms         Farm[]
  orders        Order[]
  reviews       Review[]

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([email])
  @@index([role])
  @@index([status])    // ← ADD: Index for filtering
}
```

### 3. Add Farm Verification Fields

```prisma
enum FarmVerificationStatus {
  PENDING       // Awaiting admin review
  VERIFIED      // Admin approved
  REJECTED      // Admin rejected
}

model Farm {
  id                    String                  @id @default(cuid())
  name                  String
  slug                  String                  @unique
  description           String?                 @db.Text

  // Verification fields
  verificationStatus    FarmVerificationStatus  @default(PENDING)  // ← ADD
  verifiedBy            String?                                    // ← ADD
  verifiedAt            DateTime?                                  // ← ADD
  rejectionReason       String?                 @db.Text           // ← ADD

  // ... existing fields ...
  status                FarmStatus              @default(ACTIVE)
  location              String
  latitude              Float
  longitude             Float

  owner                 User                    @relation(fields: [ownerId], references: [id])
  ownerId               String
  products              Product[]
  orders                Order[]

  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  @@index([ownerId])
  @@index([slug])
  @@index([status])
  @@index([verificationStatus])  // ← ADD: Index for admin queries
}
```

### 4. Create AdminAction Audit Log

```prisma
enum AdminActionType {
  USER_APPROVED
  USER_SUSPENDED
  USER_DELETED
  FARM_VERIFIED
  FARM_REJECTED
  ORDER_REFUNDED
  PRODUCT_REMOVED
  SETTING_CHANGED
}

model AdminAction {
  id          String          @id @default(cuid())
  type        AdminActionType

  // Who performed the action
  adminId     String
  admin       User            @relation(fields: [adminId], references: [id])

  // What was affected
  targetId    String?         // ID of affected entity (user, farm, etc.)
  targetType  String?         // "User", "Farm", "Order", etc.

  // Details
  description String          @db.Text
  metadata    Json?           // Additional data (old values, reason, etc.)
  ipAddress   String?         // For security auditing

  createdAt   DateTime        @default(now())

  @@index([adminId])
  @@index([type])
  @@index([createdAt])
  @@index([targetId, targetType])
}
```

### Migration Plan

```bash
# 1. Create migration
cd farmers-market
npx prisma migrate dev --name add_admin_features

# 2. Update Prisma Client
npx prisma generate

# 3. Seed admin user (for testing)
# Add to prisma/seed.ts:
await prisma.user.create({
  data: {
    email: 'admin@farmersmarket.com',
    name: 'Admin User',
    password: await bcrypt.hash('Admin123!@#', 10),
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    emailVerified: new Date(),
  }
})
```

---

## 🔐 Authentication & Authorization

### Admin Login Flow

```typescript
// src/app/admin/login/page.tsx
// Separate login page for admins (different from regular user login)

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Call admin auth API
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    // 2. Verify admin role
    const session = await getSession();
    if (
      !session?.user?.role ||
      !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      setError("Unauthorized: Admin access required");
      await signOut({ redirect: false });
      return;
    }

    // 3. Redirect to admin dashboard
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-600">Platform Administration</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleLogin}>
            <Input
              type="email"
              label="Email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />
            <Input
              type="password"
              label="Password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" variant="primary" fullWidth>
              Login as Admin
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
```

### Middleware Protection

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // Protect admin routes
    if (isAdminRoute) {
      const adminRoles = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];
      if (!token?.role || !adminRoles.includes(token.role)) {
        // Redirect non-admins to admin login
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Role-Based Access Control

```typescript
// src/lib/auth/permissions.ts

export const PERMISSIONS = {
  // User management
  VIEW_USERS: ["ADMIN", "SUPER_ADMIN", "MODERATOR"],
  APPROVE_USERS: ["ADMIN", "SUPER_ADMIN"],
  SUSPEND_USERS: ["ADMIN", "SUPER_ADMIN"],
  DELETE_USERS: ["SUPER_ADMIN"],

  // Farm management
  VIEW_FARMS: ["ADMIN", "SUPER_ADMIN", "MODERATOR"],
  VERIFY_FARMS: ["ADMIN", "SUPER_ADMIN"],
  SUSPEND_FARMS: ["ADMIN", "SUPER_ADMIN"],

  // System settings
  CHANGE_SETTINGS: ["SUPER_ADMIN"],
  VIEW_AUDIT_LOG: ["ADMIN", "SUPER_ADMIN"],
} as const;

export function hasPermission(
  userRole: string,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission]?.includes(userRole) ?? false;
}

// Usage in components/API
const canApproveUsers = hasPermission(session.user.role, "APPROVE_USERS");
```

---

## 🎨 Admin Dashboard UI

### Page Structure

```
/admin
├── layout.tsx              # Admin layout with sidebar
├── page.tsx                # Main dashboard
├── login/
│   └── page.tsx            # Admin login
├── users/                  # Sprint 10
│   ├── page.tsx            # User list
│   └── [id]/page.tsx       # User detail
└── farms/                  # Sprint 10
    ├── pending/page.tsx    # Farm verification queue
    └── [id]/page.tsx       # Farm detail
```

### Main Dashboard Layout

```typescript
// src/app/admin/layout.tsx

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              🌾 Farmers Market Admin
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <Button variant="secondary" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
            <AdminNav />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
```

### Dashboard Page

```typescript
// src/app/admin/page.tsx

import { DashboardStats } from "@/components/admin/DashboardStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { QuickActions } from "@/components/admin/QuickActions";
import { database } from "@/lib/database";

export default async function AdminDashboardPage() {
  // Fetch dashboard statistics (Server Component)
  const [
    totalUsers,
    totalFarms,
    totalOrders,
    totalRevenue,
    pendingFarms,
    recentActivity,
  ] = await Promise.all([
    database.user.count(),
    database.farm.count({ where: { status: "ACTIVE" } }),
    database.order.count(),
    database.order.aggregate({ _sum: { total: true } }),
    database.farm.count({ where: { verificationStatus: "PENDING" } }),
    database.adminAction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Platform overview and quick actions</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats
        totalUsers={totalUsers}
        totalFarms={totalFarms}
        totalOrders={totalOrders}
        totalRevenue={totalRevenue._sum.total ?? 0}
        pendingFarms={pendingFarms}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions pendingFarms={pendingFarms} />

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}
```

---

## 🧩 React Components

### 1. AdminNav Component

```typescript
// src/components/admin/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Farms", href: "/admin/farms", icon: BuildingStorefrontIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${
                isActive
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

### 2. DashboardStats Component

```typescript
// src/components/admin/DashboardStats.tsx

import { StatsCard } from "@/components/admin/StatsCard";
import {
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface DashboardStatsProps {
  totalUsers: number;
  totalFarms: number;
  totalOrders: number;
  totalRevenue: number;
  pendingFarms: number;
}

export function DashboardStats({
  totalUsers,
  totalFarms,
  totalOrders,
  totalRevenue,
  pendingFarms,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Users"
        value={totalUsers.toLocaleString()}
        icon={UsersIcon}
        trend={{ value: 12, direction: "up" }}
        color="blue"
      />

      <StatsCard
        title="Active Farms"
        value={totalFarms.toLocaleString()}
        icon={BuildingStorefrontIcon}
        trend={{ value: 8, direction: "up" }}
        color="green"
      />

      <StatsCard
        title="Total Orders"
        value={totalOrders.toLocaleString()}
        icon={ShoppingCartIcon}
        trend={{ value: 23, direction: "up" }}
        color="purple"
      />

      <StatsCard
        title="Revenue"
        value={`$${totalRevenue.toLocaleString()}`}
        icon={BanknotesIcon}
        trend={{ value: 15, direction: "up" }}
        color="emerald"
      />

      {pendingFarms > 0 && (
        <StatsCard
          title="Pending Farms"
          value={pendingFarms.toLocaleString()}
          icon={ClockIcon}
          alert={pendingFarms > 5}
          color="orange"
        />
      )}
    </div>
  );
}
```

### 3. StatsCard Component

```typescript
// src/components/admin/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  alert?: boolean;
  color?: "blue" | "green" | "purple" | "emerald" | "orange";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  alert,
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div
      className={`
      bg-white rounded-lg p-6 border-2
      ${alert ? "border-orange-300" : "border-gray-200"}
    `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`
            text-sm font-medium
            ${trend.direction === "up" ? "text-green-600" : "text-red-600"}
          `}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>

      {alert && (
        <div className="mt-4 flex items-center gap-2 text-orange-600">
          <span className="text-xs font-medium">Requires attention</span>
        </div>
      )}
    </div>
  );
}
```

---

## 🔌 API Routes

### GET /api/admin/stats

```typescript
// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { database } from "@/lib/database";
import { hasPermission } from "@/lib/auth/permissions";

export async function GET() {
  try {
    // 1. Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasPermission(session.user.role, "VIEW_USERS")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch statistics in parallel
    const [
      totalUsers,
      activeUsers,
      totalFarms,
      activeFarms,
      pendingFarms,
      totalOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      database.user.count(),
      database.user.count({ where: { status: "ACTIVE" } }),
      database.farm.count(),
      database.farm.count({ where: { status: "ACTIVE" } }),
      database.farm.count({ where: { verificationStatus: "PENDING" } }),
      database.order.count(),
      database.order.count({ where: { status: "COMPLETED" } }),
      database.order.aggregate({ _sum: { total: true } }),
      database.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)), // First day of month
          },
        },
        _sum: { total: true },
      }),
    ]);

    // 3. Return structured response
    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: 12.5, // Calculate from historical data
      },
      farms: {
        total: totalFarms,
        active: activeFarms,
        pending: pendingFarms,
        growth: 8.3,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        conversionRate: ((completedOrders / totalOrders) * 100).toFixed(1),
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        monthly: monthlyRevenue._sum.total || 0,
        growth: 15.7,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
```

---

## ✅ Acceptance Criteria

### AC-001: Admin can log in with elevated privileges

- [ ] Admin login page accessible at `/admin/login`
- [ ] Only users with ADMIN, SUPER_ADMIN, or MODERATOR role can access
- [ ] Regular users redirected to admin login if they try to access `/admin`
- [ ] Successful login redirects to admin dashboard
- [ ] Failed login shows clear error message

### AC-002: Admin dashboard displays accurate statistics

- [ ] Dashboard shows total users, farms, orders, revenue
- [ ] Statistics update in real-time (or on page refresh)
- [ ] Pending farms count shows farms awaiting verification
- [ ] All numbers match database records
- [ ] Loading states shown while fetching data

### AC-003: Admin navigation works correctly

- [ ] Sidebar navigation shows all admin sections
- [ ] Active route highlighted in navigation
- [ ] Navigation links work and route correctly
- [ ] Responsive design works on mobile
- [ ] Logout button signs out admin

### AC-004: Route protection enforces admin access

- [ ] Middleware blocks non-admin users from `/admin/*`
- [ ] Session expires after inactivity
- [ ] Unauthorized access redirects to admin login
- [ ] Admin role verified on every protected request
- [ ] Audit log records admin access attempts

### AC-005: Performance meets standards

- [ ] Dashboard loads in <2 seconds
- [ ] Database queries optimized with proper indexes
- [ ] Statistics cached for 1 minute
- [ ] No N+1 query issues
- [ ] Lighthouse performance score >90

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/auth/permissions.test.ts

describe("hasPermission", () => {
  it("allows SUPER_ADMIN all permissions", () => {
    expect(hasPermission("SUPER_ADMIN", "DELETE_USERS")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "VIEW_USERS")).toBe(true);
  });

  it("restricts MODERATOR from critical actions", () => {
    expect(hasPermission("MODERATOR", "DELETE_USERS")).toBe(false);
    expect(hasPermission("MODERATOR", "SUSPEND_USERS")).toBe(false);
    expect(hasPermission("MODERATOR", "VIEW_USERS")).toBe(true);
  });

  it("denies FARMER admin permissions", () => {
    expect(hasPermission("FARMER", "VIEW_USERS")).toBe(false);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/admin/stats.test.ts

describe("GET /api/admin/stats", () => {
  it("returns statistics for authenticated admin", async () => {
    const session = await createAdminSession();

    const response = await fetch("/api/admin/stats", {
      headers: { Cookie: session.cookie },
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("users");
    expect(data).toHaveProperty("farms");
    expect(data).toHaveProperty("orders");
    expect(data).toHaveProperty("revenue");
  });

  it("rejects request from non-admin user", async () => {
    const session = await createFarmerSession();

    const response = await fetch("/api/admin/stats", {
      headers: { Cookie: session.cookie },
    });

    expect(response.status).toBe(401);
  });
});
```

### E2E Tests

```typescript
// __tests__/e2e/admin-dashboard.test.ts

test("admin can log in and view dashboard", async ({ page }) => {
  // 1. Navigate to admin login
  await page.goto("/admin/login");

  // 2. Fill in credentials
  await page.fill('input[name="email"]', "admin@farmersmarket.com");
  await page.fill('input[name="password"]', "Admin123!@#");
  await page.click('button[type="submit"]');

  // 3. Verify redirect to dashboard
  await expect(page).toHaveURL("/admin");

  // 4. Verify stats are visible
  await expect(page.locator("text=Total Users")).toBeVisible();
  await expect(page.locator("text=Active Farms")).toBeVisible();

  // 5. Verify navigation works
  await page.click("text=Users");
  await expect(page).toHaveURL("/admin/users");
});
```

---

## 📅 Implementation Timeline

### Week 1 (Nov 4-10)

**Day 1-2: Database & Auth**

- ✅ Update Prisma schema with admin roles
- ✅ Create migration and run on dev database
- ✅ Seed admin user for testing
- ✅ Update NextAuth configuration
- ✅ Implement middleware protection

**Day 3-4: Admin Login & Layout**

- ✅ Create `/admin/login` page
- ✅ Build admin authentication flow
- ✅ Create admin layout with sidebar
- ✅ Implement AdminNav component
- ✅ Add AdminGuard wrapper

**Day 5: Dashboard Page**

- ✅ Create main dashboard page
- ✅ Implement stats fetching
- ✅ Build DashboardStats component
- ✅ Create StatsCard component

### Week 2 (Nov 11-17)

**Day 1-2: API & Components**

- ✅ Build `/api/admin/stats` endpoint
- ✅ Implement RecentActivity component
- ✅ Create QuickActions component
- ✅ Add real-time data updates

**Day 3-4: Testing**

- ✅ Write unit tests for permissions
- ✅ Write integration tests for API
- ✅ Write E2E tests for admin flow
- ✅ Fix any bugs discovered

**Day 5: Polish & Documentation**

- ✅ Add loading states
- ✅ Improve error handling
- ✅ Write API documentation
- ✅ Create admin user guide
- ✅ Sprint review & demo

---

## 🚀 Deployment Checklist

### Before Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Database migration tested on staging
- [ ] Admin user created in production database
- [ ] Environment variables configured
- [ ] Security audit completed
- [ ] Performance benchmarks met

### Production Deployment

- [ ] Run database migration: `npx prisma migrate deploy`
- [ ] Deploy Next.js app to Vercel
- [ ] Verify admin login works in production
- [ ] Test dashboard statistics accuracy
- [ ] Monitor error logs for first 24 hours

### Post-Deployment

- [ ] Train admin users on dashboard
- [ ] Document admin procedures
- [ ] Set up monitoring alerts
- [ ] Schedule follow-up review

---

## 📚 Related Documents

- **[Sprint Backlog](../execution/sprint-backlog.md)** - Sprint 9 tasks
- **[Technical Architecture](../technical/architecture.md)** - System overview
- **[Agricultural Design System](../design/agricultural-design-system.md)** - UI components
- **[Functional Requirements](./functional-requirements.md)** - Feature specifications

---

## ✨ Success Metrics

**Completion Criteria:**

- ✅ Admin can log in securely
- ✅ Dashboard displays accurate statistics
- ✅ Navigation works correctly
- ✅ All acceptance criteria met
- ✅ Tests passing at 100%
- ✅ Performance meets standards

**Business Impact:**

- Enable platform moderation
- Monitor system health
- Foundation for user/farm management
- Improved operational efficiency

---

_Created: October 21, 2025_
_Sprint: Sprint 9 (Nov 4-17, 2025)_
_Status: Planning Complete - Ready for Implementation ✅_
