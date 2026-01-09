# 🔐 TEST CREDENTIALS REFERENCE
**Farmers Market Platform - Development & Testing**

Last Updated: 2026-01-09
Database: Successfully Seeded ✅

---

## 📋 QUICK REFERENCE

### **Admin Account**
```
Email:    gogsia@gmail.com
Password: Admin123!
Role:     ADMIN
Status:   ACTIVE
```

### **Farmer Accounts**

**Farmer 1 (John Farmer)**
```
Email:    farmer1@example.com
Password: Farmer123!
Role:     FARMER
Status:   ACTIVE
Farm:     Sunshine Valley Farm
```

**Farmer 2**
```
Email:    farmer2@example.com
Password: Farmer123!
Role:     FARMER
Status:   ACTIVE
Farm:     Green Acres Organic
```

**Farmer 3**
```
Email:    farmer3@example.com
Password: Farmer123!
Role:     FARMER
Status:   ACTIVE
Farm:     Happy Harvest Homestead
```

### **Consumer Account**
```
Email:    consumer@example.com
Password: Consumer123!
Role:     CONSUMER
Status:   ACTIVE
```

---

## 🌾 COMPREHENSIVE SEED DATA ACCOUNTS

### **Admin Users**

**Main Admin (Mile Mochwara)**
```
Email:    admin@farmersmarket.app
Password: DivineAdmin123!
Role:     ADMIN
Status:   ACTIVE
Phone:    +15551234567
```

**Development Admin**
```
Email:    gogsia@gmail.com
Password: Admin123!
Role:     ADMIN
Status:   ACTIVE
```

### **Farmer Users**

**Ana Romana (Primary Test Farmer)**
```
Email:    ana.romana@email.com
Password: FarmLife2024!
Role:     FARMER
Status:   ACTIVE
Phone:    +15551111001
Farm:     Romana's Organic Haven
```

**Sarah Greenfield**
```
Email:    sarah.greenfield@email.com
Password: OrganicFarm23!
Role:     FARMER
Status:   ACTIVE
Phone:    +15551111002
```

**John Harvest**
```
Email:    john.harvest@email.com
Password: VeggieKing99!
Role:     FARMER
Status:   ACTIVE
Phone:    +15551111003
```

**Maria Flores**
```
Email:    maria.flores@email.com
Password: FreshProduce2024!
Role:     FARMER
Status:   ACTIVE
Phone:    +15551111004
```

**David Organicson**
```
Email:    david.organic@email.com
Password: SustainFarm!45
Role:     FARMER
Status:   ACTIVE
Phone:    +15551111005
```

### **Consumer Users**

**Divna Kapica (Primary Test Consumer)**
```
Email:    divna.kapica@email.com
Password: HealthyEating2024!
Role:     CONSUMER
Status:   ACTIVE
Phone:    +15552222001
Preferences: vegetarian, organic
```

**Basic Consumer**
```
Email:    consumer@example.com
Password: Consumer123!
Role:     CONSUMER
Status:   ACTIVE
```

---

## 🚀 USAGE INSTRUCTIONS

### **Login to Application**
1. Navigate to: `http://localhost:3001/login`
2. Enter email and password from above
3. Click "Sign In"

### **API Testing (cURL)**
```bash
# Login request
curl -X POST http://localhost:3001/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer1@example.com",
    "password": "Farmer123!"
  }'
```

### **Playwright E2E Tests**
```typescript
// Use in test files
const TEST_USERS = {
  admin: {
    email: 'gogsia@gmail.com',
    password: 'Admin123!'
  },
  farmer: {
    email: 'farmer1@example.com',
    password: 'Farmer123!'
  },
  consumer: {
    email: 'consumer@example.com',
    password: 'Consumer123!'
  }
};
```

---

## 🔧 DATABASE MANAGEMENT

### **Reseed Database**
```bash
# Reset and reseed with basic data
npm run db:reset

# Or just seed (without reset)
npm run db:seed

# Seed with comprehensive data
npm run db:seed:comprehensive
```

