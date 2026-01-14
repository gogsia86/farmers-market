# 🤖 AI Features Testing & Deployment Guide

## 📋 Overview

This guide covers testing, verification, and deployment of the newly implemented AI chat features for the Farmers Market Platform.

**Features Implemented:**
- ✅ AI Chat API (`/api/ai/chat`)
- ✅ Customer AI Assistant UI (`/ai-assistant`)
- ✅ Farmer AI Advisor UI (`/farmer/ai-advisor`)
- ✅ Navigation links in header (role-based)

---

## 🚀 Quick Start Testing

### 1. Prerequisites

```bash
# Ensure all dependencies are installed
npm install

# Verify environment variables
# Required: OPENAI_API_KEY
# Optional: NEXTAUTH_SECRET, DATABASE_URL
```

### 2. Start Development Server

```bash
npm run dev
```

Server should start at: `http://localhost:3001`

---

## 🧪 Testing Checklist

### Phase 1: Authentication & Navigation

#### Test 1.1: Customer Navigation
- [ ] Sign in as a customer (CONSUMER role)
- [ ] Click on user menu (top right)
- [ ] Verify "✨ AI Assistant" appears in dropdown
- [ ] Click "AI Assistant" → should navigate to `/ai-assistant`
- [ ] Open mobile menu → verify "✨ AI Assistant" appears

**Expected Result:** Navigation link visible and working for customers only.

#### Test 1.2: Farmer Navigation
- [ ] Sign in as a farmer (FARMER role)
- [ ] Click on user menu (top right)
- [ ] Verify "✨ AI Advisor" appears in dropdown
- [ ] Click "AI Advisor" → should navigate to `/farmer/ai-advisor`
- [ ] Open mobile menu → verify "✨ AI Advisor" appears

**Expected Result:** Navigation link visible and working for farmers only.

#### Test 1.3: Role Isolation
- [ ] Sign in as admin
- [ ] Verify NO AI links appear (admin role not supported yet)
- [ ] Sign out completely
- [ ] Verify AI links don't appear when not authenticated

**Expected Result:** AI features only visible to appropriate roles.

---

### Phase 2: Customer AI Assistant

#### Test 2.1: Page Load & UI
Navigate to: `http://localhost:3001/ai-assistant`

- [ ] Page loads without errors
- [ ] Title: "AI Shopping Assistant" displayed
- [ ] Description text visible
- [ ] Agent selector shows 4 options:
  - Customer Support
  - Product Catalog
  - Order Processor
  - Farm Analyst
- [ ] Chat interface displays welcome message
- [ ] Input field and Send button present

**Expected Result:** Clean, professional UI loads successfully.

#### Test 2.2: Customer Support Agent
- [ ] Select "Customer Support" agent
- [ ] Send message: "What are your shipping policies?"
- [ ] Verify loading state (spinner/indicator)
- [ ] Response appears in chat (should provide helpful info)
- [ ] Message formatting is clean (markdown supported)
- [ ] Timestamp visible on messages

**Sample Questions:**
```
- What are your shipping policies?
- How do I track my order?
- What payment methods do you accept?
- How do I return a product?
```

#### Test 2.3: Product Catalog Agent
- [ ] Select "Product Catalog" agent
- [ ] Send: "What fresh vegetables are available?"
- [ ] Verify response includes product information
- [ ] Send: "Tell me about organic tomatoes"
- [ ] Response should be contextually relevant

**Sample Questions:**
```
- What fresh vegetables are available?
- Tell me about organic products
- What's in season right now?
- Do you have any dairy products?
```

#### Test 2.4: Order Processor Agent
- [ ] Select "Order Processor" agent
- [ ] Send: "How do I place an order?"
- [ ] Send: "What's the checkout process?"
- [ ] Verify responses are order-focused

**Sample Questions:**
```
- How do I place an order?
- Can I modify my order after placing it?
- What's the checkout process?
- Do you offer bulk discounts?
```

#### Test 2.5: Farm Analyst Agent
- [ ] Select "Farm Analyst" agent
- [ ] Send: "Which farms sell organic produce?"
- [ ] Send: "Tell me about local farms"
- [ ] Verify farm-related information

