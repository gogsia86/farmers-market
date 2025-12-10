const fs = require("fs");
const path = require("path");

const checkForIssues = () => {
  const srcPath = path.join(__dirname, "../src");
  const files = [];
  const filesByName = new Map();
  const filesByCaseInsensitiveName = new Map();

  console.log("🔍 Starting cleanup check...\n");

  // Walk through all files
  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip node_modules and other build directories
          if (
            !["node_modules", ".next", "dist", "build"].includes(entry.name)
          ) {
            walk(fullPath);
          }
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".tsx") ||
            entry.name.endsWith(".ts") ||
            entry.name.endsWith(".js") ||
            entry.name.endsWith(".jsx"))
        ) {
          files.push(fullPath);

          // Track by filename
          if (!filesByName.has(entry.name)) {
            filesByName.set(entry.name, []);
          }
          filesByName.get(entry.name).push(fullPath);

          // Track by case-insensitive name
          const lowerName = entry.name.toLowerCase();
          if (!filesByCaseInsensitiveName.has(lowerName)) {
            filesByCaseInsensitiveName.set(lowerName, []);
          }
          filesByCaseInsensitiveName.get(lowerName).push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  walk(srcPath);

  console.log(`📊 Scanned ${files.length} files\n`);

  // Check for common issues
  const issues = {
    duplicateNames: {},
    caseInsensitiveDuplicates: {},
    oldPatterns: [],
    potentialUnused: [],
    missingExports: [],
    largeFiles: [],
    emptyFiles: [],
    routeConflicts: [],
    improperClientComponents: [],
    missingUseClient: [],
  };

  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf8");
      const filename = path.basename(file);
      const relativePath = path.relative(srcPath, file);
      const stats = fs.statSync(file);
      const lines = content.split("\n").length;

      // Check for empty or nearly empty files
      if (content.trim().length < 10) {
        issues.emptyFiles.push({ file: relativePath, size: content.length });
      }

      // Check for very large files (> 500 lines)
      if (lines > 500) {
        issues.largeFiles.push({ file: relativePath, lines });
      }

      // Check for old/deprecated patterns
      const oldPatterns = [
        {
          pattern: "getInitialProps",
          reason: "Deprecated in Next.js 13+ App Router",
        },
        {
          pattern: "getServerSideProps",
          reason: "Use Server Components in App Router",
        },
        {
          pattern: "getStaticProps",
          reason: "Use Server Components in App Router",
        },
        {
          pattern: "getStaticPaths",
          reason: "Use generateStaticParams in App Router",
        },
        {
          pattern: "class.*extends.*Component",
          reason: "Consider using function components",
        },
        { pattern: "componentDidMount", reason: "Use useEffect hook instead" },
        {
          pattern: "componentWillMount",
          reason: "Deprecated React lifecycle method",
        },
        { pattern: "UNSAFE_", reason: "Unsafe React lifecycle methods" },
      ];

      oldPatterns.forEach(({ pattern, reason }) => {
        const regex = new RegExp(pattern);
        if (regex.test(content)) {
          issues.oldPatterns.push({ file: relativePath, pattern, reason });
        }
      });

      // Check for missing exports in component files
      if (filename.endsWith(".tsx") || filename.endsWith(".jsx")) {
        if (
          !content.includes("export") &&
          !content.includes("export default")
        ) {
          issues.missingExports.push(relativePath);
        }
      }

      // Check for improper use of 'use client' directive
      const hasUseClient =
        content.includes("'use client'") || content.includes('"use client"');
      const hasServerOnlyFeatures =
        content.includes("prisma") ||
        content.includes("process.env") ||
        content.includes("headers()") ||
        content.includes("cookies()");

      if (hasUseClient && hasServerOnlyFeatures) {
        issues.improperClientComponents.push({
          file: relativePath,
          reason: 'Has "use client" but uses server-only features',
        });
      }

      // Check if client component is missing 'use client' directive
      const hasClientFeatures =
        content.includes("useState") ||
        content.includes("useEffect") ||
        content.includes("onClick") ||
        content.includes("onChange") ||
        content.includes("onSubmit");

      const isInAppRouter = relativePath.includes("app/");
      const isComponent =
        !relativePath.includes("page.tsx") &&
        !relativePath.includes("layout.tsx") &&
        !relativePath.includes("route.ts") &&
        !relativePath.includes(".test.") &&
        !relativePath.includes("__tests__");

      if (hasClientFeatures && !hasUseClient && isInAppRouter && isComponent) {
        issues.missingUseClient.push({
          file: relativePath,
          reason: 'Uses client features but missing "use client" directive',
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  });

  // Check for duplicate filenames (exact match)
  filesByName.forEach((paths, filename) => {
    if (paths.length > 1) {
      issues.duplicateNames[filename] = paths.map((p) =>
        path.relative(srcPath, p),
      );
    }
  });

  // Check for case-insensitive duplicates
  filesByCaseInsensitiveName.forEach((paths, lowerName) => {
    if (paths.length > 1) {
      const uniqueNames = new Set(paths.map((p) => path.basename(p)));
      if (uniqueNames.size > 1) {
        issues.caseInsensitiveDuplicates[lowerName] = paths.map((p) =>
          path.relative(srcPath, p),
        );
      }
    }
  });

  // Check for route conflicts in app directory
  const appPath = path.join(srcPath, "app");
  if (fs.existsSync(appPath)) {
    const routeFiles = [];
    function findRoutes(dir, basePath = "") {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip route groups but track the path
          const newBasePath =
            entry.name.startsWith("(") && entry.name.endsWith(")")
              ? basePath
              : path.join(basePath, entry.name);
          findRoutes(fullPath, newBasePath);
        } else if (
          entry.name === "page.tsx" ||
          entry.name === "page.ts" ||
          entry.name === "page.jsx" ||
          entry.name === "page.js"
        ) {
          routeFiles.push({
            route: basePath || "/",
            file: path.relative(appPath, fullPath),
          });
        }
      }
    }
    findRoutes(appPath);

    // Check for duplicate routes
    const routeMap = new Map();
    routeFiles.forEach(({ route, file }) => {
      if (!routeMap.has(route)) {
        routeMap.set(route, []);
      }
      routeMap.get(route).push(file);
    });

    routeMap.forEach((files, route) => {
      if (files.length > 1) {
        issues.routeConflicts.push({ route, files });
      }
    });
  }

  return issues;
};

