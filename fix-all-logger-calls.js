const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix logger.info("message:", variable)
  content = content.replace(
    /logger\.info\("([^"]+):",\s*([^)]+)\);/g,
    (match, message, variable) => {
      const varName = variable.trim().split('.').pop().replace(/[^a-zA-Z0-9_]/g, '');
      return `logger.info("${message}", { ${varName}: ${variable} });`;
    }
  );
  
  // Fix logger.info("message", variable) where variable is not an object
  content = content.replace(
    /logger\.info\("([^"]+)",\s*([a-zA-Z_][a-zA-Z0-9_.]*)\);/g,
    (match, message, variable) => {
      if (variable.includes('{')) return match;
      const varName = variable.split('.').pop();
      return `logger.info("${message}", { ${varName}: ${variable} });`;
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
