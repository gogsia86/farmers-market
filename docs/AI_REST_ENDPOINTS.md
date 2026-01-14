# AI REST Endpoints Documentation

**Last Updated**: January 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0.0

## Overview

The Farmers Market Platform provides four powerful AI-powered REST endpoints that leverage OpenAI GPT-4o to enhance farming operations, product management, and agricultural decision-making.

All endpoints are built with:
- **Production-ready error handling**
- **Comprehensive logging and monitoring**
- **Type-safe request/response validation (Zod)**
- **OpenTelemetry tracing support**
- **Rate limiting considerations**
- **CORS support**

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limits & Cost Management](#rate-limits--cost-management)
3. [Endpoints](#endpoints)
   - [Product Description Generator](#1-product-description-generator)
   - [Pricing Recommendations](#2-pricing-recommendations)
   - [Agricultural Advisor](#3-agricultural-advisor)
   - [Pest Identification (Vision)](#4-pest-identification-vision)
4. [Error Handling](#error-handling)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Authentication

Currently, all AI endpoints are **open** (no authentication required) for ease of development. 

**⚠️ Production Recommendation**: Add authentication middleware before deploying:

```typescript
// middleware.ts (example)
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/ai/')) {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
  }
  return NextResponse.next();
}
```

---

## Rate Limits & Cost Management

### OpenAI Cost Estimates (GPT-4o)

| Endpoint | Avg Tokens | Est. Cost/Request | Monthly (1000 req) |
|----------|------------|-------------------|-------------------|
| Product Description | 500-1,000 | $0.005-$0.010 | $5-$10 |
| Pricing | 800-1,500 | $0.008-$0.015 | $8-$15 |
| Advisor | 1,000-2,000 | $0.010-$0.020 | $10-$20 |
| Pest Identify (Vision) | 1,500-3,000 | $0.015-$0.030 | $15-$30 |

**Total estimated cost for 1,000 requests/month**: ~$40-$75

### Recommended Rate Limits

```typescript
// Suggested per-user limits
const RATE_LIMITS = {
  productDescription: { requests: 50, window: '1h' },
  pricing: { requests: 100, window: '1h' },
  advisor: { requests: 30, window: '1h' },
  pestIdentify: { requests: 20, window: '1h' },
};
```

---

## Endpoints

### 1. Product Description Generator

**POST** `/api/ai/product-description`

Generates compelling, SEO-optimized product descriptions for farm products.

#### Request Body

```typescript
{
  productName: string;          // Required: 2-200 chars
  category: string;              // Required: 2-100 chars
  farmName?: string;             // Optional: 2-200 chars
  farmingPractices?: Array<      // Optional
    'ORGANIC' | 'CONVENTIONAL' | 'PERMACULTURE' | 
    'HYDROPONIC' | 'AQUAPONIC' | 'REGENERATIVE' | 'BIODYNAMIC'
  >;
  certifications?: Array<        // Optional
    'ORGANIC' | 'NON_GMO' | 'BIODYNAMIC' | 
    'RAINFOREST_ALLIANCE' | 'FAIR_TRADE'
  >;
  harvestDate?: string;          // Optional: ISO date or "YYYY-MM-DD"
  variety?: string;              // Optional: max 100 chars
  flavorProfile?: string;        // Optional: max 500 chars
  culinaryUses?: string;         // Optional: max 500 chars
  storageInstructions?: string;  // Optional: max 300 chars
  nutritionalHighlights?: string;// Optional: max 300 chars
  tone?: 'professional' | 'casual' | 'storytelling' | 'technical'; // Default: 'casual'
  length?: 'short' | 'medium' | 'long'; // Default: 'medium'
  includeKeywords?: string[];    // Optional: max 10 keywords
}
```

#### Response

```typescript
{
  success: boolean;
  data?: {
    description: string;           // Full product description
    shortDescription: string;      // 1-2 sentences (max 160 chars)
    seoTitle: string;             // SEO-optimized (50-60 chars)
    seoMetaDescription: string;   // Meta description (150-160 chars)
    suggestedTags: string[];      // 5 relevant tags
    wordCount: number;            // Description word count
    confidence: number;           // 0.0-1.0 confidence score
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    model: string;                // "gpt-4o"
    tokensUsed: number;
    requestId: string;
    processingTime: number;       // milliseconds
  };
}
```

#### Example Request

```bash
curl -X POST https://your-domain.com/api/ai/product-description \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Heirloom Tomatoes",
    "category": "VEGETABLES",
    "farmName": "Sunrise Valley Farm",
    "farmingPractices": ["ORGANIC", "REGENERATIVE"],
    "certifications": ["ORGANIC"],
    "variety": "Cherokee Purple",
    "flavorProfile": "Rich, sweet, slightly smoky with balanced acidity",
    "harvestDate": "2025-07-15",
    "tone": "storytelling",
    "length": "medium",
    "includeKeywords": ["heirloom", "organic", "local"]
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "description": "Discover the authentic taste of summer with our Cherokee Purple Heirloom Tomatoes, lovingly grown at Sunrise Valley Farm using certified organic and regenerative practices. These stunning deep purple-pink beauties offer a flavor experience that will transport you back to your grandmother's garden—rich, sweet, and slightly smoky with perfectly balanced acidity that makes every bite memorable...",
    "shortDescription": "Certified organic Cherokee Purple heirloom tomatoes with rich, sweet flavor from Sunrise Valley Farm's regenerative fields.",
    "seoTitle": "Cherokee Purple Heirloom Tomatoes - Organic | Sunrise Valley",
    "seoMetaDescription": "Authentic heirloom Cherokee Purple tomatoes, certified organic. Rich, sweet flavor with smoky notes. Freshly harvested from local regenerative farm.",
    "suggestedTags": ["heirloom", "organic", "tomatoes", "local", "regenerative"],
    "wordCount": 247,
    "confidence": 0.89
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 682,
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "processingTime": 2340
  }
}
```

---

### 2. Pricing Recommendations

**POST** `/api/ai/pricing`

Generates intelligent pricing recommendations based on market data, seasonal factors, and product characteristics.

#### Request Body

```typescript
{
  productName: string;           // Required: 2-200 chars
  category: string;              // Required: 2-100 chars
  unit: 'lb' | 'oz' | 'kg' | 'g' | 'bunch' | 
        'each' | 'dozen' | 'pint' | 'quart' | 'gallon'; // Required
  farmingPractices?: Array<...>; // Optional (same as product-description)
  certifications?: Array<...>;   // Optional (same as product-description)
  region?: string;               // Optional: e.g., "California", "Northeast US"
  season?: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER'; // Optional
  productionCost?: number;       // Optional: Your cost per unit
  competitorPrices?: number[];   // Optional: max 10 prices
  qualityGrade?: 'premium' | 'standard' | 'economy'; // Default: 'standard'
  isInSeason?: boolean;          // Optional
  farmSize?: 'small' | 'medium' | 'large'; // Optional
  distributionChannel?: 'farmers_market' | 'direct' | 
                        'retail' | 'wholesale'; // Default: 'farmers_market'
}
```

#### Response

```typescript
{
  success: boolean;
  data?: {
    recommendedPrice: number;    // Final recommended price
    priceRange: {
      min: number;               // -15% from recommended
      max: number;               // +15% from recommended
      optimal: number;           // Same as recommendedPrice
    };
    confidence: number;          // 0.0-1.0 confidence score
    reasoning: string;           // AI-generated explanation
    factors: {
      marketDemand: number;      // 0.0-1.0 demand score
      seasonalFactor: number;    // 0.8-1.5 multiplier
      qualityPremium: number;    // 0.9-1.3 multiplier
      certificationBonus: number;// Dollar amount bonus
      competitivePosition: string; // 'below', 'competitive', 'premium'
    };
    recommendations: string[];   // 3-5 actionable strategies
    marketInsights: string;      // Market trends analysis
  };
  metadata?: {
    model: string;
    tokensUsed: number;
    requestId: string;
    processingTime: number;
  };
}
```

#### Example Request

```bash
curl -X POST https://your-domain.com/api/ai/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Organic Strawberries",
    "category": "BERRIES",
    "unit": "lb",
    "farmingPractices": ["ORGANIC"],
    "certifications": ["ORGANIC"],
    "region": "California",
    "season": "SPRING",
    "productionCost": 3.50,
    "competitorPrices": [6.99, 7.49, 6.50, 7.99],
    "qualityGrade": "premium",
    "isInSeason": true,
    "distributionChannel": "farmers_market"
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "recommendedPrice": 7.25,
    "priceRange": {
      "min": 6.16,
      "max": 8.34,
      "optimal": 7.25
    },
    "confidence": 0.87,
    "reasoning": "Based on your $3.50 production cost, organic certification, and premium quality grade, the recommended price of $7.25/lb positions you competitively within the local market. Your competitors range from $6.50-$7.99, and being in-season allows for a slight premium while remaining attractive to customers seeking certified organic strawberries.",
    "factors": {
      "marketDemand": 0.8,
      "seasonalFactor": 1.0,
      "qualityPremium": 1.25,
      "certificationBonus": 0.50,
      "competitivePosition": "competitive"
    },
    "recommendations": [
      "Consider volume discounts for bulk purchases (e.g., 3 lbs for $20)",
      "Highlight the organic certification prominently to justify premium pricing",
      "Monitor competitor pricing weekly and adjust by ±5% as needed",
      "Offer early-bird pricing for customers arriving in first hour",
      "Bundle with complementary products (cream, shortcake) for higher value"
    ],
    "marketInsights": "California organic strawberries are in peak season with strong consumer demand. The organic premium is holding steady at 15-20% above conventional. Watch for mid-season price competition as supply increases in May."
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 924,
    "requestId": "550e8400-e29b-41d4-a716-446655440001",
    "processingTime": 1850
  }
}
```

---

### 3. Agricultural Advisor

**POST** `/api/ai/advisor`

Provides expert agricultural advice with conversation tracking and context awareness.

#### Request Body

```typescript
{
  message: string;               // Required: 5-2000 chars
  userId?: string;               // Optional: for user-specific threads
  farmId?: string;               // Optional: for farm-specific threads
  threadId?: string;             // Optional: continue existing conversation
  context?: {
    location?: string;
    farmSize?: string;
    cropTypes?: string[];
    currentSeason?: string;
    farmingPractices?: string[];
    specificIssue?: string;
  };
  agentType?: 'farm_analyst' | 'customer_support' | 'auto'; // Default: 'auto'
  includeHistory?: boolean;      // Default: true
  maxHistoryMessages?: number;   // Default: 10, range: 0-20
}
```

#### Response

```typescript
{
  success: boolean;
  data?: {
    response: string;            // AI-generated advice
    threadId: string;            // Conversation thread ID
    agentUsed: string;           // 'farmAnalyst' or 'customerSupport'
    confidence: number;          // 0.0-1.0 confidence score
    suggestions?: string[];      // Follow-up action items
    relatedTopics?: string[];    // Related discussion topics
    citations?: Array<{
      title: string;
      url?: string;
      snippet?: string;
    }>;
  };
  metadata?: {
    model: string;
    tokensUsed: number;
    requestId: string;
    processingTime: number;
    conversationLength?: number; // Total messages in thread
  };
}
```

#### Example Request

```bash
curl -X POST https://your-domain.com/api/ai/advisor \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My tomato plants have yellowing leaves on the bottom. What could be causing this and how do I fix it?",
    "userId": "user_123",
    "farmId": "farm_456",
    "context": {
      "location": "California Central Valley",
      "farmSize": "2 acres",
      "cropTypes": ["tomatoes", "peppers", "cucumbers"],
      "currentSeason": "SUMMER",
      "farmingPractices": ["ORGANIC"]
    },
    "agentType": "auto",
    "includeHistory": true
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "response": "Yellowing leaves on the bottom of tomato plants is a common issue with several possible causes. Based on your organic farming practices in California's Central Valley during summer, here's what to consider:\n\n**Most Likely Causes:**\n\n1. **Nitrogen Deficiency** - This is the most common cause. Tomatoes are heavy feeders and bottom leaves yellow first when nitrogen is depleted.\n\n2. **Natural Aging** - Some lower leaf yellowing is normal as plants mature and redirect energy upward.\n\n3. **Overwatering/Poor Drainage** - California summer heat can lead to overcompensating with water, causing root stress.\n\n**Organic Solutions:**\n\n1. **Apply Organic Nitrogen** - Side-dress with compost or aged manure, or apply fish emulsion (1 tbsp/gallon) weekly for 3 weeks.\n\n2. **Improve Soil Drainage** - Ensure proper spacing and consider adding organic mulch to regulate moisture.\n\n3. **Remove Affected Leaves** - Prune yellowing bottom leaves to improve air circulation and reduce disease risk.\n\n**Monitoring:**\n- Check if yellowing progresses up the plant (indicates deficiency)\n- Look for signs of pests or disease spots\n- Test soil pH (tomatoes prefer 6.0-6.8)\n\n**When to Seek Help:**\n- If yellowing rapidly spreads to upper leaves\n- If you notice wilting, spots, or other symptoms\n- If treatment doesn't improve within 2 weeks",
    "threadId": "thread_abc123def456",
    "agentUsed": "farmAnalyst",
    "confidence": 0.85,
    "suggestions": [
      "Take a soil sample for nitrogen testing",
      "Check irrigation schedule and adjust if overwatering",
      "Apply organic nitrogen supplement within next 3 days",
      "Monitor upper leaves daily for progression"
    ],
    "relatedTopics": [
      "Companion planting for tomatoes",
      "Organic pest management in summer",
      "Crop rotation planning",
      "Soil health improvement"
    ],
    "citations": [
      {
        "title": "UC Davis - Tomato Nutrient Management",
        "snippet": "Nitrogen deficiency causes chlorosis (yellowing) beginning with older, lower leaves..."
      }
    ]
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 1247,
    "requestId": "550e8400-e29b-41d4-a716-446655440002",
    "processingTime": 3120,
    "conversationLength": 2
  }
}
```

**Continuing a Conversation:**

```bash
curl -X POST https://your-domain.com/api/ai/advisor \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thanks! I applied fish emulsion. How long until I see improvement?",
    "userId": "user_123",
    "threadId": "thread_abc123def456",
    "includeHistory": true
  }'
```

---

### 4. Pest Identification (Vision)

**POST** `/api/ai/pest-identify`

Identifies pests, diseases, and plant health issues from images using GPT-4 Vision.

#### Request Body

```typescript
{
  imageUrl: string;              // Required: URL or data:image/... base64
  cropType?: string;             // Optional: 2-100 chars
  symptoms?: string;             // Optional: max 500 chars
  location?: string;             // Optional: max 100 chars
  recentWeather?: string;        // Optional: max 200 chars
  farmingPractices?: string[];   // Optional
  analysisDepth?: 'quick' | 'detailed' | 'comprehensive'; // Default: 'detailed'
}
```

#### Response

```typescript
{
  success: boolean;
  data?: {
    identification: {
      type: 'pest' | 'disease' | 'deficiency' | 
            'environmental' | 'healthy' | 'unknown';
      name: string;
      scientificName?: string;
      commonNames?: string[];
      confidence: number;        // 0.0-1.0
    };
    severity: 'low' | 'moderate' | 'high' | 'critical';
    affectedAreas: string[];
    symptoms: string[];
    analysis: string;            // Detailed explanation
    causes: string[];
    organicTreatments: Array<{
      method: string;
      description: string;
      effectiveness: 'high' | 'moderate' | 'low';
      timeToResults: string;
      materials: string[];
    }>;
    conventionalTreatments?: Array<{
      method: string;
      description: string;
      activeIngredient?: string;
      precautions: string[];
    }>;
    prevention: string[];
    monitoring: string[];
    whenToSeekHelp: string[];
    additionalResources?: Array<{
      title: string;
      url?: string;
      type: 'article' | 'video' | 'guide' | 'extension';
    }>;
  };
  metadata?: {
    model: string;
    tokensUsed: number;
    requestId: string;
    processingTime: number;
    imageAnalysisQuality: 'high' | 'medium' | 'low';
  };
}
```

#### Example Request (with URL)

```bash
curl -X POST https://your-domain.com/api/ai/pest-identify \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/images/aphids-on-leaf.jpg",
    "cropType": "Tomatoes",
    "symptoms": "Small green insects clustering on undersides of leaves, sticky residue",
    "location": "Northern California",
    "recentWeather": "Warm and humid, minimal rain",
    "farmingPractices": ["ORGANIC"],
    "analysisDepth": "detailed"
  }'
```

#### Example Request (with Base64)

```bash
curl -X POST https://your-domain.com/api/ai/pest-identify \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "cropType": "Tomatoes",
    "analysisDepth": "comprehensive"
  }'
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "identification": {
      "type": "pest",
      "name": "Green Peach Aphid",
      "scientificName": "Myzus persicae",
      "commonNames": ["Aphids", "Plant Lice", "Greenfly"],
      "confidence": 0.92
    },
    "severity": "moderate",
    "affectedAreas": ["Leaf undersides", "New growth", "Stems"],
    "symptoms": [
      "Small green to yellow soft-bodied insects in clusters",
      "Sticky honeydew secretion on leaves",
      "Curled or distorted new growth",
      "Sooty mold may develop on honeydew"
    ],
    "analysis": "The image shows a moderate infestation of green peach aphids (Myzus persicae) on tomato plants. These small, soft-bodied insects are feeding on plant sap, primarily on the undersides of leaves and new growth. The presence of sticky honeydew indicates active feeding. While this is a moderate infestation, prompt treatment is recommended as aphids reproduce rapidly and can transmit viral diseases. The warm, humid conditions you mentioned are ideal for aphid population growth.",
    "causes": [
      "Warm temperatures (65-80°F) favor rapid reproduction",
      "High humidity creates ideal conditions",
      "Nitrogen-rich soil can make plants more susceptible",
      "Lack of natural predators (ladybugs, lacewings)",
      "Stressed plants are more attractive to aphids"
    ],
    "organicTreatments": [
      {
        "method": "Strong Water Spray",
        "description": "Use a strong stream of water from a hose to physically knock aphids off plants. Focus on undersides of leaves. Repeat every 2-3 days for 2 weeks. Best done in morning so plants dry quickly.",
        "effectiveness": "moderate",
        "timeToResults": "Immediate reduction, full control in 1-2 weeks",
        "materials": ["Garden hose with spray nozzle"]
      },
      {
        "method": "Insecticidal Soap",
        "description": "Spray organic insecticidal soap (or 2% dish soap solution) directly on aphids, covering all surfaces. Spray early morning or evening to avoid leaf burn. Repeat every 3-5 days for 2 weeks.",
        "effectiveness": "high",
        "timeToResults": "24-48 hours for visible reduction",
        "materials": ["Insecticidal soap", "Sprayer", "Dawn dish soap (alternative)"]
      },
      {
        "method": "Neem Oil",
        "description": "Apply diluted neem oil (follow label rates) as foliar spray. Acts as repellent and disrupts aphid lifecycle. Apply weekly. Do not use in temperatures above 85°F.",
        "effectiveness": "high",
        "timeToResults": "3-7 days for population reduction",
        "materials": ["Organic neem oil", "Spray bottle", "Water"]
      },
      {
        "method": "Beneficial Insect Release",
        "description": "Release ladybugs or lacewings (1,500-4,500 per garden). Release in evening near affected plants. Provide water source and shelter to encourage them to stay. This is a long-term solution.",
        "effectiveness": "high",
        "timeToResults": "7-14 days for control",
        "materials": ["Ladybugs or lacewing larvae (purchase from garden center)"]
      }
    ],
    "conventionalTreatments": [
      {
        "method": "Pyrethrin-based Insecticide",
        "description": "Apply pyrethrin spray according to label directions. Effective for severe infestations. OMRI-listed versions available for organic certification.",
        "activeIngredient": "Pyrethrins",
        "precautions": [
          "Toxic to bees - apply late evening when bees inactive",
          "Wear protective equipment",
          "Observe pre-harvest interval",
          "May harm beneficial insects"
        ]
      }
    ],
    "prevention": [
      "Inspect plants weekly, especially undersides of leaves",
      "Avoid over-fertilizing with nitrogen",
      "Companion plant with aphid-repelling herbs (basil, chives, mint)",
      "Encourage beneficial insects with diverse plantings",
      "Remove weeds that can harbor aphids",
      "Use reflective mulches to confuse aphids",
      "Maintain plant health through proper watering and nutrition"
    ],
    "monitoring": [
      "Check plants every 2-3 days after treatment",
      "Look for new aphid colonies on fresh growth",
      "Monitor for presence of beneficial insects (ladybugs, lacewings)",
      "Watch for signs of viral diseases (mottling, stunting)",
      "Check for ants farming aphids (control ants if present)",
      "Observe honeydew levels - should decrease with successful treatment"
    ],
    "whenToSeekHelp": [
      "If infestation continues to spread despite treatment",
      "If plants show signs of viral disease (mosaic patterns, severe stunting)",
      "If you're unsure about pesticide application",
      "If you have organic certification and need approved treatments",
      "If beneficial insects don't establish or population returns rapidly"
    ],
    "additionalResources": [
      {
        "title": "UC IPM - Aphids on Tomatoes",
        "url": "https://ipm.ucanr.edu/PMG/GARDEN/VEGES/PESTS/aphids.html",
        "type": "guide"
      },
      {
        "title": "How to Control Aphids Organically",
        "type": "video"
      }
    ]
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 2145,
    "requestId": "550e8400-e29b-41d4-a716-446655440003",
    "processingTime": 4560,
    "imageAnalysisQuality": "high"
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

### Standard Error Response

```typescript
{
  success: false,
  error: {
    code: string;        // Error code for programmatic handling
    message: string;     // Human-readable error message
    details?: any;       // Additional error context
  },
  metadata?: {
    model: string;
    tokensUsed: number;
    requestId: string;
    processingTime: number;
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `INVALID_IMAGE` | 400 | Image format/size invalid (pest-identify only) |
| `UNAUTHORIZED` | 401 | Authentication required (if implemented) |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests (if implemented) |
| `INTERNAL_ERROR` | 500 | Server error or OpenAI API failure |
| `SERVICE_UNAVAILABLE` | 503 | OpenAI API unavailable |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "code": "too_small",
        "minimum": 2,
        "type": "string",
        "inclusive": true,
        "exact": false,
        "message": "String must contain at least 2 character(s)",
        "path": ["productName"]
      }
    ]
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 0,
    "requestId": "550e8400-e29b-41d4-a716-446655440004",
    "processingTime": 23
  }
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Using fetch API
async function generateProductDescription(productData: any) {
  try {
    const response = await fetch('/api/ai/product-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('Failed to generate description:', error);
    throw error;
  }
}

// Usage
const description = await generateProductDescription({
  productName: 'Organic Kale',
  category: 'VEGETABLES',
  farmName: 'Green Valley Farm',
  farmingPractices: ['ORGANIC'],
  tone: 'casual',
  length: 'medium',
});

console.log(description.description);
```

### React Hook

```typescript
// useAIDescription.ts
import { useState } from 'react';

export function useAIDescription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}

// Component usage
function ProductForm() {
  const { generate, loading, error } = useAIDescription();

  const handleGenerate = async () => {
    const result = await generate({
      productName: 'Organic Strawberries',
      category: 'FRUITS',
      // ...
    });

    console.log(result.description);
  };

  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Description'}
    </button>
  );
}
```

### Python

```python
import requests
import json

def generate_pricing_recommendation(product_data):
    """Generate pricing recommendation using AI endpoint"""
    url = "https://your-domain.com/api/ai/pricing"
    
    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json=product_data
    )
    
    result = response.json()
    
    if not result.get("success"):
        raise Exception(result["error"]["message"])
    
    return result["data"]

# Usage
pricing = generate_pricing_recommendation({
    "productName": "Organic Blueberries",
    "category": "BERRIES",
    "unit": "lb",
    "farmingPractices": ["ORGANIC"],
    "productionCost": 4.50,
    "competitorPrices": [7.99, 8.49, 7.50],
    "distributionChannel": "farmers_market"
})

print(f"Recommended price: ${pricing['recommendedPrice']:.2f}")
print(f"Price range: ${pricing['priceRange']['min']:.2f} - ${pricing['priceRange']['max']:.2f}")
```

---

## Best Practices

### 1. **Caching Responses**

AI responses are expensive. Cache results when possible:

```typescript
import { cache } from '@/lib/cache';

async function getCachedDescription(productData: any) {
  const cacheKey = `ai:description:${JSON.stringify(productData)}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // Generate new
  const response = await fetch('/api/ai/product-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  
  const result = await response.json();
  
  // Cache for 7 days
  if (result.success) {
    await cache.set(cacheKey, result.data, 60 * 60 * 24 * 7);
  }
  
  return result.data;
}
```

### 2. **Batch Processing**

Process multiple items efficiently:

```typescript
// Generate descriptions for multiple products
async function batchGenerateDescriptions(products: any[]) {
  const results = await Promise.allSettled(
    products.map(product => 
      fetch('/api/ai/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }).then(r => r.json())
    )
  );
  
  return results.map((result, index) => ({
    product: products[index],
    data: result.status === 'fulfilled' ? result.value.data : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}
```

### 3. **Retry Logic with Exponential Backoff**

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
) {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) return response;
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
      
      // Retry on server errors (5xx)
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;
    }
    
    // Exponential backoff: 1s, 2s, 4s
    if (i < maxRetries - 1) {
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  
  throw lastError!;
}
```

### 4. **Image Optimization (Pest Identify)**

```typescript
// Compress image before sending
async function compressImage(
  file: File,
  maxSizeMB = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usage
const compressedImage = await compressImage(uploadedFile);
const result = await fetch('/api/ai/pest-identify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: compressedImage,
    cropType: 'Tomatoes',
  }),
});
```

### 5. **Progress Indicators for Long Operations**

```typescript
// For advisor with streaming (future enhancement)
async function streamAdvisorResponse(message: string) {
  const response = await fetch('/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  
  // Show immediate feedback
  showLoadingIndicator();
  
  const result = await response.json();
  
  hideLoadingIndicator();
  return result.data;
}
```

### 6. **Cost Tracking**

```typescript
// Track AI usage costs
interface AIUsageLog {
  endpoint: string;
  tokensUsed: number;
  estimatedCost: number;
  userId?: string;
  timestamp: Date;
}

async function logAIUsage(log: AIUsageLog) {
  await database.aIUsageLog.create({ data: log });
}

// After AI call
const result = await fetch('/api/ai/pricing', { ... });
const data = await result.json();

if (data.success && data.metadata) {
  await logAIUsage({
    endpoint: '/api/ai/pricing',
    tokensUsed: data.metadata.tokensUsed,
    estimatedCost: (data.metadata.tokensUsed / 1000) * 0.01, // $0.01 per 1K tokens estimate
    userId: session?.user?.id,
    timestamp: new Date(),
  });
}
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Usage Metrics**
   - Total requests per endpoint
   - Requests per user/farm
   - Peak usage times

2. **Performance Metrics**
   - Average response time
   - Token usage per request
   - Success/error rates

3. **Cost Metrics**
   - Daily/monthly OpenAI costs
   - Cost per user/farm
   - Most expensive endpoints

4. **Quality Metrics**
   - Average confidence scores
   - User feedback ratings
   - Retry/regeneration rates

### Example Monitoring Query

```typescript
// Get daily AI usage summary
const summary = await database.$queryRaw`
  SELECT 
    DATE(created_at) as date,
    endpoint,
    COUNT(*) as request_count,
    SUM(tokens_used) as total_tokens,
    SUM(estimated_cost) as total_cost,
    AVG(confidence) as avg_confidence
  FROM ai_usage_logs
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at), endpoint
  ORDER BY date DESC, endpoint
`;
```

---

## Troubleshooting

### Common Issues

**Issue**: `OPENAI_API_KEY environment variable is not set`
- **Solution**: Add `OPENAI_API_KEY=sk-...` to `.env.local`

**Issue**: `429 Rate Limit Exceeded` from OpenAI
- **Solution**: Implement request queuing and user-level rate limiting

**Issue**: High latency on vision endpoint
- **Solution**: Use `analysisDepth: 'quick'` for faster results, compress images

**Issue**: Low confidence scores
- **Solution**: Provide more context in requests (farmingPractices, certifications, etc.)

**Issue**: Inconsistent pricing recommendations
- **Solution**: Always include `productionCost` and `competitorPrices` for better accuracy

---

## Future Enhancements

- [ ] Streaming responses for real-time advisor chat
- [ ] Multi-language support
- [ ] Voice input for advisor
- [ ] Batch image analysis for pest surveys
- [ ] Integration with weather APIs for pricing
- [ ] Historical pricing trend analysis
- [ ] A/B testing for description variations
- [ ] Automated product tagging pipeline
- [ ] Mobile SDK for on-farm pest identification

---

## Support & Feedback

For questions, issues, or feature requests:
- Create a GitHub issue
- Contact the AI team
- Check the main documentation at `/docs/`

**Last Updated**: January 2025  
**Maintained by**: Farmers Market Platform AI Team