#!/bin/bash

# 🤖 AI Features Quick Testing Script
# Farmers Market Platform - Test AI Assistant & Advisor
# Usage: ./TEST_AI_FEATURES.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🌾 FARMERS MARKET PLATFORM - AI FEATURES TEST           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}🔍 Checking if dev server is running...${NC}"
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Server is running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo -e "${YELLOW}Please run: npm run dev${NC}"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🧪 MANUAL TESTING GUIDE"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}1. CUSTOMER AI ASSISTANT${NC}"
echo "   📍 URL: http://localhost:3001/ai-assistant"
echo "   👤 Login as: CONSUMER role"
echo "   🎯 Test Questions:"
echo "      • What vegetables are in season?"
echo "      • How do I track my order?"
echo "      • Tell me about organic farms"
echo "      • What payment methods do you accept?"
echo ""

echo -e "${GREEN}2. FARMER AI ADVISOR${NC}"
echo "   📍 URL: http://localhost:3001/farmer/ai-advisor"
echo "   👤 Login as: FARMER role"
echo "   🎯 Test Questions:"
echo "      • What crops should I plant this spring?"
echo "      • How can I improve my soil quality?"
echo "      • What are the best companion plants for tomatoes?"
echo "      • How should I price my products?"
echo ""

echo -e "${GREEN}3. NAVIGATION TESTING${NC}"
echo "   ✨ Customer Menu: Look for 'AI Assistant'"
echo "   ✨ Farmer Menu: Look for 'AI Advisor'"
echo "   📱 Test mobile responsive menu"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  🔧 API TESTING (Optional)"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${YELLOW}⚠️  For API tests, you need a session token${NC}"
echo ""

read -p "Do you want to test the API directly? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Please enter your session token:${NC}"
    echo -e "${YELLOW}(Get it from browser DevTools > Application > Cookies > next-auth.session-token)${NC}"
    read -p "Session Token: " SESSION_TOKEN

    if [ -z "$SESSION_TOKEN" ]; then
        echo -e "${RED}❌ No token provided. Skipping API tests.${NC}"
    else
        echo ""
        echo -e "${BLUE}🧪 Testing GET /api/ai/chat (List Agents)${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        curl -s http://localhost:3001/api/ai/chat \
          -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
          | jq '.' 2>/dev/null || echo "Response received (install jq for pretty output)"

        echo ""
        echo ""
        echo -e "${BLUE}🧪 Testing POST /api/ai/chat (Send Message)${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        curl -s -X POST http://localhost:3001/api/ai/chat \
          -H "Content-Type: application/json" \
          -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
          -d '{
            "message": "What crops should I plant in spring?",
            "agentName": "farmAnalyst"
          }' | jq '.' 2>/dev/null || echo "Response received (install jq for pretty output)"

        echo ""
        echo ""
        echo -e "${BLUE}🧪 Testing Error Handling (Invalid Agent)${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        curl -s -X POST http://localhost:3001/api/ai/chat \
          -H "Content-Type: application/json" \
          -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
          -d '{
            "message": "Hello",
            "agentName": "invalidAgent"
          }' | jq '.' 2>/dev/null || echo "Response received (install jq for pretty output)"

        echo ""
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📊 TESTING CHECKLIST"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "✓ Navigation"
echo "  □ Customer sees 'AI Assistant' in menu"
echo "  □ Farmer sees 'AI Advisor' in menu"
echo "  □ Links work on desktop"
echo "  □ Links work on mobile"
echo ""

echo "✓ Customer AI Assistant"
echo "  □ Page loads at /ai-assistant"
echo "  □ All 4 agents selectable"
echo "  □ Can send messages"
echo "  □ Responses appear correctly"
echo "  □ UI is responsive"
echo ""

echo "✓ Farmer AI Advisor"
echo "  □ Page loads at /farmer/ai-advisor"
echo "  □ All 4 agents selectable"
echo "  □ Farming-focused responses"
echo "  □ UI is responsive"
echo ""

echo "✓ Security"
echo "  □ Must be logged in to access"
echo "  □ Role-based access enforced"
echo "  □ Error messages are clear"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  📚 DOCUMENTATION"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}Full Testing Guide:${NC} AI_FEATURES_TESTING_GUIDE.md"
echo -e "${GREEN}Implementation Status:${NC} READY_FOR_PRODUCTION.md"
echo -e "${GREEN}Session Summary:${NC} SESSION_SUMMARY_AI_IMPLEMENTATION.md"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  🚀 QUICK LINKS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}🌐 Open in browser:${NC}"
echo ""
echo "   Customer AI:  http://localhost:3001/ai-assistant"
echo "   Farmer AI:    http://localhost:3001/farmer/ai-advisor"
echo "   Login Page:   http://localhost:3001/login"
echo "   Home Page:    http://localhost:3001"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  ✅ NEXT STEPS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "1. Complete manual testing checklist above"
echo "2. Review AI_FEATURES_TESTING_GUIDE.md for detailed tests"
echo "3. Deploy to production: vercel --prod"
echo "4. Monitor OpenAI usage: https://platform.openai.com/usage"
echo ""

echo -e "${GREEN}🎉 AI Features are ready for testing!${NC}"
echo ""
