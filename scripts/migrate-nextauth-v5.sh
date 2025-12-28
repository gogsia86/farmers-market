#!/bin/bash

# NextAuth v5 Migration Script
# Updates all getServerSession imports to use @/lib/auth instead of next-auth

echo "🔄 Migrating NextAuth v4 imports to v5..."
echo ""

# Files to update
FILES=(
  "src/app/api/analytics/events/click/route.ts"
  "src/app/api/analytics/events/route.ts"
  "src/app/api/analytics/events/stats/route.ts"
  "src/app/api/analytics/events/trending/route.ts"
  "src/app/api/analytics/interactions/route.ts"
  "src/app/api/saved-searches/route.ts"
  "src/app/api/saved-searches/[id]/execute/route.ts"
  "src/app/api/saved-searches/[id]/route.ts"
  "src/app/api/search-alerts/route.ts"
  "src/app/api/search-alerts/[id]/execute/route.ts"
  "src/app/api/search-alerts/[id]/route.ts"
)

# Replace import statement
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating: $file"

    # Replace the import line
    sed -i 's/import { getServerSession } from "next-auth";/import { auth as getServerSession } from "@\/lib\/auth\/config";/g' "$file"

    echo "   ✅ Updated"
  else
    echo "   ⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run type-check"
echo "2. Test authentication flows"
echo "3. Update any remaining manual imports"
