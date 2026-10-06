/**
 * Exports AcDbStore contents to data_dictionary.json format
 * compatible with @autocode-ts/ac-data-dictionary.
 */
import { AcDbStore } from '../store/ac-db-store';
import { AcDbSchema } from '../models/ac-db-schema.model';
import { AcDbColumn } from '../models/ac-db-column.model';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';

function mapColTypeToDD(type: AcEnumDbColumnType): string {
  const map: Record<string, string> = {
    [AcEnumDbColumnType.AutoIncrement]: 'AUTO_INCREMENT',
    [AcEnumDbColumnType.AutoNumber]:    'AUTO_NUMBER',
    [AcEnumDbColumnType.AutoIndex]:     'AUTO_INDEX',
    [AcEnumDbColumnType.Blob]:          'BLOB',
    [AcEnumDbColumnType.Date]:          'DATE',
    [AcEnumDbColumnType.Datetime]:      'DATETIME',
    [AcEnumDbColumnType.Double]:        'DOUBLE',
    [AcEnumDbColumnType.Encrypted]:     'ENCRYPTED',
    [AcEnumDbColumnType.Integer]:       'INTEGER',
    [AcEnumDbColumnType.Json]:          'JSON',
    [AcEnumDbColumnType.Password]:      'PASSWORD',
    [AcEnumDbColumnType.String]:        'STRING',
    [AcEnumDbColumnType.Text]:          'TEXT',
    [AcEnumDbColumnType.Time]:          'TIME',
    [AcEnumDbColumnType.Timestamp]:     'TIMESTAMP',
    [AcEnumDbColumnType.Uuid]:          'UUID',
    [AcEnumDbColumnType.YesNo]:         'YES_NO',
  };
  return map[type] ?? 'UNKNOWN';
}

function buildColumnProps(col: AcDbColumn): Record<string, any> {
  const props: Record<string, any> = {};
  if (col.primaryKey)     props['PRIMARY_KEY']     = { propertyName: 'PRIMARY_KEY',     propertyValue: true };
  if (!col.nullable)      props['NOT_NULL']         = { propertyName: 'NOT_NULL',         propertyValue: true };
  if (col.unique)         props['UNIQUE_KEY']       = { propertyName: 'UNIQUE_KEY',       propertyValue: true };
  if (col.autoIncrement)  props['AUTO_INCREMENT']   = { propertyName: 'AUTO_INCREMENT',   propertyValue: true };
  if (col.length !== null) props['SIZE']            = { propertyName: 'SIZE',             propertyValue: col.length };
  if (col.defaultValue)   props['DEFAULT_VALUE']    = { propertyName: 'DEFAULT_VALUE',    propertyValue: col.defaultValue };
  if (col.description)    props['REMARKS']          = { propertyName: 'REMARKS',          propertyValue: col.description };
  if (col.tags?.length)   props['TAGS']             = { propertyName: 'TAGS',             propertyValue: col.tags };
  if (col.foreignKeyTableId && col.foreignKeyColumnId) {
    props['FOREIGN_KEY'] = { propertyName: 'FOREIGN_KEY', propertyValue: `${col.foreignKeyTableId}:${col.foreignKeyColumnId}` };
  }
  return props;
}

