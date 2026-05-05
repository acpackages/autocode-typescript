import { AcWebSocket } from './ac-web-socket';

export class AcWsClient {
  public readonly url: string;
  public readonly nsp: string;
  public readonly query: Record<string, string>;
  public readonly options: { rejectUnauthorized?: boolean };

  private _socket: AcWebSocket | null = null;
  private _shouldReconnect = true;
  private _reconnectTimer: any = null;

  private _connectionHandlers: ((options: { socket: AcWebSocket }) => void)[] = [];
  private _disconnectHandlers: ((options: { data?: any }) => void)[] = [];

  constructor({ url, nsp = '/', query = {}, options = {} }: {
    url: string;
    nsp?: string;
    query?: Record<string, string>;
    options?: { rejectUnauthorized?: boolean };
  }) {
    this.url = url;
    this.nsp = nsp;
    this.query = query;
    this.options = options;
  }

  public async connect(): Promise<AcWebSocket | null> {
    this._shouldReconnect = true;

    let wsUrl = this.url;
    if (wsUrl.startsWith('https://')) {
      wsUrl = 'wss://' + wsUrl.substring(8);
    } else if (wsUrl.startsWith('http://')) {
      wsUrl = 'ws://' + wsUrl.substring(7);
    }

    const urlObj = new URL(wsUrl);
    Object.entries(this.query).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    urlObj.searchParams.set('nsp', this.nsp);

    return new Promise((resolve, reject) => {
      try {
        let ws: any;
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
          // Browser
          ws = new WebSocket(urlObj.toString());
        } else {
          // Node
          const WsWebSocket = require('ws');
          ws = new WsWebSocket(urlObj.toString(), {
            rejectUnauthorized: this.options.rejectUnauthorized
          } as any);
        }

        ws.onopen = () => {
          this._socket = new AcWebSocket(ws, { id: 'client', nsp: this.nsp });
          this._setupSocketHandlers();
          resolve(this._socket);
        };

        // For Node 'ws' which uses EventEmitter style
        if (ws.on) {
          ws.on('open', () => {
            this._socket = new AcWebSocket(ws, { id: 'client', nsp: this.nsp });
            this._setupSocketHandlers();
            resolve(this._socket);
          });
          ws.on('error', (err: any) => {
            this._handleDisconnect();
            reject(err);
          });
        } else {
          ws.onerror = (err: any) => {
            this._handleDisconnect();
            reject(err);
          };
        }
      } catch (e) {
        console.error('AcWsClient: Connection error:', e);
        this._handleDisconnect();
        reject(e);
      }
    });
  }

  private _setupSocketHandlers() {
    if (!this._socket) return;
    
    this._socket.on({
      event: 'disconnect',
      handler: ({ data }) => {
        for (const h of this._disconnectHandlers) {
          h({ data });
        }
        this._handleDisconnect();
      }
    });

    for (const h of this._connectionHandlers) {
      h({ socket: this._socket! });
    }
  }

  private _handleDisconnect() {
    this._socket = null;
    if (this._shouldReconnect && this._reconnectTimer === null) {
      this._reconnectTimer = setTimeout(() => {
        this._reconnectTimer = null;
        this.connect();
      }, 2000);
    }
  }

  public onConnection({ handler }: { handler: (options: { socket: AcWebSocket }) => void }) {
    this._connectionHandlers.push(handler);
    if (this._socket) {
      handler({ socket: this._socket });
    }
  }

  public onDisconnect({ handler }: { handler: (options: { data?: any }) => void }) {
    this._disconnectHandlers.push(handler);
  }

  public get volatile(): AcWsVolatileClient {
    return new AcWsVolatileClient(this);
  }

  public async disconnect() {
    this._shouldReconnect = false;
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
  }

  public get socket(): AcWebSocket | null {
    return this._socket;
  }

  public get isConnected(): boolean {
    return this._socket?.isConnected || false;
  }
}

export class AcWsVolatileClient {
  constructor(private _client: AcWsClient) { }
  public emit({ event, data }: { event: string; data?: any }) {
    this._client.socket?.emit({ event, data, volatile: true });
  }
}
