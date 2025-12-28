# 🎨 Frontend Integration Guide - ServiceResponse Pattern

**Project:** Farmers Market Platform  
**Audience:** Frontend Developers (Web & Mobile)  
**Version:** 1.0  
**Last Updated:** November 15, 2024

---

## 📋 Overview

This guide provides comprehensive instructions for integrating the newly refactored backend APIs that use the **ServiceResponse** pattern. All API endpoints now return a consistent, type-safe response structure.

---

## 🎯 What Changed

### Before (Old Pattern)

```typescript
// ❌ OLD - Inconsistent response structure
const response = await fetch('/api/checkout/create-order', {
  method: 'POST',
  body: JSON.stringify(orderData)
});

const order = await response.json(); // Direct data return
// Sometimes: { id, status, ... }
// Sometimes: { error: "..." }
// Sometimes: null
// Inconsistent and unpredictable!
```

### After (New Pattern)

```typescript
// ✅ NEW - Consistent ServiceResponse structure
const response = await fetch('/api/checkout/create-order', {
  method: 'POST',
  body: JSON.stringify(orderData)
});

const result = await response.json();

if (!result.success) {
  // Handle error
  console.error(result.error);
  return;
}

// Use data
const order = result.order;
```

---

## 📐 ServiceResponse Structure

### Type Definition

```typescript
/**
 * All API endpoints return this structure
 */
interface APIResponse<T = any> {
  success: boolean;
  data?: T;           // Present only if success: true
  error?: string;     // Present only if success: false
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

// Error response
interface ErrorResponse {
  success: false;
  error: string;
  meta?: ResponseMeta;
}
```

### Example Responses

**Success:**
```json
{
  "success": true,
  "order": {
    "id": "order_123",
    "orderNumber": "FM-20241115-ABC123",
    "status": "PENDING",
    "total": 49.99
  },
  "meta": {
    "timestamp": "2024-11-15T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Cart is empty. Please add items before checkout.",
  "meta": {
    "timestamp": "2024-11-15T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

---

## 🔧 Implementation Guide

### Step 1: Create API Client Types

```typescript
// types/api.ts

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  timestamp?: string;
  requestId?: string;
  pagination?: PaginationMeta;
  cached?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Checkout types
export interface CheckoutSession {
  userId: string;
  cartSummary: {
    items: CartItem[];
    subtotal: number;
    itemCount: number;
    farmCount: number;
  };
  fulfillmentMethod: string;
}

export interface OrderPreview {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  platformFee: number;
  total: number;
  items: OrderItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}
```

### Step 2: Create Base API Client

```typescript
// lib/api/client.ts

export class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      // Check for success field
      if (!data.success) {
        throw new APIError(
          data.error || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        error instanceof Error ? error.message : 'Network error',
        0,
        null
      );
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Custom error class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Export singleton instance
export const apiClient = new APIClient();
```

### Step 3: Create Service-Specific API Modules

```typescript
// lib/api/checkout.ts

import { apiClient, APIResponse } from './client';
import type { Order, PaymentIntent, CheckoutSession } from '@/types/api';

export const checkoutAPI = {
  /**
   * Initialize checkout session
   */
  async initializeCheckout(): Promise<APIResponse<CheckoutSession>> {
    return apiClient.post('/checkout/initialize');
  },

  /**
   * Get checkout status
   */
  async getCheckoutStatus(): Promise<APIResponse<{ 
    hasActiveCart: boolean;
    cartItemCount: number;
    canCheckout: boolean;
    issues: string[];
  }>> {
    return apiClient.get('/checkout/create-order');
  },

  /**
   * Create payment intent
   */
  async createPaymentIntent(amount: number): Promise<APIResponse<PaymentIntent>> {
    return apiClient.post('/checkout/create-payment-intent', { amount });
  },

  /**
   * Create order from checkout
   */
  async createOrder(orderData: {
    shippingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    shippingAddressId?: string;
    fulfillmentMethod: 'DELIVERY' | 'FARM_PICKUP' | 'MARKET_PICKUP';
    deliveryInstructions?: string;
    specialInstructions?: string;
    stripePaymentIntentId?: string;
  }): Promise<APIResponse<Order>> {
    return apiClient.post('/checkout/create-order', orderData);
  },
};
```

```typescript
// lib/api/cart.ts

import { apiClient, APIResponse } from './client';
import type { Cart, CartItem } from '@/types/api';

export const cartAPI = {
  /**
   * Get user's cart
   */
  async getCart(): Promise<APIResponse<Cart>> {
    return apiClient.get('/cart');
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity: number): Promise<APIResponse<Cart>> {
    return apiClient.post('/cart', { productId, quantity });
  },

  /**
   * Update item quantity
   */
  async updateItem(productId: string, quantity: number): Promise<APIResponse<Cart>> {
    return apiClient.put('/cart', { productId, quantity });
  },

  /**
   * Remove item from cart
   */
  async removeItem(productId: string): Promise<APIResponse<Cart>> {
    return apiClient.delete(`/cart?productId=${productId}`);
  },

  /**
   * Validate cart
   */
  async validateCart(): Promise<APIResponse<{
    valid: boolean;
    issues: Array<{ itemId: string; message: string }>;
  }>> {
    return apiClient.post('/cart/validate');
  },

  /**
   * Clear cart
   */
  async clearCart(): Promise<APIResponse<{ success: boolean }>> {
    return apiClient.delete('/cart/clear');
  },
};
```

### Step 4: Create React Hooks

```typescript
// hooks/useCheckout.ts

import { useState } from 'react';
import { checkoutAPI } from '@/lib/api/checkout';
import { APIError } from '@/lib/api/client';
import type { Order, PaymentIntent } from '@/types/api';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (amount: number): Promise<PaymentIntent | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await checkoutAPI.createPaymentIntent(amount);
      return response.paymentIntent;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to create payment intent';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: any): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await checkoutAPI.createOrder(orderData);
      return response.order;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to create order';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCheckoutStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await checkoutAPI.getCheckoutStatus();
      return response.status;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to get checkout status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPaymentIntent,
    createOrder,
    getCheckoutStatus,
  };
}
```

```typescript
// hooks/useCart.ts

