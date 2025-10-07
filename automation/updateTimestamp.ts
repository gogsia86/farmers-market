import fs from 'fs/promises';
import path from 'path';

interface FilePattern {
  filePath: string;
  pattern: RegExp | string;
  replacer: (timestamp: string) => string;
}

export class TimestampUpdater {
  private patterns: FilePattern[] = [
    {
      filePath: 'DIVINE_TODO_MANIFEST.md',
      pattern: /Last Updated: \d{4}-\d{2}-\d{2}/,
      replacer: (timestamp) => `Last Updated: ${timestamp}`
    },
    {
      filePath: 'PROGRESS_TRACKER.md',
      pattern: /<!-- LAST_UPDATE_START -->\n.*\n<!-- LAST_UPDATE_END -->/,
      replacer: (timestamp) => `<!-- LAST_UPDATE_START -->\n${timestamp}\n<!-- LAST_UPDATE_END -->`
    }
  ];

  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async updateTimestamps(): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];

    for (const pattern of this.patterns) {
      const filePath = path.join(this.basePath, pattern.filePath);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const updatedContent = content.replace(
          pattern.pattern,
          pattern.replacer(timestamp)
        );
        await fs.writeFile(filePath, updatedContent, 'utf-8');
      } catch (error) {
        console.error(`Error updating timestamp in ${filePath}:`, error);
        throw error;
      }
    }
  }
}

// Add to Git pre-commit hook
if (require.main === module) {
  const updater = new TimestampUpdater(path.join(process.cwd(), 'automation'));
  updater.updateTimestamps().catch((error) => {
    console.error('Failed to update timestamps:', error);
    process.exit(1);
  });
}