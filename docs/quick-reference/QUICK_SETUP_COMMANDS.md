# 🚀 QUICK SETUP COMMANDS

**Copy & Paste - Get Running in 2 Minutes**

---

## 🎯 **FASTEST SETUP** (Recommended)

```powershell
# 1. Start database (if not running)
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis

# 2. Seed database with test data
npm run db:seed:basic

# 3. Start dev server
npm run dev:omen

# 4. Login as admin
# Navigate to: http://localhost:3001/admin-login
# Email: gogsia@gmail.com
# Password: Admin123!
```

**✅ DONE! You're ready to test.**

---

## 📋 **ALL SEED OPTIONS**

### Option 1: Basic Seed (Quick Testing)

```powershell
npm run db:seed:basic
```

**Creates**: 1 admin, 2 farmers, 2 consumers, 2 farms, ~15 products

**Login Credentials**:

```
Admin:     gogsia@gmail.com / Admin123!
Farmer 1:  farmer1@example.com / Farmer123!
Farmer 2:  farmer2@example.com / Farmer123!
Consumer1: consumer1@example.com / Consumer123!
Consumer2: consumer2@example.com / Consumer123!
```

---

### Option 2: Admin Only (Fastest)

```powershell
npx ts-node prisma/seed-admin.ts
```

**Creates**: Just 1 admin user

**Login Credentials**:

```
Admin: admin@farmersmarket.app / DivineAdmin123!
```

---

### Option 3: Comprehensive (Full Demo)

```powershell
npm run db:seed
```

**Creates**: 1 admin, 5 farmers, 3 consumers, 5 farms, 50+ products, orders, reviews

**Key Login Credentials**:

```
Admin:    admin@farmersmarket.app / DivineAdmin123!
Farmer:   ana.romana@email.com / FarmLife2024!
Consumer: divna.kapica@email.com / HealthyEating2024!
```

**All Farmer Accounts**:

```
ana.romana@email.com / FarmLife2024!
sarah.greenfield@email.com / OrganicFarm23!
john.harvest@email.com / VeggieKing99!
maria.flores@email.com / FreshProduce2024!
david.organic@email.com / SustainFarm!45
```

**All Consumer Accounts**:

```
divna.kapica@email.com / HealthyEating2024!
emily.conscious@email.com / LocalFood123!
michael.green@email.com / FreshLocal99!
```

---

## 🔄 **RESET DATABASE**

```powershell
# ⚠️ WARNING: Deletes ALL data!
npm run db:reset

# Or step-by-step:
npx prisma db push --force-reset
npm run db:seed:basic
```

---

## 🔍 **VIEW DATABASE**

```powershell
# Launch Prisma Studio (visual database browser)
npm run db:studio

# Opens at: http://localhost:5555
# You can view/edit all data visually
```

---

## 🐳 **DOCKER COMMANDS**

```powershell
# Start database & Redis
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis

# Check status
docker ps

# View database logs
docker logs farmersmarket-db

# Stop containers
docker-compose -f docker/compose/docker-compose.dev.yml down

# Restart containers
docker-compose -f docker/compose/docker-compose.dev.yml restart db redis
```

---

## 🧪 **TESTING COMMANDS**

```powershell
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run tests optimized for HP OMEN
npm run test:omen

# Run integration tests
npm run test:integration
```

---

## 🛠️ **TROUBLESHOOTING**

### Database Connection Failed

```powershell
# Check if containers are running
docker ps

# If not, start them
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis

# Wait 10 seconds, then restart dev server
npm run dev:omen
```

---

### Rate Limited (429 Error)

```powershell
# Restart dev server to reset rate limiting
# In dev server terminal: Ctrl+C, then:
npm run dev:omen
```

---

### Prisma Client Issues

```powershell
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Restart dev server
npm run dev:omen
```

---

### Clear Everything and Start Fresh

```powershell
# 1. Stop dev server (Ctrl+C)

# 2. Stop Docker containers
docker-compose -f docker/compose/docker-compose.dev.yml down

# 3. Start fresh containers
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis

# 4. Reset database
npx prisma db push --force-reset

# 5. Seed database
npm run db:seed:basic

# 6. Start dev server
npm run dev:omen
```

---

## 🎯 **COMMON WORKFLOWS**

### Full Development Setup

```powershell
# Terminal 1: Dev server
npm run dev:omen

# Terminal 2: Database studio (optional)
npm run db:studio

# Terminal 3: Run tests (optional)
npm run test:watch
```

---

### Quick Login Test

```powershell
# 1. Ensure database seeded
npm run db:seed:basic

# 2. Start server (if not running)
npm run dev:omen

# 3. Visit: http://localhost:3001/admin-login
# Login: gogsia@gmail.com / Admin123!
```

---

### Stripe Testing Setup

```powershell
# Terminal 1: Dev server (already running)
# Terminal 2: Stripe webhook listener
./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Terminal 3: Trigger test events
./.stripe-cli/stripe trigger payment_intent.succeeded
```

---

## 📊 **HEALTH CHECKS**

```powershell
# Check dev server is running
curl http://localhost:3001

# Check database connection
npx prisma db execute --stdin <<< "SELECT 1"

# Check Redis (if running standalone)
redis-cli ping
# Should return: PONG
```

---

## 🌐 **ACCESS POINTS**

```
Main Site:        http://localhost:3001
Admin Login:      http://localhost:3001/admin-login
User Login:       http://localhost:3001/login
Admin Dashboard:  http://localhost:3001/admin
Prisma Studio:    http://localhost:5555
API Health:       http://localhost:3001/api/health
```

---

## 📝 **NOTES**

- **First time setup**: Run `npm run db:seed:basic` before testing
- **Dev server port**: 3001 (configured for no conflicts)
- **Database**: PostgreSQL on localhost:5432
- **Redis**: Redis on localhost:6379
- **Optimized for**: HP OMEN (64GB RAM, 12 threads)

---

## ✨ **ONE-LINER COMPLETE SETUP**

```powershell
docker-compose -f docker/compose/docker-compose.dev.yml up -d db redis && timeout /t 10 && npm run db:seed:basic && npm run dev:omen
```

**Explanation**: Starts Docker → Waits 10s → Seeds database → Starts dev server

---

**📖 For detailed explanations, see**: `DATABASE_AND_AUTH_SETUP_GUIDE.md`

**Status**: READY TO RUN 🚀
