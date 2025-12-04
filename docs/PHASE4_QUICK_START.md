# 🚀 Phase 4 Quick Start Guide

## Farmer Dashboard Polish - Financial Management & Order Fulfillment

**Status**: ✅ Ready for Testing  
**Phase**: 4 of 6  
**Features**: Financial Management, Payouts, Order Fulfillment Tools

---

## 📋 QUICK OVERVIEW

Phase 4 adds comprehensive financial management and order fulfillment tools for farmers:

- **💰 Financial Dashboard**: Revenue tracking, balance management, transaction history
- **💳 Payout System**: Instant payouts, bank account management, Stripe Connect
- **📦 Order Fulfillment**: Batch operations, packing slips, customer notifications

---

## 🚀 GETTING STARTED

### 1. Start the Development Environment

```bash
# Start Docker services (PostgreSQL + Redis)
cd docker/compose
docker compose -f docker-compose.dev.yml up -d

# Start Next.js development server (from project root)
npm run dev:omen

# Or standard dev
npm run dev
```

### 2. Access the Application

- **Main App**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (run `npm run db:studio`)

### 3. Login as Farmer

Use one of the test farmer accounts:

```
Email: farmer@example.com
Password: (your test password)
```

---

## 🎯 FEATURE WALKTHROUGH

### Feature 1: Financial Overview

**URL**: `/farmer/finances`

#### What to Test:

1. **Stats Cards Display**
   - Available Balance (ready for payout)
   - Pending Balance (processing orders)
   - Total Revenue (current period)
   - Average Order Value

2. **Period Selector**
   - Switch between 7d / 30d / 90d / 1y
   - Observe data refresh automatically
   - Note revenue change percentage updates

3. **Revenue Chart**
   - Interactive bar chart
   - Hover over bars to see tooltips
   - Shows daily/monthly aggregation based on period
   - Visual representation of sales trends

4. **Transaction History**
   - Recent 20 transactions displayed
   - Types: SALE, PAYOUT, REFUND, FEE
   - Status badges (COMPLETED, PENDING, FAILED)
   - Order numbers linked for sales

5. **Download Statement**
   - Click "Statement" button
   - Downloads financial statement PDF (mock)

#### Expected Behavior:

```
✅ Stats cards show real-time data
✅ Chart renders smoothly
✅ Transactions show correct amounts
✅ Revenue change shows +/- percentage
✅ Period changes update all data
```

#### Test Cases:

**Test Case 1: View Financial Stats**

1. Navigate to `/farmer/finances`
2. Verify all 4 stat cards display
3. Check that amounts are formatted as currency ($X.XX)
4. Confirm revenue change shows percentage with +/- indicator

**Test Case 2: Switch Time Periods**

1. Select "Last 7 days" from dropdown
2. Wait for data to reload
3. Verify chart shows ~7 data points
4. Switch to "Last year"
5. Verify chart shows ~12 monthly data points

**Test Case 3: Revenue Chart Interaction**

1. Hover over any bar in the chart
2. Verify tooltip appears with revenue and order count
3. Move between bars and see tooltip update
4. Check that bar heights represent relative revenue

---

### Feature 2: Payout Management

**URL**: `/farmer/payouts`

#### What to Test:

1. **Stripe Connect Setup** (if not connected)
   - See setup wizard if no Stripe account
   - "Connect with Stripe" button present
   - Clear instructions displayed

2. **Available Balance Card**
   - Prominent display of available funds
   - Shows account last 4 digits (••••1234)
   - "Request Payout" button enabled/disabled based on minimum

3. **Minimum Balance Validation**
   - Warning shown if balance < $10.00
   - Button disabled when below minimum
   - Clear message about minimum requirement

4. **Instant Payout Request**
   - Click "Request Payout" button
   - Confirmation dialog appears
   - Success message on completion
   - Balance updates after payout

5. **Payout Schedule**
   - View current schedule (Daily/Weekly/Monthly)
   - See minimum payout amount
   - Edit schedule dialog
   - Save changes

6. **Bank Accounts**
   - View connected accounts
   - Default account marked
   - Add new account button
   - Set different account as default
   - Remove account option

7. **Payout History**
   - List of all payouts (newest first)
   - Status badges (PENDING/PROCESSING/COMPLETED/FAILED)
   - Date range and order count per payout
   - Stripe dashboard link for each payout
   - Failure reasons shown for failed payouts

#### Expected Behavior:

```
✅ Balance calculates correctly (completed orders - payouts)
✅ Minimum $10 validation works
✅ Cannot request payout if one is pending
✅ Payout history displays in reverse chronological order
✅ Stripe Connect flow redirects properly
```

