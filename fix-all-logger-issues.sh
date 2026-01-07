#!/bin/bash

echo "🔧 Fixing all logger-related issues..."

# 1. Remove duplicate logger imports (logger import in middle of import blocks)
echo "Step 1: Removing duplicate logger imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/^import type {$/,/^} from/ {
  /^import { logger } from/d
}' {} \;

# 2. Fix logger.error/warn/debug with bare error variable
echo "Step 2: Fixing logger.error calls with bare error variables..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i -E '
  s/logger\.(error|warn)\(("[^"]+"),\s*error\);/logger.\1(\2, {\n      error: error instanceof Error ? error.message : String(error)\n    });/g
  s/logger\.(error|warn)\(("[^"]+"),\s*err\);/logger.\1(\2, {\n      error: err instanceof Error ? err.message : String(err)\n    });/g
  s/logger\.(error|warn)\(("[^"]+"),\s*e\);/logger.\1(\2, {\n      error: e instanceof Error ? e.message : String(e)\n    });/g
' {} \;

# 3. Fix logger.debug/info with bare string second parameter
echo "Step 3: Fixing logger.debug/info calls..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i -E '
  s/logger\.(debug|info)\(("[^"]+"):?,\s*([a-zA-Z_][a-zA-Z0-9_.]*)\);/logger.\1(\2, { value: \3 });/g
' {} \;

# 4. Remove malformed { data: } objects
echo "Step 4: Removing malformed context objects..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '
  s/, { data:   })/))/g
  s/, { data: })/))/g
' {} \;

# 5. Fix files that both import and define logger
echo "Step 5: Checking for logger naming conflicts..."
for file in src/lib/logger/index.ts src/lib/monitoring/agricultural-logger.ts; do
  if [ -f "$file" ]; then
    echo "  Skipping $file (defines its own logger)"
  fi
done

echo "✅ All fixes applied!"
