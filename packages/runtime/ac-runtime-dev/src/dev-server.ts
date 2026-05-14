import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { ComponentCompiler } from '../../ac-runtime-compiler/src/index.js';

export class DevServer {
  private compiler = new ComponentCompiler();
  private app = express();
  private wss?: WebSocketServer;
  private cacheDir: string;
  private compiledCache = new Map<string, string>();
  private errors = new Map<string, any>();

  constructor(private options: { port: number; watchDir: string }) {
      this.cacheDir = path.join(this.options.watchDir, '.ac-runtime-cache');
  }

  start() {
    const { watchDir, port } = this.options;

    if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    this.wss = new WebSocketServer({ port: port + 1 });
    console.log(`WebSocket Server for Live Reload running at ws://localhost:${port + 1}`);

    // Watch TS, HTML, and CSS files
    chokidar.watch(watchDir, { 
        ignored: [/node_modules/, /\.d\.ts$/, /\.ac-runtime-cache/, /compiled\.js$/],
        persistent: true 
    }).on('all', (event, filePath) => {
      const ext = path.extname(filePath);
      if (ext === '.ts') {
        this.compileFile(filePath);
      } else if (ext === '.html' || ext === '.css') {
          // If HTML/CSS changes, we need to find the TS file that uses it and recompile it.
          // For now, we'll just recompile all TS files in the same directory.
          const dir = path.dirname(filePath);
          fs.readdirSync(dir).forEach(file => {
              if (file.endsWith('.ts')) {
                  this.compileFile(path.join(dir, file));
              }
          });
      }
    });

    this.app.get('/', (req, res) => {
      const indexPath = path.join(this.options.watchDir, 'index.html');
      let html = '';
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
        const jsName = fileName.endsWith('.compiled.js') ? fileName : fileName.replace('.js', '.compiled.js');
        
        if (this.compiledCache.has(jsName)) {
            res.type('application/javascript').send(this.compiledCache.get(jsName));
            return;
        }

        const diskPath = path.join(this.cacheDir, jsName);
        if (fs.existsSync(diskPath)) {
            const content = fs.readFileSync(diskPath, 'utf8');
            this.compiledCache.set(jsName, content);
            res.type('application/javascript').send(content);
            return;
        }

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

  private compileFile(filePath: string) {
    try {
      console.log(`Compiling ${path.basename(filePath)}...`);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Pass the filePath so the compiler can resolve templateUrl and styleUrls
      const results = this.compiler.compile(content, filePath);
      
      this.errors.delete(filePath);
      results.forEach(res => {
          const outName = `${res.selector}.compiled.js`;
          this.compiledCache.set(outName, res.code);
          fs.writeFileSync(path.join(this.cacheDir, outName), res.code);
      });

      this.broadcast({ type: 'reload' });
    } catch (err: any) {
      console.error(`\x1b[31mError compiling ${filePath}:\x1b[0m`, err.message);
      this.errors.set(filePath, { message: err.message, stack: err.stack, file: filePath });
      this.broadcast({ type: 'error', error: { message: err.message, file: filePath, stack: err.stack } });
    }
  }

  private broadcast(data: any) {
      this.wss?.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
          }
      });
  }

  private injectDevTools(html: string) {
      const wsPort = this.options.port + 1;
      const scriptNames = new Set(this.compiledCache.keys());
      if (fs.existsSync(this.cacheDir)) {
          fs.readdirSync(this.cacheDir).forEach(file => {
              if (file.endsWith('.compiled.js')) scriptNames.add(file);
          });
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

  private generateFallbackHtml() {
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
