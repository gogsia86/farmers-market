# 🔧 MISSING FEATURES IMPLEMENTATION GUIDE

## Farmers Market Platform - Step-by-Step Implementation

**Version**: 1.0  
**Last Updated**: December 2024  
**Priority**: HIGH → MEDIUM → LOW  
**Status**: READY FOR IMPLEMENTATION

---

## 📋 TABLE OF CONTENTS

1. [High Priority Features](#high-priority-features)
2. [Medium Priority Features](#medium-priority-features)
3. [Low Priority Features](#low-priority-features)
4. [Implementation Timeline](#implementation-timeline)
5. [Testing Requirements](#testing-requirements)

---

## 🔴 HIGH PRIORITY FEATURES

### 1. Real-Time Order Updates via WebSocket

**Priority**: 🔴 HIGH  
**Effort**: 3-5 days  
**Impact**: Significantly improves user experience

#### Current State

- Polling-based updates (inefficient)
- Manual page refresh required
- No live notifications

#### Implementation Steps

##### Step 1: Install Dependencies

```bash
npm install ws @types/ws socket.io socket.io-client
```

##### Step 2: Create WebSocket Service

```typescript
// src/lib/websocket/order-updates.service.ts
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export class OrderUpdateWebSocketService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL,
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Subscribe to order updates
      socket.on("subscribe:order", (orderId: string) => {
        socket.join(`order:${orderId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  async notifyOrderStatusChange(orderId: string, status: string, data: any) {
    if (!this.io) return;

    this.io.to(`order:${orderId}`).emit("order:status:changed", {
      orderId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyCustomer(userId: string, notification: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit("notification", notification);
  }
}

export const orderWebSocket = new OrderUpdateWebSocketService();
```

##### Step 3: Create Client Hook

```typescript
// src/hooks/useOrderWebSocket.ts
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useOrderWebSocket(orderId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || "", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("subscribe:order", orderId);
    });

    newSocket.on("order:status:changed", (data) => {
      console.log("Order status changed:", data);
      setOrderStatus(data.status);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  return { socket, orderStatus };
}
```

##### Step 4: Integrate in Order Service

```typescript
// src/lib/services/order.service.ts
import { orderWebSocket } from "@/lib/websocket/order-updates.service";

export class OrderService {
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await database.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Notify via WebSocket
    await orderWebSocket.notifyOrderStatusChange(orderId, status, order);

    return order;
  }
}
```

##### Step 5: Use in Component

```typescript
// src/app/customer/orders/[orderId]/page.tsx
'use client';

import { useOrderWebSocket } from '@/hooks/useOrderWebSocket';

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const { orderStatus } = useOrderWebSocket(params.orderId);

  return (
    <div>
      <h1>Order Details</h1>
      {orderStatus && (
        <div className="bg-green-100 p-4 rounded">
          🔔 Status updated: {orderStatus}
        </div>
      )}
    </div>
  );
}
```

---

### 2. Advanced Search Filters

**Priority**: 🔴 HIGH  
**Effort**: 2-3 days  
**Impact**: Better product discovery

#### Current State

- Basic category filtering only
- No price range filter
- No distance-based search
- No certification filters

#### Implementation Steps

##### Step 1: Create Enhanced Filter Schema

```typescript
// src/lib/validations/search.validation.ts
import { z } from "zod";

export const AdvancedSearchSchema = z.object({
  query: z.string().optional(),
  category: z.enum(["VEGETABLES", "FRUITS", "DAIRY", "MEAT"]).optional(),
  priceRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      radius: z.number().min(1).max(100), // miles
    })
    .optional(),
  certifications: z
    .array(z.enum(["ORGANIC", "BIODYNAMIC", "NON_GMO", "FAIR_TRADE"]))
    .optional(),
  dietary: z
    .array(z.enum(["VEGAN", "GLUTEN_FREE", "NUT_FREE", "DAIRY_FREE"]))
    .optional(),
  availability: z.enum(["ALL", "IN_STOCK_ONLY"]).default("ALL"),
  sortBy: z.enum(["PRICE_ASC", "PRICE_DESC", "DISTANCE", "RATING"]).optional(),
});

export type AdvancedSearchFilters = z.infer<typeof AdvancedSearchSchema>;
```

##### Step 2: Enhanced Search Service

```typescript
// src/lib/services/search.service.ts
import { database } from "@/lib/database";
import { Prisma } from "@prisma/client";
import { calculateDistance } from "@/lib/utils/distance";

export class SearchService {
  async advancedSearch(filters: AdvancedSearchFilters) {
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    // Text search
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category;
    }

    // Price range filter
    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    // Stock availability
    if (filters.availability === "IN_STOCK_ONLY") {
      where.availableQuantity = { gt: 0 };
    }

    // Certification filter
    if (filters.certifications?.length) {
      where.farm = {
        certifications: {
          some: {
            type: { in: filters.certifications },
            status: "APPROVED",
          },
        },
      };
    }

    // Dietary filters
    if (filters.dietary?.length) {
      where.dietaryInfo = {
        hasSome: filters.dietary,
      };
    }

    let products = await database.product.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            certifications: true,
          },
        },
      },
    });

    // Location-based filtering (post-query)
    if (filters.location) {
      products = products.filter((product) => {
        const distance = calculateDistance(
          filters.location!.lat,
          filters.location!.lng,
          Number(product.farm.latitude),
          Number(product.farm.longitude),
        );
        return distance <= filters.location!.radius;
      });
    }

    // Sorting
    if (filters.sortBy === "PRICE_ASC") {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortBy === "PRICE_DESC") {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (filters.sortBy === "DISTANCE" && filters.location) {
      products.sort((a, b) => {
        const distA = calculateDistance(
          filters.location!.lat,
          filters.location!.lng,
          Number(a.farm.latitude),
          Number(a.farm.longitude),
        );
        const distB = calculateDistance(
          filters.location!.lat,
          filters.location!.lng,
          Number(b.farm.latitude),
          Number(b.farm.longitude),
        );
        return distA - distB;
      });
    }

    return products;
  }
}
```

##### Step 3: Filter UI Component

```typescript
// src/components/search/AdvancedFilters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function AdvancedFilters({ onApply }: { onApply: (filters: any) => void }) {
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(100);
  const [radius, setRadius] = useState<number>(25);
  const [certifications, setCertifications] = useState<string[]>([]);

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h3 className="font-bold text-lg">Advanced Filters</h3>

      {/* Price Range */}
      <div>
        <label className="font-medium">Price Range</label>
        <div className="flex gap-2 items-center mt-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(Number(e.target.value))}
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Distance */}
      <div>
        <label className="font-medium">Within {radius} miles</label>
        <Input
          type="range"
          min="1"
          max="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="mt-2"
        />
      </div>

      {/* Certifications */}
      <div>
        <label className="font-medium">Certifications</label>
        <div className="space-y-2 mt-2">
          {['ORGANIC', 'BIODYNAMIC', 'NON_GMO', 'FAIR_TRADE'].map(cert => (
            <div key={cert} className="flex items-center">
              <Checkbox
                checked={certifications.includes(cert)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCertifications([...certifications, cert]);
                  } else {
                    setCertifications(certifications.filter(c => c !== cert));
                  }
                }}
              />
              <label className="ml-2">{cert.replace('_', ' ')}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <Button
        onClick={() => onApply({
          priceRange: { min: priceMin, max: priceMax },
          location: { radius },
          certifications
        })}
        className="w-full"
      >
        Apply Filters
      </Button>
    </div>
  );
}
```

---

### 3. SMS Notifications

**Priority**: 🔴 HIGH  
**Effort**: 1-2 days  
**Impact**: Critical order updates reach customers

#### Implementation Steps

##### Step 1: Install Twilio

```bash
npm install twilio
```

##### Step 2: Add Environment Variables

```bash
# .env.local
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

