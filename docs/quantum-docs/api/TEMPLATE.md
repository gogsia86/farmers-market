# API Documentation Templates

## 🌌 API Endpoint Template

### `[METHOD] /api/[endpoint]`

#### Overview

A brief description of what this endpoint does and its quantum alignment.

#### Quantum Characteristics

- Resonance: `HIGH`/`MEDIUM`/`LOW`
- State Dependency: `Yes`/`No`
- Temporal Sensitivity: `HIGH`/`MEDIUM`/`LOW`
- Biodynamic Influence: Description of biodynamic factors

#### Request

```typescript
interface Request {
  // Request body type definition
}
```

##### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | `string` | Yes | Bearer token |
| `Quantum-Alignment` | `string` | No | Quantum state identifier |

##### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `param` | `type` | Yes/No | Description |

##### Body

```json
{
  "example": "request body"
}
```

#### Response

##### Success Response

**Code**: `200 OK`

```typescript
interface Response {
  // Response type definition
}
```

```json
{
  "example": "response body"
}
```

##### Error Responses

| Status | Description |
|--------|-------------|
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `500` | Internal Server Error |

#### Example

```typescript
// Example usage with quantum-aware client
const response = await quantumClient.post('/api/endpoint', {
  // request body
});
```

#### Evolution Notes

- Current State: `SEEDING`/`GROWING`/`FLOWERING`/`FRUITING`
- Last Evolution: YYYY-MM-DD
- Next Evolution: Expected YYYY-MM-DD

---

## 🌿 Living Documentation Usage

1. Copy this template when creating new API endpoint documentation
2. Fill in all sections with relevant information
3. Update the Evolution Notes as the endpoint matures
4. Link to related WebSocket events and type definitions
5. Keep quantum characteristics up to date

## 🔄 Template Evolution

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-22 | Initial template creation |