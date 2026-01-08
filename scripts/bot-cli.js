#!/usr/bin/env node

/**
 * 🤖 Bot CLI Executable
 *
 * Simple wrapper to run the TypeScript CLI with tsx
 */

const { spawn } = require('child_process');
const path = require('path');

// Path to the CLI TypeScript file
const cliPath = path.join(__dirname, '..', 'src', 'lib', 'testing', 'cli', 'index.ts');

// Get command line arguments (skip node and script name)
const args = process.argv.slice(2);

// Run with tsx
const child = spawn('npx', ['tsx', cliPath, ...args], {
  stdio: 'inherit',
  shell: true
});

// Forward exit code
child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
child.on('error', (error) => {
  console.error('Failed to start bot CLI:', error);
  process.exit(1);
});
