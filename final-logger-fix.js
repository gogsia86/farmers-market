const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Remove logger import from files that use createLogger
  if (content.includes('createLogger(')) {
    content = content.replace(/import { logger } from '@\/lib\/monitoring\/logger';\n/g, '');
    content = content.replace(/import { logger } from "@\/lib\/monitoring\/logger";\n/g, '');
  }

  // 2. Fix missing commas in logger calls
  // Pattern: logger.error("message"\n      error:
  content = content.replace(
    /(logger\.(error|warn|info|debug)\([^)]+)\n(\s+)(error|[a-z]+):/g,
    (match, loggerCall, level, spaces, key) => {
      if (loggerCall.endsWith('"') || loggerCall.endsWith('`') || loggerCall.endsWith("'")) {
        return `${loggerCall}, {\n${spaces}${key}:`;
      }
      return match;
    }
  );

  // 3. Fix logger.error("message" error: ...) -> logger.error("message", { error: ... })
  content = content.replace(
    /(logger\.(error|warn|info|debug)\([^)]+["'`])\s+(error|[a-z]+):\s*/g,
    (match, loggerCall, level, key) => {
      return `${loggerCall}, { ${key}: `;
    }
  );

  if (content !== original) {
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