export function exportToJson(schema: AcDbSchema, store: AcDbStore): Record<string, any> {
  const json: Record<string, any> = {
    name:    schema.schemaName,
    version: schema.version,
    config: {
      insertTimestampColumnKey: schema.config.insertTimestampColumn,
      updateTimestampColumnKey: schema.config.updateTimestampColumn,
      deleteTimestampColumnKey: schema.config.deleteTimestampColumn,
    },
  };

  // ── Tables ────────────────────────────────────────────────────────────────
  const tables: Record<string, any> = {};
  for (const table of store.getAllTables()) {
    const columns: Record<string, any> = {};
    for (const col of store.getTableColumns(table.tableId)) {
      columns[col.columnName] = {
        columnName:       col.columnName,
        columnType:       mapColTypeToDD(col.columnType),
        columnProperties: buildColumnProps(col),
      };
    }

    const tableProps: Record<string, any> = {};
    if (table.singularName) tableProps['SINGULAR_NAME'] = { propertyName: 'SINGULAR_NAME', propertyValue: table.singularName };
    if (table.pluralName)   tableProps['PLURAL_NAME']   = { propertyName: 'PLURAL_NAME',   propertyValue: table.pluralName };
    if (table.description)  tableProps['REMARKS']       = { propertyName: 'REMARKS',       propertyValue: table.description };
    if (table.tags?.length) tableProps['TAGS']          = { propertyName: 'TAGS',          propertyValue: table.tags };

    tables[table.tableName] = {
      tableName:       table.tableName,
      tableColumns:    columns,
      tableProperties: tableProps,
    };
  }
  json['tables'] = tables;

  // ── Relationships ─────────────────────────────────────────────────────────
  const rels: any[] = [];
  for (const rel of store.getAllRelationships()) {
    const fromTable  = store.getTable(rel.fromTableId);
    const toTable    = store.getTable(rel.toTableId);
    const fromCol    = store.getColumn(rel.fromColumnId);
    const toCol      = store.getColumn(rel.toColumnId);
    if (!fromTable || !toTable || !fromCol || !toCol) continue;
    rels.push({
      sourceTable:             toTable.tableName,
      sourceColumn:            toCol.columnName,
      destinationTable:        fromTable.tableName,
      destinationColumn:       fromCol.columnName,
      cascadeDeleteDestination: rel.onDelete === 'CASCADE',
      cascadeDeleteSource:      false,
    });
  }
  json['relationships'] = rels;

  // ── Views ─────────────────────────────────────────────────────────────────
  const views: Record<string, any> = {};
  for (const view of store.getAllViews()) {
    const viewColumns: Record<string, any> = {};
    for (const vc of store.getViewColumns(view.viewId)) {
      viewColumns[vc.columnName] = {
        columnName: vc.columnName, columnSource: vc.columnSource,
        columnSourceName: vc.columnSourceName, columnType: vc.columnType,
      };
    }
    views[view.viewName] = { viewName: view.viewName, viewQuery: view.viewQuery, viewColumns };
  }
  json['views'] = views;

  // ── Triggers ──────────────────────────────────────────────────────────────
  const triggers: Record<string, any> = {};
  for (const trg of store.getAllTriggers()) {
    const table = store.getTable(trg.tableId);
    triggers[trg.triggerName] = {
      triggerName: trg.triggerName, triggerExecution: trg.timing,
      rowOperation: trg.event, tableName: table?.tableName ?? '',
      triggerCode: trg.triggerCode,
    };
  }
  json['triggers'] = triggers;

  // ── Stored Procedures ─────────────────────────────────────────────────────
  const sps: Record<string, any> = {};
  for (const sp of store.getAllStoredProcedures()) {
    sps[sp.spName] = { storedProcedureName: sp.spName, storedProcedureCode: sp.spCode };
  }
  json['storedProcedures'] = sps;

  // ── Functions ─────────────────────────────────────────────────────────────
  const fns: Record<string, any> = {};
  for (const fn of store.getAllFunctions()) {
    fns[fn.functionName] = { functionName: fn.functionName, functionCode: fn.functionCode };
  }
  json['functions'] = fns;

  // ── Notes ──────────────────────────────────────────────────────────────────
  const notes: any[] = [];
  for (const note of store.getAllNotes()) {
    notes.push({
      noteId: note.noteId, text: note.text, color: note.color,
      x: note.x, y: note.y, width: note.width, height: note.height,
    });
  }
  if (notes.length) json['notes'] = notes;

  // ── Areas ──────────────────────────────────────────────────────────────────
  const areas: any[] = [];
  for (const area of store.getAllAreas()) {
    areas.push({
      areaId: area.areaId, name: area.name, color: area.color,
      x: area.x, y: area.y, width: area.width, height: area.height,
    });
  }
  if (areas.length) json['areas'] = areas;

  return json;
}
