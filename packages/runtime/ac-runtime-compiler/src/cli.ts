import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { ComponentCompiler } from './lib/component-compiler.js';

const commandOrPath = process.argv[2];
if (!commandOrPath) {
  console.error('Usage: ac-compiler <file-path> or ac-compiler build');
  process.exit(1);
}

if (commandOrPath === 'build') {
  runBuildCommand();
} else {
  runSingleFileCompile(commandOrPath);
}

function runSingleFileCompile(filePath: string) {
  const compiler = new ComponentCompiler();
  const source = fs.readFileSync(filePath, 'utf-8');
  const results = compiler.compile(source);

  for (const res of results) {
    const baseName = res.selector || 'output';
    const outPath = path.join(path.dirname(filePath), `${baseName}.compiled.js`);
    fs.writeFileSync(outPath, res.code);
    console.log(`Compiled ${baseName} to ${outPath}`);
  }
}

function runBuildCommand() {
  const projectRoot = process.cwd();
  const normalizePath = (p: string): string => p.replace(/\\/g, '/');
  const normalizedRoot = normalizePath(projectRoot);

  const pkgPath = path.join(projectRoot, 'package.json');
  let mainEntry = 'src/main.ts';
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.main && pkg.main.endsWith('.ts')) {
        mainEntry = pkg.main;
      }
    } catch (err) {
      console.error('[AC Compiler] Failed to parse package.json:', err);
    }
  }

  const entryFile = path.resolve(projectRoot, mainEntry);
  if (!fs.existsSync(entryFile)) {
    console.error(`[AC Compiler] Entry file not found: ${entryFile}`);
    process.exit(1);
  }

  const cacheDir = path.join(projectRoot, '.ac-runtime-cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
  fs.mkdirSync(cacheDir, { recursive: true });

  const compiler = new ComponentCompiler();
  const compiledFiles = new Set<string>();

  const getCachePath = (absolutePath: string): string => {
    const normalizedAbs = normalizePath(absolutePath);
    return path.join(projectRoot, '.ac-runtime-cache', path.relative(projectRoot, absolutePath));
  };

  const resolveTypescriptFile = (absolutePath: string): string => {
    if (fs.existsSync(absolutePath)) return absolutePath;
    if (fs.existsSync(absolutePath + '.ts')) return absolutePath + '.ts';
    const indexPath = path.join(absolutePath, 'index.ts');
    if (fs.existsSync(indexPath)) return indexPath;
    return absolutePath;
  };

  const resolveImport = (originalPath: string, importerPath: string): string => {
    let absolutePath = '';
    if (originalPath.startsWith('.')) {
      absolutePath = path.resolve(path.dirname(importerPath), originalPath);
    } else if (originalPath.startsWith('src/')) {
      absolutePath = path.resolve(projectRoot, originalPath);
    }

    if (!absolutePath) return originalPath;

    const resolvedPath = resolveTypescriptFile(absolutePath);
    const normalizedResolved = normalizePath(resolvedPath);

    if (normalizedResolved.endsWith('.ts') && normalizedResolved.startsWith(normalizedRoot) && fs.existsSync(resolvedPath)) {
      const targetCachePath = getCachePath(resolvedPath);
      const importerCachePath = getCachePath(importerPath);
      let relativePath = path.relative(path.dirname(importerCachePath), targetCachePath).replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      if (relativePath.endsWith('.ts')) {
        relativePath = relativePath.slice(0, -3);
      }
      return relativePath;
    }
    return originalPath;
  };

  const doTransform = (code: string, id: string): void => {
    const normalizedId = normalizePath(id);
    const normalizedCacheDir = normalizePath(cacheDir);

    if (normalizedId.includes(normalizedCacheDir)) return;
    if (!id.endsWith('.ts') || id.includes('node_modules')) return;

    try {
      const cachePath = getCachePath(id);
      const results = compiler.compile(code, id, resolveImport);

      if (results.length === 0) {
        // Non-component file, rewrite relative imports
        const rewritten = code
          .replace(/\bfrom\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, importPath) => {
            const resolved = resolveImport(importPath, id);
            return `from ${q}${resolved}${q}`;
          })
          .replace(/\bimport\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, importPath) => {
            const resolved = resolveImport(importPath, id);
            return `import ${q}${resolved}${q}`;
          });
        const dir = path.dirname(cachePath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(cachePath, rewritten);
        return;
      }

      let compiledCode = results[0].code;
      const sourceDir = path.dirname(id);
      compiledCode = compiledCode.replace(
        /import\s+['"](\.[^'"]*?\.(css|scss))['"]/g,
        (_match, importPath: string) => {
          const absoluteCssPath = path.resolve(sourceDir, importPath);
          const rootRelative = '/' + path.relative(projectRoot, absoluteCssPath).replace(/\\/g, '/');
          return `import '${rootRelative}'`;
        },
      );

      const dir = path.dirname(cachePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(cachePath, compiledCode);
    } catch (err) {
      console.error(`[AC Compiler] Error compiling ${id}:`, err);
    }
  };

  const compileRecursive = (id: string): void => {
    const normalizedId = normalizePath(id);
    if (compiledFiles.has(normalizedId)) return;
    compiledFiles.add(normalizedId);

    if (!fs.existsSync(id)) return;
    const code = fs.readFileSync(id, 'utf8');
    const currentDir = path.dirname(id);

    // Find standard imports and exports
    const importMatches = code.matchAll(/(?:import|export|from).*?['"](.+?)['"]/g);
    for (const match of importMatches) {
      const originalPath = match[1];
      let absolutePath = '';

      if (originalPath.startsWith('.')) {
        absolutePath = path.resolve(currentDir, originalPath);
      } else if (originalPath.startsWith('src/')) {
        absolutePath = path.resolve(projectRoot, originalPath);
      }

      if (absolutePath) {
        absolutePath = resolveTypescriptFile(absolutePath);
        const normalizedAbs = normalizePath(absolutePath);
        if (fs.existsSync(absolutePath) && normalizedAbs.endsWith('.ts') && normalizedAbs.startsWith(normalizedRoot)) {
          compileRecursive(absolutePath);
        }
      }
    }

    // Find import.meta.glob patterns
    const globMatches = code.matchAll(/import\.meta\.glob\(['"](.+?)['"]/g);
    for (const match of globMatches) {
      const pattern = match[1];
      if (!pattern.startsWith('.')) continue;

      const globRegex = new RegExp('^' + pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '(.+)')
        .replace(/\*/g, '([^/]+)') + '$');

      const baseDir = path.dirname(id);

      const findFiles = (dir: string): void => {
        let entries: fs.Dirent[];
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
          return;
        }

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = './' + path.relative(baseDir, fullPath).replace(/\\/g, '/');

          if (entry.isDirectory()) {
            findFiles(fullPath);
          } else if (globRegex.test(relPath)) {
            const normalizedFull = normalizePath(fullPath);
            if (normalizedFull.endsWith('.ts') && normalizedFull.startsWith(normalizedRoot)) {
              compileRecursive(fullPath);
            }
          }
        }
      };
      findFiles(baseDir);
    }

    doTransform(code, id);
  };

  console.log(`🚀 [AC Compiler] Starting recursive compilation from: ${mainEntry}`);
  compileRecursive(entryFile);
  console.log(`✅ [AC Compiler] Compilation complete. Processed ${compiledFiles.size} files in .ac-runtime-cache.`);

  // Write temporary tsconfig.build.json
  const tsconfigBuildPath = path.join(projectRoot, 'tsconfig.build.json');
  const tsconfigBuildContent = {
    extends: "./tsconfig.json",
    include: [
      "packages/**/*",
      "public/**/*",
      ".ac-runtime-cache/src/**/*"
    ],
    exclude: [
      "src",
      "node_modules",
      "dist"
    ]
  };

  fs.writeFileSync(tsconfigBuildPath, JSON.stringify(tsconfigBuildContent, null, 2));
  console.log(`Created temporary ${tsconfigBuildPath}`);

  try {
    console.log(`Running tsc -p tsconfig.build.json...`);
    child_process.execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });

    console.log(`Running vite build...`);
    child_process.execSync('npx vite build', { stdio: 'inherit' });
  } catch (err) {
    console.error(`Build failed:`, err);
    process.exit(1);
  } finally {
    if (fs.existsSync(tsconfigBuildPath)) {
      fs.unlinkSync(tsconfigBuildPath);
      console.log(`Cleaned up ${tsconfigBuildPath}`);
    }
  }
}
