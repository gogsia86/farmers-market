---
applyTo: "**/*"
description: "FR-019: Multi-Tenant Architecture - Farms as tenants, shared infrastructure, tenant isolation, horizontal scaling, database sharding, caching (Redis), CDN (CloudFront)"
---

# FR-019: MULTI-TENANT ARCHITECTURE

**Scalable Platform Foundation**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-019
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 100/100 (HIGHEST - platform foundation)
Dependencies: None (foundational)
```

---

## 🎯 KEY REQUIREMENTS

### Multi-Tenant Database

```yaml
Tenant Model:
  - Tenant = Farm
  - Shared infrastructure: Single database, shared tables
  - Tenant isolation: farm_id foreign key on all data
  - Row-level security: Every query filtered by farm_id

Schema Design: farms (tenant table)
  - id (primary key)
  - name, slug, status

  products (tenant data)
  - id (primary key)
  - farm_id (foreign key → farms.id) [INDEXED]
  - name, price, etc.

  orders (tenant data)
  - id (primary key)
  - farm_id (foreign key)
  - customer_id (cross-tenant allowed)

Query Pattern: SELECT * FROM products
  WHERE farm_id = :current_farm_id
  -- Every query MUST include farm_id filter
```

### Tenant Isolation

```yaml
Security Boundaries:
  - API middleware: Inject farm_id from auth token
  - Database queries: Auto-filter by farm_id (ORM level)
  - File storage: S3 folders per farm (uploads/farm-123/)
  - Webhooks: Separate endpoints per farm

Access Control:
  - Farmers: Can only access their own farm data
  - Consumers: Can view all farms (public data)
  - Admins: Can access all tenant data
```

### Horizontal Scaling

```yaml
Application Servers:
  - Stateless: No session data stored on server
  - Load balancer: Distribute traffic (ALB/Nginx)
  - Auto-scaling: Add servers based on CPU/memory
  - Target: 10,000+ concurrent users

Database Scaling:
  - Read replicas: Offload read queries
  - Connection pooling: Reuse connections (PgBouncer)
  - Query optimization: Indexes on farm_id, created_at
```

### Database Sharding

```yaml
Sharding Strategy (Future):
  - Shard key: Geographic region or farm_id
  - Example:
      - Shard 1: US East Coast farms
      - Shard 2: US West Coast farms
      - Shard 3: Midwest farms

  - Cross-shard queries: Via API aggregation layer
  - Implementation: When reaching 100,000+ farms
```

### Caching (Redis)

```yaml
Cache Strategy:
  - Session data: User sessions (JWT in Redis)
  - Hot data: Popular farms, products (5-min TTL)
  - Rate limiting: API throttling counters
  - Real-time: Inventory counts, order counts

Cache Keys: farm:123:profile → Farm profile data
  product:456:details → Product details
  user:789:cart → Shopping cart

Invalidation:
  - On update: Clear farm:123:* keys
  - TTL: Auto-expire after 5 minutes
```

### CDN (CloudFront)

```yaml
Static Assets:
  - Farm photos: /uploads/farms/...
  - Product photos: /uploads/products/...
  - CSS/JS bundles: /_next/static/...

Configuration:
  - Origin: S3 bucket or Next.js server
  - Cache duration: 1 year for images, 1 hour for HTML
  - Compression: Gzip/Brotli enabled
  - Global edge locations: 200+ worldwide
```

---

## 📊 SUCCESS METRICS

| Metric            | Target                              |
| ----------------- | ----------------------------------- |
| Tenant isolation  | 100% (zero cross-tenant data leaks) |
| API response time | <200ms p95                          |
| Cache hit rate    | >90% for hot data                   |
| CDN offload       | >80% static assets from CDN         |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
