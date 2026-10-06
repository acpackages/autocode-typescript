import { ClassicPreset } from 'rete';

export type AcSocketSide = 'input' | 'output' | 'both';

export class AcSocket extends ClassicPreset.Socket {
  side: AcSocketSide;
  data?: any;

  constructor(name: string, side: AcSocketSide = 'both', data?: any) {
    super(name);
    this.side = side;
    this.data = data;
  }
}
