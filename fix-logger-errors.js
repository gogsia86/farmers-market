const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: logger.error("message:", error)
  content = content.replace(
    /logger\.error\(([^,]+),\s*(\w+)\);/g,
    (match, message, errorVar) => {
      modified = true;
      return `logger.error(${message}, {\n        error: ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar})\n      });`;
    }
  );

  // Pattern 2: logger.info("message:", something)
  content = content.replace(
    /logger\.info\(([^,)]+),\s*([^)]+)\);/g,
    (match, message, data) => {
      // Skip if already has object syntax
      if (data.trim().startsWith('{')) return match;
      modified = true;
      const varName = data.trim().replace(/[^a-zA-Z0-9_]/g, '');
      return `logger.info(${message}, { data: ${data} });`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir, filePattern = /\.(ts|tsx)$/) {
  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        count += walkDir(filePath, filePattern);
      }
    } else if (filePattern.test(file)) {
      if (fixFile(filePath)) count++;
    }
  }

  return count;
}

const srcDir = path.join(process.cwd(), 'src');
const count = walkDir(srcDir);
console.log(`\nFixed ${count} files`);
