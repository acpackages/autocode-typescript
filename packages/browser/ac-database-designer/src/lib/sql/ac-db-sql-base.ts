import { AcDbStore } from '../store/ac-db-store';
import { AcDbSchema } from '../models/ac-db-schema.model';
import { AcDbColumn } from '../models/ac-db-column.model';
import { AcDbTable } from '../models/ac-db-table.model';
import { AcDbRelationship } from '../models/ac-db-relationship.model';
import { AcDbIndex } from '../models/ac-db-index.model';
import { AcDbView } from '../models/ac-db-view.model';
import { AcDbTrigger } from '../models/ac-db-trigger.model';
import { AcDbStoredProcedure } from '../models/ac-db-stored-procedure.model';
import { AcDbFunction } from '../models/ac-db-function.model';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';

export abstract class AcDbSqlBase {
  abstract readonly dialect: AcEnumDbDialect;
  abstract readonly columnTypeMap: Partial<Record<AcEnumDbColumnType, string>>;

  // Subclasses override these for dialect-specific quoting
  protected quoteIdentifier(name: string): string { return `\`${name}\``; }
  protected q(name: string): string { return this.quoteIdentifier(name); }

  mapColumnType(col: AcDbColumn): string {
    if (col.columnType === AcEnumDbColumnType.Custom) return col.customType || 'TEXT';
    const mapped = this.columnTypeMap[col.columnType];
    if (!mapped) return 'TEXT';
    // Append length/precision where applicable
    if ((col.columnType === AcEnumDbColumnType.String || col.columnType === AcEnumDbColumnType.VarChar || col.columnType === AcEnumDbColumnType.Char) && col.length) {
      return `${mapped}(${col.length})`;
    }
    if (col.columnType === AcEnumDbColumnType.Decimal && col.precision !== null) {
      const scale = col.scale ?? 2;
      return `${mapped}(${col.precision},${scale})`;
    }
    if (col.columnType === AcEnumDbColumnType.Enum && col.enumValues?.length) {
      return `ENUM(${col.enumValues.map(v => `'${v}'`).join(', ')})`;
    }
    return mapped;
  }

  columnDef(col: AcDbColumn): string {
    const parts: string[] = [];
    parts.push(this.q(col.columnName));
    parts.push(this.mapColumnType(col));
    if (!col.nullable || col.primaryKey) parts.push('NOT NULL');
    if (col.defaultValue !== null && col.defaultValue !== undefined) {
      parts.push(`DEFAULT ${col.defaultValue}`);
    }
    if (col.autoIncrement) parts.push(this.autoIncrementClause());
    if (col.unique && !col.primaryKey) parts.push('UNIQUE');
    return parts.join(' ');
  }

  protected autoIncrementClause(): string { return 'AUTO_INCREMENT'; }

  generateCreateTable(table: AcDbTable, columns: AcDbColumn[], relationships: AcDbRelationship[]): string {
    const lines: string[] = [];
    for (const col of columns) lines.push(`  ${this.columnDef(col)}`);

    // Primary key
    const pks = columns.filter(c => c.primaryKey).map(c => this.q(c.columnName));
    if (pks.length > 0) lines.push(`  PRIMARY KEY (${pks.join(', ')})`);

    // Unique indexes (inline)
    const uqs = columns.filter(c => c.unique && !c.primaryKey);
    for (const u of uqs) {
      lines.push(`  UNIQUE KEY ${this.q(`uq_${table.tableName}_${u.columnName}`)} (${this.q(u.columnName)})`);
    }

    // Foreign keys
    for (const rel of relationships.filter(r => r.fromTableId === table.tableId)) {
      const fkLine = this.foreignKeyClause(rel, columns);
      if (fkLine) lines.push(`  ${fkLine}`);
    }

    // CHECK constraints
    if (table.checks?.length) {
      for (const chk of table.checks) {
        if (chk.trim()) lines.push(`  CHECK (${chk})`);
      }
    }

    return `CREATE TABLE IF NOT EXISTS ${this.q(table.tableName)} (\n${lines.join(',\n')}\n);`;
  }

  protected foreignKeyClause(rel: AcDbRelationship, columns: AcDbColumn[]): string | null {
    const fromCol = columns.find(c => c.columnId === rel.fromColumnId);
    if (!fromCol) return null;
    return `CONSTRAINT ${this.q(`fk_${rel.relationshipId.slice(0,8)}`)} FOREIGN KEY (${this.q(fromCol.columnName)}) REFERENCES — resolved at generation time`;
  }

