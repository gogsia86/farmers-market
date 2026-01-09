# 🧪 TESTING GUIDE: FARMER ORDERS PAGES
**Date:** January 8, 2025
**Pages:** Orders List & Order Details
**Status:** Ready for Testing

---

## 📋 OVERVIEW

This guide provides comprehensive testing instructions for the newly implemented farmer orders management pages:

1. **Orders List Page:** `/farmer/farms/[farmId]/orders`
2. **Order Details Page:** `/farmer/farms/[farmId]/orders/[orderId]`

---

## 🚀 QUICK START

### Prerequisites
1. Development server running: `npm run dev` (port 3001)
2. Database seeded with test data: `npm run bot:seed`
3. Test accounts available:
   - **Farmer:** Check seeded credentials
   - **Admin:** `admin@farmersmarket.com` / `DivineAdmin123!`

### Access URLs
```
Orders List:    http://localhost:3001/farmer/farms/[farmId]/orders
Order Details:  http://localhost:3001/farmer/farms/[farmId]/orders/[orderId]
```

Replace `[farmId]` and `[orderId]` with actual IDs from your database.

---

## 🔐 AUTHENTICATION & AUTHORIZATION TESTS

### Test 1: Guest Access (Unauthenticated)
**Expected:** Redirect to login page

1. Open browser in incognito/private mode
2. Navigate to: `http://localhost:3001/farmer/farms/farm_test123/orders`
3. **Verify:** Redirected to `/login?callbackUrl=...`
4. **Pass Criteria:** ✅ No access granted, proper redirect

### Test 2: Customer Role Access
**Expected:** Redirect to homepage

1. Login as a customer (role: CONSUMER)
2. Navigate to: `/farmer/farms/farm_test123/orders`
3. **Verify:** Redirected to `/` (homepage)
4. **Pass Criteria:** ✅ Role check prevents access

### Test 3: Farmer Accessing Own Farm
**Expected:** Full access to orders list

1. Login as a farmer
2. Get your farmId from dashboard
3. Navigate to: `/farmer/farms/[yourFarmId]/orders`
4. **Verify:** Orders list page loads successfully
5. **Pass Criteria:** ✅ Page renders, stats show, table displays

### Test 4: Farmer Accessing Another Farmer's Farm
**Expected:** Redirect to dashboard

1. Login as Farmer A
2. Get Farmer B's farmId (from database or admin panel)
3. Navigate to: `/farmer/farms/[farmerBFarmId]/orders`
4. **Verify:** Redirected to `/farmer/dashboard`
5. **Pass Criteria:** ✅ Ownership check prevents access

### Test 5: Order Ownership Verification
**Expected:** Only orders for specified farm shown

1. Login as a farmer with multiple farms
2. Navigate to Farm A's orders page
3. **Verify:** Only Farm A's orders appear
4. Navigate to Farm B's orders page
5. **Verify:** Only Farm B's orders appear
6. **Pass Criteria:** ✅ Orders are farm-specific

---

## 📊 ORDERS LIST PAGE TESTS

### Test 6: Stats Dashboard
**Test Data Needed:** Orders in various statuses

1. Navigate to orders list page
2. **Verify Total Revenue:**
   - Only counts PAID orders
   - Displays formatted currency (e.g., $1,234.56)
   - Shows $0.00 for farms with no paid orders
3. **Verify Pending Orders Count:**
   - Counts orders with status = PENDING
   - Updates when orders change status
4. **Verify Processing Orders Count:**
   - Counts: CONFIRMED, PREPARING, READY, FULFILLED
   - Excludes: PENDING, COMPLETED, CANCELLED
5. **Verify Completed Orders Count:**
   - Counts orders with status = COMPLETED
6. **Pass Criteria:** ✅ All stats accurate

### Test 7: Orders Table Display
**Test Data Needed:** At least 5 orders

1. Navigate to orders list page
2. **Verify Each Row Shows:**
   - Order number
   - Item count badge
   - Customer name and email
   - First 2 product names (+ count if more)
   - Total amount
   - Farmer amount (after fees)
   - Status badge with icon
   - Payment status
   - Order date and time
   - "View Details →" link
