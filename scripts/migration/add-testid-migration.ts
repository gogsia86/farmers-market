#!/usr/bin/env tsx

/**
 * 🏷️ Data-TestId Migration Tool
 * Farmers Market Platform - Automated TestId Addition
 * Version: 1.0.0
 *
 * Automatically adds data-testid attributes to React components
 * following the project's naming conventions.
 *
 * Usage:
 *   npm run migrate:testid
 *   tsx scripts/add-testid-migration.ts
 *   tsx scripts/add-testid-migration.ts --dry-run
 *   tsx scripts/add-testid-migration.ts --path src/components/ui
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  srcDir: "./src",
  componentsDir: "./src/components",
  appDir: "./src/app",
  dryRun: process.argv.includes("--dry-run") || process.argv.includes("-d"),
  verbose: process.argv.includes("--verbose") || process.argv.includes("-v"),
  customPath: process.argv
    .find((arg) => arg.startsWith("--path="))
    ?.split("=")[1],
};

// ============================================================================
// COLOR OUTPUT
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
  detail: (msg: string) => console.log(`  ${colors.gray}${msg}${colors.reset}`),
  header: (msg: string) =>
    console.log(
      `\n${colors.bright}${colors.magenta}${"=".repeat(60)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.magenta}${"=".repeat(60)}${colors.reset}\n`,
    ),
};

// ============================================================================
// TESTID NAMING CONVENTIONS
// ============================================================================

/**
 * Component type to testid naming pattern
 */
const NAMING_CONVENTIONS: Record<string, (name: string) => string> = {
  button: (name) => `${kebabCase(name)}-button`,
  link: (name) => `${kebabCase(name)}-link`,
  input: (name) => `${kebabCase(name)}-input`,
  form: (name) => `${kebabCase(name)}-form`,
  card: (name) => `${kebabCase(name)}-card`,
  modal: (name) => `${kebabCase(name)}-modal`,
  dialog: (name) => `${kebabCase(name)}-dialog`,
  nav: (name) => `${kebabCase(name)}-nav`,
  header: (name) => `${kebabCase(name)}-header`,
  footer: (name) => `${kebabCase(name)}-footer`,
  section: (name) => `${kebabCase(name)}-section`,
  container: (name) => `${kebabCase(name)}-container`,
  grid: (name) => `${kebabCase(name)}-grid`,
  list: (name) => `${kebabCase(name)}-list`,
  item: (name) => `${kebabCase(name)}-item`,
  default: (name) => kebabCase(name),
};

/**
 * Element patterns to add testid to
 */
