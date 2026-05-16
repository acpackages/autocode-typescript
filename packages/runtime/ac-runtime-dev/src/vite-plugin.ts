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
export function acRuntimePlugin(): Plugin {
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

        if (normalizedAbs.startsWith(normalizedRoot)) {
            return path.join(projectRoot, '.ac-runtime-cache', path.relative(projectRoot, absolutePath));
        }
        const relToTests = path.relative(path.resolve(projectRoot, '..'), absolutePath);
        return path.join(projectRoot, '.ac-runtime-cache', 'up', relToTests);
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

        // Include project-local files, exclude external workspace packages
        if (normalizedResolved.endsWith('.ts') && normalizedResolved.startsWith(normalizedRoot) && fs.existsSync(resolvedPath)) {
            const targetCachePath = getCachePath(resolvedPath);

            // Only rewrite if the cache file was actually created (compilation succeeded)
            if (fs.existsSync(targetCachePath)) {
                const relativeToProjectRoot = path.relative(projectRoot, targetCachePath).replace(/\\/g, '/');
                return '/' + relativeToProjectRoot;
            }
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

            if (results.length === 0) return null;

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

            // Always write to cache (for import path rewriting)
            if (isForCache) {
                const dir = path.dirname(cachePath);
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(cachePath, compiledCode);
            }

            // Only return compiled code for component files (has selector)
            // Non-component files: let Vite's esbuild handle type stripping
            if (results[0].selector) {
                return compiledCode;
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
                if (fs.existsSync(absolutePath) && normalizedAbs.endsWith('.ts') && normalizedAbs.startsWith(normalizedRoot)) {
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
                        if (normalizedFull.endsWith('.ts') && normalizedFull.startsWith(normalizedRoot)) {
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
                const relativeToRoot = path.relative(projectRoot, cachePath).replace(/\\/g, '/');
                return html.replace('/src/main.ts', '/' + relativeToRoot);
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
            server.watcher.on('change', async (file) => {
                if (file.endsWith('.ts') && !file.includes('.ac-runtime-cache') && !file.includes('node_modules')) {
                    console.log(`[AC Compiler] File changed, re-compiling: ${path.basename(file)}`);
                    try {
                        const code = fs.readFileSync(file, 'utf8');
                        await doTransform(code, file, true);
                    } catch (err) {
                        console.error(`[AC Compiler] Error reading changed file: ${path.basename(file)}`, err);
                    }
                    server.ws.send({ type: 'full-reload' });
                }
            });
        },
    };
}
