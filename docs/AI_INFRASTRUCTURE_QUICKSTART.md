# AI Infrastructure Quick Start Guide

**Version**: 1.0  
**Last Updated**: 2024-11-29  
**Phase**: 6 Day 4 - AI Infrastructure Setup

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies (Already Done)

The required packages are already installed:
- ✅ `ai@^5.0.0` - Vercel AI SDK
- ✅ `openai@^4.77.0` - OpenAI client
- ✅ `@opentelemetry/*` - Tracing packages
- ✅ `applicationinsights` - Azure monitoring

### Step 2: Add OpenAI API Key

1. **Get your API key** from https://platform.openai.com/api-keys

2. **Create `.env.local`** in project root:
   ```bash
   cp .env.example .env.local
   ```

3. **Add your key**:
   ```env
   # Required for AI features
   OPENAI_API_KEY=sk-...your-key-here...
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

### Step 3: Test the Setup

```bash
# Test AI agents
npm run test:agents

# Test telemetry
npm run test:telemetry
```

**Expected Output**:
```
✅ Agent Registry - 4 agents found
✅ OpenAI Client - Initialized successfully
✅ Farm Analyst Agent - Response received
✅ All tests passed!
```

---

## 🤖 Using AI Agents

### Example 1: Farm Analysis

```typescript
import { invokeAgent } from '@/lib/ai/agent-config';

// Analyze a farm's performance
export async function analyzeFarm(farmId: string) {
  const farm = await database.farm.findUnique({
    where: { id: farmId },
    include: { products: true, orders: true }
  });

  const response = await invokeAgent(
    'farmAnalyst',
    `Analyze performance for ${farm.name}. 
     Products: ${farm.products.length}
     Orders: ${farm.orders.length}
     Revenue: $${calculateRevenue(farm)}`,
    {
      farmId,
      metadata: { season: getCurrentSeason() }
    }
  );

  return {
    analysis: response.content,
    confidence: response.confidence,
    recommendations: extractRecommendations(response.content)
  };
}
```

### Example 2: Product Description Generation

```typescript
import { invokeAgent } from '@/lib/ai/agent-config';

// Generate product description
export async function generateProductDesc(product: Product) {
  const response = await invokeAgent(
    'productCatalog',
    `Create a compelling description for:
     - Name: ${product.name}
     - Category: ${product.category}
     - Price: $${product.price}
     - Organic: ${product.organic ? 'Yes' : 'No'}
     Include SEO keywords and tags.`,
    {
      productId: product.id,
      farmId: product.farmId
    }
  );

  return response.content;
}
```

### Example 3: Customer Support

```typescript
import { invokeAgent } from '@/lib/ai/agent-config';

// Handle customer inquiry
export async function handleInquiry(question: string, customerId: string) {
  const response = await invokeAgent(
    'customerSupport',
    question,
    {
      userId: customerId,
      sessionId: generateSessionId()
    }
  );

  return {
    answer: response.content,
    confidence: response.confidence
  };
}
```

### Example 4: Multi-Agent Orchestration

```typescript
import { orchestrateAgents } from '@/lib/ai/agent-config';

// Complex task requiring multiple agents
export async function processComplexRequest(request: string) {
  const responses = await orchestrateAgents({
    task: request,
    context: {
      userId: 'user-123',
      sessionId: 'session-456'
    },
    requiredAgents: [
      'farmAnalyst',
      'productCatalog',
      'customerSupport'
    ],
    maxTurns: 2
  });

  // Aggregate responses
  return responses.map(r => ({
    agent: r.agent,
    content: r.content,
    confidence: r.confidence
  }));
}
```

---

## 📊 Adding Tracing

### Trace a Function

```typescript
import { withSpan } from '@/lib/monitoring/telemetry';

export async function myFunction() {
  return await withSpan('myFunction', async (span) => {
    // Add attributes
    span.setAttribute('user.id', 'user-123');
    span.setAttribute('operation', 'create');

    // Your code here
    const result = await doSomething();

    return result;
  });
}
```

### Trace Farm Operations

```typescript
import { traceFarmOperation } from '@/lib/monitoring/telemetry';

export async function createProduct(farmId: string, data: ProductData) {
  return await traceFarmOperation(
    'createProduct',
    farmId,
    async (span) => {
      span.setAttribute('product.name', data.name);
      
      const product = await database.product.create({
        data: { ...data, farmId }
      });

      return product;
    }
  );
}
```

### Trace AI Agent Calls

```typescript
import { traceAgentInvocation } from '@/lib/monitoring/telemetry';

