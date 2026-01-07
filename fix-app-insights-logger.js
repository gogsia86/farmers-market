const fs = require('fs');

const filePath = 'src/lib/monitoring/app-insights.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Pattern: logger.debug("message:", variableName); -> logger.debug("message", { key: variableName });
// Find all multi-line logger.debug calls with a second parameter that's just a variable
content = content.replace(
  /logger\.debug\(\s*"([^"]+):",\s*([a-zA-Z_][a-zA-Z0-9_.]*),?\s*\);/g,
  (match, message, varName) => {
    const key = varName.split('.').pop();
    return `logger.debug("${message}", { ${key}: ${varName} });`;
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed app-insights.ts');
