/**
 * @module vite-plugin
 *
 * Vite plugin that integrates the AC Runtime compiler into the
 * dev server and production build pipeline.
 *
 * **What it does:**
 * 1. On `buildStart`, recursively discovers all `.ts` files reachable
 *    from `src/main.ts` (following imports and `import.meta.glob`).
 * 2. Compiles each file via {@link ComponentCompiler}, writing output
 *    to `.ac-runtime-cache/`.
 * 3. Rewrites import paths so Vite serves compiled cache files.
 * 4. On dev server, watches for `.ts` changes and triggers full reload.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { acRuntimePlugin } from 'ac-runtime-dev';
 * export default defineConfig({ plugins: [acRuntimePlugin()] });
 * ```
 */
import { Plugin, ResolvedConfig } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { ComponentCompiler } from '../../ac-runtime-compiler/src/index';
import * as ts from 'typescript';

const TS_COMPILER_OPTIONS: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    removeComments: true,
    alwaysStrict: true,
    sourceMap: true,
    inlineSourceMap: true,
    inlineSources: true,
};


/**
 * Application config derived from `package.json`.
 * Determines the entry point for recursive compilation.
 */
interface AppConfig {
    /** Application name from `package.json`. */
    name: string;
    /** Application version from `package.json`. */
    version: string;
    /** Always `'application'` — reserved for future workspace types. */
    type: 'application';
    /** Relative path to the entry file (e.g., `'src/main.ts'`). */
    main: string;
}

/**
 * Creates the AC Runtime Vite plugin.
 *
 * Maintains a shared {@link ComponentCompiler}, a cache directory,
 * and a visited-files set to avoid redundant compilation.
 *
 * @returns A Vite plugin with `configResolved`, `buildStart`,
 *          `transform`, `transformIndexHtml`, and `configureServer` hooks.
 */
