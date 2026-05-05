import { AcWebSocket } from './ac-web-socket';
import { AcWsAdapter, AcWsDefaultAdapter } from './ac-ws-adapter';
import { AcWsServer, MiddlewareHandler } from './ac-ws-server';
import { AcWsRoomNamespace } from './ac-ws-room-namespace';

export class AcWsNamespace {
  private _rooms: Record<string, Set<AcWebSocket>> = {};
  private _sockets: Set<AcWebSocket> = new Set();
  public adapter: AcWsAdapter;
  private _middlewares: MiddlewareHandler[] = [];
  private _connectionHandlers: Record<string, ((options: { socket: AcWebSocket }) => void)[]> = {};

  constructor(public readonly name: string, public readonly server: AcWsServer) {
    this.adapter = new AcWsDefaultAdapter(this);
  }

  public use({ handler }: { handler: MiddlewareHandler }) {
    this._middlewares.push(handler);
  }

  public onConnection({ handler }: { handler: (options: { socket: AcWebSocket }) => void }) {
    if (!this._connectionHandlers['connection']) {
      this._connectionHandlers['connection'] = [];
    }
    this._connectionHandlers['connection'].push(handler);
  }

  public onDisconnect({ handler }: { handler: (options: { socket: AcWebSocket }) => void }) {
    if (!this._connectionHandlers['disconnect']) {
      this._connectionHandlers['disconnect'] = [];
    }
    this._connectionHandlers['disconnect'].push(handler);
  }

  public _addSocket({ socket }: { socket: AcWebSocket }) {
    this._runMiddlewares({
      socket,
      index: 0,
      done: () => {
        this._sockets.add(socket);

        socket.on({
          event: 'disconnect',
          handler: () => {
            this.server._handleDisconnect({ socket });
          }
        });

        const handlers = this._connectionHandlers['connection'];
        if (handlers) {
          for (const handler of handlers) {
            handler({ socket });
          }
        }
      }
    });
  }

  private _runMiddlewares({ socket, index, done }: { socket: AcWebSocket; index: number; done: () => void }) {
    if (index >= this._middlewares.length) {
      done();
      return;
    }
    this._middlewares[index]({
      socket,
      next: (error?: any) => {
        if (error) {
          socket.disconnect();
          return;
        }
        this._runMiddlewares({ socket, index: index + 1, done });
      }
    });
  }

  public emit({ event, data }: { event: string; data?: any }) {
    this.adapter.broadcast({ event, data });
  }

  public joinRoom({ room, socket }: { room: string; socket: AcWebSocket }) {
    if (!this._rooms[room]) {
      this._rooms[room] = new Set();
    }
    this._rooms[room].add(socket);
  }

  public leaveRoom({ room, socket }: { room: string; socket: AcWebSocket }) {
    if (this._rooms[room]) {
      this._rooms[room].delete(socket);
    }
  }

  public to({ room }: { room: string }): AcWsRoomNamespace {
    return new AcWsRoomNamespace({ nsp: this, room });
  }

  public get rooms(): Record<string, Set<AcWebSocket>> {
    return this._rooms;
  }

  public get sockets(): Set<AcWebSocket> {
    return this._sockets;
  }
  
  public _removeSocket(socket: AcWebSocket): boolean {
      if (this._sockets.delete(socket)) {
          for (const roomSockets of Object.values(this._rooms)) {
              roomSockets.delete(socket);
          }
          const handlers = this._connectionHandlers['disconnect'];
          if (handlers) {
              for (const handler of handlers) {
                  handler({ socket });
              }
          }
          return true;
      }
      return false;
  }
}
