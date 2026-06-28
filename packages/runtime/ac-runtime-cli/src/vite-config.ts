/**
 * vite-config.ts — Generate Vite InlineConfig from AcRuntimeConfig
 *
 * One function: createViteConfig(). Takes the runtime config and
 * CLI options, returns a complete Vite InlineConfig ready for
 * createServer() or build().
 *
 * Consumers never see or touch this. It's internal to the CLI.
 */
import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import type { InlineConfig, Plugin, PluginOption } from 'vite';
import { acRuntimePlugin } from './vite-plugin.js';
import type { AcRuntimeConfig } from './config.js';

/**
 * Dynamically import Vite from the consumer's project root.
 * This ensures we use the correct Vite version even when
 * the CLI is installed in a monorepo with a different version.
 */
export async function importVite(projectRoot: string): Promise<typeof import('vite')> {
    try {
        const req = createRequire(path.join(projectRoot, 'package.json'));
        const vitePath = req.resolve('vite');
        return await import(pathToFileURL(vitePath).href);
    } catch {
        // Fallback to static import from CLI's own resolution
        return await import('vite');
    }
}

export type ServeOptions = {
    port: number;
    host: boolean;
    open: boolean;
};

export type BuildOptions = {
    outDir?: string;
};

/**
 * Generate a complete Vite InlineConfig from ac-runtime.json config.
 *
 * Handles: plugins, server, build, resolve aliases (from tsconfig.json),
 * worker format, asset directories, optimizeDeps, and watch ignoring.
 */
export function createViteConfig(
    config: AcRuntimeConfig,
    mode: 'serve' | 'build',
    options?: ServeOptions | BuildOptions,
): InlineConfig {
    const { projectRoot } = config;
    const plugins: PluginOption[] = [acRuntimePlugin(config)];

    // --- Resolve aliases from tsconfig.json ---
    const aliases = readTsconfigAliases(projectRoot);

    // --- Determine publicDir ---
    // If there's an asset mapping with url "/", use its directory as publicDir.
    // Otherwise, use the default "public" if it exists.
    let publicDir: string | false = false;
    const publicDefault = path.join(projectRoot, 'public');
    if (fs.existsSync(publicDefault)) {
        publicDir = publicDefault;
    }
    for (const asset of config.assets) {
        if (asset.url === '/') {
            publicDir = path.resolve(projectRoot, asset.directory);
        }
    }

    // --- Asset directories that need middleware (non-root mappings) ---
    const assetMiddleware = config.assets.filter(a => a.url !== '/');
    if (assetMiddleware.length > 0) {
        const buildOpts = (options || {}) as BuildOptions;
        const outDir = buildOpts.outDir || config.buildDirectory;
        plugins.push(assetServingPlugin(projectRoot, assetMiddleware, mode, outDir));
    }

    // --- Static copy / serve for configured resources ---
    if (mode === 'serve') {
        plugins.push(staticResourcesServingPlugin(config));
    }
    if (mode === 'build') {
        const staticCopyTargets = getStaticCopyTargets(config);
        if (staticCopyTargets.length > 0) {
            plugins.push(staticCopyPlugin(staticCopyTargets));
        }
    }

    // --- Collect all fs.allow paths from aliases ---
    const allowPaths = new Set<string>();
    allowPaths.add(projectRoot);
    for (const aliasPath of Object.values(aliases)) {
        // Allow the drive root or parent directory of the alias
        const parsed = path.parse(aliasPath);
        allowPaths.add(parsed.root || path.dirname(aliasPath));
    }

    // --- Build InlineConfig ---
    const viteConfig: InlineConfig = {
        root: projectRoot,
        base: '/',
        configFile: false,  // Don't look for vite.config.ts in consumer project
        plugins,
        publicDir,

        worker: {
            format: 'es',
        },

        css: {
            preprocessorOptions: {
                scss: {
                    api: 'legacy',
                },
            },
        },

        resolve: {
            alias: aliases,
            preserveSymlinks: true,
        },

        optimizeDeps: {
            exclude: ['typescript'],
        },
    };

    if (mode === 'serve') {
        const serveOpts = (options || {}) as ServeOptions;
        viteConfig.server = {
            host: serveOpts.host ? true : 'localhost',
            port: serveOpts.port || 3000,
            open: serveOpts.open || false,
            fs: {
                strict: false,
                allow: Array.from(allowPaths),
            },
            watch: {
                usePolling: true,
                interval: 100,
                ignored: [
                    `**/${config.cacheDirectory}/**`,
                    '**/node_modules/**',
                    `**/${config.buildDirectory}/**`,
                ],
            },
        };
    }

    if (mode === 'build') {
        const buildOpts = (options || {}) as BuildOptions;
        const outDir = buildOpts.outDir || config.buildDirectory;

        viteConfig.build = {
            outDir: path.resolve(projectRoot, outDir),
            emptyOutDir: true,
            target: 'es2022',
            minify: 'esbuild',
            sourcemap: false,
            cssCodeSplit: true,
            assetsDir: 'assets',
            chunkSizeWarningLimit: 3000,
            terserOptions: {
                compress: {
                    drop_console: false,
                    drop_debugger: true,
                    passes: 2,
                },
                format: {
                    comments: false,
                },
            },
            rollupOptions: {
                onwarn(warning, warn) {
                    if (warning.code === 'EVAL') return;
                    warn(warning);
                },
                output: {
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash][extname]',
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            const parts = id.split('node_modules/')[1].split('/');
                            return `vendor-${parts[0]}`;
                        }
                    },
                },
            },
        };
    }

    return viteConfig;
}

