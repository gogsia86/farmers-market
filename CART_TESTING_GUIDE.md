# 🧪 CART TESTING GUIDE
**Quick Start Guide for Testing the Shopping Cart**

> **Purpose**: Verify the cart implementation works correctly  
> **Time Required**: 15-20 minutes  
> **Prerequisites**: Database setup, authenticated user account

---

## 🚀 QUICK START

### 1. Start the Development Server

```bash
cd "Farmers Market Platform web and app"
npm run dev
```

Server should start at: `http://localhost:3001`

---

## 🔐 SETUP AUTHENTICATION

### Option A: Use Existing Account
1. Navigate to `http://localhost:3001/auth/login`
2. Sign in with existing credentials

### Option B: Create New Account
1. Navigate to `http://localhost:3001/auth/register`
2. Fill in registration form:
   - Email: `test@example.com`
   - Password: `Password123!`
   - Role: Customer
3. Complete registration

---

## ✅ TESTING CHECKLIST

### Test 1: Access Cart Page
**Goal**: Verify cart page loads correctly

```
URL: http://localhost:3001/cart
Expected: 
- ✅ Page loads without errors
- ✅ "Shopping Cart" heading visible
- ✅ Empty cart message if no items
- ✅ "Browse Products" button works
```

**Pass Criteria**: Page displays correctly, no console errors

---

### Test 2: Add Item to Cart (API Test)
**Goal**: Verify adding items via API works

#### Using cURL:
```bash
# Replace TOKEN with actual session token from browser cookies
curl -X POST http://localhost:3001/api/cart \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_FROM_DB",
    "quantity": 2,
    "fulfillmentMethod": "DELIVERY"
  }'
```

#### Using Browser Console:
```javascript
// Open browser console on cart page, run:
fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'PRODUCT_ID', // Replace with real product ID
    quantity: 2,
    fulfillmentMethod: 'DELIVERY'
  })
})
.then(r => r.json())
.then(console.log);
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "cart_item_id",
    "productId": "...",
    "name": "Product Name",
    "price": 5.99,
    "quantity": 2,
    ...
  }
}
```

**Pass Criteria**: Response returns `success: true` and cart item data

---

### Test 3: View Cart with Items
**Goal**: Verify cart displays items correctly

1. Refresh cart page: `http://localhost:3001/cart`
2. **Verify visible elements**:
   - ✅ Cart item cards appear
   - ✅ Product name displays
   - ✅ Product image or fallback emoji
   - ✅ Price per unit shows
   - ✅ Quantity displays correctly
   - ✅ Farm name appears (grouped by farm)
   - ✅ Order summary sidebar visible
   - ✅ Subtotal, tax, delivery fee calculated
   - ✅ Total price displays prominently
   - ✅ "Proceed to Checkout" button enabled

**Pass Criteria**: All elements display correctly with accurate calculations

---

### Test 4: Update Item Quantity
**Goal**: Verify quantity changes work

1. Find the quantity stepper (+ / - buttons)
2. Click **+** button
   - ✅ Quantity increases immediately (optimistic update)
   - ✅ Total price updates
   - ✅ No page reload
3. Click **-** button
   - ✅ Quantity decreases
   - ✅ Total price updates
4. Click **-** until quantity reaches 1
   - ✅ Cannot go below 1 (decrement button disabled)
5. Click **+** multiple times
   - ✅ Respects stock limits (if applicable)
   - ✅ Shows "Only X available" if stock exceeded

**Pass Criteria**: Quantity updates smoothly with accurate calculations

---

### Test 5: Remove Item from Cart
**Goal**: Verify item removal works

1. Click **"Remove"** button on any cart item
2. **Expected behavior**:
   - ✅ Item disappears from cart
   - ✅ Smooth animation (fade out)
   - ✅ Order summary updates
   - ✅ If last item: Empty cart message appears
3. Refresh page
   - ✅ Removed item stays removed (persisted to DB)

**Pass Criteria**: Item removed successfully and persists after refresh

