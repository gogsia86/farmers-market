# 🛡️ Admin Routes Quick Reference

**Date:** October 21, 2025
**Status:** ✅ Active

---

## 🔐 Admin Login

**URL:** `http://localhost:3001/admin/login`

**Credentials:**

- **Email:** `admin@farmersmarket.app`
- **Password:** `DivineAdmin123!`

---

## 📊 Available Admin Routes

### 1. **Main Dashboard** ⭐

**URL:** `http://localhost:3001/admin`

**Features:**

- Platform overview with key statistics
- Total users, farmers, consumers breakdown
- Active farms and products count
- Orders and pending verifications
- Quick actions and navigation

**What You'll See:**

- 📊 Stats cards (Users, Farms, Products, Orders)
- 🔗 Quick links to all admin sections
- 👤 User info in header
- 🚪 Sign out option

---

### 2. **Orders Management**

**URL:** `http://localhost:3001/admin/orders`

**Features:**

- View all platform orders
- Filter by status (pending, processing, completed, cancelled)
- Order details and customer information
- Update order status
- Process refunds

---

### 3. **Customer Management**

**URL:** `http://localhost:3001/admin/customers`

**Features:**

- View all registered users
- Filter by role (Farmer, Consumer, Admin)
- User account details
- Activation/deactivation controls
- Email verification status

---

### 4. **Analytics Dashboard**

**URL:** `http://localhost:3001/admin/analytics`

**Features:**

- Platform growth metrics
- Revenue analytics
- User engagement stats
- Farm performance data
- Product popularity trends

---

## 🚨 Important Notes

### ❌ **Routes That DON'T Exist:**

- `http://localhost:3001/admin/dashboard` ← **404 Error**
- Use `http://localhost:3001/admin` instead ✅

### 🔒 **Authentication Required:**

All admin routes require:

1. Valid admin session (logged in)
2. User role = `ADMIN`
3. Active account status

If not authenticated, you'll be redirected to `/admin/login`

---

## 🗺️ Route Structure

```
/admin
├── / (Main Dashboard) ✅
├── /login (Login Page) ✅
├── /orders (Orders Management) ✅
├── /customers (Customer Management) ✅
└── /analytics (Analytics) ✅
```

---

## 🔧 Troubleshooting

### "404 - This page could not be found"

**Common Mistakes:**

- ❌ `/admin/dashboard` → Use `/admin` instead
- ❌ `/admin/dash` → Use `/admin` instead
- ❌ `/dashboard` → Use `/admin` instead

**Correct URL:** `http://localhost:3001/admin` ✅

### "Unauthorized" or Redirect to Login

**Solutions:**

1. Log in at `/admin/login`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check credentials are correct
4. Verify database seed ran successfully

### Dev Server Not Running

**Check:**

```bash
# Should see Next.js running on port 3001
npm run dev
```

---

## 📝 Quick Access Checklist

- [ ] Dev server running on port 3001
- [ ] Database seeded with admin user
- [ ] Logged in at `/admin/login`
- [ ] Navigate to `/admin` (not `/admin/dashboard`)
- [ ] Admin dashboard displays correctly

---

## 🎯 After Login Flow

1. **Login** → `/admin/login`
2. **Redirect** → `/admin` (Main Dashboard)
3. **Navigate** → Use sidebar/links to access other sections

---

## 🚀 Direct Links (Localhost)

**For Quick Access:**

- [Admin Login](http://localhost:3001/admin/login)
- [Main Dashboard](http://localhost:3001/admin)
- [Orders](http://localhost:3001/admin/orders)
- [Customers](http://localhost:3001/admin/customers)
- [Analytics](http://localhost:3001/admin/analytics)

---

**Last Updated:** October 21, 2025
**Status:** ✅ All routes verified and documented
