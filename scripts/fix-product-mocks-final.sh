#!/bin/bash

# 🌾 PRODUCT TEST MOCK FINAL FIXER
# Manual fixes for remaining multi-line mocks that need ServiceResponse wrapping

set -e

TEST_FILE="src/lib/controllers/__tests__/product.controller.test.ts"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║ 🌾 PRODUCT TEST MOCK FINAL FIXER                          ║"
echo "║    Manual ServiceResponse Pattern Fixes                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -f "$TEST_FILE" ]; then
    echo "❌ Test file not found: $TEST_FILE"
    exit 1
fi

# Create backup
BACKUP="${TEST_FILE}.manual-backup-$(date +%Y%m%d-%H%M%S)"
cp "$TEST_FILE" "$BACKUP"
echo "✅ Created backup: $BACKUP"
echo ""

echo "🔄 Applying manual fixes..."
echo ""

# Fix 1: getProductById - Line ~382
sed -i 's/(ProductService\.getProductById as jest\.Mock)\.mockResolvedValue($/& {/' "$TEST_FILE"
sed -i '/^      (ProductService\.getProductById as jest\.Mock)\.mockResolvedValue( {/,/^      );$/ {
  /^      (ProductService\.getProductById as jest\.Mock)\.mockResolvedValue( {/a\
        success: true,\
        data:
  /mockQuantumProduct,$/s/mockQuantumProduct,/mockQuantumProduct/
  /^      );$/i\
      },
}' "$TEST_FILE"

# Fix 2: getProductBySlug - Line ~428
sed -i '/^      (ProductService\.getProductBySlug as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.getProductBySlug as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        mockQuantumProduct,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 3: updateProduct - Line ~488
sed -i '/^      (ProductService\.updateProduct as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.updateProduct as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        updatedProduct,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 4 & 5: searchProducts - Lines ~614, ~654
sed -i '/^      (ProductService\.searchProducts as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.searchProducts as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        searchResults,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 6: updateInventory - Line ~696
sed -i '/^      (ProductService\.updateInventory as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.updateInventory as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        updatedProduct,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 7: batchUpdateProducts - Line ~827
sed -i '/^      (ProductService\.batchUpdateProducts as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.batchUpdateProducts as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        undefined,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 8: getRelatedProducts - Line ~906
sed -i '/^      (ProductService\.getRelatedProducts as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.getRelatedProducts as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        relatedProducts,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 9: incrementViewCount - Line ~969
sed -i '/^      (ProductService\.incrementViewCount as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.incrementViewCount as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        updatedProduct,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 10: getProductDetailBySlug - Line ~997
sed -i '/^      (ProductService\.getProductDetailBySlug as jest\.Mock)\.mockResolvedValue($/,/^      );$/ {
  /^      (ProductService\.getProductDetailBySlug as jest\.Mock)\.mockResolvedValue($/a\
        {\n          success: true,\n          data:
  /^        mockQuantumProduct,$/s/,$/;/
  /^      );$/c\
        },\n      );
}' "$TEST_FILE"

# Fix 11: getProductDetailBySlug null case - Line ~1009
sed -i '/ProductService\.getProductDetailBySlug.*mockResolvedValue(/,/);$/ {
  /null,$/s/null,/{ success: true, data: null },/
}' "$TEST_FILE"

echo "✅ Manual fixes applied"
echo ""
echo "📊 Summary:"
echo "   - Fixed 11 multi-line mocks"
echo "   - All mocks now use ServiceResponse pattern"
echo ""
echo "🎯 Next Steps:"
echo "   1. Review: git diff $TEST_FILE"
echo "   2. Test: npm test -- --testPathPatterns=\"product.controller\""
echo ""
echo "✨ Manual fix script complete!"
