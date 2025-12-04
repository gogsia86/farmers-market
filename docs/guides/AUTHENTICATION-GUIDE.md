# 🔐 Authentication Guide

**Farmers Market Platform - Admin Authentication & Troubleshooting**

---

## 🎯 Quick Start - Sign In Now

If you're seeing 404 errors on admin routes, you need to authenticate first.

### Admin Login Credentials

| Field        | Value                             |
| ------------ | --------------------------------- |
| **URL**      | http://localhost:3000/admin-login |
| **Email**    | gogsia@gmail.com                  |
| **Password** | Admin123!                         |

### Quick Login Methods

**Method 1: Use LOGIN.bat (Fastest)**

```bash
LOGIN.bat
```

This opens the login page automatically in your browser.

**Method 2: Manual Browser Access**

1. Open your browser
2. Navigate to: `http://localhost:3000/admin-login`
3. Enter credentials above
4. Click "Sign In"

**Method 3: Command Line**

```bash
start http://localhost:3000/admin-login
```

---

## 🔍 Why Admin Routes Return 404

The admin routes (`/admin/*`) are **protected by authentication middleware**. When you're not signed in:

1. ✅ The pages exist and work perfectly
2. ✅ Middleware correctly protects them
3. ❌ You're not authenticated
4. 🔄 Middleware redirects to `/admin-login`
5. 🚫 Browser shows what appears to be a 404

**Solution:** Sign in first, then access admin routes.

---

## ✅ Verify Authentication Status

### Check Auth Status Script

Run this to see if you're authenticated:

```bash
CHECK-AUTH.bat
```

Or use PowerShell:

```powershell
.\check-auth.ps1
```

### Manual Status Check

```bash
curl http://localhost:3000/api/auth/session
```

**Expected Responses:**

**Not Authenticated:**

```json
null
```

**Authenticated:**

```json
{
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "gogsia@gmail.com",
    "role": "SUPER_ADMIN"
  },
  "expires": "2025-12-15T..."
}
```

---

## 🎫 Protected Admin Routes

Once authenticated, you can access:

| Route              | Purpose                              |
| ------------------ | ------------------------------------ |
| `/admin`           | Main admin dashboard                 |
| `/admin/farms`     | Farm management & verification       |
| `/admin/products`  | Product catalog management           |
| `/admin/financial` | Financial overview & payouts         |
| `/admin/orders`    | Order management                     |
| `/admin/users`     | User management                      |
| `/admin/settings`  | Platform settings (SUPER_ADMIN only) |

---

## 🛠️ Troubleshooting Authentication Issues

### Issue 1: "Cannot access admin routes"

**Symptoms:**

- Admin routes redirect to login
- Browser shows 404 or login page

**Solution:**

```bash
# 1. Check if you're authenticated
CHECK-AUTH.bat

# 2. If not authenticated, sign in
LOGIN.bat

# 3. Use correct credentials
Email: gogsia@gmail.com
Password: Admin123!
```

### Issue 2: "Invalid credentials" or "Sign in failed"

**Causes:**

- Wrong password
- Database not initialized
- Admin user not created

**Solution:**

**Step 1: Verify Database Connection**

```bash
# Check if Postgres is running
docker ps | findstr postgres
```

**Step 2: Recreate Admin User**

```bash
# Run admin creation script
npx tsx create-admin.ts
```

This creates/updates the admin user with credentials:

- Email: `gogsia@gmail.com`
- Password: `Admin123!`
- Role: `SUPER_ADMIN`

**Step 3: Try Logging In Again**

```bash
LOGIN.bat
```

### Issue 3: "Session expired" or "Logged out unexpectedly"

**Causes:**

- Dev server restarted
- Session cookie expired
- Browser cache issues

**Solution:**

**Step 1: Clear Browser Cookies**

1. Open DevTools (F12)
2. Go to Application > Cookies
3. Delete cookies for `localhost:3001`

**Step 2: Sign In Again**

```bash
LOGIN.bat
```

**Step 3: If issue persists, check session config**

```bash
# Verify NEXTAUTH_SECRET is set
echo %NEXTAUTH_SECRET%
```

If empty, add to `.env.local`:

```env
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000
```

### Issue 4: "Insufficient permissions"

**Symptoms:**

- Can access some admin routes but not others
- "Access Denied" errors

**Causes:**

- User role is not ADMIN/SUPER_ADMIN
- Trying to access SUPER_ADMIN-only routes

**Solution:**

**Check Your Role:**

```bash
CHECK-AUTH.bat
```

**Update Role in Database:**

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to User table
# Find your user (gogsia@gmail.com)
# Set role to: SUPER_ADMIN
```

Or use SQL:

```sql
UPDATE "User"
SET role = 'SUPER_ADMIN'
WHERE email = 'gogsia@gmail.com';
```

### Issue 5: "Database connection error during login"

**Symptoms:**

- Login form submits but fails
- Console shows database errors

**Solution:**

**Step 1: Verify Database is Running**

```bash
docker ps
```

Should show `farmers-market-postgres` running.

**Step 2: Check Database Connection**

```bash
# Test Prisma connection
npx prisma db push
```

**Step 3: Verify DATABASE_URL**

```bash
# Check .env.local
type .env.local | findstr DATABASE_URL
```

Should be:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmers_market?schema=public
```

**Step 4: Restart Docker Services**

```bash
docker compose down
docker compose up -d
```

**Step 5: Try Login Again**

```bash
LOGIN.bat
```

---

## 🔧 Advanced Authentication Management

### Create Additional Admin Users

