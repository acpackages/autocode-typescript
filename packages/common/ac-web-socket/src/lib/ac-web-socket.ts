/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AnyEventHandler, EventHandler, MessageInterceptor } from './interfaces';
import { AcWsClient } from './ac-ws-client';

export class AcWebSocket {
  private _eventHandlers: Record<string, EventHandler[]> = {};
  private _anyEventHandlers: AnyEventHandler[] = [];
  private _ackCounter = 0;
  private _pendingAcks: Record<number, (data: any) => void> = {};

  private _incomingInterceptors: MessageInterceptor[] = [];
  private _outgoingInterceptors: MessageInterceptor[] = [];
  private _eventIncomingInterceptors: Record<string, MessageInterceptor[]> = {};
  private _eventOutgoingInterceptors: Record<string, MessageInterceptor[]> = {};

  public readonly id: string;
  public readonly nsp: string;
  public readonly handshake: Record<string, any>;
  public readonly server: any;

  constructor(private _webSocket: any, options: {
    id: string;
    nsp?: string;
    handshake?: Record<string, any>;
    server?: any;
  }) {
    this.id = options.id;
    this.nsp = options.nsp || '/';
    this.handshake = options.handshake || {};
    this.server = options.server;
    this._listen();
  }

  private _listen() {
    // Determine if it's a browser WebSocket or 'ws' package
    if (this._webSocket.on) {
      // Node 'ws' style
      this._webSocket.on('message', (data: any, isBinary: boolean) => this._handleRawData(data, isBinary));
      this._webSocket.on('close', () => this._handleEvent({ event: 'disconnect' }));
      this._webSocket.on('error', (err: any) => this._handleEvent({ event: 'disconnect', data: err }));
    } else {
      // Browser style
      this._webSocket.onmessage = (event: MessageEvent) => {
          const isBinary = event.data instanceof ArrayBuffer || event.data instanceof Blob;
          this._handleRawData(event.data, isBinary);
      };
      this._webSocket.onclose = () => this._handleEvent({ event: 'disconnect' });
      this._webSocket.onerror = (err: any) => this._handleEvent({ event: 'disconnect', data: err });
    }
  }

  private async _handleRawData(data: any, isBinary: boolean = false) {
    let rawData = data;
    if (isBinary) {
        let bytes: Uint8Array;
        if (data instanceof ArrayBuffer) {
            bytes = new Uint8Array(data);
        } else if (data instanceof Buffer || (typeof data === 'object' && data.constructor.name === 'Buffer')) {
            bytes = new Uint8Array(data);
        } else {
            bytes = data;
        }
        this._handleBinary({ data: bytes });
        return;
    }

    if (typeof data !== 'string') {
        if (data instanceof Buffer || (typeof data === 'object' && data.constructor.name === 'Buffer')) {
            rawData = data.toString();
        } else {
            rawData = data;
        }
    }

    try {
      const decoded = JSON.parse(rawData);
      const ackId = decoded.a;
      const nsp = decoded.n || '/';

      let callback: (({ response }: { response?: any }) => void) | undefined;
      if (ackId !== undefined) {
        callback = ({ response }) => {
          this._send({ map: { r: ackId, d: response, n: nsp } });
        };
      }

      let aborted = false;
      const abort = () => { aborted = true; };

      // 1. Global incoming interceptors
      for (const interceptor of this._incomingInterceptors) {
        await interceptor({ message: decoded, callback, abort });
        if (aborted) return;
      }

      // 2. Event-specific incoming interceptors
      const event = decoded.e;
      if (event) {
        const eventInterceptors = this._eventIncomingInterceptors[event];
        if (eventInterceptors) {
          for (const interceptor of eventInterceptors) {
            await interceptor({ message: decoded, callback, abort });
            if (aborted) return;
          }
        }
      }

      if (nsp !== this.nsp) return;

      const payload = decoded.d;
      const respId = decoded.r;

      if (respId !== undefined) {
        const resolver = this._pendingAcks[respId];
        if (resolver) {
          resolver(payload);
          delete this._pendingAcks[respId];
        }
        return;
      }

      if (event) {
        this._handleEvent({ event, data: payload, ackId });
      }
    } catch (e) {
      // Ignore errors
    }
  }

  private _handleBinary({ data }: { data: Uint8Array }) {
    this._handleEvent({ event: 'bin', data });
  }