const formatIssues = (issues) => {
  let hasIssues = false;

  // Duplicate filenames
  if (Object.keys(issues.duplicateNames).length > 0) {
    hasIssues = true;
    console.log("⚠️  DUPLICATE FILENAMES FOUND:");
    Object.entries(issues.duplicateNames).forEach(([filename, paths]) => {
      console.log(`\n   ${filename}:`);
      paths.forEach((p) => console.log(`      - ${p}`));
    });
    console.log();
  }

  // Case-insensitive duplicates
  if (Object.keys(issues.caseInsensitiveDuplicates).length > 0) {
    hasIssues = true;
    console.log("⚠️  CASE-INSENSITIVE DUPLICATES FOUND:");
    Object.entries(issues.caseInsensitiveDuplicates).forEach(
      ([name, paths]) => {
        console.log(`\n   ${name}:`);
        paths.forEach((p) => console.log(`      - ${p}`));
      },
    );
    console.log();
  }

  // Old patterns
  if (issues.oldPatterns.length > 0) {
    hasIssues = true;
    console.log("⚠️  OLD/DEPRECATED PATTERNS FOUND:");
    issues.oldPatterns.forEach(({ file, pattern, reason }) => {
      console.log(`   📄 ${file}`);
      console.log(`      Pattern: ${pattern}`);
      console.log(`      Reason: ${reason}\n`);
    });
  }

  // Route conflicts
  if (issues.routeConflicts.length > 0) {
    hasIssues = true;
    console.log("⚠️  ROUTE CONFLICTS FOUND:");
    issues.routeConflicts.forEach(({ route, files }) => {
      console.log(`\n   Route: ${route}`);
      files.forEach((f) => console.log(`      - ${f}`));
    });
    console.log();
  }

  // Improper client components
  if (issues.improperClientComponents.length > 0) {
    hasIssues = true;
    console.log("⚠️  IMPROPER CLIENT COMPONENT USAGE:");
    issues.improperClientComponents.forEach(({ file, reason }) => {
      console.log(`   📄 ${file}`);
      console.log(`      ${reason}\n`);
    });
  }

  // Missing 'use client' directive
  if (issues.missingUseClient.length > 0) {
    hasIssues = true;
    console.log('⚠️  POSSIBLE MISSING "use client" DIRECTIVE:');
    issues.missingUseClient.slice(0, 10).forEach(({ file, reason }) => {
      console.log(`   📄 ${file}`);
      console.log(`      ${reason}\n`);
    });
    if (issues.missingUseClient.length > 10) {
      console.log(`   ... and ${issues.missingUseClient.length - 10} more\n`);
    }
  }

  // Large files
  if (issues.largeFiles.length > 0) {
    hasIssues = true;
    console.log("📏 LARGE FILES (>500 lines):");
    issues.largeFiles.slice(0, 10).forEach(({ file, lines }) => {
      console.log(`   📄 ${file} (${lines} lines)`);
    });
    if (issues.largeFiles.length > 10) {
      console.log(`   ... and ${issues.largeFiles.length - 10} more\n`);
    }
    console.log();
  }

  // Empty files
  if (issues.emptyFiles.length > 0) {
    hasIssues = true;
    console.log("📭 EMPTY OR NEARLY EMPTY FILES:");
    issues.emptyFiles.forEach(({ file, size }) => {
      console.log(`   📄 ${file} (${size} bytes)`);
    });
    console.log();
  }

  // Missing exports
  if (issues.missingExports.length > 0) {
    hasIssues = true;
    console.log("⚠️  FILES WITH NO EXPORTS:");
    issues.missingExports.slice(0, 10).forEach((file) => {
      console.log(`   📄 ${file}`);
    });
    if (issues.missingExports.length > 10) {
      console.log(`   ... and ${issues.missingExports.length - 10} more`);
    }
    console.log();
  }

  if (!hasIssues) {
    console.log("✅ No major issues found! Your codebase looks clean.\n");
  }

  // Summary
  console.log("📊 SUMMARY:");
  console.log(
    `   Total files scanned: ${issues.largeFiles.length + issues.emptyFiles.length + issues.missingExports.length + issues.oldPatterns.length}`,
  );
  console.log(
    `   Duplicate filenames: ${Object.keys(issues.duplicateNames).length}`,
  );
  console.log(
    `   Case-insensitive duplicates: ${Object.keys(issues.caseInsensitiveDuplicates).length}`,
  );
  console.log(`   Old patterns: ${issues.oldPatterns.length}`);
  console.log(`   Route conflicts: ${issues.routeConflicts.length}`);
  console.log(
    `   Improper client components: ${issues.improperClientComponents.length}`,
  );
  console.log(`   Missing 'use client': ${issues.missingUseClient.length}`);
  console.log(`   Large files (>500 lines): ${issues.largeFiles.length}`);
  console.log(`   Empty files: ${issues.emptyFiles.length}`);
  console.log(`   Missing exports: ${issues.missingExports.length}`);
  console.log();
};

// Run the checks
try {
  const issues = checkForIssues();
  formatIssues(issues);

  // Save detailed report
  const reportPath = path.join(__dirname, "../cleanup-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
  console.log("📝 Detailed report saved to: cleanup-report.json\n");

  // Exit with appropriate code
  const hasIssues =
    Object.keys(issues.duplicateNames).length > 0 ||
    Object.keys(issues.caseInsensitiveDuplicates).length > 0 ||
    issues.routeConflicts.length > 0 ||
    issues.improperClientComponents.length > 0;

  process.exit(hasIssues ? 1 : 0);
} catch (error) {
  console.error("❌ Error running cleanup check:", error);
  process.exit(1);
}
