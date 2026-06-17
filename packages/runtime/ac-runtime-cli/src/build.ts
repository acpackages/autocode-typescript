/**
 * build.ts — Run a production build via Vite
 *
 * One function: build(). Creates a Vite build config from
 * the runtime config and runs the build.
 */
import { createViteConfig } from './vite-config.js';
import { importVite } from './vite-config.js';
import type { AcRuntimeConfig } from './config.js';
import type { BuildOptions } from './vite-config.js';

export async function build(config: AcRuntimeConfig, options: BuildOptions): Promise<void> {
    console.log(`\n  AC Runtime Build`);
    console.log(`  Project: ${config.name} v${config.version}`);
    console.log(`  Output: ${options.outDir || config.buildDirectory}`);

    const vite = await importVite(config.projectRoot);
    const viteConfig = createViteConfig(config, 'build', options);
    await vite.build(viteConfig);
}