---

### Test 6: Empty Cart State
**Goal**: Verify empty cart displays correctly

1. Remove all items from cart
2. **Expected display**:
   - ✅ Large cart emoji (🛒)
   - ✅ "Your Cart is Empty" heading
   - ✅ Helpful message
   - ✅ "Browse Products" button
   - ✅ No order summary
3. Click "Browse Products" button
   - ✅ Redirects to `/products`

**Pass Criteria**: Empty state is friendly and actionable

---

### Test 7: Multi-Farm Cart
**Goal**: Verify multiple farms display correctly

1. Add products from **different farms** to cart
2. **Expected display**:
   - ✅ Items grouped by farm
   - ✅ Each farm has header with farm name
   - ✅ Each farm shows product count
   - ✅ Farm emoji (🌾) displays
   - ✅ Multi-farm notice in order summary
3. **Order summary shows**:
   - ✅ "X farms" indicator
   - ✅ "Items from multiple farms may have separate delivery times"

**Pass Criteria**: Multi-farm grouping works correctly

---

### Test 8: Stock Validation
**Goal**: Verify stock limits are enforced

1. Find a product with limited stock (e.g., quantity: 5)
2. Try to add 10 items
3. **Expected behavior**:
   - ✅ Error message: "Only 5 units available"
   - ✅ Cart shows warning badge
   - ✅ Cannot increment beyond stock
4. Adjust quantity to within stock
   - ✅ Warning disappears

**Pass Criteria**: Stock limits enforced, clear error messages

---

### Test 9: Authentication Redirect
**Goal**: Verify authentication requirement

1. Sign out
2. Navigate to `http://localhost:3001/cart`
3. **Expected behavior**:
   - ✅ Lock icon (🔒) displays
   - ✅ "Sign In Required" message
   - ✅ "Sign In" button appears
4. Click "Sign In"
   - ✅ Redirects to login with callback: `/auth/login?callbackUrl=/cart`
5. Sign in
   - ✅ Returns to cart page

**Pass Criteria**: Authentication flow works smoothly

---

### Test 10: Accessibility (Keyboard Navigation)
**Goal**: Verify keyboard accessibility

1. **Tab through cart page**:
   - ✅ Skip-to-content link appears on first Tab
   - ✅ Focus indicator visible on all interactive elements
   - ✅ Quantity +/- buttons focusable
   - ✅ Remove buttons focusable
   - ✅ Checkout button focusable
2. **Use keyboard to interact**:
   - ✅ Enter/Space activates buttons
   - ✅ Tab order is logical (top to bottom, left to right)
3. **Test with screen reader** (optional):
   - ✅ ARIA labels announce correctly
   - ✅ Quantity changes announced
   - ✅ Error messages announced

**Pass Criteria**: Fully keyboard accessible, logical tab order

---

### Test 11: Error Handling
**Goal**: Verify errors display gracefully

1. **Simulate network error**:
   - Open DevTools → Network tab
   - Set throttling to "Offline"
   - Try to update quantity
2. **Expected behavior**:
   - ✅ Error banner appears at top
   - ✅ "Failed to update quantity" message
   - ✅ Cart reverts to previous state (rollback)
   - ✅ Error is dismissable (X button)
3. **Restore network**:
   - ✅ Next action works correctly

**Pass Criteria**: Errors handled gracefully with rollback

---

### Test 12: Performance
**Goal**: Verify fast load times

1. Open DevTools → Network tab
2. Hard refresh cart page (Ctrl+Shift+R)
3. **Check metrics**:
   - ✅ Initial page load: < 1 second
   - ✅ API response time: < 200ms
   - ✅ No unnecessary requests
4. **Update quantity**:
   - ✅ Optimistic update: Instant
   - ✅ API call completes: < 300ms

**Pass Criteria**: Fast load times, instant optimistic updates

---

### Test 13: Mobile Responsiveness
**Goal**: Verify mobile layout works

