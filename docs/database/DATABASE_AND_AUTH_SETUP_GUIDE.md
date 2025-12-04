# 🌾 DATABASE & AUTHENTICATION SETUP GUIDE

**Farmers Market Platform - Complete Setup Instructions**

---

## 📋 **Overview**

Your platform is **architecturally ready** but needs:

1. ✅ **Database population** (users, farms, products)
2. ✅ **Test accounts** for all user roles (Admin, Farmer, Consumer)

**Good News**: Everything is configured! You just need to run seed scripts.

---

## 🎯 **Quick Setup (5 Minutes)**

### **Option 1: Basic Setup** (Recommended for Testing)

**What it creates**: Minimal data to test all features

- 1 Admin user
- 2 Farmers
- 2 Consumers
- 2 Farms with products

```powershell
# Run this command:
npm run db:seed:basic
```

**Login Credentials Created**:

```
Admin:
  Email: gogsia@gmail.com
  Password: Admin123!

Farmer 1:
  Email: farmer1@example.com
  Password: Farmer123!

Farmer 2:
  Email: farmer2@example.com
  Password: Farmer123!

Consumer 1:
  Email: consumer1@example.com
  Password: Consumer123!

Consumer 2:
  Email: consumer2@example.com
  Password: Consumer123!
```

---

### **Option 2: Admin Only** (Quick Login Test)

**What it creates**: Just one admin user

```powershell
# Run this command:
npx ts-node prisma/seed-admin.ts
```

**Login Credentials Created**:

```
Admin:
  Email: admin@farmersmarket.app
  Password: DivineAdmin123!
  Name: Mile Mochwara
  Role: ADMIN
```

---

### **Option 3: Comprehensive Seed** (Full Demo Data)

**What it creates**: Production-like dataset

- 1 Admin (Mile Mochwara)
- 5 Farmers (Ana Romana, Sarah Greenfield, John Harvest, Maria Flores, David Organicson)
- 3 Consumers (Divna Kapica, Emily Conscious, Michael Green)
- 5 Farms with detailed profiles
- 50+ Products across all categories
- Sample orders, reviews, and notifications

```powershell
# Run this command:
npm run db:seed
```

**Key Login Credentials**:

```
Admin:
  Email: admin@farmersmarket.app
  Password: DivineAdmin123!

Featured Farmer (Ana Romana):
  Email: ana.romana@email.com
  Password: FarmLife2024!
  Farm: Sunny Valley Organic Farm

Featured Consumer (Divna Kapica):
  Email: divna.kapica@email.com
  Password: HealthyEating2024!
```

**All Credentials from Comprehensive Seed**:

```
FARMERS:
  ana.romana@email.com / FarmLife2024!
  sarah.greenfield@email.com / OrganicFarm23!
  john.harvest@email.com / VeggieKing99!
  maria.flores@email.com / FreshProduce2024!
  david.organic@email.com / SustainFarm!45

CONSUMERS:
  divna.kapica@email.com / HealthyEating2024!
  emily.conscious@email.com / LocalFood123!
  michael.green@email.com / FreshLocal99!
```

---

## 🚀 **Step-by-Step Setup Process**

### **Step 1: Ensure Services are Running**

Make sure Docker containers are running:

```powershell
# Check container status
docker ps

# Should show:
# - farmersmarket-db (PostgreSQL)
# - farmersmarket-redis (Redis)

# If not running, start them:
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis
```

---

### **Step 2: Choose Your Seed Option**

Pick one based on your needs:

#### **For Quick Testing** → Use Basic Seed

```powershell
npm run db:seed:basic
```

#### **For Demo/Presentation** → Use Comprehensive Seed

```powershell
npm run db:seed
```

#### **Just Need Admin Access** → Use Admin Only

```powershell
npx ts-node prisma/seed-admin.ts
```

---

### **Step 3: Verify Seeding Success**

You should see console output like:

```
🌾 Seeding database with basic data...

📝 Creating admin user...
✅ Admin user: gogsia@gmail.com

👨‍🌾 Creating farmer users...
✅ Farmer user: farmer1@example.com
✅ Farmer user: farmer2@example.com

🛒 Creating consumer users...
✅ Consumer user: consumer1@example.com
✅ Consumer user: consumer2@example.com

🌾 Creating farms...
✅ Farm: Green Valley Farm
✅ Farm: Sunny Meadows

🥬 Creating products...
✅ Created 15 products

✨ Database seeded successfully!
```

---

### **Step 4: Test Authentication**

#### **Test Admin Login**:

1. Navigate to: http://localhost:3001/admin-login
2. Enter credentials (based on your seed choice)
3. Click "Sign In"
4. Should redirect to `/admin` dashboard ✅

#### **Test Farmer Login**:

1. Navigate to: http://localhost:3001/login
2. Enter farmer credentials
3. Should redirect to farmer dashboard ✅

#### **Test Consumer Login**:

1. Navigate to: http://localhost:3001/login
2. Enter consumer credentials
3. Should redirect to home page (authenticated) ✅

---

## 🔧 **Troubleshooting**

### **Issue: "User not found or no password set"**

**Solution**: Database not seeded yet

```powershell
npm run db:seed:basic
```

---

### **Issue: Rate Limit Exceeded (429)**

**Solution**: Too many failed login attempts. Restart dev server:

```powershell
# Press Ctrl+C in dev server terminal, then:
npm run dev:omen
```

---

### **Issue: "Database connection failed"**

**Solution**: Docker containers not running

```powershell
# Start database and Redis:
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis

# Verify they're running:
docker ps

# Wait 10 seconds for PostgreSQL to be ready, then restart dev server
```

---

### **Issue: "Prisma Client not generated"**