#### Test Cases:

**Test Case 1: View Payout Balance**

1. Navigate to `/farmer/payouts`
2. Check "Available for Payout" card shows balance
3. Verify it matches: (completed order revenue - total payouts)
4. Confirm pending balance is separate

**Test Case 2: Request Instant Payout (Sufficient Balance)**

1. Ensure balance is ≥ $10.00
2. Click "Request Payout" button
3. Confirm the action in dialog
4. Wait for success message
5. Verify new payout appears in history with PENDING status
6. Confirm "Request Payout" button is now disabled

**Test Case 3: Request Payout (Insufficient Balance)**

1. Ensure balance is < $10.00 (or use test account)
2. Note "Request Payout" button is disabled
3. Verify warning message appears:
   "Minimum payout amount is $10.00. Continue selling to reach the minimum."

**Test Case 4: Manage Payout Schedule**

1. Click "Edit" on Payout Schedule card
2. Change frequency (Daily → Weekly)
3. Set minimum amount ($25)
4. Click "Save Schedule"
5. Verify changes persist after page reload

**Test Case 5: Payout History**

1. Scroll to "Payout History" section
2. Verify payouts are sorted newest → oldest
3. Check each payout shows:
   - Amount in currency format
   - Status badge with correct color
   - Date range (period start - period end)
   - Order count
   - Account last 4 digits
4. Click "View in Stripe" link
5. Verify it opens Stripe dashboard (in test mode)

---

### Feature 3: Order Fulfillment Tools

**URL**: `/farmer/orders` (existing page with new tools)

#### What to Test:

1. **Search & Filters**
   - Search by order number
   - Search by customer name
   - Filter by status (PENDING, CONFIRMED, etc.)
   - Filter by delivery type (PICKUP, DELIVERY)
   - Filter by date (TODAY, THIS WEEK, ALL TIME)
   - Multiple filters combine correctly

2. **Order Selection**
   - Click checkbox to select individual order
   - Click "Select all" to select all filtered orders
   - Selected count badge updates
   - Selected orders highlighted in blue

3. **Batch Actions Bar**
   - Appears when orders are selected
   - Shows count of selected orders
   - "Update Status" dropdown with all status options
   - "Print Slips" button
   - "Notify" button (email customers)
   - "Export" button (CSV download)

4. **Batch Status Update**
   - Select multiple orders
   - Choose new status from dropdown
   - Confirm the update
   - Orders update in real-time
   - Selection clears after update

5. **Workflow Actions**
   - Individual orders show contextual next steps
   - PENDING → "Confirm Order" or "Cancel Order"
   - CONFIRMED → "Start Processing" or "Mark Ready"
   - PROCESSING → "Mark Ready"
   - READY → "Mark Shipped" or "Mark Delivered"
   - SHIPPED → "Mark Delivered"

6. **Order Details Display**
   - Order number and status badge
   - Customer name and email
   - Delivery type badge (Pickup/Delivery)
   - Item list with quantities and prices
   - Total amount
   - Customer notes (if any)
   - Delivery address or pickup date

7. **Print Packing Slips** (Mock)
   - Select orders
   - Click "Print Slips"
   - PDF download initiated
   - Contains all selected orders

8. **Customer Notifications** (Mock)
   - Select orders
   - Click "Notify"
   - Confirmation dialog
   - Success message shows count sent

9. **Export Orders** (Mock)
   - Select orders
   - Click "Export"
   - CSV file downloads
   - Contains order details

#### Expected Behavior:

```
✅ Filters combine correctly (AND logic)
✅ Search is real-time and case-insensitive
✅ Batch operations work on multiple orders
✅ Workflow actions only show valid next steps
✅ Order counts and totals are accurate
✅ Selection persists during filtering
```

#### Test Cases:

**Test Case 1: Search Orders**

1. Navigate to `/farmer/orders`
2. Type order number in search box
3. Verify only matching orders appear
4. Clear search and type customer name
5. Verify orders from that customer appear

**Test Case 2: Filter by Status**

1. Select "Pending" from status dropdown
2. Verify only PENDING orders show
3. Change to "Confirmed"
4. Verify orders update to CONFIRMED only
5. Select "All Status" to reset

**Test Case 3: Batch Status Update**

1. Select 3 orders with PENDING status
2. Verify batch actions bar appears
3. Click "Update Status" → "Confirmed"
4. Confirm the action
5. Wait for success message
6. Verify all 3 orders now show CONFIRMED status
7. Verify selection is cleared

**Test Case 4: Workflow Actions**