3. **Verify Table Formatting:**
   - Alternating row hover states
   - Status badges color-coded
   - Currency properly formatted
   - Dates in readable format (e.g., "Jan 8, 2025")
4. **Pass Criteria:** ✅ All data displays correctly

### Test 8: Status Filter
**Test Data Needed:** Orders in multiple statuses

1. Navigate to orders list page
2. Select "Pending" from status dropdown
3. **Verify:** Only PENDING orders shown
4. Select "Confirmed"
5. **Verify:** Only CONFIRMED orders shown
6. Select "Preparing"
7. **Verify:** Only PREPARING orders shown
8. Select "Ready"
9. **Verify:** Only READY orders shown
10. Select "Fulfilled"
11. **Verify:** Only FULFILLED orders shown
12. Select "Completed"
13. **Verify:** Only COMPLETED orders shown
14. Select "Cancelled"
15. **Verify:** Only CANCELLED orders shown
16. Select "All Status"
17. **Verify:** All orders shown
18. **Pass Criteria:** ✅ Filter works for all statuses

### Test 9: Search Functionality

#### By Order Number
1. Enter exact order number (e.g., "ORD-2025-001234")
2. **Verify:** Matching order appears
3. Enter partial order number (e.g., "001234")
4. **Verify:** Matching order appears
5. **Pass Criteria:** ✅ Order number search works

#### By Customer Name
1. Enter customer first name
2. **Verify:** Orders for that customer appear
3. Enter customer last name
4. **Verify:** Orders for that customer appear
5. Enter partial name (e.g., "Joh" for "John")
6. **Verify:** Matching orders appear
7. **Pass Criteria:** ✅ Customer name search works

#### By Customer Email
1. Enter full email address
2. **Verify:** Orders for that customer appear
3. Enter partial email (e.g., "john@")
4. **Verify:** Matching orders appear
5. **Pass Criteria:** ✅ Email search works

#### Case Insensitivity
1. Enter search in ALL CAPS
2. **Verify:** Still finds matches
3. Enter search in lowercase
4. **Verify:** Still finds matches
5. **Pass Criteria:** ✅ Search is case-insensitive

### Test 10: Combined Filter + Search
1. Select status filter: "Confirmed"
2. Enter search query: customer name
3. **Verify:** Only confirmed orders for that customer
4. Change filter to "Completed"
5. **Verify:** Search persists, shows completed orders for customer
6. Clear search
7. **Verify:** Filter persists, shows all completed orders
8. **Pass Criteria:** ✅ Filters combine correctly

### Test 11: Pagination
**Test Data Needed:** More than 20 orders

#### Basic Navigation
1. Navigate to orders list
2. **Verify:** Shows first 20 orders
3. **Verify:** "Showing 1 to 20 of X orders" displays
4. Click "Next"
5. **Verify:** Shows orders 21-40
6. **Verify:** "Showing 21 to 40 of X orders" updates
7. Click "Previous"
8. **Verify:** Back to orders 1-20
9. **Pass Criteria:** ✅ Pagination navigation works

#### Page Number Navigation
1. Click page number "3"
2. **Verify:** Jumps to page 3
3. **Verify:** Page 3 is highlighted
4. Click page number "1"
5. **Verify:** Returns to page 1
6. **Pass Criteria:** ✅ Page number links work

#### Pagination with Filters
1. Apply status filter
2. Navigate to page 2
3. **Verify:** Filter persists on page 2
4. Change filter
5. **Verify:** Resets to page 1
6. **Pass Criteria:** ✅ Pagination + filters work

### Test 12: Empty States

#### No Orders (New Farm)
1. Create a brand new farm
2. Navigate to orders page
3. **Verify Empty State Shows:**
   - Shopping bag icon
   - "No orders found" heading
   - "Orders will appear here once customers place them." message
4. **Pass Criteria:** ✅ Empty state displays

#### No Matching Search Results
1. Enter search query with no matches: "XYZ123NOTFOUND"
2. **Verify Empty State Shows:**
   - "No orders found" heading
   - "Try adjusting your filters or search query." message
3. **Pass Criteria:** ✅ Search empty state displays

#### No Orders in Filtered Status
1. Select status filter with no matching orders
2. **Verify Empty State Shows:**
   - Suggests adjusting filters
