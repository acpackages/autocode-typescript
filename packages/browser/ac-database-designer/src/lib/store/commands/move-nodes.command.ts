import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbLayout } from '../../models/ac-db-layout.model';

interface NodeMove { tableId: string; fromX: number; fromY: number; toX: number; toY: number; }

/** Batch move: stores only the from/to positions — ~24 bytes per table. */
export class MoveNodesCommand implements AcDbCommand {
  readonly label: string;

  constructor(
    private readonly moves: NodeMove[],
    private readonly layout: AcDbLayout,
  ) {
    this.label = moves.length === 1 ? `Move table` : `Move ${moves.length} tables`;
  }

  execute(_store: AcDbStore): void {
    for (const m of this.moves) {
      if (this.layout.nodes[m.tableId]) {
        this.layout.nodes[m.tableId].x = m.toX;
        this.layout.nodes[m.tableId].y = m.toY;
      }
    }
  }

  undo(_store: AcDbStore): void {
    for (const m of this.moves) {
      if (this.layout.nodes[m.tableId]) {
        this.layout.nodes[m.tableId].x = m.fromX;
        this.layout.nodes[m.tableId].y = m.fromY;
      }
    }
  }
}
