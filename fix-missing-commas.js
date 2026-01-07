const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix logger calls where opening brace is missing
  // Pattern: logger.method("message"\n      identifier:
  content = content.replace(
    /(logger\.(error|warn|info|debug)\([^)]+["'`])\n(\s+)(\.\.\.[a-zA-Z]|[a-zA-Z_][a-zA-Z0-9_]*:)/g,
    (match, loggerCall, level, spaces, restOfLine) => {
      return `${loggerCall}, {\n${spaces}${restOfLine}`;
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
