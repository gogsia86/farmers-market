# Testing Guide - Farmers Market Platform
**Updated: January 26, 2025**

## 🎯 Quick Testing Checklist

After database setup, verify these core features are working:

### ✅ Critical Features

- [ ] Homepage loads and displays featured farms
- [ ] User registration (Consumer & Farmer)
- [ ] Admin login works
- [ ] Farm listings display correctly
- [ ] Product browsing works
- [ ] API endpoints return valid responses

---

## 🚀 Getting Started

### Prerequisites

1. Docker Desktop running
2. Database setup completed (run `db-setup.bat` or `npm run db:setup`)
3. Application container running (`docker-compose up -d`)

### Test Credentials

```plaintext
Admin User:
  Email: gogsia@gmail.com
  Password: Admin123!
  URL: http://localhost:3000/admin-login

Farmer Users:
  Email: farmer1@example.com
  Password: Farmer123!
  
  Email: farmer2@example.com
  Password: Farmer123!
  
  Email: farmer3@example.com
  Password: Farmer123!

Consumer User:
  Email: consumer@example.com
  Password: Consumer123!
```

---

## 📋 Manual Testing Scenarios

### 1. Homepage Testing

**URL:** `http://localhost:3000/`

**What to Test:**
- [ ] Page loads without errors
- [ ] Featured farms section displays 6 farms
- [ ] Farm cards show:
  - Farm name
  - Location (city, state)
  - Product count
  - Review count
  - Average rating (4-5 stars)
- [ ] "View All Farms" button is visible
- [ ] No "Unable to Load Farms" error

**Expected Farms:**
1. Sunshine Valley Farm (Farmville, CA)
2. Green Acres Organic (Greenfield, WA)
3. Harvest Moon Ranch (Harvestville, OR)
4. Prairie View Homestead (Prairie City, TX)
5. Riverside Gardens (Riverside, NY)
6. Mountain Peak Farm (Boulder, CO)

---

### 2. User Registration Testing

#### A. Consumer Registration

**URL:** `http://localhost:3000/signup`

**Steps:**
1. Click "Buy Produce" or navigate to signup page
2. Fill in registration form:
   - Name: Test Consumer
   - Email: newconsumer@example.com
   - Password: Test123456!
   - User Type: Consumer
3. Click "Create Account"

**Expected Result:**
- ✅ Success message: "Account created successfully"
- ✅ Redirects to login or dashboard
- ✅ User can log in with created credentials

**Common Issues:**
- ❌ "Email already exists" - Use different email
- ❌ "Password too weak" - Use min 8 chars with uppercase, lowercase, number

#### B. Farmer Registration

**Steps:**
1. Click "Sell Products" or navigate to signup page
2. Fill in registration form:
   - Name: Test Farmer
   - Email: newfarmer@example.com
   - Password: Test123456!
   - User Type: Farmer
3. Click "Create Account"

**Expected Result:**
- ✅ Success message displayed
- ✅ User created with FARMER role
- ✅ Can access farmer dashboard after login

---

### 3. Admin Login Testing

**URL:** `http://localhost:3000/admin-login`

**Steps:**
1. Navigate to admin login page
2. Enter credentials:
   - Email: gogsia@gmail.com
   - Password: Admin123!
3. Click "Enter Divine Realm" button

**Expected Result:**
- ✅ No error messages
- ✅ Successfully authenticates
- ✅ Redirects to admin dashboard (`/admin`)
- ✅ Can see admin features and metrics

**If Login Fails:**
1. Check database has admin user:
   ```bash
   docker exec farmers-market-db psql -U postgres -d farmersmarket -c "SELECT email, role FROM users WHERE email='gogsia@gmail.com';"
   ```
2. Reset password if needed:
   ```bash
   npm run db:seed:basic
   ```

---

### 4. Farm Listings Testing

**URL:** `http://localhost:3000/farms`

**What to Test:**
- [ ] All 6 farms display in list/grid
- [ ] Each farm card shows complete information
- [ ] Filters work (if implemented)
- [ ] Search functionality works
- [ ] Clicking farm opens detail page

---

### 5. Farm Detail Page Testing

**URL:** `http://localhost:3000/farms/[slug]`

**Test URLs:**
- http://localhost:3000/farms/sunshine-valley-farm
- http://localhost:3000/farms/green-acres-organic
- http://localhost:3000/farms/harvest-moon-ranch

**What to Test:**
- [ ] Farm details display correctly
- [ ] Products list shows (should be 5 per farm)
- [ ] Reviews display with ratings
- [ ] Contact information visible
- [ ] Map/location shows (if implemented)

---

### 6. Product Browsing Testing

**URL:** `http://localhost:3000/products`

**What to Test:**
- [ ] Product grid/list displays
- [ ] Shows 30 total products
- [ ] Categories work:
  - Vegetables
  - Fruits
  - Dairy
  - Meat
  - Pantry
- [ ] Product cards show:
  - Name
  - Price
  - Unit (lb, pint, dozen, etc.)
  - Farm name
  - Stock status
- [ ] "Add to Cart" button visible

---

## 🔌 API Endpoint Testing

### Using cURL

#### 1. Featured Farms API

```bash
curl http://localhost:3000/api/featured/farms
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Sunshine Valley Farm",
      "slug": "sunshine-valley-farm",
      "description": "...",
      "city": "Farmville",
      "state": "CA",
      "_count": {
        "products": 5,
        "reviews": 2
      },
      "averageRating": 5,
      "totalReviews": 2
    }
  ],
  "meta": {
    "count": 6,
    "strategy": "top-rated",
    "agricultural": {
      "consciousness": "divine",
      "season": "FALL"
    }
  }
}
```

