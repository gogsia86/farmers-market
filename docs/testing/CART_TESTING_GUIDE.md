# 🛒 SHOPPING CART TESTING GUIDE

**Complete Testing Checklist for Shopping Cart Feature**

---

## 🚀 SERVER STATUS

**✅ Server Running**: <http://localhost:3000>
**📍 Test Pages**:

- Products: <http://localhost:3000/products>
- Farms: <http://localhost:3000/farms>
- Homepage: <http://localhost:3000/>

---

## 🧪 COMPREHENSIVE TEST SCENARIOS

### 1️⃣ BASIC CART OPERATIONS

#### Add Item to Cart

- [ ] Navigate to http://localhost:3000/products
- [ ] Click "🛒 Add to Cart" on any product
- [ ] **Expected**: Cart sidebar opens automatically
- [ ] **Expected**: Product appears in cart with correct details
- [ ] **Expected**: Cart badge shows "1"
- [ ] **Expected**: Success toast notification appears

#### Cart Button Toggle

- [ ] Click cart button (🛒) in navigation
- [ ] **Expected**: Cart sidebar toggles open/closed
- [ ] Click anywhere outside cart sidebar
- [ ] **Expected**: Cart closes
- [ ] **Expected**: Badge persists with item count

#### Add Multiple Different Items

- [ ] Add 3 different products to cart
- [ ] **Expected**: All 3 products appear in cart
- [ ] **Expected**: Cart badge shows "3"
- [ ] **Expected**: Items grouped by farm name

---

### 2️⃣ QUANTITY CONTROLS

#### Increase Quantity

- [ ] Add item to cart
- [ ] Click **+** button multiple times
- [ ] **Expected**: Quantity increases (1 → 2 → 3...)
- [ ] **Expected**: Subtotal updates in real-time
- [ ] **Expected**: Grand total updates

#### Decrease Quantity

- [ ] Set item quantity to 3
- [ ] Click **-** button
- [ ] **Expected**: Quantity decreases (3 → 2 → 1)
- [ ] **Expected**: Totals update correctly
- [ ] Click **-** when quantity is 1
- [ ] **Expected**: Item removed from cart
- [ ] **Expected**: "Item removed" toast appears

#### Direct Quantity Input

- [ ] Try increasing quantity to 10+
- [ ] **Expected**: All calculations remain accurate
- [ ] Check that no decimal quantities appear

---

### 3️⃣ MULTI-FARM GROUPING

#### Add Items from Different Farms

- [ ] Add product from "Sunrise Organic Farms"
- [ ] Add product from "Green Valley Ranch"
- [ ] Add product from "Heritage Harvest Farm"
- [ ] **Expected**: Cart shows 3 farm sections
- [ ] **Expected**: Each farm name is clickable
- [ ] **Expected**: Each farm shows its subtotal

#### Farm Subtotals

- [ ] Verify each farm section shows correct subtotal
- [ ] Add multiple items from same farm
- [ ] **Expected**: Farm subtotal updates correctly
- [ ] **Expected**: Grand total = sum of all farm subtotals

#### Navigate to Farm Profile

- [ ] Click on farm name in cart
- [ ] **Expected**: Navigate to farm profile page
- [ ] **Expected**: Cart persists (not cleared)
- [ ] Return to products and verify cart still has items

---

### 4️⃣ CART PERSISTENCE (LocalStorage)

#### Refresh Page Test

- [ ] Add 3+ items to cart
- [ ] Note the items and quantities
- [ ] Press **F5** (refresh page)
- [ ] **Expected**: All cart items persist
- [ ] **Expected**: Quantities remain correct
- [ ] **Expected**: Totals remain accurate

#### Close and Reopen Browser

- [ ] Add items to cart
- [ ] Close browser completely
- [ ] Reopen browser and go to http://localhost:3000
- [ ] **Expected**: Cart items restored from localStorage

#### Clear Browser Data Test

- [ ] Add items to cart
- [ ] Open DevTools → Application → Local Storage
- [ ] Find and delete "farmers-market-cart" key
- [ ] Refresh page
- [ ] **Expected**: Cart is empty (data cleared)

---

### 5️⃣ REMOVE ITEMS

#### Remove Single Item

- [ ] Add 3 items to cart
- [ ] Click 🗑️ (trash icon) on one item
- [ ] **Expected**: Item removed immediately
- [ ] **Expected**: "Item removed" toast appears
- [ ] **Expected**: Totals recalculate
- [ ] **Expected**: Cart badge decreases

#### Remove All Items from Farm

- [ ] Add 2 items from same farm
- [ ] Remove both items
- [ ] **Expected**: Farm section disappears
- [ ] **Expected**: Only remaining farms shown

#### Clear Entire Cart

- [ ] Add multiple items to cart
- [ ] Click "Clear entire cart" button
- [ ] **Expected**: Confirmation dialog appears
- [ ] Confirm clear action
- [ ] **Expected**: Cart completely empty
- [ ] **Expected**: Empty state message shown
- [ ] **Expected**: Badge shows "0" or hidden

---

### 6️⃣ EMPTY CART STATE

#### View Empty Cart

- [ ] Clear cart completely
- [ ] Open cart sidebar
- [ ] **Expected**: Friendly empty state message
- [ ] **Expected**: Icon/illustration displayed
- [ ] **Expected**: "Continue Shopping" suggestion
- [ ] **Expected**: No checkout button visible

