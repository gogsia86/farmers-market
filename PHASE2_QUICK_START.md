# 🚀 PHASE 2 QUICK START GUIDE
## Consumer Account Management - Immediate Testing

**Last Updated:** November 2024  
**Phase:** 2 Complete  
**Time to Test:** 10 minutes  

---

## ⚡ INSTANT START (3 Commands)

```bash
# 1. Start Docker services (PostgreSQL + Redis)
docker compose -f docker/compose/docker-compose.dev.yml up -d

# 2. Start development server
npm run dev:omen

# 3. Open browser
# Navigate to: http://localhost:3001
```

---

## 🎯 TEST THE 4 NEW PAGES

### Login First
```
URL: http://localhost:3001/login
Email: divna.kapica@email.com
Password: Consumer123!
```

### 1. Profile Page (/dashboard/profile)
```
Direct Link: http://localhost:3001/dashboard/profile

Quick Tests:
✅ Change your name → Save → Refresh (data persists?)
✅ Upload avatar image → See preview → Save
✅ Go to Password tab → Change password
✅ Go to Notifications tab → Toggle settings
```

### 2. Favorites Page (/dashboard/favorites)
```
Direct Link: http://localhost:3001/dashboard/favorites

Quick Tests:
✅ View Farms tab (empty state if no favorites)
✅ View Products tab (empty state if no favorites)
✅ Add favorites from /farms page first
✅ Return and remove a favorite
```

### 3. Reviews Page (/dashboard/reviews)
```
Direct Link: http://localhost:3001/dashboard/reviews

Quick Tests:
✅ View Pending Reviews tab
✅ View Submitted Reviews tab
✅ Click Edit on a review → Change rating → Save
✅ Click Delete on a review → Confirm
```

### 4. Addresses Page (/dashboard/addresses)
```
Direct Link: http://localhost:3001/dashboard/addresses

Quick Tests:
✅ Click "Add Address" → Fill form → Save
✅ Click "Edit" → Change details → Save
✅ Click "Set as Default" on non-default address
✅ Try to delete only address (should fail)
✅ Add 2nd address, then delete one
```

---

## 🧪 API TESTING (Optional)

### Get Your Session Token
1. Login at http://localhost:3001/login
2. Open Browser DevTools → Application → Cookies
3. Copy value of `next-auth.session-token`

### Test Profile API
```bash
# Get Profile
curl http://localhost:3001/api/users/profile \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE"

# Update Profile
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE" \
  -d '{"firstName":"Test","lastName":"User","phone":"5551234567"}'
```

### Test Addresses API
```bash
# Get All Addresses
curl http://localhost:3001/api/users/addresses \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE"

# Create Address
curl -X POST http://localhost:3001/api/users/addresses \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE" \
  -d '{
    "type":"HOME",
    "street":"123 Test St",
    "city":"San Francisco",
    "state":"CA",
    "zipCode":"94102",
    "isDefault":true
  }'
```

---

## 🗄️ INSPECT DATABASE

```bash
# Open Prisma Studio
npm run db:studio

# Opens: http://localhost:5555

# Tables to check:
- users (check firstName, lastName, avatar, dietaryPreferences)
- user_addresses (check all fields, isDefault flag)
- favorites (check userId, farmId, productId)
- reviews (check rating, comment, status)
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Database not found"
```bash
# Solution: Apply migrations
npm run db:migrate
```

### Problem: "Session expired"
```bash
# Solution: Logout and login again
1. Go to http://localhost:3001/logout
2. Login: divna.kapica@email.com / Consumer123!
```

### Problem: "Avatar upload fails"
```bash
# Solution: Create uploads directory
mkdir -p public/uploads/avatars
```

### Problem: "Port 3001 already in use"
```bash
# Solution: Kill existing process
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

---

## 📊 WHAT TO VERIFY

### ✅ Profile Page
- [ ] Form fields populate with user data
- [ ] Avatar preview works
- [ ] File validation shows errors for large files
- [ ] Password change validates current password
- [ ] Dietary preferences save and persist
- [ ] Notification toggles save

### ✅ Favorites Page
- [ ] Empty states show when no favorites
- [ ] Tab badges show correct counts
- [ ] Farm cards display images and info
- [ ] Product cards show price and stock
- [ ] Remove favorite updates UI instantly
- [ ] Stats cards show correct totals

### ✅ Reviews Page
- [ ] Pending reviews show completed orders
- [ ] Submitted reviews display correctly
- [ ] Star ratings are interactive in edit mode
- [ ] Edit saves and updates timestamps
- [ ] Delete removes review from list
- [ ] Average rating calculates correctly

