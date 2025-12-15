# 🔐 NextAuth Configuration & Debugging Guide

**Divine Authentication Setup & Troubleshooting**  
Last Updated: January 2025  
Platform: Next.js 15 + NextAuth v5

---

## 📋 Table of Contents

1. [Quick Fix Checklist](#quick-fix-checklist)
2. [Environment Setup](#environment-setup)
3. [Running Diagnostics](#running-diagnostics)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Manual Verification Steps](#manual-verification-steps)
6. [E2E Test Authentication](#e2e-test-authentication)
7. [Troubleshooting Deep Dive](#troubleshooting-deep-dive)

---

## ⚡ Quick Fix Checklist

If authentication is failing, run through this checklist:

- [ ] **Environment Variables Set**

  ```bash
  # Check if these exist in .env.test or .env.local
  DATABASE_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test
  NEXTAUTH_URL=http://localhost:3001
  NEXTAUTH_SECRET=<your-secret-here>
  ```

- [ ] **Database Running**

  ```bash
  docker-compose up -d
  # Verify: docker ps | grep postgres
  ```

- [ ] **Test Users Seeded**

  ```bash
  npm run db:test:setup
  # Or: tsx tests/global-setup.ts
  ```

- [ ] **Dev Server Running on Port 3001**

  ```bash
  npm run dev
  # Verify: curl http://localhost:3001
  ```

- [ ] **Run Diagnostic Script**
  ```bash
  npm run debug:auth
  ```

---

## 🌍 Environment Setup

### 1. Generate NEXTAUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
```

### 2. Create/Update `.env.test`

Create or update `.env.test` in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<paste-your-generated-secret-here>

# Optional: Enable NextAuth debug mode
NEXTAUTH_DEBUG=true
```

### 3. Create/Update `.env.local`

For local development, create `.env.local`:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmersmarket

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<same-secret-as-env-test>

# Optional: Enable NextAuth debug mode
NEXTAUTH_DEBUG=true
```

### 4. Verify Environment Variables

```bash
# Windows PowerShell
$env:NEXTAUTH_SECRET
$env:NEXTAUTH_URL
$env:DATABASE_URL

# Linux/Mac
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
echo $DATABASE_URL
```

---

## 🔍 Running Diagnostics

### Automated Diagnostic Tool

Run the comprehensive diagnostic script:

```bash
npm run debug:auth
```

This script checks:

- ✅ Environment variables
- ✅ Database connection
- ✅ Test users exist with correct passwords
- ✅ Password hashing/comparison
- ✅ NextAuth configuration
- ✅ Simulated auth flow

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║  🔐 NextAuth Configuration Diagnostic Tool                ║
╚════════════════════════════════════════════════════════════╝

📋 STEP 1: Environment Variables

✅ ENV: DATABASE_URL: Set
✅ ENV: NEXTAUTH_URL: Set
✅ ENV: NEXTAUTH_SECRET: Set

🗄️  STEP 2: Database Connection

✅ Database Connection: Successfully connected to database
✅ User Table: Found 3 users in database

👥 STEP 3: Test Users Verification

✅ User: admin@farmersmarket.app: User exists with correct password
✅ User: farmer@farmersmarket.app: User exists with correct password
✅ User: customer@farmersmarket.app: User exists with correct password

🔐 STEP 4: Password Hashing Test

✅ Password Hashing: Successfully hashed test password
✅ Password Verification: Password verification works
✅ Wrong Password Test: Correctly rejected wrong password

🔄 STEP 5: Simulate NextAuth Authorize Flow

✅ Auth Flow: Find User: User found
✅ Auth Flow: Check Password Exists: Password exists
✅ Auth Flow: Verify Password: Password valid
✅ Auth Flow: Check Status: User is ACTIVE
✅ Auth Flow: Check Role: User has valid role: FARMER
✅ Auth Flow: Complete: Authentication would succeed!

⚙️  STEP 6: NextAuth Configuration

✅ Auth Config File: Config file exists
✅ Config Check: CredentialsProvider: Found
✅ Config Check: bcrypt import: Found
✅ Config Check: password comparison: Found
✅ Config Check: CONSUMER role support: Found
✅ Config Check: login page config: Found

📊 DIAGNOSTIC SUMMARY

Total Checks: 23
✅ Passed: 23
❌ Failed: 0
Success Rate: 100.0%

🎉 ALL CHECKS PASSED!
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "NEXTAUTH_SECRET is missing"

**Symptom:** Login shows "Configuration error"

**Solution:**

```bash
# 1. Generate secret
openssl rand -base64 32

# 2. Add to .env.test and .env.local
echo 'NEXTAUTH_SECRET="<your-secret>"' >> .env.test
echo 'NEXTAUTH_SECRET="<your-secret>"' >> .env.local

# 3. Restart dev server
npm run dev
```

---

### Issue 2: "User not found" or "User does not exist"

**Symptom:** Diagnostic shows users missing from database

**Solution:**

```bash
# Option 1: Run global setup
tsx tests/global-setup.ts

# Option 2: Use test setup script
npm run db:test:setup

# Verify users created
npm run debug:auth
```

---

### Issue 3: "Password does not match"

**Symptom:** Diagnostic shows password verification fails

**Causes:**

- Password hash mismatch (different bcrypt versions)
- User password not properly hashed during seeding
- Typo in test credentials

**Solution:**

```bash
# 1. Delete and recreate test users
tsx tests/global-setup.ts

# 2. Verify with diagnostic
npm run debug:auth

# 3. Check password is hashed with bcrypt.hash(password, 12)
# in global-setup.ts
```

**Manual Database Check:**

```sql
-- Connect to test database
psql -h localhost -p 5433 -U postgres -d farmersmarket_test

-- Check if users exist
SELECT id, email, role, status,
       SUBSTRING(password, 1, 30) as password_hash_preview
FROM "User"
WHERE email IN (
  'admin@farmersmarket.app',
  'farmer@farmersmarket.app',
  'customer@farmersmarket.app'
);

-- Should show 3 users with $2a$ or $2b$ prefixed hashes
```

---

### Issue 4: "Invalid role: CONSUMER"

**Symptom:** Customer login fails with role rejection

**Solution:**

Update `src/lib/auth/config.ts` to include CONSUMER role:

```typescript
// In authorize() function, update allowedRoles:
const allowedRoles: UserRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
  "MODERATOR",
  "FARMER",
  "CONSUMER", // ← Add this!
];
```

---

### Issue 5: "Database connection failed"

**Symptom:** Can't connect to PostgreSQL

**Solution:**

```bash
# 1. Check if Docker container is running
docker ps | grep postgres

# 2. If not running, start it
docker-compose up -d

# 3. Verify connection manually
docker exec -it farmersmarket-postgres psql -U postgres -d farmersmarket_test

# 4. Check DATABASE_URL matches container port
# Default test DB: port 5433, password: test_password_123
```

---

### Issue 6: "Authentication Failed - An unexpected error occurred"

**Symptom:** Login page shows generic error after form submission

**Debugging Steps:**

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed API calls

2. **Check server logs:**
   - Terminal running `npm run dev`
   - Look for error messages during login attempt

3. **Enable NextAuth debug mode:**

   ```env
   # Add to .env.local
   NEXTAUTH_DEBUG=true
   ```

4. **Test API endpoint directly:**

   ```bash
   # PowerShell
   $body = @{
       email = "farmer@farmersmarket.app"
       password = "DivineFarmer123!"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:3001/api/auth/callback/credentials" `
     -Method POST `
     -Body $body `
     -ContentType "application/json"
   ```

---

### Issue 7: "Wrong port (3000 instead of 3001)"

**Symptom:** E2E tests go to localhost:3000, but server runs on 3001

**Solution:**

1. **Set BASE_URL environment variable:**

   ```bash
   # PowerShell
   $env:BASE_URL = "http://localhost:3001"

   # Linux/Mac
   export BASE_URL=http://localhost:3001
   ```

2. **Update playwright.config.temp.ts:**

   ```typescript
   export default defineConfig({
     use: {
       baseURL: process.env.BASE_URL || "http://localhost:3001",
     },
   });
   ```

3. **Run E2E tests with correct URL:**
   ```bash
   BASE_URL=http://localhost:3001 npm run test:e2e
   ```

---

## ✅ Manual Verification Steps

### Step 1: Verify Test Users in Database

```bash
# Connect to test database
docker exec -it farmersmarket-postgres psql -U postgres -d farmersmarket_test

# Run query
SELECT email, role, status, email_verified
FROM "User"
WHERE email LIKE '%farmersmarket.app%';
```

**Expected Result:**

```
               email                | role     | status | email_verified
------------------------------------+----------+--------+----------------
 admin@farmersmarket.app            | ADMIN    | ACTIVE | t
 farmer@farmersmarket.app           | FARMER   | ACTIVE | t
 customer@farmersmarket.app         | CONSUMER | ACTIVE | t
```

---

### Step 2: Test Password Hash Manually

```bash
# Create test script: test-password.js
cat > test-password.js << 'EOF'
const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'DivineFarmer123!';
  const hash = await bcrypt.hash(password, 12);

  console.log('Generated hash:', hash);

  const valid = await bcrypt.compare(password, hash);
  console.log('Verification:', valid ? 'PASS ✅' : 'FAIL ❌');
}

testPassword();
EOF

# Run test
node test-password.js
```

---

### Step 3: Test Login via API

```bash
# Create test script: test-login.js
cat > test-login.js << 'EOF'
const fetch = require('node-fetch');

async function testLogin() {
  const response = await fetch('http://localhost:3001/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'farmer@farmersmarket.app',
      password: 'DivineFarmer123!',
      redirect: false,
    }),
  });

  const data = await response.json();
  console.log('Response:', data);
}

testLogin();
EOF

# Make sure dev server is running, then:
node test-login.js
```

---

## 🎭 E2E Test Authentication

### Test Credentials

```typescript
export const TEST_USERS = {
  admin: {
    email: "admin@farmersmarket.app",
    password: "DivineAdmin123!",
    role: "ADMIN",
  },
  farmer: {
    email: "farmer@farmersmarket.app",
    password: "DivineFarmer123!",
    role: "FARMER",
  },
  customer: {
    email: "customer@farmersmarket.app",
    password: "DivineCustomer123!",
    role: "CONSUMER",
  },
};
```

### Running E2E Tests with Authentication

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, set BASE_URL
$env:BASE_URL = "http://localhost:3001"

# 3. Run auth setup
npx playwright test tests/e2e/auth.setup.ts --config=playwright.config.temp.ts --project=setup

# 4. Run full E2E suite
npm run test:e2e

# Or use the PowerShell runner
.\run-e2e-with-auth.ps1
```

### Auth Setup Process

1. **Global Setup** (`tests/global-setup.ts`)
   - Creates test database if needed
   - Seeds test users with hashed passwords
   - Creates test farms and products

2. **Auth Setup** (`tests/e2e/auth.setup.ts`)
   - Logs in as each user role via UI
   - Saves authentication state to `.auth/<role>.json`
   - Generates storageState files for reuse

3. **Test Execution**
   - Tests load pre-authenticated storageState
   - No need to login in every test
   - Tests run ~90% faster

---

## 🔬 Troubleshooting Deep Dive

### Debug NextAuth Callbacks

Add console logs to `src/lib/auth/config.ts`:

```typescript
async authorize(credentials) {
  console.log('🔐 [AUTH] Authorize called with:', {
    email: credentials?.email
  });

  if (!credentials?.email || !credentials?.password) {
    console.error('❌ [AUTH] Missing credentials');
    return null;
  }

  try {
    const user = await database.user.findUnique({
      where: { email: credentials.email as string },
    });

    console.log('👤 [AUTH] User found:', user ? 'YES' : 'NO');

    if (!user || !user.password) {
      console.error('❌ [AUTH] User not found or no password');
      return null;
    }

    const isValidPassword = await compare(
      credentials.password as string,
      user.password
    );

    console.log('🔑 [AUTH] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.error('❌ [AUTH] Invalid password');
      return null;
    }

    console.log('✅ [AUTH] Authentication successful');
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      status: user.status,
    };
  } catch (error) {
    console.error('💥 [AUTH] Error:', error);
    return null;
  }
}
```

### Monitor Network Requests

Use browser DevTools to inspect auth requests:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "auth"
4. Submit login form
5. Look for:
   - POST to `/api/auth/callback/credentials`
   - Response status (should be 200)
   - Response body (should have user data or error)

### Check Session Storage

```typescript
// In browser console (after login attempt)
// Check localStorage
Object.keys(localStorage).filter(
  (k) => k.includes("auth") || k.includes("session"),
);

// Check cookies
document.cookie
  .split(";")
  .filter((c) => c.includes("auth") || c.includes("session"));
```

---

## 📚 Reference

### File Locations

```
src/lib/auth/
├── config.ts              # Main NextAuth configuration
├── index.ts               # Re-exports for convenience
├── password.ts            # Password utilities
└── require-auth.ts        # Auth middleware

tests/
├── global-setup.ts        # Seeds test users
├── helpers/auth.ts        # Test authentication helpers
└── e2e/auth.setup.ts      # Playwright auth setup

scripts/
└── debug-nextauth.ts      # Diagnostic tool (NEW!)
```

### Key Configuration Files

- `.env.test` - Test environment variables
- `.env.local` - Local development variables
- `playwright.config.temp.ts` - Playwright with auth
- `docker-compose.yml` - Database container

---

## 🆘 Getting Help

If you're still stuck after trying these steps:

1. **Run full diagnostic:**

   ```bash
   npm run debug:auth > auth-debug.log 2>&1
   ```

2. **Collect logs:**
   - Server logs from `npm run dev`
   - Browser console errors
   - Network tab HAR file
   - Diagnostic output

3. **Check recent changes:**

   ```bash
   git log --oneline -10 -- "src/lib/auth/**" "tests/**/*auth*"
   ```

4. **Search for similar issues:**
   - Check NextAuth v5 documentation
   - Search GitHub issues
   - Review project README

---

## ✨ Success Checklist

Your auth is working correctly when:

- ✅ `npm run debug:auth` shows 100% pass rate
- ✅ Manual login at `/login` succeeds
- ✅ E2E auth setup completes without errors
- ✅ StorageState files generated in `tests/auth/.auth/`
- ✅ E2E test pass rate is ~90%+

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Maintained by:** Divine Agricultural Platform Team 🌾

For more information, see:

- [NextAuth v5 Documentation](https://next-auth.js.org/)
- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Project README](../README.md)
