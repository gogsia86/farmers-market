const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses logger
  const hasLoggerUsage = /\blogger\.(info|warn|error|debug)\(/.test(content);
  
  // Check if file imports logger
  const hasLoggerImport = /import.*logger.*from ['"]@\/lib\/monitoring\/logger['"]/.test(content);
  
  if (hasLoggerUsage && !hasLoggerImport) {
    return true;
  }
  
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  const missing = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        missing.push(...walkDir(filePath));
      }
    } else if (/\.(ts|tsx)$/.test(file)) {
      if (checkFile(filePath)) {
        missing.push(filePath);
      }
    }
  }

  return missing;
}

const srcDir = path.join(process.cwd(), 'src');
const missing = walkDir(srcDir);

if (missing.length > 0) {
  console.log('Files using logger but missing import:');
  missing.forEach(f => console.log(f));
} else {
  console.log('All files have proper logger imports!');
}
