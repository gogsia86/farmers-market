# 🌟 GODLIKE COPILOT WORKFLOW GUIDE

## Divine Precision Coding for Farmers Market Platform

---

## 📖 TABLE OF CONTENTS

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [The Godlike Workflow](#the-godlike-workflow)
4. [Precision Prompting Techniques](#precision-prompting-techniques)
5. [Custom Keyboard Shortcuts](#custom-keyboard-shortcuts)
6. [Code Generation Templates](#code-generation-templates)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)
9. [Pro Tips](#pro-tips)

---

## 🎯 INTRODUCTION

This guide transforms GitHub Copilot from a "helpful assistant" into a **precision engineering tool** for the Farmers Market Platform. By following these workflows, you'll generate production-ready, zero-fluff code that adheres to our divine architectural standards.

### What Makes This "Godlike"?

- **Zero Explanatory Fluff**: Code only, no "here's the code..." preambles
- **Complete Implementations**: Full files with proper imports, types, and error handling
- **Agricultural Consciousness**: Domain-aware code generation
- **Production-Ready**: Every output is deployment-ready
- **Pattern Consistency**: Automatic adherence to project standards

---

## 🚀 QUICK START

### Step 1: Verify Configuration

Check that these files exist in your project:

```
✅ .cursorrules (project root)
✅ .copilot/directives.md
✅ .vscode/settings.json
✅ .vscode/keybindings.json
✅ .vscode/typescript.code-snippets
```

### Step 2: Test Copilot

1. Open any TypeScript file
2. Press `Ctrl+Space` to trigger inline suggestions
3. Press `Ctrl+Shift+I` to open Copilot chat
4. Type: "Test divine mode" - you should get a concise response

### Step 3: Learn the Essential Shortcuts

| Shortcut          | Action                            |
| ----------------- | --------------------------------- |
| `Ctrl+Space`      | Trigger Copilot inline suggestion |
| `Alt+Enter`       | Accept suggestion                 |
| `Alt+[` / `Alt+]` | Navigate suggestions              |
| `Ctrl+Shift+I`    | Open Copilot chat                 |
| `Ctrl+Shift+X`    | Reject suggestion                 |

---

## ⚡ THE GODLIKE WORKFLOW

### The 4-Step Process

```mermaid
graph LR
    A[1. Parse Intent] --> B[2. Craft Precision Prompt]
    B --> C[3. Execute Generation]
    C --> D[4. Validate & Commit]
```

#### 1. Parse Intent

**What are you actually trying to build?**

❌ Bad: "I need a component"
✅ Good: "Farm profile card with image, stats, and favorite action"

#### 2. Craft Precision Prompt

**Use the godlike prompt templates below**

❌ Bad: "Create a farm card component"
✅ Good: "Generate src/components/features/FarmProfileCard.tsx with Farm type from Prisma, shadcn/ui Card, favorite button, responsive layout. Code only."

#### 3. Execute Generation

**Use the right tool for the job**

- **Inline Completion** (`Ctrl+Space`): Small code snippets, function bodies
- **Copilot Chat** (`Ctrl+Shift+I`): Complete files, complex features
- **Custom Actions** (`Ctrl+Alt+Shift+C`): Predefined workflows

#### 4. Validate & Commit

**Check the generated code**

- [ ] No explanatory comments
- [ ] Proper imports from `@/`
- [ ] TypeScript interfaces included
- [ ] Error handling present
- [ ] Follows project patterns

---

## 🎯 PRECISION PROMPTING TECHNIQUES

### The Anatomy of a Perfect Prompt

```
[ACTION] [FILE_PATH] [REQUIREMENTS] [CONSTRAINTS] [OUTPUT_FORMAT]
```

### Examples

#### ✅ Perfect Prompts

**1. Component Generation**

```
Generate src/components/features/OrderTrackingCard.tsx. Requirements:
- Accept Order type from Prisma
- Display order status with color-coded Badge
- Show timeline of status changes
- Click to view full details
- Use shadcn/ui components
Code only, no explanations.
```

**2. API Route Generation**

```
Create src/app/api/farms/[id]/products/route.ts. Requirements:
- GET: Fetch products for farm with pagination
- POST: Create new product (farmer auth required)
- Validate with Zod schema
- Return QuantumApiResponse format
- Include error handling
Complete implementation.
```

**3. Service Layer Generation**

```
Implement src/lib/services/order.service.ts. Requirements:
- OrderService class with CRUD methods
- createOrder with inventory validation
- updateOrderStatus with notifications
- getOrdersByFarm with filtering
- Use database singleton
- Comprehensive error handling
Show complete class.
```

**4. Feature Implementation**

```
Implement customer order history feature:
1. src/app/(customer)/orders/page.tsx - Server component with data fetch
2. src/components/features/OrderHistoryTable.tsx - Interactive table
3. src/lib/services/order.service.ts - getOrdersByCustomer method
4. src/types/order.ts - OrderHistoryItem type
Complete implementation, all files.
```

#### ❌ Weak Prompts (Avoid These)

```
"Create a component for orders"
→ Too vague, missing requirements

"Can you help me with the farm page?"
→ Not specific, triggers explanatory mode

"I need to add error handling"
→ Missing context, unclear scope
```

### Prompt Modifiers (Power Words)

Add these to enforce specific behaviors:

| Modifier                           | Effect                        |
| ---------------------------------- | ----------------------------- |
| **"Code only"**                    | Suppresses explanations       |
| **"Complete implementation"**      | Forces full file generation   |
| **"Show all files"**               | Generates multiple files      |
| **"Follow existing pattern in X"** | Matches specific code style   |
| **"Optimize for performance"**     | Adds memoization, caching     |
| **"Include tests"**                | Generates test file           |
| **"Agricultural consciousness"**   | Uses divine/biodynamic naming |

### The Precision Prompt Template

Copy-paste this and fill in the blanks:

```
Generate [FILE_PATH].

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Technical constraints:
- Use [specific libraries/patterns]
- Follow [specific pattern from codebase]
- Include [error handling/validation/etc]

Output format: Code only, no explanations.
```

---

## ⌨️ CUSTOM KEYBOARD SHORTCUTS

### Copilot Actions

| Shortcut       | Action                      | Use Case                         |
| -------------- | --------------------------- | -------------------------------- |
| `Ctrl+Space`   | Trigger inline suggestion   | Auto-complete function/component |
| `Alt+Enter`    | Accept suggestion           | Commit Copilot's inline code     |
| `Alt+[`        | Previous suggestion         | Cycle through alternatives       |
| `Alt+]`        | Next suggestion             | Find better option               |
| `Ctrl+Shift+I` | Open Copilot chat           | Complex generation tasks         |
| `Ctrl+Shift+X` | Reject suggestion           | Dismiss unwanted code            |
| `Ctrl+Alt+G`   | Terminal command suggestion | Get shell commands               |

### Divine Custom Actions (with selection)

| Shortcut           | Action             | What It Does                                  |
| ------------------ | ------------------ | --------------------------------------------- |
| `Ctrl+Alt+Shift+C` | Generate component | Creates React component from selection/prompt |
| `Ctrl+Alt+Shift+O` | Optimize code      | Refactors for performance                     |
| `Ctrl+Alt+Shift+E` | Add error handling | Wraps code in try-catch with proper errors    |
| `Ctrl+Alt+Shift+T` | Generate tests     | Creates Vitest test suite                     |
| `Ctrl+Alt+Shift+H` | Extract hook       | Converts logic to custom React hook           |
| `Ctrl+Alt+Shift+D` | Debug code         | Identifies and fixes issues                   |
| `Ctrl+Alt+Shift+R` | Refactor SOLID     | Applies SOLID principles                      |

### Workflow Shortcuts

| Shortcut       | Action          |
| -------------- | --------------- |
| `Ctrl+P`       | Quick file open |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+Shift+F` | Search in files |
| `Ctrl+.`       | Quick fix       |
| `F2`           | Rename symbol   |
| `Ctrl+/`       | Toggle comment  |

---

## 📦 CODE GENERATION TEMPLATES

### Template 1: Complete React Component

**Trigger**: Type `drc` and press `Tab`

**Prompt for Copilot**:

```
Generate complete React component src/components/features/[Name].tsx with:
- TypeScript interface for props
- Proper imports (shadcn/ui, types)
- Loading and error states
- Responsive design with Tailwind
Code only.
```

### Template 2: API Route Handler

**Trigger**: Type `dapi` and press `Tab`

**Prompt for Copilot**:

```
Create API route src/app/api/[resource]/route.ts with:
- GET and POST handlers
- Authentication check with auth()
- Zod validation
- QuantumApiResponse format
- Comprehensive error handling
Complete implementation.
```

### Template 3: Service Layer Class

**Trigger**: Type `dservice` and press `Tab`

**Prompt for Copilot**:

```
Implement service class src/lib/services/[resource].service.ts with:
- CRUD methods (create, findById, findAll, update, delete)
- Input validation
- Error handling with custom errors
- Database singleton usage
- TypeScript strict mode
Show complete class.
```

### Template 4: Server Action

**Trigger**: Type `daction` and press `Tab`

**Prompt for Copilot**:

```
Create server action src/app/actions/[resource].actions.ts with:
- "use server" directive
- Authentication check
- Zod validation
- revalidatePath after mutation
- Error handling
- Return type { success: boolean; error?: string; data?: T }
Complete implementation.
```

### Template 5: Custom Hook

**Trigger**: Type `dhook` and press `Tab`

**Prompt for Copilot**:

```
Create custom hook src/hooks/use[Name].ts with:
- TypeScript interfaces for options and return
- State management (useState)
- Side effects (useEffect)
- Memoized callbacks (useCallback)
- Loading and error states
- Cleanup on unmount
Complete hook implementation.
```

---

## 🔄 COMMON WORKFLOWS

### Workflow 1: New Feature Implementation

**Scenario**: Implement "Customer Order Tracking"

**Steps**:

1. **Plan the architecture**

   ```
   Copilot Chat: "List files needed for customer order tracking feature with Next.js 15 app router, including page, components, API routes, types."
   ```

2. **Generate page component**

   ```
   Generate src/app/(customer)/orders/page.tsx:
   - Server component
   - Fetch orders with auth check
   - Display OrderHistoryTable component
   - Loading skeleton
   - Error boundary
   Complete implementation.
   ```

3. **Generate feature component**

   ```
   Generate src/components/features/OrderHistoryTable.tsx:
   - Accept Order[] from Prisma
   - Table with sortable columns (date, total, status)
   - Status badge with colors
   - View details button
   - Empty state
   - Use shadcn/ui Table
   Code only.
   ```

4. **Generate API route**

   ```
   Create src/app/api/customer/orders/route.ts:
   - GET handler
   - Customer authentication required
   - Fetch orders with database.order.findMany
   - Include farm and products relations
   - Pagination support
   - Return QuantumApiResponse
   Complete implementation.
   ```

5. **Generate types**

   ```
   Create src/types/order.ts with:
   - OrderHistoryItem interface
   - OrderStatus enum
   - OrderFilters interface
   TypeScript only.
   ```

6. **Generate tests**
   - Select component
   - Press `Ctrl+Alt+Shift+T`
   - Copilot generates test file

### Workflow 2: Refactoring Existing Code

**Scenario**: Optimize `ProductGrid` component

**Steps**:

1. **Select the component code**
2. **Press** `Ctrl+Alt+Shift+O` (or open chat)
3. **Prompt**:
   ```
   Refactor this ProductGrid component for performance:
   - Add React.memo
   - Memoize callbacks with useCallback
   - Optimize re-renders
   - Add virtualization for 100+ products
   - Maintain existing functionality
   Show refactored code only.
   ```

### Workflow 3: Adding Error Handling

**Scenario**: Wrap API call in proper error handling

**Steps**:

1. **Select the async function**
2. **Press** `Ctrl+Alt+Shift+E`
3. Copilot wraps in try-catch with:
   - Custom error types
   - Proper error messages
   - Loading states
   - User feedback

### Workflow 4: Debugging

**Scenario**: Fix a bug in order processing

**Steps**:

1. **Select the problematic code**
2. **Press** `Ctrl+Alt+Shift+D` (or open chat)
3. **Prompt**:
   ```
   Debug this order processing code. Issue: orders are created with wrong total.
   - Identify calculation error
   - Fix the bug
   - Add validation to prevent future errors
   Show fixed code only.
   ```

### Workflow 5: Test Generation

**Scenario**: Add tests for `FarmService`

**Steps**:

1. **Open** `src/lib/services/farm.service.ts`
2. **Select the entire class**
3. **Press** `Ctrl+Alt+Shift+T` (or open chat)
4. **Prompt**:
   ```
   Generate comprehensive Vitest tests for this FarmService class:
   - Test all CRUD methods
   - Mock database calls
   - Test error scenarios
   - Test edge cases (empty results, duplicates)
   - Use vitest, not jest
   Complete test file.
   ```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Copilot Gives Explanations

**Problem**: Copilot outputs "Here's the code..." or adds summaries

**Solution**:

- Add "Code only, no explanations" to every prompt
- Check `.copilot/directives.md` is in project root
- Restart Cursor/VS Code to reload settings

### Issue 2: Incomplete Code Generation

**Problem**: Copilot generates partial implementations

**Solution**:

- Use "Complete implementation" or "Show all files"
- Be more specific about requirements
- Break into smaller, focused prompts

### Issue 3: Wrong Import Paths

**Problem**: Imports use relative paths or wrong aliases

**Solution**:

- Specify in prompt: "Use @/ path aliases"
- Check `tsconfig.json` has correct path mappings
- Remind: "Import database from '@/lib/database'"

### Issue 4: Not Following Project Patterns

**Problem**: Generated code doesn't match existing style

**Solution**:

- Reference existing files: "Follow pattern in src/lib/services/farm.service.ts"
- Check `.cursorrules` is active
- Use divine naming conventions

### Issue 5: Copilot Is Slow

**Problem**: Suggestions take >3 seconds

**Solution**:

- Check internet connection
- Verify Copilot subscription is active
- Restart Copilot: `Ctrl+Shift+P` → "Copilot: Restart"
- Reduce file size being edited

---

## 💡 PRO TIPS

### Tip 1: Use Comment Prompts

Instead of opening chat, write a comment and let Copilot complete:

```typescript
// Generate a farm profile card component with image, stats, and favorite button
// [Copilot will suggest the entire component below]
```

### Tip 2: Chain Generations

For large features, generate in sequence:

```
1. "Generate types for order system"
2. "Generate service layer using types from previous output"
3. "Generate API routes using service layer"
4. "Generate UI components consuming API"
```

### Tip 3: Use File Headers for Context

At the top of new files, add:

```typescript
// @generate: Complete API route for farm products
// @requirements: Authentication, pagination, Zod validation
// @pattern: Follow src/app/api/farms/route.ts
```

Then let Copilot generate the rest.

### Tip 4: Leverage Selection Context

Select relevant code before prompting:

- Select interface → "Generate Zod schema matching this interface"
- Select function → "Add comprehensive error handling"
- Select component → "Extract business logic to custom hook"

### Tip 5: Batch Similar Tasks

Generate multiple similar files at once:

```
Generate CRUD API routes for these resources:
1. src/app/api/farms/route.ts
2. src/app/api/products/route.ts
3. src/app/api/orders/route.ts

Follow same pattern: GET (list), POST (create), with auth and validation.
Output all three files.
```

### Tip 6: Use Divine Naming for Special Features

When you want agricultural consciousness:

```
Generate QuantumFarmAnalytics component with:
- BiodynamicMetrics display
- SeasonalTrends chart
- HarmonicFrequency indicator
Divine implementation.
```

### Tip 7: Iterate with Constraints

If first output isn't perfect, refine:

```
"Previous output is good, but optimize for mobile screens and add loading skeleton."
```

### Tip 8: Document As You Go

After generation, add JSDoc for public APIs:

```typescript
// Select function, then:
"Add JSDoc comments for this function including params, returns, and examples.";
```

### Tip 9: Generate Related Tests Immediately

Right after generating code:

```
"Generate Vitest tests for the code above. Cover happy path, errors, and edge cases."
```

### Tip 10: Use Snippets + Copilot Together

1. Type snippet trigger (e.g., `dapi`)
2. Tab to expand template
3. Let Copilot fill in the details
4. Tab through placeholders

---

## 🎓 ADVANCED TECHNIQUES

### Multi-File Feature Generation

**Prompt Structure**:

```
Generate complete [FEATURE_NAME] feature:

Files to create:
1. [FILE_1_PATH] - [Purpose]
2. [FILE_2_PATH] - [Purpose]
3. [FILE_3_PATH] - [Purpose]

Requirements:
- [Requirement 1]
- [Requirement 2]

Integration:
- [How files connect]

Output all files with proper imports and exports.
```

### Conditional Generation

**Prompt**:

```
Generate [COMPONENT] with conditional behavior:
- If user is admin: show edit/delete buttons
- If user is owner: show edit button only
- If guest: show view-only mode

Use TypeScript discriminated unions for role types.
```

### Pattern Replication

**Prompt**:

```
Replicate the pattern from [EXISTING_FILE] to create [NEW_FILE].
Maintain:
- Same error handling approach
- Same validation strategy
- Same response format
Adapt for [NEW_CONTEXT].
```

### Refactoring with Constraints

**Prompt**:

```
Refactor [FILE] to:
- Reduce complexity (max 10 lines per function)
- Extract reusable utilities
- Improve naming clarity
- Maintain 100% backward compatibility
Show refactored code with extracted utilities.
```

---

## 📊 METRICS & SUCCESS

Track your godlike workflow effectiveness:

### Before Godlike Workflow

- ⏱️ Time to create CRUD API: **45 minutes**
- 🐛 Bugs per feature: **3-5**
- 📝 Code review cycles: **2-3**
- 🔄 Manual refactoring: **High**

### After Godlike Workflow

- ⏱️ Time to create CRUD API: **5 minutes**
- 🐛 Bugs per feature: **0-1**
- 📝 Code review cycles: **1**
- 🔄 Manual refactoring: **Low**

---

## 🎯 DAILY WORKFLOW CHECKLIST

### Morning Routine

- [ ] Pull latest code
- [ ] Review `.copilot/directives.md` for updates
- [ ] Test Copilot connection (`Ctrl+Shift+I` → "Hello")
- [ ] Review sprint tasks and plan generations

### During Development

- [ ] Use precision prompts (not vague requests)
- [ ] Generate tests immediately after features
- [ ] Validate generated code against checklist
- [ ] Commit in small, logical chunks

### End of Day

- [ ] Review all Copilot-generated code
- [ ] Ensure no explanatory comments remain
- [ ] Run full test suite
- [ ] Update directives if new patterns emerged

---

## 🌟 CONCLUSION

You are now equipped to use Copilot as a **precision engineering tool** rather than a basic assistant. Remember:

1. **Be Specific**: Vague prompts = vague code
2. **Enforce Rules**: Always add "Code only, no explanations"
3. **Validate Output**: Check imports, types, error handling
4. **Iterate Quickly**: Refine prompts if output isn't perfect
5. **Maintain Consciousness**: Use agricultural patterns where appropriate

**The Divine Formula**:

```
Precision Prompt + Godlike Configuration = Production-Ready Code
```

---

## 📚 APPENDIX

### A. All Keyboard Shortcuts (Quick Reference)

```
COPILOT CORE
Ctrl+Space          → Trigger suggestion
Alt+Enter           → Accept suggestion
Alt+[ / Alt+]       → Cycle suggestions
Ctrl+Shift+I        → Open chat
Ctrl+Shift+X        → Reject suggestion

COPILOT CUSTOM ACTIONS (with selection)
Ctrl+Alt+Shift+C    → Generate component
Ctrl+Alt+Shift+O    → Optimize code
Ctrl+Alt+Shift+E    → Add error handling
Ctrl+Alt+Shift+T    → Generate tests
Ctrl+Alt+Shift+H    → Extract hook
Ctrl+Alt+Shift+D    → Debug code
Ctrl+Alt+Shift+R    → Refactor SOLID

NAVIGATION
Ctrl+P              → Quick open
Ctrl+Shift+P        → Command palette
Ctrl+Shift+F        → Find in files
Ctrl+T              → Go to symbol

EDITING
Ctrl+.              → Quick fix
F2                  → Rename
Ctrl+/              → Toggle comment
Ctrl+D              → Select next occurrence
Alt+Up/Down         → Move line
Shift+Alt+Up/Down   → Copy line
```

### B. Prompt Templates Library

See `PROMPT_TEMPLATES.md` (to be created)

### C. Common Patterns Reference

See `.cursorrules` and `.github/instructions/` directory

---

**Version**: 1.0 - Godlike Precision Mode
**Status**: FULLY OPERATIONAL
**Last Updated**: 2024

🌾⚡ _Code with agricultural consciousness, prompt with divine precision, deliver with quantum efficiency._ ⚡🌾