function readTsconfigPaths(tsconfigPath: string): Record<string, string> {
    if (!fs.existsSync(tsconfigPath)) return {};

    let tsconfig: any;
    try {
        const raw = fs.readFileSync(tsconfigPath, 'utf8');
        const stripped = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        tsconfig = JSON.parse(stripped);
    } catch {
        return {};
    }

    const aliases: Record<string, string> = {};
    const tsconfigDir = path.dirname(tsconfigPath);

    if (tsconfig.extends) {
        const parentPath = path.resolve(tsconfigDir, tsconfig.extends);
        Object.assign(aliases, readTsconfigPaths(parentPath));
    }

    const paths = tsconfig?.compilerOptions?.paths;
    if (paths) {
        for (const [key, values] of Object.entries(paths)) {
            if (!Array.isArray(values) || values.length === 0) continue;
            const cleanKey = key.replace(/\/\*$/, '');
            const target = (values[0] as string).replace(/\/\*$/, '');
            aliases[cleanKey] = path.resolve(tsconfigDir, target);
        }
    }

    return aliases;
}

/**
 * Read tsconfig.json compilerOptions.paths and convert to Vite resolve.alias.
 * Single source of truth — no more hardcoded aliases.
 */
function readTsconfigAliases(projectRoot: string): Record<string, string> {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    return readTsconfigPaths(tsconfigPath);
}

/**
 * Lightweight Vite plugin that serves additional asset directories
 * as static middleware in dev and copies them during build.
 */
function assetServingPlugin(
    projectRoot: string,
    assets: { directory: string; url: string }[],
    mode: 'serve' | 'build',
    outDir?: string,
): Plugin {
    return {
        name: 'ac-asset-serving',

        configureServer(server) {
            // Serve asset directories via middleware in dev
            for (const asset of assets) {
                const absDir = path.resolve(projectRoot, asset.directory);
                const urlPrefix = asset.url.endsWith('/') ? asset.url : asset.url + '/';

                server.middlewares.use((req, res, next) => {
                    if (!req.url || !req.url.startsWith(urlPrefix) && req.url !== asset.url) {
                        return next();
                    }

                    // Strip the URL prefix to get the file path
                    let filePath: string;
                    if (req.url === asset.url || req.url === asset.url + '/') {
                        return next();
                    }
                    filePath = req.url.slice(urlPrefix.length);
                    const fullPath = path.join(absDir, filePath);

                    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
                        const ext = path.extname(fullPath).toLowerCase();
                        const mimeMap: Record<string, string> = {
                            '.svg': 'image/svg+xml',
                            '.png': 'image/png',
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.gif': 'image/gif',
                            '.webp': 'image/webp',
                            '.mp4': 'video/mp4',
                            '.webm': 'video/webm',
                            '.mp3': 'audio/mpeg',
                            '.wav': 'audio/wav',
                            '.ogg': 'audio/ogg',
                            '.js': 'application/javascript',
                            '.css': 'text/css',
                            '.json': 'application/json',
                            '.html': 'text/html',
                            '.txt': 'text/plain',
                        };
                        const contentType = mimeMap[ext] || 'application/octet-stream';
                        res.setHeader('Content-Type', contentType);
                        res.setHeader('Cache-Control', 'no-cache');
                        const stream = fs.createReadStream(fullPath);
                        stream.pipe(res);
                    } else {
                        next();
                    }
                });
            }
        },

        async writeBundle() {
            if (mode !== 'build') return;

            // Copy asset directories to build output (using config outDir)
            const resolvedOutDir = outDir || 'dist';
            for (const asset of assets) {
                const srcDir = path.resolve(projectRoot, asset.directory);
                // The url prefix determines the output subdirectory inside outputDirectory
                const destDir = path.join(projectRoot, resolvedOutDir, asset.url.slice(1));
                if (fs.existsSync(srcDir)) {
                    copyDirRecursive(srcDir, destDir);
                }
            }
        },
    };
}

