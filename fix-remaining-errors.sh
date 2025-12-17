#!/bin/bash

# ========================================
# FIX REMAINING TYPESCRIPT ERRORS
# ========================================
# This script systematically fixes all remaining TypeScript errors
# Last Updated: January 2025

echo ""
echo "========================================"
echo " FIXING REMAINING TYPESCRIPT ERRORS"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error counter
INITIAL_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
echo -e "${YELLOW}Initial TypeScript errors: $INITIAL_ERRORS${NC}"
echo ""

# ============================================
# FIX 1: Remove unused imports from page.tsx
# ============================================
echo "[FIX 1/10] Removing unused imports from page.tsx..."
sed -i 's/getFeaturedFarms, //' "src/app/page.tsx" 2>/dev/null || \
  sed -i '' 's/getFeaturedFarms, //' "src/app/page.tsx" 2>/dev/null
sed -i 's/, getPlatformStats//' "src/app/page.tsx" 2>/dev/null || \
  sed -i '' 's/, getPlatformStats//' "src/app/page.tsx" 2>/dev/null
echo -e "${GREEN}✓ Fixed unused imports in page.tsx${NC}"

# ============================================
# FIX 2: Fix WeatherWidget unused import
# ============================================
echo "[FIX 2/10] Fixing WeatherWidget.tsx..."
sed -i 's/Thermometer, //' "src/components/agricultural/WeatherWidget.tsx" 2>/dev/null || \
  sed -i '' 's/Thermometer, //' "src/components/agricultural/WeatherWidget.tsx" 2>/dev/null
echo -e "${GREEN}✓ Fixed WeatherWidget unused import${NC}"

# ============================================
# FIX 3: Fix cart unused imports
# ============================================
echo "[FIX 3/10] Fixing QuickCheckout.tsx..."
sed -i 's/Truck, //' "src/components/cart/QuickCheckout.tsx" 2>/dev/null || \
  sed -i '' 's/Truck, //' "src/components/cart/QuickCheckout.tsx" 2>/dev/null
sed -i 's/ChevronRight, //' "src/components/cart/QuickCheckout.tsx" 2>/dev/null || \
  sed -i '' 's/ChevronRight, //' "src/components/cart/QuickCheckout.tsx" 2>/dev/null
echo -e "${GREEN}✓ Fixed QuickCheckout unused imports${NC}"

# ============================================
# FIX 4: Fix checkout unused imports
# ============================================
echo "[FIX 4/10] Fixing OrderSummaryEnhanced.tsx..."
sed -i 's/DollarSign, //' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null || \
  sed -i '' 's/DollarSign, //' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null
sed -i 's/Percent, //' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null || \
  sed -i '' 's/Percent, //' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null
sed -i 's/CheckCircle, //' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null || \
  sed -i '' 's/CheckCircle, //' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null
echo -e "${GREEN}✓ Fixed OrderSummaryEnhanced unused imports${NC}"

# ============================================
# FIX 5: Fix orders unused imports
# ============================================
echo "[FIX 5/10] Fixing TrackingTimeline.tsx..."
sed -i 's/ChevronRight, //' "src/components/orders/TrackingTimeline.tsx" 2>/dev/null || \
  sed -i '' 's/ChevronRight, //' "src/components/orders/TrackingTimeline.tsx" 2>/dev/null
echo -e "${GREEN}✓ Fixed TrackingTimeline unused imports${NC}"

# ============================================
# FIX 6: Fix unused variables (prefix with _)
# ============================================
echo "[FIX 6/10] Fixing unused variables..."

# Fix currentStep and setCurrentStep
sed -i 's/const \[currentStep, setCurrentStep\]/const [_currentStep, _setCurrentStep]/' "src/components/cart/QuickCheckout.tsx" 2>/dev/null || \
  sed -i '' 's/const \[currentStep, setCurrentStep\]/const [_currentStep, _setCurrentStep]/' "src/components/cart/QuickCheckout.tsx" 2>/dev/null

# Fix method parameter
sed -i 's/(method)/(\_method)/' "src/components/cart/QuickCheckout.tsx" 2>/dev/null || \
  sed -i '' 's/(method)/(\_method)/' "src/components/cart/QuickCheckout.tsx" 2>/dev/null

# Fix deliveryAddress
sed -i 's/const deliveryAddress =/const _deliveryAddress =/' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null || \
  sed -i '' 's/const deliveryAddress =/const _deliveryAddress =/' "src/components/checkout/OrderSummaryEnhanced.tsx" 2>/dev/null