3. **Pass Criteria:** ✅ Filter empty state displays

### Test 13: Navigation Links
1. Click "Back to Farm Details" link
2. **Verify:** Navigates to `/farmer/farms/[farmId]`
3. Return to orders list
4. Click "View Details →" on any order
5. **Verify:** Navigates to order details page
6. **Pass Criteria:** ✅ All links functional

---

## 📄 ORDER DETAILS PAGE TESTS

### Test 14: Page Load & Header
1. Navigate to an order details page
2. **Verify Header Shows:**
   - "Order [orderNumber]" title
   - Farm name subtitle
   - Status badge (large, color-coded, with icon)
   - "Back to Orders" link
3. Click "Back to Orders"
4. **Verify:** Returns to orders list
5. **Pass Criteria:** ✅ Header displays correctly

### Test 15: Order Status Card
**Test with orders in different statuses**

#### Pending Order
1. View a PENDING order
2. **Verify Shows:**
   - Status: "Pending" with yellow badge and clock icon
   - Description: "Order is awaiting your confirmation"
   - Order placed timestamp
3. **Pass Criteria:** ✅ Pending status displays

#### Confirmed Order
1. View a CONFIRMED order
2. **Verify Shows:**
   - Status: "Confirmed" with blue badge
   - Confirmation timestamp
3. **Pass Criteria:** ✅ Confirmed status displays

#### Completed Order
1. View a COMPLETED order
2. **Verify Shows:**
   - Status: "Completed" with green badge
   - All timestamps: confirmed, fulfilled, completed
3. **Pass Criteria:** ✅ Completed status displays

#### Cancelled Order
1. View a CANCELLED order
2. **Verify Shows:**
   - Status: "Cancelled" with red badge
   - Cancellation reason (if available)
   - Cancellation timestamp
3. **Pass Criteria:** ✅ Cancelled status with reason

### Test 16: Order Items Section
1. **Verify Each Item Shows:**
   - Product image (or fallback icon)
   - Product name
   - Unit price
   - Quantity
   - Subtotal
   - "View Product →" link (if product exists)
2. Click "View Product →" link
3. **Verify:** Navigates to product page
4. **Pass Criteria:** ✅ Items display correctly

### Test 17: Order Summary Calculations
**Test with real order data**

1. **Manually Verify:**
   - Subtotal = sum of all item subtotals
   - Delivery fee displays (if > 0)
   - Tax displays (if > 0)
   - Platform fee displays (if > 0)
   - Discount displays (if > 0)
   - **Total** = subtotal + delivery + tax - discount
   - **Farmer Amount** = total - platform fee
2. **Verify Formatting:**
   - All amounts in USD with $ symbol
   - Two decimal places
   - Farmer amount in green
3. **Pass Criteria:** ✅ All calculations correct

### Test 18: Fulfillment Details

#### Pickup Order
1. View order with fulfillmentMethod = PICKUP
2. **Verify Shows:**
   - Fulfillment Method: "Pickup" with icon
   - Scheduled date (if set)
   - Time slot (if set)
3. **Pass Criteria:** ✅ Pickup info displays

#### Delivery Order
1. View order with fulfillmentMethod = DELIVERY
2. **Verify Shows:**
   - Fulfillment Method: "Delivery" with truck icon
   - Delivery address (formatted with street, city, state, zip)
   - Scheduled date and time
3. **Pass Criteria:** ✅ Delivery info displays

#### Shipping Order
1. View order with fulfillmentMethod = SHIPPING
2. **Verify Shows:**
   - Fulfillment Method: "Shipping"
   - Tracking number (if available)
   - Shipping service (if available)
   - Delivery address
3. **Pass Criteria:** ✅ Shipping info displays

#### Special Instructions
1. Find order with specialInstructions
2. **Verify Shows:**
   - Blue info box
   - Label: "Special Instructions from Customer:"
   - Instructions text
3. **Pass Criteria:** ✅ Instructions display

#### Fulfillment Notes
1. Find order with fulfillmentNotes
2. **Verify Shows:**
   - Yellow warning box
   - Label: "Fulfillment Notes:"
   - Notes text
3. **Pass Criteria:** ✅ Notes display

