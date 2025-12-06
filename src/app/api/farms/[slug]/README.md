# 🌾 Farm Detail API Endpoint

**Endpoint**: `GET /api/farms/[slug]`  
**Status**: ✅ IMPLEMENTED  
**Authentication**: Not required (Public endpoint)

---

## 📋 Overview

Fetches complete farm details by slug for public viewing. Returns farm profile with products, reviews, owner information, and statistics.

---

## 🔗 Usage

### Request

```
GET /api/farms/[slug]
```

**Parameters**:

- `slug` (string, required) - Unique farm identifier (URL-friendly)

**Example**:

```
GET /api/farms/organic-valley-farm
GET /api/farms/green-acres-produce
```

---

## ✅ Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Organic Valley Farm",
    "slug": "organic-valley-farm",
    "description": "Family-owned organic farm since 1985",
    "story": "Our journey started with a passion for sustainable farming...",
    "status": "ACTIVE",
    "verificationStatus": "VERIFIED",

    "address": "123 Farm Road",
    "city": "Springfield",
    "state": "CA",
    "zipCode": "94025",
    "country": "US",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "deliveryRadius": 25,

    "businessName": "Organic Valley LLC",
    "yearEstablished": 1985,
    "farmSize": 50.5,

    "averageRating": 4.8,
    "reviewCount": 127,
    "reviews": [
      {
        "id": "rev123",
        "rating": 5,
        "comment": "Amazing fresh produce!",
        "createdAt": "2024-01-15T10:30:00Z",
        "customer": {
          "id": "usr123",
          "name": "John Doe",
          "avatar": "https://..."
        }
      }
    ],

    "email": "contact@organicvalley.com",
    "phone": "+1-555-0123",
    "website": "https://organicvalley.com",

    "images": [
      "https://cloudinary.com/farm-image-1.jpg",
      "https://cloudinary.com/farm-image-2.jpg"
    ],
    "logoUrl": "https://cloudinary.com/logo.jpg",
    "bannerUrl": "https://cloudinary.com/banner.jpg",

    "certifications": ["USDA Organic", "Non-GMO"],
    "farmingPractices": ["Organic", "Biodynamic", "Sustainable"],
    "productCategories": ["Vegetables", "Fruits", "Herbs"],

    "owner": {
      "id": "usr456",
      "name": "Jane Smith",
      "avatar": "https://...",
      "joinedYear": 2020
    },

    "products": [
      {
        "id": "prod123",
        "name": "Organic Tomatoes",
        "slug": "organic-tomatoes",
        "description": "Fresh vine-ripened tomatoes",
        "price": 4.99,
        "unit": "lb",
        "inStock": true,
        "images": ["https://..."],
        "category": "Vegetables",
        "organic": true,
        "featured": true,
        "averageRating": 4.9,
        "reviewCount": 45
      }
    ],

    "stats": {
      "totalProducts": 35,
      "totalReviews": 127,
      "totalOrders": 1250,
      "profileViews": 5432
    },

    "createdAt": "2020-03-15T08:00:00Z",
    "updatedAt": "2024-12-01T14:30:00Z"
  },
  "agricultural": {
    "consciousness": "active",
    "season": "WINTER"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request - Invalid Slug

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SLUG",
    "message": "Farm slug is required and must be a valid string"
  }
}
```

### 403 Forbidden - Farm Not Available

```json
{
  "success": false,
  "error": {
    "code": "FARM_NOT_AVAILABLE",
    "message": "This farm is not currently available for viewing"
  }
}
```

### 404 Not Found - Farm Does Not Exist

```json
{
  "success": false,
  "error": {
    "code": "FARM_NOT_FOUND",
    "message": "Farm not found"
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "FARM_FETCH_ERROR",
    "message": "Failed to fetch farm details",
    "details": "Detailed error message"
  }
}
```

---

## 🎯 Features

### Included Data

- ✅ Complete farm profile information
- ✅ Owner details (public information only)
- ✅ Active products (up to 20, in stock only)
- ✅ Recent reviews (up to 10, approved only)
- ✅ Farm statistics (products, reviews, orders)
- ✅ Images and media
- ✅ Certifications and farming practices
- ✅ Location and delivery information

### Business Logic

- Only returns **ACTIVE** and **VERIFIED** farms for public viewing
- Automatically increments profile view count
- Products filtered: `inStock: true` and `status: ACTIVE`
- Reviews filtered: `status: APPROVED`
- Reviews sorted by creation date (newest first)
- Products sorted by creation date (newest first)

### Performance

- Single database query with includes (optimized)
- Profile view count updated asynchronously (non-blocking)
- Proper indexing on `slug` field

---

## 📝 Usage Examples

### JavaScript/TypeScript (Frontend)

```typescript
// Fetch farm details
async function getFarmDetails(slug: string) {
  const response = await fetch(`/api/farms/${slug}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

// Usage
const farm = await getFarmDetails("organic-valley-farm");
console.log(farm.name); // "Organic Valley Farm"
console.log(farm.products.length); // Number of products
```

### React Component Example

```tsx
import { useEffect, useState } from "react";

function FarmDetailPage({ slug }: { slug: string }) {
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/farms/${slug}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setFarm(result.data);
        } else {
          setError(result.error.message);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!farm) return <div>Farm not found</div>;

  return (
    <div>
      <h1>{farm.name}</h1>
      <p>{farm.description}</p>
      <p>
        Rating: {farm.averageRating} ⭐ ({farm.reviewCount} reviews)
      </p>
      <h2>Products ({farm.products.length})</h2>
      {farm.products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>
            ${product.price} / {product.unit}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### cURL Example

```bash
# Fetch farm details
curl -X GET https://yourdomain.com/api/farms/organic-valley-farm

# Pretty print JSON
curl -X GET https://yourdomain.com/api/farms/organic-valley-farm | jq
```

---

## 🔒 Security

### Public Access

- ✅ No authentication required
- ✅ Only shows verified and active farms
- ✅ Owner email/phone protected (only shown if farm owner approves)
- ✅ Reviews pre-moderated (only approved reviews shown)

### Data Protection

- Owner's sensitive information filtered
- Only public-facing data returned
- SQL injection protection (Prisma ORM)
- Input validation on slug parameter

---

## 🚀 Related Endpoints

- `GET /api/farms` - List all farms
- `GET /api/marketplace/farms/[slug]` - Marketplace farm detail (similar)
- `GET /api/farms/[slug]/products` - Farm's products (future)
- `GET /api/farms/[slug]/reviews` - Farm's reviews (future)

---

## 📊 Response Schema

### Farm Object

| Field                | Type           | Description                          |
| -------------------- | -------------- | ------------------------------------ |
| `id`                 | string         | Unique farm identifier               |
| `name`               | string         | Farm display name                    |
| `slug`               | string         | URL-friendly identifier              |
| `description`        | string \| null | Short description                    |
| `story`              | string \| null | Farm's story/history                 |
| `status`             | enum           | ACTIVE, PENDING, SUSPENDED, INACTIVE |
| `verificationStatus` | enum           | VERIFIED, PENDING, REJECTED          |
| `address`            | string         | Street address                       |
| `city`               | string         | City                                 |
| `state`              | string         | State/Province                       |
| `zipCode`            | string         | ZIP/Postal code                      |
| `country`            | string         | Country code (default: "US")         |
| `latitude`           | number \| null | Latitude coordinate                  |
| `longitude`          | number \| null | Longitude coordinate                 |
| `deliveryRadius`     | number \| null | Delivery radius in miles             |
| `averageRating`      | number \| null | Average rating (0-5)                 |
| `reviewCount`        | number         | Total number of reviews              |
| `email`              | string         | Contact email                        |
| `phone`              | string         | Contact phone                        |
| `website`            | string \| null | Farm website                         |
| `images`             | string[]       | Array of image URLs                  |
| `logoUrl`            | string \| null | Logo image URL                       |
| `bannerUrl`          | string \| null | Banner image URL                     |
| `certifications`     | string[]       | Certifications array                 |
| `farmingPractices`   | string[]       | Farming practices                    |
| `productCategories`  | string[]       | Product categories                   |
| `owner`              | object         | Owner information                    |
| `products`           | array          | Active products                      |
| `reviews`            | array          | Recent reviews                       |
| `stats`              | object         | Farm statistics                      |

---

## 🧪 Testing

### Manual Testing

```bash
# Test valid farm
curl http://localhost:3001/api/farms/test-farm-slug

# Test non-existent farm
curl http://localhost:3001/api/farms/non-existent-farm

# Test invalid slug (should return 400)
curl http://localhost:3001/api/farms/
```

### Unit Test Example

```typescript
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/farms/[slug]", () => {
  it("should return farm details for valid slug", async () => {
    const request = new NextRequest("http://localhost/api/farms/test-farm");
    const response = await GET(request, { params: { slug: "test-farm" } });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.slug).toBe("test-farm");
  });

  it("should return 404 for non-existent farm", async () => {
    const request = new NextRequest("http://localhost/api/farms/invalid");
    const response = await GET(request, { params: { slug: "invalid" } });

    expect(response.status).toBe(404);
  });
});
```

---

## 📝 Notes

- Profile views are tracked automatically on each request
- Products are limited to 20 per farm (pagination not yet implemented)
- Reviews are limited to 10 most recent (pagination not yet implemented)
- Seasonal information is included in the response (`agricultural.season`)
- Agricultural consciousness is always "active"

---

## 🔄 Version History

- **v1.0.0** (2024-12-15) - Initial implementation
  - Basic farm detail fetching
  - Product and review inclusion
  - Statistics tracking
  - Profile view counting

---

## 👥 Maintainers

Development Team - Farmers Market Platform

---

**Status**: ✅ Production Ready  
**Last Updated**: December 2024
