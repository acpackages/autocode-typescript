import { ClassicPreset } from 'rete';
import { AcNode } from './ac-node.model';

export class AcConnection extends ClassicPreset.Connection<AcNode, AcNode> {
  static readonly KeyConnectionId = 'connectionId';
  static readonly KeyDestinationNodeId = 'destinationNodeId';
  static readonly KeySourceNodeId = 'sourceNodeId';

  data?: any;

  constructor(
    source: AcNode,
    sourceOutput: string,
    target: AcNode,
    targetInput: string,
    data?: any
  ) {
    super(source, sourceOutput, target, targetInput);
    this.data = data;
  }

  get isLoop(): boolean {
    return this.source === this.target;
  }
}
