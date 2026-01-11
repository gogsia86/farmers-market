# 🚀 Farmers Market Platform - Final API Reference

## Notification, Webhook & Admin Panel Endpoints

**Version**: 1.0
**Last Updated**: November 2024
**Base URL**: `/api`

---

## 📋 Table of Contents

1. [Notification APIs](#notification-apis)
2. [Webhook APIs](#webhook-apis)
3. [Admin Panel APIs](#admin-panel-apis)
4. [Authentication](#authentication)
5. [Response Formats](#response-formats)
6. [Error Codes](#error-codes)

---

## 🔔 Notification APIs

### Get User Notifications

```http
GET /api/notifications
```

**Query Parameters**:

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `unreadOnly` (boolean, default: false) - Filter unread only
- `type` (NotificationType, optional) - Filter by notification type

**Notification Types**:

- `ORDER_PLACED`
- `ORDER_CONFIRMED`
- `ORDER_READY`
- `ORDER_FULFILLED`
- `ORDER_CANCELLED`
- `PAYMENT_RECEIVED`
- `PAYOUT_PROCESSED`
- `NEW_MESSAGE`
- `REVIEW_RECEIVED`
- `QUALITY_ISSUE`
- `LOW_STOCK`
- `SYSTEM_ANNOUNCEMENT`

**Response**:

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "clxxx123",
        "type": "ORDER_CONFIRMED",
        "channel": "IN_APP",
        "title": "Order confirmed",
        "body": "Your order #12345 has been confirmed.",
        "data": { "orderId": "...", "orderNumber": "12345" },
        "isRead": false,
        "readAt": null,
        "sentAt": "2024-11-15T10:30:00Z",
        "createdAt": "2024-11-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "unreadCount": 12
  }
}
```

---

### Mark Notification as Read

```http
PATCH /api/notifications/:id
```

**Body**:

```json
{
  "isRead": true
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "isRead": true
  }
}
```

---

### Delete Notification

```http
DELETE /api/notifications/:id
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "deleted": true
  }
}
```

---

### Clear Read Notifications

```http
DELETE /api/notifications
```

**Response**:

```json
{
  "success": true,
  "data": {
    "cleared": 15
  }
}
```

---

### Get Notification Preferences

```http
GET /api/notifications/preferences
```

**Response**:

```json
{
  "success": true,
  "data": {
    "emailEnabled": true,
    "emailFrequency": "immediate",
    "pushEnabled": true,
    "smsEnabled": false,
    "inAppEnabled": true,
    "orderUpdates": true,
    "reviewNotifications": true,
    "promotions": false,
    "systemAnnouncements": true
  }
}
```

---

### Update Notification Preferences

```http
PATCH /api/notifications/preferences
```

**Body**:

```json
{
  "emailEnabled": true,
  "emailFrequency": "daily",
  "pushEnabled": true,
  "orderUpdates": true,
  "promotions": false
}
```

**Email Frequencies**: `immediate`, `daily`, `weekly`, `never`

**Response**:

```json
{
  "success": true,
  "data": {
    "emailEnabled": true,
    "emailFrequency": "daily",
    "pushEnabled": true,
    "smsEnabled": false,
    "inAppEnabled": true,
    "orderUpdates": true,
    "reviewNotifications": true,
    "promotions": false,
    "systemAnnouncements": true
  }
}
```

---

## 🔗 Webhook APIs

### Stripe Webhook Handler

```http
POST /api/webhooks/stripe
```

**Headers**:

- `stripe-signature` (required) - Stripe webhook signature

**Events Handled**:

1. **payment_intent.succeeded**
   - Updates payment status to PAID
   - Updates order status to CONFIRMED
   - Sends customer confirmation
   - Notifies farm owner

2. **payment_intent.payment_failed**
   - Updates payment status to FAILED
   - Updates order status to CANCELLED
   - Notifies customer with failure reason

3. **charge.refunded**
   - Updates payment status (REFUNDED/PARTIALLY_REFUNDED)
   - Updates order status
   - Notifies customer of refund

4. **payment_intent.created**
   - Tracks payment intent creation
   - Updates payment status to PROCESSING

**Response**:

```json
{
  "received": true
}
```

**Security**: This endpoint validates webhook signatures using your `STRIPE_WEBHOOK_SECRET`.

---

## 👑 Admin Panel APIs

**Authentication Required**: All admin endpoints require `ADMIN` role.

---

### List Users

```http
GET /api/admin/users
```

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `role` (enum: CONSUMER, FARMER, ADMIN)
- `status` (enum: ACTIVE, SUSPENDED, DELETED)
- `search` (string) - Search by email or name
- `sortBy` (enum: createdAt, name, email, loginCount, default: createdAt)
- `sortOrder` (enum: asc, desc, default: desc)

**Response**:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "clxxx123",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "name": "John Doe",
        "role": "FARMER",
        "status": "ACTIVE",
        "emailVerified": true,
        "phoneVerified": false,
        "lastLoginAt": "2024-11-15T10:00:00Z",
        "loginCount": 42,
        "createdAt": "2024-01-15T10:00:00Z",
        "_count": {
          "orders": 15,
          "farms": 1,
          "reviews": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "stats": {
      "totalUsers": 150,
      "activeUsers": 142,
      "farmerCount": 28,
      "consumerCount": 120
    }
  }
}
```

---

### Update User

```http
PATCH /api/admin/users
```

**Body**:

```json
{
  "userId": "clxxx123",
  "role": "ADMIN",
  "status": "SUSPENDED",
  "suspensionReason": "Violation of community guidelines"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "status": "SUSPENDED"
  }
}
```

**Notes**:

- Cannot change your own admin role
- Logs all admin actions

---

### Bulk User Operations

```http
POST /api/admin/users
```

**Body**:

```json
{
  "operation": "suspend",
  "userIds": ["clxxx123", "clxxx456", "clxxx789"],
  "reason": "Spam accounts detected"
}
```

**Operations**:

- `suspend` - Suspend users
- `activate` - Activate suspended users
- `delete` - Mark users as deleted
- `promote` - Promote to ADMIN role
- `demote` - Demote to CONSUMER role

**Limits**:

- Max 100 users per operation
- Cannot operate on self

**Response**:

```json
{
  "success": true,
  "data": {
    "operation": "suspend",
    "affected": 3,
    "userIds": ["clxxx123", "clxxx456", "clxxx789"]
  }
}
```

---

### List Reviews (Moderation)

```http
GET /api/admin/reviews
```

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (enum: PENDING, APPROVED, FLAGGED, default: PENDING)
- `farmId` (string, optional)
- `productId` (string, optional)
- `sortBy` (enum: createdAt, rating, default: createdAt)
- `sortOrder` (enum: asc, desc, default: desc)

**Response**:

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "clxxx123",
        "rating": 5,
        "reviewText": "Amazing fresh produce!",
        "status": "PENDING",
        "createdAt": "2024-11-15T10:00:00Z",
        "customer": {
          "id": "clxxx456",
          "email": "customer@example.com",
          "name": "Jane Smith"
        },
        "product": {
          "id": "clxxx789",
          "name": "Organic Tomatoes",
          "farmId": "clxxx999"
        },
        "farm": {
          "id": "clxxx999",
          "name": "Green Valley Farm"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "stats": {
      "totalReviews": 450,
      "pendingCount": 45,
      "approvedCount": 385,
      "flaggedCount": 20
    }
  }
}
```

---

### Moderate Review

```http
PATCH /api/admin/reviews
```

**Body**:

```json
{
  "reviewId": "clxxx123",
  "action": "APPROVE",
  "reason": "Optional reason for rejection"
}
```

**Actions**:

- `APPROVE` - Approve review (visible to public)
- `REJECT` - Flag review (hidden from public)

**Response**:

```json
{
  "success": true,
  "data": {
    "review": {
      "id": "clxxx123",
      "status": "APPROVED",
      "moderatedBy": "clxxx_admin",
      "moderatedAt": "2024-11-15T10:30:00Z"
    },
    "action": "APPROVE"
  }
}
```

**Side Effects**:

- Sends notification to review author
- If approved, sends notification to farm owner

---

### Platform Analytics

```http
GET /api/admin/analytics
```

**Query Parameters**:

- `days` (number, default: 30) - Analysis period in days

**Response**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 125450.5,
      "recentRevenue": 15230.25,
      "revenueGrowth": 12.5,
      "totalOrders": 1248,
      "recentOrders": 156,
      "orderGrowth": 8.3,
      "avgOrderValue": 100.5
    },
    "users": {
      "total": 450,
      "active": 385,
      "newUsers": 42,
      "userGrowth": 10.2,
      "byRole": {
        "CONSUMER": 380,
        "FARMER": 65,
        "ADMIN": 5
      }
    },
    "farms": {
      "total": 65,
      "active": 58,
      "pending": 7,
      "newFarms": 5,
      "farmGrowth": 8.7,
      "topFarms": [
        {
          "id": "clxxx123",
          "name": "Green Valley Farm",
          "productCount": 45,
          "reviewCount": 128
        }
      ]
    },
    "products": {
      "total": 850,
      "active": 742,
      "newProducts": 38
    },
    "orders": {
      "total": 1248,
      "recent": 156,
      "byStatus": {
        "PENDING": 12,
        "CONFIRMED": 45,
        "FULFILLED": 856,
        "CANCELLED": 35
      },
      "recentOrders": [
        {
          "id": "clxxx123",
          "orderNumber": "ORD-12345",
          "status": "CONFIRMED",
          "totalPrice": 85.5,
          "createdAt": "2024-11-15T10:00:00Z",
          "customer": {
            "id": "clxxx456",
            "email": "customer@example.com",
            "name": "Jane Smith"
          }
        }
      ]
    },
    "payments": {
      "byStatus": {
        "PAID": {
          "count": 1150,
          "total": 125450.5
        },
        "PENDING": {
          "count": 25,
          "total": 2850.0
        },
        "FAILED": {
          "count": 15,
          "total": 1250.0
        }
      }
    },
    "reviews": {
      "total": 450,
      "pending": 45,
      "averageRating": 4.65
    },
    "recentActivity": [
      {
        "id": "clxxx123",
        "actionType": "USER_SUSPENDED",
        "targetType": "USER",
        "targetId": "clxxx456",
        "createdAt": "2024-11-15T09:45:00Z",
        "admin": {
          "id": "clxxx789",
          "email": "admin@example.com",
          "name": "Admin User"
        }
      }
    ],
    "period": {
      "days": 30,
      "startDate": "2024-10-16T00:00:00Z",
      "endDate": "2024-11-15T23:59:59Z"
    }
  }
}
```

