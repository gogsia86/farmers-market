# AI Features Quick Start Guide

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready

---

## 🚀 Get Started in 5 Minutes

This guide will help you quickly integrate the AI features into your application.

---

## Prerequisites

1. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com)
2. **Environment Setup**: Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-proj-...your-key-here
   ```

---

## Quick Test

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Product Description Generator

```bash
curl -X POST http://localhost:3000/api/ai/product-description \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Organic Tomatoes",
    "category": "VEGETABLES",
    "farmName": "Sunny Valley Farm",
    "tone": "casual",
    "length": "medium"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "description": "Fresh organic tomatoes from Sunny Valley Farm...",
    "shortDescription": "Organic tomatoes, locally grown...",
    "seoTitle": "Organic Tomatoes - Sunny Valley Farm",
    "seoMetaDescription": "Fresh, locally grown organic tomatoes...",
    "suggestedTags": ["organic", "tomatoes", "vegetables", "local", "fresh"],
    "wordCount": 187,
    "confidence": 0.87
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 542,
    "requestId": "...",
    "processingTime": 2340
  }
}
```

---

## Available Endpoints

### 1. Product Description Generator
**POST** `/api/ai/product-description`

```typescript
// Minimal request
{
  "productName": "Strawberries",
  "category": "FRUITS"
}

// Full request
{
  "productName": "Organic Strawberries",
  "category": "FRUITS",
  "farmName": "Green Acres",
  "farmingPractices": ["ORGANIC"],
  "certifications": ["ORGANIC"],
  "flavorProfile": "Sweet, juicy, aromatic",
  "tone": "casual",           // professional, casual, storytelling, technical
  "length": "medium",         // short, medium, long
  "includeKeywords": ["organic", "local"]
}
```

---

### 2. Pricing Recommendations
**POST** `/api/ai/pricing`

```typescript
// Minimal request
{
  "productName": "Tomatoes",
  "category": "VEGETABLES",
  "unit": "lb"
}

// Full request
{
  "productName": "Organic Tomatoes",
  "category": "VEGETABLES",
  "unit": "lb",
  "farmingPractices": ["ORGANIC"],
  "productionCost": 2.50,
  "competitorPrices": [4.99, 5.49, 4.75],
  "region": "California",
  "season": "SUMMER",
  "isInSeason": true,
  "qualityGrade": "premium",  // premium, standard, economy
  "distributionChannel": "farmers_market"
}
```

**Returns**:
- Recommended price
- Price range (min/max/optimal)
- Pricing factors and reasoning
- 3-5 actionable recommendations
- Market insights

---

### 3. Agricultural Advisor
**POST** `/api/ai/advisor`

```typescript
// Simple question
{
  "message": "How do I prevent tomato blight?"
}

// With context
{
  "message": "My tomato plants have yellowing leaves. What should I do?",
  "userId": "user_123",
  "context": {
    "location": "California",
    "cropTypes": ["tomatoes", "peppers"],
    "farmingPractices": ["ORGANIC"],
    "currentSeason": "SUMMER"
  }
}

// Continue conversation
{
  "message": "Thanks! How often should I apply the treatment?",
  "threadId": "thread_abc123",  // From previous response
  "includeHistory": true
}
```

**Returns**:
- Detailed advice (200-500 words)
- Thread ID for conversation continuity
- Follow-up suggestions
- Related topics
- Citations and resources

---

### 4. Pest Identification (Vision)
**POST** `/api/ai/pest-identify`

```typescript
// With image URL
{
  "imageUrl": "https://example.com/plant-image.jpg",
  "cropType": "Tomatoes",
  "analysisDepth": "detailed"  // quick, detailed, comprehensive
}

// With base64 image
{
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "cropType": "Tomatoes",
  "symptoms": "Holes in leaves, small insects visible",
  "location": "Northern California",
  "farmingPractices": ["ORGANIC"],
  "analysisDepth": "comprehensive"
}
```

**Returns**:
- Pest/disease identification (with scientific name)
- Severity level (low/moderate/high/critical)
- Detailed analysis
- Organic treatment options (3-5 methods)
- Conventional treatments (optional)
- Prevention strategies
- Monitoring guidelines

---

## Integration Examples

### React Component - Product Description

```typescript
import { useState } from 'react';

export function ProductDescriptionGenerator() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const generateDescription = async (productData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        setDescription(result.data.description);
      } else {
        alert(result.error.message);
      }
    } catch (error) {
      alert('Failed to generate description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => generateDescription({
          productName: 'Organic Tomatoes',
          category: 'VEGETABLES',
          tone: 'casual',
          length: 'medium'
        })}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Description'}
      </button>
      {description && <p>{description}</p>}
    </div>
  );
}
```

---

### React Component - Pest Identification

```typescript
import { useState } from 'react';

