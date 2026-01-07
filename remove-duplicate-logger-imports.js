const fs = require('fs');

const files = [
  'src/lib/services/farm.service.ts',
  'src/app/api/farms/route.ts',
  'src/app/api/metrics/route.ts',
  'src/lib/monitoring/logger.ts'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has both logger import AND createLogger import OR const logger = createLogger
  const hasLoggerImport = content.includes("import { logger } from '@/lib/monitoring/logger';");
  const hasCreateLogger = content.includes('createLogger') || content.includes('const logger =');
  
  if (hasLoggerImport && hasCreateLogger) {
    // Remove the logger import line (keep createLogger if it has it)
    content = content.replace(/import { logger } from '@\/lib\/monitoring\/logger';\n/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
});
