# Farmers Market Platform API Documentation

**Version**: 1.0.0
**Base URL**: `/api`

Divine Agricultural Platform - Comprehensive REST API

This API provides endpoints for:

- 🚜 Farm Management (CRUD, search, verification)
- 🌾 Product Catalog (inventory, categories, search)
- 📦 Order Processing (cart, checkout, fulfillment)
- 👤 User Management (authentication, profiles, roles)
- 🌍 Marketplace (discovery, featured items, recommendations)
- 📊 Analytics (farmer dashboard, sales reports)
- 🔔 Notifications (real-time updates, alerts)

All endpoints return standardized ServiceResponse<T> format with:

- success: boolean
- data?: T
- error?: ServiceError
- meta?: ResponseMetadata (including agricultural consciousness)

---

## Table of Contents

- [Health](#health)
- [FarmController](#farmcontroller)
- [ProductController](#productcontroller)
- [OrderController](#ordercontroller)
- [Marketplace](#marketplace)

---

## Health

### `GET /api/health`

Health check endpoint - verifies system and database connectivity

**Responses**:

- **200**: System is healthy

---

### `GET /api/ready`

Readiness check endpoint for Kubernetes/Docker

**Responses**:

- **200**: Service is ready

---

## FarmController

### `GET /api/farms`

List all farms with pagination and filtering

**Parameters**:

| Name     | In    | Type    | Required | Description               |
| -------- | ----- | ------- | -------- | ------------------------- |
| `page`   | query | integer | No       | Page number (starts at 1) |
| `limit`  | query | integer | No       | Items per page            |
| `status` | query | string  | No       | Filter by farm status     |
| `city`   | query | string  | No       | Filter by city            |
| `state`  | query | string  | No       | Filter by state           |

**Responses**:

- **200**: Paginated list of farms

---

### `POST /api/farms`

Create a new farm (requires FARMER role)

**Authentication**: Required (FARMER)

**Responses**:

- **201**: Farm created successfully
- **401**: Authentication required
- **403**: User already has a farm

---

### `GET /api/farms/{id}`

Get farm by ID

**Parameters**:

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| `id` | path | string | Yes      | Farm ID     |

**Responses**:

- **200**: Farm details
- **404**: Farm not found

---

### `PUT /api/farms/{id}`

Update farm (requires ownership)

**Authentication**: Required

**Parameters**:

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| `id` | path | string | Yes      | Farm ID     |

**Responses**:

- **200**: Farm updated successfully
- **401**: Authentication required
- **403**: Not the farm owner

---

### `DELETE /api/farms/{id}`

Delete farm (soft delete, requires ownership)

**Authentication**: Required

**Parameters**:

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| `id` | path | string | Yes      | Farm ID     |

**Responses**:

- **200**: Farm deleted successfully

---

### `GET /api/farms/search`

Search farms by query

**Parameters**:

| Name    | In    | Type    | Required | Description     |
| ------- | ----- | ------- | -------- | --------------- |
| `query` | query | string  | Yes      | Search query    |
| `limit` | query | integer | No       | Maximum results |

**Responses**:

- **200**: Search results

---

## ProductController

### `GET /api/products`

List all products with pagination and filtering

**Parameters**:

| Name       | In    | Type    | Required | Description |
| ---------- | ----- | ------- | -------- | ----------- |
| `page`     | query | integer | No       | -           |
| `limit`    | query | integer | No       | -           |
| `category` | query | string  | No       | -           |
| `farmId`   | query | string  | No       | -           |

**Responses**:

- **200**: Paginated list of products

---

### `POST /api/products`

Create a new product (requires FARMER role and farm ownership)

**Authentication**: Required (FARMER)

**Responses**:

- **201**: Product created successfully

---

### `GET /api/products/search`

Search products by keyword

**Parameters**:

| Name | In    | Type   | Required | Description  |
| ---- | ----- | ------ | -------- | ------------ |
| `q`  | query | string | Yes      | Search query |

**Responses**:

- **200**: Search results

---

## OrderController

### `GET /api/orders`

List orders for authenticated user

**Authentication**: Required

**Responses**:

- **200**: List of user orders

---

### `POST /api/orders`

Create a new order

**Authentication**: Required

**Responses**:

- **201**: Order created successfully

---

### `GET /api/orders/{id}`

Get order details

**Authentication**: Required

**Parameters**:

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| `id` | path | string | Yes      | -           |

**Responses**:

- **200**: Order details

---

## Marketplace

### `GET /api/marketplace`

Get marketplace products and featured farms

**Responses**:

- **200**: Marketplace data

---
