/**
 * serve.ts — Start the Vite dev server
 *
 * One function: serve(). Creates a Vite dev server from
 * the runtime config and starts listening.
 */
import { createViteConfig } from './vite-config.js';
import { importVite } from './vite-config.js';
import type { AcRuntimeConfig } from './config.js';
import type { ServeOptions } from './vite-config.js';

export async function serve(config: AcRuntimeConfig, options: ServeOptions): Promise<void> {
    console.log(`\n  AC Runtime Dev Server`);
    console.log(`  Project: ${config.name} v${config.version}`);
    console.log(`  Entry: ${config.entryFile}`);

    const vite = await importVite(config.projectRoot);
    const viteConfig = createViteConfig(config, 'serve', options);
    const server = await vite.createServer(viteConfig);
    await server.listen();
    server.printUrls();
}