  public on({ event, handler }: { event: string; handler: EventHandler }) {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
    }
    this._eventHandlers[event].push(handler);
  }

  public onAny({ handler }: { handler: AnyEventHandler }) {
    this._anyEventHandlers.push(handler);
  }

  public addIncomingInterceptor({ handler, event }: { handler: MessageInterceptor; event?: string }) {
    if (!event) {
      this._incomingInterceptors.push(handler);
    } else {
      if (!this._eventIncomingInterceptors[event]) {
        this._eventIncomingInterceptors[event] = [];
      }
      this._eventIncomingInterceptors[event].push(handler);
    }
  }

  public addOutgoingInterceptor({ handler, event }: { handler: MessageInterceptor; event?: string }) {
    if (!event) {
      this._outgoingInterceptors.push(handler);
    } else {
      if (!this._eventOutgoingInterceptors[event]) {
        this._eventOutgoingInterceptors[event] = [];
      }
      this._eventOutgoingInterceptors[event].push(handler);
    }
  }

  public pipe({ client }: { client: AcWsClient }) {
    this.onAny({
      handler: async ({ event, data, callback }) => {
        const socket = client.socket;
        if (socket) {
          const response = await socket.emit({ event, data });
          if (callback) {
            callback({ response });
          }
        }
      }
    });
  }

  private _handleEvent({ event, data, ackId }: { event: string; data?: any; ackId?: number }) {
    const handlers = this._eventHandlers[event];
    if (handlers) {
      for (const handler of handlers) {
        if (ackId !== undefined) {
          handler({
            data,
            callback: ({ response }) => {
              this._send({ map: { r: ackId, d: response, n: this.nsp } });
            }
          });
        } else {
          handler({ data });
        }
      }
    }

    for (const handler of this._anyEventHandlers) {
      if (ackId !== undefined) {
        handler({
          event,
          data,
          callback: ({ response }) => {
            this._send({ map: { r: ackId, d: response, n: this.nsp } });
          }
        });
      } else {
        handler({ event, data });
      }
    }
  }

  public get volatile(): AcWsVolatileSocket {
    return new AcWsVolatileSocket(this);
  }

  public emit({ event, data, volatile = false, callback }: {
    event: string;
    data?: any;
    volatile?: boolean;
    callback?: ({ response }: { response?: any }) => void;
  }): Promise<any> {
    const ackId = ++this._ackCounter;

    const promise = new Promise((resolve) => {
      this._pendingAcks[ackId] = resolve;

      // 30 second timeout
      setTimeout(() => {
        if (this._pendingAcks[ackId]) {
          delete this._pendingAcks[ackId];
          resolve(null);
        }
      }, 30000);
    });

    this._send({
      map: {
        e: event,
        d: data,
        a: ackId,
        n: this.nsp,
        ...(volatile ? { v: true } : {})
      }
    });

    if (callback) {
      promise.then((response) => callback({ response }));
    }

    return promise;
  }

  private async _send({ map }: { map: Record<string, any> }) {
    try {
      const message = map;
      let aborted = false;
      const abort = () => { aborted = true; };

      // 1. Global outgoing interceptors
      for (const interceptor of this._outgoingInterceptors) {
        await interceptor({ message, abort });
        if (aborted) return;
      }

      // 2. Event-specific outgoing interceptors
      const event = (message as any).e;
      if (event) {
        const eventInterceptors = this._eventOutgoingInterceptors[event];
        if (eventInterceptors) {
          for (const interceptor of eventInterceptors) {
            await interceptor({ message, abort });
            if (aborted) return;
          }
        }
      }

      if (this.isConnected) {
        this._webSocket.send(JSON.stringify(message));
      }
    } catch (e) {
      console.error('AcWebSocket: Error sending data:', e);
    }
  }

  public sendBinary({ bytes }: { bytes: Uint8Array | number[] }) {
    try {
      if (this.isConnected) {
        const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        this._webSocket.send(data);
      }
    } catch (e) {
      console.error('AcWebSocket: Error sending binary:', e);
    }
  }

  public join({ room }: { room: string }) {
    this.server?.of({ name: this.nsp }).joinRoom({ room, socket: this });
  }

  public leave({ room }: { room: string }) {
    this.server?.of({ name: this.nsp }).leaveRoom({ room, socket: this });
  }

  public disconnect() {
    if (this._webSocket.close) {
      this._webSocket.close();
    } else if (this._webSocket.terminate) {
      this._webSocket.terminate();
    }
  }

  public get isConnected(): boolean {
    // ws uses numeric states, browser uses numeric states. 1 is OPEN.
    return this._webSocket.readyState === 1;
  }
}

export class AcWsVolatileSocket {
  constructor(private _socket: AcWebSocket) { }
  public emit({ event, data }: { event: string; data?: any }) {
    this._socket.emit({ event, data, volatile: true });
  }
}