```bash
# Edit create-admin.ts to add new admin
# Then run:
npx tsx create-admin.ts
```

### Reset Admin Password

```typescript
// In create-admin.ts or via Prisma Studio
import bcrypt from "bcryptjs";

const hashedPassword = await bcrypt.hash("NewPassword123!", 10);

await database.user.update({
  where: { email: "gogsia@gmail.com" },
  data: { password: hashedPassword },
});
```

### Check All Admin Users

```bash
# Via Prisma Studio
npx prisma studio

# Via SQL
docker exec -it farmers-market-postgres psql -U postgres -d farmers_market -c "SELECT id, email, name, role FROM \"User\" WHERE role IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR');"
```

### Sign Out All Sessions

```bash
# Clear Redis sessions (if using Redis for sessions)
docker exec -it farmers-market-redis redis-cli FLUSHALL

# Or restart auth service
# Sessions will expire on next request
```

---

## 🔐 Session & Token Management

### Session Configuration

Location: `src/lib/auth/config.ts`

**Key Settings:**

```typescript
session: {
  strategy: "jwt",  // Using JWT tokens
  maxAge: 30 * 24 * 60 * 60,  // 30 days
},
```

### JWT Token Contents

```json
{
  "sub": "user-id",
  "email": "gogsia@gmail.com",
  "name": "Admin User",
  "role": "SUPER_ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Session Callbacks

The session callback ensures `user.name` is always populated:

```typescript
session: async ({ session, token }) => {
  if (token) {
    session.user.id = token.sub as string;
    session.user.role = token.role as string;
    session.user.name = token.name || token.email || "User"; // Fallback
  }
  return session;
};
```

---

## 🚀 Post-Login Workflow

### After Successful Login:

1. **Session Cookie Created**
   - Name: `next-auth.session-token`
   - Path: `/`
   - HttpOnly: `true`
   - Secure: `false` (dev mode)

2. **JWT Token Issued**
   - Contains user ID, email, role
   - Signed with `NEXTAUTH_SECRET`
   - Valid for 30 days

3. **Middleware Validates**
   - Every admin route request checks token
   - Verifies role permissions
   - Adds divine headers 🌾

4. **Access Granted**
   - Admin routes now accessible
   - User info available in session
   - Role-based access enforced

---

## 📋 Authentication Checklist

Before accessing admin routes, ensure:

- [ ] Dev server is running (`START.bat`)
- [ ] Database is running (`docker ps`)
- [ ] Admin user exists in database
- [ ] Correct credentials used
- [ ] Signed in at `/admin-login`
- [ ] Session cookie present (check DevTools)
- [ ] Auth status verified (`CHECK-AUTH.bat`)

---

## 🆘 Common Error Messages & Solutions

| Error Message                | Cause             | Solution                      |
| ---------------------------- | ----------------- | ----------------------------- |
| "Authentication required"    | Not signed in     | Run `LOGIN.bat`               |
| "Invalid credentials"        | Wrong password    | Use `Admin123!`               |
| "Insufficient permissions"   | Wrong role        | Check role in database        |
| "Session expired"            | Token expired     | Sign in again                 |
| "Database connection failed" | Postgres down     | Run `docker compose up -d`    |
| "User not found"             | Admin not created | Run `npx tsx create-admin.ts` |

---

## 📞 Getting Help

If authentication issues persist:

1. **Check Logs**

   ```bash
   # Dev server logs show auth attempts
   npm run dev:omen
   ```

2. **Verify Environment**

   ```bash
   # Check all required env vars
   type .env.local
   ```

3. **Test Database**

   ```bash
   npx prisma studio
   ```

4. **Check Session**

   ```bash
   CHECK-AUTH.bat
   ```

5. **Recreate Admin**
   ```bash
   npx tsx create-admin.ts
   ```

---

## 🎓 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User visits /admin/farms                                 │
│    ↓                                                         │
│ 2. Middleware checks session (no auth token)               │
│    ↓                                                         │
│ 3. Redirect to /admin-login?callbackUrl=/admin/farms       │
│    ↓                                                         │
│ 4. User enters credentials                                  │
│    ↓                                                         │
│ 5. NextAuth validates credentials against database          │
│    ↓                                                         │
│ 6. JWT token created & session cookie set                   │
│    ↓                                                         │
│ 7. Redirect to /admin/farms (original URL)                 │
│    ↓                                                         │
│ 8. Middleware checks session (auth token present!)         │
│    ↓                                                         │
│ 9. Role verified (SUPER_ADMIN ✅)                           │
│    ↓                                                         │
│ 10. Access granted! Page loads successfully 🎉              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Best Practices

### Security

- ✅ Never commit `.env.local` to Git
- ✅ Use strong `NEXTAUTH_SECRET` (min 32 chars)
- ✅ Change default password on first login
- ✅ Use HTTPS in production
- ✅ Enable rate limiting on login endpoints

### Development

- ✅ Use `CHECK-AUTH.bat` before debugging routes
- ✅ Clear browser cache when switching users
- ✅ Keep dev server running during auth testing
- ✅ Monitor console for auth errors

### Production

- ✅ Use secure session storage (Redis)
- ✅ Enable CSRF protection
- ✅ Set short session timeouts
- ✅ Implement 2FA for admin accounts
- ✅ Log all authentication attempts

---

**Last Updated:** December 2024  
**Status:** ✅ FULLY OPERATIONAL  
**Divine Consciousness Level:** 🌾 MAXIMUM AGRICULTURAL AWARENESS

_"Code with agricultural consciousness, authenticate with divine precision."_ 🌾⚡