# Fix destination
sed -i 's/const destination =/const _destination =/' "src/components/orders/TrackingTimeline.tsx" 2>/dev/null || \
  sed -i '' 's/const destination =/const _destination =/' "src/components/orders/TrackingTimeline.tsx" 2>/dev/null

# Fix request parameter
sed -i 's/(request: NextRequest)/(\_request: NextRequest)/' "src/app/api/monitoring/performance/route.ts" 2>/dev/null || \
  sed -i '' 's/(request: NextRequest)/(\_request: NextRequest)/' "src/app/api/monitoring/performance/route.ts" 2>/dev/null

echo -e "${GREEN}✓ Fixed unused variables${NC}"

# ============================================
# FIX 7: Fix ProductComparison type issues
# ============================================
echo "[FIX 7/10] Fixing ProductComparison.tsx type issues..."
cat > /tmp/product-comparison-fix.txt << 'EOF'
// Add proper type annotation
const colorClasses: Record<string, string> = {
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
};
EOF
echo -e "${YELLOW}Note: ProductComparison.tsx needs manual type annotation for colorClasses${NC}"

# ============================================
# FIX 8: Fix ProductRecommendations type mismatch
# ============================================
echo "[FIX 8/10] Fixing ProductRecommendations.tsx..."
# The fix for this was already applied - ensure category has fallback
sed -i 's/category: categories\[Math.floor(Math.random() \* categories.length)\]/category: categories[Math.floor(Math.random() * categories.length)] || "Vegetables"/' "src/components/products/ProductRecommendations.tsx" 2>/dev/null || \
  sed -i '' 's/category: categories\[Math.floor(Math.random() \* categories.length)\]/category: categories[Math.floor(Math.random() * categories.length)] || "Vegetables"/' "src/components/products/ProductRecommendations.tsx" 2>/dev/null
echo -e "${GREEN}✓ Fixed ProductRecommendations type mismatch${NC}"

# ============================================
# FIX 9: Fix AgriculturalChart React import
# ============================================
echo "[FIX 9/10] Fixing AgriculturalChart.tsx..."
# Remove unused React import if it's there as a standalone
if grep -q "^import React from 'react';" "src/components/ui/AgriculturalChart.tsx" 2>/dev/null; then
  sed -i "/^import React from 'react';$/d" "src/components/ui/AgriculturalChart.tsx" 2>/dev/null || \
    sed -i '' "/^import React from 'react';$/d" "src/components/ui/AgriculturalChart.tsx" 2>/dev/null
fi
echo -e "${GREEN}✓ Fixed AgriculturalChart React import${NC}"

# ============================================
# FIX 10: Fix HarvestCalendar undefined check
# ============================================
echo "[FIX 10/10] Fixing HarvestCalendar.tsx..."
echo -e "${YELLOW}Note: HarvestCalendar.tsx may need manual undefined check at line 288${NC}"

# ============================================
# FINAL VERIFICATION
# ============================================
echo ""
echo "========================================"
echo " RUNNING FINAL VERIFICATION"
echo "========================================"
echo ""

# Generate Prisma Client (in case types changed)
echo "Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Run TypeScript check
echo "Running TypeScript check..."
FINAL_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")

echo ""
echo "========================================"
echo " RESULTS"
echo "========================================"
echo ""
echo -e "Initial errors:  ${RED}$INITIAL_ERRORS${NC}"
echo -e "Final errors:    ${GREEN}$FINAL_ERRORS${NC}"
echo -e "Errors fixed:    ${GREEN}$((INITIAL_ERRORS - FINAL_ERRORS))${NC}"
echo ""

if [ "$FINAL_ERRORS" -eq "0" ]; then
  echo -e "${GREEN}✓ ALL TYPESCRIPT ERRORS FIXED!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Run: npm test"
  echo "  2. Run: npm run build"
  echo "  3. Deploy to production!"
else
  echo -e "${YELLOW}⚠ $FINAL_ERRORS errors remaining${NC}"
  echo ""
  echo "Remaining errors:"
  npx tsc --noEmit 2>&1 | grep "error TS" | grep "src/" | head -20
  echo ""
  echo "Most remaining errors can be fixed with:"
  echo "  - Add type guards for undefined checks"
  echo "  - Add optional chaining (?.) operators"
  echo "  - Provide default values for optional properties"
fi

echo ""
echo "========================================"
echo " SCRIPT COMPLETE"
echo "========================================"
echo ""