### Test 19: Customer Information Sidebar
1. **Verify Displays:**
   - Customer full name
   - Email (clickable mailto link)
   - Phone number (clickable tel link, if available)
2. Click email link
3. **Verify:** Opens email client
4. Click phone link (if present)
5. **Verify:** Opens phone dialer (mobile) or appropriate action
6. **Pass Criteria:** ✅ Customer info and links work

### Test 20: Payment Information Sidebar

#### Payment Status
1. **Test Each Status:**
   - PENDING: Yellow "Pending Payment"
   - PAID: Green "Payment Received"
   - FAILED: Red "Payment Failed"
   - REFUNDED: Gray "Refunded"
   - PARTIALLY_REFUNDED: Orange "Partially Refunded"
2. **Pass Criteria:** ✅ All statuses display correctly

#### Payment Details
1. **Verify Shows (when available):**
   - Payment method (e.g., "Card")
   - Payment Intent ID (monospace font)
   - Paid date and time
   - Stripe Payment Intent ID (in footer)
2. **Pass Criteria:** ✅ Payment details display

### Test 21: Order Timeline Sidebar
1. **Verify Timeline Shows:**
   - "Order Placed" with timestamp (always present)
   - "Order Confirmed" with timestamp (if confirmed)
   - "Order Fulfilled" with timestamp (if fulfilled)
   - "Order Completed" with timestamp (if completed)
   - "Order Cancelled" with timestamp (if cancelled)
2. **Verify Visual:**
   - Colored dots for each event
   - Events in chronological order
   - Formatted timestamps
3. **Pass Criteria:** ✅ Timeline accurate

### Test 22: Quick Actions (Pending Orders Only)
1. View a PENDING order
2. **Verify Shows:**
   - "Confirm Order" button (green)
   - "Cancel Order" button (red outline)
3. View a CONFIRMED order
4. **Verify:** Quick Actions section hidden
5. View a COMPLETED order
6. **Verify:** Quick Actions section hidden
7. **Pass Criteria:** ✅ Actions show only for pending orders

**Note:** Button functionality will be implemented in Phase 1 enhancements

---

## 📱 RESPONSIVE DESIGN TESTS

### Test 23: Mobile View (320px - 640px)
1. Resize browser to mobile width or use mobile device
2. **Orders List Page:**
   - Stats cards stack vertically
   - Search and filter stack vertically
   - Table scrolls horizontally
   - Pagination shows Previous/Next only
3. **Order Details Page:**
   - Main content and sidebar stack vertically
   - All cards display full width
   - Text wraps appropriately
4. **Pass Criteria:** ✅ Usable on mobile

### Test 24: Tablet View (641px - 1024px)
1. Resize browser to tablet width
2. **Orders List Page:**
   - Stats cards in 2x2 grid
   - Search and filter side by side
   - Table displays without scroll
3. **Order Details Page:**
   - Sidebar below main content
   - Cards full width
4. **Pass Criteria:** ✅ Optimized for tablet

### Test 25: Desktop View (1025px+)
1. Resize to desktop width
2. **Orders List Page:**
   - Stats cards in 4 columns
   - Full table visible
   - All pagination controls show
3. **Order Details Page:**
   - Main content 2/3 width
   - Sidebar 1/3 width, sticky
   - All content visible
4. **Pass Criteria:** ✅ Optimized for desktop

---

## ⚡ PERFORMANCE TESTS

### Test 26: Page Load Speed
1. Open browser DevTools > Network tab
2. Navigate to orders list page
3. **Verify Load Time:**
   - Initial load < 2 seconds
   - Time to Interactive < 3 seconds
4. Navigate to order details page
5. **Verify Load Time:**
   - Initial load < 2 seconds
6. **Pass Criteria:** ✅ Pages load quickly

### Test 27: Database Query Performance
1. Open browser DevTools > Console
2. Check for slow query warnings in server logs
3. Navigate through pages and filters
4. **Verify:**
   - No queries taking > 1 second
   - Parallel queries executing correctly
5. **Pass Criteria:** ✅ No slow queries

### Test 28: Large Dataset Handling
**Test Data:** Farm with 100+ orders

1. Navigate to orders list
2. **Verify:**
   - Page loads without timeout
   - Pagination works smoothly
   - Stats calculate correctly
