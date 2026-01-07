const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix pattern: logger.*(...)`, { data:   });
  content = content.replace(
    /(logger\.(info|warn|error|debug)\([^)]+\),\s*{\s*data:\s*}\);/g,
    (match) => {
      // Remove the empty context object
      return match.replace(', { data:   }', '').replace(', { data: }', '');
    }
  );
  
  // Fix pattern with just `);` after incomplete context
  content = content.replace(
    /(logger\.(info|warn|error|debug)\([^)]+\),\s*{\s*data:\s+}\);/g,
    (match) => match.replace(/,\s*{\s*data:\s+}\)/, ')')
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
