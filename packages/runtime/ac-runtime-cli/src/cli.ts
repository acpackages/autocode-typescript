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
    if (idx >= 0 && idx + 1 < args.length && !args[idx + 1].startsWith('--')) return args[idx + 1];
    return defaultValue;
}

function getHostOption(): boolean | string {
    const prefix = '--host=';
    const arg = args.find(a => a.startsWith(prefix));
    if (arg) {
        const val = arg.substring(prefix.length);
        if (val === 'true' || val === '') return true;
        if (val === 'false') return false;
        return val;
    }
    const idx = args.indexOf('--host');
    if (idx >= 0) {
        if (idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
            return args[idx + 1];
        }
        return true;
    }
    // Default: bind to localhost only. Pass --host or --host=0.0.0.0 to expose to the network.
    return false;
}

if (!command || command === '--help' || command === '-h') {
    console.log(`
  AC Runtime CLI

  Usage:
    acr serve   Start dev server
    acr build   Create production build

  serve options:
    --port <n>  Port number (default: 3000)
    --host      Expose to network (IP address and localhost)
    --open      Open browser on start

  build options:
    --outDir <dir>  Output directory (default: from ac-runtime.json or "dist")
  `);
    process.exit(0);
}

const config = loadConfig(process.cwd());

if (command === 'serve') {
    const portStr = getOption('port', '3000');
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
        console.error(`ERROR: Invalid port "${portStr}". Must be a number between 1 and 65535.`);
        process.exit(1);
    }
    serve(config, {
        port,
        host: getHostOption(),
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
