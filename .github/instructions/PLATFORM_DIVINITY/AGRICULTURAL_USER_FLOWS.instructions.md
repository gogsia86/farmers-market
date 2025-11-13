---
title: "Agricultural User Flows - Divine Journey Mapping"
version: "1.0.0"
status: "ACTIVE"
priority: "P0 - CRITICAL"
applies_to: "All Platform Features"
related_docs:
  - "AGRICULTURAL_FRD_INDEX.instructions.md"
  - "AGRICULTURAL_PERSONAS.instructions.md"
  - "AGRICULTURAL_BRD.instructions.md"
  - "FRD_FEATURES/*.instructions.md"
---

# 🌊 AGRICULTURAL USER FLOWS

### Comprehensive Journey Mapping for Farmers Market Platform

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Farmer Journey Flows](#farmer-journey-flows)
3. [Consumer Journey Flows](#consumer-journey-flows)
4. [Order Lifecycle Flows](#order-lifecycle-flows)
5. [Error Handling & Edge Cases](#error-handling--edge-cases)
6. [Cross-Feature Integration Flows](#cross-feature-integration-flows)
7. [Success Metrics & Analytics](#success-metrics--analytics)

---

## 🎯 OVERVIEW

### Purpose

This document maps **all critical user journeys** through the Farmers Market platform, visualizing:

- Happy path flows (primary success scenarios)
- Alternative paths (secondary options)
- Error handling (failure recovery)
- Edge cases (boundary conditions)
- Integration points (cross-feature dependencies)

### Personas Referenced

- **Ana Romana**: Small farm owner (5-min registration, 3-min product listing)
- **Gogsia Medici**: Market veteran farmer (offline-first, multi-location)
- **Divna Kapica**: Conscious consumer (transparency seeker, quality-focused)
- **Mile Mochwara**: Busy parent (convenience, multi-farm cart, weekly routine)

### Flow Notation

````mermaid
graph LR
    Start([Start]) --> Action[Action/Screen]
    Action --> Decision{Decision Point?}
    Decision -->|Yes| Success[Success State]
    Decision -->|No| Error[Error Handler]
    Error --> Recovery[Recovery Action]
    Recovery --> Action
    Success --> End([End])
```text
**Legend**:

- `[rectangles]` = Actions/Screens
- `{diamonds}` = Decision points
- `([rounded])` = Start/End states
- `-->` = Primary flow
- `-.->` = Alternative flow
- `==>` = Error flow

---

## 🚜 FARMER JOURNEY FLOWS

### 1. Farmer Onboarding (FR-001)

**Persona**: Ana Romana
**Goal**: Complete registration in <5 minutes from mobile device
**Success Metric**: 80% completion rate, 75% mobile, 90% email verification

```mermaid
graph TD
    Start([Ana discovers platform]) --> Landing[Landing Page]
    Landing --> SignUp[Click "Start Selling"]

    SignUp --> Step1[Step 1: Account Creation]
    Step1 --> EmailInput[Enter email/password]
    EmailInput --> EmailValid{Valid email format?}
    EmailValid -->|No| EmailError[Show inline error]
    EmailError --> EmailInput
    EmailValid -->|Yes| PasswordStrong{Password strong?}
    PasswordStrong -->|No| PasswordError[Show strength meter]
    PasswordError --> EmailInput
    PasswordStrong -->|Yes| CreateAccount[Create account]

    CreateAccount --> VerifyEmail[Send verification email]
    VerifyEmail --> EmailSent[Show "Check email" message]
    EmailSent --> ClickLink{User clicks link?}
    ClickLink -->|No after 24h| Reminder[Send reminder email]
    Reminder --> ClickLink
    ClickLink -->|Yes| Verified[Email verified ✓]

    Verified --> Step2[Step 2: Farm Location]
    Step2 --> AddressInput[Enter farm address]
    AddressInput --> Geocode[Geocode to lat/lng]
    Geocode --> MapPin[Show pin on map]
    MapPin --> ConfirmLocation{Confirm location?}
    ConfirmLocation -->|No| AdjustPin[Drag pin to correct spot]
    AdjustPin --> ConfirmLocation
    ConfirmLocation -->|Yes| LocationSaved[Location saved]

    LocationSaved --> Step3[Step 3: Farm Story]
    Step3 --> FarmName[Enter farm name]
    FarmName --> FarmDescription[Brief description]
    FarmDescription --> ProductTypes[Select product types]
    ProductTypes --> Photos{Upload photos?}
    Photos -->|No| SkipPhotos[Skip - add later]
    Photos -->|Yes| UploadPhotos[Upload 1-10 photos]
    UploadPhotos --> PhotosProcessed[Process & generate thumbnails]
    PhotosProcessed --> StoryComplete[Farm story complete]
    SkipPhotos --> StoryComplete

    StoryComplete --> Stripe[Connect Stripe]
    Stripe --> StripeOnboard[Redirect to Stripe Connect]
    StripeOnboard --> StripeComplete{Stripe completed?}
    StripeComplete -->|No| StripeLater[Skip - complete later]
    StripeComplete -->|Yes| PayoutsReady[Payouts enabled ✓]
    StripeLater --> DashboardPending[Dashboard - Pending setup]
    PayoutsReady --> DashboardActive[Dashboard - Active]

    DashboardActive --> End([Onboarding Complete])
    DashboardPending --> End
```text
**Key Decision Points**:

1. **Email validation**: Real-time inline validation (RFC 5322 standard)
2. **Password strength**: Minimum 8 chars, 1 uppercase, 1 number, 1 special
3. **Location confirmation**: Visual map confirmation prevents address errors
4. **Photo upload**: Optional but recommended (70% profile views before purchase)
5. **Stripe timing**: Can defer to first product listing (reduces friction)

**Alternative Paths**:

- Social login (Google/Facebook) bypasses email/password steps
- Import from LocalHarvest skips farm story (auto-populate from CSV)
- Team member invitation flows to simplified onboarding

---

### 2. Product Listing Creation (FR-003)

**Persona**: Ana Romana (mobile in field)
**Goal**: List new product in <3 minutes
**Success Metric**: <3 min 75th percentile, >80% mobile, >60% use templates

```mermaid
graph TD
    Start([Ana wants to list tomatoes]) --> Dashboard[Farmer Dashboard]
    Dashboard --> AddProduct[Click "Add Product"]

    AddProduct --> Template{Use template?}
    Template -->|Yes| SelectTemplate[Choose "Vegetables" template]
    SelectTemplate --> TemplateLoaded[Pre-filled fields: category, unit, etc]
    Template -->|No| BlankForm[Start from blank]

    TemplateLoaded --> ProductName[Enter "Organic Tomatoes"]
    BlankForm --> ProductName
    ProductName --> QuickPhoto[Quick Photo]

    QuickPhoto --> CameraChoice{Camera or gallery?}
    CameraChoice -->|Camera| TakePhoto[Take photo with camera]
    CameraChoice -->|Gallery| SelectPhoto[Select from gallery]
    TakePhoto --> PhotoCaptured[Photo captured]
    SelectPhoto --> PhotoCaptured
    PhotoCaptured --> PhotoUpload[Upload to S3]
    PhotoUpload --> PhotoProcessed[Generate thumbnail]

    PhotoProcessed --> PriceUnit[Enter price: $5.99/lb]
    PriceUnit --> Quantity[Enter quantity: 50 lbs]
    Quantity --> Description{Add description?}
    Description -->|No| SkipDesc[Skip - use template default]
    Description -->|Yes| EnterDesc[Type description 500 chars]
    EnterDesc --> DescComplete[Description saved]
    SkipDesc --> DescComplete

    DescComplete --> Tags[Auto-suggest tags: organic, local, summer]
    Tags --> SelectTags[Select relevant tags]
    SelectTags --> Seasonal{Seasonal product?}
    Seasonal -->|Yes| SeasonDates[Set start/end dates]
    Seasonal -->|No| YearRound[Available year-round]
    SeasonDates --> ReadyToPublish[Ready to publish]
    YearRound --> ReadyToPublish

    ReadyToPublish --> Publish{Publish now?}
    Publish -->|Yes| PublishNow[Set status: ACTIVE]
    Publish -->|No| SaveDraft[Save as DRAFT]
    PublishNow --> InventoryCheck{Track inventory?}
    InventoryCheck -->|Yes| EnableTracking[Enable inventory tracking]
    InventoryCheck -->|No| BackorderOK[Allow backorder]
    EnableTracking --> Listed[Product LIVE ✓]
    BackorderOK --> Listed
    SaveDraft --> DraftSaved[Draft saved - edit anytime]

    Listed --> Success([Product Listed - 2m 45s])
    DraftSaved --> Success
```text
**Mobile Optimizations**:

- **44x44px touch targets**: All buttons thumb-friendly
- **Native pickers**: Use device date/time/select pickers
- **Voice input**: Description via speech-to-text
- **Offline queue**: IndexedDB stores draft if connection lost
- **Glove mode**: Large buttons work with farm gloves

**Template Benefits**:

- Pre-fills category, unit, typical price range, common tags
- Reduces listing time from 5 min → 3 min (40% faster)
- 60% of farmers use templates (success metric target)

---

### 3. Order Management (FR-005)

**Persona**: Ana Romana (batch processing)
**Goal**: Review and accept 10 orders in <5 minutes
**Success Metric**: >95% accept rate, <2 hours accept time

```mermaid
graph TD
    Start([New order notification]) --> Dashboard[Farmer Dashboard]
    Dashboard --> OrderList[Order List - Filtered: NEW]

    OrderList --> OrderCount{Multiple orders?}
    OrderCount -->|Yes| BatchMode[Batch mode: Select all]
    OrderCount -->|Single| OrderCard[Click order card]

    BatchMode --> BatchActions[Batch actions menu]
    BatchActions --> AcceptAll{Accept all?}
    AcceptAll -->|Yes| BulkAccept[Accept all selected]
    AcceptAll -->|No| ReviewIndividual[Review individually]
    BulkAccept --> NotifyCustomers[Send confirmation emails]
    NotifyCustomers --> StatusUpdate[Update all to CONFIRMED]
    StatusUpdate --> BatchComplete[Batch processed ✓]

    ReviewIndividual --> OrderCard
    OrderCard --> OrderDetail[Order Detail View]
    OrderDetail --> ShowInfo[Customer: Divna K.<br/>Items: 2 lbs tomatoes<br/>Fulfillment: Farm Pickup Sat 9am<br/>Total: $11.98]

    ShowInfo --> Decision{Accept order?}
    Decision -->|Accept| OneClick[One-tap "Accept"]
    OneClick --> AutoNotify[Auto-send confirmation]
    AutoNotify --> StatusConfirmed[Status: CONFIRMED]
    StatusConfirmed --> NextOrder{More orders?}

    Decision -->|Decline| DeclineReason{Why decline?}
    DeclineReason -->|Out of stock| StockIssue[Select "Out of stock"]
    DeclineReason -->|Can't fulfill| CantFulfill[Select "Can't fulfill date"]
    DeclineReason -->|Other| OtherReason[Type custom reason]
    StockIssue --> AutoRefund[Trigger auto-refund]
    CantFulfill --> AutoRefund
    OtherReason --> AutoRefund
    AutoRefund --> NotifyDecline[Notify customer with reason]
    NotifyDecline --> StatusDeclined[Status: DECLINED]
    StatusDeclined --> NextOrder

    NextOrder -->|Yes| OrderList
    NextOrder -->|No| AllDone[All orders processed]
    BatchComplete --> AllDone

    AllDone --> UpdateInventory[Auto-update inventory]
    UpdateInventory --> End([10 orders in 4m 30s])
```text
**Batch Processing Features**:

- **Select all checkbox**: Process multiple orders simultaneously
- **Bulk accept**: Accept 5-10 orders with one tap
- **Auto-notifications**: Customer emails sent automatically
- **Inventory sync**: Auto-deduct accepted order quantities

**Decline Handling**:

- **Auto-refund**: Stripe refund initiated immediately (<$20 instant)
- **Customer notification**: Reason + suggested alternatives
- **Inventory adjustment**: No deduction if declined

---

### 4. Inventory Field Update (FR-004)

**Persona**: Ana Romana (in field with gloves)
**Goal**: Update inventory after harvest in <30 seconds
**Success Metric**: <1% overselling, >90% accuracy, <5s latency

```mermaid
graph TD
    Start([Ana harvests tomatoes]) --> Field[In field - Mobile]
    Field --> OpenApp[Open Farmers Market app]
    OpenApp --> FieldMode[Activate "Field Mode"]

    FieldMode --> ProductList[Product quick list]
    ProductList --> SelectProduct[Tap "Organic Tomatoes"]
    SelectProduct --> CurrentStock[Show current: 50 lbs]

    CurrentStock --> UpdateMode{Update method?}
    UpdateMode -->|Quick adjust| PlusMinus[+/- buttons]
    UpdateMode -->|Harvest entry| BulkAdd[Bulk add quantity]
    UpdateMode -->|Voice input| VoiceCmd[Voice: "Add 20 pounds"]

    PlusMinus --> AdjustQty[Tap + button 20 times<br/>OR<br/>Long press: Hold +10]
    AdjustQty --> NewQty[New quantity: 70 lbs]

    BulkAdd --> EnterQty[Type: +20]
    EnterQty --> NewQty

    VoiceCmd --> ParseVoice[Parse: "20 pounds"]
    ParseVoice --> NewQty

    NewQty --> VisualConfirm[✓ Green flash confirmation]
    VisualConfirm --> OptimisticUI[Update UI immediately]
    OptimisticUI --> APICall[Background API: PUT /api/products/123/inventory]

    APICall --> NetworkCheck{Online?}
    NetworkCheck -->|Yes| APISuccess[API success 200 OK]
    NetworkCheck -->|No| OfflineQueue[Add to IndexedDB queue]
    OfflineQueue --> WaitOnline[Wait for connection]
    WaitOnline --> NetworkCheck

    APISuccess --> WebSocketBroadcast[Broadcast to all clients]
    WebSocketBroadcast --> ConsumerUpdate[Consumer site updates <2s]
    ConsumerUpdate --> LowStockCheck{Quantity < threshold?}

    LowStockCheck -->|Yes| LowStockAlert[Send alert: "10 lbs remaining"]
    LowStockCheck -->|No| NoAlert[No alert needed]
    LowStockAlert --> AlertSent[SMS/Email sent]
    NoAlert --> Complete[Update complete ✓]
    AlertSent --> Complete

    Complete --> NextProduct{More products?}
    NextProduct -->|Yes| ProductList
    NextProduct -->|No| End([Inventory synced - 28s])
```text
**Field Mode Features**:

- **One-tap select**: Last 5 products shown for quick access
- **Large buttons**: 60x60px for glove-friendly tapping
- **Visual feedback**: Green flash + haptic vibration
- **Offline support**: Queue updates, sync when online
- **Voice input**: "Twenty pounds tomatoes, fifteen bunches kale"

**Real-Time Sync**:

- **WebSocket broadcast**: Inventory → all consumer clients <2s
- **Optimistic UI**: Show update immediately, rollback if fails
- **Conflict resolution**: Server-side wins, notify farmer if adjusted

---

## 🛒 CONSUMER JOURNEY FLOWS

### 5. Farm Discovery (FR-011)

**Persona**: Divna Kapica (transparency seeker)
**Goal**: Find organic farms within 25 miles
**Success Metric**: 8-12 farms found, >70% map usage, >60% apply filters

```mermaid
graph TD
    Start([Divna opens platform]) --> Homepage[Homepage]
    Homepage --> SearchBar[Search bar: "Find farms near me"]

    SearchBar --> LocationPrompt{Allow location?}
    LocationPrompt -->|Yes| GetGPS[Get GPS coordinates]
    LocationPrompt -->|No| EnterZip[Enter ZIP code manually]
    GetGPS --> Geocode[Geocode to address]
    EnterZip --> Geocode

    Geocode --> FarmSearch[Query: Farms within 25 miles]
    FarmSearch --> ResultsMap[Interactive map view]
    ResultsMap --> PinsLoaded[Show 12 farm pins]

    PinsLoaded --> ViewMode{Prefer map or list?}
    ViewMode -->|Map| MapView[Map view - Color-coded pins]
    ViewMode -->|List| ListView[List view - Farm cards]

    MapView --> ClickPin[Click farm pin]
    ClickPin --> PopupCard[Show popup: Photo, name, distance, rating]
    PopupCard --> PopupAction{Next action?}
    PopupAction -->|View profile| FarmProfile[Open farm profile page]
    PopupAction -->|Close| MapView

    ListView --> FarmCard[Farm card details]
    FarmCard --> CardAction{Next action?}
    CardAction -->|Click| FarmProfile
    CardAction -->|Scroll| ListView

    FarmProfile --> ProfileView[Farm Profile - Full details]

    ResultsMap --> FilterButton[Click "Filters"]
    FilterButton --> FilterPanel[Filter panel opens]
    FilterPanel --> Certifications[Filter: Organic ✓]
    Certifications --> Products[Filter: Vegetables ✓]
    Products --> Fulfillment[Filter: Delivery ✓]
    Fulfillment --> ApplyFilters[Apply filters]

    ApplyFilters --> FilteredResults[Refined: 5 farms match]
    FilteredResults --> MapView

    ProfileView --> BrowseProducts[Browse farm products]
    BrowseProducts --> End([Found 5 organic farms])
```text
**Map Features**:

- **Color-coded pins**: Green (delivery), blue (pickup), yellow (market)
- **Cluster zoom**: 20 farms → cluster icon, zoom in to expand
- **Popup cards**: Quick view without leaving map
- **Distance calculation**: Real-time from user location

**Filter Options**:

1. **Certifications**: Organic, Regenerative, Animal Welfare
2. **Products**: Vegetables, Fruits, Dairy, Meat, Eggs, Pantry
3. **Fulfillment**: Delivery, Farm Pickup, Market Pickup
4. **Availability**: Open Now, In Stock Today

---

### 6. Product Browsing & Cart (FR-012, FR-013)

**Persona**: Mile Mochwara (busy parent, multi-farm convenience)
**Goal**: Build cart from 3-4 farms in <10 minutes
**Success Metric**: >40% multi-farm carts, <60% abandonment

```mermaid
graph TD
    Start([Mile needs weekly groceries]) --> Homepage[Homepage]
    Homepage --> Search[Search: "tomatoes"]

    Search --> SearchResults[Product results: 15 items]
    SearchResults --> ProductCard[Product card: Organic Tomatoes<br/>Green Valley Farm - 3.2 mi<br/>$5.99/lb ⭐4.8]

    ProductCard --> QuickAdd{Add to cart?}
    QuickAdd -->|Yes| QuickAddBtn[Click "Quick Add"]
    QuickAddBtn --> QuantitySelect[Select quantity: 2 lbs]
    QuantitySelect --> AddedToCart[✓ Added to cart]
    AddedToCart --> CartBadge[Cart badge: 1 item]

    QuickAdd -->|View details first| ProductDetail[Product detail page]
    ProductDetail --> DetailedInfo[Photos, description, farm story]
    DetailedInfo --> AddFromDetail[Click "Add to cart"]
    AddFromDetail --> AddedToCart

    CartBadge --> ContinueShopping{Continue shopping?}
    ContinueShopping -->|Yes| Search
    ContinueShopping -->|No| ViewCart[Click cart icon]

    ViewCart --> CartView[Shopping Cart]
    CartView --> GroupedByFarm[Grouped by farm:<br/>---<br/>Green Valley Farm<br/>- Tomatoes 2 lbs $11.98<br/>---<br/>Sunrise Farm<br/>- Carrots 1 bunch $4.50<br/>- Lettuce 1 head $3.00<br/>---<br/>Happy Hen Farm<br/>- Eggs 1 dozen $6.00]

    GroupedByFarm --> CartActions{Cart action?}
    CartActions -->|Adjust qty| ChangeQty[+/- buttons]
    ChangeQty --> RecalcTotal[Recalculate totals]
    RecalcTotal --> GroupedByFarm

    CartActions -->|Remove item| SwipeRemove[Swipe left → Delete]
    SwipeRemove --> ConfirmRemove{Confirm removal?}
    ConfirmRemove -->|Yes| ItemRemoved[Item removed]
    ConfirmRemove -->|No| GroupedByFarm
    ItemRemoved --> RecalcTotal

    CartActions -->|Checkout| CheckoutBtn[Click "Checkout"]
    CheckoutBtn --> CheckoutFlow[Checkout Process]

    CartActions -->|Save for later| SaveItem[Move to "Saved" tab]
    SaveItem --> GroupedByFarm

    CheckoutFlow --> End([Cart complete: 3 farms, 5 items, $25.48])
```text
**Multi-Farm Cart Features** (UNIQUE COMPETITIVE ADVANTAGE):

- **Grouped display**: Visual separation by farm (cards/borders)
- **Per-farm fulfillment**: Choose delivery/pickup per farm independently
- **Consolidated checkout**: Single payment split across farms
- **Cart persistence**: Saved 7 days, synced cross-device
- **Smart expiration**: Remove out-of-stock, suggest substitutes

**Cart Optimization**:

- **Swipe gestures**: Swipe left to remove (mobile)
- **Save for later**: Move items without deleting (60% re-add later)
- **Quick adjust**: +/- buttons without modal dialogs
- **Real-time pricing**: Prices update if changed since add

---

### 7. Checkout & Payment (FR-014)

**Persona**: Mile Mochwara (needs it done fast)
**Goal**: Complete checkout in <3 minutes
**Success Metric**: >70% complete, >98% payment success

```mermaid
graph TD
    Start([Mile clicks Checkout]) --> CheckoutScreen[Checkout Screen]
    CheckoutScreen --> Step1[Step 1: Review Order]

    Step1 --> OrderSummary[Order Summary<br/>---<br/>Green Valley Farm<br/>Subtotal: $11.98<br/>Delivery: $5.00<br/>---<br/>Sunrise Farm<br/>Subtotal: $7.50<br/>Farm Pickup: Free<br/>---<br/>Happy Hen Farm<br/>Subtotal: $6.00<br/>Market Pickup: Free<br/>---<br/>Platform Fee: $3.75 15%<br/>Tax: $2.05<br/>---<br/>TOTAL: $36.28]

    OrderSummary --> Step2[Step 2: Delivery Address]
    Step2 --> SavedAddresses{Saved addresses?}
    SavedAddresses -->|Yes| SelectAddress[Select "Home"]
    SavedAddresses -->|No| NewAddress[Enter new address]
    NewAddress --> AddressForm[Street, City, State, ZIP]
    AddressForm --> ValidateAddress[Validate with USPS API]
    ValidateAddress --> AddressValid{Valid address?}
    AddressValid -->|No| AddressError[Show error + suggestions]
    AddressError --> AddressForm
    AddressValid -->|Yes| AddressSaved[Address saved]
    SelectAddress --> AddressSaved

    AddressSaved --> Step3[Step 3: Payment]
    Step3 --> PaymentMethod{Saved payment?}
    PaymentMethod -->|Yes| SelectCard[Select saved card: Visa •••• 1234]
    PaymentMethod -->|No| NewCard[Enter new card]
    NewCard --> StripeElements[Stripe Elements iframe<br/>Card number, expiry, CVV]
    StripeElements --> SaveCard{Save for future?}
    SaveCard -->|Yes| TokenizeAndSave[Tokenize + save token]
    SaveCard -->|No| TokenizeOnly[Tokenize only]
    TokenizeAndSave --> PaymentReady[Payment ready]
    TokenizeOnly --> PaymentReady
    SelectCard --> PaymentReady

    PaymentReady --> ApplePay{Apple Pay available?}
    ApplePay -->|Yes| ShowApplePay[Show Apple Pay button]
    ApplePay -->|No| StandardPay[Standard card payment]

    ShowApplePay --> ApplePayBtn{User clicks?}
    ApplePayBtn -->|Yes| ApplePayFlow[Apple Pay authorization]
    ApplePayFlow --> ApplePayComplete[Apple Pay success]
    ApplePayComplete --> PlaceOrder[Place Order]
    ApplePayBtn -->|No| StandardPay

    StandardPay --> PlaceOrder[Click "Place Order"]

    PlaceOrder --> CreateIntent[Create Stripe PaymentIntent<br/>Amount: $36.28<br/>Split: 85% farms, 15% platform]
    CreateIntent --> ConfirmPayment[Stripe: Confirm payment]
    ConfirmPayment --> PaymentProcessing[Processing...]

    PaymentProcessing --> PaymentResult{Payment success?}
    PaymentResult -->|Yes| PaymentSuccess[Payment confirmed ✓]
    PaymentResult -->|No| PaymentError[Payment failed]

    PaymentError --> ErrorReason{Error type?}
    ErrorReason -->|Card declined| DeclinedMsg[Show: Card declined<br/>Try another card]
    ErrorReason -->|Insufficient funds| InsufficientMsg[Show: Insufficient funds]
    ErrorReason -->|Network error| NetworkMsg[Show: Connection error<br/>Retry button]
    DeclinedMsg --> Step3
    InsufficientMsg --> Step3
    NetworkMsg --> RetryPayment[Click Retry]
    RetryPayment --> ConfirmPayment

    PaymentSuccess --> CreateOrders[Create orders in DB<br/>- Order #1 → Green Valley<br/>- Order #2 → Sunrise<br/>- Order #3 → Happy Hen]
    CreateOrders --> NotifyFarmers[Notify farmers: New order]
    NotifyFarmers --> NotifyCustomer[Email customer: Order confirmed]
    NotifyCustomer --> ClearCart[Clear shopping cart]
    ClearCart --> OrderConfirmation[Order Confirmation Screen]

    OrderConfirmation --> ShowOrders[Show order numbers:<br/>#FM-001234<br/>#FM-001235<br/>#FM-001236]
    ShowOrders --> TrackingLinks[Tracking links for each order]
    TrackingLinks --> End([Checkout complete - 2m 40s])
```text
**Payment Split (Stripe Connect)**:

- **Single charge**: Customer pays once ($36.28)
- **Auto-split**:
  - Green Valley Farm: $11.98 × 0.85 = $10.18
  - Sunrise Farm: $7.50 × 0.85 = $6.38
  - Happy Hen Farm: $6.00 × 0.85 = $5.10
  - Platform: ($11.98 + $7.50 + $6.00) × 0.15 = $3.75
  - Stripe fees: ~2.9% + $0.30 per transaction
- **Farmer margin**: Target 82-85% after all fees

**Abandonment Recovery**:

- **Exit intent**: Show modal "10% off if complete now"
- **Email reminder**: 24 hours later with cart link
- **SMS reminder**: 48 hours (opt-in only)
- **Cart persistence**: Saved 7 days

---

### 8. Order Tracking (FR-016)

**Persona**: Divna Kapica (wants to know status)
**Goal**: Check order status and track fulfillment
**Success Metric**: >80% check status, >90% open confirmation email

```mermaid
graph TD
    Start([Divna placed order]) --> ConfirmEmail[Receive confirmation email]
    ConfirmEmail --> ClickEmail{Click email link?}
    ClickEmail -->|Yes| OrderDetail[Order detail page]
    ClickEmail -->|No| OpenApp[Open app later]
    OpenApp --> OrderHistory[Order History]
    OrderHistory --> SelectOrder[Click order #FM-001234]
    SelectOrder --> OrderDetail

    OrderDetail --> StatusFlow[Status Timeline]
    StatusFlow --> PendingState[● PENDING<br/>Waiting for farmer to accept<br/>Placed: Today 10:30 AM]

    PendingState --> FarmerAccepts[Farmer accepts order]
    FarmerAccepts --> NotifyConfirmed[Push notification:<br/>"Green Valley Farm accepted your order!"]
    NotifyConfirmed --> ConfirmedState[● CONFIRMED<br/>Estimated ready: Tomorrow 9 AM<br/>Accepted: Today 11:45 AM]

    ConfirmedState --> FarmerPrepares[Farmer prepares order]
    FarmerPrepares --> FulfilledState[● FULFILLED<br/>Ready for pickup/delivery<br/>Fulfilled: Tomorrow 8:30 AM]

    FulfilledState --> FulfillmentType{Fulfillment method?}
    FulfillmentType -->|Delivery| DeliveryFlow[Delivery tracking]
    FulfillmentType -->|Farm Pickup| PickupFlow[Pickup details]
    FulfillmentType -->|Market Pickup| MarketFlow[Market booth info]

    DeliveryFlow --> DeliveryETA[ETA: 2:00 PM - 4:00 PM<br/>Driver: On the way]
    DeliveryETA --> ProofDelivery[Farmer uploads proof photo]
    ProofDelivery --> CustomerNotified[SMS: "Delivered at 2:15 PM"]
    CustomerNotified --> CompletedState[● COMPLETED<br/>Delivered: Tomorrow 2:15 PM]

    PickupFlow --> PickupReady[Ready for pickup!<br/>Green Valley Farm<br/>123 Farm Rd<br/>Hours: Sat 9 AM - 5 PM]
    PickupReady --> PickupReminder[SMS reminder: 9 AM Sat<br/>"Your order is ready for pickup"]
    PickupReminder --> CustomerPicksUp[Customer picks up]
    CustomerPicksUp --> FarmerConfirms[Farmer marks: Picked up]
    FarmerConfirms --> CompletedState

    MarketFlow --> MarketInfo[Farmers Market Booth<br/>Downtown Market<br/>Booth #7<br/>Sunday 8 AM - 12 PM]
    MarketInfo --> MarketReminder[SMS reminder: 9 AM Sun<br/>"Find us at Booth #7"]
    MarketReminder --> CustomerPicksUp

    CompletedState --> ReviewPrompt{Leave a review?}
    ReviewPrompt -->|Yes| ReviewFlow[Review & Rating flow]
    ReviewPrompt -->|Later| ReviewLater[Email in 3 days with incentive]
    ReviewFlow --> ReviewSubmitted[Review submitted ✓]
    ReviewSubmitted --> End([Order lifecycle complete])
    ReviewLater --> End
```text
**Real-Time Notifications**:

- **Email**: All status changes (pending → confirmed → fulfilled → completed)
- **SMS**: Critical updates (confirmed, ready, delivered) - opt-in
- **Push**: Real-time mobile notifications (instant)
- **In-app**: Badge count on order history icon

**Multi-Farm Orders**:

- **Per-farm tracking**: Each farm's status tracked independently
- **Overall status**: Shows "2 of 3 orders confirmed"
- **Separate notifications**: Email per farm status change
- **Aggregated view**: Timeline shows all orders together

---

## 🔄 ORDER LIFECYCLE FLOWS

### 9. Complete Order Flow (End-to-End)

**Journey**: From cart to completion
**Duration**: 3-7 days typical
**Success Metric**: >95% fulfillment rate, <3% quality issues

```mermaid
graph TD
    Start([Customer adds to cart]) --> Cart[Shopping Cart]
    Cart --> Checkout[Checkout Process]
    Checkout --> Payment[Payment Split]
    Payment --> OrderCreated[Orders Created in DB]

    OrderCreated --> NotifyFarmers[Notify Farmers: New Order]
    NotifyFarmers --> FarmerReview[Farmers Review Orders]

    FarmerReview --> AcceptDecision{Accept or Decline?}
    AcceptDecision -->|Accept| FarmerAccepts[Farmer Accepts]
    AcceptDecision -->|Decline| FarmerDeclines[Farmer Declines]

    FarmerDeclines --> RefundProcess[Initiate Refund]
    RefundProcess --> NotifyCustomerDecline[Notify Customer: Declined + Reason]
    NotifyCustomerDecline --> SuggestAlternatives[Suggest Similar Products]
    SuggestAlternatives --> RefundComplete[Refund Completed]
    RefundComplete --> OrderCancelled([Order Cancelled])

    FarmerAccepts --> UpdateInventory[Update Inventory -2 lbs]
    UpdateInventory --> NotifyCustomerAccept[Notify Customer: Confirmed]
    NotifyCustomerAccept --> FarmerPrepares[Farmer Prepares Order]

    FarmerPrepares --> FulfillmentCheck{Fulfillment Method?}
    FulfillmentCheck -->|Delivery| DeliveryRoute[Plan Delivery Route]
    FulfillmentCheck -->|Farm Pickup| PickupReady[Mark Ready for Pickup]
    FulfillmentCheck -->|Market Pickup| MarketSchedule[Schedule Market Booth]

    DeliveryRoute --> FarmerDelivers[Farmer Delivers]
    FarmerDelivers --> ProofPhoto[Upload Proof Photo]
    ProofPhoto --> MarkFulfilled[Mark Order: FULFILLED]

    PickupReady --> NotifyPickup[Notify Customer: Ready]
    NotifyPickup --> WaitPickup[Wait for Customer]
    WaitPickup --> CustomerArrives{Customer arrives?}
    CustomerArrives -->|Yes| HandoffComplete[Handoff Complete]
    CustomerArrives -->|No after 48h| PickupNoShow[Pickup No-Show]
    PickupNoShow --> ContactCustomer[Contact Customer]
    ContactCustomer --> Reschedule{Reschedule?}
    Reschedule -->|Yes| WaitPickup
    Reschedule -->|No| CancelNoShow[Cancel Order]
    CancelNoShow --> RefundProcess
    HandoffComplete --> MarkFulfilled

    MarketSchedule --> MarketDay[Market Day Arrives]
    MarketDay --> SetupBooth[Setup Booth #7]
    SetupBooth --> CustomerArrives

    MarkFulfilled --> NotifyComplete[Notify Customer: Completed]
    NotifyComplete --> QualityCheck{Quality Issue Reported?}

    QualityCheck -->|Yes| QualityIssue[Customer Reports Issue]
    QualityIssue --> IssueReview[Farmer Reviews Issue]
    IssueReview --> Resolution{Resolution?}
    Resolution -->|Full Refund| FullRefund[Issue Full Refund]
    Resolution -->|Partial Refund| PartialRefund[Issue Partial Refund]
    Resolution -->|Replacement| ScheduleReplacement[Schedule Replacement]
    FullRefund --> IssueResolved[Issue Resolved]
    PartialRefund --> IssueResolved
    ScheduleReplacement --> DeliveryRoute

    QualityCheck -->|No| HappyPath[No Issues ✓]
    IssueResolved --> HappyPath

    HappyPath --> ReviewRequest[Request Review Email]
    ReviewRequest --> CustomerReviews{Customer Reviews?}
    CustomerReviews -->|Yes| SubmitReview[Submit 5-star Review]
    CustomerReviews -->|No| NoReview[No Review]
    SubmitReview --> ReviewPublished[Review Published]
    ReviewPublished --> FarmerResponse{Farmer Responds?}
    FarmerResponse -->|Yes| ThankYouReply["Thank you for your support!"]
    FarmerResponse -->|No| NoResponse[No Response]
    ThankYouReply --> OrderComplete([Order Lifecycle Complete])
    NoResponse --> OrderComplete
    NoReview --> OrderComplete
```text
**Lifecycle Timeline**:

- **Day 0**: Order placed (customer)
- **Day 0 (+2 hours)**: Farmer accepts (target <2 hours)
- **Day 1**: Farmer prepares order (harvest fresh)
- **Day 2**: Fulfillment (delivery/pickup/market)
- **Day 2**: Customer receives (quality check)
- **Day 5**: Review request email (3 days after fulfillment)

**Success Metrics**:

- **Accept rate**: >95% (farmers accept most orders)
- **Accept time**: <2 hours average
- **Fulfillment rate**: >98% (very few cancellations)
- **On-time fulfillment**: >95% (within scheduled window)
- **Quality issue rate**: <3% (very high quality)
- **Review rate**: >30% (customers leave feedback)

---

## ⚠️ ERROR HANDLING & EDGE CASES

### 10. Out-of-Stock Handling

**Scenario**: Product sells out while in cart
**Recovery**: Notify customer, suggest alternatives

```mermaid
graph TD
    Start([Product in cart]) --> CartPersist[Cart stored 7 days]
    CartPersist --> CustomerReturns[Customer returns after 2 days]
    CustomerReturns --> ViewCart[View Cart]

    ViewCart --> ValidateStock[Validate all items in stock]
    ValidateStock --> StockCheck{All in stock?}

    StockCheck -->|Yes| AllGood[Proceed to checkout ✓]
    StockCheck -->|No| StockIssue[Item out of stock]

    StockIssue --> HighlightItem[Highlight: Tomatoes - OUT OF STOCK]
    HighlightItem --> NotifyCustomer[Show banner: "1 item unavailable"]
    NotifyCustomer --> Options{Customer options}

    Options --> Remove[Remove from cart]
    Remove --> RecalcCart[Recalculate cart total]
    RecalcCart --> AllGood

    Options --> Substitute[View substitutes]
    Substitute --> SimilarProducts[Show similar:<br/>- Heirloom Tomatoes $6.99/lb<br/>- Cherry Tomatoes $4.99/lb<br/>- Tomatoes from nearby farm]
    SimilarProducts --> SelectSub{Select substitute?}
    SelectSub -->|Yes| ReplaceItem[Replace in cart]
    SelectSub -->|No| Remove
    ReplaceItem --> RecalcCart

    Options --> Notify[Get notified when back]
    Notify --> SubscribeAlert[Subscribe to alerts]
    SubscribeAlert --> AlertSaved[Alert saved ✓]
    AlertSaved --> Remove

    AllGood --> End([Proceed to checkout])
```text
**Stock Validation**:

- **At cart view**: Validate all items before checkout
- **At checkout**: Final validation before payment
- **During checkout**: WebSocket listener for real-time stock changes
- **Post-payment**: If stock sold out mid-checkout, auto-refund + notify

---

### 11. Payment Failure Recovery

**Scenario**: Card declined during checkout
**Recovery**: Multiple payment methods, retry logic

```mermaid
graph TD
    Start([Click Place Order]) --> CreateIntent[Create Stripe PaymentIntent]
    CreateIntent --> ConfirmPayment[Confirm Payment]
    ConfirmPayment --> Processing[Processing...]

    Processing --> Result{Payment Result}
    Result -->|Success| PaymentSuccess[Payment Success ✓]
    Result -->|Failed| PaymentFailed[Payment Failed]

    PaymentFailed --> ErrorType{Error Type?}

    ErrorType -->|card_declined| DeclinedError[Card Declined]
    DeclinedError --> ShowDeclined[Show: "Your card was declined.<br/>Please try another payment method."]
    ShowDeclined --> RetryOptions[Retry Options]

    ErrorType -->|insufficient_funds| InsufficientError[Insufficient Funds]
    InsufficientError --> ShowInsufficient[Show: "Insufficient funds.<br/>Total: $36.28"]
    ShowInsufficient --> RetryOptions

    ErrorType -->|expired_card| ExpiredError[Card Expired]
    ExpiredError --> ShowExpired[Show: "Your card has expired.<br/>Please update your card."]
    ShowExpired --> RetryOptions

    ErrorType -->|network_error| NetworkError[Network Error]
    NetworkError --> ShowNetwork[Show: "Connection error.<br/>Click retry to try again."]
    ShowNetwork --> RetryButton[Retry Button]
    RetryButton --> RetryWait[Wait 2 seconds]
    RetryWait --> ConfirmPayment

    RetryOptions --> NewMethod{Choose new method}
    NewMethod -->|Try another card| SelectCard[Select different saved card]
    NewMethod -->|Enter new card| EnterNewCard[Enter new card details]
    NewMethod -->|Apple Pay| UseApplePay[Use Apple Pay]

    SelectCard --> ConfirmPayment
    EnterNewCard --> ConfirmPayment
    UseApplePay --> ConfirmPayment

    PaymentSuccess --> End([Order Placed ✓])
```text
**Payment Retry Logic**:

- **Automatic retry**: Network errors (3 attempts with exponential backoff)
- **Manual retry**: Card errors (customer selects new method)
- **Fraud prevention**: 3 failed attempts → CAPTCHA required
- **Abandonment tracking**: Log failed payments for follow-up

---

### 12. Delivery/Pickup Complications

**Scenario**: Customer not home for delivery
**Recovery**: Re-delivery or refund options

```mermaid
graph TD
    Start([Farmer attempts delivery]) --> Arrive[Arrive at address]
    Arrive --> KnockDoor[Knock on door]
    KnockDoor --> Response{Customer answers?}

    Response -->|Yes| Handoff[Hand off order]
    Handoff --> ProofPhoto[Take proof photo]
    ProofPhoto --> MarkDelivered[Mark: DELIVERED]
    MarkDelivered --> Success([Delivery Complete])

    Response -->|No| WaitMinutes[Wait 5 minutes]
    WaitMinutes --> TryAgain[Knock again]
    TryAgain --> StillNoResponse{Still no answer?}

    StillNoResponse -->|Customer appears| Handoff
    StillNoResponse -->|Still no answer| CallPhone[Call customer phone]
    CallPhone --> PhoneResponse{Customer answers?}

    PhoneResponse -->|Yes| CustomerSteps{Customer says?}
    CustomerSteps -->|"I'm 5 min away"| WaitMore[Wait additional time]
    WaitMore --> Handoff
    CustomerSteps -->|"Leave at door"| LeaveAtDoor[Leave at doorstep]
    LeaveAtDoor --> ProofPhoto
    CustomerSteps -->|"Can't make it"| CannotReceive[Cannot receive today]

    PhoneResponse -->|No answer| Voicemail[Leave voicemail]
    Voicemail --> TextMessage[Send SMS]
    TextMessage --> WaitResponse[Wait 10 minutes]
    WaitResponse --> FinalCheck{Customer responds?}

    FinalCheck -->|Yes| Reschedule[Reschedule delivery]
    FinalCheck -->|No| ReturnProduct[Return product to farm]

    CannotReceive --> Options{Redeliver or refund?}
    Options -->|Redeliver| Reschedule
    Options -->|Refund| InitiateRefund[Initiate refund]

    Reschedule --> ScheduleDate[Schedule new date/time]
    ScheduleDate --> NotifyCustomer[Notify customer: New delivery time]
    NotifyCustomer --> ReattemptDelivery[Re-attempt delivery]
    ReattemptDelivery --> Arrive

    ReturnProduct --> NotifyCustomerFailed[Notify: Delivery failed]
    NotifyCustomerFailed --> OfferOptions[Offer: Re-delivery $5 fee OR Refund]
    OfferOptions --> CustomerChoice{Customer chooses?}
    CustomerChoice -->|Re-delivery| PayRedelivery[Customer pays $5]
    PayRedelivery --> Reschedule
    CustomerChoice -->|Refund| InitiateRefund
    CustomerChoice -->|No response 24h| AutoRefund[Auto-refund after 24h]

    InitiateRefund --> RefundProcess[Process refund]
    AutoRefund --> RefundProcess
    RefundProcess --> RefundComplete[Refund issued ✓]
    RefundComplete --> Failed([Delivery Failed - Refunded])
```text
**Delivery Best Practices**:

- **Delivery window**: 2-hour window (e.g., 2-4 PM)
- **Pre-delivery SMS**: 30 min before arrival
- **Arrival SMS**: "I'm here!" notification
- **Photo proof**: Required for all deliveries
- **Refund policy**: Full refund if delivery fails (no fault of customer)

---

## 🔗 CROSS-FEATURE INTEGRATION FLOWS

### 13. Farm Profile → Product → Cart → Order

**Integration Points**: FR-002 → FR-003 → FR-013 → FR-014
**User Path**: Discovery through purchase

```mermaid
graph LR
    A[FR-011: Farm Discovery] --> B[FR-002: Farm Profile]
    B --> C[FR-012: Product Browsing]
    C --> D[FR-013: Shopping Cart]
    D --> E[FR-014: Checkout]
    E --> F[FR-016: Order Tracking]
    F --> G[FR-017: Review & Rating]
```text
**Integration Requirements**:

1. **Farm Profile → Products**: "View Products" button links to filtered product list
2. **Product → Cart**: "Add to Cart" maintains farm association
3. **Cart → Checkout**: Multi-farm grouping preserved through checkout
4. **Checkout → Orders**: Split into separate orders per farm
5. **Orders → Tracking**: Per-farm status tracking with aggregated view
6. **Tracking → Reviews**: Review prompt 3 days after fulfillment

---

### 14. Inventory → Cart → Order → Analytics

**Integration Points**: FR-004 → FR-013 → FR-005 → FR-008
**Data Flow**: Stock management through reporting

```mermaid
graph TD
    A[FR-004: Inventory Update] --> B[WebSocket Broadcast]
    B --> C[FR-013: Cart Validation]
    C --> D{Stock available?}
    D -->|Yes| E[FR-014: Checkout]
    D -->|No| F[Out of Stock Handler]
    E --> G[FR-005: Order Created]
    G --> H[Inventory Auto-Deduct]
    H --> I[FR-008: Analytics Update]
    I --> J[Dashboard Metrics:<br/>- Sales<br/>- Inventory turnover<br/>- Stock alerts]
```text
**Real-Time Data Flow**:

- **Inventory update**: Farmer changes stock → WebSocket broadcast
- **Cart validation**: Consumer carts auto-validate stock <2s
- **Order placement**: Stock deducted immediately on order confirm
- **Analytics**: Real-time dashboard updates (no delay)

---

## 📊 SUCCESS METRICS & ANALYTICS

### 15. Conversion Funnel Tracking

**Goal**: Measure drop-off at each stage
**Tool**: Google Analytics 4 + Custom events

```mermaid
graph TD
    A[Homepage Visit] --> B[Farm Discovery]
    B --> C[Farm Profile View]
    C --> D[Product View]
    D --> E[Add to Cart]
    E --> F[Checkout Started]
    F --> G[Payment Submitted]
    G --> H[Order Confirmed]

    A -->|100%| ACount[10,000 visits/month]
    B -->|70%| BCount[7,000 users]
    C -->|60%| CCount[4,200 users]
    D -->|80%| DCount[3,360 users]
    E -->|25%| ECount[840 users]
    F -->|60%| FCount[504 users]
    G -->|70%| GCount[353 users]
    H -->|98%| HCount[346 orders]

    HCount --> Conversion[Overall Conversion: 3.46%]
```text
**Key Metrics by Flow**:

| Flow Stage            | Metric             | Target      | Measurement         |
| --------------------- | ------------------ | ----------- | ------------------- |
| **Farmer Onboarding** | Completion rate    | 80%         | Step 1 → Dashboard  |
|                       | Time to complete   | <5 min      | Timestamp tracking  |
|                       | Mobile usage       | 75%         | Device type         |
|                       | Email verification | 90%         | Verified within 24h |
| **Product Listing**   | Completion rate    | >90%        | Draft → Published   |
|                       | Time to list       | <3 min 75th | Timestamp tracking  |
|                       | Template usage     | >60%        | Template vs blank   |
|                       | Mobile listing     | >80%        | Device type         |
| **Farm Discovery**    | Farms found        | 8-12 avg    | Search results      |
|                       | Map usage          | >70%        | Map vs list view    |
|                       | Filter usage       | >60%        | Applied filters     |
| **Product Browsing**  | Search usage       | >80%        | Search vs browse    |
|                       | Filter usage       | >50%        | Applied filters     |
|                       | Add to cart rate   | >25%        | Product view → Add  |
| **Shopping Cart**     | Multi-farm carts   | >40%        | Carts with 2+ farms |
|                       | Abandonment rate   | <60%        | Cart → Checkout     |
|                       | Items per cart     | 5-7 avg     | Cart item count     |
| **Checkout**          | Completion rate    | >70%        | Checkout → Order    |
|                       | Payment success    | >98%        | Payment attempts    |
|                       | Guest checkout     | 20-30%      | Guest vs account    |
| **Order Tracking**    | Status checks      | >80%        | Order detail views  |
|                       | Email opens        | >90%        | Confirmation emails |
|                       | Reorder rate       | >40%        | Repeat purchases    |
| **Reviews**           | Review rate        | >30%        | Orders → Reviews    |
|                       | Average rating     | >4.5 stars  | Mean rating         |
|                       | Farmer responses   | >60%        | Replies to reviews  |

---

### 16. Error Rate Monitoring

**Goal**: Track and minimize errors
**Tool**: Sentry + DataDog

```mermaid
graph TD
    A[User Action] --> B{Success?}
    B -->|Yes| C[Track Success Event]
    B -->|No| D[Track Error Event]

    D --> E[Error Type]
    E --> F[Payment Failed]
    E --> G[API Error 5xx]
    E --> H[Stock Validation Failed]
    E --> I[Network Timeout]

    F --> J[Sentry: Capture Exception]
    G --> J
    H --> J
    I --> J

    J --> K[DataDog: Log Error]
    K --> L[Alert Threshold Exceeded?]
    L -->|Yes| M[PagerDuty Alert]
    L -->|No| N[Monitor Dashboard]

    M --> O[On-Call Engineer]
    O --> P[Investigate & Fix]
    P --> Q[Deploy Fix]
    Q --> R[Verify Resolution]
```text
**Error Rate Targets**:

| Error Type            | Target Rate | Alert Threshold | Action               |
| --------------------- | ----------- | --------------- | -------------------- |
| **Payment failures**  | <2%         | >5%             | Investigate Stripe   |
| **API errors (5xx)**  | <0.1%       | >1%             | Check server logs    |
| **Stock overselling** | <1%         | >2%             | Fix inventory sync   |
| **Network timeouts**  | <5%         | >10%            | Optimize API latency |
| **Failed deliveries** | <5%         | >10%            | Contact farmers      |

---

## 🎓 SUMMARY

### Flow Coverage

✅ **Farmer Flows** (9 features):

1. Onboarding (FR-001) - 5 min mobile registration
2. Farm Profile (FR-002) - Public storytelling page
3. Product Listing (FR-003) - 3 min mobile listing
4. Inventory Tracking (FR-004) - 30s field updates
5. Order Management (FR-005) - Batch processing
6. Payment Processing (FR-006) - 85% margins
7. Fulfillment (FR-007) - 3 methods
8. Analytics (FR-008) - Data-driven decisions
9. Communication (FR-009) - In-app messaging

✅ **Consumer Flows** (9 features): 10. Registration (FR-010) - <2 min signup 11. Farm Discovery (FR-011) - Location-based search 12. Product Browsing (FR-012) - Search & filters 13. Shopping Cart (FR-013) - Multi-farm UNIQUE 14. Checkout (FR-014) - Split payment 15. Fulfillment Selection (FR-015) - Choose per farm 16. Order Tracking (FR-016) - Real-time status 17. Reviews (FR-017) - 5-star ratings 18. Quality Guarantee (FR-018) - 100% satisfaction

✅ **Platform Flows** (5 features): 19. Multi-Tenant (FR-019) - Farms as tenants 20. Mobile PWA (FR-020) - 75% mobile target 21. Real-Time Sync (FR-021) - <2s latency 22. Security (FR-022) - PCI DSS, GDPR 23. Monitoring (FR-023) - >99.9% uptime

### Integration Points

- **23 feature flows documented** with Mermaid diagrams
- **Cross-feature integrations** mapped
- **Error handling** for all critical paths
- **Success metrics** defined for each flow
- **Analytics tracking** specified

### Next Steps

1. **Validate flows** with user testing (5-8 users per persona)
2. **Implement tracking** (Google Analytics 4 events)
3. **Build prototypes** (Figma clickable prototypes)
4. **Measure baselines** (current conversion rates)
5. **Optimize funnels** (A/B test improvements)

---

**Document Version**: v1.0.0
**Last Updated**: October 19, 2025
**Status**: Complete ✅
**Next Document**: AGRICULTURAL_WIREFRAMES.instructions.md

---

> "Every flow is a journey. Every journey is an opportunity to delight."
````