1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Set to iPhone SE (375px width)
3. **Verify layout**:
   - ✅ Cart items stack vertically
   - ✅ Images scale appropriately
   - ✅ Text readable (no overflow)
   - ✅ Buttons accessible (not too small)
   - ✅ Order summary moves below items
4. **Test interactions**:
   - ✅ Touch targets large enough (>44px)
   - ✅ Quantity stepper works
   - ✅ Remove button works

**Pass Criteria**: Fully responsive on mobile devices

---

### Test 14: Data Persistence
**Goal**: Verify cart persists across sessions

1. Add items to cart
2. Close browser completely
3. Reopen browser
4. Navigate to cart
5. **Expected behavior**:
   - ✅ Cart items still present
   - ✅ Quantities unchanged
   - ✅ Order summary accurate

**Pass Criteria**: Cart persists after browser restart

---

## 🐛 TROUBLESHOOTING

### Issue: "Authentication Required" even when logged in
**Solution**:
```bash
# Check session in browser DevTools → Application → Cookies
# Look for: next-auth.session-token
# If missing, re-login
```

### Issue: "Product not found" error
**Solution**:
```bash
# Ensure products exist in database
npx prisma studio
# Navigate to Product table
# Copy a valid product ID for testing
```

### Issue: Cart API returns 500 error
**Solution**:
```bash
# Check database connection
npx prisma db push

# Check server logs
# Look for error details in terminal

# Verify DATABASE_URL in .env
```

### Issue: Styles not loading
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

---

## 📊 SUCCESS CRITERIA

**ALL TESTS PASS** when:
- ✅ Cart page loads without errors
- ✅ Items can be added, updated, removed
- ✅ Calculations are accurate
- ✅ Data persists in database
- ✅ Authentication works correctly
- ✅ Errors handled gracefully
- ✅ Accessibility compliance (WCAG AA minimum)
- ✅ Mobile responsive
- ✅ Fast performance
- ✅ No console errors

---

## 🔍 ADVANCED TESTING

### Database Verification
```bash
# Open Prisma Studio
npx prisma studio

# Navigate to CartItem table
# Verify:
# - Records created when items added
# - Records updated when quantity changed
# - Records deleted when items removed
# - userId matches authenticated user
# - priceAtAdd captured correctly
# - createdAt/updatedAt timestamps accurate
```

### API Testing with Postman
Import this collection:
```json
{
  "info": { "name": "Cart API Tests" },
  "item": [
    {
      "name": "Get Cart",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/cart"
      }
    },
    {
      "name": "Add to Cart",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/cart",
        "body": {
          "mode": "raw",
          "raw": "{\"productId\":\"PRODUCT_ID\",\"quantity\":2}"
        }
      }
    }
  ]
}
```

---

## 📈 LOAD TESTING (Optional)

### Using Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test config
artillery quick --count 10 --num 50 http://localhost:3001/api/cart

# Expected:
# - All requests succeed (200/201)
# - Average response time < 200ms
# - No errors
```

---

## 🎯 NEXT STEPS AFTER TESTING

Once all tests pass:
1. ✅ Mark cart implementation as verified
2. ✅ Update PUSH_TO_100_PERCENT.md progress
3. ✅ Proceed to Product Detail Page implementation
4. ✅ Integrate "Add to Cart" button on product pages
5. ✅ Begin Checkout Flow implementation

---

## 📞 REPORT ISSUES

If any test fails:
1. Document the failure (screenshot, console errors)
2. Check relevant files:
   - Service: `src/lib/services/cart.service.ts`
   - API: `src/app/api/cart/**/*.ts`
   - Components: `src/components/cart/**/*.tsx`
   - Page: `src/app/(customer)/cart/page.tsx`
3. Review this guide's troubleshooting section
4. Check database records in Prisma Studio

---

**Testing Status**: Ready for QA  
**Last Updated**: 2025-01-XX  
**Estimated Testing Time**: 15-20 minutes

*"Test thoroughly, ship confidently!"* 🧪✅