/**
 * @module dev-server
 *
 * Standalone development server for AC Runtime applications.
 *
 * Provides:
 * - File watching via chokidar (recompiles on `.ts`, `.html`, `.css` changes).
 * - Express-based HTTP server for compiled JavaScript and static assets.
 * - WebSocket-based live reload (notifies the browser to refresh).
 * - In-browser error overlay for compile errors.
 * - Persistent disk cache + in-memory cache for fast JS serving.
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { ComponentCompiler } from '../../ac-runtime-compiler/src/index.js';

/** Error details sent to the browser for the error overlay. */
interface CompileError {
  /** Human-readable error message. */
  message: string;
  /** Optional stack trace for debugging. */
  stack?: string;
  /** Absolute path to the file that caused the error. */
  file: string;
}

/** WebSocket message payload sent to connected browsers. */
interface BroadcastMessage {
  /** `'reload'` triggers `location.reload()`, `'error'` shows the overlay. */
  type: 'reload' | 'error';
  /** Present only when `type` is `'error'`. */
  error?: CompileError;
}

/** Configuration options for the dev server. */
interface DevServerOptions {
  /** HTTP server port. WebSocket uses `port + 1`. */
  port: number;
  /** Root directory to watch for file changes and serve static files from. */
  watchDir: string;
}

/**
 * Shared TypeScript compiler options for transpiling compiled TS to JS.
 * Defined once at module level to avoid re-creating per compilation.
 */
const TS_COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  removeComments: true,
  alwaysStrict: true,
};

/**
 * Express + WebSocket development server with live reload and
 * in-browser compilation error overlay.
 *
 * **Architecture:**
 * - `chokidar` watches the project directory for file changes.
 * - On change, the file is compiled via {@link ComponentCompiler}
 *   and transpiled to JS via `ts.transpileModule`.
 * - Compiled JS is stored in both an in-memory `Map` and a disk cache.
 * - A WebSocket message triggers the browser to reload.
 * - If compilation fails, an error overlay is shown in the browser.
 */
export class DevServer {
  /** AC Runtime compiler instance (reused across compilations). */
  private readonly compiler = new ComponentCompiler();

  /** Express application instance. */
  private readonly app = express();

  /** WebSocket server for live reload notifications. */
  private wss?: WebSocketServer;

  /** Disk cache directory path. */
  private readonly cacheDir: string;

  /** In-memory cache of compiled JS code (filename → JS string). */
  private readonly compiledCache = new Map<string, string>();

  /** Active compilation errors keyed by source file path. */
  private readonly errors = new Map<string, CompileError>();

  constructor(private readonly options: DevServerOptions) {
    this.cacheDir = path.join(this.options.watchDir, '.ac-runtime-cache');
  }

