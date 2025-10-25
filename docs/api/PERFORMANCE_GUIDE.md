# API Performance Guide

## Performance Features

### 1. Caching

All API endpoints support caching through multiple mechanisms:

#### Redis Caching

```typescript
// Example response with Redis cache hit
const response = await fetch("/api/products");
console.log(response.headers.get("X-Cache")); // "HIT" or "MISS"
```

#### HTTP Caching

```typescript
// Example response with cache headers
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

### 2. Partial Responses

Optimize bandwidth by requesting only needed fields:

```typescript
// Request only specific fields
GET /api/products?fields=id,name,price

// Response
{
  "data": [
    {
      "id": "123",
      "name": "Organic Apples",
      "price": 2.99
    }
  ]
}
```

### 3. Pagination

All list endpoints support pagination:

```typescript
// Request with pagination
GET /api/products?page=1&limit=20

// Response
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### 4. Response Streaming

Large datasets are automatically streamed:

```typescript
// Example: Fetching large dataset
const response = await fetch("/api/products/export");
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log("Received chunk:", value);
}
```

## Best Practices

### 1. Query Optimization

Use query parameters effectively:

```typescript
// Good - Specific fields and filters
GET /api/products?fields=id,name&category=organic

// Avoid - Fetching unnecessary data
GET /api/products // Returns all fields
```

### 2. Batch Operations

Use batch endpoints for multiple operations:

```typescript
// Good - Single request for multiple items
POST /api/products/batch
{
  "operations": [
    { "id": "1", "action": "update", "data": { ... } },
    { "id": "2", "action": "update", "data": { ... } }
  ]
}

// Avoid - Multiple separate requests
PATCH /api/products/1
PATCH /api/products/2
```

### 3. Real-time Updates

Use WebSocket connections for real-time data:

```typescript
const ws = new WebSocket("/ws/market-updates");
ws.onmessage = (event) => {
  console.log("Real-time update:", event.data);
};
```

## Performance Monitoring

### 1. Response Headers

All responses include performance metrics:

```typescript
X-Response-Time: 45ms
X-Query-Count: 2
X-Cache: HIT
```

### 2. Rate Limiting

API endpoints are rate-limited:

```typescript
// Response headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633432800
```

## Error Handling

Optimized error responses:

```typescript
// Error response format
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product not found",
    "details": {
      "id": "123"
    }
  }
}
```

## Monitoring and Debugging

### 1. Request ID Tracking

All requests can be traced:

```typescript
// Response headers
X-Request-ID: 7b34f16b-87c9-4c9e-a66f-4f36fd6f7c91
```

### 2. Performance Metrics

Access performance metrics:

```typescript
GET /api/_metrics

// Response
{
  "responseTime": {
    "avg": 45,
    "p95": 100,
    "p99": 200
  },
  "cacheHitRate": 0.85,
  "errorRate": 0.001
}
```

---

_This documentation is automatically updated based on API changes and performance metrics._
