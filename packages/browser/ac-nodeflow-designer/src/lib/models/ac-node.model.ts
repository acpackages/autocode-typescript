import { ClassicPreset } from 'rete';
import { AcSocket } from './ac-socket.model';

export class AcNode extends ClassicPreset.Node {
  data?: any;
  customElement?: HTMLElement;
  width = 220;
  height = 160;

  constructor(label: string, data?: any) {
    super(label);
    this.data = data;
  }

  addSocketPort({
    key,
    socket,
    side = 'both',
  }: {
    key: string;
    socket: AcSocket;
    side?: 'input' | 'output' | 'both';
  }): void {
    if (side === 'input' || side === 'both') {
      this.addInput(key, new ClassicPreset.Input(socket));
    }
    if (side === 'output' || side === 'both') {
      this.addOutput(key, new ClassicPreset.Output(socket));
    }
  }

  removeSocketPort(key: string): void {
    if (this.inputs[key]) {
      this.removeInput(key);
    }
    if (this.outputs[key]) {
      this.removeOutput(key);
    }
  }
}