**Sample Questions:**
```
- Which farms sell organic produce?
- Tell me about local farms in my area
- What farming practices do you support?
- How are farms verified?
```

---

### Phase 3: Farmer AI Advisor

#### Test 3.1: Page Load & UI
Navigate to: `http://localhost:3001/farmer/ai-advisor`

- [ ] Page loads without errors (must be signed in as farmer)
- [ ] Title: "AI Farming Advisor" displayed
- [ ] Agricultural-themed description visible
- [ ] Agent selector shows 4 options (same agents, different context)
- [ ] Chat interface displays farmer-focused welcome message
- [ ] Input field and Send button present

**Expected Result:** Farmer-specific UI loads successfully.

#### Test 3.2: Farm Analyst Agent (Farmer Context)
- [ ] Select "Farm Analyst" agent
- [ ] Send: "What crops should I plant this season?"
- [ ] Send: "How can I improve my soil quality?"
- [ ] Verify responses are farming-focused

**Sample Questions:**
```
- What crops should I plant this season?
- How can I improve my soil quality?
- What are the best companion plants for tomatoes?
- When should I harvest my winter crops?
```

#### Test 3.3: Product Catalog Agent (Farmer Context)
- [ ] Select "Product Catalog" agent
- [ ] Send: "How should I price my tomatoes?"
- [ ] Send: "What products are in high demand?"
- [ ] Verify farmer-specific guidance

**Sample Questions:**
```
- How should I price my products?
- What products are in high demand?
- How do I create compelling product descriptions?
- What certifications should I highlight?
```

#### Test 3.4: Order Processor Agent (Farmer Context)
- [ ] Select "Order Processor" agent
- [ ] Send: "How do I fulfill customer orders?"
- [ ] Send: "What's the order management process?"
- [ ] Verify order fulfillment guidance

**Sample Questions:**
```
- How do I fulfill customer orders?
- What's the order management process?
- How do I handle order cancellations?
- Can I set minimum order quantities?
```

#### Test 3.5: Customer Support Agent (Farmer Context)
- [ ] Select "Customer Support" agent
- [ ] Send: "How do I communicate with customers?"
- [ ] Verify farmer-focused support guidance

**Sample Questions:**
```
- How do I communicate with customers?
- How should I handle customer complaints?
- What information should I provide about my farm?
```

---

### Phase 4: API Testing (Direct)

#### Test 4.1: GET Available Agents
```bash
# Test authentication + agent list
curl -i http://localhost:3001/api/ai/chat \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "agents": [
    {
      "name": "customerSupport",
      "displayName": "Customer Support",
      "description": "General customer service and platform assistance"
    },
    {
      "name": "productCatalog",
      "displayName": "Product Catalog",
      "description": "Product information, recommendations, and availability"
    },
    {
      "name": "orderProcessor",
      "displayName": "Order Processor",
      "description": "Order management, tracking, and fulfillment"
    },
    {
      "name": "farmAnalyst",
      "displayName": "Farm Analyst",
      "description": "Farm insights, crop recommendations, and agricultural advice"
    }
  ]
}
```

#### Test 4.2: POST Chat Message
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "message": "What crops should I plant in spring?",
    "agentName": "farmAnalyst",
    "conversationId": "test-conversation-1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "response": "For spring planting, consider...",
    "agentUsed": "farmAnalyst",
    "conversationId": "test-conversation-1",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Test 4.3: Error Handling
```bash
# Test missing message
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"agentName": "farmAnalyst"}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message is required"
  }
}
```

```bash
# Test invalid agent
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "message": "Hello",
    "agentName": "invalidAgent"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid agent name"
  }
}
```

