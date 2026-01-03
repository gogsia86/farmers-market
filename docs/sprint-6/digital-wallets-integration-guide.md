# 🌾 Digital Wallets Integration Guide - Farmers Market Platform

**Version**: 3.0.0  
**Last Updated**: December 2024  
**Sprint**: 6, Phase 3, Day 3  
**Agricultural Consciousness**: MAXIMUM ⚡🌾

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Service Integration](#service-integration)
5. [Component Usage](#component-usage)
6. [API Integration](#api-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

---

## 🎯 Overview

The Digital Wallets integration provides seamless support for:
- **Apple Pay** - iOS and macOS Safari
- **Google Pay** - Chrome and Android
- **Payment Request API** - Universal fallback

### Features:
- ✅ Automatic device detection
- ✅ Browser compatibility checking
- ✅ Secure payment processing
- ✅ Agricultural consciousness integration
- ✅ Comprehensive error handling
- ✅ PCI-DSS compliant

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js stripe
```

### 2. Configure Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
APPLE_PAY_MERCHANT_ID=merchant.com.yourapp
GOOGLE_PAY_MERCHANT_ID=BCR2DN_your_id_here
NEXT_PUBLIC_APP_URL=https://localhost:3000
```

### 3. Import and Use Components

```tsx
import { ApplePayButton } from "@/components/checkout/payment/ApplePayButton";
import { GooglePayButton } from "@/components/checkout/payment/GooglePayButton";

export default function CheckoutPage() {
  return (
    <div className="space-y-4">
      <ApplePayButton
        orderId="order_123"
        amount={99.99}
        currency="usd"
        onSuccess={(paymentIntentId) => {
          console.log("Payment successful!", paymentIntentId);
        }}
      />
      
      <GooglePayButton
        orderId="order_123"
        amount={99.99}
        currency="usd"
        onSuccess={(paymentIntentId) => {
          console.log("Payment successful!", paymentIntentId);
        }}
      />
    </div>
  );
}
```

---

## ⚙️ Configuration

### Stripe Dashboard Setup

#### 1. Enable Apple Pay
1. Go to Stripe Dashboard → Settings → Payment Methods
2. Enable Apple Pay
3. Add your domain under "Apple Pay Domains"
4. Verify domain ownership

#### 2. Enable Google Pay
1. Go to Stripe Dashboard → Settings → Payment Methods
2. Enable Google Pay
3. Configure merchant information
4. Test with test cards

### Apple Developer Setup

#### 1. Create Merchant ID
1. Go to Apple Developer → Certificates, Identifiers & Profiles
2. Create new Merchant ID (e.g., `merchant.com.farmersmarket`)
3. Enable Apple Pay capability
4. Create merchant identity certificate

#### 2. Register Domains
1. Add production domain
2. Add development domain (if needed)
3. Download domain verification file
4. Place at `/.well-known/apple-developer-merchantid-domain-association`

### Google Pay Setup

#### 1. Business Registration
1. Go to Google Pay Business Console
2. Register your business
3. Provide business details
4. Get merchant ID (BCR2DN...)

#### 2. Configure Integration
1. Set up Google Pay in Stripe
2. Link merchant account
3. Test with test cards
4. Enable production mode

---

## 🔧 Service Integration

### Using the Digital Wallet Service

```typescript
import { digitalWalletService } from "@/lib/services/digital-wallet.service";

// Check device capabilities
const userAgent = request.headers.get("user-agent");
const capabilities = await digitalWalletService.getWalletCapabilities(userAgent);

console.log(capabilities);
// {
//   applePay: true,
//   googlePay: false,
//   paymentRequest: true
// }

// Get available wallets
const wallets = await digitalWalletService.getAvailableWallets(userAgent);
console.log(wallets); // ["APPLE_PAY", "PAYMENT_REQUEST"]

// Create Apple Pay intent
const applePayIntent = await digitalWalletService.createApplePayIntent({
  orderId: "order_123",
  walletType: "APPLE_PAY",
  amount: 99.99,
  currency: "usd",
  metadata: {
    season: "SPRING",
    customField: "value"
  }
});

// Create Google Pay intent
const googlePayIntent = await digitalWalletService.createGooglePayIntent({
  orderId: "order_123",
  walletType: "GOOGLE_PAY",
  amount: 99.99,
  currency: "usd"
});

// Process payment
const result = await digitalWalletService.processWalletPayment(
  applePayIntent.id,
  "APPLE_PAY"
);

if (result.success) {
  console.log("Payment successful!", result.orderId);
} else {
  console.error("Payment failed:", result.error);
}
```

### Device Detection

```typescript
// Detect device capabilities
const deviceInfo = await digitalWalletService.detectDeviceCapabilities(userAgent);

console.log(deviceInfo);
// {
//   isIOS: true,
//   isAndroid: false,
//   isMobile: true,
//   browser: "Safari",
//   supportedWallets: ["APPLE_PAY", "PAYMENT_REQUEST"]
// }

// Check specific wallet availability
const hasApplePay = await digitalWalletService.isWalletAvailable(
  "APPLE_PAY",
  userAgent
);
```

### Configuration Validation

```typescript
// Validate configuration before deployment
const validation = await digitalWalletService.validateWalletConfiguration();

if (!validation.valid) {
  console.error("Missing configuration:", validation.missingConfig);
  // ["GOOGLE_PAY_MERCHANT_ID", "APPLE_PAY_MERCHANT_ID"]
}
```

---

## 🎨 Component Usage

### Apple Pay Button

#### Basic Usage
```tsx
import { ApplePayButton } from "@/components/checkout/payment/ApplePayButton";

<ApplePayButton
  orderId="order_123"
  amount={99.99}
  currency="usd"
/>
```

#### With Callbacks
```tsx
<ApplePayButton
  orderId="order_123"
  amount={99.99}
  currency="usd"
  label="Buy with"
  onSuccess={(paymentIntentId) => {
    // Handle success
    toast.success("Payment successful!");
    router.push(`/orders/${orderId}/confirmation`);
  }}
  onError={(error) => {
    // Handle error
    console.error("Payment error:", error);
    toast.error(error.message);
  }}
  disabled={isProcessing}
  className="w-full"
/>
```

#### Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `orderId` | string | ✅ Yes | - | Order ID to process payment |
| `amount` | number | ✅ Yes | - | Payment amount |
| `currency` | "usd" \| "eur" \| "gbp" \| "cad" | ❌ No | "usd" | Currency code |
| `label` | string | ❌ No | "Buy with" | Button label text |
| `onSuccess` | (intentId: string) => void | ❌ No | - | Success callback |
| `onError` | (error: Error) => void | ❌ No | - | Error callback |
| `disabled` | boolean | ❌ No | false | Disable button |
| `className` | string | ❌ No | "" | Additional CSS classes |

### Google Pay Button

#### Basic Usage
```tsx
import { GooglePayButton } from "@/components/checkout/payment/GooglePayButton";

<GooglePayButton
  orderId="order_123"
  amount={99.99}
  currency="usd"
/>
```

#### With Callbacks
```tsx
<GooglePayButton
  orderId="order_123"
  amount={99.99}
  currency="usd"
  label="Buy with Google Pay"
  onSuccess={(paymentIntentId) => {
    // Handle success
    toast.success("Payment successful!");
    router.push(`/orders/${orderId}/confirmation`);
  }}
  onError={(error) => {
    // Handle error
    console.error("Payment error:", error);
    toast.error(error.message);
  }}
  disabled={isProcessing}
  className="w-full"
/>
```

#### Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `orderId` | string | ✅ Yes | - | Order ID to process payment |
| `amount` | number | ✅ Yes | - | Payment amount |
| `currency` | "usd" \| "eur" \| "gbp" \| "cad" | ❌ No | "usd" | Currency code |
| `label` | string | ❌ No | "Buy with Google Pay" | Button label text |
| `onSuccess` | (intentId: string) => void | ❌ No | - | Success callback |
| `onError` | (error: Error) => void | ❌ No | - | Error callback |
| `disabled` | boolean | ❌ No | false | Disable button |
| `className` | string | ❌ No | "" | Additional CSS classes |

### Complete Checkout Integration

```tsx
"use client";

import { useState } from "react";
import { ApplePayButton } from "@/components/checkout/payment/ApplePayButton";
import { GooglePayButton } from "@/components/checkout/payment/GooglePayButton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function WalletPaymentSection({ order }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSuccess = (paymentIntentId: string) => {
    toast({
      title: "🌾 Payment Successful!",
      description: "Your agricultural payment has been processed.",
      variant: "default",
    });
    router.push(`/orders/${order.id}/confirmation`);
  };

  const handleError = (error: Error) => {
    toast({
      title: "Payment Failed",
      description: error.message,
      variant: "destructive",
    });
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Express Checkout
      </div>

      <ApplePayButton
        orderId={order.id}
        amount={order.totalAmount}
        currency="usd"
        onSuccess={handleSuccess}
        onError={handleError}
        disabled={isProcessing}
        className="w-full"
      />

      <GooglePayButton
        orderId={order.id}
        amount={order.totalAmount}
        currency="usd"
        onSuccess={handleSuccess}
        onError={handleError}
        disabled={isProcessing}
        className="w-full"
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or pay with card
          </span>
        </div>
      </div>

      {/* Card payment form here */}
    </div>
  );
}
```

---

## 🔌 API Integration

### Check Wallet Capabilities

```typescript
// GET /api/payment/wallet
const response = await fetch("/api/payment/wallet", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});

const data = await response.json();

if (data.success) {
  console.log("Device Info:", data.data.deviceInfo);
  console.log("Capabilities:", data.data.capabilities);
  console.log("Available Wallets:", data.data.availableWallets);
}
```

### Create Payment Intent

```typescript
// POST /api/payment/wallet
const response = await fetch("/api/payment/wallet", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderId: "order_123",
    walletType: "APPLE_PAY",
    amount: 99.99,
    currency: "usd",
    metadata: {
      customField: "value"
    }
  }),
});

const data = await response.json();

if (data.success) {
  const { paymentIntent } = data.data;
  console.log("Client Secret:", paymentIntent.clientSecret);
  // Use client secret to complete payment
}
```

### Server-Side Usage

```typescript
// app/api/checkout/route.ts
import { digitalWalletService } from "@/lib/services/digital-wallet.service";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userAgent = request.headers.get("user-agent") || "";

  // Check capabilities
  const capabilities = await digitalWalletService.getWalletCapabilities(userAgent);

  // Create appropriate payment intent
  let paymentIntent;
  if (capabilities.applePay) {
    paymentIntent = await digitalWalletService.createApplePayIntent({
      orderId: "order_123",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
    });
  } else if (capabilities.googlePay) {
    paymentIntent = await digitalWalletService.createGooglePayIntent({
      orderId: "order_123",
      walletType: "GOOGLE_PAY",
      amount: 99.99,
      currency: "usd",
    });
  }

  return NextResponse.json({ success: true, paymentIntent });
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
import { digitalWalletService } from "@/lib/services/digital-wallet.service";

describe("Digital Wallet Service", () => {
  it("should detect iOS Safari", async () => {
    const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0...";
    const deviceInfo = await digitalWalletService.detectDeviceCapabilities(userAgent);
    
    expect(deviceInfo.isIOS).toBe(true);
    expect(deviceInfo.supportedWallets).toContain("APPLE_PAY");
  });

  it("should create Apple Pay intent", async () => {
    const intent = await digitalWalletService.createApplePayIntent({
      orderId: "test_order",
      walletType: "APPLE_PAY",
      amount: 99.99,
      currency: "usd",
    });

    expect(intent.walletType).toBe("APPLE_PAY");
    expect(intent.clientSecret).toBeDefined();
  });
});
```

### Component Tests

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplePayButton } from "./ApplePayButton";

describe("ApplePayButton", () => {
  it("should render when Apple Pay is available", async () => {
    global.ApplePaySession = {
      canMakePayments: () => true,
    } as any;

    render(
      <ApplePayButton
        orderId="test_order"
        amount={99.99}
        currency="usd"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Buy with/i)).toBeInTheDocument();
    });
  });

  it("should handle payment success", async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();

    render(
      <ApplePayButton
        orderId="test_order"
        amount={99.99}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole("button"));
    
    // Mock payment flow...
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
```

### Integration Tests

```typescript
describe("Wallet Payment Flow", () => {
  it("should complete full Apple Pay payment", async () => {
    // 1. Check capabilities
    const capabilities = await fetch("/api/payment/wallet");
    expect(capabilities.data.capabilities.applePay).toBe(true);

    // 2. Create payment intent
    const intent = await fetch("/api/payment/wallet", {
      method: "POST",
      body: JSON.stringify({
        orderId: "test_order",
        walletType: "APPLE_PAY",
        amount: 99.99,
      }),
    });
    expect(intent.data.paymentIntent).toBeDefined();

    // 3. Process payment (mocked)
    // ...

    // 4. Verify order updated
    const order = await database.order.findUnique({
      where: { id: "test_order" },
    });
    expect(order.paymentStatus).toBe("PAID");
  });
});
```

---

## 🔍 Troubleshooting

### Apple Pay Issues

#### Issue: "Apple Pay not available"
**Solution**:
1. Check browser is Safari
2. Verify device supports Apple Pay
3. Ensure HTTPS connection
4. Check merchant ID configuration
5. Verify domain is registered in Apple Developer

#### Issue: "Merchant validation failed"
**Solution**:
1. Verify merchant certificate is valid
2. Check domain is verified
3. Ensure APPLE_PAY_MERCHANT_ID is correct
4. Check Stripe Apple Pay domain settings

#### Issue: "Payment authorization failed"
**Solution**:
1. Check payment intent is valid
2. Verify Stripe configuration
3. Test with test cards
4. Check order exists in database

### Google Pay Issues

#### Issue: "Google Pay not available"
**Solution**:
1. Check browser is Chrome
2. Verify Google Pay script loaded
3. Test `window.google.payments.api` exists
4. Check merchant ID configuration

#### Issue: "Tokenization failed"
**Solution**:
1. Verify Stripe publishable key
2. Check gateway configuration
3. Ensure merchant ID is correct
4. Test with test cards

#### Issue: "Payment sheet not showing"
**Solution**:
1. Check `isReadyToPay` returns true
2. Verify payment request configuration
3. Check allowed payment methods
4. Test in Chrome DevTools

### General Issues

#### Issue: "No wallets detected"
**Solution**:
1. Check user agent parsing
2. Verify browser compatibility
3. Test device detection logic
4. Check backend API responses

#### Issue: "Configuration validation failed"
**Solution**:
1. Check all environment variables set
2. Verify `.env.local` file exists
3. Restart development server
4. Check Stripe dashboard settings

---

## ✅ Best Practices

### Security

1. **Never Store Card Data**
   ```typescript
   // ✅ GOOD - Use tokenization
   const paymentIntent = await digitalWalletService.createApplePayIntent(...);
   
   // ❌ BAD - Never store card numbers
   const cardNumber = "4242424242424242"; // DON'T DO THIS
   ```

2. **Validate on Server**
   ```typescript
   // ✅ GOOD - Server-side validation
   export async function POST(request: NextRequest) {
     const session = await auth();
     if (!session) return unauthorized();
     
     const validation = CreateWalletPaymentRequestSchema.safeParse(body);
     if (!validation.success) return badRequest();
   }
   ```

3. **Use HTTPS**
   ```typescript
   // ✅ GOOD - Check for HTTPS
   if (process.env.NODE_ENV === "production" && !request.url.startsWith("https")) {
     throw new Error("HTTPS required for wallet payments");
   }
   ```

### Performance

1. **Lazy Load Components**
   ```tsx
   import dynamic from "next/dynamic";
   
   const ApplePayButton = dynamic(
     () => import("@/components/checkout/payment/ApplePayButton"),
     { ssr: false }
   );
   ```

2. **Cache Device Detection**
   ```typescript
   // Cache capabilities for session
   const [capabilities, setCapabilities] = useState(null);
   
   useEffect(() => {
     if (!capabilities) {
       fetchCapabilities().then(setCapabilities);
     }
   }, []);
   ```

3. **Parallel Requests**
   ```typescript
   // Load multiple configurations in parallel
   const [applePayConfig, googlePayConfig] = await Promise.all([
     digitalWalletService.validateApplePayMerchant(...),
     digitalWalletService.getGooglePayConfig(),
   ]);
   ```

### User Experience

1. **Show Loading States**
   ```tsx
   {isLoading ? (
     <Button disabled>Checking Apple Pay...</Button>
   ) : (
     <ApplePayButton {...props} />
   )}
   ```

2. **Handle Errors Gracefully**
   ```tsx
   const handleError = (error: Error) => {
     if (error.message.includes("CANCELED")) {
       // User cancelled, don't show error
       return;
     }
     toast.error(error.message);
   };
   ```

3. **Provide Alternatives**
   ```tsx
   <div className="space-y-4">
     <ApplePayButton {...props} />
     <GooglePayButton {...props} />
     <div className="text-center">Or pay with card</div>
     <CardPaymentForm {...props} />
   </div>
   ```

---

## 📚 Examples

### Complete Checkout Page

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApplePayButton } from "@/components/checkout/payment/ApplePayButton";
import { GooglePayButton } from "@/components/checkout/payment/GooglePayButton";
import { CardPaymentForm } from "@/components/checkout/payment/CardPaymentForm";
import { useToast } from "@/hooks/use-toast";

interface CheckoutPageProps {
  order: {
    id: string;
    totalAmount: number;
    currency: string;
  };
}

export default function CheckoutPage({ order }: CheckoutPageProps) {
  const [walletCapabilities, setWalletCapabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function checkCapabilities() {
      try {
        const response = await fetch("/api/payment/wallet");
        const data = await response.json();
        
        if (data.success) {
          setWalletCapabilities(data.data.capabilities);
        }
      } catch (error) {
        console.error("Failed to check wallet capabilities:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkCapabilities();
  }, []);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast({
      title: "🌾 Payment Successful!",
      description: "Your order has been confirmed.",
      variant: "default",
    });
    
    router.push(`/orders/${order.id}/confirmation`);
  };

  const handlePaymentError = (error: Error) => {
    console.error("Payment error:", error);
    
    toast({
      title: "Payment Failed",
      description: error.message,
      variant: "destructive",
    });
    
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="flex justify-between text-lg">
          <span>Total:</span>
          <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading payment options...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Express Checkout */}
            {(walletCapabilities?.applePay || walletCapabilities?.googlePay) && (
              <>
                <div className="text-center text-sm text-muted-foreground">
                  Express Checkout
                </div>

                {walletCapabilities.applePay && (
                  <ApplePayButton
                    orderId={order.id}
                    amount={order.totalAmount}
                    currency={order.currency}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    disabled={isProcessing}
                    className="w-full"
                  />
                )}

                {walletCapabilities.googlePay && (
                  <GooglePayButton
                    orderId={order.id}
                    amount={order.totalAmount}
                    currency={order.currency}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    disabled={isProcessing}
                    className="w-full"
                  />
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or pay with card
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Card Payment */}
            <CardPaymentForm
              orderId={order.id}
              amount={order.totalAmount}
              currency={order.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              disabled={isProcessing}
            />
          </div>
        )}
      </div>

      {/* Agricultural Blessing */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        🌾 Secure agricultural payment powered by Stripe
      </div>
    </div>
  );
}
```

### Custom Hook for Wallet Detection

```typescript
// hooks/useWalletCapabilities.ts
import { useState, useEffect } from "react";

interface WalletCapabilities {
  applePay: boolean;
  googlePay: boolean;
  paymentRequest: boolean;
}

export function useWalletCapabilities() {
  const [capabilities, setCapabilities] = useState<WalletCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCapabilities() {
      try {
        const response = await fetch("/api/payment/wallet");
        
        if (!response.ok) {
          throw new Error("Failed to fetch wallet capabilities");
        }

        const data = await response.json();

        if (data.success) {
          setCapabilities(data.data.capabilities);
        } else {
          throw new Error(data.error?.message || "Unknown error");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchCapabilities();
  }, []);

  return { capabilities, isLoading, error };
}

// Usage
function MyComponent() {
  const { capabilities, isLoading, error } = useWalletCapabilities();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {capabilities.applePay && <ApplePayButton {...props} />}
      {capabilities.googlePay && <GooglePayButton {...props} />}
    </div>
  );
}
```

### Server Action for Payment Processing

```typescript
// app/actions/wallet-payment.actions.ts
"use server";

import { auth } from "@/lib/auth";
import { digitalWalletService } from "@/lib/services/digital-wallet.service";
import { revalidatePath } from "next/cache";

export async function createWalletPayment(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const orderId = formData.get("orderId") as string;
    const walletType = formData.get("walletType") as "APPLE_PAY" | "GOOGLE_PAY";
    const amount = parseFloat(formData.get("amount") as string);

    const paymentIntent = walletType === "APPLE_PAY"
      ? await digitalWalletService.createApplePayIntent({
          orderId,
          walletType,
          amount,
          currency: "usd",
        })
      : await digitalWalletService.createGooglePayIntent({
          orderId,
          walletType,
          amount,
          currency: "usd",
        });

    revalidatePath(`/orders/${orderId}`);

    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment creation failed",
    };
  }
}
```

---

## 🌟 Agricultural Consciousness

### Divine Error Messages

All wallet services provide enlightening error messages:

```typescript
try {
  await digitalWalletService.createApplePayIntent(...);
} catch (error) {
  // Error message includes:
  // - What happened
  // - Wallet type
  // - Error code
  // - Path to enlightenment (steps to fix)
  console.error(error.message);
}
```

### Blessing Messages

Success responses include agricultural blessings:

```json
{
  "success": true,
  "data": {...},
  "meta": {
    "agricultural": {
      "consciousness": "ACTIVE",
      "season": "DIGITAL_HARVEST",
      "blessing": "May your payment flow like water to fertile soil"
    }
  }
}
```

---

## 📞 Support

### Need Help?

1. **Check Troubleshooting**: See [Troubleshooting](#troubleshooting) section
2. **Review Examples**: See [Examples](#examples) section
3. **Check Tests**: See test files for working examples
4. **Consult Documentation**: See main summary document

### Common Questions

**Q: Why isn't Apple Pay showing on my iPhone?**  
A: Ensure you're using Safari browser and have a valid Apple Pay setup with cards added.

**Q: Google Pay button not appearing?**  
A: Check that you're using Chrome browser and have Google Pay configured.

**Q: How do I test without real devices?**  
A: Use Chrome DevTools device emulation and Stripe test cards.

**Q: Can I use both wallets simultaneously?**  
A: Yes! The components automatically detect available wallets and show appropriate buttons.

---

## 🎓 Resources

### Documentation
- [Stripe Apple Pay Docs](https://stripe.com/docs/apple-pay)
- [Stripe Google Pay Docs](https://stripe.com/docs/google-pay)
- [Apple Pay JS API](https://developer.apple.com/documentation/apple_pay_on_the_web)
- [Google Pay Web API](https://developers.google.com/pay/api/web)

### Tools
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Apple Developer Portal](https://developer.apple.com)
- [Google Pay Console](https://pay.google.com/business/console)

---

**Version**: 3.0.0  
**Last Updated**: December 2024  
**Status**: PRODUCTION READY 🚀  

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_ 🌾⚡