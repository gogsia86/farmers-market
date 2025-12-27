#!/usr/bin/env python3

"""
🌾 PRODUCT TEST MOCK FIXER - MULTI-LINE EDITION
Fixes multi-line mockResolvedValue calls to use ServiceResponse pattern.
Precision fixes for 11 specific occurrences.
"""

import re
import sys
from pathlib import Path

TEST_FILE = Path("src/lib/controllers/__tests__/product.controller.test.ts")

def fix_multiline_mocks(content: str) -> tuple[str, int]:
    """Fix all multi-line mock patterns."""

    changes = 0

    # Pattern: (ProductService.method as jest.Mock).mockResolvedValue(
    #   mockData,
    # );
    #
    # Transform to:
    # (ProductService.method as jest.Mock).mockResolvedValue({
    #   success: true,
    #   data: mockData,
    # });

    # Find all multi-line patterns
    pattern = r'\(ProductService\.(\w+) as jest\.Mock\)\.mockResolvedValue\(\s*\n\s+(\w+),\s*\n\s+\);'

    def replace_multiline(match):
        nonlocal changes
        method_name = match.group(1)
        data_value = match.group(2)
        changes += 1

        return f'''(ProductService.{method_name} as jest.Mock).mockResolvedValue({{
        success: true,
        data: {data_value},
      }});'''

    content = re.sub(pattern, replace_multiline, content)

    # Also handle multi-line with objects spread across lines
    # Pattern for updateInventory and similar with inline objects
    pattern2 = r'\(ProductService\.(\w+) as jest\.Mock\)\.mockResolvedValue\(\s*\n\s+([\w{][\s\S]*?),\s*\n\s+\);'

    def replace_complex_multiline(match):
        nonlocal changes
        method_name = match.group(1)
        data_content = match.group(2).strip()

        # Check if already wrapped with success/data
        if 'success:' in data_content and 'data:' in data_content:
            return match.group(0)

        # Check if it's a simple variable name
        if data_content.isidentifier() or (data_content.startswith('{') and data_content.endswith('}')):
            changes += 1
            return f'''(ProductService.{method_name} as jest.Mock).mockResolvedValue({{
        success: true,
        data: {data_content},
      }});'''

        return match.group(0)

    content = re.sub(pattern2, replace_complex_multiline, content, flags=re.MULTILINE)

    return content, changes


def main():
    print("╔════════════════════════════════════════════════════════════╗")
    print("║ 🌾 PRODUCT TEST MOCK FIXER - MULTI-LINE EDITION          ║")
    print("║    ServiceResponse Pattern for Multi-line Mocks           ║")
    print("╚════════════════════════════════════════════════════════════╝\n")

    if not TEST_FILE.exists():
        print(f"❌ Test file not found: {TEST_FILE}")
        sys.exit(1)

    print(f"📁 Target: {TEST_FILE}\n")

    # Create backup
    backup_path = TEST_FILE.with_suffix('.ts.multiline-backup')
    content = TEST_FILE.read_text(encoding='utf-8')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✅ Created backup: {backup_path.name}\n")

    print("🔄 Fixing multi-line mocks...\n")

    # Apply fixes
    fixed_content, changes = fix_multiline_mocks(content)

    if changes > 0:
        TEST_FILE.write_text(fixed_content, encoding='utf-8')
        print(f"✅ Fixed {changes} multi-line mocks\n")
    else:
        print("✓ No changes needed\n")
        backup_path.unlink()

    print("╔════════════════════════════════════════════════════════════╗")
    print("║ 📊 SUMMARY                                                 ║")
    print("╠════════════════════════════════════════════════════════════╣")
    print(f"║ Fixed:              {str(changes).ljust(36)} ║")
    print("╚════════════════════════════════════════════════════════════╝\n")

    print("🎯 Next Steps:")
    print("   1. Review: git diff src/lib/controllers/__tests__/product.controller.test.ts")
    print('   2. Test: npm test -- --testPathPatterns="product.controller"')
    print("\n✨ Multi-line fix complete!\n")


if __name__ == "__main__":
    main()