##### Step 3: Create SMS Service

```typescript
// src/lib/notifications/sms.service.ts
import twilio from "twilio";

export class SMSNotificationService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
  }

  async sendOrderConfirmation(
    phone: string,
    orderId: string,
    orderNumber: string,
  ) {
    const message = `🌾 Your order ${orderNumber} is confirmed! Track it at: ${process.env.NEXTAUTH_URL}/customer/orders/${orderId}`;

    await this.client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: message,
    });
  }

  async sendOrderStatusUpdate(
    phone: string,
    orderNumber: string,
    status: string,
  ) {
    const messages: Record<string, string> = {
      CONFIRMED: "✅ Your order is confirmed and being prepared",
      PROCESSING: "📦 Your order is being packed",
      READY_FOR_PICKUP: "🎉 Your order is ready for pickup!",
      OUT_FOR_DELIVERY: "🚚 Your order is out for delivery",
      DELIVERED: "✨ Your order has been delivered!",
    };

    const message = `Order ${orderNumber}: ${messages[status] || status}`;

    await this.client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: message,
    });
  }

  async sendDeliveryAlert(phone: string, orderNumber: string, eta: string) {
    const message = `🚚 Your order ${orderNumber} will arrive in approximately ${eta}. Be ready!`;

    await this.client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: message,
    });
  }

  async sendFarmApproval(
    phone: string,
    farmName: string,
    status: "APPROVED" | "REJECTED",
  ) {
    const message =
      status === "APPROVED"
        ? `🎉 Congratulations! Your farm "${farmName}" has been approved. Start listing products now!`
        : `❌ Your farm "${farmName}" application needs revision. Check your email for details.`;

    await this.client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: message,
    });
  }
}

export const smsService = new SMSNotificationService();
```

