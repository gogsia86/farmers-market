# 🚀 Stripe Payment Setup Guide

## **Environment Variables Configuration**

To complete the payment integration, you need to add your Stripe API keys to the `.env` file.

### **1. Get Your Stripe Keys**

1. **Sign up/Login to Stripe**: Visit [<https://stripe.com](https://stripe.co>m)
2. **Navigate to Developers → API Keys**
3. **Copy your keys**:
   - **Publishable Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)

### **2. Update Environment Variables**

Replace the placeholder values in your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_actual_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_stripe_publishable_key_here"
```

### **3. Test Payment Flow**

1. **Start the development server**: `npm run dev`
2. **Add products to cart**
3. **Go to checkout**: `/shop/checkout`
4. **Use Stripe test card numbers**:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`

### **4. Security Notes**

- ✅ **Never commit real secret keys to git**
- ✅ **Use test keys for development**
- ✅ **Store production keys securely**
- ✅ **Environment variables are properly configured**

---

## **🎉 Ready to Process Payments!**

Once you've added your Stripe keys, the complete e-commerce flow will be operational:

**Cart → Checkout → Payment → Order Confirmation → Order History**

**Divine Status**: ✅ **PAYMENT SYSTEM READY**