#### Add Item to Empty Cart

- [ ] From empty cart, browse products
- [ ] Add first item
- [ ] **Expected**: Empty state disappears
- [ ] **Expected**: Item shows immediately
- [ ] **Expected**: Checkout button appears

---

### 7️⃣ CHECKOUT BUTTON

#### Checkout Button Visibility

- [ ] Verify button hidden when cart empty
- [ ] Add items to cart
- [ ] **Expected**: "Proceed to Checkout" button appears
- [ ] **Expected**: Button shows total amount

#### Click Checkout

- [ ] Click "Proceed to Checkout"
- [ ] **Expected**: Navigate to checkout page (if implemented)
- [ ] **OR Expected**: "Coming soon" toast notification

---

### 8️⃣ PRICE CALCULATIONS

#### Single Item Math

- [ ] Add item priced at $5.99
- [ ] Set quantity to 3
- [ ] **Expected**: Subtotal = $17.97 (5.99 × 3)

#### Multiple Items Math

- [ ] Add:
  - Item A: $3.50 × 2 = $7.00
  - Item B: $8.99 × 1 = $8.99
  - Item C: $12.00 × 3 = $36.00
- [ ] **Expected**: Grand Total = $51.99

#### Decimal Handling

- [ ] Verify all prices show 2 decimal places
- [ ] Check calculations don't create rounding errors
- [ ] **Expected**: $5.99 × 3 = $17.97 (not $17.96 or $17.98)

---

### 9️⃣ UI/UX QUALITY

#### Responsive Design

- [ ] Open cart on desktop (full width)
- [ ] Resize browser to tablet size
- [ ] Resize to mobile size
- [ ] **Expected**: Cart sidebar adapts smoothly
- [ ] **Expected**: All buttons remain accessible

#### Animation & Transitions

- [ ] Watch cart sidebar open/close
- [ ] **Expected**: Smooth slide animation
- [ ] Add item and watch it appear
- [ ] **Expected**: Smooth fade-in
- [ ] Change quantity
- [ ] **Expected**: Numbers update smoothly

#### Touch Interactions (Mobile)

- [ ] Test all buttons on mobile device
- [ ] **Expected**: Buttons are large enough (44×44px minimum)
- [ ] **Expected**: No accidental clicks

#### Accessibility

- [ ] Tab through cart with keyboard
- [ ] **Expected**: Focus indicators visible
- [ ] **Expected**: All buttons keyboard-accessible
- [ ] Test with screen reader (optional)

---

### 🔟 ERROR HANDLING

#### Network Errors

- [ ] Add items to cart
- [ ] Disconnect internet (if cart uses API)
- [ ] Try to update cart
- [ ] **Expected**: Graceful error message
- [ ] Reconnect internet
- [ ] **Expected**: Cart syncs properly

#### Invalid Data

- [ ] Open DevTools → Console
- [ ] Check for any JavaScript errors
- [ ] **Expected**: No console errors during cart operations

#### Edge Cases

- [ ] Try adding same product twice quickly
- [ ] **Expected**: Quantity increases correctly
- [ ] Try removing item that doesn't exist
- [ ] **Expected**: No crash, handles gracefully

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Cart Testing - [Date]

### ✅ Passed Tests

- Basic add to cart
- Quantity controls
- Multi-farm grouping
- ...

### ⚠️ Issues Found

1. **Issue**: [Description]
   - **Severity**: High/Medium/Low
   - **Steps**: [How to reproduce]
   - **Expected**: [What should happen]
   - **Actual**: [What actually happens]

### 💡 Suggestions

- [Improvement ideas]
```

---

## 🎯 QUICK START TESTING

### Essential Tests (5 minutes)

1. Add 3 different products
2. Change quantities
3. Refresh page
4. Remove item
5. Clear cart

### Comprehensive Tests (20 minutes)

- Run through all sections above
- Test on different screen sizes
- Verify all calculations
- Check localStorage persistence

---

## 🐛 COMMON ISSUES TO WATCH FOR

- [ ] Cart badge not updating
- [ ] Totals miscalculated
- [ ] Items not persisting on refresh
- [ ] Cart sidebar not closing
- [ ] Duplicate items instead of quantity increase
- [ ] Farm grouping broken
- [ ] Checkout button not appearing
- [ ] Remove button not working
- [ ] LocalStorage quota exceeded (rare)

---

## 📞 REPORT ISSUES

If you find any issues, report them with:

1. **What you did** (steps to reproduce)
2. **What you expected** to happen
3. **What actually happened**
4. **Screenshot** (if applicable)
5. **Browser** & version

---

## ✅ COMPLETION CHECKLIST

Mark sections as complete:

- [ ] 1. Basic Cart Operations
- [ ] 2. Quantity Controls
- [ ] 3. Multi-Farm Grouping
- [ ] 4. Cart Persistence
- [ ] 5. Remove Items
- [ ] 6. Empty Cart State
- [ ] 7. Checkout Button
- [ ] 8. Price Calculations
- [ ] 9. UI/UX Quality
- [ ] 10. Error Handling

**All tests passed?** → Cart is production-ready! 🎉

---

_Happy Testing! 🛒✨_
