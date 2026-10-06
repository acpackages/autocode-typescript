import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbColumn } from '../../models/ac-db-column.model';

export class AddColumnCommand implements AcDbCommand {
  readonly label: string;
  private _columnId: string | undefined;

  constructor(private readonly args: Omit<Parameters<AcDbStore['addColumn']>[0], 'columnId'>) {
    this.label = `Add column "${args.columnName}"`;
  }

  execute(store: AcDbStore): void {
    const id = this._columnId ?? crypto.randomUUID();
    this._columnId = id;
    store.addColumn({ columnId: id, ...this.args });
  }

  undo(store: AcDbStore): void {
    if (this._columnId) store.deleteColumn(this._columnId);
  }
}
