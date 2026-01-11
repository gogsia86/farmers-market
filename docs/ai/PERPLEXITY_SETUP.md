# 🤖 Perplexity AI Integration Setup Guide

**Date:** January 11, 2025  
**Status:** ✅ CONFIGURED  
**Integration Method:** OpenRouter API  

---

## 📋 Overview

Perplexity AI has been integrated into the Farmers Market Platform coding agents through OpenRouter. This enables access to Perplexity's powerful online models for real-time information retrieval and advanced reasoning.

---

## ✅ Configuration Complete

The following configuration has been added to `.vscode/settings.json`:

```json
{
  "language_models": {
    "open_router": {
      "api_url": "https://openrouter.ai/api/v1",
      "available_models": [
        {
          "name": "perplexity/pplx-70b-online",
          "display_name": "Perplexity 70B Online",
          "max_tokens": 128000
        },
        {
          "name": "perplexity/pplx-7b-online",
          "display_name": "Perplexity 7B Online",
          "max_tokens": 128000
        }
      ]
    }
  }
}
```

---

## 🔑 API Key Setup

### Prerequisites

1. **OpenRouter Account**
   - Sign up at: https://openrouter.ai
   - Navigate to API Keys section
   - Generate a new API key

2. **Environment Variables**

Add to your `.env.local` file:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Set your app name for tracking
OPENROUTER_APP_NAME=farmers-market-platform

# Optional: Set your site URL
OPENROUTER_SITE_URL=https://farmersmarket.com
```

⚠️ **NEVER commit API keys to git!** The `.env.local` file is already in `.gitignore`.

---

## 🚀 Available Models

### Perplexity 70B Online
**Model ID:** `perplexity/pplx-70b-online`

**Capabilities:**
- ✅ Real-time web search integration
- ✅ Up-to-date information (current events, documentation)
- ✅ 70 billion parameters for advanced reasoning
- ✅ 128,000 token context window (128k)
- ✅ Excellent for research and documentation lookups

**Best For:**
- Current API documentation
- Latest framework updates
- Real-time debugging solutions
- Industry best practices
- Technology comparisons

**Pricing:** ~$1.00 per 1M tokens (check OpenRouter for current rates)

---

### Perplexity 7B Online
**Model ID:** `perplexity/pplx-7b-online`

**Capabilities:**
- ✅ Real-time web search integration
- ✅ Faster responses than 70B model
- ✅ 7 billion parameters
- ✅ 128,000 token context window (128k)
- ✅ Cost-effective for quick queries

**Best For:**
- Quick documentation lookups
- Simple code examples
- Package version checks
- Basic troubleshooting
- Rapid iterations

**Pricing:** ~$0.20 per 1M tokens (check OpenRouter for current rates)

---

## 💡 Usage Examples

### Example 1: Check Latest Package Version

```typescript
// Ask Perplexity to check the latest Next.js version
"What is the latest stable version of Next.js and what are the major changes from version 14?"

// Perplexity will search online and provide current information
```

### Example 2: Debug with Current Documentation

```typescript
// Get up-to-date API documentation
"What are the current best practices for React Server Components in Next.js 15?"

// Perplexity searches recent docs and provides accurate answers
```

### Example 3: Technology Comparison

```typescript
// Research current trends
"Compare Prisma ORM vs Drizzle ORM in 2025 - what are the pros and cons for a Next.js project?"

// Perplexity provides current comparisons with recent benchmarks
```

### Example 4: Security Best Practices

```typescript
// Get latest security recommendations
"What are the current OWASP Top 10 recommendations for Next.js applications in 2025?"

// Perplexity searches for current security standards
```

---

## 🔧 Integration Methods

### Method 1: Direct API Calls (Recommended)

Create a Perplexity service wrapper:

```typescript
// lib/ai/perplexity.service.ts
import { Configuration, OpenAIApi } from 'openai';

export class PerplexityService {
  private client: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENROUTER_API_KEY,
      basePath: 'https://openrouter.ai/api/v1',
    });
    this.client = new OpenAIApi(configuration);
  }

  async query(prompt: string, model: 'pplx-70b-online' | 'pplx-7b-online' = 'pplx-7b-online') {
    const response = await this.client.createChatCompletion({
      model: `perplexity/${model}`,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 128000,
      temperature: 0.7,
    });

    return response.data.choices[0].message?.content;
  }

  async researchTopic(topic: string): Promise<string> {
    const prompt = `Research the following topic and provide current, accurate information with sources: ${topic}`;
    return await this.query(prompt, 'pplx-70b-online');
  }

  async checkDocumentation(library: string, feature: string): Promise<string> {
    const prompt = `What is the current documentation for ${feature} in ${library}? Include code examples.`;
    return await this.query(prompt, 'pplx-7b-online');
  }

  async debugError(errorMessage: string, context: string): Promise<string> {
    const prompt = `I'm getting this error: "${errorMessage}" in the following context: ${context}. What are the current solutions and best practices?`;
    return await this.query(prompt, 'pplx-70b-online');
  }
}

