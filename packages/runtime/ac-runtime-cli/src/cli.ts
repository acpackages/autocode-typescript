#!/usr/bin/env node
/**
 * cli.ts — AC Runtime CLI entry point
 *
 * Usage:
 *   acr serve [--port 3000] [--host] [--open]
 *   acr build [--outDir dist]
 */
import { loadConfig } from './config.js';
import { serve } from './serve.js';
import { build } from './build.js';

const args = process.argv.slice(2);
const command = args[0];

function getFlag(name: string): boolean {
    return args.includes(`--${name}`);
}

function getOption(name: string, defaultValue: string): string {
    const prefix = `--${name}=`;
    const arg = args.find(a => a.startsWith(prefix));
    if (arg) return arg.substring(prefix.length);
    const idx = args.indexOf(`--${name}`);
    if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
    return defaultValue;
}

if (!command || command === '--help' || command === '-h') {
    console.log(`
  AC Runtime CLI

  Usage:
    acr serve   Start dev server
    acr build   Create production build

  serve options:
    --port <n>  Port number (default: 3000)
    --host      Expose to network
    --open      Open browser on start

  build options:
    --outDir <dir>  Output directory (default: from ac-runtime.json or "dist")
  `);
    process.exit(0);
}

const config = loadConfig(process.cwd());

if (command === 'serve') {
    serve(config, {
        port: parseInt(getOption('port', '3000'), 10),
        host: getFlag('host'),
        open: getFlag('open'),
    });
} else if (command === 'build') {
    build(config, {
        outDir: getOption('outDir', config.buildDirectory),
    });
} else {
    console.error(`Unknown command: "${command}". Use "acr serve" or "acr build".`);
    process.exit(1);
}
