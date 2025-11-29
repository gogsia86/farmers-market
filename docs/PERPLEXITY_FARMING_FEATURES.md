# 🌾 Perplexity AI Farming Features

**Divine Agricultural Intelligence for Farmers Market Platform**

This document provides comprehensive documentation for the 5 AI-powered farming features integrated with Perplexity AI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

---

## 🎯 Overview

The Perplexity Farming Features provide AI-powered agricultural intelligence to help farmers make informed decisions, access real-time research, and get expert guidance. All features leverage Perplexity's search-enabled AI models with citation-backed responses.

### Key Benefits

- ✅ **Real-time Research**: Access current agricultural knowledge with citations
- ✅ **Season-Aware**: Context-aware recommendations based on current season
- ✅ **Citation-Backed**: All responses include credible sources
- ✅ **Agricultural Focus**: Domain-specific knowledge for organic farming
- ✅ **Scalable**: Built with enterprise patterns for high performance

---

## 🚀 Features

### 1. Smart Farming Advice

Real-time agricultural research answering farmer questions with expert guidance.

**Capabilities:**
- Instant answers to farming questions
- Category-specific advice (pest control, soil health, irrigation, etc.)
- Seasonal context awareness
- Multiple depth levels (quick, comprehensive, expert)
- Related questions for exploration

**Use Cases:**
- Pest and disease identification
- Soil preparation guidance
- Planting timing recommendations
- Harvest optimization
- Organic farming practices

### 2. Product Recommendations

Season-aware product suggestions with reasoning and market context.

**Capabilities:**
- Seasonal product recommendations
- Location-specific suggestions
- Budget-aware filtering
- Reasoning for each recommendation
- Alternative options
- Priority-based ranking

**Use Cases:**
- Seasonal supply planning
- Equipment recommendations
- Seed and plant selection
- Organic inputs sourcing
- Farm infrastructure planning

### 3. Market Intelligence

Current trends in organic farming and local food markets.

**Capabilities:**
- Market trend analysis
- Consumer demand insights
- Price trend monitoring
- Competitive landscape
- Business opportunities
- Regional market data

**Use Cases:**
- Market entry planning
- Pricing strategy
- Product selection
- Sales channel optimization
- Competitive positioning

### 4. Educational Content

Research-backed farming guides and tutorials with structured learning.

**Capabilities:**
- Comprehensive farming guides
- Step-by-step tutorials
- Skill-level appropriate content (Beginner/Intermediate/Advanced)
- Multiple formats (Guide, Tutorial, Quick Tip, Deep Dive)
- Practical tips and best practices
- Common mistakes to avoid

**Use Cases:**
- Farmer education and training
- New technique adoption
- Skill development
- Problem-solving guidance
- Knowledge base building

### 5. AI-Powered Support

Intelligent conversational support for farmer questions and challenges.

**Capabilities:**
- Context-aware responses
- Conversation history tracking
- Suggested actions
- Escalation detection
- Farm-specific context
- Multi-turn conversations

**Use Cases:**
- Real-time problem solving
- Troubleshooting assistance
- Planning guidance
- Emergency response
- General farming questions

---

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   └── api/
│       └── farming/
│           ├── advice/route.ts           # Smart Farming Advice API
│           ├── products/
│           │   └── recommendations/route.ts  # Product Recommendations API
│           ├── market/route.ts           # Market Intelligence API
│           ├── education/route.ts        # Educational Content API
│           └── support/route.ts          # AI Support API
├── lib/
│   ├── services/
│   │   └── perplexity-farming.service.ts  # Core service layer
│   └── ai/
│       └── perplexity.ts                 # Perplexity client
└── types/
    └── farming-advice.types.ts           # Type definitions