---

### List All Orders (Admin)

```http
GET /api/admin/orders
```

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (OrderStatus, optional)
- `search` (string) - Search by order number or customer email
- `farmId` (string, optional)
- `customerId` (string, optional)
- `sortBy` (enum: createdAt, totalPrice, status, default: createdAt)
- `sortOrder` (enum: asc, desc, default: desc)

**Order Statuses**:

- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `FULFILLED`
- `COMPLETED`
- `CANCELLED`

**Response**:

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "clxxx123",
        "orderNumber": "ORD-12345",
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "subtotal": 75.0,
        "tax": 7.5,
        "deliveryFee": 5.0,
        "total": 87.5,
        "createdAt": "2024-11-15T10:00:00Z",
        "paidAt": "2024-11-15T10:05:00Z",
        "customer": {
          "id": "clxxx456",
          "email": "customer@example.com",
          "name": "Jane Smith"
        },
        "items": [
          {
            "id": "clxxx789",
            "quantity": 2,
            "price": 25.0,
            "subtotal": 50.0,
            "product": {
              "id": "clxxx999",
              "name": "Organic Tomatoes",
              "farm": {
                "id": "clxxx111",
                "name": "Green Valley Farm"
              }
            }
          }
        ],
        "Payment": {
          "id": "clxxx222",
          "status": "PAID",
          "amount": 87.5,
          "stripePaymentIntentId": "pi_xxx123"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1248,
      "totalPages": 63
    },
    "stats": {
      "totalOrders": 1248,
      "pendingCount": 12,
      "confirmedCount": 45,
      "deliveredCount": 856,
      "cancelledCount": 35
    }
  }
}
```

---

### Update Order / Process Refund

```http
PATCH /api/admin/orders
```

**Body (Status Update)**:

```json
{
  "orderId": "clxxx123",
  "status": "CANCELLED"
}
```

**Body (Full Refund)**:

```json
{
  "orderId": "clxxx123",
  "refund": {
    "fullRefund": true,
    "reason": "Customer requested cancellation"
  }
}
```

**Body (Partial Refund)**:

```json
{
  "orderId": "clxxx123",
  "refund": {
    "fullRefund": false,
    "amount": 25.5,
    "reason": "Damaged product - partial refund"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "clxxx123",
      "orderNumber": "ORD-12345",
      "status": "CANCELLED",
      "total": 87.5,
      "Payment": {
        "status": "REFUNDED",
        "amount": 87.5
      }
    }
  }
}
```

**Side Effects**:

- Processes refund through Stripe
- Updates payment and order records
- Sends notification to customer
- Logs admin action

---

## 🔐 Authentication

All endpoints (except webhooks) require authentication via session cookies or JWT tokens.

**Admin Endpoints** require:

- Valid authentication
- User role = `ADMIN`

**Webhook Endpoints** require:

- Valid webhook signature (Stripe-Signature header)

---

## 📦 Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      /* optional additional details */
    }
  }
}
```