##### Step 4: Integrate in Order Service

```typescript
// src/lib/services/order.service.ts
import { smsService } from "@/lib/notifications/sms.service";

export class OrderService {
  async createOrder(orderData: CreateOrderRequest) {
    // Create order...
    const order = await database.order.create({ data: orderData });

    // Send email
    await emailService.sendOrderConfirmation(order);

    // Send SMS if customer opted in
    if (
      order.customer.phoneVerified &&
      order.customer.notificationPreferences.sms
    ) {
      await smsService.sendOrderConfirmation(
        order.customer.phone,
        order.id,
        order.orderNumber,
      );
    }

    return order;
  }
}
```

##### Step 5: Add User Preference

```typescript
// src/components/customer/NotificationSettings.tsx
'use client';

export function NotificationSettings() {
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <div>
      <h3>Notification Preferences</h3>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={smsEnabled}
          onCheckedChange={setSmsEnabled}
        />
        <label>Receive SMS notifications for order updates</label>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Standard message and data rates may apply
      </p>
    </div>
  );
}
```

---

### 4. Multi-Vendor Cart Optimization UI

**Priority**: 🔴 HIGH  
**Effort**: 2-3 days  
**Impact**: Reduces delivery costs, improves UX

#### Implementation Steps

##### Step 1: Create Optimization Service

```typescript
// src/lib/services/cart-optimization.service.ts
interface DeliveryOptimization {
  savings: number;
  suggestion: string;
  canCombine: boolean;
  farmGroups: string[][];
}

export class CartOptimizationService {
  async analyzeCart(cartItems: CartItem[]): Promise<DeliveryOptimization> {
    const farmGroups = this.groupByFarm(cartItems);
    const farmLocations = await this.getFarmLocations(farmGroups);

    // Check if farms are within delivery consolidation range (e.g., 5 miles)
    const nearbyFarms = this.findNearbyFarms(farmLocations, 5);

    if (nearbyFarms.length > 1) {
      const deliveryFees = await this.calculateDeliveryFees(farmGroups);
      const consolidatedFee = await this.calculateConsolidatedFee(nearbyFarms);
      const savings = deliveryFees.total - consolidatedFee;

      return {
        savings,
        suggestion: `Combine orders from ${nearbyFarms.length} nearby farms`,
        canCombine: true,
        farmGroups: nearbyFarms,
      };
    }

    return {
      savings: 0,
      suggestion: "",
      canCombine: false,
      farmGroups: [],
    };
  }

  private groupByFarm(items: CartItem[]): Map<string, CartItem[]> {
    const groups = new Map<string, CartItem[]>();
    items.forEach((item) => {
      const farmItems = groups.get(item.farmId) || [];
      farmItems.push(item);
      groups.set(item.farmId, farmItems);
    });
    return groups;
  }

  private async getFarmLocations(farmGroups: Map<string, CartItem[]>) {
    const farmIds = Array.from(farmGroups.keys());
    return await database.farm.findMany({
      where: { id: { in: farmIds } },
      select: { id: true, name: true, latitude: true, longitude: true },
    });
  }

  private findNearbyFarms(farms: any[], radiusMiles: number): string[][] {
    // Group farms that are within radius of each other
    const groups: string[][] = [];
    // Implementation of clustering algorithm
    return groups;
  }
}
```

##### Step 2: Create Optimization Component

