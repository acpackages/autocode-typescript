import { Plugin, ResolvedConfig } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { ComponentCompiler } from '../../ac-runtime-compiler/src/index';
export function acRuntimePlugin(): Plugin {
    let config: ResolvedConfig;
    const compiler = new ComponentCompiler();
    let projectRoot = '';
    let appConfig: any = null;
    const compiledFiles = new Set<string>();
    /**
     * Normalizes path slashes to forward slashes.
     */
    const normalizePath = (p: string) => p.replace(/\\/g, '/');
    /**
     * Gets the path in the cache directory for a given absolute source path.
     */
    const getCachePath = (absolutePath: string): string => {
        // Find a common root for tests and packages if needed, but here we mirror relative to projectRoot or workspace root?
        // Let's use the workspace root for mirroring to handle cross-project imports correctly within the cache.
        const workspaceRoot = path.resolve(projectRoot, '../../');
        const relativeToWorkspace = path.relative(workspaceRoot, absolutePath);
        const safeRelativePath = relativeToWorkspace.replace(/\.\./g, 'up');
        return path.join(projectRoot, 'ac-runtime-cache', safeRelativePath);
    };
    /**
     * Resolves the import path for the compiled code.
     */
    const resolveImport = (originalPath: string, importerPath: string) => {
        if (originalPath.startsWith('.')) {
            const absolutePath = path.resolve(path.dirname(importerPath), originalPath);
            // Resolve extension if missing
            let resolvedPath = absolutePath;
            if (!fs.existsSync(resolvedPath)) {
                if (fs.existsSync(resolvedPath + '.ts')) {
                    resolvedPath += '.ts';
                }
                else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) {
                    resolvedPath = path.join(resolvedPath, 'index.ts');
                }
            }
            const normalizedResolved = normalizePath(resolvedPath);
            // Allow anything in tests/, but NOT in packages/
            if (normalizedResolved.endsWith('.ts') && !normalizedResolved.includes('/packages/')) {
                const targetCachePath = getCachePath(resolvedPath);
                const importerCachePath = getCachePath(importerPath);
                let relativePath = path.relative(path.dirname(importerCachePath), targetCachePath).replace(/\\/g, '/');
                if (!relativePath.startsWith('.')) {
                    relativePath = './' + relativePath;
                }
                return relativePath;
            }
        }
        return originalPath;
    };
    const doTransform = async (code: string, id: string, isForCache = false) => {
        const normalizedId = normalizePath(id);
        const normalizedCacheDir = normalizePath(path.join(projectRoot, 'ac-runtime-cache'));
        if (normalizedId.includes(normalizedCacheDir))
            return null;
        if (id.endsWith('.ts') && !id.includes('node_modules')) {
            try {
                const cachePath = getCachePath(id);
                if (!isForCache && fs.existsSync(cachePath)) {
                    return fs.readFileSync(cachePath, 'utf8');
                }
                const results = compiler.compile(code, id, (originalPath, importerPath) => resolveImport(originalPath, importerPath));
                if (results.length > 0) {
                    let compiledCode = results[0].code;
                    compiledCode = compiledCode.replace(/import\s+['"].*?\.(css|scss)['"];?\n?/g, '');
                    compiledCode = compiledCode.replace(/import\s+.*?\s+from\s+['"].*?\.(css|scss)['"];?\n?/g, '');
                    if (isForCache) {
                        const dir = path.dirname(cachePath);
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }
                        fs.writeFileSync(cachePath, compiledCode);
                    }
                    return compiledCode;
                }
            }
            catch (err) {
                console.error(`[AC Compiler] Error compiling ${id}:`, err);
            }
        }
        return null;
    };
    const compileRecursive = async (id: string) => {
        const normalizedId = normalizePath(id);
        if (compiledFiles.has(normalizedId))
            return;
        compiledFiles.add(normalizedId);
        if (!fs.existsSync(id))
            return;
        const code = fs.readFileSync(id, 'utf8');
        const currentDir = path.dirname(id);
        // 1. Find standard imports and exports
        const importMatches = Array.from(code.matchAll(/(?:import|export|from).*?['"](.+?)['"]/g));
        for (const match of importMatches) {
            const originalPath = match[1];
            if (originalPath.startsWith('.')) {
                let absolutePath = path.resolve(currentDir, originalPath);
                if (!fs.existsSync(absolutePath)) {
                    if (fs.existsSync(absolutePath + '.ts')) {
                        absolutePath += '.ts';
                    }
                    else if (fs.existsSync(path.join(absolutePath, 'index.ts'))) {
                        absolutePath = path.join(absolutePath, 'index.ts');
                    }
                }
                const normalizedAbs = normalizePath(absolutePath);
                // Allow tests/, exclude packages/
                if (fs.existsSync(absolutePath) && normalizedAbs.endsWith('.ts') && !normalizedAbs.includes('/packages/')) {
                    await compileRecursive(absolutePath);
                }
            }
        }
        // 2. Find import.meta.glob patterns
        const globMatches = Array.from(code.matchAll(/import\.meta\.glob\(['"](.+?)['"]/g));
        for (const match of globMatches) {
            const pattern = match[1];
            if (pattern.startsWith('.')) {
                const globRegex = new RegExp('^' + pattern
                    .replace(/\./g, '\\.')
                    .replace(/\*\*/g, '(.+)')
                    .replace(/\*/g, '([^/]+)') + '$');
                const baseDir = path.dirname(id);
                const findFiles = async (dir: string) => {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        const relPath = './' + path.relative(baseDir, fullPath).replace(/\\/g, '/');
                        if (entry.isDirectory()) {
                            await findFiles(fullPath);
                        }
                        else if (globRegex.test(relPath)) {
                            const normalizedFull = normalizePath(fullPath);
                            if (normalizedFull.endsWith('.ts') && !normalizedFull.includes('/packages/')) {
                                await compileRecursive(fullPath);
                            }
                        }
                    }
                };
                try {
                    await findFiles(baseDir);
                }
                catch (err) {
                }
            }
        }
        await doTransform(code, id, true);
    };
    return {
        name: 'ac-runtime-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
            projectRoot = config.root;
        },
        transformIndexHtml(html: string) {
            if (appConfig?.type === 'application' && appConfig.main) {
                const entryFile = path.resolve(projectRoot, appConfig.main);
                const cachePath = getCachePath(entryFile);
                const relativeToRoot = path.relative(projectRoot, cachePath).replace(/\\/g, '/');
                return html.replace('/src/main.ts', '/' + relativeToRoot);
            }
            return html;
        },
        async buildStart() {
            if (!projectRoot)
                projectRoot = process.cwd();
            const pkgPath = path.join(projectRoot, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (pkg.name === '@autocode-ts/tests-browser') {
                    appConfig = {
                        name: pkg.name,
                        version: pkg.version,
                        type: 'application',
                        main: 'src/main.ts'
                    };
                }
            }
            if (appConfig?.type === 'application' && appConfig.main) {
                const entryFile = path.resolve(projectRoot, appConfig.main);
                const cacheDir = path.join(projectRoot, 'ac-runtime-cache');
                if (fs.existsSync(cacheDir)) {
                    fs.rmSync(cacheDir, { recursive: true, force: true });
                }
                fs.mkdirSync(cacheDir, { recursive: true });
                console.log(`🚀 [AC Compiler] Starting recursive compilation from: ${appConfig.main}`);
                compiledFiles.clear();
                await compileRecursive(entryFile);
                console.log(`✅ [AC Compiler] Compilation complete. Processed ${compiledFiles.size} files (Browser Test App Only).`);
            }
        },
        async transform(code, id) {
            return await doTransform(code, id, false);
        },
        configureServer(server) {
            server.watcher.on('change', async (file) => {
                if (file.endsWith('.ts') && !file.includes('ac-runtime-cache') && !file.includes('node_modules')) {
                    console.log(`[AC Compiler] File changed, re-compiling: ${path.basename(file)}`);
                    const code = fs.readFileSync(file, 'utf8');
                    await doTransform(code, file, true);
                    server.ws.send({ type: 'full-reload' });
                }
            });
        }
    };
}