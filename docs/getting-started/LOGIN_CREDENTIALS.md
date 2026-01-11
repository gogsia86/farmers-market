# 🔐 Login Credentials - Farmers Market Platform

**Production Environment:** https://farmers-market-platform.vercel.app/login  
**Last Updated:** January 2025 (Verified from seed.ts)

---

## ✅ CORRECT Login Credentials (Verified from Database Seed)

### 👑 Admin Account

```
Email:    admin@farmersmarket.app
Password: DivineAdmin123!
Role:     ADMIN
Name:     Mile Mochwara
Status:   Active ✅ Verified ✅
```

---

### 👨‍🌾 Farmer Accounts

**Farmer 1 - Ana Romana**

```
Email:    ana.romana@email.com
Password: FarmLife2024!
Role:     FARMER
Phone:    +15551111001
Status:   Active ✅ Verified ✅
```

**Farmer 2 - Sarah Greenfield**

```
Email:    sarah.greenfield@email.com
Password: OrganicFarm23!
Role:     FARMER
Phone:    +15551111002
Status:   Active ✅ Verified ✅
```

**Farmer 3 - John Harvest**

```
Email:    john.harvest@email.com
Password: VeggieKing99!
Role:     FARMER
Phone:    +15551111003
Status:   Active ✅ Verified ✅
```

**Farmer 4 - Maria Flores**

```
Email:    maria.flores@email.com
Password: FreshProduce2024!
Role:     FARMER
Phone:    +15551111004
Status:   Active ✅ Verified ✅
```

**Farmer 5 - David Organicson**

```
Email:    david.organic@email.com
Password: SustainFarm!45
Role:     FARMER
Phone:    +15551111005
Status:   Active ✅ Verified ✅
```

---

### 🛒 Consumer Accounts

**Consumer 1 - Divna Kapica (Primary Persona)**

```
Email:    divna.kapica@email.com
Password: HealthyEating2024!
Role:     CONSUMER
Phone:    +15552222001
Status:   Active ✅ Verified ✅
Dietary:  Vegetarian, Organic
```

**Consumer 2 - Emily Conscious**

```
Email:    emily.conscious@email.com
Password: LocalFood123!
Role:     CONSUMER
Phone:    +15552222002
Status:   Active ✅ Verified ✅
Dietary:  Gluten-Free, Organic
```

**Consumer 3 - Michael Green**

```
Email:    michael.green@email.com
Password: FreshLocal99!
Role:     CONSUMER
Phone:    +15552222003
Status:   Active ✅ Verified ✅
```

---

## ❌ INCORRECT Credentials (Do Not Use)

**These credentials were previously documented but DO NOT exist in the database:**

- ❌ `gogsia@gmail.com` (does not exist)
- ❌ `admin@farmersmarket.com` (does not exist)
- ❌ `farmer1@example.com` (does not exist)
- ❌ `farmer2@example.com` (does not exist)
- ❌ `consumer@example.com` (does not exist)
- ❌ `Admin123!` password (incorrect)
- ❌ `Farmer123!` password (incorrect)
- ❌ `Customer123!` password (incorrect)

**Use only the credentials listed at the top of this document!**

---

## 🎯 Quick Login Test

1. Go to: **https://farmers-market-platform.vercel.app/login**
2. Try the **Admin account**:
   - Email: `admin@farmersmarket.app`
   - Password: `DivineAdmin123!`
3. Login should work immediately ✅

---

## 🏡 Farms in Database

The seed file creates 5 farms owned by the farmers above:

1. **Sunshine Valley Farm** - Ana Romana (California)
2. **Green Acres Organic** - Sarah Greenfield (Washington)
3. **Harvest Moon Ranch** - John Harvest (Oregon)
4. **Prairie View Homestead** - Maria Flores (Texas)
5. **Riverside Gardens** - David Organicson (New York)

---

## 📦 Products in Database

Each farm has multiple products seeded, including:

- Fresh vegetables (tomatoes, carrots, lettuce, etc.)
- Fruits (apples, berries, etc.)
- Eggs and dairy products
- Seasonal items with availability dates
- All products are marked as ACTIVE and published

---

## 📝 Important Notes

- **All accounts are pre-verified** (emailVerified = true)
- **All accounts have ACTIVE status**
- **All farmers are Stripe-onboarded** (ready to accept payments)
- **Database seed source:** `prisma/seed.ts`
- **Password format varies** per account (see individual passwords above)

---

## 🔧 Troubleshooting

### Still getting "Invalid email or password" error?

1. **Double-check the email** - Copy/paste from this document
2. **Verify the password** - Passwords are case-sensitive and include special characters
3. **Clear browser cache** - Old session data might interfere
4. **Try incognito/private mode** - Rules out browser extensions

### Password Requirements

- Minimum 8 characters
- Must include uppercase, lowercase, numbers, and special characters
- All seed passwords follow this pattern

### Need to re-seed the database?

```bash
# Force re-seed (development only)
npm run db:seed

# Vercel production re-seed
npm run db:seed:vercel:force
```

---

## 🔐 Security Notes

- **NEVER commit real passwords** to version control
- These are **SEED/TEST credentials** for development and testing
- **Change all passwords** before going to production with real users
- Implement **proper password reset** flow for production
- Enable **2FA** for admin accounts in production
- Use **environment-specific credentials**

---

## 📚 Related Documentation

- [prisma/seed.ts](./prisma/seed.ts) - Source of truth for credentials
- [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) - Deployment status
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - All commands
- [VERCEL_SEEDING_COMPLETE.md](./VERCEL_SEEDING_COMPLETE.md) - Seeding details

---

## 🎭 User Personas

### Admin - Mile Mochwara

- **Role:** Platform Administrator
- **Responsibilities:** User management, farm approvals, platform oversight
- **Access Level:** Full system access

### Primary Consumer - Divna Kapica

- **Age:** 32
- **Location:** Urban area
- **Dietary Preferences:** Vegetarian, Organic
- **Shopping Habits:** Health-conscious, values local produce
- **Tech Savvy:** High

### Primary Farmer - Ana Romana

- **Farm:** Sunshine Valley Farm
- **Specialty:** Organic vegetables and seasonal produce
- **Experience:** Long-time farmer with modern practices
- **Tech Adoption:** Moderate to high

---

**Status:** ✅ All credentials verified against `prisma/seed.ts`  
**Production URL:** https://farmers-market-platform.vercel.app  
**Last Verified:** January 2025  
**Source of Truth:** `prisma/seed.ts` lines 104-223
