const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix logger.error("message", error) -> logger.error("message", { error: ... })
  content = content.replace(
    /(logger\.(error|warn))\(\s*("[^"]+"),\s*(error|err|e),?\s*\);/g,
    (match, loggerMethod, level, message, errorVar) => {
      return `${loggerMethod}(${message}, {\n        error: ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar})\n      });`;
    }
  );
  
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
