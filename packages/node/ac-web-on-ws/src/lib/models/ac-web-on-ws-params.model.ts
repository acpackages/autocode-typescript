import { AcWebSocket } from '@autocode-ts/ac-web-socket';

export class AcWebOnWsParams {
  public socket: AcWebSocket;

  constructor({ socket }: { socket: AcWebSocket }) {
    this.socket = socket;
  }
}