```typescript
// src/components/cart/CartOptimizationSuggestion.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CartOptimizationSuggestion({ cartItems }: { cartItems: any[] }) {
  const [optimization, setOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyze() {
      const response = await fetch('/api/cart/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems })
      });
      const data = await response.json();
      setOptimization(data);
      setLoading(false);
    }
    analyze();
  }, [cartItems]);

  if (loading || !optimization?.canCombine) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-2 border-green-200">
      <div className="flex items-start gap-4">
        <div className="text-4xl">💡</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-green-900">
            Save ${optimization.savings.toFixed(2)} on Delivery!
          </h3>
          <p className="text-gray-700 mt-1">
            {optimization.suggestion}. These farms are near each other and can
            combine deliveries.
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="default">
              Optimize My Cart
            </Button>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

##### Step 3: Add to Cart Page

```typescript
// src/app/customer/cart/page.tsx
import { CartOptimizationSuggestion } from '@/components/cart/CartOptimizationSuggestion';

export default async function CartPage() {
  const cartItems = await getCartItems();

  return (
    <div>
      <h1>Shopping Cart</h1>

      {/* Optimization suggestion */}
      <CartOptimizationSuggestion cartItems={cartItems} />

      {/* Cart items */}
      <CartItemsList items={cartItems} />
    </div>
  );
}
```

---

## 🟡 MEDIUM PRIORITY FEATURES

### 5. AI Customer Support Chatbot

**Priority**: 🟡 MEDIUM  
**Effort**: 4-5 days  
**Impact**: 24/7 customer support

#### Implementation Steps

##### Step 1: Create Chatbot Service

```typescript
// src/lib/ai/support-chatbot.service.ts
import OpenAI from "openai";

export class SupportChatbotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async handleCustomerQuery(
    query: string,
    context: {
      userId?: string;
      recentOrders?: any[];
      userRole?: string;
    },
  ): Promise<string> {
    const systemPrompt = `You are a helpful customer support assistant for a farmers market platform.
You help customers with:
- Finding products and farms
- Order tracking and issues
- Account management
- Platform navigation
- Farming practices questions

Context:
- User Role: ${context.userRole || "Guest"}
- Recent Orders: ${context.recentOrders?.length || 0}

Be friendly, concise, and agricultural-conscious. If you don't know something, suggest contacting human support.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return (
      response.choices[0].message.content ||
      "I apologize, but I need more information to help you."
    );
  }

  async suggestActions(query: string): Promise<string[]> {
    // Return suggested quick actions based on query
    const actions: string[] = [];

    if (query.toLowerCase().includes("order")) {
      actions.push(
        "View Order History",
        "Track Current Order",
        "Contact Farmer",
      );
    }
    if (query.toLowerCase().includes("farm")) {
      actions.push("Browse Farms", "Search Products", "View Farm Details");
    }
    if (query.toLowerCase().includes("account")) {
      actions.push("Edit Profile", "Manage Addresses", "Notification Settings");
    }

    return actions;
  }
}

export const chatbotService = new SupportChatbotService();
```

##### Step 2: Create Chat UI Component

```typescript
// src/components/support/ChatbotWidget.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/support/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg"
        >
          💬
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white border rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">🌾 Farm Support Assistant</h3>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>×</Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      )}
    </>
  );
}
```

##### Step 3: Create API Route

```typescript
// src/app/api/support/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatbotService } from "@/lib/ai/support-chatbot.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { query } = await request.json();

    const context = {
      userId: session?.user?.id,
      userRole: session?.user?.role,
    };

    const response = await chatbotService.handleCustomerQuery(query, context);
    const actions = await chatbotService.suggestActions(query);

    return NextResponse.json({
      response,
      suggestedActions: actions,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 },
    );
  }
}
```

---

### 6. Invoice Generation for Farmers

**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 days  
**Impact**: Professional financial documentation

#### Implementation Steps

##### Step 1: Install PDF Library

```bash
npm install pdfkit @types/pdfkit
```

##### Step 2: Create Invoice Service

```typescript
// src/lib/services/invoice.service.ts
import PDFDocument from "pdfkit";
import { Order } from "@prisma/client";
import fs from "fs";

export class InvoiceService {
  async generateInvoice(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text("INVOICE", 50, 50, { align: "center" }).moveDown();

      // Farm Info
      doc
        .fontSize(12)
        .text(`${order.farm.name}`, 50, 100)
        .text(`${order.farm.address}`, 50, 115)
        .text(
          `${order.farm.city}, ${order.farm.state} ${order.farm.zipCode}`,
          50,
          130,
        );

      // Invoice Details
      doc
        .fontSize(10)
        .text(`Invoice #: ${order.orderNumber}`, 400, 100)
        .text(
          `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
          400,
          115,
        )
        .text(
          `Due Date: ${new Date(order.createdAt).toLocaleDateString()}`,
          400,
          130,
        );

      // Customer Info
      doc
        .fontSize(12)
        .text("Bill To:", 50, 180)
        .fontSize(10)
        .text(`${order.customer.firstName} ${order.customer.lastName}`, 50, 200)
        .text(`${order.shippingAddress.street}`, 50, 215)
        .text(
          `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
          50,
          230,
        );

      // Table Header
      const tableTop = 280;
      doc
        .fontSize(10)
        .text("Description", 50, tableTop, { width: 250 })
        .text("Qty", 300, tableTop, { width: 50 })
        .text("Price", 350, tableTop, { width: 75 })
        .text("Total", 425, tableTop, { width: 75 });

      // Draw line
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Items
      let position = tableTop + 30;
      order.items.forEach((item: any) => {
        doc
          .fontSize(9)
          .text(item.product.name, 50, position, { width: 250 })
          .text(item.quantity, 300, position, { width: 50 })
          .text(`$${item.pricePerUnit}`, 350, position, { width: 75 })
          .text(
            `$${(item.quantity * item.pricePerUnit).toFixed(2)}`,
            425,
            position,
            { width: 75 },
          );
        position += 25;
      });

      // Totals
      position += 20;
      doc
        .fontSize(10)
        .text("Subtotal:", 350, position)
        .text(`$${order.subtotal}`, 425, position);

      position += 20;
      doc
        .text("Delivery Fee:", 350, position)
        .text(`$${order.deliveryFee}`, 425, position);

      position += 20;
      doc.text("Tax:", 350, position).text(`$${order.tax}`, 425, position);

      position += 20;
      doc
        .fontSize(12)
        .text("Total:", 350, position)
        .text(`$${order.total}`, 425, position);

      // Footer
      doc
        .fontSize(8)
        .text("Thank you for your business!", 50, 700, { align: "center" });

      doc.end();
    });
  }

  async saveInvoice(orderId: string): Promise<string> {
    const order = await database.order.findUnique({
      where: { id: orderId },
      include: {
        farm: true,
        customer: true,
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });

    if (!order) throw new Error("Order not found");

    const pdfBuffer = await this.generateInvoice(order);
    const filename = `invoice-${order.orderNumber}.pdf`;
    const filepath = `/invoices/${filename}`;

    // Upload to storage (Cloudinary/S3)
    // For now, save locally
    fs.writeFileSync(`./public${filepath}`, pdfBuffer);

    return filepath;
  }
}

