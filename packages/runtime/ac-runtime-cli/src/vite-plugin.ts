/**
 * vite-plugin.ts — AutoCode Vite plugin
 *
 * Integrates the AC Runtime ComponentCompiler into Vite's
 * dev server and production build pipeline.
 *
 * What it does:
 * 1. On buildStart, recursively discovers all .ts files reachable
 *    from the entry point (following imports and import.meta.glob).
 * 2. Compiles each file via ComponentCompiler, writing output
 *    to the cache directory.
 * 3. Rewrites import paths so Vite serves compiled cache files.
 * 4. On dev server, watches for .ts/.html/.css changes and
 *    triggers recompile + full reload.
 */
import type { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { ComponentCompiler } from '../../ac-runtime-compiler/src/index.js';
import type { AcRuntimeConfig } from './config.js';

/** Normalize path separators to forward slashes (Windows compat). */
const normalizePath = (p: string): string => p.replace(/\\/g, '/');

/**
 * Creates the AutoCode Vite plugin.
 *
 * Responsibilities:
 * - Transform @AcElement-decorated TypeScript into Web Component IIFEs
 * - Recursive pre-compilation from entry point
 * - Import path rewriting to cache directory
 * - HMR: recompile on .ts/.html/.css change → full reload
 */
export function acRuntimePlugin(runtimeConfig: AcRuntimeConfig): Plugin {
    const compiler = new ComponentCompiler();
    let projectRoot = '';
    let normalizedRoot = '';
    const compiledFiles = new Set<string>();

    // --- Path helpers ---

    /** Map source file → cache file path. */
    const getCachePath = (absolutePath: string): string => {
        const normalizedAbs = normalizePath(absolutePath);

        if (normalizedAbs.startsWith(normalizedRoot)) {
            return path.join(projectRoot, runtimeConfig.cacheDirectory, path.relative(projectRoot, absolutePath));
        }

        // External workspace packages → cache/packages/...
        if (normalizedAbs.includes('/packages/')) {
            const parts = normalizePath(absolutePath).split('/packages/');
            return path.join(projectRoot, runtimeConfig.cacheDirectory, 'packages', parts[parts.length - 1]);
        }

        // Anything else → cache/ext/...
        const safePath = normalizePath(absolutePath).replace(/[:\\/]/g, '_');
        return path.join(projectRoot, runtimeConfig.cacheDirectory, 'ext', safePath);
    };

    /** Resolve a TS import: exact → +.ts → +/index.ts. */
    const resolveTypescriptFile = (absolutePath: string): string => {
        if (fs.existsSync(absolutePath) && !fs.statSync(absolutePath).isDirectory()) return absolutePath;
        if (fs.existsSync(absolutePath + '.ts')) return absolutePath + '.ts';
        const indexPath = path.join(absolutePath, 'index.ts');
        if (fs.existsSync(indexPath)) return indexPath;
        return absolutePath;
    };

    /**
     * Import resolver for the ComponentCompiler.
     * Rewrites relative imports to point to cache directory.
     */
    const resolveImport = (originalPath: string, importerPath: string): string => {
        let absolutePath = '';

        // Extract query parameters (e.g. ?worker, ?raw) to resolve the physical file
        const queryIdx = originalPath.indexOf('?');
        const query = queryIdx !== -1 ? originalPath.slice(queryIdx) : '';
        const cleanOriginalPath = queryIdx !== -1 ? originalPath.slice(0, queryIdx) : originalPath;

        if (cleanOriginalPath.startsWith('.')) {
            absolutePath = path.resolve(path.dirname(importerPath), cleanOriginalPath);
        } else if (cleanOriginalPath.startsWith('src/')) {
            absolutePath = path.resolve(projectRoot, cleanOriginalPath);
        }

        if (!absolutePath) return originalPath;

        const resolvedPath = resolveTypescriptFile(absolutePath);
        const normalizedResolved = normalizePath(resolvedPath);

        const isInternal = normalizedResolved.startsWith(normalizedRoot);
        const isPackage = normalizedResolved.includes('/packages/');

        if (normalizedResolved.endsWith('.ts') && (isInternal || isPackage) && fs.existsSync(resolvedPath)) {
            const targetCachePath = getCachePath(resolvedPath);
            const importerCachePath = getCachePath(importerPath);
            let relativePath = path.relative(path.dirname(importerCachePath), targetCachePath).replace(/\\/g, '/');
            if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
            }
            return relativePath + query;
        }

        // Copy non-TS assets/files referenced by components to the cache directory so they can be resolved
        if (!normalizedResolved.endsWith('.ts') && (isInternal || isPackage) && fs.existsSync(resolvedPath)) {
            const targetCachePath = getCachePath(resolvedPath);
            fs.mkdirSync(path.dirname(targetCachePath), { recursive: true });
            fs.copyFileSync(resolvedPath, targetCachePath);
            
            const importerCachePath = getCachePath(importerPath);
            let relativePath = path.relative(path.dirname(importerCachePath), targetCachePath).replace(/\\/g, '/');
            if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
            }
            return relativePath + query;
        }

        return originalPath;
    };

    // --- Core transform ---

    /**
     * Compile a single file. Writes output to cache.
     * Returns compiled code for component files, null otherwise.
     */
    const doTransform = async (code: string, id: string, writeToCache = false): Promise<string | null> => {
        const normalizedId = normalizePath(id);
        const normalizedCacheDir = normalizePath(path.join(projectRoot, runtimeConfig.cacheDirectory));

        // If the file is already a compiled file from the cache directory, return it as-is
        if (normalizedId.includes(normalizedCacheDir)) {
            return code;
        }
        if (!id.endsWith('.ts') || id.includes('node_modules')) return null;

        try {
            const cachePath = getCachePath(id);
            const results = compiler.compile(code, id, resolveImport);

            if (results.length === 0) {
                // Non-component file — rewrite imports and write to cache
                if (writeToCache) {
                    const rewritten = code
                        .replace(/\bfrom\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, importPath) => {
                            return `from ${q}${resolveImport(importPath, id)}${q}`;
                        })
                        .replace(/\bimport\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, importPath) => {
                            return `import ${q}${resolveImport(importPath, id)}${q}`;
                        });
                    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
                    fs.writeFileSync(cachePath, rewritten);
                }
                return null;
            }

            let compiledCode = results[0].code;

            // Rewrite CSS/SCSS imports to root-relative so Vite can resolve them
            const sourceDir = path.dirname(id);
            compiledCode = compiledCode.replace(
                /import\s+['"](\.[^'"]*?\.(css|scss))['"];?/g,
                (_match, importPath: string) => {
                    const absoluteCssPath = path.resolve(sourceDir, importPath);
                    const rootRelative = '/' + path.relative(projectRoot, absoluteCssPath).replace(/\\/g, '/');
                    return `import '${rootRelative}'`;
                },
            );

            if (writeToCache) {
                fs.mkdirSync(path.dirname(cachePath), { recursive: true });
                fs.writeFileSync(cachePath, compiledCode);
            }

            // Return compiled code only for component files (has selector)
            if (results[0].selector) {
                return compiledCode;
            }
        } catch (err) {
            console.error(`[acr] Compile error in ${path.basename(id)}:`, err);
        }
        return null;
    };

    // --- Recursive compilation ---

    /**
     * Recursively compile a file and all its imports.
     * Follows import/export statements and import.meta.glob patterns.
     */
    const compileRecursive = async (id: string): Promise<void> => {
        const normalizedId = normalizePath(id);
        if (compiledFiles.has(normalizedId)) return;
        compiledFiles.add(normalizedId);

        if (!fs.existsSync(id)) return;
        const code = fs.readFileSync(id, 'utf8');
        const currentDir = path.dirname(id);

        // Follow standard imports/exports
        const importMatches = code.matchAll(/(?:import|export|from).*?['"](.+?)['"];?/g);
        for (const match of importMatches) {
            const originalPath = match[1];
            let absolutePath = '';

            // Extract query parameters (e.g. ?worker, ?raw) to resolve the physical file
            const queryIdx = originalPath.indexOf('?');
            const cleanPath = queryIdx !== -1 ? originalPath.slice(0, queryIdx) : originalPath;

            if (cleanPath.startsWith('.')) {
                absolutePath = path.resolve(currentDir, cleanPath);
            } else if (cleanPath.startsWith('src/')) {
                absolutePath = path.resolve(projectRoot, cleanPath);
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

        // Follow import.meta.glob patterns
        const globMatches = code.matchAll(/import\.meta\.glob\(\s*['"](.+?)['"]/g);
        for (const match of globMatches) {
            const pattern = match[1];
            if (!pattern.startsWith('.')) continue;

            const globRegex = new RegExp('^' + pattern
                .replace(/\./g, '\\.')
                .replace(/\*\*/g, '(.+)')
                .replace(/\*/g, '([^/]+)') + '$');

            await walkGlob(currentDir, currentDir, globRegex);
        }

        await doTransform(code, id, true);
    };

    /** Recursively find and compile files matching a glob pattern. */
    const walkGlob = async (baseDir: string, dir: string, regex: RegExp): Promise<void> => {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relPath = './' + path.relative(baseDir, fullPath).replace(/\\/g, '/');

                if (entry.isDirectory()) {
                    await walkGlob(baseDir, fullPath, regex);
                } else if (regex.test(relPath)) {
                    const normalizedFull = normalizePath(fullPath);
                    const isInternal = normalizedFull.startsWith(normalizedRoot);
                    const isPackage = normalizedFull.includes('/packages/');
                    if (normalizedFull.endsWith('.ts') && (isInternal || isPackage)) {
                        await compileRecursive(fullPath);
                    }
                }
            }
        } catch { /* directory not readable */ }
    };

    // --- Module graph invalidation ---

    /** Invalidate Vite module graph for cache files so Vite doesn't serve stale modules. */
    const invalidateCacheModules = (server: any, changedSourceFile?: string): void => {
        const normalizedCacheDir = normalizePath(path.join(projectRoot, runtimeConfig.cacheDirectory));
        const moduleGraph = (server.environments?.client?.moduleGraph) ?? (server as any).moduleGraph;
        if (!moduleGraph) return;

        // Targeted: invalidate the specific cache file
        if (changedSourceFile) {
            const cachePath = getCachePath(changedSourceFile);
            const mods = moduleGraph.getModulesByFile(normalizePath(cachePath));
            if (mods) {
                for (const mod of mods) moduleGraph.invalidateModule(mod);
            }
        }

        // Broad sweep: invalidate all cache directory modules
        if (moduleGraph.idToModuleMap) {
            for (const mod of moduleGraph.idToModuleMap.values()) {
                const modFile = mod.file ? normalizePath(mod.file) : '';
                if (modFile.startsWith(normalizedCacheDir)) {
                    moduleGraph.invalidateModule(mod);
                }
            }
        }
    };

    // --- Plugin definition ---

    return {
        name: 'ac-runtime-plugin',
        enforce: 'pre',

        configResolved(resolvedConfig) {
            projectRoot = resolvedConfig.root;
            normalizedRoot = normalizePath(projectRoot);
        },

        transformIndexHtml(html: string) {
            // Rewrite <script src="./src/main.ts"> to point to cached version
            const entryFile = runtimeConfig.entryFile;
            const cachePath = getCachePath(entryFile);
            const relativeToRoot = '/' + path.relative(projectRoot, cachePath).replace(/\\/g, '/');
            return html.replace(/src=(['"])(\.\/?)?src\/main\.ts\1/g, `src=$1${relativeToRoot}$1`);
        },

        async buildStart() {
            if (!projectRoot) {
                projectRoot = process.cwd();
                normalizedRoot = normalizePath(projectRoot);
            }

            const cacheDir = path.join(projectRoot, runtimeConfig.cacheDirectory);

            // Clean and recreate cache
            if (fs.existsSync(cacheDir)) {
                fs.rmSync(cacheDir, { recursive: true, force: true });
            }
            fs.mkdirSync(cacheDir, { recursive: true });

            // Recursive compile from entry point
            const entryRel = path.relative(projectRoot, runtimeConfig.entryFile);
            console.log(`\n🚀 [acr] Compiling from: ${entryRel}`);
            compiledFiles.clear();
            await compileRecursive(runtimeConfig.entryFile);
            console.log(`✅ [acr] Done. ${compiledFiles.size} files compiled.\n`);
        },

        async transform(code, id) {
            return await doTransform(code, id, false);
        },

        async handleHotUpdate({ file, server, read }) {
            const normalizedFile = normalizePath(file);
            if (normalizedFile.includes(runtimeConfig.cacheDirectory) || normalizedFile.includes('node_modules')) {
                return;
            }

            if (file.endsWith('.ts')) {
                console.log(`[acr] Changed: ${path.basename(file)}`);
                try {
                    const code = await read();
                    await doTransform(code, file, true);
                } catch (err) {
                    console.error(`[acr] Error recompiling ${path.basename(file)}:`, err);
                }
                invalidateCacheModules(server, file);
                server.ws.send({ type: 'full-reload' });
                return [];
            }

            if (file.endsWith('.html') || file.endsWith('.css')) {
                console.log(`[acr] Asset changed: ${path.basename(file)}`);
                // Recompile co-located .ts file
                const tsFile = file.replace(/\.(html|css)$/, '.ts');
                if (fs.existsSync(tsFile)) {
                    try {
                        const code = fs.readFileSync(tsFile, 'utf8');
                        await doTransform(code, tsFile, true);
                    } catch (err) {
                        console.error(`[acr] Error recompiling ${path.basename(tsFile)}:`, err);
                    }
                }
                invalidateCacheModules(server, tsFile);
                server.ws.send({ type: 'full-reload' });
                return [];
            }
        },

        configureServer(server) {
            // Watch workspace packages for cross-package changes
            const packagesDir = path.resolve(projectRoot, '../../packages');
            if (fs.existsSync(packagesDir)) {
                server.watcher.add(packagesDir);
            }
        },
    };
}