export function PestIdentifier() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeImage = async (file: File) => {
    setLoading(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      try {
        const response = await fetch('/api/ai/pest-identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: base64,
            cropType: 'Tomatoes',
            analysisDepth: 'detailed'
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setResult(data.data);
        } else {
          alert(data.error.message);
        }
      } catch (error) {
        alert('Failed to analyze image');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            analyzeImage(e.target.files[0]);
          }
        }}
        disabled={loading}
      />
      {loading && <p>Analyzing image...</p>}
      {result && (
        <div>
          <h3>{result.identification.name}</h3>
          <p>Severity: {result.severity}</p>
          <p>{result.analysis}</p>
          <h4>Treatments:</h4>
          <ul>
            {result.organicTreatments.map((t, i) => (
              <li key={i}>
                <strong>{t.method}</strong>: {t.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### Custom Hook - Advisor Chat

```typescript
import { useState } from 'react';

export function useAdvisorChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          threadId,
          includeHistory: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add assistant response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.data.response,
          suggestions: result.data.suggestions
        }]);
        
        // Update thread ID for conversation continuity
        setThreadId(result.data.threadId);
      } else {
        alert(result.error.message);
      }
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}

// Usage in component
function AdvisorChat() {
  const { messages, sendMessage, loading } = useAdvisorChat();
  const [input, setInput] = useState('');

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            <p>{msg.content}</p>
            {msg.suggestions && (
              <ul>
                {msg.suggestions.map((s: string, j: number) => (
                  <li key={j}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            sendMessage(input);
            setInput('');
          }
        }}
        disabled={loading}
        placeholder="Ask an agricultural question..."
      />
    </div>
  );
}
```

---

## Error Handling

All endpoints return consistent error format:

```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "RATE_LIMIT_EXCEEDED" | "INTERNAL_ERROR",
    message: "Human-readable error message",
    details?: { ... }  // Validation errors
  },
  metadata: {
    model: "gpt-4o",
    tokensUsed: 0,
    requestId: "...",
    processingTime: 123
  }
}
```

**Handle errors gracefully**:

```typescript
const response = await fetch('/api/ai/pricing', { ... });
const result = await response.json();

if (!result.success) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.error('Invalid data:', result.error.details);
      break;
    case 'RATE_LIMIT_EXCEEDED':
      alert('Too many requests. Please try again later.');
      break;
    default:
      alert('An error occurred. Please try again.');
  }
  return;
}

// Success - use result.data
```

---

## Best Practices

### 1. Cache Results

```typescript
// Cache product descriptions
const cacheKey = `ai:description:${productId}`;
const cached = await cache.get(cacheKey);

if (cached) {
  return cached;
}

const result = await generateDescription(data);
await cache.set(cacheKey, result, 60 * 60 * 24 * 7); // 7 days
```

### 2. Show Loading States

```typescript
// Use loading indicators for better UX
{loading && (
  <div className="loading">
    <Spinner />
    <p>Generating description... (this may take a few seconds)</p>
  </div>
)}
```

### 3. Provide Feedback

```typescript
// Show success/error messages
if (result.success) {
  toast.success(`Generated with ${(result.data.confidence * 100).toFixed(0)}% confidence`);
} else {
  toast.error(result.error.message);
}
```

### 4. Optimize Images

```typescript
// Compress images before sending to pest-identify
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    };
    reader.readAsDataURL(file);
  });
}
```

---

## Cost Management

### Track Token Usage

```typescript
// Log AI usage for cost tracking
async function logAIUsage(endpoint: string, tokensUsed: number, userId?: string) {
  await database.aIUsageLog.create({
    data: {
      endpoint,
      tokensUsed,
      estimatedCost: (tokensUsed / 1000) * 0.01, // Rough estimate
      userId,
      timestamp: new Date(),
    }
  });
}

// After AI call
const result = await fetch('/api/ai/pricing', { ... });
const data = await result.json();

if (data.success && data.metadata) {
  await logAIUsage('/api/ai/pricing', data.metadata.tokensUsed, session?.user?.id);
}
```

### Set Monthly Budget Alerts

```typescript
// Check monthly spend
const monthlySpend = await database.aIUsageLog.aggregate({
  where: {
    timestamp: {
      gte: startOfMonth(new Date()),
    }
  },
  _sum: {
    estimatedCost: true,
  }
});

if (monthlySpend._sum.estimatedCost > MONTHLY_BUDGET) {
  // Send alert email
  await sendBudgetAlertEmail(monthlySpend._sum.estimatedCost);
}
```

---

## Troubleshooting

### Issue: "OPENAI_API_KEY environment variable is not set"
**Solution**: Add `OPENAI_API_KEY=sk-...` to `.env.local` and restart dev server

### Issue: High response times
**Solution**: 
- Use shorter `length` for descriptions ('short' vs 'long')
- Use 'quick' analysis for pest-identify
- Compress images before upload

### Issue: Low confidence scores
**Solution**: Provide more context in requests:
- Add `farmingPractices`, `certifications`
- Include `productionCost` and `competitorPrices` for pricing
- Add `symptoms`, `location` for pest identification

### Issue: Rate limits from OpenAI
**Solution**: Implement caching and rate limiting on your side

---

## Next Steps

1. **Read Full Documentation**: `docs/AI_REST_ENDPOINTS.md`
2. **Add Authentication**: Protect endpoints before production
3. **Implement Rate Limiting**: Prevent abuse and control costs
4. **Set Up Monitoring**: Track usage, costs, and errors
5. **Build UI Components**: Create user-facing interfaces
6. **Test Thoroughly**: Validate with real-world data

---

## Resources

- **Full API Docs**: `docs/AI_REST_ENDPOINTS.md`
- **Implementation Guide**: `docs/AI_IMPLEMENTATION_COMPLETE.md`
- **Real-time Features**: `docs/REALTIME_INTEGRATION_COMPLETE.md`
- **OpenAI Docs**: https://platform.openai.com/docs
- **Rate Limiting Guide**: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview

---

## Support

**Questions?** Create a GitHub issue or contact the development team.

**Bug Reports?** Include:
- Endpoint used
- Request payload
- Error response
- Expected behavior

---

**Happy Building! 🚀🌾**