#### 2. Signup API

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "Test123456!",
    "userType": "CONSUMER"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "...",
    "name": "API Test User",
    "email": "apitest@example.com",
    "role": "CONSUMER",
    "createdAt": "2025-01-26T..."
  }
}
```

#### 3. Farms List API

```bash
curl http://localhost:3000/api/farms
```

**Expected:**
- Status: 200 OK
- JSON array with farm objects
- Each farm has required fields

#### 4. Products API

```bash
curl http://localhost:3000/api/products
```

**Expected:**
- Status: 200 OK
- JSON array with 30 products
- Proper category and pricing info

---

## 🧪 Automated Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

---

## 🐛 Troubleshooting

### Issue: "Unable to Load Farms"

**Cause:** Database not seeded or connection issue

**Fix:**
```bash
# Reset and reseed database
npm run db:reset

# Or manually
npm run db:push
npm run db:seed:basic
docker restart farmers-market-app
```

### Issue: "Failed to create account"

**Cause:** Database tables missing or connection issue

**Fix:**
```bash
# Check database tables exist
docker exec farmers-market-db psql -U postgres -d farmersmarket -c "\dt"

# Should show: users, farms, products, reviews, etc.
# If empty, run:
npm run db:setup
```

### Issue: Admin login fails

**Cause:** Admin user doesn't exist or wrong password

**Fix:**
```bash
# Reseed database (recreates admin user)
npm run db:seed:basic

# Credentials will be:
# Email: gogsia@gmail.com
# Password: Admin123!
```

### Issue: Docker container not running

**Fix:**
```bash
# Check status
docker-compose ps

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Issue: Database connection refused

**Fix:**
```bash
# Check database is running
docker ps --filter "name=farmers-market-db"

# Restart database
docker-compose restart db

# Check connection from host
psql postgresql://postgres:postgres@localhost:5432/farmersmarket
```

---

## 📊 Database Verification

### Check Database Health

```bash
# Connect to database
docker exec -it farmers-market-db psql -U postgres -d farmersmarket

# Check record counts
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM farms) as farms,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM reviews) as reviews;

# Should return:
# users | farms | products | reviews
#   5   |   6   |    30    |    9
```

### View Sample Data

```sql
-- View all farms
SELECT id, name, city, state, status FROM farms;

-- View all users
SELECT email, role, status FROM users;

-- View products by farm
SELECT f.name as farm, COUNT(p.id) as products
FROM farms f
LEFT JOIN products p ON p."farmId" = f.id
GROUP BY f.name;

-- View reviews
SELECT f.name as farm, r.rating, r."reviewText"
FROM reviews r
JOIN farms f ON r."farmId" = f.id;
```

---

## 🎯 Performance Testing

### Load Testing with Artillery

```bash
# Install Artillery (if not installed)
npm install -g artillery

# Test homepage
artillery quick --count 10 --num 100 http://localhost:3000

# Test API endpoint
artillery quick --count 10 --num 100 http://localhost:3000/api/featured/farms
```

### Lighthouse Performance Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

**Target Metrics:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🔐 Security Testing

### Test Rate Limiting

```bash
# Try multiple login attempts (should be rate limited after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signin/credentials \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
```

### Test SQL Injection Protection

Prisma ORM automatically protects against SQL injection, but verify:

```bash
# Try SQL injection in search
curl "http://localhost:3000/api/products?search='; DROP TABLE products; --"

# Should return safe results or error, not execute SQL
```

---

## 📝 Testing Checklist Template

Use this for manual QA sessions:

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Environment:** Local / Staging / Production
**Browser:** Chrome / Firefox / Safari / Edge

### Core Features
- [ ] Homepage loads successfully
- [ ] Featured farms display (6 farms)
- [ ] User registration (Consumer)
- [ ] User registration (Farmer)
- [ ] Admin login
- [ ] Farm listings page
- [ ] Farm detail pages
- [ ] Product browsing
- [ ] Search functionality
- [ ] Shopping cart (if implemented)
- [ ] Checkout flow (if implemented)

### API Endpoints
- [ ] GET /api/featured/farms
- [ ] GET /api/farms
- [ ] GET /api/products
- [ ] POST /api/auth/signup
- [ ] POST /api/auth/signin

### Issues Found
1. [Issue description]
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce:
   - Expected vs Actual:
   - Screenshot/logs:

### Notes
[Any additional observations]
```

---

## 🎉 Success Criteria

Platform is considered **ready for testing** when:

✅ All 6 farms load on homepage  
✅ User registration works for both Consumer and Farmer  
✅ Admin login works with provided credentials  
✅ 30 products are browsable  
✅ All API endpoints return valid responses  
✅ No console errors on key pages  
✅ Database has proper seed data  
✅ Docker containers are healthy  

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check logs:**
   ```bash
   docker-compose logs -f app
   docker-compose logs -f db
   ```

2. **Check database:**
   ```bash
   npm run db:studio
   ```

3. **Reset everything:**
   ```bash
   docker-compose down
   docker-compose up -d
   npm run db:reset
   ```

4. **Refer to:**
   - `DATABASE-FIX-SUMMARY.md` - Recent fixes applied
   - `QUICK-START-GUIDE.md` - Initial setup
   - `DOCKER-GUIDE.md` - Docker troubleshooting

---

**Last Updated:** January 26, 2025  
**Platform Version:** 1.0.0  
**Database Version:** PostgreSQL 15 with PostGIS