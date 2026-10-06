import { AcDbStore } from '../store/ac-db-store';
import { AcDbSchema } from '../models/ac-db-schema.model';
import { AcDbValidationIssue } from '../models/ac-db-validation.model';
import { AcDbEventBus } from '../store/ac-db-event-bus';

// SQL reserved words (common subset across dialects)
const SQL_RESERVED = new Set([
  'select','from','where','table','column','index','view','trigger','function',
  'procedure','database','schema','insert','update','delete','drop','create',
  'alter','order','group','by','having','join','inner','outer','left','right',
  'full','on','as','distinct','union','all','null','not','and','or','in',
  'exists','between','like','is','case','when','then','else','end','limit',
  'offset','primary','key','foreign','references','unique','default','check',
  'constraint','cascade','restrict','set','action','auto_increment','identity',
]);

function isReserved(name: string): boolean {
  return SQL_RESERVED.has(name.toLowerCase());
}

export class AcDbValidator {
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly store: AcDbStore,
    private readonly bus: AcDbEventBus,
  ) {}

  /** Triggers a debounced validation run (500ms). */
  scheduleValidation(): void {
    if (this._debounceTimer !== null) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._debounceTimer = null;
      const issues = this.validate();
      this.bus.emit('validation:updated', issues);
    }, 500);
  }

  /** Runs all rules synchronously. ~8,000 ops for 100 tables × 15 cols — < 0.5ms. */
  validate(): AcDbValidationIssue[] {
    const issues: AcDbValidationIssue[] = [];
    const tables = this.store.getAllTables();
    const tableNames = new Set<string>();
    const tableIds   = new Set<string>(tables.map(t => t.tableId));

    for (const table of tables) {
      const columns = this.store.getTableColumns(table.tableId);
      const colNames = new Set<string>();

      // Duplicate table name
      if (tableNames.has(table.tableName.toLowerCase())) {
        issues.push({ id: `dup-table-${table.tableId}`, severity: 'error',
          message: `Duplicate table name "${table.tableName}"`, tableId: table.tableId });
      }
      tableNames.add(table.tableName.toLowerCase());

      // No columns
      if (columns.length === 0) {
        issues.push({ id: `no-cols-${table.tableId}`, severity: 'warning',
          message: `Table "${table.tableName}" has no columns`, tableId: table.tableId });
      }

      // No primary key
      const hasPK = columns.some(c => c.primaryKey);
      if (!hasPK && columns.length > 0) {
        issues.push({ id: `no-pk-${table.tableId}`, severity: 'warning',
          message: `Table "${table.tableName}" has no primary key`, tableId: table.tableId });
      }

      // Table name too long
      if (table.tableName.length > 64) {
        issues.push({ id: `name-long-tbl-${table.tableId}`, severity: 'warning',
          message: `Table name "${table.tableName}" exceeds 64 characters`, tableId: table.tableId });
      }

      // Reserved word
      if (isReserved(table.tableName)) {
        issues.push({ id: `reserved-tbl-${table.tableId}`, severity: 'warning',
          message: `Table name "${table.tableName}" is a SQL reserved word`, tableId: table.tableId });
      }

      for (const col of columns) {
        // No type
        if (!col.columnType) {
          issues.push({ id: `no-type-${col.columnId}`, severity: 'error',
            message: `Column "${table.tableName}.${col.columnName}" has no data type`,
            tableId: table.tableId, columnId: col.columnId });
        }

        // Duplicate column name within table
        if (colNames.has(col.columnName.toLowerCase())) {
          issues.push({ id: `dup-col-${col.columnId}`, severity: 'error',
            message: `Duplicate column name "${col.columnName}" in table "${table.tableName}"`,
            tableId: table.tableId, columnId: col.columnId });
        }
        colNames.add(col.columnName.toLowerCase());

        // Column name too long
        if (col.columnName.length > 64) {
          issues.push({ id: `name-long-col-${col.columnId}`, severity: 'warning',
            message: `Column name "${col.columnName}" exceeds 64 characters`,
            tableId: table.tableId, columnId: col.columnId });
        }

        // Reserved word
        if (isReserved(col.columnName)) {
          issues.push({ id: `reserved-col-${col.columnId}`, severity: 'warning',
            message: `Column name "${col.columnName}" is a SQL reserved word`,
            tableId: table.tableId, columnId: col.columnId });
        }
      }
    }

    // Validate relationships
    const rels = this.store.getAllRelationships();
    for (const rel of rels) {
      if (!tableIds.has(rel.fromTableId)) {
        issues.push({ id: `broken-fk-from-${rel.relationshipId}`, severity: 'error',
          message: `Relationship references non-existent "from" table`, relationshipId: rel.relationshipId });
      }
      if (!tableIds.has(rel.toTableId)) {
        issues.push({ id: `broken-fk-to-${rel.relationshipId}`, severity: 'error',
          message: `Relationship references non-existent "to" table`, relationshipId: rel.relationshipId });
      }
      const fromCol = this.store.getColumn(rel.fromColumnId);
      const toCol   = this.store.getColumn(rel.toColumnId);
      if (!fromCol) {
        issues.push({ id: `broken-fk-fcol-${rel.relationshipId}`, severity: 'error',
          message: `Relationship references non-existent "from" column`, relationshipId: rel.relationshipId });
      }
      if (!toCol) {
        issues.push({ id: `broken-fk-tcol-${rel.relationshipId}`, severity: 'error',
          message: `Relationship references non-existent "to" column`, relationshipId: rel.relationshipId });
      }
    }

    return issues;
  }

  destroy(): void {
    if (this._debounceTimer !== null) clearTimeout(this._debounceTimer);
  }
}
