# GitHub Issues from TODO Comments

**Generated**: 2026-01-06T19:44:50.910Z
**Total TODOs Found**: 27
**Files Scanned**: 466

---

## Summary by Category

| Category | Count | High Priority | Medium Priority | Low Priority |
| -------- | ----- | ------------- | --------------- | ------------ |
| API      | 9     | 0             | 0               | 9            |
| General  | 5     | 0             | 0               | 5            |
| Payments | 2     | 0             | 0               | 2            |
| Services | 5     | 0             | 0               | 5            |
| Testing  | 6     | 0             | 0               | 6            |

---

## Issues by Category

### API

#### Issue 1: [API] Implement API call to fetch order details

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Implement API call to fetch order details

## Location

**File**: `src\app\(customer)\checkout\success\page.tsx`
**Line**: 63
[View in code](<./src\app(customer)\checkout\success\page.tsx#L63>)

## Context

```tsx
  const fetchOrderDetails = async () => {
    try {
      // TODO: Implement API call to fetch order details
      // const response = await fetch(`/api/orders/by-payment-intent/${paymentIntentId}`);
      // const data = await response.json();
```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 2: [API] Send email notification to farm owner

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Send email notification to farm owner

## Location

**File**: `src\app\api\admin\farms\verify\route.ts`
**Line**: 179
[View in code](./src\app\api\admin\farms\verify\route.ts#L179)

## Context

```ts
      });

      // TODO: Send email notification to farm owner
      // await sendFarmApprovalEmail(updatedFarm.owner.email, updatedFarm);

```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 3: [API] Create notification for farm owner

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Create notification for farm owner

## Location

**File**: `src\app\api\admin\farms\verify\route.ts`
**Line**: 182
[View in code](./src\app\api\admin\farms\verify\route.ts#L182)

## Context

```ts
// await sendFarmApprovalEmail(updatedFarm.owner.email, updatedFarm);

// TODO: Create notification for farm owner
// await createNotification({
//   userId: updatedFarm.ownerId,
```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 4: [API] Send email notification to farm owner

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Send email notification to farm owner

## Location

**File**: `src\app\api\admin\farms\verify\route.ts`
**Line**: 243
[View in code](./src\app\api\admin\farms\verify\route.ts#L243)

## Context

```ts
      });

      // TODO: Send email notification to farm owner
      // await sendFarmRejectionEmail(updatedFarm.owner.email, updatedFarm, reason);

```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 5: [API] Create notification for farm owner

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Create notification for farm owner

## Location

**File**: `src\app\api\admin\farms\verify\route.ts`
**Line**: 246
[View in code](./src\app\api\admin\farms\verify\route.ts#L246)

## Context

```ts
// await sendFarmRejectionEmail(updatedFarm.owner.email, updatedFarm, reason);

// TODO: Create notification for farm owner
// await createNotification({
//   userId: updatedFarm.ownerId,
```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 6: [API] Store stripeCustomerId in User model or use metadata lookup

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Store stripeCustomerId in User model or use metadata lookup

## Location

**File**: `src\app\api\checkout\payment-intent\route.ts`
**Line**: 104
[View in code](./src\app\api\checkout\payment-intent\route.ts#L104)

## Context

```ts
    // =========================================================================
    // For now, create a new customer each time
    // TODO: Store stripeCustomerId in User model or use metadata lookup
    const stripeCustomerId = await stripeService.getOrCreateCustomer({
      email: user.email,
```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 7: [API] Send order confirmation email

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Send order confirmation email

## Location

**File**: `src\app\api\payments\webhook\route.ts`
**Line**: 177
[View in code](./src\app\api\payments\webhook\route.ts#L177)

## Context

```ts
    for (const order of result.orders) {
      try {
        // TODO: Send order confirmation email
        // await emailService.sendOrderConfirmationEmail(...)
        logger.info(`Order confirmation email queued for order ${order.orderNumber}`);
```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 8: [API] Send payment failure notification email

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Send payment failure notification email

## Location

**File**: `src\app\api\payments\webhook\route.ts`
**Line**: 267
[View in code](./src\app\api\payments\webhook\route.ts#L267)

## Context

```ts
    if (customerEmail) {
      try {
        // TODO: Send payment failure notification email
        logger.info(`Payment failure notification queued for ${customerEmail}`);
      } catch (emailError) {
```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

#### Issue 9: [API] Create refund record in Refund table

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `api`

## Description

Create refund record in Refund table

## Location

**File**: `src\app\api\payments\webhook\route.ts`
**Line**: 364
[View in code](./src\app\api\payments\webhook\route.ts#L364)

## Context

```ts
    // Create refund records and update order status
    for (const order of orders) {
      // TODO: Create refund record in Refund table
      // await database.refund.create({ ... });

```

## Type

TODO (Priority: low)

## Category

API

---

_This issue was automatically generated from a code comment._

---

### General

#### Issue 1: [General] Get userId from auth session

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `general`

## Description

Get userId from auth session

## Location

**File**: `src\app\(customer)\cart\page.tsx`
**Line**: 45
[View in code](<./src\app(customer)\cart\page.tsx#L45>)

## Context

```tsx
  useEffect(() => {
    setIsMounted(true);
    // TODO: Get userId from auth session
    // For now, using mock user ID
    setUserId("user_123");
```

## Type

TODO (Priority: low)

## Category

General

---

_This issue was automatically generated from a code comment._

---

#### Issue 2: [General] Implement receipt download

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `general`

## Description

Implement receipt download

## Location

**File**: `src\app\(customer)\checkout\success\page.tsx`
**Line**: 96
[View in code](<./src\app(customer)\checkout\success\page.tsx#L96>)

## Context

```tsx
const handleDownloadReceipt = () => {
  // TODO: Implement receipt download
  alert("Receipt download will be implemented");
};
```

## Type

TODO (Priority: low)

## Category

General

---

_This issue was automatically generated from a code comment._

---

#### Issue 3: [General] Add to retry queue or dead letter queue

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `general`

## Description

Add to retry queue or dead letter queue

## Location

**File**: `src\lib\lazy\cloudinary.lazy.ts`
**Line**: 287
[View in code](./src\lib\lazy\cloudinary.lazy.ts#L287)

## Context

```ts
  uploadPromise.catch((error) => {
    logger.error("❌ Failed to upload to Cloudinary:", error);
    // TODO: Add to retry queue or dead letter queue
  });
}
```

## Type

TODO (Priority: low)

## Category

General

---

_This issue was automatically generated from a code comment._

---

#### Issue 4: [General] Add to retry queue or dead letter queue

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `general`

## Description

Add to retry queue or dead letter queue

## Location

**File**: `src\lib\lazy\email.lazy.ts`
**Line**: 126
[View in code](./src\lib\lazy\email.lazy.ts#L126)

## Context

```ts
  sendEmail(config, mailOptions).catch((error) => {
    logger.error("❌ Failed to send queued email:", error);
    // TODO: Add to retry queue or dead letter queue
  });
}
```

## Type

TODO (Priority: low)

## Category

General

---

_This issue was automatically generated from a code comment._

---

#### Issue 5: [General] Integrate with Sentry or other error tracking service

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `general`

## Description

Integrate with Sentry or other error tracking service

## Location

**File**: `src\lib\monitoring\logger.ts`
**Line**: 377
[View in code](./src\lib\monitoring\logger.ts#L377)

## Context

```ts
   */
  private sendToErrorTracking(error: Error, context?: LogContext): void {
    // TODO: Integrate with Sentry or other error tracking service
    // For now, just log to console
    if (process.env.SENTRY_DSN) {
```

## Type

TODO (Priority: low)

## Category

General

---

_This issue was automatically generated from a code comment._

---

### Payments

#### Issue 1: [Payments] Send notification to admin

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `payments`

## Description

Send notification to admin

## Location

**File**: `src\lib\payments\paypal\webhook.handler.ts`
**Line**: 629
[View in code](./src\lib\payments\paypal\webhook.handler.ts#L629)

## Context

```ts
    });

    // TODO: Send notification to admin
    // TODO: Create dispute record in database

```

## Type

TODO (Priority: low)

## Category

Payments

---

_This issue was automatically generated from a code comment._

---

#### Issue 2: [Payments] Create dispute record in database

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `payments`

## Description

Create dispute record in database

## Location

**File**: `src\lib\payments\paypal\webhook.handler.ts`
**Line**: 630
[View in code](./src\lib\payments\paypal\webhook.handler.ts#L630)

## Context

```ts

    // TODO: Send notification to admin
    // TODO: Create dispute record in database

    return {
```

## Type

TODO (Priority: low)

## Category

Payments

---

_This issue was automatically generated from a code comment._

---

### Services

#### Issue 1: [Services] Implement rollback mechanism

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `services`

## Description

Implement rollback mechanism

## Location

**File**: `src\lib\services\checkout.service.ts`
**Line**: 323
[View in code](./src\lib\services\checkout.service.ts#L323)

## Context

```ts
      } catch (error) {
        logger.error(`Failed to create order for farm ${farmOrder.farmId}:`, error);
        // TODO: Implement rollback mechanism
        throw new Error(`Failed to create order for ${farmOrder.farmName}`);
      }
```

## Type

TODO (Priority: low)

## Category

Services

---

_This issue was automatically generated from a code comment._

---

#### Issue 2: [Services] Implement promo codes

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `services`

## Description

Implement promo codes

## Location

**File**: `src\lib\services\checkout.service.ts`
**Line**: 476
[View in code](./src\lib\services\checkout.service.ts#L476)

## Context

```ts
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      discount: 0, // TODO: Implement promo codes
      total: Math.round(total * 100) / 100,
    };
```

## Type

TODO (Priority: low)

## Category

Services

---

_This issue was automatically generated from a code comment._

---

#### Issue 3: [Services] Integrate with actual email provider

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `services`

## Description

Integrate with actual email provider

## Location

**File**: `src\lib\services\email.service.ts`
**Line**: 182
[View in code](./src\lib\services\email.service.ts#L182)

## Context

```ts
          });

          // TODO: Integrate with actual email provider
          // Example with Nodemailer:
          // const transporter = nodemailer.createTransporter({...});
```

## Type

TODO (Priority: low)

## Category

Services

---

_This issue was automatically generated from a code comment._

---

#### Issue 4: [Services] Integrate with queue service (Bull, BullMQ, etc.)

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `services`

## Description

Integrate with queue service (Bull, BullMQ, etc.)

## Location

**File**: `src\lib\services\email.service.ts`
**Line**: 220
[View in code](./src\lib\services\email.service.ts#L220)

## Context

```ts
   */
  async queueEmail(emailData: EmailData): Promise<void> {
    // TODO: Integrate with queue service (Bull, BullMQ, etc.)
    // For now, send immediately
    await this.sendEmail(emailData);
```

## Type

TODO (Priority: low)

## Category

Services

---

_This issue was automatically generated from a code comment._

---

#### Issue 5: [Services] Calculate tax and shipping based on location

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `services`

## Description

Calculate tax and shipping based on location

## Location

**File**: `src\lib\services\order.service.ts`
**Line**: 138
[View in code](./src\lib\services\order.service.ts#L138)

## Context

```ts
      );

      // TODO: Calculate tax and shipping based on location
      const taxUSD = subtotalUSD * 0.08; // 8% tax (placeholder)
      const shippingUSD = 5.99; // Flat rate (placeholder)
```

## Type

TODO (Priority: low)

## Category

Services

---

_This issue was automatically generated from a code comment._

---

### Testing

#### Issue 1: [Testing] Fix infinite loop - useCheckoutValidation calls canProceedFromStep as selector

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `testing`

## Description

Fix infinite loop - useCheckoutValidation calls canProceedFromStep as selector

## Location

**File**: `src\stores\__tests__\checkoutStore.test.ts`
**Line**: 714
[View in code](./src\stores__tests__\checkoutStore.test.ts#L714)

## Context

```ts
// ============================================================================

// TODO: Fix infinite loop - useCheckoutValidation calls canProceedFromStep as selector
// which calls addError() causing state changes on every render
describe.skip("useCheckoutValidation Hook", () => {
```

## Type

TODO (Priority: low)

## Category

Testing

---

_This issue was automatically generated from a code comment._

---

#### Issue 2: [Testing] Re-enable when NotificationCenter component is created

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `testing`

## Description

Re-enable when NotificationCenter component is created

## Location

**File**: `src\__tests__\animations\animation-accessibility.test.tsx`
**Line**: 204
[View in code](./src__tests__\animations\animation-accessibility.test.tsx#L204)

## Context

```tsx

    it.skip("should mark notifications as read with aria-label", () => {
      // TODO: Re-enable when NotificationCenter component is created
      const notifications = [
        createMockToast({ id: "1", read: false }),
```

## Type

TODO (Priority: low)

## Category

Testing

---

_This issue was automatically generated from a code comment._

---

#### Issue 3: [Testing] Re-enable when NotificationCenter component is created

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `testing`

## Description

Re-enable when NotificationCenter component is created

## Location

**File**: `src\__tests__\animations\animation-accessibility.test.tsx`
**Line**: 263
[View in code](./src__tests__\animations\animation-accessibility.test.tsx#L263)

## Context

```tsx

    it.skip("should allow keyboard navigation through notification list", async () => {
      // TODO: Re-enable when NotificationCenter component is created
      const user = userEvent.setup();
      const notifications = [
```

## Type

TODO (Priority: low)

## Category

Testing

---

_This issue was automatically generated from a code comment._

---

#### Issue 4: [Testing] Re-enable when NotificationCenter component is created

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `testing`

## Description

Re-enable when NotificationCenter component is created

## Location

**File**: `src\__tests__\animations\animation-accessibility.test.tsx`
**Line**: 449
[View in code](./src__tests__\animations\animation-accessibility.test.tsx#L449)

## Context

```tsx

    it.skip("should announce dynamic content changes", async () => {
      // TODO: Re-enable when NotificationCenter component is created
      const notifications = [createMockToast({ id: "1", message: "First" })];

```

## Type

TODO (Priority: low)

## Category

Testing

---

_This issue was automatically generated from a code comment._

---

#### Issue 5: [Testing] Re-enable when NotificationCenter component is created

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `testing`

## Description

Re-enable when NotificationCenter component is created

## Location

**File**: `src\__tests__\animations\animation-accessibility.test.tsx`
**Line**: 555
[View in code](./src__tests__\animations\animation-accessibility.test.tsx#L555)

## Context

```tsx

    it.skip("should use lists for notification collections", () => {
      // TODO: Re-enable when NotificationCenter component is created
      const notifications = [
        createMockToast({ id: "1" }),
```

## Type

TODO (Priority: low)

## Category

Testing

---

_This issue was automatically generated from a code comment._

---

#### Issue 6: [Testing] Re-enable when NotificationCenter component is created

**Priority**: LOW  
**Type**: TODO  
**Labels**: `tech-debt`, `refactor`, `priority:low`, `todo`, `testing`

## Description

Re-enable when NotificationCenter component is created

## Location

**File**: `src\__tests__\animations\animation-accessibility.test.tsx`
**Line**: 606
[View in code](./src__tests__\animations\animation-accessibility.test.tsx#L606)

## Context

```tsx

    it.skip("should have no accessibility violations in NotificationCenter", async () => {
      // TODO: Re-enable when NotificationCenter component is created
      const notifications = [createMockToast()];

```

## Type

TODO (Priority: low)

## Category

Testing

---

_This issue was automatically generated from a code comment._

---

## GitHub CLI Commands

To create these issues using GitHub CLI:

```bash
# Issue 1
gh issue create --title "[API] Implement API call to fetch order details" --body-file "issue-1-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 2
gh issue create --title "[API] Send email notification to farm owner" --body-file "issue-2-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 3
gh issue create --title "[API] Create notification for farm owner" --body-file "issue-3-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 4
gh issue create --title "[API] Send email notification to farm owner" --body-file "issue-4-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 5
gh issue create --title "[API] Create notification for farm owner" --body-file "issue-5-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 6
gh issue create --title "[API] Store stripeCustomerId in User model or use metadata lookup" --body-file "issue-6-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 7
gh issue create --title "[API] Send order confirmation email" --body-file "issue-7-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 8
gh issue create --title "[API] Send payment failure notification email" --body-file "issue-8-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 9
gh issue create --title "[API] Create refund record in Refund table" --body-file "issue-9-body.md" --label "tech-debt,refactor,priority:low,todo,api"

# Issue 10
gh issue create --title "[General] Get userId from auth session" --body-file "issue-10-body.md" --label "tech-debt,refactor,priority:low,todo,general"

# Issue 11
gh issue create --title "[General] Implement receipt download" --body-file "issue-11-body.md" --label "tech-debt,refactor,priority:low,todo,general"

# Issue 12
gh issue create --title "[General] Add to retry queue or dead letter queue" --body-file "issue-12-body.md" --label "tech-debt,refactor,priority:low,todo,general"

# Issue 13
gh issue create --title "[General] Add to retry queue or dead letter queue" --body-file "issue-13-body.md" --label "tech-debt,refactor,priority:low,todo,general"

# Issue 14
gh issue create --title "[General] Integrate with Sentry or other error tracking service" --body-file "issue-14-body.md" --label "tech-debt,refactor,priority:low,todo,general"

# Issue 15
gh issue create --title "[Payments] Send notification to admin" --body-file "issue-15-body.md" --label "tech-debt,refactor,priority:low,todo,payments"

# Issue 16
gh issue create --title "[Payments] Create dispute record in database" --body-file "issue-16-body.md" --label "tech-debt,refactor,priority:low,todo,payments"

# Issue 17
gh issue create --title "[Services] Implement rollback mechanism" --body-file "issue-17-body.md" --label "tech-debt,refactor,priority:low,todo,services"

# Issue 18
gh issue create --title "[Services] Implement promo codes" --body-file "issue-18-body.md" --label "tech-debt,refactor,priority:low,todo,services"

# Issue 19
gh issue create --title "[Services] Integrate with actual email provider" --body-file "issue-19-body.md" --label "tech-debt,refactor,priority:low,todo,services"

# Issue 20
gh issue create --title "[Services] Integrate with queue service (Bull, BullMQ, etc.)" --body-file "issue-20-body.md" --label "tech-debt,refactor,priority:low,todo,services"

# Issue 21
gh issue create --title "[Services] Calculate tax and shipping based on location" --body-file "issue-21-body.md" --label "tech-debt,refactor,priority:low,todo,services"

# Issue 22
gh issue create --title "[Testing] Fix infinite loop - useCheckoutValidation calls canProceedFromStep as selector" --body-file "issue-22-body.md" --label "tech-debt,refactor,priority:low,todo,testing"

# Issue 23
gh issue create --title "[Testing] Re-enable when NotificationCenter component is created" --body-file "issue-23-body.md" --label "tech-debt,refactor,priority:low,todo,testing"

# Issue 24
gh issue create --title "[Testing] Re-enable when NotificationCenter component is created" --body-file "issue-24-body.md" --label "tech-debt,refactor,priority:low,todo,testing"

# Issue 25
gh issue create --title "[Testing] Re-enable when NotificationCenter component is created" --body-file "issue-25-body.md" --label "tech-debt,refactor,priority:low,todo,testing"

# Issue 26
gh issue create --title "[Testing] Re-enable when NotificationCenter component is created" --body-file "issue-26-body.md" --label "tech-debt,refactor,priority:low,todo,testing"

# Issue 27
gh issue create --title "[Testing] Re-enable when NotificationCenter component is created" --body-file "issue-27-body.md" --label "tech-debt,refactor,priority:low,todo,testing"

```

## Bulk Import Instructions

### Option 1: GitHub CLI (Recommended)

1. Install GitHub CLI: https://cli.github.com/
2. Authenticate: `gh auth login`
3. Create issue body files (see section below)
4. Run the commands above

### Option 2: GitHub Web UI

1. Navigate to your repository's Issues page
2. Click "New Issue"
3. Copy/paste title and body from each issue above
4. Add labels manually

### Option 3: GitHub API

Use the JSON output (--json flag) with GitHub's REST API:

```bash
curl -X POST -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/issues \
  -d @issue.json
```

---

_Generated by create-issues-from-todos.js_
