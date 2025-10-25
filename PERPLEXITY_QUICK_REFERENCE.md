# 🎉 PERPLEXITY AI - QUICK REFERENCE

**Status**: ✅ FULLY OPERATIONAL
**Models**: 3 Working (Sonar, Sonar Pro, Sonar Reasoning)

---

## ⚡ QUICK START

### 1. Import

```typescript
import { askPerplexity, smartQuery, generateCode } from "@/lib/ai/perplexity";
```

### 2. Use

```typescript
// Simple query
const answer = await askPerplexity("What is crop rotation?");

// Smart routing (auto-selects best model)
const code = await smartQuery("Generate TypeScript code for...");

// Code generation
const component = await generateCode("React component for farm dashboard");
```

### 3. Test

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/run-perplexity-test.ps1
```

---

## 📋 AVAILABLE FUNCTIONS

| Function                      | Use Case         | Model         |
| ----------------------------- | ---------------- | ------------- |
| `askPerplexity()`             | Direct queries   | Configurable  |
| `smartQuery()`                | Auto-routing     | Auto-selected |
| `generateCode()`              | Code generation  | Sonar Pro     |
| `researchAgriculturalTopic()` | Farming research | Sonar         |

---

## 🔑 ENVIRONMENT SETUP

Already configured in `.env`:

```
PERPLEXITY_API_KEY=your-key-here
```

System environment (permanent):

```powershell
setx PERPLEXITY_API_KEY "pplx-your-key-here"
```

---

## ✅ STATUS

- ✅ All 6 tests passing
- ✅ 3 models working
- ✅ Divine patterns applied
- ✅ Production ready

**See `PERPLEXITY_INTEGRATION_COMPLETE.md` for full documentation**