  /** Initialize the HTTP server, WebSocket server, and file watcher. */
  start(): void {
    const { watchDir, port } = this.options;

    fs.mkdirSync(this.cacheDir, { recursive: true });

    this.wss = new WebSocketServer({ port: port + 1 });
    console.log(`WebSocket Server for Live Reload running at ws://localhost:${port + 1}`);

    chokidar.watch(watchDir, {
      ignored: [/node_modules/, /\.d\.ts$/, /\.ac-runtime-cache/, /compiled\.(js|ts)$/],
      persistent: true,
    }).on('all', (_event, filePath) => {
      const ext = path.extname(filePath);
      if (ext === '.ts') {
        this.compileFile(filePath);
      } else if (ext === '.html' || ext === '.css') {
        // Re-compile co-located TypeScript files when template/style changes
        const dir = path.dirname(filePath);
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith('.ts') && !file.endsWith('.compiled.ts')) {
              this.compileFile(path.join(dir, file));
            }
          }
        } catch (err) {
          console.error(`[AC DevServer] Error reading directory ${dir}:`, err);
        }
      }
    });

    this.app.get('/', (_req, res) => {
      const indexPath = path.join(this.options.watchDir, 'index.html');
      let html: string;
      if (fs.existsSync(indexPath)) {
        html = fs.readFileSync(indexPath, 'utf8');
        html = this.injectDevTools(html);
      } else {
        html = this.generateFallbackHtml();
      }
      res.send(html);
    });

    this.app.get('/*.js', (req, res) => {
      const fileName = req.path.slice(1);
      const jsName = fileName.endsWith('.compiled.js')
        ? fileName
        : fileName.replace('.js', '.compiled.js');

      // Check in-memory cache first
      const cached = this.compiledCache.get(jsName);
      if (cached) {
        res.type('application/javascript').send(cached);
        return;
      }

      // Fallback to disk cache
      const diskPath = path.join(this.cacheDir, jsName);
      if (fs.existsSync(diskPath)) {
        const content = fs.readFileSync(diskPath, 'utf8');
        this.compiledCache.set(jsName, content);
        res.type('application/javascript').send(content);
        return;
      }

      // Fallback to static file
      const staticPath = path.join(this.options.watchDir, fileName);
      if (fs.existsSync(staticPath)) {
        res.sendFile(staticPath);
      } else {
        res.status(404).send('Not found');
      }
    });

    this.app.use(express.static(this.options.watchDir));

    this.app.listen(port, () => {
      console.log(`\x1b[32m\nAC Dev Server running at http://localhost:${port}\x1b[0m`);
      console.log(`Watching directory: ${this.options.watchDir}`);
      console.log(`Persistent cache: ${this.cacheDir}\n`);
    });
  }

  /**
   * Compile a single TypeScript file, transpile to JS, and cache the result.
   * Broadcasts a `'reload'` message on success or `'error'` on failure.
   *
   * @param filePath - Absolute path to the `.ts` file.
   */
  private compileFile(filePath: string): void {
    try {
      console.log(`Compiling ${path.basename(filePath)}...`);
      const content = fs.readFileSync(filePath, 'utf8');
      const results = this.compiler.compile(content, filePath);

      this.errors.delete(filePath);
      for (const res of results) {
        if (!res.selector) continue;

        const tsName = `${res.selector}.compiled.ts`;
        const jsName = `${res.selector}.compiled.js`;

        // 1. Save the TypeScript output for the user
        fs.writeFileSync(path.join(this.cacheDir, tsName), res.code);

        // 2. Transpile to JS for the browser
        const jsOutput = ts.transpileModule(res.code, {
          compilerOptions: TS_COMPILER_OPTIONS,
        });

        this.compiledCache.set(jsName, jsOutput.outputText);
        fs.writeFileSync(path.join(this.cacheDir, jsName), jsOutput.outputText);
      }

      this.broadcast({ type: 'reload' });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`\x1b[31mError compiling ${filePath}:\x1b[0m`, error.message);
      const compileError: CompileError = { message: error.message, stack: error.stack, file: filePath };
      this.errors.set(filePath, compileError);
      this.broadcast({ type: 'error', error: compileError });
    }
  }

  /**
   * Send a message to all connected WebSocket clients.
   * Serializes the payload once and sends the same string to each client.
   *
   * @param data - The message payload.
   */
  private broadcast(data: BroadcastMessage): void {
    if (!this.wss) return;
    const payload = JSON.stringify(data);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  /**
   * Inject the dev tools overlay and live reload script into an HTML page.
   * Adds: error overlay CSS, WebSocket client script, compiled JS script tags.
   *
   * @param html - The base HTML string.
   * @returns HTML with dev tools injected before `</body>`.
   */
  private injectDevTools(html: string): string {
    const wsPort = this.options.port + 1;
    const scriptNames = new Set<string>();
    if (fs.existsSync(this.cacheDir)) {
      for (const file of fs.readdirSync(this.cacheDir)) {
        if (file.endsWith('.compiled.js')) scriptNames.add(file);
      }
    }
    for (const key of this.compiledCache.keys()) {
      scriptNames.add(key);
    }

    const scripts = Array.from(scriptNames)
      .map(name => `<script src="/${name}"></script>`)
      .join('\n    ');

    const devScript = `
    <!-- AC Dev Tools -->
    <style>
        #error-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); color: #ff5555; padding: 40px;
            display: none; z-index: 99999; overflow: auto; font-family: monospace;
        }
        .error-card { background: #1e1e1e; padding: 30px; border-radius: 12px; border-left: 8px solid #ff5555; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        pre { background: #2d2d2d; padding: 20px; border-radius: 6px; color: #ffb86c; overflow-x: auto; white-space: pre-wrap; font-size: 14px; line-height: 1.5; }
        h1 { margin-top: 0; color: #ff5555; }
        .file-path { color: #8be9fd; margin-bottom: 10px; font-weight: bold; }
    </style>
    <div id="error-overlay">
        <div class="error-card">
            <h1>Compilation Error</h1>
            <div id="error-file" class="file-path"></div>
            <pre id="error-message"></pre>
        </div>
    </div>
    <script>
        const ws = new WebSocket('ws://' + location.hostname + ':${wsPort}');
        const overlay = document.getElementById('error-overlay');
        const errFile = document.getElementById('error-file');
        const errMsg = document.getElementById('error-message');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
                location.reload();
            } else if (data.type === 'error') {
                overlay.style.display = 'block';
                errFile.innerText = data.error.file;
                errMsg.innerText = data.error.message + '\\n\\n' + data.error.stack;
            }
        };
        ws.onopen = () => console.log('✅ Connected to AC Dev Server');
    </script>
    ${scripts}
    <!-- End AC Dev Tools -->
    `;
    return html.replace('</body>', `${devScript}</body>`);
  }

  /** Generate a minimal HTML page when no `index.html` exists in the watch directory. */
  private generateFallbackHtml(): string {
    return this.injectDevTools(`
<!DOCTYPE html>
<html>
<head><title>AC Dev Server</title></head>
<body>
    <h1>AC Runtime Development</h1>
    <div id="app"></div>
</body>
</html>`);
  }
}
