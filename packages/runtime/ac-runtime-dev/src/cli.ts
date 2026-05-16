/**
 * @module dev-cli
 *
 * Command-line entry point for the AC Runtime development server.
 *
 * Starts an Express HTTP server with file watching, automatic
 * recompilation, and WebSocket-based live reload.
 *
 * **Usage:**
 * ```bash
 * npx ac-dev-server [watch-dir] [port]
 * ```
 *
 * **Arguments:**
 * - `watch-dir` — Directory to watch for file changes (default: `process.cwd()`).
 * - `port` — HTTP server port (default: `3000`). WebSocket uses `port + 1`.
 *
 * **Example:**
 * ```bash
 * npx ac-dev-server ./src 4000
 * # HTTP server at http://localhost:4000
 * # WebSocket at ws://localhost:4001
 * ```
 */
import { DevServer } from './dev-server.js';
import * as path from 'path';

const watchDir = process.argv[2] || process.cwd();
const port = parseInt(process.argv[3] || '3000');

const server = new DevServer({
  port,
  watchDir: path.resolve(watchDir)
});

server.start();
