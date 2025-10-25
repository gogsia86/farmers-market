# ⚡ Perplexity Integration - Quick Start Action Plan

**Created**: October 25, 2025
**Estimated Time**: 30 minutes to first query
**Difficulty**: Easy ✅

---

## 🎯 GOAL

Get Perplexity API integrated and working with VS Code in **30 minutes or less**.

---

## ✅ PHASE 1: IMMEDIATE SETUP (30 Minutes)

### Step 1: Get API Key (5 minutes)

1. Go to https://www.perplexity.ai/settings
2. Click **API** tab
3. Click **Generate API Key**
4. Copy the key (starts with `pplx-`)
5. Save it somewhere safe

---

### Step 2: Set Environment Variable (2 minutes)

Open PowerShell and run:

```powershell
# Set Perplexity API key as environment variable
setx PERPLEXITY_API_KEY "pplx-YOUR-KEY-HERE"
```

**Important**: Replace `pplx-YOUR-KEY-HERE` with your actual key!

---

### Step 3: Install Dependencies (3 minutes)

```bash
# Install OpenAI SDK (Perplexity-compatible)
npm install openai dotenv
```

---

### Step 4: Create Perplexity Utility (10 minutes)

Create file: `src/lib/ai/perplexity.ts`

```typescript
/**
 * PERPLEXITY API INTEGRATION - DIVINE AI CONSCIOUSNESS
 *
 * Multi-model AI access for agricultural platform development
 * OpenAI-compatible interface with specialized models
 */

import OpenAI from "openai";

// Initialize Perplexity client
export const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// Available models
export const PERPLEXITY_MODELS = {
  MISTRAL_7B: "mistral-7b-instruct", // Fast, cost-effective
  CODE_LLAMA_34B: "codellama-34b-instruct", // Code generation
  LLAMA_70B: "llama-70b-chat", // Complex reasoning
} as const;

/**
 * Query Perplexity with agricultural consciousness
 */
export async function askPerplexity(
  question: string,
  options?: {
    model?: keyof typeof PERPLEXITY_MODELS;
    systemPrompt?: string;
  }
) {
  const model = options?.model
    ? PERPLEXITY_MODELS[options.model]
    : PERPLEXITY_MODELS.MISTRAL_7B;

  const systemPrompt =
    options?.systemPrompt ||
    "You are a divine AI assistant with agricultural consciousness. Be helpful, concise, and apply farming wisdom.";

  try {
    const response = await perplexity.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    return {
      success: true,
      answer: response.choices[0].message.content,
      model,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search Perplexity with web sources (requires Search API access)
 */
export async function searchPerplexity(query: string) {
  try {
    const response = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      answer: data.answer,
      citations: data.citations || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

---

### Step 5: Create Test Script (5 minutes)

Create file: `scripts/test-perplexity.ts`

```typescript
/**
 * Test Perplexity Integration
 */

import { askPerplexity, PERPLEXITY_MODELS } from "../src/lib/ai/perplexity";

async function testPerplexity() {
  console.log("🔮 Testing Perplexity Integration...\n");

  // Test 1: Simple query
  console.log("Test 1: Simple Agricultural Query");
  const test1 = await askPerplexity(
    "What are the 3 most important factors for organic tomato farming?"
  );
  console.log("Answer:", test1.answer);
  console.log("\n---\n");

  // Test 2: Code generation
  console.log("Test 2: Code Generation with Code Llama");
  const test2 = await askPerplexity(
    "Generate a TypeScript function to calculate days until harvest based on planting date",
    { model: "CODE_LLAMA_34B" }
  );
  console.log("Answer:", test2.answer);
  console.log("\n---\n");

  // Test 3: Complex reasoning
  console.log("Test 3: Complex Reasoning with Llama 70B");
  const test3 = await askPerplexity(
    "Explain crop rotation benefits and create a 4-year rotation plan",
    { model: "LLAMA_70B" }
  );
  console.log("Answer:", test3.answer);

  console.log("\n✅ All tests complete!");
}

// Run tests
testPerplexity().catch(console.error);
```

---

### Step 6: Add VS Code Task (3 minutes)

Add to `.vscode/tasks.json`:

```json
{
  "label": "🔍 Ask Perplexity",
  "type": "shell",
  "command": "npx",
  "args": ["tsx", "scripts/test-perplexity.ts"],
  "problemMatcher": [],
  "group": "test"
}
```

---

### Step 7: Test It! (2 minutes)

Run the test:

```bash
# Option 1: Direct execution
npx tsx scripts/test-perplexity.ts

# Option 2: VS Code task
# Press Ctrl+Shift+P → "Tasks: Run Task" → "Ask Perplexity"
```

**Expected Output**:

```
🔮 Testing Perplexity Integration...

Test 1: Simple Agricultural Query
Answer: The 3 most important factors for organic tomato farming are:
1. Soil health with proper pH (6.0-6.8)
2. Consistent watering without overwatering
3. Natural pest management using companion planting

---