```bash
# Test unauthenticated request
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "agentName": "farmAnalyst"}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

### Phase 5: Edge Cases & Error Handling

#### Test 5.1: Network Errors
- [ ] Disconnect internet
- [ ] Send message in chat
- [ ] Verify error message displays to user
- [ ] Reconnect internet
- [ ] Verify user can retry

#### Test 5.2: Long Messages
- [ ] Send a very long message (>1000 characters)
- [ ] Verify it's handled gracefully
- [ ] Check response truncation if needed

#### Test 5.3: Rapid Messages
- [ ] Send multiple messages quickly in succession
- [ ] Verify all are processed in order
- [ ] Check for race conditions

#### Test 5.4: Special Characters
- [ ] Send message with emojis: "🌾 What crops grow well? 🌱"
- [ ] Send message with markdown: "**Bold** and *italic* text"
- [ ] Send message with code: `` `code snippet` ``
- [ ] Verify proper handling and display

#### Test 5.5: Session Expiry
- [ ] Start chat session
- [ ] Wait for session to expire (or manually clear)
- [ ] Try to send message
- [ ] Verify redirect to login or clear error message

---

## 🔍 Browser Compatibility Testing

Test in the following browsers:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)
- [ ] **Mobile Chrome** (iOS/Android)
- [ ] **Mobile Safari** (iOS)

### Key Areas:
- [ ] Navigation links render correctly
- [ ] Chat UI displays properly
- [ ] Messages send and receive
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] No console errors

---

## 📱 Responsive Design Testing

### Desktop (1920x1080)
- [ ] Header navigation clear and accessible
- [ ] Chat interface uses full width appropriately
- [ ] Messages are readable and well-formatted
- [ ] Agent selector is prominent

### Tablet (768x1024)
- [ ] Mobile menu works correctly
- [ ] Chat interface adapts to screen size
- [ ] Touch interactions work smoothly

### Mobile (375x667)
- [ ] Mobile menu accessible
- [ ] AI links visible in mobile menu
- [ ] Chat interface fills screen appropriately
- [ ] Keyboard doesn't obscure input field
- [ ] Messages stack vertically nicely

---

## ⚡ Performance Testing

### Test 6.1: Response Time
- [ ] Measure time from send to response
- [ ] Target: < 3 seconds for typical queries
- [ ] Log slow queries for optimization

### Test 6.2: Concurrent Users
- [ ] Open multiple browser tabs/users
- [ ] Send messages simultaneously
- [ ] Verify all get responses
- [ ] Check for rate limiting issues

### Test 6.3: Memory Leaks
- [ ] Use browser dev tools
- [ ] Send 50+ messages in a session
- [ ] Monitor memory usage
- [ ] Verify no significant leaks

---

## 🔒 Security Testing

### Test 7.1: Authentication
- [ ] Try accessing `/ai-assistant` without login
- [ ] Should redirect to login page
- [ ] Try accessing `/farmer/ai-advisor` as customer
- [ ] Should show error or redirect

### Test 7.2: Authorization
- [ ] Verify farmers can't access customer AI assistant
- [ ] Verify customers can't access farmer AI advisor
- [ ] Test API endpoints with wrong role

### Test 7.3: Input Validation
- [ ] Try injecting SQL: `'; DROP TABLE users; --`
- [ ] Try XSS: `<script>alert('xss')</script>`
- [ ] Try extremely long input (10,000+ chars)
- [ ] Verify all are handled safely

### Test 7.4: Rate Limiting (if implemented)
- [ ] Send 100 requests in 1 minute
- [ ] Verify rate limiting kicks in
- [ ] Check error messages are clear

---

## 📊 Monitoring & Logging

### Test 8.1: Error Logging
- [ ] Trigger an error (invalid API key, network failure)
- [ ] Check server logs for error details
- [ ] Verify no sensitive data logged (API keys, passwords)

### Test 8.2: Usage Analytics
- [ ] Send various messages
- [ ] Check if analytics track:
  - Message count
  - Agent usage
  - Response times
  - Error rates

### Test 8.3: OpenAI API Usage
- [ ] Monitor OpenAI dashboard
- [ ] Track token usage
- [ ] Verify costs are within expected range

---

## 🚀 Pre-Production Checklist

Before deploying to production:

### Configuration
- [ ] `OPENAI_API_KEY` set in production environment
- [ ] `NEXTAUTH_SECRET` configured
- [ ] `DATABASE_URL` points to production database
- [ ] All environment variables documented

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no errors
- [ ] No `console.log` statements in production code
- [ ] All TODOs addressed or documented

