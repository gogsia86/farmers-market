/**
 * 🌾 Add Visual Testing Scripts to package.json 🌾
 * Divine Agricultural Script Management
 *
 * This script adds visual regression testing commands to package.json
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Visual testing scripts to add
const visualTestScripts = {
  // Visual regression tests
  'test:visual': 'playwright test tests/visual --workers=6',
  'test:visual:ui': 'playwright test tests/visual --ui',
  'test:visual:headed': 'playwright test tests/visual --headed --workers=4',
  'test:visual:debug': 'playwright test tests/visual --debug',
  'test:visual:update': 'cross-env UPDATE_BASELINES=true playwright test tests/visual',
  'test:visual:chromium': 'playwright test tests/visual --project=chromium',
  'test:visual:firefox': 'playwright test tests/visual --project=firefox',
  'test:visual:webkit': 'playwright test tests/visual --project=webkit',
  'test:visual:mobile': 'playwright test tests/visual --project="Mobile Chrome" --project="Mobile Safari"',
  'test:visual:dark': 'cross-env THEME=dark playwright test tests/visual',

  // Baseline management
  'baseline:list': 'tsx tests/visual/baseline-manager.ts list',
  'baseline:update-all': 'tsx tests/visual/baseline-manager.ts update-all',
  'baseline:validate': 'tsx tests/visual/baseline-manager.ts validate',
  'baseline:archive': 'tsx tests/visual/baseline-manager.ts archive',
  'baseline:approve': 'tsx tests/visual/baseline-manager.ts approve',
  'baseline:reject': 'tsx tests/visual/baseline-manager.ts reject',

  // Visual testing reports
  'visual:report': 'playwright show-report',
  'visual:report:open': 'start playwright-report/index.html',

  // CI/CD visual testing
  'test:visual:ci': 'cross-env CI=true playwright test tests/visual --workers=4 --reporter=json',
};

// Add scripts if they don't exist
let scriptsAdded = 0;
let scriptsSkipped = 0;

for (const [scriptName, scriptCommand] of Object.entries(visualTestScripts)) {
  if (!packageJson.scripts[scriptName]) {
    packageJson.scripts[scriptName] = scriptCommand;
    scriptsAdded++;
    console.log(`✅ Added: ${scriptName}`);
  } else {
    scriptsSkipped++;
    console.log(`⏭️  Skipped (exists): ${scriptName}`);
  }
}

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`
╔════════════════════════════════════════════════════════════╗
║ 🌾 VISUAL TESTING SCRIPTS UPDATED                         ║
╠════════════════════════════════════════════════════════════╣
║ Scripts Added: ${scriptsAdded}
║ Scripts Skipped: ${scriptsSkipped}
║ Total Visual Scripts: ${scriptsAdded + scriptsSkipped}
║
║ 🎯 Available Commands:
║   npm run test:visual              Run all visual tests
║   npm run test:visual:update       Update baselines
║   npm run baseline:list            List all baselines
║   npm run baseline:validate        Validate baselines
║   npm run visual:report            View test report
╚════════════════════════════════════════════════════════════╝
`);