3. Apply various filters
4. **Verify:**
   - Filters respond quickly
   - No lag or freezing
5. **Pass Criteria:** ✅ Handles large datasets

---

## 🔍 EDGE CASES & ERROR HANDLING

### Test 29: Invalid Farm ID
1. Navigate to: `/farmer/farms/invalid_farm_id/orders`
2. **Verify:** 404 page or redirect
3. **Pass Criteria:** ✅ Graceful error handling

### Test 30: Invalid Order ID
1. Navigate to: `/farmer/farms/[validFarmId]/orders/invalid_order_id`
2. **Verify:** 404 page displays
3. **Pass Criteria:** ✅ Graceful error handling

### Test 31: Database Connection Error
**Manual Test (requires stopping database)**

1. Stop PostgreSQL service
2. Navigate to orders page
3. **Verify:** Error page or message displays
4. Restart database
5. Refresh page
6. **Verify:** Page loads normally
7. **Pass Criteria:** ✅ Error handled gracefully

### Test 32: Missing Order Data
1. Create order with minimal required fields only
2. View order details
3. **Verify:**
   - Page doesn't crash
   - Optional fields show gracefully (or hidden)
   - No "undefined" or "null" in UI
4. **Pass Criteria:** ✅ Handles missing data

### Test 33: Special Characters in Search
1. Enter search with special characters: `!@#$%^&*()`
2. **Verify:**
   - Search doesn't break
   - No SQL injection
   - Appropriate results or empty state
3. **Pass Criteria:** ✅ Special characters handled

### Test 34: Very Long Customer Names
1. Create order with customer name > 100 characters
2. View in orders list
3. **Verify:**
   - Name truncates or wraps appropriately
   - Doesn't break layout
4. View order details
5. **Verify:** Full name visible
6. **Pass Criteria:** ✅ Long text handled

---

## 🎨 UI/UX TESTS

### Test 35: Status Badge Colors
1. View orders with different statuses
2. **Verify Color Coding:**
   - PENDING: Yellow
   - CONFIRMED: Blue
   - PREPARING: Purple
   - READY: Green
   - FULFILLED: Indigo
   - COMPLETED: Green
   - CANCELLED: Red
3. **Pass Criteria:** ✅ Consistent color scheme

### Test 36: Icons Display
1. Check all icons render correctly:
   - Status icons (Clock, CheckCircle, Package, etc.)
   - Navigation icons (ArrowLeft)
   - Stats icons (TrendingUp, Package, etc.)
   - Customer info icons (User, Mail, Phone)
2. **Pass Criteria:** ✅ All icons visible

### Test 37: Hover States
1. Hover over table rows
2. **Verify:** Background changes
3. Hover over links
4. **Verify:** Color changes
5. Hover over buttons
6. **Verify:** Background changes
7. **Pass Criteria:** ✅ Interactive feedback

### Test 38: Loading States
1. On slow network, navigate to page
2. **Verify:**
   - Page doesn't appear broken during load
   - Content loads progressively
   - No layout shift
3. **Pass Criteria:** ✅ Good loading experience

---

## ♿ ACCESSIBILITY TESTS

### Test 39: Keyboard Navigation
1. Use Tab key to navigate
2. **Verify:**
   - All interactive elements reachable
   - Focus visible (outline)
   - Logical tab order
3. Use Enter/Space to activate buttons/links
4. **Verify:** Actions trigger
5. **Pass Criteria:** ✅ Keyboard accessible

### Test 40: Screen Reader
**Use NVDA, JAWS, or VoiceOver**

1. Navigate to orders list
2. **Verify Announces:**
   - Page title
   - Stats labels and values
   - Table headers
   - Row data
3. Navigate to order details
4. **Verify Announces:**
   - Section headings
   - Customer information
   - Order items
5. **Pass Criteria:** ✅ Screen reader compatible

### Test 41: Color Contrast
**Use browser DevTools > Lighthouse > Accessibility**

1. Run accessibility audit
2. **Verify:**
   - No contrast issues
   - All text readable
   - Status badges have sufficient contrast
3. **Pass Criteria:** ✅ Meets WCAG standards

---

## 🔧 INTEGRATION TESTS

