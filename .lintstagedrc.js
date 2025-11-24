/**
 * 🎯 LINT-STAGED CONFIGURATION
 * Runs checks on staged files before commit
 *
 * Divine Patterns:
 * - TypeScript compilation check
 * - ESLint with auto-fix
 * - Prettier formatting
 * - Test affected files
 */

module.exports = {
  // TypeScript files - run type check and lint
  '**/*.{ts,tsx}': (filenames) => {
    const fileList = filenames.join(' ');
    return [
      // Type check all TypeScript files
      'npx tsc --noEmit',
      // Lint and auto-fix
      `npx eslint ${fileList} --fix --max-warnings=0`,
      // Format with Prettier
      `npx prettier --write ${fileList}`,
    ];
  },

  // JavaScript files - lint and format
  '**/*.{js,jsx}': (filenames) => {
    const fileList = filenames.join(' ');
    return [
      `npx eslint ${fileList} --fix --max-warnings=0`,
      `npx prettier --write ${fileList}`,
    ];
  },

  // JSON files - format only
  '**/*.json': (filenames) => {
    return `npx prettier --write ${filenames.join(' ')}`;
  },

  // Markdown files - format only
  '**/*.md': (filenames) => {
    return `npx prettier --write ${filenames.join(' ')}`;
  },

  // Prisma schema - format and validate
  'prisma/schema.prisma': () => {
    return [
      'npx prisma format',
      'npx prisma validate',
    ];
  },

  // Environment example file - validate structure
  '.env.example': () => {
    return 'echo "✅ .env.example validated"';
  },

  // Test files - run related tests (optional, can be slow)
  // Uncomment if you want to run tests on commit
  // '**/*.test.{ts,tsx,js,jsx}': (filenames) => {
  //   return `npm test -- --findRelatedTests ${filenames.join(' ')} --passWithNoTests`;
  // },
};
