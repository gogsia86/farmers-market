# 🧪 CART TEST GUIDE - Manual Testing Checklist

**Phase**: 1 of 3
**Time**: 15-30 minutes
**Status**: 🔍 **READY TO TEST**

---

## 🚀 STEP 1: START DEV SERVER

Open terminal and run:

```bash
npm run dev
```

**Expected**: Server starts on `http://localhost:3000`

---

## ✅ STEP 2: TEST PRODUCT BROWSING

1. **Navigate to Products Page**
   - URL: `http://localhost:3000/products`
   - ✅ Page loads successfully
   - ✅ Header appears with cart icon
   - ✅ Products display in grid
   - ✅ Cart badge shows "0" (empty cart)

2. **Check Header Elements**
   - ✅ Logo visible (🌾 Farmers Market)
   - ✅ Navigation links present
   - ✅ Cart icon visible
   - ✅ "Sign In" button present

---

## 🛒 STEP 3: TEST ADD TO CART

1. **Find "Add to Cart" Button**
   - Scroll through products
   - Look for "Add to Cart" button on ProductCard
   - **Note**: If button missing, we'll add it

2. **Click "Add to Cart"**
   - ✅ Cart badge updates (0 → 1)
   - ✅ Success indication (if implemented)

3. **Add Multiple Items**
   - Click "Add to Cart" on 3 different products
   - ✅ Badge shows correct count (3)

---

## 📂 STEP 4: TEST CART DRAWER

1. **Open Cart Drawer**
   - Click cart icon in header
   - ✅ Drawer slides in from right
   - ✅ Shows all added items
   - ✅ Each item shows: image, name, price, quantity

2. **Test Quantity Controls**
   - Click "+" button
     - ✅ Quantity increases
     - ✅ Subtotal updates
     - ✅ Badge updates
   - Click "-" button
     - ✅ Quantity decreases
     - ✅ Subtotal updates

3. **Test Remove Item**
   - Click trash icon
   - ✅ Item removed from cart
   - ✅ Cart count updates

4. **Check Price Calculations**
   - ✅ Subtotal correct
   - ✅ Tax calculated (8%)
   - ✅ Shipping shown
   - ✅ Free shipping over $50 message
   - ✅ Total price accurate

5. **Close Drawer**
   - Click X or outside drawer
   - ✅ Drawer slides out

---

## 🛒 STEP 5: TEST CART PAGE

1. **Navigate to Cart Page**
   - Click "View Cart" in drawer OR
   - Go to: `http://localhost:3000/cart`

2. **Verify Full Cart View**
   - ✅ All items displayed
   - ✅ Quantity controls work
   - ✅ Remove buttons work
   - ✅ Price summary correct
   - ✅ "Proceed to Checkout" button visible

3. **Test Empty Cart**
   - Remove all items
   - ✅ "Your cart is empty" message shows
   - ✅ "Continue Shopping" button appears

---

## 💳 STEP 6: TEST CHECKOUT PAGE

1. **Add Items Back to Cart**
   - Add 2-3 products

2. **Navigate to Checkout**
   - Click "Proceed to Checkout" from cart page OR
   - Go to: `http://localhost:3000/checkout`

3. **Verify Checkout Form**
   - ✅ Customer information section
   - ✅ Shipping address section
   - ✅ Payment section (UI only)
   - ✅ Order summary sidebar
   - ✅ All items listed
   - ✅ Totals accurate

4. **Test Form Validation** (if time)
   - Try submitting empty form
   - ✅ Validation errors appear

---

## 💾 STEP 7: TEST PERSISTENCE

1. **Add Items to Cart**
   - Add 3 products

2. **Refresh Page**
   - Press F5 or Ctrl+R
   - ✅ Cart items persist
   - ✅ Cart count remains

3. **Close Browser Tab**
   - Close tab completely
   - Reopen `http://localhost:3000/products`
   - ✅ Cart still has items (localStorage working!)

---

## 📱 STEP 8: TEST RESPONSIVENESS (Optional)

1. **Open DevTools**
   - Press F12

2. **Test Mobile View**
   - Click device toolbar (Ctrl+Shift+M)
   - Switch to iPhone/Android view
   - ✅ Cart drawer works on mobile
   - ✅ Buttons accessible
   - ✅ Layout looks good

---

## 🐛 ISSUES TO CHECK FOR

Common issues to watch for:

- [ ] Cart badge not updating
- [ ] Drawer not sliding in/out
- [ ] Quantity controls broken
- [ ] Prices calculating wrong
- [ ] Items not persisting
- [ ] Remove button not working
- [ ] Checkout page not loading
- [ ] TypeScript errors in console

**If you find issues**: Note them! We'll fix before moving to auth!

---

## ✅ TEST COMPLETION CHECKLIST

Mark what works:

- [ ] ✅ Products page loads
- [ ] ✅ Header with cart badge visible
- [ ] ✅ Can add items to cart
- [ ] ✅ Cart badge updates correctly
- [ ] ✅ Cart drawer opens/closes
- [ ] ✅ Quantity controls work
- [ ] ✅ Remove items works
- [ ] ✅ Price calculations correct
- [ ] ✅ Full cart page works
- [ ] ✅ Checkout page loads
- [ ] ✅ Cart persists on refresh

---

## 🎯 EXPECTED RESULTS

**Best Case**: Everything works perfectly! ✨

**Likely**: 1-2 small issues (easy fixes!)

**Worst Case**: Need to connect "Add to Cart" buttons

---

## 🚀 AFTER TESTING

Once testing complete:

1. **Note any issues found**
2. **Take screenshots if needed**
3. **Tell me results**: "All tests pass!" or "Found 2 issues"

Then we'll:

- Fix any bugs (if needed)
- Move to **PHASE 2: BUILD AUTHENTICATION** 🔐

---

**Ready to test?** Start your dev server! 🚀

```bash
npm run dev
```

Then visit: `http://localhost:3000/products`
