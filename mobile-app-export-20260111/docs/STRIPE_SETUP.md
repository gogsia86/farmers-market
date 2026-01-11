# 💳 Stripe Integration Setup Guide

## Farmers Market Mobile App - Payment Integration

This guide covers the complete setup for Stripe payment integration in the Farmers Market mobile app.

---

## 📋 Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Expo CLI**: Ensure you have Expo CLI installed
3. **Development Environment**: iOS Simulator/Android Emulator or physical device

---

## 🔧 Installation

### Step 1: Install Stripe SDK

The Stripe React Native SDK has already been added to `package.json`. Run:

```bash
npm install
# or
yarn install
```

### Step 2: Configure Expo Plugin

The Expo plugin is already configured in `package.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.farmersmarket",
          "enableGooglePay": true
        }
      ]
    ]
  }
}
```

### Step 3: Rebuild the App

For iOS:

```bash
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios
```

For Android:

```bash
npx expo prebuild --platform android
npx expo run:android
```

---

## 🔑 Environment Variables

Create or update your `.env` file:

```env
# Stripe Keys
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Apple Pay (iOS only)
EXPO_PUBLIC_APPLE_MERCHANT_ID=merchant.com.farmersmarket
```

### Getting Your Keys

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

⚠️ **Important**: Never commit secret keys to version control!

---

## 🏗️ Architecture Overview

### Provider Setup

The `StripePaymentProvider` wraps the app and provides:

- Payment sheet initialization
- Card tokenization
- Payment method management
- Secure payment processing

```tsx
// App.tsx
import { StripePaymentProvider } from "./src/providers/StripeProvider";

export default function App() {
  return (
    <StripePaymentProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.farmersmarket"
    >
      {/* Your app content */}
    </StripePaymentProvider>
  );
}
```

### Hooks Available

#### `useStripePayment()`

Main hook for Stripe operations:

```tsx
const {
  isInitialized,
  isLoading,
  error,
  createPaymentIntent,
  initializePaymentSheet,
  presentPaymentSheet,
  confirmPayment,
  savedPaymentMethods,
  fetchSavedPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
} = useStripePayment();
```

#### `useStripeCheckout()`

High-level hook for complete checkout flow:

```tsx
const {
  processCheckout,
  quickCheckout,
  validateCheckout,
  step,
  isProcessing,
  error,
  orderId,
} = useStripeCheckout();
```

---

## 💻 Usage Examples

### Basic Payment Flow

```tsx
import { useStripeCheckout } from "@/hooks/useStripeCheckout";

function CheckoutScreen() {
  const { processCheckout, isProcessing, error } = useStripeCheckout();

  const handleCheckout = async () => {
    const result = await processCheckout(
      {
        items: cartItems,
        shippingAddress: selectedAddress,
        deliveryMethod: "DELIVERY",
      },
      {
        subtotal: 29.99,
        tax: 2.4,
        deliveryFee: 5.99,
        discount: 0,
        total: 38.38,
      },
    );

    if (result.success) {
      navigation.navigate("OrderConfirmation", { orderId: result.orderId });
    } else {
      Alert.alert("Payment Failed", result.error);
    }
  };

  return (
    <Button
      title="Place Order"
      onPress={handleCheckout}
      disabled={isProcessing}
    />
  );
}
```

### Adding a Payment Method

```tsx
import { useStripePayment } from "@/providers/StripeProvider";

function AddPaymentMethodScreen() {
  const { createPaymentMethod, addPaymentMethod } = useStripePayment();

  const handleAddCard = async (cardDetails) => {
    // Create payment method with Stripe
    const result = await createPaymentMethod(cardDetails);

    if (result) {
      // Save to user's account
      await addPaymentMethod(result.paymentMethodId);
      navigation.goBack();
    }
  };
}
```

### Using Saved Payment Methods

```tsx
const { savedPaymentMethods, fetchSavedPaymentMethods } = useStripePayment();

useEffect(() => {
  fetchSavedPaymentMethods();
}, []);

// Display in a list
{
  savedPaymentMethods.map((method) => (
    <PaymentMethodCard
      key={method.id}
      brand={method.brand}
      last4={method.last4}
      expiry={`${method.expMonth}/${method.expYear}`}
    />
  ));
}
```

---

## 🖥️ Server-Side Setup

### Payment Intent Endpoint

The server needs an endpoint to create payment intents:

```typescript
// src/app/api/checkout/create-payment-intent/route.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { amount, metadata } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount), // Amount in cents
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata,
  });

  return NextResponse.json({
    success: true,
    paymentIntent: {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    },
  });
}
```

### Webhook Handler

Handle Stripe events for payment status updates:

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailure(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

---

## 🧪 Testing

### Test Card Numbers

| Card Number        | Description        |
| ------------------ | ------------------ |
| `4242424242424242` | Successful payment |
| `4000000000000002` | Declined card      |
| `4000002500003155` | Requires 3D Secure |
| `4000000000009995` | Insufficient funds |
| `4000000000000069` | Expired card       |
| `4000000000000127` | Incorrect CVC      |

### Running E2E Tests

```bash
# From project root
npm run test:e2e
```

### Testing Webhooks Locally

Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🍎 Apple Pay Setup (iOS)

### 1. Apple Developer Account

1. Create a Merchant ID in Apple Developer Console
2. Configure payment processing certificate
3. Add merchant ID to Xcode capabilities

### 2. Xcode Configuration

In `ios/FarmersMarket.xcodeproj`:

1. Open **Signing & Capabilities**
2. Add **Apple Pay** capability
3. Select your merchant ID

### 3. Testing on Simulator

Apple Pay works on iOS Simulator in test mode.

---

## 🤖 Google Pay Setup (Android)

### 1. Enable Google Pay

Already enabled via the Expo plugin configuration.

### 2. Testing

Google Pay requires a physical device or the Google Pay test suite.

---

## 🔒 Security Best Practices

1. **Never log card details** - All card data should be tokenized by Stripe
2. **Use HTTPS** - All API calls must be over HTTPS
3. **Validate on server** - Always validate payment amounts server-side
4. **Implement webhooks** - Don't rely solely on client confirmations
5. **Store tokens, not cards** - Use Stripe payment methods, not raw card data
6. **Use idempotency keys** - Prevent duplicate charges

---

## 🐛 Troubleshooting

### "Stripe not initialized"

Ensure `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly.

### Payment sheet not appearing

1. Check that `initializePaymentSheet` completed successfully
2. Verify the payment intent client secret is valid
3. Ensure the app has been rebuilt after adding the plugin

### Apple Pay not working

1. Verify merchant ID matches in Xcode and Stripe dashboard
2. Ensure payment processing certificate is valid
3. Check device region supports Apple Pay

### Webhook signature verification fails

1. Ensure you're using the raw request body
2. Verify the webhook secret matches
3. Check that the signing secret is from the correct webhook endpoint

---

## 📚 Additional Resources

- [Stripe React Native Documentation](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Expo Stripe Plugin](https://docs.expo.dev/versions/latest/sdk/stripe/)
- [Apple Pay Integration Guide](https://stripe.com/docs/apple-pay)
- [Google Pay Integration Guide](https://stripe.com/docs/google-pay)
- [Testing Stripe Payments](https://stripe.com/docs/testing)

---

## 📞 Support

For issues with:

- **Stripe SDK**: Check [Stripe Support](https://support.stripe.com/)
- **Expo Plugin**: Check [Expo Discord](https://chat.expo.dev/)
- **This Implementation**: Create an issue in the project repository

---

_Last Updated: November 2024_
_Stripe SDK Version: 0.38.6_
