const fs = require('fs');
const path = require('path');

let filesFixed = 0;
let issuesFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let changed = false;

  // Skip files that define their own logger
  if (filePath.includes('lib/logger/index.ts') || 
      filePath.includes('monitoring/agricultural-logger.ts') ||
      filePath.includes('monitoring/logger.ts')) {
    return false;
  }

  // 1. Fix duplicate imports in the middle of type imports
  const lines = content.split('\n');
  const fixed = [];
  let skipNext = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    
    // Check for logger import in middle of type import
    if (lines[i].trim() === "import { logger } from '@/lib/monitoring/logger';" &&
        i > 0 && (lines[i-1].trim() === '' || lines[i-1].includes('import type'))) {
      if (i < lines.length - 1 && (lines[i+1].trim().match(/^[A-Z]/) || lines[i+1].trim() === '}')) {
        // This is in the middle of a type import, skip it
        changed = true;
        issuesFixed++;
        continue;
      }
    }
    
    fixed.push(lines[i]);
  }
  
  content = fixed.join('\n');

  // 2. Ensure logger import exists at top if logger is used
  if (/\blogger\.(info|warn|error|debug)\(/.test(content) && 
      !/import.*logger.*from ['"]@\/lib\/monitoring\/logger['"]/.test(content)) {
    const firstImport = content.indexOf('import ');
    if (firstImport !== -1) {
      content = content.substring(0, firstImport) +
        "import { logger } from '@/lib/monitoring/logger';\n" +
        content.substring(firstImport);
      changed = true;
      issuesFixed++;
    }
  }

  // 3. Fix multi-line logger calls with incomplete objects
  content = content.replace(
    /logger\.(info|warn|error|debug)\(\s*("[^"]+"),\s*{\s*$/gm,
    (match, level, message) => {
      changed = true;
      issuesFixed++;
      return `logger.${level}(${message}`;
    }
  );

  // 4. Fix logger calls with variables that need wrapping
  content = content.replace(
    /logger\.(error|warn)\(\s*(`[^`]+`|"[^"]+")\s*,\s*\n\s*(error|err|e)\s*,?\s*\n\s*\);/g,
    (match, level, message, errorVar) => {
      changed = true;
      issuesFixed++;
      return `logger.${level}(${message}, {\n      error: ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar})\n    });`;
    }
  );

  // 5. Fix single-line logger calls with bare error
  content = content.replace(
    /logger\.(error|warn)\(([^,]+),\s*(error|err|e)\s*\);/g,
    (match, level, message, errorVar) => {
      if (message.includes('{')) return match; // Already has object
      changed = true;
      issuesFixed++;
      return `logger.${level}(${message}, { error: ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar}) });`;
    }
  );

  // 6. Fix logger.debug/info with non-object second param
  content = content.replace(
    /logger\.(debug|info)\(("[^"]+"|`[^`]+`),\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*\);/g,
    (match, level, message, varName) => {
      if (varName === 'undefined' || varName === 'null') return match;
      const key = varName.split('.').pop();
      changed = true;
      issuesFixed++;
      return `logger.${level}(${message}, { ${key}: ${varName} });`;
    }
  );

  // 7. Remove duplicate logger imports (exact duplicates)
  const importMatches = content.match(/import { logger } from '@\/lib\/monitoring\/logger';/g);
  if (importMatches && importMatches.length > 1) {
    let first = true;
    content = content.replace(
      /import { logger } from '@\/lib\/monitoring\/logger';/g,
      () => {
        if (first) {
          first = false;
          return "import { logger } from '@/lib/monitoring/logger';";
        }
        changed = true;
        issuesFixed++;
        return '';
      }
    );
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    return true;
  }
  
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      }
    } else if (/\.(ts|tsx)$/.test(file)) {
      fixFile(filePath);
    }
  }
}

console.log('🔧 Comprehensive logger fix started...\n');
const srcDir = path.join(process.cwd(), 'src');
walkDir(srcDir);
console.log(`\n✅ Fixed ${issuesFixed} issues in ${filesFixed} files`);
