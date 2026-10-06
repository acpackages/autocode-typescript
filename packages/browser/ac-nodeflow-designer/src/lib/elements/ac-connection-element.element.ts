import { classicConnectionPath, loopConnectionPath } from 'rete-render-utils';
import { AcConnection } from '../models/ac-connection.model';

export interface Position {
  x: number;
  y: number;
}

export class AcConnectionElement {
  element: SVGGElement;
  pathElement: SVGPathElement;
  connection: AcConnection;

  constructor({ connection }: { connection: AcConnection }) {
    this.connection = connection;
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('data-connection-id', connection.id);
    this.element.classList.add('ac-nodeflow-connection');

    this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.pathElement.setAttribute('fill', 'none');
    this.pathElement.setAttribute('stroke', '#6c757d');
    this.pathElement.setAttribute('stroke-width', '2');
    this.pathElement.classList.add('ac-nodeflow-connection-path');

    this.element.appendChild(this.pathElement);
  }

  update({ start, end }: { start: Position; end: Position }): void {
    const points: [Position, Position] = [start, end];
    let d = '';

    if (this.connection.isLoop) {
      d = loopConnectionPath(points, 0.3, 50);
    } else {
      d = classicConnectionPath(points, 0.3);
    }

    this.pathElement.setAttribute('d', d);
  }
}