```

### Service Layer

The `PerplexityFarmingService` class provides a centralized service layer with:

- OpenTelemetry tracing integration
- Error handling and logging
- Response standardization
- Agricultural context awareness
- Citation formatting
- Confidence scoring

### Type Safety

All features use strict TypeScript types defined in `farming-advice.types.ts`:

- Request/Response interfaces
- Validation schemas
- Branded types for IDs
- Season and category enums
- Citation structures

---

## 🔌 API Endpoints

All endpoints require authentication and return standardized JSON responses.

### 1. Smart Farming Advice

**Endpoint:** `POST /api/farming/advice`

**Request Body:**
```json
{
  "question": "How do I prevent blight in my tomato plants organically?",
  "category": "PEST_CONTROL",
  "farmLocation": "California",
  "currentSeason": "SUMMER",
  "depth": "comprehensive",
  "includeRelatedQuestions": true,
  "recencyFilter": "month"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Detailed answer with agricultural guidance...",
    "citations": [
      {
        "url": "https://example.com/article",
        "title": "Source 1",
        "relevance": 1.0
      }
    ],
    "confidence": 0.92,
    "agriculturalRelevance": 0.95,
    "category": "PEST_CONTROL",
    "season": "SUMMER",
    "relatedQuestions": ["How to identify tomato blight?", ...],
    "metadata": {
      "requestId": "trace-id-123",
      "timestamp": "2024-01-15T10:30:00Z",
      "tokensUsed": 450,
      "processingTimeMs": 2500,
      "model": "sonar-pro",
      "sources": 5
    }
  }
}
```

### 2. Product Recommendations

**Endpoint:** `POST /api/farming/products/recommendations`

**Request Body:**
```json
{
  "season": "SPRING",
  "location": "Pacific Northwest",
  "farmType": "Organic vegetable farm",
  "previousPurchases": ["compost", "seedlings"],
  "budget": {
    "min": 100,
    "max": 5000
  },
  "includeReasoning": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "productName": "Cold frame kits",
        "category": "Equipment",
        "reasoning": "Essential for spring season extension...",
        "seasonalRelevance": 0.95,
        "priority": "HIGH",
        "estimatedValue": "High",
        "benefits": ["Extends growing season", "Protects seedlings"],
        "considerations": ["Initial investment required"],
        "alternatives": ["Row covers", "Hoop houses"]
      }
    ],
    "seasonalInsights": {
      "season": "SPRING",
      "keyActivities": ["Soil preparation", "Early planting"],
      "commonChallenges": ["Late frosts", "Soil temperature"],
      "opportunities": ["Early markets", "Premium pricing"],
      "bestPractices": ["Gradual hardening off", "Succession planting"]
    },
    "marketContext": "Current spring market analysis...",
    "citations": [...],
    "metadata": {
      "season": "SPRING",
      "generatedAt": "2024-01-15T10:30:00Z",
      "confidenceScore": 0.88
    }
  }
}
```

### 3. Market Intelligence

**Endpoint:** `POST /api/farming/market`

**Request Body:**
```json
{
  "region": "Pacific Northwest",
  "topics": ["organic vegetables", "local markets", "direct sales"],
  "timeframe": "month",
  "includeCompetitiveAnalysis": true,
  "includePriceTrends": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": "Comprehensive market overview...",
    "trends": [
      {
        "title": "Organic Produce Demand Growth",
        "description": "Continued increase in consumer demand...",
        "impact": "HIGH",
        "direction": "RISING",
        "timeframe": "2024-2025",
        "relevance": 0.9,
        "citations": [...]
      }
    ],
    "insights": [
      {
        "category": "Consumer Trends",
        "finding": "Local food demand continues to grow",
        "implications": ["Direct-to-consumer opportunity"],
        "actionable": true,
        "confidence": 0.85
      }
    ],
    "opportunities": [
      {
        "title": "Farm-to-Table Partnerships",
        "description": "Direct partnerships with restaurants...",
        "potential": "HIGH",
        "effort": "MEDIUM",
        "timeToMarket": "3-6 months",
        "requirements": ["Consistent supply", "Quality standards"],
        "risks": ["Seasonality", "Volume requirements"]
      }
    ],
    "citations": [...],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Educational Content

**Endpoint:** `POST /api/farming/education`

**Request Body:**
```json
{
  "topic": "Companion planting for organic gardens",
  "level": "BEGINNER",
  "format": "GUIDE",
  "includeVisualGuidance": false,
  "includeStepByStep": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Complete Guide to Companion planting for organic gardens",
    "content": {
      "overview": "Comprehensive overview...",
      "keyPoints": [
        "Benefits of companion planting",
        "Common companion pairs",
        "Plants to avoid pairing"
      ],
      "detailedSections": [
        {
          "title": "Understanding Companion Planting",
          "content": "Detailed explanation...",
          "subsections": [...]
        }
      ],
      "practicalTips": ["Start small", "Observe results"],
      "commonMistakes": ["Overcrowding", "Ignoring plant needs"],
      "expertAdvice": ["Rotate companions annually"],
      "resources": [
        {
          "title": "Companion Planting Chart",
          "url": "https://example.com/chart",
          "type": "TOOL",
          "description": "Visual reference guide"
        }
      ]
    },
    "citations": [...],
    "relatedTopics": ["Crop rotation", "Soil health"],
    "nextSteps": [
      "Plan your garden layout",
      "Start with proven combinations"
    ],
    "metadata": {
      "difficulty": "BEGINNER",
      "estimatedReadTime": 8,
      "lastUpdated": "2024-01-15T10:30:00Z",
      "credibilityScore": 0.91,
      "sourcesCount": 7
    }
  }
}
```

### 5. AI-Powered Support

**Endpoint:** `POST /api/farming/support`

**Request Body:**
```json
{
  "conversationId": "conv_123456",
  "message": "My cucumber plants are wilting despite regular watering",
  "context": {
    "farmId": "farm_789",
    "currentSeason": "SUMMER",
    "location": "Arizona",
    "farmType": "Organic vegetable farm"
  },
  "includeHistory": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123456",
    "message": {
      "id": "msg_abc123",
      "role": "ASSISTANT",
      "content": "Wilting despite regular watering suggests...",
      "citations": [...],
      "confidence": 0.87,
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "tokensUsed": 320,
        "processingTime": 1800,
        "model": "sonar-pro"
      }
    },
    "suggestedActions": [
      {
        "title": "Check Soil Drainage",
        "description": "Examine soil drainage patterns...",
        "priority": "HIGH",
        "category": "Diagnosis",
        "estimatedTime": "30 minutes",
        "difficulty": "EASY"
      }
    ],
    "relatedResources": [...],
    "needsEscalation": false
  }
}
```

---

## 💻 Usage Examples

### TypeScript/JavaScript

```typescript
// 1. Smart Farming Advice
const adviceResponse = await fetch('/api/farming/advice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'How do I prepare soil for spring planting?',
    category: 'SOIL_HEALTH',
    depth: 'comprehensive',
  }),
});

const advice = await adviceResponse.json();
console.log(advice.data.answer);
console.log(advice.data.citations);

// 2. Product Recommendations
const recsResponse = await fetch('/api/farming/products/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    season: 'SUMMER',
    location: 'California',
  }),
});

const recommendations = await recsResponse.json();
recommendations.data.recommendations.forEach(rec => {
  console.log(`${rec.productName}: ${rec.reasoning}`);
});

// 3. Market Intelligence
const marketResponse = await fetch('/api/farming/market', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    region: 'United States',
    topics: ['organic farming', 'local markets'],
    timeframe: 'month',
  }),
});

const marketData = await marketResponse.json();
console.log(marketData.data.trends);

// 4. Educational Content
const eduResponse = await fetch('/api/farming/education', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: 'Organic pest management',
    level: 'INTERMEDIATE',
    format: 'GUIDE',
  }),
});

const guide = await eduResponse.json();
console.log(guide.data.title);
console.log(guide.data.content.keyPoints);

// 5. AI Support
const supportResponse = await fetch('/api/farming/support', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'My tomato plants have yellow leaves',
    context: {
      currentSeason: 'SUMMER',
      location: 'Texas',
    },
  }),
});

const support = await supportResponse.json();
console.log(support.data.message.content);
console.log(support.data.suggestedActions);
```

### Service Layer Usage

```typescript
import {
  getFarmingAdvice,
  getProductRecommendations,
  getMarketIntelligence,
  getEducationalContent,
  handleSupportRequest,
} from '@/lib/services/perplexity-farming.service';

// Direct service layer usage (server-side only)
const advice = await getFarmingAdvice({
  question: 'Best practices for organic tomato farming?',
  category: 'CROP_MANAGEMENT',
  depth: 'comprehensive',
});

const recommendations = await getProductRecommendations({
  season: 'SPRING',
  location: 'Oregon',
});

const intelligence = await getMarketIntelligence({
  region: 'West Coast',
  topics: ['organic produce'],
});

const content = await getEducationalContent({
  topic: 'Composting techniques',
  level: 'BEGINNER',
});

const support = await handleSupportRequest({
  userId: 'user123',
  message: 'Help with pest control',
  context: { currentSeason: 'SUMMER' },
});
```

---

## 🧪 Testing

### Run All Feature Tests

```bash
npm run test:perplexity:farming
```

This comprehensive test suite verifies:
- ✅ Smart Farming Advice with multiple categories
- ✅ Product Recommendations across seasons
- ✅ Market Intelligence with regional data
- ✅ Educational Content generation
- ✅ AI Support conversations

### Test Individual Features

```typescript
// scripts/testing/test-perplexity-farming.ts
// Modify TEST_CONFIG to run specific tests:

const TEST_CONFIG = {
  runAll: true,
  testFarmingAdvice: true,
  testProductRecommendations: true,
  testMarketIntelligence: true,
  testEducationalContent: true,
  testSupport: true,
};
```

### Manual API Testing

Using cURL:

```bash
# Test Farming Advice
curl -X POST http://localhost:3000/api/farming/advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I improve soil health?",
    "category": "SOIL_HEALTH",
    "depth": "quick"
  }'

# Test Product Recommendations
curl -X GET http://localhost:3000/api/farming/products/recommendations

# Test Support
curl -X POST http://localhost:3000/api/farming/support \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My plants are wilting",
    "context": {"currentSeason": "SUMMER"}
  }'
```

---

## ⚙️ Configuration

### Environment Variables

Required in `.env`:

```bash
# Perplexity API Configuration
PERPLEXITY_API_KEY=pplx-your-api-key-here
PERPLEXITY_DEFAULT_MODEL=sonar-pro

# Optional: Override base URL
PERPLEXITY_BASE_URL=https://api.perplexity.ai
```

### Service Configuration

The service can be customized via constructor:

```typescript
import { PerplexityFarmingService } from '@/lib/services/perplexity-farming.service';

// Custom instance
const service = new PerplexityFarmingService('custom-api-key');

// Use singleton (recommended)
import { getPerplexityFarmingService } from '@/lib/services/perplexity-farming.service';
const service = getPerplexityFarmingService();
```

### Categories

Available farming categories:

- `CROP_MANAGEMENT` - General crop management
- `PEST_CONTROL` - Pest and disease management
- `SOIL_HEALTH` - Soil preparation and health
- `IRRIGATION` - Water management
- `HARVESTING` - Harvest timing and techniques
- `ORGANIC_PRACTICES` - Organic farming methods
- `MARKET_TRENDS` - Market and sales
- `SEASONAL_PLANNING` - Seasonal planning
- `EQUIPMENT` - Tools and equipment
- `SUSTAINABILITY` - Sustainable practices

### Seasons

```typescript
type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
```

Auto-detected via `getCurrentSeason()` utility.

---

## 🎯 Best Practices

### 1. Error Handling

Always check `success` field and handle errors:

```typescript
const result = await getFarmingAdvice(request);

if (result.success && result.data) {
  // Use result.data
  console.log(result.data.answer);
} else {
  // Handle error
  console.error(result.error?.message);
}
```

### 2. Citation Display

Always display citations to maintain credibility:

```typescript
if (result.data.citations && result.data.citations.length > 0) {
  console.log('Sources:');
  result.data.citations.forEach((citation, i) => {
    console.log(`${i + 1}. ${citation.url}`);
  });
}
```

### 3. Rate Limiting

Implement delays between requests:

```typescript
// Delay 2 seconds between requests
await delay(2000);

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 4. Context Awareness

Provide seasonal and location context:

```typescript
const request = {
  question: 'When should I plant tomatoes?',
  farmLocation: 'California',
  currentSeason: getCurrentSeason(),
  depth: 'comprehensive',
};
```

### 5. Caching

Consider caching responses for frequently asked questions:

```typescript
const cacheKey = `advice:${question}:${season}`;
const cached = cache.get(cacheKey);

if (cached) {
  return cached;
}

const result = await getFarmingAdvice(request);
cache.set(cacheKey, result, { ttl: 3600 }); // 1 hour
```

### 6. User Experience

- Show loading states during API calls
- Display confidence scores to users
- Provide related questions for exploration
- Enable conversation history in support
- Suggest actions based on responses

### 7. Monitoring

Use OpenTelemetry traces for monitoring:

```typescript
// Traces are automatically created
// View in Azure Application Insights or your APM tool
// Span names: 'getFarmingAdvice', 'getProductRecommendations', etc.
```

---

## 🔒 Security

### Authentication

All API endpoints require authentication:

```typescript
const session = await auth();

if (!session?.user) {
  return NextResponse.json(
    { success: false, error: { code: 'AUTHENTICATION_REQUIRED' } },
    { status: 401 }
  );
}
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
const validation = FarmingAdviceSchema.safeParse(body);

if (!validation.success) {
  return NextResponse.json(
    { success: false, error: { code: 'VALIDATION_ERROR' } },
    { status: 400 }
  );
}
```

### API Key Management

- Never expose `PERPLEXITY_API_KEY` to client
- Use server-side only (API routes, Server Actions)
- Store in environment variables
- Rotate keys regularly

---

## 📊 Performance

### Optimization Tips

1. **Parallel Requests**: When fetching multiple features:
```typescript
const [advice, recommendations, intelligence] = await Promise.all([
  getFarmingAdvice(adviceRequest),
  getProductRecommendations(recsRequest),
  getMarketIntelligence(marketRequest),
]);
```

2. **Depth Selection**:
- Use `quick` for simple questions
- Use `comprehensive` for detailed guidance
- Use `expert` for complex research

3. **Caching Strategy**:
- Cache static educational content
- Cache seasonal recommendations
- Cache market intelligence (with TTL)

4. **Selective Fields**: Request only needed data:
```typescript
{
  includeRelatedQuestions: false, // If not needed
  includeReasoning: false,        // Skip reasoning
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. API Key Not Found**
```
Error: PERPLEXITY_API_KEY not configured
```
**Solution**: Add `PERPLEXITY_API_KEY` to `.env` file

**2. Rate Limiting**
```
Error: Rate limit exceeded
```
**Solution**: Implement delays between requests, use caching

**3. Low Confidence Scores**
```
Confidence: 0.45 (low)
```
**Solution**: Rephrase question, add more context, use higher depth level

**4. No Citations**
```
Citations: []
```
**Solution**: Perplexity couldn't find sources; try different search terms

**5. Authentication Errors**
```
Error: AUTHENTICATION_REQUIRED
```
**Solution**: Ensure user is logged in before calling API

---

## 📝 API Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response data |
| 400 | Validation Error | Check request format |
| 401 | Unauthorized | Authenticate user |
| 403 | Forbidden | Check permissions |
| 500 | Server Error | Retry or contact support |

---

## 🔄 Updates & Maintenance

### Version History

- **v1.0.0** (2024-01-15): Initial implementation of all 5 features
  - Smart Farming Advice
  - Product Recommendations
  - Market Intelligence
  - Educational Content
  - AI-Powered Support

### Planned Features

- [ ] Image analysis for pest/disease identification
- [ ] Voice input for support conversations
- [ ] Multi-language support
- [ ] Offline mode with cached content
- [ ] Advanced analytics dashboard
- [ ] Personalized recommendations based on history

---

## 📞 Support

### Documentation

- Main Documentation: `/docs/PERPLEXITY_FARMING_FEATURES.md` (this file)
- Type Definitions: `/src/types/farming-advice.types.ts`
- Service Layer: `/src/lib/services/perplexity-farming.service.ts`
- API Routes: `/src/app/api/farming/*`

### Testing

- Test Script: `npm run test:perplexity:farming`
- Test File: `/scripts/testing/test-perplexity-farming.ts`

### Resources

- [Perplexity API Docs](https://docs.perplexity.ai)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)

---

## 🌟 Success Metrics

Track these metrics to measure feature success:

- **Usage Metrics**:
  - API requests per feature
  - Average response time
  - Error rates
  
- **Quality Metrics**:
  - Average confidence scores
  - Citation counts
  - User satisfaction ratings
  
- **Business Metrics**:
  - Farmer engagement
  - Time saved per query
  - Problem resolution rate

---

## 🙏 Credits

Built with:
- **Perplexity AI** - Search-enabled AI models
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **OpenTelemetry** - Observability
- **Zod** - Validation

Developed following **Divine Agricultural Consciousness** patterns from the Farmers Market Platform.

---

**Last Updated**: January 15, 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

🌾 **Happy Farming!** 🌾