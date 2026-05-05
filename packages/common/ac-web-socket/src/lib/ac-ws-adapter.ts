import { AcWebSocket } from './ac-web-socket';
import { AcWsNamespace } from './ac-ws-namespace';

export abstract class AcWsAdapter {
  constructor(public readonly nsp: AcWsNamespace) { }

  abstract broadcast({ event, data, room, except }: { event: string; data?: any; room?: string; except?: Set<string> }): void;
  abstract add({ id, room }: { id: string; room: string }): void;
  abstract del({ id, room }: { id: string; room: string }): void;
  abstract delAll({ id }: { id: string }): void;
}

export class AcWsDefaultAdapter extends AcWsAdapter {
  constructor(nsp: AcWsNamespace) {
    super(nsp);
  }

  override broadcast({ event, data, room, except }: { event: string; data?: any; room?: string; except?: Set<string> }): void {
    let sockets: Set<AcWebSocket> | undefined;
    if (room) {
      sockets = this.nsp.rooms[room];
    } else {
      sockets = this.nsp.sockets;
    }

    if (sockets) {
      for (const socket of sockets) {
        if (except && except.has(socket.id)) continue;
        socket.emit({ event, data });
      }
    }
  }

  override add({ id, room }: { id: string; room: string }): void {
    // Basic implementation stores rooms in the namespace itself
  }

  override del({ id, room }: { id: string; room: string }): void {
    // Basic implementation stores rooms in the namespace itself
  }

  override delAll({ id }: { id: string }): void {
    // Basic implementation stores rooms in the namespace itself
  }
}
