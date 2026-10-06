import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbTable } from '../../models/ac-db-table.model';

export class UpdateTableCommand implements AcDbCommand {
  readonly label: string;
  private _before: Partial<AcDbTable> | null = null;

  constructor(
    private readonly tableId: string,
    private readonly patch: Partial<AcDbTable>,
    label?: string,
  ) {
    this.label = label ?? `Update table`;
  }

  execute(store: AcDbStore): void {
    const existing = store.getTable(this.tableId);
    if (!existing) return;
    // Store only the fields we are changing (minimal snapshot)
    this._before = {};
    for (const key of Object.keys(this.patch) as (keyof AcDbTable)[]) {
      (this._before as any)[key] = existing[key];
    }
    store.updateTable(this.tableId, this.patch);
  }

  undo(store: AcDbStore): void {
    if (this._before) store.updateTable(this.tableId, this._before);
  }
}
