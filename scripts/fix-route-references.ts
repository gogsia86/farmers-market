#!/usr/bin/env tsx
/**
 * Fix Route References Script
 *
 * This script updates all route references after removing redundant nesting:
 * - (admin)/admin/ → (admin)/
 * - (farmer)/farmer/ → (farmer)/
 * - (monitoring)/monitoring/ → (monitoring)/
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Route replacements to make
const replacements = [
  // Admin routes
  { from: "/admin/admin/", to: "/admin/", description: "Admin routes" },
  {
    from: "/(admin)/admin/",
    to: "/(admin)/",
    description: "Admin route group",
  },
  {
    from: 'href="/admin/admin/',
    to: 'href="/admin/',
    description: "Admin href links",
  },
  {
    from: 'to="/admin/admin/',
    to: 'to="/admin/',
    description: "Admin to links",
  },
  {
    from: 'pathname: "/admin/admin/',
    to: 'pathname: "/admin/',
    description: "Admin pathname",
  },
  {
    from: 'push("/admin/admin/',
    to: 'push("/admin/',
    description: "Admin router.push",
  },
  {
    from: 'redirect("/admin/admin/',
    to: 'redirect("/admin/',
    description: "Admin redirect",
  },

  // Farmer routes
  { from: "/farmer/farmer/", to: "/farmer/", description: "Farmer routes" },
  {
    from: "/(farmer)/farmer/",
    to: "/(farmer)/",
    description: "Farmer route group",
  },
  {
    from: 'href="/farmer/farmer/',
    to: 'href="/farmer/',
    description: "Farmer href links",
  },
  {
    from: 'to="/farmer/farmer/',
    to: 'to="/farmer/',
    description: "Farmer to links",
  },
  {
    from: 'pathname: "/farmer/farmer/',
    to: 'pathname: "/farmer/',
    description: "Farmer pathname",
  },
  {
    from: 'push("/farmer/farmer/',
    to: 'push("/farmer/',
    description: "Farmer router.push",
  },
  {
    from: 'redirect("/farmer/farmer/',
    to: 'redirect("/farmer/',
    description: "Farmer redirect",
  },

  // Monitoring routes
  {
    from: "/monitoring/monitoring/",
    to: "/monitoring/",
    description: "Monitoring routes",
  },
  {
    from: "/(monitoring)/monitoring/",
    to: "/(monitoring)/",
    description: "Monitoring route group",
  },
  {
    from: 'href="/monitoring/monitoring/',
    to: 'href="/monitoring/',
    description: "Monitoring href links",
  },
  {
    from: 'to="/monitoring/monitoring/',
    to: 'to="/monitoring/',
    description: "Monitoring to links",
  },
  {
    from: 'pathname: "/monitoring/monitoring/',
    to: 'pathname: "/monitoring/',
    description: "Monitoring pathname",
  },
  {
    from: 'push("/monitoring/monitoring/',
    to: 'push("/monitoring/',
    description: "Monitoring router.push",
  },
  {
    from: 'redirect("/monitoring/monitoring/',
    to: 'redirect("/monitoring/',
    description: "Monitoring redirect",
  },

  // Import paths (if any)
  {
    from: "@/app/(admin)/admin/",
    to: "@/app/(admin)/",
    description: "Admin imports",
  },
  {
    from: "@/app/(farmer)/farmer/",
    to: "@/app/(farmer)/",
    description: "Farmer imports",
  },
  {
    from: "@/app/(monitoring)/monitoring/",
    to: "@/app/(monitoring)/",
    description: "Monitoring imports",
  },
];

// File extensions to process
const extensions = [".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".json"];

// Directories to search
const searchDirs = ["src", "tests", "docs", "__mocks__", ".github"];

interface Stats {
  filesScanned: number;
  filesModified: number;
  replacementsMade: number;
  replacementsByType: Record<string, number>;
}

const stats: Stats = {
  filesScanned: 0,
  filesModified: 0,
  replacementsMade: 0,
  replacementsByType: {},
};

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath: string): boolean {
  // Skip node_modules, .next, coverage, etc.
  if (
    filePath.includes("node_modules") ||
    filePath.includes(".next") ||
    filePath.includes("coverage") ||
    filePath.includes("dist") ||
    filePath.includes(".git")
  ) {
    return false;
  }

  const ext = path.extname(filePath);
  return extensions.includes(ext);
}

/**
 * Process a single file
 */
async function processFile(filePath: string): Promise<void> {
  try {
    stats.filesScanned++;

    let content = await fs.readFile(filePath, "utf-8");
    let modified = false;
    let fileReplacements = 0;

    // Apply each replacement
    for (const { from, to, description } of replacements) {
      const beforeLength = content.length;
      content = content.replaceAll(from, to);
      const afterLength = content.length;

      if (beforeLength !== afterLength) {
        const count =
          Math.abs(beforeLength - afterLength) / (from.length - to.length);
        modified = true;
        fileReplacements += count;
        stats.replacementsMade += count;

        // Track by type
        stats.replacementsByType[description] =
          (stats.replacementsByType[description] || 0) + count;
      }
    }

    // Write back if modified
    if (modified) {
      await fs.writeFile(filePath, content, "utf-8");
      stats.filesModified++;
      console.log(
        `✅ Fixed ${fileReplacements} references in: ${path.relative(rootDir, filePath)}`,
      );
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

/**
 * Recursively walk directory
 */
async function walkDirectory(dir: string): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(fullPath);
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error walking directory ${dir}:`, error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting route reference fix...\n");
  console.log("Replacements to make:");
  console.log("  - /admin/admin/ → /admin/");
  console.log("  - /farmer/farmer/ → /farmer/");
  console.log("  - /monitoring/monitoring/ → /monitoring/\n");

  const startTime = Date.now();

  // Process each search directory
  for (const dir of searchDirs) {
    const fullPath = path.join(rootDir, dir);
    try {
      await fs.access(fullPath);
      console.log(`📁 Processing directory: ${dir}`);
      await walkDirectory(fullPath);
    } catch {
      console.log(`⏭️  Skipping ${dir} (not found)`);
    }
  }

  // Process root-level markdown files
  console.log("\n📁 Processing root-level documentation files");
  const rootFiles = await fs.readdir(rootDir);
  for (const file of rootFiles) {
    if (file.endsWith(".md") || file.endsWith(".mdx")) {
      const fullPath = path.join(rootDir, file);
      await processFile(fullPath);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("✨ Route Reference Fix Complete!\n");
  console.log(`📊 Statistics:`);
  console.log(`   Files scanned:    ${stats.filesScanned}`);
  console.log(`   Files modified:   ${stats.filesModified}`);
  console.log(`   Total changes:    ${stats.replacementsMade}`);
  console.log(`   Duration:         ${duration}s\n`);

  if (Object.keys(stats.replacementsByType).length > 0) {
    console.log("📈 Replacements by type:");
    const sortedTypes = Object.entries(stats.replacementsByType).sort(
      ([, a], [, b]) => b - a,
    );

    for (const [type, count] of sortedTypes) {
      console.log(`   ${type.padEnd(30)} ${count}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Next steps:");
  console.log("   1. Run: npm run type-check");
  console.log("   2. Run: npm run lint");
  console.log("   3. Run: npm run test");
  console.log(
    '   4. Commit changes: git add -A && git commit -m "refactor: remove redundant route nesting"',
  );
  console.log("");
}

// Run the script
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