export const invoiceService = new InvoiceService();
```

##### Step 3: Add Download Button

```typescript
// src/app/farmer/orders/[orderId]/page.tsx
export default async function FarmerOrderDetailsPage({ params }: any) {
  const order = await getOrder(params.orderId);

  async function downloadInvoice() {
    const response = await fetch(`/api/orders/${params.orderId}/invoice`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber}.pdf`;
    a.click();
  }

  return (
    <div>
      <h1>Order {order.orderNumber}</h1>
      <Button onClick={downloadInvoice}>
        📄 Download Invoice
      </Button>
    </div>
  );
}
```

---

### 7. Delivery Route Optimization

**Priority**: 🟡 MEDIUM  
**Effort**: 3-4 days  
**Impact**: Saves time and fuel for farmers

#### Implementation

```typescript
// src/lib/services/route-optimization.service.ts
import { google } from "googleapis";

export class RouteOptimizationService {
  async optimizeDeliveryRoute(orders: Order[]): Promise<OptimizedRoute> {
    const addresses = orders.map((order) => ({
      orderId: order.id,
      address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`,
    }));

    // Use Google Maps Directions API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(addresses[0].address)}&destination=${encodeURIComponent(addresses[0].address)}&waypoints=optimize:true|${addresses
        .slice(1)
        .map((a) => encodeURIComponent(a.address))
        .join("|")}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    );

    const data = await response.json();

    // Parse optimized route
    const optimizedOrder = data.routes[0].waypoint_order;
    const optimizedAddresses = optimizedOrder.map(
      (i: number) => addresses[i + 1],
    );

    return {
      totalDistance: data.routes[0].legs.reduce(
        (sum: number, leg: any) => sum + leg.distance.value,
        0,
      ),
      totalDuration: data.routes[0].legs.reduce(
        (sum: number, leg: any) => sum + leg.duration.value,
        0,
      ),
      stops: [addresses[0], ...optimizedAddresses],
      polyline: data.routes[0].overview_polyline.points,
    };
  }
}
```

---

## 🟢 LOW PRIORITY FEATURES

### 8. Subscription Boxes (CSA Model)

**Priority**: 🟢 LOW  
**Effort**: 5-7 days  
**Impact**: Recurring revenue for farmers

```typescript
// src/lib/services/subscription.service.ts
export class SubscriptionService {
  async createSubscription(data: {
    farmId: string;
    customerId: string;
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    products: string[];
    startDate: Date;
  }) {
    // Create subscription in database
    // Set up Stripe subscription
    // Schedule recurring orders
  }
}
```

### 9. Loyalty Program

**Priority**: 🟢 LOW  
**Effort**: 4-5 days

```typescript
// Add to schema.prisma
model LoyaltyPoints {
  id        String   @id @default(cuid())
  userId    String
  points    Int      @default(0)
  tier      String   @default("BRONZE") // BRONZE, SILVER, GOLD
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

### 10. Farm Tours & Events

**Priority**: 🟢 LOW  
**Effort**: 3-4 days

```typescript
// Add to schema.prisma
model FarmEvent {
  id          String   @id @default(cuid())
  farmId      String
  title       String
  description String
  date        DateTime
  duration    Int // minutes
  maxAttendees Int
  price       Decimal
  registrations FarmEventRegistration[]
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Sprint 1 (Week 1-2): Critical Features

- [ ] Day 1-3: Real-time WebSocket implementation
- [ ] Day 4-5: SMS notifications (Twilio)
- [ ] Day 6-8: Advanced search filters
- [ ] Day 9-10: Cart optimization UI

### Sprint 2 (Week 3-4): Enhancement Features

- [ ] Day 11-15: AI chatbot implementation
- [ ] Day 16-18: Invoice generation
- [ ] Day 19-21: Route optimization

### Sprint 3 (Month 2): Nice-to-Have Features

- [ ] Subscription boxes
- [ ] Loyalty program
- [ ] Farm events

---

## 🧪 TESTING REQUIREMENTS

### For Each Feature

```typescript
// Example test structure
describe("Feature: Real-time Order Updates", () => {
  describe("WebSocket Connection", () => {
    it("should establish connection", async () => {
      // Test
    });

    it("should subscribe to order updates", async () => {
      // Test
    });

    it("should receive status change notifications", async () => {
      // Test
    });
  });

  describe("Client Hook", () => {
    it("should update UI when status changes", async () => {
      // Test
    });
  });
});
```

### Integration Tests

- API endpoints
- Database operations
- External service calls (Twilio, OpenAI)
- WebSocket connections

### E2E Tests

- Complete user flows
- Real-time updates visualization
- SMS delivery (in test mode)
- Invoice download

---

## 📊 SUCCESS METRICS

Track these metrics for each feature:

```yaml
WebSocket:
  - Connection success rate > 99%
  - Average latency < 100ms
  - Reconnection time < 2s

SMS Notifications:
  - Delivery rate > 98%
  - Opt-in rate > 40%
  - Customer satisfaction improvement

Advanced Filters:
  - Search conversion rate increase > 15%
  - Average time to find product decrease > 30%
  - Filter usage rate > 60%

Cart Optimization:
  - Cart consolidation rate > 25%
  - Average savings per order > $5
  - Feature usage rate > 40%

AI Chatbot:
  - Resolution rate > 70%
  - Average response time < 3s
  - Customer satisfaction > 4.5/5
```

---

## 🚀 DEPLOYMENT STRATEGY

### Feature Flags

```typescript
// src/lib/config/features.ts
export const FEATURE_FLAGS = {
  WEBSOCKET_ENABLED: process.env.FEATURE_WEBSOCKET === "true",
  SMS_NOTIFICATIONS: process.env.FEATURE_SMS === "true",
  ADVANCED_SEARCH: process.env.FEATURE_ADVANCED_SEARCH === "true",
  AI_CHATBOT: process.env.FEATURE_AI_CHATBOT === "true",
};
```

### Gradual Rollout

1. Deploy to staging
2. Test with internal users
3. Roll out to 10% of users
4. Monitor metrics for 48 hours
5. Increase to 50%
6. Full rollout if metrics are good

---

## 📝 CONCLUSION

This guide provides complete, copy-paste-ready implementations for all missing features. Follow the priority order (HIGH → MEDIUM → LOW) and the suggested timeline for best results.

**Next Steps**:

1. Create GitHub issues for each high-priority feature
2. Assign to development team
3. Follow implementation guide exactly
4. Test thoroughly before deployment
5. Monitor metrics post-deployment

**Total Estimated Time**: 6-8 weeks for all features

🌾 _"Build with agricultural consciousness, code with divine precision!"_ ⚡