export function acRuntimePlugin(options?: { output?: 'ts' | 'js' }): Plugin {
    // Resolve output format (default is 'ts')
    let outputFormat: 'ts' | 'js' = 'ts';
    
    // 1. Check options argument
    if (options?.output === 'ts' || options?.output === 'js') {
        outputFormat = options.output;
    } else {
        // 2. Check process.env.OUTPUT or process.env.output
        const envVal = process.env.OUTPUT || process.env.output;
        if (envVal === 'ts' || envVal === 'js') {
            outputFormat = envVal as 'ts' | 'js';
        } else {
            // 3. Check process.argv for output=ts or --output=ts, etc.
            for (const arg of process.argv) {
                const match = arg.match(/^(?:--)?output=(ts|js)$/i);
                if (match) {
                    outputFormat = match[1].toLowerCase() as 'ts' | 'js';
                    break;
                }
            }
        }
    }

    /** Resolved Vite config (available after `configResolved`). */
    let config: ResolvedConfig;
    /** Shared compiler instance — reused across all compilations. */
    const compiler = new ComponentCompiler();
    /** Absolute path to the project root. */
    let projectRoot = '';
    /** Forward-slash-normalized root — cached at config time for O(1) reuse. */
    let normalizedRoot = '';
    /** Parsed app config from `package.json`. */
    let appConfig: AppConfig | null = null;
    /** Tracks visited files to prevent infinite recursion on circular imports. */
    const compiledFiles = new Set<string>();

    /**
     * Normalize OS path separators to forward slashes.
     * Required for consistent path comparison on Windows.
     */
    const normalizePath = (p: string): string => p.replace(/\\/g, '/');

    /**
     * Map a source file to its corresponding cache path.
     * Files within the project root mirror the directory structure.
     * Files outside (shared packages) go under `.ac-runtime-cache/up/`.
     */
    const getCachePath = (absolutePath: string): string => {
        const normalizedAbs = normalizePath(absolutePath);
        let targetPath = absolutePath;
        if (outputFormat === 'js' && targetPath.endsWith('.ts')) {
            targetPath = targetPath.slice(0, -3) + '.js';
        }

        if (normalizedAbs.startsWith(normalizedRoot)) {
            return path.join(projectRoot, '.ac-runtime-cache', path.relative(projectRoot, targetPath));
        }
        
        // Handle files outside project root (e.g. workspace packages)
        // Map them to .ac-runtime-cache/packages/... for consistency
        if (normalizedAbs.includes('/packages/')) {
            const parts = normalizePath(targetPath).split('/packages/');
            return path.join(projectRoot, '.ac-runtime-cache', 'packages', parts[parts.length - 1]);
        }
        
        const safePath = normalizePath(targetPath).replace(/[:\/]/g, '_');
        return path.join(projectRoot, '.ac-runtime-cache', 'ext', safePath);
    };

    /**
     * Resolve a TypeScript import path by trying:
     * 1. Exact path, 2. `.ts` extension, 3. `index.ts` in directory.
     */
    const resolveTypescriptFile = (absolutePath: string): string => {
        if (fs.existsSync(absolutePath)) return absolutePath;
        if (fs.existsSync(absolutePath + '.ts')) return absolutePath + '.ts';
        const indexPath = path.join(absolutePath, 'index.ts');
        if (fs.existsSync(indexPath)) return indexPath;
        return absolutePath;
    };

    /**
     * Custom import resolver passed to the compiler.
     * Rewrites relative/`src/` import paths to point to the cache directory
     * so Vite serves compiled output instead of raw source.
     */
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

        // Include project-local files and external workspace packages
        const isInternal = normalizedResolved.startsWith(normalizedRoot);
        const isPackage = normalizedResolved.includes('/packages/');

        if (normalizedResolved.endsWith('.ts') && (isInternal || isPackage) && fs.existsSync(resolvedPath)) {
            const targetCachePath = getCachePath(resolvedPath);
            const importerCachePath = getCachePath(importerPath);
            let relativePath = path.relative(path.dirname(importerCachePath), targetCachePath).replace(/\\/g, '/');
            if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
            }
            return relativePath;
        }

        return originalPath;
    };

    /**
     * Compile a single file and optionally write output to the cache.
     * Returns compiled code only for AC component files; non-component
     * files return `null` (left for Vite's esbuild to handle).
     */
    const doTransform = async (code: string, id: string, isForCache = false): Promise<string | null> => {
        const normalizedId = normalizePath(id);
        const normalizedCacheDir = normalizePath(path.join(projectRoot, '.ac-runtime-cache'));

        // If it's already in the cache, skip transformation to avoid loops
        if (normalizedId.includes(normalizedCacheDir)) return null;

        if (!id.endsWith('.ts') || id.includes('node_modules')) return null;

        try {
            const cachePath = getCachePath(id);

            const results = compiler.compile(code, id, resolveImport);

            if (results.length === 0) {
                // Non-component file (constants, types, barrel re-exports, etc.).
                // Still write to cache with rewritten relative imports so that
                // component files that import from this file can find it in the cache.
                if (isForCache) {
                    const rewritten = code
                        .replace(/\bfrom\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, importPath) => {
                            const resolved = resolveImport(importPath, id);
                            return `from ${q}${resolved}${q}`;
                        })
                        .replace(/\bimport\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, importPath) => {
                            const resolved = resolveImport(importPath, id);
                            return `import ${q}${resolved}${q}`;
                        });
                    const finalCode = outputFormat === 'js'
                        ? ts.transpileModule(rewritten, { compilerOptions: TS_COMPILER_OPTIONS }).outputText
                        : rewritten;
                    const dir = path.dirname(cachePath);
                    fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(cachePath, finalCode);
                }
                return null;
            }

            let compiledCode = results[0].code;

            // Rewrite CSS/SCSS import paths to root-relative (so Vite can find them from cache)
            const sourceDir = path.dirname(id);
            compiledCode = compiledCode.replace(
                /import\s+['"](\.[^'"]*?\.(css|scss))['"]/g,
                (_match, importPath: string) => {
                    const absoluteCssPath = path.resolve(sourceDir, importPath);
                    const rootRelative = '/' + path.relative(projectRoot, absoluteCssPath).replace(/\\/g, '/');
                    return `import '${rootRelative}'`;
                },
            );

            const finalComponentCode = outputFormat === 'js'
                ? ts.transpileModule(compiledCode, { compilerOptions: TS_COMPILER_OPTIONS }).outputText
                : compiledCode;

            // Always write to cache (for import path rewriting)
            if (isForCache) {
                const dir = path.dirname(cachePath);
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(cachePath, finalComponentCode);
            }

            // Only return compiled code for component files (has selector)
            // Non-component files: let Vite's esbuild handle type stripping
            if (results[0].selector) {
                return finalComponentCode;
            }
        } catch (err) {
            console.error(`[AC Compiler] Error compiling ${id}:`, err);
        }
        return null;
    };

    /**
     * Recursively compile a file and all of its import dependencies.
     * Follows `import`/`export` statements and `import.meta.glob` patterns.
     * Uses {@link compiledFiles} to avoid circular-import infinite loops.
     */
    const compileRecursive = async (id: string): Promise<void> => {
        const normalizedId = normalizePath(id);
        if (compiledFiles.has(normalizedId)) return;
        compiledFiles.add(normalizedId);

        if (!fs.existsSync(id)) return;
        const code = fs.readFileSync(id, 'utf8');
        const currentDir = path.dirname(id);

        // 1. Find standard imports and exports
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
                const isInternal = normalizedAbs.startsWith(normalizedRoot);
                const isPackage = normalizedAbs.includes('/packages/');
                if (fs.existsSync(absolutePath) && normalizedAbs.endsWith('.ts') && (isInternal || isPackage)) {
                    await compileRecursive(absolutePath);
                }
            }
        }

        // 2. Find import.meta.glob patterns
        const globMatches = code.matchAll(/import\.meta\.glob\(['"](.+?)['"]/g);
        for (const match of globMatches) {
            const pattern = match[1];
            if (!pattern.startsWith('.')) continue;

            const globRegex = new RegExp('^' + pattern
                .replace(/\./g, '\\.')
                .replace(/\*\*/g, '(.+)')
                .replace(/\*/g, '([^/]+)') + '$');

            const baseDir = path.dirname(id);

            const findFiles = async (dir: string): Promise<void> => {
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
                        await findFiles(fullPath);
                    } else if (globRegex.test(relPath)) {
                        const normalizedFull = normalizePath(fullPath);
                        const isInternal = normalizedFull.startsWith(normalizedRoot);
                        const isPackage = normalizedFull.includes('/packages/');
                        if (normalizedFull.endsWith('.ts') && (isInternal || isPackage)) {
                            await compileRecursive(fullPath);
                        }
                    }
                }
            };

            await findFiles(baseDir);
        }

        await doTransform(code, id, true);
    };

    return {
        name: 'ac-runtime-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
            projectRoot = config.root;
            normalizedRoot = normalizePath(projectRoot);
        },
        transformIndexHtml(html: string) {
            if (appConfig?.main) {
                const entryFile = path.resolve(projectRoot, appConfig.main);
                const cachePath = getCachePath(entryFile);
                const relativeToRoot = '/' + path.relative(projectRoot, cachePath).replace(/\\/g, '/');
                // Replace any variant of src/main.ts with the cached version
                return html.replace(/src=(['"])(\.?\/)?src\/main\.ts\1/g, `src=$1${relativeToRoot}$1`);
            }
            return html;
        },
        async buildStart() {
            if (!projectRoot) {
                projectRoot = process.cwd();
                normalizedRoot = normalizePath(projectRoot);
            }

            const pkgPath = path.join(projectRoot, 'package.json');
            const mainEntry = path.join(projectRoot, 'src/main.ts');
            if (fs.existsSync(pkgPath) && fs.existsSync(mainEntry)) {
                try {
                    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                    appConfig = {
                        name: pkg.name ?? '',
                        version: pkg.version ?? '0.0.0',
                        type: 'application',
                        main: 'src/main.ts',
                    };
                } catch (err) {
                    console.error('[AC Compiler] Failed to parse package.json:', err);
                }
            }

            if (appConfig?.main) {
                const entryFile = path.resolve(projectRoot, appConfig.main);
                const cacheDir = path.join(projectRoot, '.ac-runtime-cache');
                if (fs.existsSync(cacheDir)) {
                    fs.rmSync(cacheDir, { recursive: true, force: true });
                }
                fs.mkdirSync(cacheDir, { recursive: true });

                console.log(`🚀 [AC Compiler] Starting recursive compilation from: ${appConfig.main}`);
                compiledFiles.clear();
                await compileRecursive(entryFile);
                console.log(`✅ [AC Compiler] Compilation complete. Processed ${compiledFiles.size} files.`);
            }
        },
        async transform(code, id) {
            return await doTransform(code, id, false);
        },
        configureServer(server) {
            const packagesDir = path.resolve(projectRoot, '../../packages');
            if (fs.existsSync(packagesDir)) {
                server.watcher.add(packagesDir);
            }
            server.watcher.on('change', async (file) => {
                const normalizedFile = normalizePath(file);
                if (normalizedFile.includes('.ac-runtime-cache') || normalizedFile.includes('node_modules')) {
                    return;
                }

                if (file.endsWith('.ts')) {
                    console.log(`[AC Compiler] File changed, re-compiling: ${path.basename(file)}`);
                    try {
                        const code = fs.readFileSync(file, 'utf8');
                        await doTransform(code, file, true);
                    } catch (err) {
                        console.error(`[AC Compiler] Error reading changed file: ${path.basename(file)}`, err);
                    }
                    server.ws.send({ type: 'full-reload' });
                } else if (file.endsWith('.html') || file.endsWith('.css')) {
                    console.log(`[AC Compiler] Asset changed, reloading: ${path.basename(file)}`);
                    const tsFile = file.replace(/\.(html|css)$/, '.ts');
                    if (fs.existsSync(tsFile)) {
                        console.log(`[AC Compiler] Re-compiling component owner: ${path.basename(tsFile)}`);
                        try {
                            const code = fs.readFileSync(tsFile, 'utf8');
                            await doTransform(code, tsFile, true);
                        } catch (err) {
                            console.error(`[AC Compiler] Error re-compiling component owner: ${path.basename(tsFile)}`, err);
                        }
                    }
                    server.ws.send({ type: 'full-reload' });
                }
            });
        },
    };
}