Test 2: Code Generation with Code Llama
Answer: function calculateDaysUntilHarvest(plantingDate: Date, ...

---

✅ All tests complete!
```

---

## 🎉 SUCCESS CRITERIA

You've successfully integrated Perplexity if:

- ✅ API key is set
- ✅ Dependencies installed
- ✅ Test script runs without errors
- ✅ You receive answers from Perplexity
- ✅ VS Code task executes successfully

---

## 🚀 NEXT STEPS AFTER SETUP

### Option 1: Use in Current Work (Immediate)

```typescript
// In any file, import and use
import { askPerplexity } from "@/lib/ai/perplexity";

const advice = await askPerplexity(
  "Best practices for farm profile database schema"
);
```

### Option 2: Build Custom Commands (1-2 hours)

Create VS Code commands for quick access:

- "Ask Perplexity About Selected Code"
- "Research Agricultural Topic"
- "Generate Code with Code Llama"

### Option 3: Integration with Features (Ongoing)

Use Perplexity in your features:

- Farm creation → Get regional farming advice
- Product listing → Research market trends
- Documentation → Auto-generate docs

---

## 💡 QUICK USE CASES

### Use Case 1: Research While Coding

```typescript
// You're implementing crop rotation
// Ask Perplexity for real-time advice
const rotationAdvice = await askPerplexity(
  "What crops should follow tomatoes in crop rotation?"
);
// Implement based on expert advice
```

### Use Case 2: Code Generation

```typescript
// Need a specific algorithm?
const algorithm = await askPerplexity(
  "Generate TypeScript function for calculating optimal planting dates based on last frost date",
  { model: "CODE_LLAMA_34B" }
);
// Copy-paste and adapt
```

### Use Case 3: Documentation

```typescript
// Document your feature
const docs = await askPerplexity(
  "Write documentation for farm profile creation feature with agricultural consciousness"
);
// Add to README
```

---

## 🔧 TROUBLESHOOTING

### Error: "Cannot find module 'openai'"

```bash
npm install openai
```

### Error: "API key not found"

```bash
# Re-set the environment variable
setx PERPLEXITY_API_KEY "pplx-YOUR-KEY"
# Then restart VS Code
```

### Error: "401 Unauthorized"

- Check API key is correct
- Verify you have API access enabled in Perplexity settings
- Ensure key starts with `pplx-`

### No response received

- Check internet connection
- Verify API key is active
- Check Perplexity API status: https://status.perplexity.ai

---

## 📊 ESTIMATED COSTS

### Typical Development Usage

| Task            | Queries/Month | Cost/Query | Monthly Cost |
| --------------- | ------------- | ---------- | ------------ |
| Code generation | 100           | $0.001     | $0.10        |
| Documentation   | 50            | $0.001     | $0.05        |
| Research        | 150           | $0.001     | $0.15        |
| **TOTAL**       | **300**       | -          | **~$0.30**   |

**Compare to GPT-4**: Same tasks = ~$0.90-1.20
**Savings**: 60-75% 💰

---

## ✅ COMPLETION CHECKLIST

Before moving to advanced features, verify:

- [ ] Perplexity API key generated
- [ ] Environment variable set (PERPLEXITY_API_KEY)
- [ ] Dependencies installed (openai, dotenv)
- [ ] Utility file created (src/lib/ai/perplexity.ts)
- [ ] Test script created (scripts/test-perplexity.ts)
- [ ] VS Code task added
- [ ] Test executed successfully
- [ ] Received responses from all 3 models
- [ ] No errors in console
- [ ] Ready to use in development

---

## 🎯 WHAT'S NEXT?

Choose your path:

1. **🚀 Start Using Now** - Integrate with current feature development
2. **🏗️ Build Extension** - Create custom VS Code extension (6-8 hours)
3. **📊 Analytics** - Track usage and cost savings
4. **🌾 Agricultural KB** - Build knowledge base with Perplexity

---

## 💬 QUICK EXAMPLES TO TRY

Copy-paste these into your test script:

```typescript
// Agricultural advice
await askPerplexity(
  "What are organic certification requirements in California?"
);

// Code generation
await askPerplexity("Generate Prisma schema for farm products", {
  model: "CODE_LLAMA_34B",
});

// Market research
await askPerplexity("Current trends in online farmers market platforms");

// Technical explanation
await askPerplexity("Explain PostgreSQL indexing for large product catalogs");

// Best practices
await askPerplexity("Next.js 14 App Router best practices for e-commerce");
```

---

## 🌟 SUCCESS STORY

After 30 minutes, you'll have:

✅ Perplexity integrated with VS Code
✅ 3 AI models at your fingertips
✅ Cost-effective alternative to GPT-4
✅ Real-time web search capability
✅ Code generation specialized models
✅ Agricultural knowledge on demand

**Total cost so far**: $0 (free API key tier)
**Time invested**: 30 minutes
**Value unlocked**: Unlimited AI assistance

---

_"In 30 minutes, expand your development consciousness with divine multi-model intelligence!"_ ⚡🔮