### Testing
- [ ] All tests in this guide passed
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] E2E tests pass: `npm run test:e2e`

### Performance
- [ ] Build succeeds: `npm run build`
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized (if any added)
- [ ] No memory leaks detected

### Documentation
- [ ] User documentation updated
- [ ] API documentation updated
- [ ] Changelog updated
- [ ] Known issues documented

### Security
- [ ] Security scan completed
- [ ] No hardcoded secrets
- [ ] Rate limiting configured
- [ ] Input validation comprehensive

---

## 🎯 Production Deployment

### Step 1: Environment Setup

**Vercel (Recommended):**
```bash
# Set environment variables
vercel env add OPENAI_API_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
```

**Manual/Docker:**
```bash
# Update .env.production
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Step 2: Build & Test

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Step 3: Deploy

**Vercel:**
```bash
# Deploy to production
vercel --prod
```

**Docker:**
```bash
# Build Docker image
docker build -t farmers-market-platform .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e DATABASE_URL=$DATABASE_URL \
  farmers-market-platform
```

### Step 4: Post-Deployment Verification

- [ ] Visit production URL
- [ ] Test customer AI assistant
- [ ] Test farmer AI advisor
- [ ] Verify navigation links work
- [ ] Check error logging/monitoring
- [ ] Monitor OpenAI API usage
- [ ] Verify performance metrics

---

## 📈 Monitoring Production

### Metrics to Track

1. **Usage Metrics:**
   - Messages sent per day
   - Active users using AI features
   - Most used agents
   - Average conversation length

2. **Performance Metrics:**
   - API response times
   - Error rates
   - Token usage (OpenAI)
   - Server CPU/memory

3. **Cost Metrics:**
   - OpenAI API costs per day
   - Cost per conversation
   - Token usage trends

### Alerts to Configure

- [ ] OpenAI API errors > 5% for 5 minutes
- [ ] Response time > 5 seconds
- [ ] OpenAI costs > $X per day
- [ ] Rate limit exceeded
- [ ] Authentication failures spike

---

## 🐛 Common Issues & Solutions

### Issue 1: "401 Unauthorized"
**Cause:** User not logged in or session expired
**Solution:** Redirect to login page, refresh session

### Issue 2: "Invalid API Key"
**Cause:** `OPENAI_API_KEY` not set or incorrect
**Solution:** Verify environment variable in deployment

### Issue 3: Slow Responses
**Cause:** Large context or complex queries
**Solution:** Implement streaming, optimize prompts, add timeouts

### Issue 4: Navigation Links Not Showing
**Cause:** User role not set correctly
**Solution:** Check user session, verify role assignment

### Issue 5: Chat UI Not Loading
**Cause:** Client-side error, dependency issue
**Solution:** Check browser console, verify all dependencies installed

---

## 📞 Support & Resources

### Internal Documentation
- API Documentation: `/api-docs`
- Component Storybook: (if available)
- Prisma Schema: `prisma/schema.prisma`

### External Resources
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)

### Getting Help
- Check server logs: `pm2 logs` or Docker logs
- Review error monitoring: Sentry dashboard
- OpenAI usage: OpenAI dashboard

---

## ✅ Final Checklist

Before marking AI features as "complete":

- [ ] All tests in this guide passed
- [ ] Navigation links added and tested
- [ ] Both customer and farmer UIs working
- [ ] API endpoints secured and tested
- [ ] Error handling comprehensive
- [ ] Performance acceptable (< 3s responses)
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Monitoring configured
- [ ] Team trained on new features
- [ ] User feedback mechanism in place

---

## 🎉 Success Criteria

The AI features are ready for users when:

✅ Users can easily discover AI features via navigation
✅ Both customer and farmer AI pages load quickly
✅ All 4 agents respond accurately to queries
✅ Error messages are clear and helpful
✅ Performance meets SLA (< 3s response time)
✅ No security vulnerabilities detected
✅ Monitoring and alerts configured
✅ OpenAI costs are within budget

---

**Version:** 1.0
**Last Updated:** January 2025
**Next Review:** After initial production deployment