### **Check Users in Database**
```bash
# Run debug script
npm run debug:auth

# Check specific user
TEST_USER_PASSWORD=Farmer123! npm run debug:auth
```

---

## ⚠️ IMPORTANT NOTES

### **Password Requirements**
- Minimum 8 characters
- Must include special characters (!)
- Case-sensitive
- No leading/trailing spaces

### **Common Login Issues**

**Issue: "Invalid password attempt"**
- ✅ Check password case sensitivity (`Farmer123!` not `farmer123!`)
- ✅ Verify no extra spaces
- ✅ Confirm database is seeded
- ✅ Try alternative account (ana.romana@email.com)

**Issue: "User not found"**
- ✅ Run: `npm run db:seed`
- ✅ Check DATABASE_URL points to correct database
- ✅ Verify email is typed correctly

**Issue: "Account not active"**
- ✅ User status must be "ACTIVE"
- ✅ Reseed database to reset statuses

### **Password Hash Information**
- Algorithm: bcrypt
- Rounds: 12
- Format: `$2b$12$...`
- Length: 60 characters

---

## 🔍 TROUBLESHOOTING

### **Authentication Flow**
1. User submits email/password
2. System finds user in database
3. bcrypt compares password with stored hash
4. Checks user status is "ACTIVE"
5. Verifies user role is allowed
6. Creates JWT session token
7. Returns session to client

### **Debug Tools**
```bash
# Check NextAuth configuration
TEST_USER_PASSWORD=Farmer123! npm run debug:auth

# View database users
npm run db:studio

# Check logs
tail -f logs/app.log
```

### **Reset Everything**
```bash
# Nuclear option - complete reset
npm run db:reset          # Reset database
npm run db:seed           # Reseed with test data
rm -rf .next              # Clear Next.js cache
npm run dev               # Restart server
```

---

## 📊 ENVIRONMENT VARIABLES

### **Required for Authentication**
```env
DATABASE_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=test-secret-key-for-e2e-testing-minimum-32-characters
```

### **For Testing**
```env
TEST_USER_PASSWORD=Farmer123!
TEST_ADMIN_EMAIL=gogsia@gmail.com
TEST_FARMER_EMAIL=farmer1@example.com
TEST_CONSUMER_EMAIL=consumer@example.com
```

---

## 🎯 ROLE-BASED ACCESS

### **ADMIN Role**
- Full system access
- User management
- Farm verification
- Analytics dashboard
- System configuration

### **FARMER Role**
- Create/manage farms
- Add/edit products
- View orders
- Customer communications
- Farm analytics

### **CONSUMER Role**
- Browse farms/products
- Place orders
- Write reviews
- Manage favorites
- View order history

---

## 📞 SUPPORT

**Database Issues:**
- Check connection: `npm run db:test`
- View schema: `npx prisma studio`
- Generate client: `npx prisma generate`

**Authentication Issues:**
- Review logs: `npm run debug:auth`
- Check session: `http://localhost:3001/api/auth/session`
- Clear cookies in browser

**Need Help?**
- Check documentation: `/docs`
- Review error logs: `/logs`
- Run diagnostics: `npm run debug:auth`

---

## ✅ VERIFICATION CHECKLIST

After seeding, verify:
- [ ] Admin login works: `gogsia@gmail.com`
- [ ] Farmer login works: `farmer1@example.com`
- [ ] Consumer login works: `consumer@example.com`
- [ ] Farms are created (6 farms)
- [ ] Products exist (30+ products)
- [ ] Reviews are seeded (9+ reviews)
- [ ] All users have status "ACTIVE"
- [ ] All farmers have farms assigned

---

## 🎉 SUCCESS INDICATORS

You'll know seeding succeeded when you see:
```
✅ Admin user: gogsia@gmail.com
✅ Created 3 farmers
✅ Consumer user: consumer@example.com
✅ Created 6 farms
✅ Created 30 products
✅ Created 9 reviews
🎉 Database seeding complete!
```

**Ready to test!** 🚀

---

*Last Seed: 2026-01-09*
*Status: ✅ Successful*
*Users: 5 active accounts*
*Farms: 6 active farms*
*Products: 30 items*
