import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbColumn } from '../../models/ac-db-column.model';

export class UpdateColumnCommand implements AcDbCommand {
  readonly label: string;
  private _before: Partial<AcDbColumn> | null = null;

  constructor(
    private readonly columnId: string,
    private readonly patch: Partial<AcDbColumn>,
    label?: string,
  ) {
    this.label = label ?? `Update column`;
  }

  execute(store: AcDbStore): void {
    this._before = store.getColumnSnapshot(this.columnId, Object.keys(this.patch) as (keyof AcDbColumn)[]);
    store.updateColumn(this.columnId, this.patch);
  }

  undo(store: AcDbStore): void {
    if (this._before) store.updateColumn(this.columnId, this._before);
  }
}
