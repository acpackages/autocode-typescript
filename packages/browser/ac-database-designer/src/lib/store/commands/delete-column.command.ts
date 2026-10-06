import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbColumn } from '../../models/ac-db-column.model';

export class DeleteColumnCommand implements AcDbCommand {
  readonly label: string;
  private _snapshot: AcDbColumn | null = null;

  constructor(private readonly columnId: string, columnName: string) {
    this.label = `Delete column "${columnName}"`;
  }

  execute(store: AcDbStore): void {
    const col = store.getColumn(this.columnId);
    if (!col) return;
    this._snapshot = { ...col };
    store.deleteColumn(this.columnId);
  }

  undo(store: AcDbStore): void {
    if (this._snapshot) store.addColumn(this._snapshot);
  }
}