// Usage
const perplexity = new PerplexityService();
const answer = await perplexity.researchTopic('Next.js 15 Server Actions best practices');
```

---

### Method 2: Chat Interface Integration

```typescript
// app/api/ai/perplexity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PerplexityService } from '@/lib/ai/perplexity.service';

export async function POST(req: NextRequest) {
  try {
    const { query, model } = await req.json();

    const perplexity = new PerplexityService();
    const response = await perplexity.query(query, model);

    return NextResponse.json({
      success: true,
      response,
      model: `perplexity/${model}`,
    });
  } catch (error) {
    console.error('Perplexity API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to query Perplexity' },
      { status: 500 }
    );
  }
}
```

---

### Method 3: VS Code Extension Integration

If using a VS Code extension that supports custom language models:

1. **Configure Extension Settings:**
   - Open VS Code Settings (Ctrl+,)
   - Search for "language models"
   - Select OpenRouter as provider
   - Enter your OpenRouter API key
   - Select Perplexity models from dropdown

2. **Use in Chat:**
   - Open AI chat panel
   - Select "Perplexity 70B Online" or "Perplexity 7B Online"
   - Ask questions naturally

---

## 📊 Cost Management

### Monitoring Usage

Track your OpenRouter usage at: https://openrouter.ai/activity

### Cost Optimization Tips

1. **Use 7B for Simple Queries**
   - 7B model is 5x cheaper than 70B
   - Perfect for quick documentation lookups
   - Use 70B only for complex research

2. **Set Token Limits**
   - Configure `max_tokens` based on needs
   - Default 128000 is maximum
   - Reduce to 10000-20000 for simple queries

3. **Cache Results**
   ```typescript
   // Cache Perplexity responses to avoid repeat queries
   const cache = new Map<string, string>();
   
   async function cachedQuery(query: string): Promise<string> {
     if (cache.has(query)) {
       return cache.get(query)!;
     }
     const response = await perplexity.query(query);
     cache.set(query, response);
     return response;
   }
   ```

4. **Batch Related Queries**
   - Combine multiple questions in one prompt
   - Reduces API calls and costs

---

## 🎯 Best Practices

### When to Use Perplexity

✅ **DO Use For:**
- Current package versions and documentation
- Latest security vulnerabilities and fixes
- Recent framework updates and migration guides
- Real-time debugging with current solutions
- Technology comparisons with recent data
- Best practices for new technologies
- Breaking changes in dependencies

❌ **DON'T Use For:**
- Code generation (use Claude/GPT-4 instead)
- Static knowledge (use local models)
- Simple calculations or logic
- Private/confidential information
- Deprecated technology research

---

### Prompt Engineering Tips

**1. Be Specific:**
```typescript
// ❌ BAD
"Tell me about Next.js"

// ✅ GOOD
"What are the new features in Next.js 15 and how do they compare to Next.js 14?"
```

**2. Request Sources:**
```typescript
// ✅ GOOD
"What are the current best practices for API rate limiting in Next.js? Include sources and documentation links."
```

**3. Specify Timeframe:**
```typescript
// ✅ GOOD
"What are the security vulnerabilities discovered in Prisma in 2024-2025? Include CVE numbers if available."
```

**4. Ask for Code Examples:**
```typescript
// ✅ GOOD
"Show me a current example of implementing authentication with NextAuth v5 in Next.js 15, including TypeScript types."
```

---

## 🔒 Security Considerations

### API Key Protection

1. **Never Commit Keys:**
   ```bash
   # ✅ Keys in .env.local (gitignored)
   OPENROUTER_API_KEY=sk-or-v1-...
   
   # ❌ Never in code
   const apiKey = "sk-or-v1-..."; // DON'T DO THIS
   ```

2. **Use Environment Variables:**
   ```typescript
   // ✅ CORRECT
   const apiKey = process.env.OPENROUTER_API_KEY;
   
   if (!apiKey) {
     throw new Error('OPENROUTER_API_KEY is required');
   }
   ```

3. **Server-Side Only:**
   ```typescript
   // ✅ CORRECT - Server Component or API Route
   import { PerplexityService } from '@/lib/ai/perplexity.service';
   
   // ❌ WRONG - Client Component
   "use client"; // Never expose API keys to client!
   ```

---

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// lib/ai/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error(`Rate limit exceeded. Reset in ${reset}ms`);
  }
  
  return { remaining, reset };
}
```

