# ⚠️ API Error Codes Reference

Complete reference of all error codes returned by the Farmers Market Platform API.

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    }
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Error Codes by Category

### Authentication & Authorization (AUTH_*)

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `AUTHENTICATION_REQUIRED` | 401 | User must be authenticated | Sign in and include JWT token |
| `INVALID_TOKEN` | 401 | JWT token is invalid or malformed | Obtain a new token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired | Refresh your token |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions | Contact admin for permissions |
| `FORBIDDEN_RESOURCE` | 403 | Access to resource denied | Verify ownership or permissions |

### Validation (VALIDATION_*)

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Input validation failed | Check `details` for field errors |
| `INVALID_INPUT` | 400 | Invalid input data | Verify request format |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing | Include all required fields |
| `INVALID_EMAIL_FORMAT` | 400 | Email format invalid | Use valid email format |
| `INVALID_DATE_FORMAT` | 400 | Date format invalid | Use ISO 8601 format |

### Resources (RESOURCE_*)

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist | Verify resource ID |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists | Use unique identifier |
| `RESOURCE_CONFLICT` | 409 | Resource state conflict | Resolve conflict first |
| `RESOURCE_LOCKED` | 423 | Resource is locked | Wait or request unlock |

### Business Logic (BUSINESS_*)

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `INSUFFICIENT_STOCK` | 422 | Product out of stock | Reduce quantity or wait |
| `FARM_ALREADY_EXISTS` | 409 | User already has a farm | Delete existing farm first |
| `INVALID_ORDER_STATUS` | 422 | Invalid status transition | Check order lifecycle |
| `PAYMENT_FAILED` | 402 | Payment processing failed | Verify payment method |
| `DELIVERY_UNAVAILABLE` | 422 | Delivery not available | Check delivery area |

### Rate Limiting (RATE_*)

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait for reset time |
| `QUOTA_EXCEEDED` | 429 | API quota exceeded | Upgrade plan or wait |

### Server Errors (SERVER_*)

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `INTERNAL_ERROR` | 500 | Unexpected server error | Retry or contact support |
| `DATABASE_ERROR` | 500 | Database error | Retry or contact support |
| `EXTERNAL_SERVICE_ERROR` | 503 | Third-party service error | Retry later |
| `SERVICE_UNAVAILABLE` | 503 | Service maintenance | Wait for maintenance completion |

---

## Common Error Scenarios

### 1. Invalid Authentication Token

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The provided authentication token is invalid"
  }
}
```

**Solution:**
- Verify token is not expired
- Check token format is correct
- Obtain a new token via `/api/auth/signin`

---

### 2. Validation Error

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "name": "Name must be at least 3 characters",
      "email": "Invalid email format",
      "price": "Price must be a positive number"
    }
  }
}
```

**Solution:**
- Check each field in `details`
- Fix validation issues
- Resubmit request

---

### 3. Resource Not Found

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Farm not found",
    "details": {
      "farmId": "farm_123"
    }
  }
}
```

**Solution:**
- Verify the resource ID
- Ensure resource exists
- Check if resource was deleted

---

### 4. Rate Limit Exceeded

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 3600,
      "limit": 1000,
      "remaining": 0
    }
  }
}
```

**Solution:**
- Wait for `retryAfter` seconds
- Implement exponential backoff
- Consider upgrading API plan

---

## Error Handling Best Practices

### 1. Always Check Success Flag

```typescript
const response = await fetch('/api/farms');
const result = await response.json();

if (!result.success) {
  // Handle error
  console.error(result.error.code);
  console.error(result.error.message);
}
```

### 2. Handle Specific Error Codes

```typescript
if (!result.success) {
  switch (result.error.code) {
    case 'AUTHENTICATION_REQUIRED':
      // Redirect to login
      router.push('/login');
      break;
    
    case 'VALIDATION_ERROR':
      // Show field errors
      showFieldErrors(result.error.details);
      break;
    
    case 'RATE_LIMIT_EXCEEDED':
      // Retry after delay
      setTimeout(() => retry(), result.error.details.retryAfter * 1000);
      break;
    
    default:
      // Generic error handling
      showErrorMessage(result.error.message);
  }
}
```

### 3. Log Errors with Request ID

```typescript
if (!result.success) {
  logger.error('API Error', {
    code: result.error.code,
    message: result.error.message,
    requestId: result.meta.requestId,
    timestamp: result.meta.timestamp
  });
}
```

---

## HTTP Status Code Mapping

| Status Code | Meaning | Common Error Codes |
|-------------|---------|-------------------|
| **400** | Bad Request | `VALIDATION_ERROR`, `INVALID_INPUT` |
| **401** | Unauthorized | `AUTHENTICATION_REQUIRED`, `INVALID_TOKEN` |
| **403** | Forbidden | `INSUFFICIENT_PERMISSIONS`, `FORBIDDEN_RESOURCE` |
| **404** | Not Found | `RESOURCE_NOT_FOUND` |
| **409** | Conflict | `DUPLICATE_RESOURCE`, `RESOURCE_CONFLICT` |
| **422** | Unprocessable | `BUSINESS_LOGIC_ERROR`, `INSUFFICIENT_STOCK` |
| **429** | Too Many Requests | `RATE_LIMIT_EXCEEDED`, `QUOTA_EXCEEDED` |
| **500** | Server Error | `INTERNAL_ERROR`, `DATABASE_ERROR` |
| **503** | Service Unavailable | `SERVICE_UNAVAILABLE`, `EXTERNAL_SERVICE_ERROR` |

---

## Need Help?

If you encounter an error not listed here:

1. Check the error `details` field for more context
2. Review the [API Documentation](./README.md)
3. Contact support: api-support@farmersmarket.com

Include your **Request ID** when contacting support!

---

**Last Updated:** January 2025