**Solution**: Regenerate Prisma client

```powershell
npx prisma generate
```

---

### **Issue: Want to Start Fresh**

**Solution**: Reset database and reseed

```powershell
# ⚠️ WARNING: This deletes ALL data!
npm run db:reset

# Or manually:
npx prisma db push --force-reset
npm run db:seed:basic
```

---

## 📊 **What Gets Created**

### **Database Schema Populated**:

- ✅ Users (Admin, Farmers, Consumers)
- ✅ Farms (with profiles, locations, stories)
- ✅ Products (across all categories)
- ✅ Orders (sample transaction history)
- ✅ Reviews (ratings and feedback)
- ✅ Notifications (system messages)
- ✅ Addresses (delivery locations)

### **Authentication Features Enabled**:

- ✅ Email/Password login
- ✅ Role-based access control (RBAC)
- ✅ Session management
- ✅ Protected routes (admin, farmer, consumer)
- ✅ Rate limiting (5 attempts per IP)
- ✅ Password hashing (bcrypt, cost factor 12)

---

## 🎭 **User Role Capabilities**

### **ADMIN** (`admin@farmersmarket.app`)

**Access**:

- `/admin` - Dashboard overview
- `/admin/users` - User management
- `/admin/farms` - Farm verification
- `/admin/orders` - All orders
- `/admin/analytics` - Platform analytics
- `/admin/settings` - System configuration

**Powers**:

- View all platform data
- Verify/reject farms
- Manage users (suspend, activate)
- View financial reports
- Configure platform settings

---

### **FARMER** (e.g., `ana.romana@email.com`)

**Access**:

- `/farmer/dashboard` - Farmer dashboard
- `/farmer/products` - Product management
- `/farmer/orders` - Incoming orders
- `/farmer/farm` - Farm profile editing

**Powers**:

- Create/edit/delete products
- Manage farm profile
- Process orders
- View sales analytics
- Upload product images

---

### **CONSUMER** (e.g., `divna.kapica@email.com`)

**Access**:

- `/` - Browse farms and products
- `/cart` - Shopping cart
- `/checkout` - Order placement
- `/orders` - Order history
- `/profile` - Profile management

**Powers**:

- Browse and search products
- Add to cart and checkout
- Track orders
- Leave reviews
- Save favorite farms

---

## 🔐 **Security Features Implemented**

1. **Password Hashing**: bcrypt with cost factor 12
2. **Session Management**: JWT tokens via NextAuth
3. **Rate Limiting**: 5 login attempts per IP (Redis-backed)
4. **CSRF Protection**: Built into NextAuth
5. **SQL Injection Prevention**: Parameterized Prisma queries
6. **XSS Protection**: React automatic escaping
7. **Role-Based Access Control**: Middleware enforcement

---

## 📱 **Quick Test Checklist**

After seeding, verify these work:

- [ ] Admin can log in at `/admin-login`
- [ ] Admin can access `/admin` dashboard
- [ ] Farmer can log in at `/login`
- [ ] Farmer can see their products
- [ ] Consumer can log in at `/login`
- [ ] Consumer can browse products
- [ ] Products display correctly on home page
- [ ] Featured farms show on home page
- [ ] Platform stats display on home page

---

## 🎯 **Next Steps After Setup**

Once database is seeded and authentication works:

1. **✅ Test All User Flows**
   - Admin workflow (farm verification)
   - Farmer workflow (product creation)
   - Consumer workflow (shopping)

2. **✅ Test Stripe Integration**
   - Follow `STRIPE_MANUAL_TESTING_RESULTS.md`
   - Test payment flow end-to-end

3. **✅ Run Full Test Suite**

   ```powershell
   npm run test:coverage
   ```

4. **✅ Deploy to Staging**
   - Follow deployment guide in `.github/instructions/`

---

## 💡 **Pro Tips**

### **Development Workflow**:

```powershell
# Terminal 1: Dev server
npm run dev:omen

# Terminal 2: Database studio (visual DB browser)
npm run db:studio
# Opens at http://localhost:5555

# Terminal 3: Monitor logs
# (watch Terminal 1 for API requests)
```

### **View Data Visually**:

```powershell
# Launch Prisma Studio:
npm run db:studio

# Opens browser at http://localhost:5555
# You can see/edit all users, farms, products, etc.
```

### **Create Custom Test User**:

```powershell
# Open Prisma Studio
npm run db:studio

# Navigate to "users" table
# Click "Add record"
# Fill in:
#   email: your@email.com
#   password: (hash it first - see below)
#   role: ADMIN/FARMER/CONSUMER
#   status: ACTIVE
```

**Hash Password for Manual Creation**:

```javascript
// In Node.js console or new file:
const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("YourPassword123!", 12);
console.log(hash);
// Copy the output and paste into password field
```

---

## 📞 **Need Help?**

If you encounter issues not covered here:

1. **Check logs**: Your dev server output shows detailed errors
2. **Check Docker**: `docker ps` and `docker logs farmersmarket-db`
3. **Check Prisma**: `npx prisma studio` to visually inspect data
4. **Reset and retry**: `npm run db:reset` (⚠️ deletes all data)

---

## ✨ **Summary**

**TL;DR** - Run this one command to get started:

```powershell
npm run db:seed:basic
```

Then log in at:

- **Admin**: http://localhost:3001/admin-login
  - Email: `gogsia@gmail.com`
  - Password: `Admin123!`

**Done!** Your platform is now fully functional with authentication and sample data. 🌾⚡

---

**Status**: READY FOR TESTING
**Next Task**: Stripe webhook testing
**Documentation**: See `STRIPE_MANUAL_TESTING_RESULTS.md` for next steps