const ELEMENT_PATTERNS = [
  // Interactive elements (PRIORITY)
  {
    pattern: /<button\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "button",
    priority: 1,
  },
  {
    pattern: /<a\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "link",
    priority: 1,
  },
  {
    pattern: /<input\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "input",
    priority: 1,
  },
  {
    pattern: /<textarea\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "input",
    priority: 1,
  },
  {
    pattern: /<select\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "input",
    priority: 1,
  },
  {
    pattern: /<form\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "form",
    priority: 1,
  },

  // Structural elements
  {
    pattern: /<nav\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "nav",
    priority: 2,
  },
  {
    pattern: /<header\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "header",
    priority: 2,
  },
  {
    pattern: /<footer\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "footer",
    priority: 2,
  },
  {
    pattern: /<main\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "section",
    priority: 2,
  },
  {
    pattern: /<section\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "section",
    priority: 2,
  },
  {
    pattern: /<article\s+([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "container",
    priority: 2,
  },

  // Content elements
  {
    pattern:
      /<div\s+className="[^"]*card[^"]*"([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "card",
    priority: 3,
  },
  {
    pattern:
      /<div\s+className="[^"]*modal[^"]*"([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "modal",
    priority: 3,
  },
  {
    pattern:
      /<div\s+className="[^"]*dialog[^"]*"([^>]*?)(?:data-testid="([^"]*)")?([^>]*?)>/gi,
    type: "dialog",
    priority: 3,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert string to kebab-case
 */
function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Extract component name from file path
 */
function getComponentName(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  return fileName.replace(/\.(tsx?|jsx?)$/, "");
}

/**
 * Generate testid based on component name and context
 */
function generateTestId(
  componentName: string,
  elementType: string,
  context?: string,
): string {
  const namingFn =
    NAMING_CONVENTIONS[elementType] || NAMING_CONVENTIONS.default;
  const baseName = context || componentName;
  return namingFn(baseName);
}

/**
 * Check if element already has data-testid
 */
function hasTestId(element: string): boolean {
  return /data-testid\s*=\s*["']/.test(element);
}

/**
 * Extract meaningful context from element attributes
 */
function extractContext(element: string): string | null {
  // Try to get id
  const idMatch = element.match(/id\s*=\s*["']([^"']+)["']/);
  if (idMatch) return idMatch[1];

  // Try to get name
  const nameMatch = element.match(/name\s*=\s*["']([^"']+)["']/);
  if (nameMatch) return nameMatch[1];

  // Try to get aria-label
  const ariaMatch = element.match(/aria-label\s*=\s*["']([^"']+)["']/);
  if (ariaMatch) return ariaMatch[1];

  // Try to get className that might be meaningful
  const classMatch = element.match(/className\s*=\s*["']([^"']+)["']/);
  if (classMatch) {
    const classes = classMatch[1].split(/\s+/);
    // Look for semantic class names
    const semantic = classes.find((c) =>
      /^(submit|cancel|primary|secondary|close|open|save|delete|edit|create)/.test(
        c,
      ),
    );
    if (semantic) return semantic;
  }

  return null;
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

interface MigrationResult {
  filePath: string;
  elementsUpdated: number;
  changes: string[];
  success: boolean;
  error?: string;
}

/**
 * Process a single file and add testids
 */
function processFile(filePath: string): MigrationResult {
  const result: MigrationResult = {
    filePath,
    elementsUpdated: 0,
    changes: [],
    success: false,
  };

  try {
    let content = readFileSync(filePath, "utf-8");
    const originalContent = content;
    const componentName = getComponentName(filePath);

    // Process each element pattern
    for (const { pattern, type } of ELEMENT_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;

      while ((match = regex.exec(originalContent)) !== null) {
        const fullMatch = match[0];

        // Skip if already has testid
        if (hasTestId(fullMatch)) {
          continue;
        }

        // Extract context
        const context = extractContext(fullMatch);

        // Generate testid
        const testId = generateTestId(
          componentName,
          type,
          context || undefined,
        );

        // Add testid to element
        const updatedElement = fullMatch.replace(
          /^(<\w+)(\s+)/,
          `$1 data-testid="${testId}"$2`,
        );

        // Replace in content
        content = content.replace(fullMatch, updatedElement);

        result.elementsUpdated++;
        result.changes.push(`Added data-testid="${testId}" to ${type} element`);
      }
    }

    // Only write if changes were made and not dry run
    if (content !== originalContent) {
      if (!CONFIG.dryRun) {
        writeFileSync(filePath, content, "utf-8");
      }
      result.success = true;
    } else {
      result.success = true; // No changes needed is also success
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * Recursively find all React component files
 */
function findComponentFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (
          !entry.startsWith(".") &&
          entry !== "node_modules" &&
          entry !== ".next"
        ) {
          files.push(...findComponentFiles(fullPath));
        }
      } else if (stat.isFile()) {
        // Only process React component files
        const ext = extname(entry);
        if ([".tsx", ".jsx"].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    log.error(`Failed to read directory: ${dir}`);
  }

  return files;
}

// ============================================================================
// DOCUMENTATION GENERATOR
// ============================================================================

/**
 * Generate testid naming convention documentation
 */
function generateDocumentation(): string {
  return `# 🏷️ Data-TestId Naming Conventions
**Farmers Market Platform - Testing Standards**

## Overview

This document outlines the naming conventions for \`data-testid\` attributes used throughout the application for automated testing.

## Why Data-TestId?

- **Stability**: CSS classes and DOM structure change frequently
- **Clarity**: Explicit test hooks make intent clear
- **Performance**: Faster selector matching than complex CSS queries
- **Isolation**: Separate testing concerns from styling

## Naming Convention

### Format: \`{component-name}-{element-type}\`

Examples:
- \`submit-button\`
- \`email-input\`
- \`login-form\`
- \`user-profile-card\`
- \`marketplace-nav\`

### Element Types

| Element Type | Suffix | Example |
|--------------|--------|---------|
| Button | \`-button\` | \`submit-button\`, \`cancel-button\` |
| Link | \`-link\` | \`home-link\`, \`profile-link\` |
| Input | \`-input\` | \`email-input\`, \`password-input\` |
| Form | \`-form\` | \`login-form\`, \`register-form\` |
| Card | \`-card\` | \`farm-card\`, \`product-card\` |
| Modal | \`-modal\` | \`delete-confirm-modal\` |
| Dialog | \`-dialog\` | \`alert-dialog\` |
| Navigation | \`-nav\` | \`main-nav\`, \`mobile-nav\` |
| Header | \`-header\` | \`page-header\`, \`farm-header\` |
| Footer | \`-footer\` | \`page-footer\` |
| Section | \`-section\` | \`hero-section\`, \`features-section\` |
| Container | \`-container\` | \`cart-container\` |
| Grid | \`-grid\` | \`product-grid\`, \`farm-grid\` |
| List | \`-list\` | \`order-list\`, \`notification-list\` |
| Item | \`-item\` | \`cart-item\`, \`product-item\` |

## Best Practices

### ✅ DO

\`\`\`tsx
// Clear, descriptive testids
<button data-testid="submit-button">Submit</button>
<input data-testid="email-input" type="email" />
<form data-testid="login-form">...</form>
<div data-testid="farm-card">...</div>

// Use context when multiple similar elements exist
<button data-testid="primary-submit-button">Submit</button>
<button data-testid="secondary-cancel-button">Cancel</button>

// Dynamic testids for list items
<div data-testid={\`farm-card-\${farm.id}\`}>...</div>
<button data-testid={\`delete-product-\${product.id}\`}>Delete</button>
\`\`\`

### ❌ DON'T

\`\`\`tsx
// Too generic
<button data-testid="button">Submit</button>

// Using implementation details
<button data-testid="btn-123-xyz">Submit</button>

// Mixing with IDs
<button data-testid="submitButton">Submit</button>

// Using spaces
<button data-testid="submit button">Submit</button>
\`\`\`

## Component-Specific Guidelines

### Forms
\`\`\`tsx
<form data-testid="customer-registration-form">
  <input data-testid="first-name-input" name="firstName" />
  <input data-testid="last-name-input" name="lastName" />
  <input data-testid="email-input" type="email" />
  <input data-testid="password-input" type="password" />
  <button data-testid="submit-button" type="submit">Register</button>
</form>
\`\`\`

### Navigation
\`\`\`tsx
<nav data-testid="main-nav">
  <a data-testid="home-link" href="/">Home</a>
  <a data-testid="marketplace-link" href="/marketplace">Marketplace</a>
  <a data-testid="about-link" href="/about">About</a>
</nav>
\`\`\`

### Cards/Lists
\`\`\`tsx
<div data-testid="farm-grid">
  {farms.map(farm => (
    <div key={farm.id} data-testid={\`farm-card-\${farm.id}\`}>
      <h3 data-testid="farm-name">{farm.name}</h3>
      <button data-testid={\`view-farm-\${farm.id}-button\`}>View</button>
    </div>
  ))}
</div>
\`\`\`

### Modals/Dialogs
\`\`\`tsx
<dialog data-testid="delete-confirmation-dialog" open={isOpen}>
  <h2 data-testid="dialog-title">Confirm Delete</h2>
  <p data-testid="dialog-message">Are you sure?</p>
  <button data-testid="confirm-delete-button">Delete</button>
  <button data-testid="cancel-button">Cancel</button>
</dialog>
\`\`\`

## Testing with Data-TestId

### Playwright Example
\`\`\`typescript
// Wait for element
await page.waitForSelector('[data-testid="login-form"]');

// Click button
await page.click('[data-testid="submit-button"]');

// Fill input
await page.fill('[data-testid="email-input"]', 'user@example.com');

// Assert visibility
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
\`\`\`

### React Testing Library Example
\`\`\`typescript
import { render, screen } from '@testing-library/react';

// Query by testid
const button = screen.getByTestId('submit-button');

// Assert
expect(button).toBeInTheDocument();
\`\`\`

## Migration Tool

This document was generated alongside an automated migration tool:

\`\`\`bash
# Add testids to all components
npm run migrate:testid

# Dry run (preview changes)
npm run migrate:testid -- --dry-run

# Specific path
npm run migrate:testid -- --path=src/components/ui
\`\`\`

## Maintenance

- **Review**: Check testids during code review
- **Update**: Update testids when component purpose changes
- **Document**: Add comments for complex testid patterns
- **Consistency**: Follow conventions across the codebase

---

**Last Updated:** ${new Date().toISOString().split("T")[0]}
**Version:** 1.0.0
`;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log.header("🏷️ DATA-TESTID MIGRATION TOOL");

  if (CONFIG.dryRun) {
    log.warn("DRY RUN MODE - No files will be modified");
  }

  // Determine directory to process
  const targetDir = CONFIG.customPath || CONFIG.componentsDir;
  log.info(`Target directory: ${targetDir}`);

  // Find all component files
  log.step("Finding component files...");
  const files = findComponentFiles(targetDir);
  log.success(`Found ${files.length} component files`);

  if (files.length === 0) {
    log.warn("No component files found. Exiting.");
    return;
  }

  // Process each file
  log.step("Processing files...\n");
  const results: MigrationResult[] = [];
  let totalElementsUpdated = 0;

  for (const file of files) {
    const relativePath = relative(process.cwd(), file);

    if (CONFIG.verbose) {
      log.detail(`Processing: ${relativePath}`);
    }

    const result = processFile(file);
    results.push(result);

    if (result.elementsUpdated > 0) {
      totalElementsUpdated += result.elementsUpdated;
      log.success(
        `${relativePath}: ${result.elementsUpdated} element(s) updated`,
      );

      if (CONFIG.verbose && result.changes.length > 0) {
        result.changes.forEach((change) => log.detail(`  - ${change}`));
      }
    }

    if (result.error) {
      log.error(`${relativePath}: ${result.error}`);
    }
  }

  // Generate documentation
  log.step("\nGenerating documentation...");
  const docs = generateDocumentation();
  const docsPath = "./DATA_TESTID_CONVENTIONS.md";

  if (!CONFIG.dryRun) {
    writeFileSync(docsPath, docs, "utf-8");
    log.success(`Documentation generated: ${docsPath}`);
  } else {
    log.info(`Documentation would be saved to: ${docsPath}`);
  }

  // Summary report
  log.header("📊 MIGRATION SUMMARY");

  const filesUpdated = results.filter((r) => r.elementsUpdated > 0).length;
  const filesWithErrors = results.filter((r) => r.error).length;

  console.log(`Total Files Processed: ${results.length}`);
  console.log(`${colors.green}Files Updated: ${filesUpdated}${colors.reset}`);
  console.log(
    `${colors.blue}Total Elements Updated: ${totalElementsUpdated}${colors.reset}`,
  );
  console.log(
    `${colors.red}Files with Errors: ${filesWithErrors}${colors.reset}`,
  );

  if (CONFIG.dryRun) {
    log.warn(
      "\n⚠️  This was a DRY RUN. Run without --dry-run to apply changes.",
    );
  } else {
    log.success("\n✅ Migration complete!");
  }

  // Show next steps
  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log("1. Review the changes in your git diff");
  console.log("2. Update bot selectors to use data-testid");
  console.log("3. Read DATA_TESTID_CONVENTIONS.md for guidelines");
  console.log("4. Run tests to ensure everything still works");
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { processFile, findComponentFiles, generateTestId };