### ✅ Addresses Page
- [ ] Default address shows at top with badge
- [ ] Add address modal opens and closes
- [ ] Form validation works (required fields)
- [ ] State dropdown has all 50 states
- [ ] Set default updates properly
- [ ] Cannot delete only address
- [ ] Edit address updates fields

---

## 🎨 VISUAL CHECKS

### Design System
- [ ] Green buttons for primary actions
- [ ] Gray outline buttons for secondary
- [ ] Consistent card styling with shadows
- [ ] Emoji icons used throughout
- [ ] Responsive grid layouts work

### Responsive Design
- [ ] Test on mobile width (375px)
- [ ] Test on tablet width (768px)
- [ ] Test on desktop (1440px)
- [ ] All modals work on mobile
- [ ] Navigation is touch-friendly

---

## 📈 PERFORMANCE CHECKS

### Page Load Times (Dev Mode)
- Profile: Should load < 500ms
- Favorites: Should load < 600ms (with images)
- Reviews: Should load < 500ms
- Addresses: Should load < 400ms

### API Response Times
- All endpoints: Should respond < 200ms
- File upload: Should complete < 2s for 1MB image

---

## 🔗 NAVIGATION FLOW

Test the full user journey:
```
1. Login → Dashboard
2. Click "Profile" from quick stats
3. Update name → Save
4. Navigate to Favorites
5. Add farm to favorites from /farms
6. Return to Favorites → Verify
7. Navigate to Reviews
8. Complete an order (if none exist)
9. Write a review
10. Navigate to Addresses
11. Add delivery address
12. Set as default
13. Return to Dashboard
14. Verify all stats updated
```

---

## 🎓 COMMON TASKS

### Reset Test Data
```sql
-- In Prisma Studio or psql:

-- Clear all addresses
DELETE FROM user_addresses WHERE userId = 'USER_ID';

-- Clear all favorites
DELETE FROM favorites WHERE userId = 'USER_ID';

-- Clear all reviews
DELETE FROM reviews WHERE userId = 'USER_ID';

-- Reset password (if locked out)
-- Use bcrypt online tool to hash "Consumer123!"
UPDATE users 
SET password = '$2a$10$HASHED_PASSWORD_HERE'
WHERE email = 'divna.kapica@email.com';
```

### Add Test Favorites
```javascript
// In browser console on /farms page:
fetch('/api/users/favorites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'farm',
    farmId: 'COPY_FARM_ID_FROM_PAGE'
  })
}).then(r => r.json()).then(console.log)
```

---

## 📚 REFERENCE

### Test Accounts
```
Consumer:
  Email: divna.kapica@email.com
  Password: Consumer123!

Farmer:
  Email: ana.romana@email.com
  Password: Farmer123!

Admin:
  Email: gogsia@gmail.com
  Password: Admin123!
```

### Key URLs
```
Dashboard:    http://localhost:3001/dashboard
Profile:      http://localhost:3001/dashboard/profile
Favorites:    http://localhost:3001/dashboard/favorites
Reviews:      http://localhost:3001/dashboard/reviews
Addresses:    http://localhost:3001/dashboard/addresses
Farms:        http://localhost:3001/farms
Prisma:       http://localhost:5555
```

### Key Files
```
Pages:
  src/app/dashboard/profile/page.tsx
  src/app/dashboard/favorites/page.tsx
  src/app/dashboard/reviews/page.tsx
  src/app/dashboard/addresses/page.tsx

APIs:
  src/app/api/users/profile/route.ts
  src/app/api/users/password/route.ts
  src/app/api/users/favorites/route.ts
  src/app/api/users/addresses/route.ts
  src/app/api/reviews/route.ts
```

---

## ✨ SUCCESS CRITERIA

Phase 2 is working correctly if:
- ✅ All 4 pages load without errors
- ✅ Forms submit and show success messages
- ✅ Data persists after page refresh
- ✅ Empty states display properly
- ✅ Edit/Delete operations work
- ✅ Authentication guards redirect to login
- ✅ API returns proper JSON responses
- ✅ No console errors in browser
- ✅ Mobile layout is responsive
- ✅ Loading states show briefly

---

## 🚀 READY FOR PHASE 3

Once you've verified Phase 2 works:
1. ✅ Mark this phase complete
2. 📝 Note any bugs found
3. 🎯 Move to Phase 3 planning
4. 🎉 Celebrate! 4 complex pages done!

---

**Need Help?**
- Check `IMPLEMENTATION_COMPLETE_PHASE2.md` for full details
- Review `.github/instructions/` for coding patterns
- Test accounts are in `prisma/seeds/` folder

**Happy Testing!** 🌾✨