  generateCreateIndex(index: AcDbIndex, table: AcDbTable, allColumns: AcDbColumn[]): string {
    const cols = index.columnIds.map(id => {
      const col = allColumns.find(c => c.columnId === id);
      return col ? this.q(col.columnName) : id;
    });
    const unique = index.unique ? 'UNIQUE ' : '';
    return `CREATE ${unique}INDEX ${this.q(index.indexName)} ON ${this.q(table.tableName)} (${cols.join(', ')});`;
  }

  generateCreateView(view: AcDbView): string {
    return `CREATE OR REPLACE VIEW ${this.q(view.viewName)} AS\n${view.viewQuery};`;
  }

  generateCreateTrigger(trigger: AcDbTrigger, tableName: string): string {
    return `CREATE TRIGGER ${this.q(trigger.triggerName)}\n${trigger.timing} ${trigger.event} ON ${this.q(tableName)}\nFOR EACH ROW\nBEGIN\n${trigger.triggerCode}\nEND;`;
  }

  generateCreateStoredProcedure(sp: AcDbStoredProcedure): string {
    return `CREATE PROCEDURE ${this.q(sp.spName)}()\nBEGIN\n${sp.spCode}\nEND;`;
  }

  generateCreateFunction(fn: AcDbFunction): string {
    return `CREATE FUNCTION ${this.q(fn.functionName)}()\nRETURNS ${fn.returnsType || 'VOID'}\nBEGIN\n${fn.functionCode}\nEND;`;
  }

  generateFullScript(schema: AcDbSchema, store: AcDbStore): string {
    const lines: string[] = [];
    lines.push(`-- Generated by ac-database-designer`);
    lines.push(`-- Schema: ${schema.schemaName}`);
    lines.push(`-- Dialect: ${this.dialect}`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push('');

    const tables = store.getAllTables();
    const allRels = store.getAllRelationships();

    // CREATE TABLE statements
    for (const table of tables) {
      const cols = store.getTableColumns(table.tableId);
      const rels = allRels.filter(r => r.fromTableId === table.tableId);
      lines.push(this.generateTableBlock(table, cols, rels, store));
      lines.push('');
    }

    // CREATE INDEX statements (explicit indexes)
    for (const table of tables) {
      const cols = store.getTableColumns(table.tableId);
      for (const idx of store.getTableIndexes(table.tableId)) {
        lines.push(this.generateCreateIndex(idx, table, cols));
      }
    }

    // Views
    for (const view of store.getAllViews()) {
      lines.push('');
      lines.push(this.generateCreateView(view));
    }

    // Triggers
    for (const trigger of store.getAllTriggers()) {
      const table = store.getTable(trigger.tableId);
      if (table) {
        lines.push('');
        lines.push(this.generateCreateTrigger(trigger, table.tableName));
      }
    }

    // Stored Procedures
    for (const sp of store.getAllStoredProcedures()) {
      lines.push('');
      lines.push(this.generateCreateStoredProcedure(sp));
    }

    // Functions
    for (const fn of store.getAllFunctions()) {
      lines.push('');
      lines.push(this.generateCreateFunction(fn));
    }

    return lines.join('\n');
  }

  protected generateTableBlock(
    table: AcDbTable, cols: AcDbColumn[],
    rels: AcDbRelationship[], store: AcDbStore
  ): string {
    const columnLines: string[] = [];
    for (const col of cols) columnLines.push(`  ${this.columnDef(col)}`);

    const pks = cols.filter(c => c.primaryKey).map(c => this.q(c.columnName));
    if (pks.length > 0) columnLines.push(`  PRIMARY KEY (${pks.join(', ')})`);

    for (const rel of rels) {
      const fromCol = cols.find(c => c.columnId === rel.fromColumnId);
      const toTable = store.getTable(rel.toTableId);
      const toCols  = toTable ? store.getTableColumns(toTable.tableId) : [];
      const toCol   = toCols.find(c => c.columnId === rel.toColumnId);
      if (fromCol && toTable && toCol) {
        columnLines.push(
          `  CONSTRAINT ${this.q(`fk_${rel.relationshipId.slice(0,8)}`)} ` +
          `FOREIGN KEY (${this.q(fromCol.columnName)}) ` +
          `REFERENCES ${this.q(toTable.tableName)}(${this.q(toCol.columnName)}) ` +
          `ON DELETE ${rel.onDelete} ON UPDATE ${rel.onUpdate}`
        );
      }
    }

    return `CREATE TABLE IF NOT EXISTS ${this.q(table.tableName)} (\n${columnLines.join(',\n')}\n);`;
  }
}