export async function callAgent(agentName: string, prompt: string) {
  return await traceAgentInvocation(
    agentName,
    'analyze',
    async (span) => {
      span.setAttribute('prompt.length', prompt.length);
      
      const response = await invokeAgent(agentName, prompt);
      
      span.setAttribute('response.confidence', response.confidence);
      
      return response;
    }
  );
}
```

---

## 📈 Tracking Metrics

### Track Custom Metrics

```typescript
import { trackMetric } from '@/lib/monitoring/app-insights';

// Track any metric
trackMetric({
  name: 'custom.metric',
  value: 123,
  properties: {
    category: 'performance',
    unit: 'milliseconds'
  }
});
```

### Track Agricultural Metrics

```typescript
import {
  trackFarmOperation,
  trackOrderProcessing,
  trackAgentInvocation,
  trackBundleSize
} from '@/lib/monitoring/app-insights';

// Track farm operation
trackFarmOperation('createFarm', 'farm-123', 250, true);

// Track order processing
trackOrderProcessing('order-456', 1500, 49.99, 3);

// Track AI agent usage
trackAgentInvocation('FarmAnalyst', 'analyze', 2000, true, 0.85);

// Track bundle size (Phase 6)
trackBundleSize('admin-bundle', 250, '/admin');
```

---

## 🔧 Configuration Options

### AI Agent Settings

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...your-key...
OPENAI_MODEL=gpt-4o                    # Default: gpt-4o
OPENAI_TEMPERATURE=0.5                 # 0.0-1.0 (creativity)
OPENAI_MAX_TOKENS=2000                 # Response length
```

### OpenTelemetry Settings

```env
# Telemetry Configuration
OTEL_SERVICE_NAME=farmers-market-platform
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_ENABLED=true
OTEL_SAMPLE_RATE=1.0                   # 0.0-1.0 (100% = all traces)
```

### Application Insights Settings

```env
# Azure Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
APPINSIGHTS_ENABLED=true
APPINSIGHTS_SAMPLING_PERCENTAGE=100    # 0-100
APPINSIGHTS_AUTO_COLLECT=true
```

---

## 📝 Available Agents

### 1. Farm Analyst (`farmAnalyst`)

**Best For**: Performance analysis, yield predictions, optimization recommendations

**Capabilities**:
- `farm_performance_analysis`
- `yield_prediction`
- `seasonal_planning`
- `crop_rotation_optimization`
- `sustainability_assessment`
- `data_visualization_insights`

**Example**:
```typescript
const analysis = await invokeAgent(
  'farmAnalyst',
  'Analyze Sunshine Farm: 50 acres, tomatoes, yield 5000 lbs/month'
);
```

### 2. Product Catalog Manager (`productCatalog`)

**Best For**: Product descriptions, pricing, SEO, inventory management

**Capabilities**:
- `product_description_generation`
- `category_optimization`
- `pricing_analysis`
- `inventory_management`
- `seasonal_recommendations`
- `seo_optimization`

**Example**:
```typescript
const description = await invokeAgent(
  'productCatalog',
  'Create description for organic heirloom tomatoes, $5.99/lb'
);
```

### 3. Order Processor (`orderProcessor`)

**Best For**: Order validation, logistics, inventory allocation

**Capabilities**:
- `order_validation`
- `inventory_allocation`
- `delivery_optimization`
- `customer_communication`
- `issue_resolution`
- `logistics_planning`

**Example**:
```typescript
const validation = await invokeAgent(
  'orderProcessor',
  'Validate order: 10 items, $150 total, deliver to Seattle'
);
```

### 4. Customer Support (`customerSupport`)

**Best For**: Customer inquiries, recommendations, issue resolution

**Capabilities**:
- `customer_inquiry_response`
- `product_recommendations`
- `issue_resolution`
- `agricultural_education`
- `order_assistance`
- `complaint_handling`

**Example**:
```typescript
const response = await invokeAgent(
  'customerSupport',
  'Customer asks: What vegetables are in season right now?'
);
```

---

## 🧪 Testing Without API Key

All test scripts work without an OpenAI API key - they'll skip API calls:

```bash
# Will run without API key (skips API tests)
npm run test:agents
npm run test:telemetry

# Output when API key is missing:
# ⚠️  OpenAI API calls DISABLED (no API key detected)
# ✅ Configuration tests passed
# ⚠️  Agent invocation tests skipped
```

---

## 🎯 Common Patterns

### Pattern 1: API Route with AI + Tracing

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { invokeAgent } from '@/lib/ai/agent-config';
import { traceApiRoute } from '@/lib/monitoring/telemetry';
import { trackAgentInvocation } from '@/lib/monitoring/app-insights';

