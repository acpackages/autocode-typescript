/**
 * @module ac-runtime-dev
 *
 * Public API for the AC Runtime development tooling package.
 *
 * Exports:
 * - {@link DevServer} — Standalone Express-based development server with
 *   file watching, live reload (WebSocket), and error overlay.
 * - {@link acRuntimePlugin} — Vite plugin that integrates AC Runtime
 *   compilation into the Vite dev server and build pipeline.
 *
 * @example
 * ```ts
 * // Vite integration
 * import { acRuntimePlugin } from '@autocode-ts/ac-runtime-dev';
 * export default defineConfig({ plugins: [acRuntimePlugin()] });
 *
 * // Standalone dev server
 * import { DevServer } from '@autocode-ts/ac-runtime-dev';
 * const server = new DevServer({ port: 3000, watchDir: './src' });
 * server.start();
 * ```
 */
export * from './dev-server.js';
export * from './vite-plugin.js';