1. Find a PENDING order
2. Verify it shows "Confirm Order" button
3. Click "Confirm Order"
4. Order updates to CONFIRMED
5. Verify button now shows "Start Processing"

**Test Case 5: Print Packing Slips**

1. Select 2-3 READY orders
2. Click "Print Slips" button
3. Verify PDF download starts (mock)
4. Check filename includes date

**Test Case 6: Customer Notifications**

1. Select orders with SHIPPED status
2. Click "Notify" button
3. Confirm sending notifications
4. Verify success message: "Notifications sent to X customer(s)"

**Test Case 7: Export Orders**

1. Select multiple orders
2. Click "Export" button
3. Verify CSV download starts (mock)
4. Check filename includes date

**Test Case 8: Order Details**

1. Find an order with multiple items
2. Verify all items are listed with:
   - Quantity and unit
   - Product name
   - Item subtotal
3. Verify total matches sum of items
4. Check customer notes section (if notes exist)
5. Verify delivery address or pickup date shows

---

## 🔍 API TESTING

### Test with cURL

#### 1. Get Financial Data

```bash
curl -X GET 'http://localhost:3001/api/farmer/finances?farmId=YOUR_FARM_ID&period=30d' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  | jq
```

**Expected Response:**

```json
{
  "success": true,
  "stats": {
    "currentBalance": 1250.0,
    "pendingBalance": 450.0,
    "totalRevenue": 5000.0,
    "totalPayout": 0,
    "revenueChange": 15.5,
    "orderCount": 42,
    "averageOrderValue": 119.05
  },
  "transactions": [
    {
      "id": "tx_123",
      "type": "SALE",
      "amount": 125.5,
      "status": "COMPLETED",
      "description": "Order from John Doe",
      "orderNumber": "ORD-2024-001",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "revenueData": [
    {
      "date": "2024-01-01T00:00:00Z",
      "revenue": 450.0,
      "orders": 8
    }
  ]
}
```

#### 2. Get Payouts

```bash
curl -X GET 'http://localhost:3001/api/farmer/payouts?farmId=YOUR_FARM_ID' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  | jq
```

#### 3. Request Instant Payout

```bash
curl -X POST 'http://localhost:3001/api/farmer/payouts' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -d '{"farmId":"YOUR_FARM_ID"}' \
  | jq
```

**Expected Response (Success):**

```json
{
  "success": true,
  "payout": {
    "id": "payout_123",
    "amount": 1250.0,
    "status": "PENDING",
    "scheduledDate": "2024-01-15T10:30:00Z"
  },
  "message": "Payout requested successfully"
}
```

**Expected Response (Insufficient Balance):**

```json
{
  "success": false,
  "error": "Minimum payout amount is $10. Available balance: $5.50"
}
```

---

## 🗄️ DATABASE VERIFICATION

### Check Data with Prisma Studio

1. Open Prisma Studio: `npm run db:studio`
2. Navigate to http://localhost:5555

#### Verify Financial Data

**Check Order Revenue:**

```sql
-- In Prisma Studio, filter Order table:
farmId = YOUR_FARM_ID
status IN ["DELIVERED", "COMPLETED"]
paymentStatus = "PAID"

-- Sum the items.subtotal for available balance
```

**Check Payouts:**

```sql
-- In Prisma Studio, view Payout table:
farmId = YOUR_FARM_ID
ORDER BY createdAt DESC

-- Verify status, amount, and dates
```

**Calculate Available Balance:**

```
Available Balance =
  (Sum of completed order items for your farm)
  - (Sum of all payouts COMPLETED + PENDING + PROCESSING)
```

---

## ✅ VALIDATION CHECKLIST

### Financial Overview Page

- [ ] Page loads without errors
- [ ] All 4 stat cards display with real data
- [ ] Revenue chart renders correctly
- [ ] Chart is interactive (hover tooltips work)
- [ ] Period selector changes data
- [ ] Transaction list shows recent activity
- [ ] Download statement button works
- [ ] Amounts formatted as currency
- [ ] Revenue change shows +/- percentage

### Payouts Page

- [ ] Page loads without errors
- [ ] Available balance card displays
- [ ] Balance calculation is correct
- [ ] Minimum $10 validation works
- [ ] Request payout button enables/disables correctly
- [ ] Payout history displays correctly
- [ ] Status badges show correct colors
- [ ] Payout schedule can be viewed/edited
- [ ] Bank account management works
- [ ] Stripe Connect wizard appears (if not connected)

### Order Fulfillment

