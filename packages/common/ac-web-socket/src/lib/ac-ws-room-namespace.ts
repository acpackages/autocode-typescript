import { AcWsNamespace } from './ac-ws-namespace';

export class AcWsRoomNamespace {
  public readonly nsp: AcWsNamespace;
  public readonly room: string;

  constructor({ nsp, room }: { nsp: AcWsNamespace; room: string }) {
    this.nsp = nsp;
    this.room = room;
  }

  public emit({ event, data }: { event: string; data?: any }) {
    this.nsp.adapter.broadcast({ event, data, room: this.room });
  }
}
