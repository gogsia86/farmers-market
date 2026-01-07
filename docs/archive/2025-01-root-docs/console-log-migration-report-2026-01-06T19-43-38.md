# Console.log Migration Report

**Generated**: 2026-01-06T19:43:38.550Z
**Mode**: 🔍 DRY RUN
**Target Path**: src/

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| Files Processed | 404 |
| Files Modified | 0 |
| Console Calls Replaced | 975 |
| Errors | 0 |

---

## 🔄 Changes by File


### `src\app\(customer)\checkout\success\page.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\actions\cart.actions.ts`

**Replacements**: 11

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.error(` → `logger.error(`
10. `console.error(` → `logger.error(`

... and 1 more replacements

---

### `src\app\actions\farm.actions.ts`

**Replacements**: 5

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`


---

### `src\app\actions\product.actions.ts`

**Replacements**: 8

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`


---

### `src\app\api\admin\analytics\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\admin\farms\verify\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\admin\orders\route.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\app\api\admin\reviews\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\admin\users\route.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\app\api\admin\users\[id]\role\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\admin\users\[id]\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\admin\users\[id]\status\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\admin\webhooks\monitor\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\auth\forgot-password\route.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`


---

### `src\app\api\auth\reset-password\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`


---

### `src\app\api\cart\route.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`


---

### `src\app\api\checkout\payment-intent\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\debug\env-check\route.ts`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\app\api\farms\[farmId]\products\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\farms\[farmId]\route.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\app\api\favorites\route.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\app\api\notifications\preferences\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\notifications\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\notifications\[id]\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\orders\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\orders\[orderId]\invoice\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\orders\[orderId]\payment\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\orders\[orderId]\route.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\app\api\payments\create-intent\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\payments\webhook\route.ts`

**Replacements**: 26

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.error(` → `logger.error(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.error(` → `logger.error(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 16 more replacements

---

### `src\app\api\products\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\products\[productId]\reviews\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\products\[productId]\route.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\app\api\search\route.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\api\user\addresses\route.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`


---

### `src\app\api\user\profile\route.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\app\api\webhooks\stripe\route.ts`

**Replacements**: 26

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.error(` → `logger.error(`

... and 16 more replacements

---

### `src\app\login\error.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\app\login\page.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\components\errors\ErrorExamples.tsx`

**Replacements**: 16

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 6 more replacements

---

### `src\components\features\checkout\payment-step.tsx`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\components\features\checkout\review-step.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\components\features\notifications\notification-center.tsx`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`


---

### `src\components\features\products\add-to-cart-button.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\components\features\products\create-product-form.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\components\loading\SuspenseBoundary.tsx`

**Replacements**: 1

1. `console.warn(` → `logger.warn(`


---

### `src\components\notifications\Banner.tsx`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\components\notifications\context\AnimationContext.tsx`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\components\notifications\NotificationProvider.tsx`

**Replacements**: 4

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`


---

### `src\components\orders\InvoiceDownloadButton.tsx`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\components\orders\OrderConfirmationTracking.tsx`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\components\ui\FormSystemExamples.tsx`

**Replacements**: 7

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`


---

### `src\hooks\use-analytics.ts`

**Replacements**: 4

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`


---

### `src\hooks\use-error-handler.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\hooks\use-error-recovery.ts`

**Replacements**: 5

1. `console.warn(` → `logger.warn(`
2. `console.warn(` → `logger.warn(`
3. `console.warn(` → `logger.warn(`
4. `console.error(` → `logger.error(`
5. `console.log(` → `logger.info(`


---

### `src\hooks\use-form-persist.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`


---

### `src\hooks\use-notifications.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`


---

### `src\hooks\useCart.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\hooks\useOrderUpdates.ts`

**Replacements**: 18

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.error(` → `logger.error(`
10. `console.log(` → `logger.info(`

... and 8 more replacements

---

### `src\lib\ai\perplexity.ts`

**Replacements**: 1

1. `console.warn(` → `logger.warn(`


---

### `src\lib\analytics\google-analytics.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\lib\client\stripe.ts`

**Replacements**: 5

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`


---

### `src\lib\config\env.validation.ts`

**Replacements**: 6

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`


---

### `src\lib\database\index.ts`

**Replacements**: 6

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.warn(` → `logger.warn(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`


---

### `src\lib\gpu\agricultural-gpu.ts`

**Replacements**: 2

1. `console.warn(` → `logger.warn(`
2. `console.log(` → `logger.info(`


---

### `src\lib\gpu\image-processing.ts`

**Replacements**: 9

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.warn(` → `logger.warn(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`


---

### `src\lib\gpu\image-processor.ts`

**Replacements**: 10

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.error(` → `logger.error(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`


---

### `src\lib\gpu\tensorflow-gpu.ts`

**Replacements**: 5

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.warn(` → `logger.warn(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`


---

### `src\lib\init.ts`

**Replacements**: 11

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 1 more replacements

---

### `src\lib\lazy\analytics.lazy.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\lib\lazy\cloudinary.lazy.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`


---

### `src\lib\lazy\email.lazy.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\lib\lazy\image.lazy.ts`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\lib\lazy\ml.lazy.ts`

**Replacements**: 2

1. `console.log(` → `logger.info(`
2. `console.warn(` → `logger.warn(`


---

### `src\lib\logger\index.ts`

**Replacements**: 6

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.warn(` → `logger.warn(`
6. `console.error(` → `logger.error(`


---

### `src\lib\middleware\rate-limiter.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\lib\monitoring\agents\workflow-agent-orchestrator.ts`

**Replacements**: 9

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.warn(` → `logger.warn(`


---

### `src\lib\monitoring\agricultural-logger.ts`

**Replacements**: 4

1. `console.debug(` → `logger.debug(`
2. `console.warn(` → `logger.warn(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`


---

### `src\lib\monitoring\ai\failure-analyzer.ts`

**Replacements**: 7

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`
7. `console.warn(` → `logger.warn(`


---

### `src\lib\monitoring\app-insights.ts`

**Replacements**: 18

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.error(` → `logger.error(`
4. `console.debug(` → `logger.debug(`
5. `console.error(` → `logger.error(`
6. `console.debug(` → `logger.debug(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.error(` → `logger.error(`
10. `console.debug(` → `logger.debug(`

... and 8 more replacements

---

### `src\lib\monitoring\bot.ts`

**Replacements**: 27

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 17 more replacements

---

### `src\lib\monitoring\healing\auto-remediation-system.ts`

**Replacements**: 70

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 60 more replacements

---

### `src\lib\monitoring\healing\self-healer.ts`

**Replacements**: 11

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 1 more replacements

---

### `src\lib\monitoring\integration\orchestrator-bridge.ts`

**Replacements**: 32

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.warn(` → `logger.warn(`
8. `console.error(` → `logger.error(`
9. `console.error(` → `logger.error(`
10. `console.log(` → `logger.info(`

... and 22 more replacements

---

### `src\lib\monitoring\ml\predictive-monitor.ts`

**Replacements**: 10

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`


---

### `src\lib\monitoring\notifiers\discord.notifier.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.warn(` → `logger.warn(`


---

### `src\lib\monitoring\notifiers\index.ts`

**Replacements**: 10

1. `console.warn(` → `logger.warn(`
2. `console.warn(` → `logger.warn(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`


---

### `src\lib\monitoring\notifiers\slack.notifier.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.warn(` → `logger.warn(`


---

### `src\lib\monitoring\performance-monitor.ts`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\lib\monitoring\query.ts`

**Replacements**: 5

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.warn(` → `logger.warn(`
5. `console.error(` → `logger.error(`


---

### `src\lib\monitoring\reporter.ts`

**Replacements**: 30

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 20 more replacements

---

### `src\lib\monitoring\storage\database.storage.ts`

**Replacements**: 13

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.error(` → `logger.error(`
5. `console.warn(` → `logger.warn(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.error(` → `logger.error(`

... and 3 more replacements

---

### `src\lib\monitoring\StructuredLogger.ts`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\lib\monitoring\telemetry.ts`

**Replacements**: 11

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 1 more replacements

---

### `src\lib\monitoring\tracing\workflow-tracer.ts`

**Replacements**: 6

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.warn(` → `logger.warn(`
4. `console.warn(` → `logger.warn(`
5. `console.warn(` → `logger.warn(`
6. `console.log(` → `logger.info(`


---

### `src\lib\monitoring\webhook-monitor.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\lib\monitoring\website-checker.ts`

**Replacements**: 24

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 14 more replacements

---

### `src\lib\monitoring\workflows\workflow-executor.ts`

**Replacements**: 35

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 25 more replacements

---

### `src\lib\notifications\notification-service.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\lib\payment\paypal.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`


---

### `src\lib\payments\paypal\paypal.service.ts`

**Replacements**: 12

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.error(` → `logger.error(`
10. `console.error(` → `logger.error(`

... and 2 more replacements

---

### `src\lib\payments\paypal\webhook.handler.ts`

**Replacements**: 12

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.warn(` → `logger.warn(`
4. `console.warn(` → `logger.warn(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.warn(` → `logger.warn(`
9. `console.log(` → `logger.info(`
10. `console.warn(` → `logger.warn(`

... and 2 more replacements

---

### `src\lib\payments\stripe\3d-secure.service.ts`

**Replacements**: 6

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`


---

### `src\lib\performance\gpu-processor.ts`

**Replacements**: 39

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 29 more replacements

---

### `src\lib\queue\email.queue.ts`

**Replacements**: 28

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 18 more replacements

---

### `src\lib\queue\notification.queue.ts`

**Replacements**: 7

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`


---

### `src\lib\rbac\index.ts`

**Replacements**: 1

1. `console.log(` → `logger.info(`


---

### `src\lib\realtime\socket-server.ts`

**Replacements**: 19

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.warn(` → `logger.warn(`
5. `console.log(` → `logger.info(`
6. `console.warn(` → `logger.warn(`
7. `console.log(` → `logger.info(`
8. `console.warn(` → `logger.warn(`
9. `console.log(` → `logger.info(`
10. `console.warn(` → `logger.warn(`

... and 9 more replacements

---

### `src\lib\repositories\base.repository.ts`

**Replacements**: 4

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`


---

### `src\lib\security\csp.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\lib\security\rate-limiter.ts`

**Replacements**: 3

1. `console.log(` → `logger.info(`
2. `console.warn(` → `logger.warn(`
3. `console.error(` → `logger.error(`


---

### `src\lib\services\base.service.ts`

**Replacements**: 3

1. `console.log(` → `logger.info(`
2. `console.warn(` → `logger.warn(`
3. `console.error(` → `logger.error(`


---

### `src\lib\services\cart.service.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\lib\services\checkout.service.ts`

**Replacements**: 1

1. `console.error(` → `logger.error(`


---

### `src\lib\services\notification.service.ts`

**Replacements**: 14

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.warn(` → `logger.warn(`
9. `console.error(` → `logger.error(`
10. `console.log(` → `logger.info(`

... and 4 more replacements

---

### `src\lib\services\push.service.ts`

**Replacements**: 21

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.error(` → `logger.error(`
5. `console.log(` → `logger.info(`
6. `console.warn(` → `logger.warn(`
7. `console.log(` → `logger.info(`
8. `console.error(` → `logger.error(`
9. `console.error(` → `logger.error(`
10. `console.error(` → `logger.error(`

... and 11 more replacements

---

### `src\lib\services\sms.service.ts`

**Replacements**: 8

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.warn(` → `logger.warn(`


---

### `src\lib\services\stripe.service.ts`

**Replacements**: 16

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.error(` → `logger.error(`
10. `console.error(` → `logger.error(`

... and 6 more replacements

---

### `src\lib\services\webhook-event.service.ts`

**Replacements**: 10

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.error(` → `logger.error(`
5. `console.error(` → `logger.error(`
6. `console.error(` → `logger.error(`
7. `console.log(` → `logger.info(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`


---

### `src\lib\stores\cart.store.ts`

**Replacements**: 2

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`


---

### `src\lib\stripe\client.ts`

**Replacements**: 3

1. `console.error(` → `logger.error(`
2. `console.error(` → `logger.error(`
3. `console.warn(` → `logger.warn(`


---

### `src\lib\telemetry\azure-insights.ts`

**Replacements**: 5

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.warn(` → `logger.warn(`


---

### `src\lib\telemetry\config.ts`

**Replacements**: 9

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.warn(` → `logger.warn(`
9. `console.log(` → `logger.info(`


---

### `src\lib\tracing\instrumentation.ts`

**Replacements**: 9

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.error(` → `logger.error(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.log(` → `logger.info(`


---

### `src\lib\tracing\lazy-tracer.ts`

**Replacements**: 3

1. `console.warn(` → `logger.warn(`
2. `console.warn(` → `logger.warn(`
3. `console.warn(` → `logger.warn(`


---

### `src\lib\upload\file-upload-service.ts`

**Replacements**: 4

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.error(` → `logger.error(`
4. `console.log(` → `logger.info(`


---

### `src\lib\workers.disabled\email.worker.ts`

**Replacements**: 22

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 12 more replacements

---

### `src\lib\workers.disabled\index.ts`

**Replacements**: 31

1. `console.error(` → `logger.error(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.log(` → `logger.info(`
8. `console.log(` → `logger.info(`
9. `console.error(` → `logger.error(`
10. `console.error(` → `logger.error(`

... and 21 more replacements

---

### `src\lib\workers.disabled\push.worker.ts`

**Replacements**: 23

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 13 more replacements

---

### `src\lib\workers.disabled\sms.worker.ts`

**Replacements**: 23

1. `console.log(` → `logger.info(`
2. `console.log(` → `logger.info(`
3. `console.log(` → `logger.info(`
4. `console.log(` → `logger.info(`
5. `console.log(` → `logger.info(`
6. `console.log(` → `logger.info(`
7. `console.error(` → `logger.error(`
8. `console.error(` → `logger.error(`
9. `console.log(` → `logger.info(`
10. `console.log(` → `logger.info(`

... and 13 more replacements

---

### `src\proxy.ts`

**Replacements**: 6

1. `console.log(` → `logger.info(`
2. `console.error(` → `logger.error(`
3. `console.error(` → `logger.error(`
4. `console.warn(` → `logger.warn(`
5. `console.info(` → `logger.info(`
6. `console.debug(` → `logger.debug(`



---

## 📈 Migration Statistics by Method

- `console.log` → `logger.info`: 575 replacements
- `console.info` → `logger.info`: 1 replacements
- `console.warn` → `logger.warn`: 62 replacements
- `console.error` → `logger.error`: 331 replacements
- `console.debug` → `logger.debug`: 6 replacements



---

## 🎯 Next Steps


1. ✅ Review the changes above
2. ⚡ Run without `--dry-run` to apply changes:
   ```bash
   node scripts/migrate-console-logs.js
   ```
3. 🧪 Test the application thoroughly
4. 📝 Commit the changes


---

**Migration completed at**: 2026-01-06T19:43:38.550Z
