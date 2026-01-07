const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses logger
  const hasLoggerUsage = /\blogger\.(info|warn|error|debug)\(/.test(content);
  
  // Check if file imports logger
  const hasLoggerImport = /import.*logger.*from ['"]@\/lib\/monitoring\/logger['"]/.test(content);
  
  if (hasLoggerUsage && !hasLoggerImport) {
    // Skip if this IS the logger file itself
    if (filePath.endsWith('monitoring/logger.ts') || filePath.endsWith('logger/__tests__/logger.test.ts')) {
      return false;
    }
    
    // Find first import statement
    const firstImportIndex = content.indexOf('import ');
    
    if (firstImportIndex !== -1) {
      // Add logger import at the top
      content = content.substring(0, firstImportIndex) +
        "import { logger } from '@/lib/monitoring/logger';\n" +
        content.substring(firstImportIndex);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
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
