---
applyTo: "**/*"
description: "FR-011: Farm Discovery - Location-based search (50-mile radius), interactive map, list/grid view, filters (certifications/products/fulfillment), favorites"
---

# FR-011: FARM DISCOVERY

**Find Local Farms Near You**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-011
Priority: P0 - Critical
Effort: 21 story points (≈ 1 week)
Value: 95/100
Dependencies: FR-002 (Farm Profiles), FR-010 (Registration)
User Story: CONS-001 from AGRICULTURAL_PERSONAS
```

---

## 🎯 KEY REQUIREMENTS

### Location-Based Search

```yaml
Default Search:
  - Radius: 50 miles from home address
  - Auto-detect: Use current location GPS
  - Map view: Interactive map with farm pins
  - List view: Card layout with distance

Search Bar:
  - Query: "organic tomatoes near me"
  - Autocomplete: Farms, products, locations
  - Filters: Apply to results
```

### Interactive Map

- **Farm pins**: Color-coded by fulfillment (delivery=blue, pickup=green, market=orange)
- **Cluster**: Group nearby farms at zoom-out
- **Click pin**: Show farm card popup
- **Directions**: Link to Google Maps

### Filters

```yaml
Certifications:
  - Organic certified
  - Regenerative agriculture
  - Animal welfare certified

Products:
  - Vegetables, Fruits, Dairy, Eggs, Meat, Honey
  - Specific: "Tomatoes", "Raw Milk"

Fulfillment:
  - Offers delivery
  - Farm pickup available
  - At farmers markets

Availability:
  - Open now
  - Has products in stock
```

### Farm Cards

```yaml
Display:
  - Farm photo
  - Name + distance (2.3 miles)
  - Rating: 4.8 stars (24 reviews)
  - Products: "Vegetables, Eggs, Honey"
  - Fulfillment icons: Delivery, Pickup, Market
  - Quick action: "View Farm" button
```

---

## 📊 SUCCESS METRICS

| Metric       | Target                         |
| ------------ | ------------------------------ |
| Farms found  | Avg 8-12 within 50 miles       |
| Map usage    | >70% users interact with map   |
| Filter usage | >60% apply at least one filter |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
