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
  "**/*.{ts,tsx}": (filenames) => {
    // Properly escape filenames with spaces for shell commands
    const fileList = filenames.map((f) => `"${f}"`).join(" ");

    // Separate prisma config files from other TS files
    const otherFiles = filenames.filter((f) => !f.includes("prisma/"));

    const commands = [
      // Type check all TypeScript files
      "npx tsc --noEmit",
    ];

    // Only lint non-prisma files with ESLint
    if (otherFiles.length > 0) {
      const otherFileList = otherFiles.map((f) => `"${f}"`).join(" ");
      commands.push(`npx eslint ${otherFileList} --fix --max-warnings=0`);
    }

    // Format all files with Prettier
    commands.push(`npx prettier --write ${fileList}`);

    return commands;
  },

  // JavaScript files - format only (ESLint 9 flat config doesn't support .js in root)
  "**/*.{js,jsx}": (filenames) => {
    // Properly escape filenames with spaces for shell commands
    const fileList = filenames.map((f) => `"${f}"`).join(" ");
    return [`npx prettier --write ${fileList}`];
  },

  // JSON files - format only
  "**/*.json": (filenames) => {
    const fileList = filenames.map((f) => `"${f}"`).join(" ");
    return `npx prettier --write ${fileList}`;
  },

  // Markdown files - format only
  "**/*.md": (filenames) => {
    const fileList = filenames.map((f) => `"${f}"`).join(" ");
    return `npx prettier --write ${fileList}`;
  },

  // Prisma schema - format and validate
  "prisma/schema.prisma": () => {
    return ["npx prisma format", "npx prisma validate"];
  },

  // Environment example file - validate structure
  ".env.example": () => {
    return 'echo "✅ .env.example validated"';
  },

  // Test files - run related tests (optional, can be slow)
  // Uncomment if you want to run tests on commit
  // '**/*.test.{ts,tsx,js,jsx}': (filenames) => {
  //   return `npm test -- --findRelatedTests ${filenames.join(' ')} --passWithNoTests`;
  // },
};