import { useState, useCallback } from 'react';
import { cartAPI } from '@/lib/api/cart';
import { APIError } from '@/lib/api/client';
import type { Cart } from '@/types/api';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cartAPI.getCart();
      setCart(response.cart);
      return response.cart;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to fetch cart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (productId: string, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cartAPI.addItem(productId, quantity);
      setCart(response.cart);
      return response.cart;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to add item to cart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId: string, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cartAPI.updateItem(productId, quantity);
      setCart(response.cart);
      return response.cart;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to update cart item';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cartAPI.removeItem(productId);
      setCart(response.cart);
      return response.cart;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to remove item from cart';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
  };
}
```

### Step 5: Update Components

```tsx
// components/CheckoutFlow.tsx

import { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/hooks/useCart';

export function CheckoutFlow() {
  const { createPaymentIntent, createOrder, loading, error } = useCheckout();
  const { cart } = useCart();
  const [step, setStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [orderResult, setOrderResult] = useState(null);

  const handleCheckout = async () => {
    // Step 1: Create payment intent
    const paymentIntent = await createPaymentIntent(cart.total);
    if (!paymentIntent) {
      // Error handled by hook
      return;
    }

    setStep('payment');

    // Step 2: Process payment with Stripe
    // ... Stripe Elements code ...

    // Step 3: Create order after payment confirmation
    const order = await createOrder({
      shippingAddress: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'US',
      },
      fulfillmentMethod: 'DELIVERY',
      stripePaymentIntentId: paymentIntent.id,
    });

    if (order) {
      setOrderResult(order);
      setStep('confirmation');
    }
  };

  if (loading) {
    return <div>Processing...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="checkout-flow">
      {step === 'review' && (
        <div>
          <h2>Review Order</h2>
          {/* Cart review UI */}
          <button onClick={handleCheckout}>Proceed to Payment</button>
        </div>
      )}

      {step === 'payment' && (
        <div>
          <h2>Payment</h2>
          {/* Stripe Elements UI */}
        </div>
      )}

      {step === 'confirmation' && orderResult && (
        <div>
          <h2>Order Confirmed!</h2>
          <p>Order Number: {orderResult.orderNumber}</p>
          <p>Total: ${orderResult.total}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📱 React Native / Mobile Implementation

```typescript
// mobile/services/api.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = 'https://api.farmersmarket.com';
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Checkout methods
  async createOrder(orderData: any) {
    return this.request('/api/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getCart() {
    return this.request('/api/cart', { method: 'GET' });
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }
}

export const api = new APIClient();
```

```typescript
// mobile/hooks/useCheckout.ts

import { useState } from 'react';
import { api } from '../services/api';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.createOrder(orderData);
      return response.order;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}
```

---

## 🔍 Error Handling Best Practices

### Display User-Friendly Errors

```typescript
// utils/errorMessages.ts

export function getUserFriendlyError(error: string): string {
  const errorMap: Record<string, string> = {
    'Cart is empty': 'Please add items to your cart before checking out.',
    'VALIDATION_ERROR': 'Please check your information and try again.',
    'PAYMENT_FAILED': 'Payment could not be processed. Please try a different payment method.',
    'OUT_OF_STOCK': 'Some items in your cart are no longer available.',
    'AUTHENTICATION_REQUIRED': 'Please sign in to continue.',
  };

  return errorMap[error] || 'An unexpected error occurred. Please try again.';
}
```

### Error Boundary Component

```tsx
// components/ErrorBoundary.tsx

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🧪 Testing

### API Client Tests

```typescript
// __tests__/api/checkout.test.ts

import { checkoutAPI } from '@/lib/api/checkout';

// Mock fetch
global.fetch = jest.fn();

describe('Checkout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create payment intent successfully', async () => {
    const mockResponse = {
      success: true,
      paymentIntent: {
        id: 'pi_123',
        clientSecret: 'secret_123',
        amount: 49.99,
        currency: 'usd',
        status: 'requires_payment_method',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await checkoutAPI.createPaymentIntent(49.99);

    expect(result.success).toBe(true);
    expect(result.paymentIntent.id).toBe('pi_123');
  });

  it('should handle error response', async () => {
    const mockError = {
      success: false,
      error: 'Cart is empty',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    });

    await expect(checkoutAPI.createPaymentIntent(0)).rejects.toThrow('Cart is empty');
  });
});
```

### Hook Tests

```typescript
// __tests__/hooks/useCheckout.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { useCheckout } from '@/hooks/useCheckout';
import { checkoutAPI } from '@/lib/api/checkout';

jest.mock('@/lib/api/checkout');

describe('useCheckout', () => {
  it('should create order successfully', async () => {
    const mockOrder = {
      id: 'order_123',
      orderNumber: 'FM-20241115-ABC',
      status: 'PENDING',
      total: 49.99,
    };

    (checkoutAPI.createOrder as jest.Mock).mockResolvedValueOnce({
      success: true,
      order: mockOrder,
    });

    const { result } = renderHook(() => useCheckout());

    let order;
    await act(async () => {
      order = await result.current.createOrder({
        fulfillmentMethod: 'DELIVERY',
      });
    });

    expect(order).toEqual(mockOrder);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
```

---

## 📋 Migration Checklist

### For Each Component/Page

- [ ] Identify API calls that need updating
- [ ] Update to use new API client
- [ ] Add error handling for `success: false` responses
- [ ] Update type definitions to match ServiceResponse
- [ ] Test success scenarios
- [ ] Test error scenarios
- [ ] Add loading states
- [ ] Update user-facing error messages
- [ ] Add unit tests
- [ ] Add integration tests

### Priority Order

1. **Critical Flows** (Do First)
   - [ ] Checkout flow
   - [ ] Cart operations
   - [ ] Authentication
   - [ ] Payment processing

2. **High Priority**
   - [ ] Product catalog
   - [ ] Farm listings
   - [ ] Order history
   - [ ] User profile

3. **Medium Priority**
   - [ ] Search
   - [ ] Filters
   - [ ] Reviews
   - [ ] Notifications

---

## 🚨 Common Pitfalls

### 1. Forgetting to Check `success` Field

```typescript
// ❌ WRONG - Assumes success
const response = await fetch('/api/cart');
const cart = await response.json();
console.log(cart.items); // May be undefined!

// ✅ CORRECT - Check success first
const response = await fetch('/api/cart');
const result = await response.json();
if (!result.success) {
  console.error(result.error);
  return;
}
console.log(result.cart.items);
```

### 2. Not Handling Errors

```typescript
// ❌ WRONG - No error handling
const order = await createOrder(data);
showConfirmation(order);

// ✅ CORRECT - Handle errors
try {
  const order = await createOrder(data);
  if (order) {
    showConfirmation(order);
  } else {
    showError('Failed to create order');
  }
} catch (error) {
  showError(error.message);
}
```

### 3. Accessing Wrong Field Names

```typescript
// ❌ WRONG - Old field names
const result = await checkoutAPI.createOrder(data);
const orderId = result.data.id; // 'data' doesn't exist in response

// ✅ CORRECT - Check response structure
const result = await checkoutAPI.createOrder(data);
const orderId = result.order.id; // 'order' is the correct field
```

---

## 📞 Support & Resources

### Documentation
- [Backend API Docs](./API_DOCUMENTATION.md)
- [ServiceResponse Reference](./SERVICE_RESPONSE_QUICK_REFERENCE.md)
- [Integration Tests](./INTEGRATION_TEST_SCENARIOS.md)

### Code Examples
- [API Client Implementation](./lib/api/client.ts)
- [React Hooks Examples](./hooks/)
- [Component Examples](./components/)

### Team Contacts
- **Backend Team:** backend@farmersmarket.com
- **Frontend Lead:** frontend-lead@farmersmarket.com
- **Slack Channel:** #frontend-api-integration

---

## ✅ Ready to Integrate

Follow this guide step-by-step, starting with the critical flows. Test thoroughly in development before deploying to production.

**Questions?** Reach out to the backend team in #frontend-api-integration.

---

**Version:** 1.0  
**Status:** ✅ Ready for Use  
**Last Updated:** November 15, 2024