/** Simple static file copy plugin for UMD third-party bundles. */
function staticCopyPlugin(targets: { src: string; dest: string }[]): Plugin {
    return {
        name: 'ac-static-copy',
        async writeBundle(options) {
            const outDir = options.dir || 'dist';
            for (const target of targets) {
                if (fs.existsSync(target.src)) {
                    const stat = fs.statSync(target.src);
                    if (stat.isDirectory()) {
                        const destDir = path.join(outDir, target.dest);
                        copyDirRecursive(target.src, destDir);
                    } else {
                        let destPath = path.join(outDir, target.dest);
                        if (target.dest.endsWith('/') || target.dest.endsWith('\\') || (fs.existsSync(destPath) && fs.statSync(destPath).isDirectory())) {
                            destPath = path.join(destPath, path.basename(target.src));
                        }
                        fs.mkdirSync(path.dirname(destPath), { recursive: true });
                        fs.copyFileSync(target.src, destPath);
                    }
                }
            }
        },
    };
}

/** Resolve node_modules path robustly, walking up to support monorepo roots. */
function resolveResourcePath(projectRoot: string, filePath: string): string {
    if (filePath.startsWith('node_modules/') || filePath.startsWith('node_modules\\')) {
        const relativePart = filePath.substring(13); // strip 'node_modules/'
        let dir = projectRoot;
        while (true) {
            const candidate = path.join(dir, 'node_modules', relativePart);
            if (fs.existsSync(candidate)) return candidate;
            const parent = path.dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
    }
    return path.resolve(projectRoot, filePath);
}

/** Get static copy targets from the configuration staticResources. */
function getStaticCopyTargets(config: AcRuntimeConfig): { src: string; dest: string }[] {
    const targets: { src: string; dest: string }[] = [];
    if (!config.staticResources) return targets;
    
    for (const resource of config.staticResources) {
        const resolvedSrc = resolveResourcePath(config.projectRoot, resource.path);
        if (fs.existsSync(resolvedSrc)) {
            targets.push({ src: resolvedSrc, dest: resource.buildPath });
        } else {
            console.warn(`[acr] Warning: staticResource path does not exist: ${resource.path} (resolved: ${resolvedSrc})`);
        }
    }
    return targets;
}

/** Lightweight Vite plugin that serves staticResources during dev/serve mode. */
function staticResourcesServingPlugin(config: AcRuntimeConfig): Plugin {
    return {
        name: 'ac-static-resources-serving',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (!req.url) return next();
                
                const cleanUrl = req.url.split('?')[0];
                
                for (const resource of config.staticResources || []) {
                    const urlPrefix = resource.buildPath.startsWith('/') ? resource.buildPath : '/' + resource.buildPath;
                    const resolvedSrc = resolveResourcePath(config.projectRoot, resource.path);
                    if (!fs.existsSync(resolvedSrc)) continue;
                    
                    const stat = fs.statSync(resolvedSrc);
                    if (stat.isDirectory()) {
                        const prefixWithSlash = urlPrefix.endsWith('/') ? urlPrefix : urlPrefix + '/';
                        if (cleanUrl.startsWith(prefixWithSlash)) {
                            const relativeFilePath = cleanUrl.slice(prefixWithSlash.length);
                            const fullFilePath = path.join(resolvedSrc, relativeFilePath);
                            if (fs.existsSync(fullFilePath) && fs.statSync(fullFilePath).isFile()) {
                                serveFile(res, fullFilePath);
                                return;
                            }
                        }
                    } else {
                        if (cleanUrl === urlPrefix) {
                            serveFile(res, resolvedSrc);
                            return;
                        }
                    }
                }
                next();
            });
        }
    };
}

function serveFile(res: any, filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.html': 'text/html',
        '.txt': 'text/plain',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
}

/** Recursively copy a directory. */
function copyDirRecursive(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