---

## ⚠️ Error Codes

### Authentication Errors

- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions

### Validation Errors

- `VALIDATION_ERROR` (400) - Invalid input data
- `INVALID_REQUEST` (400) - Malformed request

### Resource Errors

- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict

### Operation Errors

- `FETCH_ERROR` (500) - Failed to fetch data
- `UPDATE_ERROR` (500) - Failed to update data
- `DELETE_ERROR` (500) - Failed to delete data
- `REFUND_FAILED` (500) - Refund processing failed

### Webhook Errors

- `INVALID_SIGNATURE` (400) - Invalid webhook signature
- `WEBHOOK_PROCESSING_FAILED` (500) - Webhook processing error

---

## 📊 Rate Limits

**Standard Endpoints**:

- 100 requests per minute per user
- 1000 requests per hour per user

**Admin Endpoints**:

- 200 requests per minute
- 2000 requests per hour

**Webhooks**:

- No rate limit (handled by provider)

---

## 🔧 Integration Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// Get notifications
const response = await fetch("/api/notifications?page=1&limit=20", {
  credentials: "include",
});
const data = await response.json();

// Update notification preferences
const updateResponse = await fetch("/api/notifications/preferences", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    emailEnabled: true,
    pushEnabled: false,
  }),
});

// Admin: List users
const usersResponse = await fetch(
  "/api/admin/users?role=FARMER&status=ACTIVE",
  {
    credentials: "include",
  },
);
```

### cURL

```bash
# Get notifications
curl -X GET 'http://localhost:3000/api/notifications?page=1&limit=20' \
  -H 'Cookie: session=...'