export async function POST(request: NextRequest) {
  return await traceApiRoute(
    'POST',
    '/api/analyze-farm',
    async (span) => {
      const { farmId } = await request.json();
      
      span.setAttribute('farm.id', farmId);
      
      const startTime = Date.now();
      const response = await invokeAgent(
        'farmAnalyst',
        `Analyze farm ${farmId}`,
        { farmId }
      );
      
      // Track metrics
      trackAgentInvocation(
        'FarmAnalyst',
        'analyze',
        Date.now() - startTime,
        true,
        response.confidence
      );
      
      return NextResponse.json({
        success: true,
        analysis: response.content,
        confidence: response.confidence
      });
    }
  );
}
```

### Pattern 2: Background Job with Monitoring

```typescript
import { withSpan } from '@/lib/monitoring/telemetry';
import { trackMetric } from '@/lib/monitoring/app-insights';

export async function processNightlyReports() {
  return await withSpan('nightly.reports', async (span) => {
    const startTime = Date.now();
    
    try {
      // Process reports
      const reports = await generateReports();
      
      span.setAttribute('reports.count', reports.length);
      
      // Track success
      trackMetric({
        name: 'nightly.reports.duration',
        value: Date.now() - startTime,
        properties: {
          count: reports.length.toString(),
          status: 'success'
        }
      });
      
      return reports;
    } catch (error) {
      // Track failure
      trackMetric({
        name: 'nightly.reports.duration',
        value: Date.now() - startTime,
        properties: {
          status: 'failure',
          error: error.message
        }
      });
      throw error;
    }
  });
}
```

### Pattern 3: Multi-Step Workflow

```typescript
import { orchestrateAgents } from '@/lib/ai/agent-config';
import { withSpan } from '@/lib/monitoring/telemetry';

export async function onboardNewFarm(farmData: CreateFarmData) {
  return await withSpan('farm.onboarding', async (span) => {
    span.setAttribute('farm.name', farmData.name);
    
    // Step 1: Validate farm data
    const validation = await invokeAgent(
      'farmAnalyst',
      `Validate farm data: ${JSON.stringify(farmData)}`
    );
    
    // Step 2: Generate optimized product descriptions
    const products = await Promise.all(
      farmData.products.map(p =>
        invokeAgent(
          'productCatalog',
          `Create description for ${p.name}`
        )
      )
    );
    
    // Step 3: Create onboarding plan
    const onboarding = await orchestrateAgents({
      task: 'Create comprehensive onboarding plan',
      context: { farmId: 'new', metadata: farmData },
      requiredAgents: ['farmAnalyst', 'productCatalog'],
      maxTurns: 2
    });
    
    return {
      validation,
      products,
      onboarding
    };
  });
}
```

---

## 🚨 Troubleshooting

### Issue: "OPENAI_API_KEY not set"

**Solution**: Add key to `.env.local`:
```env
OPENAI_API_KEY=sk-...
```

### Issue: Agent responses are slow

**Solution**: Reduce max_tokens or use faster model:
```env
OPENAI_MAX_TOKENS=1000
OPENAI_MODEL=gpt-4o-mini  # Faster, cheaper
```

### Issue: Traces not appearing

**Solution**: Check OpenTelemetry endpoint:
```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_ENABLED=true
```

Run OpenTelemetry collector:
```bash
docker run -p 4318:4318 otel/opentelemetry-collector-contrib:latest
```

### Issue: Application Insights not receiving data

**Solution**: Verify connection string:
```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
APPINSIGHTS_ENABLED=true
```

---

## 📚 Additional Resources

### Documentation
- **Complete Guide**: `docs/PHASE_6_DAY_4_AI_INFRASTRUCTURE.md`
- **Full Summary**: `docs/PHASE_6_DAY_4_COMPLETE.md`
- **Test Scripts**: `scripts/test-agent-framework.ts`, `scripts/test-telemetry.ts`

### Source Code
- **AI Agents**: `src/lib/ai/agent-config.ts`
- **Telemetry**: `src/lib/monitoring/telemetry.ts`
- **App Insights**: `src/lib/monitoring/app-insights.ts`

### External Links
- **OpenAI API**: https://platform.openai.com/docs
- **OpenTelemetry**: https://opentelemetry.io/docs/
- **Azure Application Insights**: https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview

---

## ✅ Next Steps

1. **Add OpenAI API key** to `.env.local`
2. **Run tests** to verify setup
3. **Try the examples** in this guide
4. **Read the full documentation** for advanced usage
5. **Monitor your metrics** in Application Insights (optional)

---

**Happy Coding!** 🌾⚡

*Questions? Check the full documentation or test scripts for detailed examples.*