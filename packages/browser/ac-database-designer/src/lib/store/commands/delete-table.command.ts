import { AcDbCommand } from '../ac-db-history';
import { AcDbStore } from '../ac-db-store';
import { AcDbTable } from '../../models/ac-db-table.model';
import { AcDbColumn } from '../../models/ac-db-column.model';
import { AcDbRelationship } from '../../models/ac-db-relationship.model';
import { AcDbIndex } from '../../models/ac-db-index.model';
import { AcDbTrigger } from '../../models/ac-db-trigger.model';

/** Stores full snapshot of deleted table for undo — only command that needs this. */
export class DeleteTableCommand implements AcDbCommand {
  readonly label: string;
  private _snapshot: {
    table: AcDbTable;
    columns: AcDbColumn[];
    indexes: AcDbIndex[];
    triggers: AcDbTrigger[];
    relationships: AcDbRelationship[];
  } | null = null;

  constructor(private readonly tableId: string, tableName: string) {
    this.label = `Delete table "${tableName}"`;
  }

  execute(store: AcDbStore): void {
    const table = store.getTable(this.tableId);
    if (!table) return;
    // Snapshot before deletion
    this._snapshot = {
      table: { ...table },
      columns: store.getTableColumns(this.tableId).map(c => ({ ...c })),
      indexes: store.getTableIndexes(this.tableId).map(i => ({ ...i })),
      triggers: store.getTableTriggers(this.tableId).map(t => ({ ...t })),
      relationships: store.getTableRelationships(this.tableId).map(r => ({ ...r })),
    };
    store.deleteTable(this.tableId);
  }

  undo(store: AcDbStore): void {
    if (!this._snapshot) return;
    store.addTable(this._snapshot.table);
    for (const col of this._snapshot.columns) store.addColumn(col);
    for (const idx of this._snapshot.indexes) store.addIndex(idx);
    for (const trg of this._snapshot.triggers) store.addTrigger(trg);
    for (const rel of this._snapshot.relationships) store.addRelationship(rel);
  }
}
