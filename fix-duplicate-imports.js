const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Pattern: import { \n\nimport { logger ...
  // This happens when logger import is inserted in the middle of another import
  content = content.replace(
    /import\s*{\s*\n\s*import\s*{\s*logger\s*}\s*from\s*['"]@\/lib\/monitoring\/logger['"];\s*\n\s*/g,
    'import {\n  '
  );
  
  // Also fix cases where logger import appears standalone in middle of import block
  const lines = content.split('\n');
  const fixed = [];
  let inImportBlock = false;
  let loggerImportFound = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if we're starting an import block
    if (trimmed.startsWith('import {') && !trimmed.includes('}')) {
      inImportBlock = true;
    }
    
    // Check if this is a stray logger import in the middle of an import block
    if (inImportBlock && trimmed === "import { logger } from '@/lib/monitoring/logger';") {
      // Skip this line, add logger to imports at top later
      loggerImportFound = true;
      continue;
    }
    
    // Check if we're ending an import block
    if (inImportBlock && trimmed.includes('} from')) {
      inImportBlock = false;
    }
    
    fixed.push(line);
  }
  
  content = fixed.join('\n');
  
  // If we found a logger import in the middle, make sure there's one at the top
  if (loggerImportFound && !content.includes("import { logger } from '@/lib/monitoring/logger';")) {
    // Find the first import statement and add logger import before it
    const firstImportIndex = content.indexOf('import ');
    if (firstImportIndex !== -1) {
      content = content.substring(0, firstImportIndex) +
        "import { logger } from '@/lib/monitoring/logger';\n" +
        content.substring(firstImportIndex);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        count += walkDir(filePath);
      }
    } else if (/\.(ts|tsx)$/.test(file)) {
      if (fixFile(filePath)) count++;
    }
  }

  return count;
}

const srcDir = path.join(process.cwd(), 'src');
const count = walkDir(srcDir);
console.log(`\nFixed ${count} files`);
