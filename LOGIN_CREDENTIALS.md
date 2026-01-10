# 🔐 Login Credentials - Farmers Market Platform

**Production Environment:** https://farmers-market-platform.vercel.app/login  
**Last Updated:** January 10, 2026

---

## ✅ CORRECT Login Credentials (Verified)

### 👑 Admin Account
```
Email:    gogsia@gmail.com
Password: Admin123!
Role:     ADMIN
Status:   Active ✅
```

### 👨‍🌾 Farmer Accounts

**Farmer 1 (John Farmer)**
```
Email:    farmer1@example.com
Password: Farmer123!
Role:     FARMER
Status:   Active ✅
Farms:    Sunshine Valley Farm, Prairie View Homestead
```

**Farmer 2 (Sarah Green)**
```
Email:    farmer2@example.com
Password: Farmer123!
Role:     FARMER
Status:   Active ✅
Farms:    Green Acres Organic, Riverside Gardens
```

**Farmer 3 (Michael Harvest)**
```
Email:    farmer3@example.com
Password: Farmer123!
Role:     FARMER
Status:   Active ✅
Farms:    Harvest Moon Ranch, Mountain Peak Farm
```

### 🛒 Customer Account
```
Email:    consumer@example.com
Password: Customer123!
Role:     CONSUMER
Status:   Active ✅
```

---

## ❌ INCORRECT Credentials (Do Not Use)

These were documented but are NOT in the database:
- ❌ `admin@farmersmarket.com` (does not exist)
- ❌ `john@greenvalley.com` (does not exist)
- ❌ `jane@example.com` (does not exist)

**Use the credentials above instead!**

---

## 🎯 Quick Test

1. Go to: https://farmers-market-platform.vercel.app/login
2. Use any of the accounts above
3. Login should work immediately ✅

---

## 🏡 Farms in Database

All farms are seeded and active:
1. **Sunshine Valley Farm** (Farmer 1) - California
2. **Green Acres Organic** (Farmer 2) - Washington
3. **Harvest Moon Ranch** (Farmer 3) - Oregon
4. **Prairie View Homestead** (Farmer 1) - Texas
5. **Riverside Gardens** (Farmer 2) - New York
6. **Mountain Peak Farm** (Farmer 3) - Colorado

---

## 📝 Notes

- All passwords use the same format: `Role123!`
- All accounts are pre-verified (emailVerified = true)
- All accounts have ACTIVE status
- Database was seeded using `prisma/seed-basic.ts`

---

## 🔧 Troubleshooting

### "Invalid email or password" error?
- Double-check you're using the CORRECT email from this document
- Make sure password is typed exactly: `Admin123!` or `Farmer123!` or `Customer123!`
- Check caps lock is OFF
- Copy/paste directly from this document

### Still can't login?
```bash
# Check if database needs re-seeding
npm run db:seed:vercel:force
```

---

## 📚 Related Documentation

- [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) - Deployment status
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - All commands
- [VERCEL_SEEDING_COMPLETE.md](./VERCEL_SEEDING_COMPLETE.md) - Seeding details

---

**Status:** ✅ All credentials verified and working  
**Production:** https://farmers-market-platform.vercel.app  
**Last Verified:** January 10, 2026