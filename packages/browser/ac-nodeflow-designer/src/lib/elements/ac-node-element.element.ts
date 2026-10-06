import { AcNode } from '../models/ac-node.model';

export class AcNodeElement {
  element: HTMLElement;
  node: AcNode;

  constructor({ node }: { node: AcNode }) {
    this.node = node;
    this.element = document.createElement('div');
    this.element.setAttribute('data-node-id', node.id);
    this.element.classList.add('ac-nodeflow-node');

    if (node.customElement) {
      this.element.appendChild(node.customElement);
    } else {
      this.renderDefault();
    }
  }

  private renderDefault(): void {
    const header = document.createElement('div');
    header.classList.add('ac-nodeflow-node-header');
    header.textContent = this.node.label;
    this.element.appendChild(header);

    const body = document.createElement('div');
    body.classList.add('ac-nodeflow-node-body');

    // Render input/output socket slots if present
    for (const [key, input] of Object.entries(this.node.inputs)) {
      if (input) {
        const row = document.createElement('div');
        row.classList.add('ac-nodeflow-socket-row', 'ac-nodeflow-input-row');
        row.setAttribute('data-port-key', key);
        row.setAttribute('data-port-side', 'input');
        row.textContent = key;
        body.appendChild(row);
      }
    }

    for (const [key, output] of Object.entries(this.node.outputs)) {
      if (output) {
        const row = document.createElement('div');
        row.classList.add('ac-nodeflow-socket-row', 'ac-nodeflow-output-row');
        row.setAttribute('data-port-key', key);
        row.setAttribute('data-port-side', 'output');
        row.textContent = key;
        body.appendChild(row);
      }
    }

    this.element.appendChild(body);
  }
}