### Test 42: From Farmer Dashboard
1. Login as farmer
2. Go to farmer dashboard
3. Click on a farm
4. Click "View Orders" or similar link
5. **Verify:** Navigates to orders list for that farm
6. **Pass Criteria:** ✅ Navigation works

### Test 43: From Farm Details Page
1. Navigate to farm details: `/farmer/farms/[farmId]`
2. Find "Orders" section or link
3. Click "View All Orders" or similar
4. **Verify:** Navigates to orders list
5. Click on individual order in recent orders
6. **Verify:** Navigates to order details
7. **Pass Criteria:** ✅ Links functional

### Test 44: With MVP Bot
**Requires bot setup**

1. Run: `npm run bot:mvp`
2. **Verify Bot Can:**
   - Navigate to orders pages
   - Interact with filters and search
   - Click through pagination
   - View order details
3. Check bot report for errors
4. **Pass Criteria:** ✅ Bot success rate > 90%

---

## 📊 TEST RESULTS TEMPLATE

Use this template to record test results:

```markdown
## Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]
**Browser:** [Chrome/Firefox/Safari] [Version]
**Device:** [Desktop/Mobile/Tablet]

### Summary
- Total Tests: 44
- Passed: X
- Failed: X
- Skipped: X
- Success Rate: X%

### Failed Tests
1. Test #: [Number]
   - Issue: [Description]
   - Steps to Reproduce: [Steps]
   - Expected: [Expected result]
   - Actual: [Actual result]
   - Screenshot: [Link or attachment]
   - Priority: [Critical/High/Medium/Low]

2. Test #: [Number]
   ...

### Notes
[Any additional observations or recommendations]

### Sign-off
- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for next phase

**Tester Signature:** _______________
**Date:** _______________
```

---

## 🎯 ACCEPTANCE CRITERIA

### Must Pass (Critical)
- ✅ All authentication/authorization tests (Tests 1-5)
- ✅ Orders display correctly (Tests 6-7)
- ✅ Filtering and search work (Tests 8-10)
- ✅ Order details load completely (Tests 14-21)
- ✅ No TypeScript errors
- ✅ No console errors

### Should Pass (High Priority)
- ✅ Pagination works (Test 11)
- ✅ Empty states display (Test 12)
- ✅ Navigation links functional (Test 13)
- ✅ Responsive design (Tests 23-25)
- ✅ Performance acceptable (Tests 26-28)

### Nice to Have (Medium Priority)
- ✅ Edge cases handled (Tests 29-34)
- ✅ UI/UX polished (Tests 35-38)
- ✅ Accessibility features (Tests 39-41)

---

## 🐛 BUG REPORTING

If you find bugs, please report using this format:

```markdown
**Bug Title:** [Short description]

**Severity:** [Critical/High/Medium/Low]

**Test #:** [Which test revealed this bug]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: [Browser and version]
- OS: [Operating system]
- Screen size: [If relevant]

**Screenshots:**
[Attach screenshots or videos]

**Console Errors:**
[Any JavaScript errors from console]

**Additional Context:**
[Any other relevant information]
```

---

## 📞 SUPPORT

For questions or issues during testing:

1. **Check Documentation:**
   - `IMPLEMENTATION_COMPLETE_2025-01-08.md`
   - `FIXES_APPLIED_2025-01-08.md`
   - `REMAINING_ISSUES_INVESTIGATION.md`

2. **Review Code:**
   - Orders List: `src/app/(farmer)/farmer/farms/[farmId]/orders/page.tsx`
   - Order Details: `src/app/(farmer)/farmer/farms/[farmId]/orders/[orderId]/page.tsx`

3. **Database Schema:**
   - `prisma/schema.prisma` (Order, OrderItem, Payment models)

---

## ✅ CHECKLIST: Before Signing Off

- [ ] All authentication tests passed
- [ ] Orders list displays correctly
- [ ] Filtering and search work
- [ ] Pagination functions properly
- [ ] Order details page complete
- [ ] Navigation links work
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance acceptable
- [ ] Edge cases handled
- [ ] Accessibility basic requirements met
- [ ] Bot validation passed (if applicable)

---

**Happy Testing! 🚀**

*Last Updated: January 8, 2025*
*Version: 1.0.0*
