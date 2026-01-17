#!/bin/bash
# Add jsdom environment directive to React test files

FILES=(
  "src/components/notifications/__tests__/integration.test.tsx"
  "src/components/notifications/__tests__/Toast.test.tsx"
  "src/hooks/__tests__/use-notifications.test.ts"
  "src/hooks/__tests__/useAgriculturalConsciousness.test.ts"
  "src/hooks/__tests__/useComponentConsciousness.test.ts"
  "src/hooks/__tests__/useQuantumConsciousness.test.ts"
  "src/hooks/__tests__/useSeasonalConsciousness.test.ts"
  "src/tests/integration/settings/farmer-settings.integration.test.tsx"
  "src/tests/unit/components/settings/BusinessHoursEditor.test.tsx"
  "src/tests/unit/components/settings/DeliveryZonesManager.test.tsx"
  "src/__tests__/animations/animation-accessibility.test.tsx"
  "src/__tests__/animations/banner-animations.test.tsx"
  "src/__tests__/animations/toast-animations.test.tsx"
)

JSDOM_DIRECTIVE="/**
 * @jest-environment jsdom
 */

"

echo "🔧 Adding jsdom environment directive to React test files..."
echo ""

FIXED=0
SKIPPED=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi

  # Check if already has jsdom directive
  if grep -q "@jest-environment jsdom" "$file"; then
    echo "⏭️  Skipped (already has jsdom): $file"
    ((SKIPPED++))
    continue
  fi

  # Create temporary file with jsdom directive prepended
  echo "$JSDOM_DIRECTIVE" | cat - "$file" > temp_file && mv temp_file "$file"

  echo "✅ Added jsdom to: $file"
  ((FIXED++))
done

echo ""
echo "================================================"
echo "Summary:"
echo "  Files fixed: $FIXED"
echo "  Files skipped: $SKIPPED"
echo "================================================"
echo ""
echo "✨ Done! Run 'npm run test:unit' to verify improvements."
