import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import { TimestampUpdater } from './updateTimestamp';
import path from 'path';

jest.mock('fs/promises');

describe('TimestampUpdater', () => {
  const mockBasePath = '/test/path';
  let updater: TimestampUpdater;

  const mockFileContents: Record<string, string> = {
    'DIVINE_TODO_MANIFEST.md': 'Last Updated: 2025-10-05\nOther content',
    'PROGRESS_TRACKER.md': '<!-- LAST_UPDATE_START -->\n2025-10-05\n<!-- LAST_UPDATE_END -->\nOther content'
  };

  beforeEach(() => {
    jest.resetAllMocks();
    updater = new TimestampUpdater(mockBasePath);

    const mockReadFile = jest.spyOn(fs, 'readFile').mockImplementation(async (filePath, options) => {
      const fileName = path.basename(filePath.toString());
      const content = mockFileContents[fileName] ?? '';
      return (options && options.toString() === 'utf-8') ? content : Buffer.from(content);
    });

    const mockWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-07'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('updates timestamps in all configured files', async () => {
    await updater.updateTimestamps();

    expect(fs.writeFile).toHaveBeenCalledTimes(2);

    // Check DIVINE_TODO_MANIFEST.md update
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(mockBasePath, 'DIVINE_TODO_MANIFEST.md'),
      expect.stringContaining('Last Updated: 2025-10-07'),
      'utf-8'
    );

    // Check PROGRESS_TRACKER.md update
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(mockBasePath, 'PROGRESS_TRACKER.md'),
      expect.stringContaining('<!-- LAST_UPDATE_START -->\n2025-10-07\n<!-- LAST_UPDATE_END -->'),
      'utf-8'
    );
  });

  test('throws error when file read fails', async () => {
    jest.spyOn(fs, 'readFile').mockRejectedValueOnce(new Error('File read error'));

    await expect(updater.updateTimestamps()).rejects.toThrow('File read error');
  });

  test('throws error when file write fails', async () => {
    jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('File write error'));

    await expect(updater.updateTimestamps()).rejects.toThrow('File write error');
  });

  test('preserves other content in files', async () => {
    await updater.updateTimestamps();

    // Check DIVINE_TODO_MANIFEST.md content preservation
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(mockBasePath, 'DIVINE_TODO_MANIFEST.md'),
      expect.stringContaining('Other content'),
      'utf-8'
    );

    // Check PROGRESS_TRACKER.md content preservation
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(mockBasePath, 'PROGRESS_TRACKER.md'),
      expect.stringContaining('Other content'),
      'utf-8'
    );
  });
});