# Update preferences
curl -X PATCH 'http://localhost:3000/api/notifications/preferences' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=...' \
  -d '{"emailEnabled":true,"pushEnabled":false}'

# Admin: Moderate review
curl -X PATCH 'http://localhost:3000/api/admin/reviews' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: session=...' \
  -d '{"reviewId":"clxxx123","action":"APPROVE"}'
```

---

## 📝 Notes

1. **Pagination**: All list endpoints support pagination with `page` and `limit` parameters
2. **Filters**: Most list endpoints support multiple filters - combine them for precise queries
3. **Sorting**: Use `sortBy` and `sortOrder` for custom result ordering
4. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
5. **IDs**: All IDs use CUID format (e.g., "clxxx123")
6. **Notifications**: Automatically sent for key events (order updates, payments, etc.)
7. **Webhooks**: Ensure your webhook secret is properly configured in environment variables
8. **Admin Actions**: All admin operations are logged for audit trail

---

## 🚀 Production Checklist

- [ ] Configure `STRIPE_WEBHOOK_SECRET` environment variable
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Configure email service (SMTP credentials)
- [ ] Test webhook signature verification
- [ ] Set up monitoring for failed webhooks
- [ ] Configure notification preferences defaults
- [ ] Test admin role-based access control
- [ ] Set up rate limiting (Redis recommended)
- [ ] Enable logging for admin actions
- [ ] Configure error tracking (Sentry recommended)

---

**API Version**: 1.0
**Documentation Last Updated**: November 2024
**Support**: See main README for contact information
