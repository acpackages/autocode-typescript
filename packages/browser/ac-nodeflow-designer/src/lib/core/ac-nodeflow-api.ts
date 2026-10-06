import { AcEvents, AcHooks } from '@autocode-ts/autocode';
import { AcNode } from '../models/ac-node.model';
import { AcConnection } from '../models/ac-connection.model';
import {
  AcNodeflowReteApi,
  ConnectionValidator,
  CustomNodeRenderer,
} from './ac-nodeflow-rete-api';
import { AcEnumNodeflowEvent } from '../enums/ac-enum-nodeflow-event.enum';

export interface INodeflowDesignerMetadata {
  nodePositions: Record<string, { x: number; y: number }>;
  zoom?: number;
  viewport?: { x: number; y: number };
}

export class AcNodeflowApi {
  events: AcEvents = new AcEvents();
  hooks: AcHooks = new AcHooks();

  reteApi?: AcNodeflowReteApi;
  designerInstance?: any;

  constructor({ designerInstance }: { designerInstance?: any } = {}) {
    this.designerInstance = designerInstance;
  }

  initRete({ container }: { container: HTMLElement }): void {
    this.reteApi = new AcNodeflowReteApi({ container });

    // Listen to node editor events and forward to AcEvents
    this.reteApi.editor.addPipe((context) => {
      if (!context || typeof context !== 'object' || !('type' in context)) {
        return context;
      }

      if (context.type === 'nodecreated') {
        const node = (context as any).data;
        this.events.execute({
          event: AcEnumNodeflowEvent.NodeCreated,
          args: { node },
        });
      } else if (context.type === 'noderemoved') {
        const node = (context as any).data;
        this.events.execute({
          event: AcEnumNodeflowEvent.NodeRemoved,
          args: { node },
        });
      } else if (context.type === 'connectioncreated') {
        const connection = (context as any).data;
        this.events.execute({
          event: AcEnumNodeflowEvent.ConnectionCreated,
          args: { connection },
        });
      } else if (context.type === 'connectionremoved') {
        const connection = (context as any).data;
        this.events.execute({
          event: AcEnumNodeflowEvent.ConnectionRemoved,
          args: { connection },
        });
      }

      return context;
    });
  }

  async addNode({
    node,
    position,
  }: {
    node: AcNode;
    position?: { x: number; y: number };
  }): Promise<void> {
    if (!this.reteApi) return;
    await this.reteApi.editor.addNode(node);
    if (position) {
      await this.reteApi.areaPlugin.translate(node.id, position);
    }
  }

  async removeNode({ nodeId }: { nodeId: string }): Promise<void> {
    if (!this.reteApi) return;
    // Remove all connections touching this node first
    const connections = this.reteApi.editor
      .getConnections()
      .filter((c) => c.source === nodeId || c.target === nodeId);
    for (const conn of connections) {
      await this.reteApi.editor.removeConnection(conn.id);
    }
    await this.reteApi.editor.removeNode(nodeId);
  }

  getNode({ nodeId }: { nodeId: string }): AcNode | undefined {
    return this.reteApi?.editor.getNode(nodeId);
  }

  getNodes(): AcNode[] {
    return this.reteApi?.editor.getNodes() ?? [];
  }

  async addConnection({
    connection,
  }: {
    connection: AcConnection;
  }): Promise<void> {
    if (!this.reteApi) return;
    await this.reteApi.editor.addConnection(connection);
  }

  async removeConnection({
    connectionId,
  }: {
    connectionId: string;
  }): Promise<void> {
    if (!this.reteApi) return;
    await this.reteApi.editor.removeConnection(connectionId);
  }

  getConnections(): AcConnection[] {
    return this.reteApi?.editor.getConnections() ?? [];
  }

  async clear(): Promise<void> {
    if (!this.reteApi) return;
    await this.reteApi.editor.clear();
  }

  async autoArrange(): Promise<void> {
    if (!this.reteApi) return;
    await this.reteApi.autoLayout();
  }

  async zoomAt({ nodes }: { nodes?: AcNode[] } = {}): Promise<void> {
    if (!this.reteApi) return;
    await this.reteApi.zoomAtNodes(nodes);
  }

  setCustomNodeRenderer({ renderer }: { renderer: CustomNodeRenderer }): void {
    if (this.reteApi) {
      this.reteApi.customNodeRenderer = renderer;
    }
  }

  setConnectionValidator({
    validator,
  }: {
    validator: ConnectionValidator;
  }): void {
    if (this.reteApi) {
      this.reteApi.connectionValidator = validator;
    }
  }

  on({ event, callback }: { event: string; callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

  getPositions(): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    if (!this.reteApi) return positions;

    for (const node of this.reteApi.editor.getNodes()) {
      const view = this.reteApi.areaPlugin.nodeViews.get(node.id);
      if (view) {
        positions[node.id] = { x: view.position.x, y: view.position.y };
      }
    }
    return positions;
  }

  async setPositions({
    positions,
  }: {
    positions: Record<string, { x: number; y: number }>;
  }): Promise<void> {
    if (!this.reteApi) return;
    for (const [nodeId, pos] of Object.entries(positions)) {
      if (this.reteApi.editor.getNode(nodeId)) {
        await this.reteApi.areaPlugin.translate(nodeId, pos);
      }
    }
  }

  getJson(): INodeflowDesignerMetadata {
    return {
      nodePositions: this.getPositions(),
      zoom: this.reteApi?.areaPlugin.area.transform.k,
      viewport: this.reteApi
        ? {
            x: this.reteApi.areaPlugin.area.transform.x,
            y: this.reteApi.areaPlugin.area.transform.y,
          }
        : undefined,
    };
  }

  async setJson({ json }: { json: INodeflowDesignerMetadata }): Promise<void> {
    if (json.nodePositions) {
      await this.setPositions({ positions: json.nodePositions });
    }
  }

  destroy(): void {
    this.reteApi?.destroy();
  }
}