- [ ] Order list displays correctly
- [ ] Search works (order number and customer)
- [ ] Status filter works
- [ ] Delivery type filter works
- [ ] Date filter works
- [ ] Order selection works (individual and all)
- [ ] Batch actions bar appears when orders selected
- [ ] Batch status update works
- [ ] Workflow actions appear correctly
- [ ] Print slips initiates download (mock)
- [ ] Notify customers shows success (mock)
- [ ] Export orders initiates download (mock)

### API Endpoints

- [ ] GET /api/farmer/finances returns valid data
- [ ] POST /api/farmer/payouts creates payout
- [ ] GET /api/farmer/payouts returns history
- [ ] All endpoints check authentication
- [ ] All endpoints verify farm ownership
- [ ] Error responses are consistent

---

## 🐛 TROUBLESHOOTING

### Issue: "Farm not found or access denied"

**Solution**:

- Verify you're logged in as a FARMER role user
- Check that the farmId in the URL matches your farm
- Ensure your farm status is ACTIVE

### Issue: Financial data is empty

**Solution**:

- Create test orders in Prisma Studio
- Ensure orders have status DELIVERED or COMPLETED
- Set paymentStatus to PAID
- Verify order items link to your farm's products

### Issue: Cannot request payout

**Solution**:

- Check available balance is ≥ $10.00
- Ensure no pending payouts exist
- Verify Stripe Connect account is set up
- Check farm.stripeConnectAccountId is populated

### Issue: Revenue chart not showing data

**Solution**:

- Verify orders exist in the selected period
- Check browser console for errors
- Ensure order items belong to your farm's products
- Try switching period (7d → 30d)

### Issue: Batch operations not working

**Solution**:

- Check that orders are selected (checkbox clicked)
- Verify batch actions bar appears
- Check browser console for API errors
- Ensure order IDs are valid

---

## 📊 TEST DATA SETUP

### Create Test Orders

Use Prisma Studio to create test orders:

1. **Navigate to Order table**
2. **Create new order:**

   ```
   orderNumber: ORD-2024-001
   customerId: (select a customer)
   farmId: (your farm ID)
   status: DELIVERED
   paymentStatus: PAID
   subtotal: 100.00
   deliveryFee: 10.00
   platformFee: 5.00
   tax: 7.50
   total: 122.50
   ```

3. **Create order items:**

   ```
   orderId: (order from step 2)
   productId: (your farm's product)
   quantity: 2
   unit: lb
   unitPrice: 50.00
   subtotal: 100.00
   ```

4. **Repeat** for multiple orders with different dates

### Create Test Payout

1. **Navigate to Payout table**
2. **Create new payout:**
   ```
   farmId: (your farm ID)
   amount: 500.00
   currency: USD
   status: COMPLETED
   periodStart: (1 month ago)
   periodEnd: (today)
   orderCount: 10
   scheduledDate: (today)
   completedAt: (today)
   ```

---

## 🎯 ACCEPTANCE CRITERIA

Phase 4 is complete when:

✅ **Financial Overview**

- Displays real-time balance and revenue stats
- Shows interactive revenue chart
- Lists recent transactions
- Period selector works correctly

✅ **Payout Management**

- Calculates available balance accurately
- Enforces $10 minimum payout
- Prevents duplicate pending payouts
- Displays payout history
- Bank account management works

✅ **Order Fulfillment**

- Advanced filtering works
- Batch operations process multiple orders
- Workflow actions guide next steps
- Packing slips can be generated (mock)
- Customer notifications work (mock)

✅ **API Endpoints**

- Authentication and authorization enforced
- Financial data calculations are accurate
- Payout creation validates correctly
- Error handling is robust

✅ **User Experience**

- All pages load quickly (< 2s)
- Components are responsive
- Loading states show appropriately
- Error messages are clear
- Success feedback is immediate

---

## 🚀 NEXT STEPS

After testing Phase 4:

1. **Report Issues**: Document any bugs or unexpected behavior
2. **Stripe Integration**: Connect real Stripe account for testing
3. **Phase 5**: Move to Admin Dashboard Enhancement
4. **Performance Testing**: Load test with larger datasets
5. **User Acceptance Testing**: Get farmer feedback

---

## 📞 SUPPORT

### Getting Help

- **Documentation**: See `IMPLEMENTATION_COMPLETE_PHASE4.md`
- **API Reference**: Check individual route files
- **Database Schema**: View `prisma/schema.prisma`

### Reporting Issues

Include:

- URL where issue occurred
- Expected behavior
- Actual behavior
- Browser console errors
- Steps to reproduce

---

**Phase 4 Status**: ✅ Ready for Testing  
**Last Updated**: [Current Date]  
**Next Phase**: Admin Dashboard Enhancement (Phase 5)
