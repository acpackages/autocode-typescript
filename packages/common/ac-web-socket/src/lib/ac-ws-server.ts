import { AcWebSocket } from './ac-web-socket';
import { AcWsNamespace } from './ac-ws-namespace';

export type MiddlewareHandler = ({ socket, next }: { socket: AcWebSocket; next: (error?: any) => void }) => void;

export class AcWsServer {
  private _namespaces: Record<string, AcWsNamespace> = {};
  public port = 0;
  public sslPort = 0;
  public sslCertificateChainPath = "";
  public sslPrivateKeyPath = "";

  private _httpServer: any;
  private _wss: any;

  constructor() {
    this._namespaces['/'] = new AcWsNamespace('/', this);
  }

  public of({ name }: { name: string }): AcWsNamespace {
    if (!this._namespaces[name]) {
      this._namespaces[name] = new AcWsNamespace(name, this);
    }
    return this._namespaces[name];
  }

  public onConnection({ handler }: { handler: (options: { socket: AcWebSocket }) => void }) {
    this.of({ name: '/' }).onConnection({ handler });
  }

  public onDisconnect({ handler }: { handler: (options: { socket: AcWebSocket }) => void }) {
    this.of({ name: '/' }).onDisconnect({ handler });
  }

  public async start({ port }: { port?: number } = {}) {
    if (port !== undefined) this.port = port;

    // Use dynamic imports for node-only modules to avoid issues in browser bundles
    try {
      const http = await import('http');
      const { WebSocketServer } = await import('ws');

      this._httpServer = http.createServer((req, res) => {
        res.writeHead(404);
        res.end();
      });

      this._wss = new WebSocketServer({ server: this._httpServer });

      this._wss.on('connection', (ws: any, req: any) => {
        this._handleConnection(ws, req);
      });

      return new Promise<void>((resolve) => {
        this._httpServer.listen(this.port, () => {
          this.port = (this._httpServer.address() as any).port;
          resolve();
        });
      });
    } catch (e) {
      console.error('AcWsServer: Failed to start server. Are you in a Node environment?', e);
      throw e;
    }
  }

  private _handleConnection(ws: any, req: any) {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const nspName = url.searchParams.get('nsp') || '/';
    
    const handshake = {
      headers: req.headers,
      query: Object.fromEntries(url.searchParams.entries()),
      address: req.socket.remoteAddress,
    };

    const socketId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
    const socket = new AcWebSocket(ws, {
      id: socketId,
      nsp: nspName,
      handshake,
      server: this
    });

    this.of({ name: nspName })._addSocket({ socket });
  }

  public _handleDisconnect({ socket }: { socket: AcWebSocket }) {
    for (const nsp of Object.values(this._namespaces)) {
      nsp._removeSocket(socket);
    }
  }

  public emit({ event, data }: { event: string; data?: any }) {
    this.of({ name: '/' }).emit({ event, data });
  }

  public async stop() {
    if (this._wss) {
      this._wss.close();
    }
    if (this._httpServer) {
      await new Promise<void>((resolve) => this._httpServer.close(() => resolve()));
    }
    for (const nsp of Object.values(this._namespaces)) {
        for (const socket of nsp.sockets) {
            socket.disconnect();
        }
        nsp.sockets.clear();
        for (const roomName in nsp.rooms) {
            delete nsp.rooms[roomName];
        }
    }
  }
}
