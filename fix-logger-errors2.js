const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}', { ignore: '**/node_modules/**' });

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Pattern for any variable name
  content = content.replace(
    /logger\.(error|warn)\(([^,]+),\s*(\w+)\s*\)/g,
    (match, method, message, errorVar) => {
      // Skip if already in correct format (contains 'instanceof')
      if (message.includes('instanceof')) return match;
      
      return `logger.${method}(${message}, {
      ${errorVar}: ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar}),
    })`;
    }
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(file, 'utf8');
    console.log(`Fixed: ${file}`);
    totalFixed++;
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