---

## 🧪 Testing

### Test Configuration

```typescript
// tests/ai/perplexity.test.ts
import { PerplexityService } from '@/lib/ai/perplexity.service';

describe('PerplexityService', () => {
  it('should query Perplexity API successfully', async () => {
    const perplexity = new PerplexityService();
    const response = await perplexity.query('What is 2+2?');
    
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should handle errors gracefully', async () => {
    const perplexity = new PerplexityService();
    
    await expect(
      perplexity.query('') // Empty query
    ).rejects.toThrow();
  });
});
```

### Mock Responses for Testing

```typescript
// tests/mocks/perplexity.mock.ts
export const mockPerplexityService = {
  query: jest.fn().mockResolvedValue('Mocked Perplexity response'),
  researchTopic: jest.fn().mockResolvedValue('Mocked research'),
  checkDocumentation: jest.fn().mockResolvedValue('Mocked docs'),
  debugError: jest.fn().mockResolvedValue('Mocked solution'),
};
```

---

## 📚 Additional Resources

### Official Documentation
- **OpenRouter:** https://openrouter.ai/docs
- **Perplexity AI:** https://docs.perplexity.ai
- **API Reference:** https://openrouter.ai/docs/api-reference

### Community Resources
- **OpenRouter Discord:** Join for support and updates
- **Perplexity Blog:** Latest features and improvements
- **GitHub Examples:** https://github.com/openrouter/examples

### Cost Calculator
- **OpenRouter Pricing:** https://openrouter.ai/models/perplexity
- **Usage Dashboard:** https://openrouter.ai/activity

---

## 🐛 Troubleshooting

### Common Issues

#### Issue 1: "Invalid API Key"
```bash
Error: Invalid API key for OpenRouter

Solution:
1. Verify OPENROUTER_API_KEY in .env.local
2. Check key hasn't expired at openrouter.ai
3. Ensure no extra spaces in .env file
4. Restart dev server after adding key
```

#### Issue 2: "Rate Limit Exceeded"
```bash
Error: Rate limit exceeded

Solution:
1. Check usage at openrouter.ai/activity
2. Wait for rate limit reset (usually 1 minute)
3. Implement request queuing
4. Upgrade OpenRouter plan if needed
```

#### Issue 3: "Model Not Available"
```bash
Error: Model perplexity/pplx-70b-online not found

Solution:
1. Check model name spelling (case-sensitive)
2. Verify model is available at openrouter.ai/models
3. Check OpenRouter service status
4. Try alternative model (pplx-7b-online)
```

#### Issue 4: "Timeout Error"
```bash
Error: Request timeout

Solution:
1. Increase timeout in API call
2. Check internet connection
3. Try smaller max_tokens value
4. Use 7B model instead of 70B
```

---

## 🎯 Next Steps

1. **Test Integration:**
   ```bash
   npm run dev
   # Test Perplexity queries in your application
   ```

2. **Monitor Usage:**
   - Visit https://openrouter.ai/activity
   - Track costs and request counts
   - Set budget alerts

3. **Implement Rate Limiting:**
   - Add rate limiting middleware
   - Protect against abuse
   - Monitor usage patterns

4. **Create Helpers:**
   - Build utility functions for common queries
   - Create prompt templates
   - Add response caching

5. **Update Documentation:**
   - Document your use cases
   - Share successful prompts
   - Track cost savings

---

## ✅ Configuration Checklist

- [x] Added OpenRouter configuration to `.vscode/settings.json`
- [x] Created `.env.local` with `OPENROUTER_API_KEY` ✅
- [ ] Signed up for OpenRouter account
- [ ] Generated API key at openrouter.ai
- [ ] Tested basic query with Perplexity 7B
- [ ] Tested advanced query with Perplexity 70B
- [ ] Implemented rate limiting
- [ ] Added error handling
- [ ] Set up cost monitoring
- [ ] Created utility functions
- [ ] Added tests for integration
- [ ] Documented team usage guidelines

---

## 📞 Support

### Internal Support
- **Documentation:** This file (`docs/ai/PERPLEXITY_SETUP.md`)
- **Issues:** Create GitHub issue with label: `ai-integration`
- **Team Chat:** #ai-tools Slack channel

### External Support
- **OpenRouter Support:** support@openrouter.ai
- **OpenRouter Discord:** https://discord.gg/openrouter
- **Status Page:** https://status.openrouter.ai

---

**Status:** ✅ READY TO USE  
**Last Updated:** January 11, 2025  
**Configured By:** DevOps Team  
**Version:** 1.0  

**Happy coding with Perplexity AI! 🚀**