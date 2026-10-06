import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import {
  AcNodeflowDesignerElement,
  AcNode,
  AcSocket,
  AcConnection
} from '@autocode-ts/ac-nodeflow-designer';
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'nodeflow-designer-page',
  template: `
    <div class="app-page h-100 overflow-hidden d-flex flex-column">
      <app-header
        [title]="'Nodeflow Designer'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-hidden position-relative">
        <ac-nodeflow-designer #designer class="h-100 w-100 d-block"></ac-nodeflow-designer>
      </div>
    </div>
  `
})
export class NodeflowDesignerPage {
  @AcViewChild('#designer') designer!: AcNodeflowDesignerElement;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Canvas Actions', isHeader: true },
    { label: 'Auto Layout', callback: () => this.autoLayout() },
    { label: 'Zoom to Fit', callback: () => this.zoomToFit() },
    { label: 'Add Sample Node', callback: () => this.addSampleNode() },
    { label: 'Reset Sample Graph', callback: () => this.loadSampleGraph() }
  ];

  acOnInit() {
    this.designer.addEventListener('nodeflowInit', () => {
      this.loadSampleGraph();
    });
  }

  async autoLayout() {
    if (this.designer?.api) {
      await this.designer.api.autoArrange();
      await this.designer.api.zoomAt();
    }
  }

  async zoomToFit() {
    if (this.designer?.api) {
      await this.designer.api.zoomAt();
    }
  }

  async addSampleNode() {
    if (!this.designer?.api) return;
    const nodeCount = this.designer.api.getNodes().length + 1;
    const node = new AcNode(`Node ${nodeCount}`);
    const inputSocket = new AcSocket('Input', 'input');
    const outputSocket = new AcSocket('Output', 'output');
    node.addSocketPort({ key: 'in', socket: inputSocket, side: 'input' });
    node.addSocketPort({ key: 'out', socket: outputSocket, side: 'output' });
    await this.designer.api.addNode({ node });
    await this.designer.api.zoomAt();
  }

  async loadSampleGraph() {
    if (!this.designer?.api) return;
    const api = this.designer.api;
    await api.clear();

    // 1. Users Table Node
    const usersNode = new AcNode('users');
    const userPk = new AcSocket('id (PK)', 'output');
    const userEmail = new AcSocket('email', 'both');
    usersNode.addSocketPort({ key: 'id', socket: userPk, side: 'output' });
    usersNode.addSocketPort({ key: 'email', socket: userEmail, side: 'both' });
    await api.addNode({ node: usersNode });

    // 2. Orders Table Node
    const ordersNode = new AcNode('orders');
    const orderPk = new AcSocket('id (PK)', 'output');
    const orderUserId = new AcSocket('user_id (FK)', 'input');
    const orderParentId = new AcSocket('parent_order_id (Self-FK)', 'both');
    ordersNode.addSocketPort({ key: 'id', socket: orderPk, side: 'output' });
    ordersNode.addSocketPort({ key: 'user_id', socket: orderUserId, side: 'input' });
    ordersNode.addSocketPort({ key: 'parent_id', socket: orderParentId, side: 'both' });
    await api.addNode({ node: ordersNode });

    // 3. Products Table Node
    const productsNode = new AcNode('products');
    const productPk = new AcSocket('id (PK)', 'output');
    const productName = new AcSocket('title', 'both');
    productsNode.addSocketPort({ key: 'id', socket: productPk, side: 'output' });
    productsNode.addSocketPort({ key: 'title', socket: productName, side: 'both' });
    await api.addNode({ node: productsNode });

    // 4. Order Items Table Node
    const itemsNode = new AcNode('order_items');
    const itemPk = new AcSocket('id (PK)', 'output');
    const itemOrderId = new AcSocket('order_id (FK)', 'input');
    const itemProductId = new AcSocket('product_id (FK)', 'input');
    itemsNode.addSocketPort({ key: 'id', socket: itemPk, side: 'output' });
    itemsNode.addSocketPort({ key: 'order_id', socket: itemOrderId, side: 'input' });
    itemsNode.addSocketPort({ key: 'product_id', socket: itemProductId, side: 'input' });
    await api.addNode({ node: itemsNode });

    // Connections
    // orders.user_id -> users.id
    const conn1 = new AcConnection(ordersNode, 'user_id', usersNode, 'id');
    await api.addConnection({ connection: conn1 });

    // order_items.order_id -> orders.id
    const conn2 = new AcConnection(itemsNode, 'order_id', ordersNode, 'id');
    await api.addConnection({ connection: conn2 });

    // order_items.product_id -> products.id
    const conn3 = new AcConnection(itemsNode, 'product_id', productsNode, 'id');
    await api.addConnection({ connection: conn3 });

    // Self-referencing loop connection: orders.parent_id -> orders.id
    const selfConn = new AcConnection(ordersNode, 'parent_id', ordersNode, 'id');
    await api.addConnection({ connection: selfConn });

    await api.autoArrange();
    await api.zoomAt();
  }
}
