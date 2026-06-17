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

    // --- Static copy for UMD third-party bundles ---
    // Check if vite-plugin-static-copy is available for build mode
    if (mode === 'build') {
        const staticCopyTargets = getStaticCopyTargets(projectRoot);
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

// --- Helpers ---

/**
 * Read tsconfig.json compilerOptions.paths and convert to Vite resolve.alias.
 * Single source of truth — no more hardcoded aliases.
 */
function readTsconfigAliases(projectRoot: string): Record<string, string> {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) return {};

    let tsconfig: any;
    try {
        // Strip comments from tsconfig (JSON with comments)
        const raw = fs.readFileSync(tsconfigPath, 'utf8');
        const stripped = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        tsconfig = JSON.parse(stripped);
    } catch {
        return {};
    }

    const paths = tsconfig?.compilerOptions?.paths;
    if (!paths) return {};

    const aliases: Record<string, string> = {};
    for (const [key, values] of Object.entries(paths)) {
        if (!Array.isArray(values) || values.length === 0) continue;
        const cleanKey = key.replace(/\/\*$/, '');
        const target = (values[0] as string).replace(/\/\*$/, '');
        aliases[cleanKey] = path.resolve(projectRoot, target);
    }
    return aliases;
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
                    const destPath = path.join(outDir, target.dest, path.basename(target.src));
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                    fs.copyFileSync(target.src, destPath);
                }
            }
        },
    };
}

/**
 * Detect UMD third-party bundles that need to be copied to build output.
 * Reads from a known pattern in the project's node_modules.
 */
function getStaticCopyTargets(projectRoot: string): { src: string; dest: string }[] {
    const targets: { src: string; dest: string }[] = [];
    const umdPatterns = [
        { pkg: '@autocode-ts/ac-bwipjs-pipe', file: 'ac-bwipjs-pipe.umd.js', dest: 'assets/third-party/ac-bwipjs-pipe' },
        { pkg: '@autocode-ts/ac-extensions', file: 'ac-extensions.umd.js', dest: 'assets/third-party/ac-extensions' },
        { pkg: '@autocode-ts/ac-pipes', file: 'ac-pipes.umd.js', dest: 'assets/third-party/ac-pipes' },
        { pkg: '@autocode-ts/ac-report-engine', file: 'ac-report-engine.umd.js', dest: 'assets/third-party/ac-report-engine' },
        { pkg: '@autocode-ts/autocode', file: 'autocode.umd.js', dest: 'assets/third-party/autocode' },
        { pkg: 'bwip-js', file: 'dist/bwip-js.js', dest: 'assets/third-party/bwip-js' },
    ];

    for (const pattern of umdPatterns) {
        const src = path.join(projectRoot, 'node_modules', pattern.pkg, pattern.file);
        if (fs.existsSync(src)) {
            targets.push({ src, dest: pattern.dest });
        }
    }

    return targets;
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

