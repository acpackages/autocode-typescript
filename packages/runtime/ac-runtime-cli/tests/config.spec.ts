import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig } from '../src/config';

describe('loadConfig - watchDirectories', () => {
  let tempDir: string;
  let exitSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ac-runtime-test-'));
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number | string | null) => {
      throw new Error(`process.exit: ${code}`);
    }) as any);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  const writeConfig = (configObj: any) => {
    fs.writeFileSync(path.join(tempDir, 'ac-runtime.json'), JSON.stringify(configObj, null, 2));
    // Create entryFile
    const entryPath = path.join(tempDir, configObj.entryFile || 'src/main.ts');
    fs.mkdirSync(path.dirname(entryPath), { recursive: true });
    fs.writeFileSync(entryPath, '// entry');
  };

  it('defaults watchDirectories to empty array when not specified', () => {
    writeConfig({
      name: 'test-app',
      version: '1.0.0',
      type: 'app',
      entryFile: 'src/main.ts',
    });

    const config = loadConfig(tempDir);
    expect(config.watchDirectories).toEqual([]);
  });

  it('correctly resolves relative watchDirectories to absolute paths', () => {
    const watchSub1 = path.join(tempDir, 'extra-components');
    const watchSub2 = path.join(tempDir, 'shared-ui');
    fs.mkdirSync(watchSub1);
    fs.mkdirSync(watchSub2);

    writeConfig({
      name: 'test-app',
      version: '1.0.0',
      type: 'app',
      entryFile: 'src/main.ts',
      watchDirectories: ['./extra-components', 'shared-ui'],
    });

    const config = loadConfig(tempDir);
    expect(config.watchDirectories).toEqual([
      path.resolve(tempDir, 'extra-components'),
      path.resolve(tempDir, 'shared-ui'),
    ]);
  });

  it('supports watchDirs as alias and deduplicates paths', () => {
    const watchSub = path.join(tempDir, 'common');
    fs.mkdirSync(watchSub);

    writeConfig({
      name: 'test-app',
      version: '1.0.0',
      type: 'app',
      entryFile: 'src/main.ts',
      watchDirs: ['common', './common', '.'],
    });

    const config = loadConfig(tempDir);
    // Duplicate 'common' is deduplicated, and '.' (projectRoot) is excluded
    expect(config.watchDirectories).toEqual([
      path.resolve(tempDir, 'common'),
    ]);
  });

  it('exits with error when watchDirectories is not an array', () => {
    writeConfig({
      name: 'test-app',
      version: '1.0.0',
      type: 'app',
      entryFile: 'src/main.ts',
      watchDirectories: 'invalid-string',
    });

    expect(() => loadConfig(tempDir)).toThrow('process.exit: 1');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"watchDirectories" must be an array of directory paths')
    );
  });

  it('exits with error when a watch directory does not exist', () => {
    writeConfig({
      name: 'test-app',
      version: '1.0.0',
      type: 'app',
      entryFile: 'src/main.ts',
      watchDirectories: ['non-existent-directory'],
    });

    expect(() => loadConfig(tempDir)).toThrow('process.exit: 1');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('watch directory does not exist')
    );
  });

  it('exits with error when a watch path is a file instead of a directory', () => {
    const filePath = path.join(tempDir, 'some-file.txt');
    fs.writeFileSync(filePath, 'hello');

    writeConfig({
      name: 'test-app',
      version: '1.0.0',
      type: 'app',
      entryFile: 'src/main.ts',
      watchDirectories: ['some-file.txt'],
    });

    expect(() => loadConfig(tempDir)).toThrow('process.exit: 1');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('watch path is not a directory')
    );
  });
});
