import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbTable } from '../../models/ac-db-table.model';

export class AddTableCommand implements AcDbCommand {
  readonly label: string;
  private _tableId: string | undefined;
  private _initial: Omit<Parameters<AcDbStore['addTable']>[0], 'tableId'>;

  constructor(args: { schemaId: string; tableName: string; x?: number; y?: number }) {
    this._initial = args as any;
    this.label = `Add table "${args.tableName}"`;
  }

  execute(store: AcDbStore): void {
    const id = this._tableId ?? crypto.randomUUID();
    this._tableId = id;
    store.addTable({ tableId: id, ...(this._initial as any) });
  }

  undo(store: AcDbStore): void {
    if (this._tableId) store.deleteTable(this._tableId);
  }
}
