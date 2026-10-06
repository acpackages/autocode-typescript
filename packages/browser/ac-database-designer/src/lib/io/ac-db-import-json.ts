/**
 * Imports a data_dictionary.json (from @autocode-ts/ac-data-dictionary format)
 * into AcDbStore + AcDbSchema. No external dependencies.
 */
import { AcDbStore } from '../store/ac-db-store';
import { AcDbSchema, createSchema } from '../models/ac-db-schema.model';
import { AcDbLayout, createLayout } from '../models/ac-db-layout.model';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcEnumDbRelationType } from '../enums/ac-enum-db-relation-type';
import { AcEnumDbFkAction } from '../enums/ac-enum-db-fk-action';
import { AcEnumDbTriggerTiming } from '../enums/ac-enum-db-trigger-timing';
import { AcEnumDbTriggerEvent } from '../enums/ac-enum-db-trigger-event';

// Keys from ac-data-dictionary (inlined to avoid coupling)
const DD = {
  Name: 'name', Version: 'version', Tables: 'tables', Views: 'views',
  Relationships: 'relationships', Triggers: 'triggers',
  StoredProcedures: 'storedProcedures', Functions: 'functions', Config: 'config',
};
const TBL = { Name: 'tableName', Columns: 'tableColumns', Props: 'tableProperties' };
const COL = { Name: 'columnName', Type: 'columnType', Props: 'columnProperties' };
const PROP = { Name: 'propertyName', Value: 'propertyValue' };
const REL = {
  SrcTable: 'sourceTable', SrcCol: 'sourceColumn',
  DstTable: 'destinationTable', DstCol: 'destinationColumn',
  CascadeDeleteDst: 'cascadeDeleteDestination', CascadeDeleteSrc: 'cascadeDeleteSource',
};

function mapColType(raw: string): AcEnumDbColumnType {
  const map: Record<string, AcEnumDbColumnType> = {
    AUTO_INCREMENT: AcEnumDbColumnType.AutoIncrement,
    AUTO_NUMBER:    AcEnumDbColumnType.AutoNumber,
    AUTO_INDEX:     AcEnumDbColumnType.AutoIndex,
    BLOB:           AcEnumDbColumnType.Blob,
    DATE:           AcEnumDbColumnType.Date,
    DATETIME:       AcEnumDbColumnType.Datetime,
    DOUBLE:         AcEnumDbColumnType.Double,
    ENCRYPTED:      AcEnumDbColumnType.Encrypted,
    INTEGER:        AcEnumDbColumnType.Integer,
    JSON:           AcEnumDbColumnType.Json,
    PASSWORD:       AcEnumDbColumnType.Password,
    STRING:         AcEnumDbColumnType.String,
    TEXT:           AcEnumDbColumnType.Text,
    TIME:           AcEnumDbColumnType.Time,
    TIMESTAMP:      AcEnumDbColumnType.Timestamp,
    UUID:           AcEnumDbColumnType.Uuid,
    YES_NO:         AcEnumDbColumnType.YesNo,
  };
  return map[raw] ?? AcEnumDbColumnType.Unknown;
}

function getProps(propsObj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  if (!propsObj || typeof propsObj !== 'object') return result;
  for (const [key, val] of Object.entries(propsObj)) {
    result[key] = (val && typeof val === 'object' && PROP.Value in val) ? val[PROP.Value] : val;
  }
  return result;
}

export interface AcDbImportResult {
  schema: AcDbSchema;
  warnings: string[];
}

export function importFromJson(json: any, store: AcDbStore, schemaId?: string): AcDbImportResult {
  const warnings: string[] = [];
  store.clearSilent();

  const id = schemaId ?? crypto.randomUUID();
  const schemaName = json[DD.Name] ?? 'Imported Schema';
  const config = json[DD.Config] ?? {};

  const schema = createSchema({
    schemaId: id,
    schemaName,
    dialect: AcEnumDbDialect.MySQL,
    version: json[DD.Version] ?? 1,
    config: {
      insertTimestampColumn: config.insertTimestampColumnKey ?? config.insert_timestamp_column_key ?? 'created_at',
      updateTimestampColumn: config.updateTimestampColumnKey ?? config.update_timestamp_column_key ?? 'updated_at',
      deleteTimestampColumn: config.deleteTimestampColumnKey ?? config.delete_timestamp_column_key ?? '',
    },
    layout: createLayout(),
  });

  // ── Tables & Columns ──────────────────────────────────────────────────────
  const tables = json[DD.Tables] ?? {};
  // tableNameId map for relationship resolution
  const tableNameToId = new Map<string, string>();
  const colNameToId   = new Map<string, string>(); // `tableId:colName` → colId

  for (const [, tableData] of Object.entries(tables as Record<string, any>)) {
    const tableName = tableData[TBL.Name] ?? tableData['tableName'] ?? 'unknown';
    const tableId = crypto.randomUUID();
    tableNameToId.set(tableName, tableId);

    const props = getProps(tableData[TBL.Props] ?? {});

    store.addTable({
      tableId,
      schemaId: id,
      tableName,
      singularName: props['SINGULAR_NAME'] ?? props['singularName'] ?? tableName,
      pluralName:   props['PLURAL_NAME']   ?? props['pluralName']   ?? tableName,
      description:  props['REMARKS']       ?? props['remarks']      ?? '',
      tags:         props['TAGS']           ?? props['tags']         ?? [],
      color: null,
    });

    const columns = tableData[TBL.Columns] ?? {};
    let ordinal = 0;
    for (const [, colData] of Object.entries(columns as Record<string, any>)) {
      const columnName = colData[COL.Name] ?? colData['columnName'] ?? 'unknown';
      const colProps   = getProps(colData[COL.Props] ?? colData['columnProperties'] ?? {});
      const columnId   = crypto.randomUUID();
      colNameToId.set(`${tableId}:${columnName}`, columnId);

      const isPK   = !!(colProps['PRIMARY_KEY']     ?? colProps['primaryKey']);
      const isNN   = !!(colProps['NOT_NULL']         ?? colProps['notNull']);
      const isUQ   = !!(colProps['UNIQUE_KEY']       ?? colProps['uniqueKey']);
      const isAI   = !!(colProps['AUTO_INCREMENT']   ?? colProps['autoIncrement']);
      const defVal =   (colProps['DEFAULT_VALUE']    ?? colProps['defaultValue'] ?? null) as string | null;
      const size   =    colProps['SIZE']             ?? colProps['size'] ?? null;
      const fkRaw  =    colProps['FOREIGN_KEY']      ?? colProps['foreignKey'];

      store.addColumn({
        columnId,
        tableId,
        columnName,
        columnType:       mapColType(colData[COL.Type] ?? colData['columnType'] ?? ''),
        customType:       '',
        length:           typeof size === 'number' ? size : null,
        precision:        null,
        scale:            null,
        primaryKey:       isPK,
        autoIncrement:    isAI,
        autoIndex:        false,
        nullable:         !isNN && !isPK,
        unique:           isUQ,
        defaultValue:     defVal,
        description:      (colProps['REMARKS'] ?? colProps['remarks'] ?? '') as string,
        tags:             (colProps['TAGS']    ?? colProps['tags']    ?? []) as string[],
        ordinalPosition:  ordinal++,
        foreignKeyTableId:  null,  // resolved in relationship pass
        foreignKeyColumnId: null,
      });
    }
  }

  // ── Relationships ─────────────────────────────────────────────────────────
  const rels = json[DD.Relationships] ?? [];
  const relArray = Array.isArray(rels) ? rels : Object.values(rels);
  for (const rel of relArray) {
    const srcTableName = rel[REL.SrcTable];
    const dstTableName = rel[REL.DstTable];
    const srcColName   = rel[REL.SrcCol];
    const dstColName   = rel[REL.DstCol];

    const fromTableId = tableNameToId.get(dstTableName); // FK is on destination table
    const toTableId   = tableNameToId.get(srcTableName);

    if (!fromTableId || !toTableId) {
      warnings.push(`Relationship skipped: table "${dstTableName}" or "${srcTableName}" not found`);
      continue;
    }

    const fromColId = colNameToId.get(`${fromTableId}:${dstColName}`);
    const toColId   = colNameToId.get(`${toTableId}:${srcColName}`);

    if (!fromColId || !toColId) {
      warnings.push(`Relationship skipped: column not found for ${srcTableName}.${srcColName} → ${dstTableName}.${dstColName}`);
      continue;
    }

    const onDelete = rel[REL.CascadeDeleteDst] ? AcEnumDbFkAction.Cascade : AcEnumDbFkAction.NoAction;
    store.addRelationship({
      relationshipId: crypto.randomUUID(),
      schemaId: id,
      label: '',
      type: AcEnumDbRelationType.OneToMany,
      fromTableId,
      fromColumnId: fromColId,
      toTableId,
      toColumnId: toColId,
      onDelete,
      onUpdate: AcEnumDbFkAction.NoAction,
    });

    // Denormalize FK onto column
    store.updateColumn(fromColId, { foreignKeyTableId: toTableId, foreignKeyColumnId: toColId });
  }

  // ── Views ─────────────────────────────────────────────────────────────────
  const views = json[DD.Views] ?? {};
  for (const [, viewData] of Object.entries(views as Record<string, any>)) {
    const viewId = crypto.randomUUID();
    store.addView({ viewId, schemaId: id, viewName: viewData.viewName ?? '', viewQuery: viewData.viewQuery ?? '', description: '' });
    const viewCols = viewData.viewColumns ?? viewData.columns ?? {};
    for (const [, vc] of Object.entries(viewCols as Record<string, any>)) {
      store.addViewColumn({
        viewColumnId: crypto.randomUUID(), viewId,
        columnName: vc.columnName ?? '', columnSource: vc.columnSource ?? '',
        columnSourceName: vc.columnSourceName ?? '', columnType: vc.columnType ?? '', description: '',
      });
    }
  }

  // ── Triggers ──────────────────────────────────────────────────────────────
  const triggers = json[DD.Triggers] ?? {};
  for (const [, trgData] of Object.entries(triggers as Record<string, any>)) {
    const tableId = tableNameToId.get(trgData.tableName ?? '');
    store.addTrigger({
      triggerId: crypto.randomUUID(), schemaId: id,
      triggerName: trgData.triggerName ?? '',
      tableId: tableId ?? '',
      timing: (trgData.triggerExecution ?? AcEnumDbTriggerTiming.After) as AcEnumDbTriggerTiming,
      event:  (trgData.rowOperation     ?? AcEnumDbTriggerEvent.Insert) as AcEnumDbTriggerEvent,
      triggerCode: trgData.triggerCode ?? '',
      description: '',
    });
  }

  // ── Stored Procedures ─────────────────────────────────────────────────────
  const sps = json[DD.StoredProcedures] ?? {};
  for (const [, spData] of Object.entries(sps as Record<string, any>)) {
    store.addStoredProcedure({
      spId: crypto.randomUUID(), schemaId: id,
      spName: spData.storedProcedureName ?? '',
      spCode: spData.storedProcedureCode ?? '',
      description: '',
    });
  }

  // ── Functions ─────────────────────────────────────────────────────────────
  const fns = json[DD.Functions] ?? {};
  for (const [, fnData] of Object.entries(fns as Record<string, any>)) {
    store.addFunction({
      functionId: crypto.randomUUID(), schemaId: id,
      functionName: fnData.functionName ?? '',
      functionCode: fnData.functionCode ?? '',
      returnsType: '',
      description: '',
    });
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  const notesArr = json['notes'];
  if (Array.isArray(notesArr)) {
    for (const noteData of notesArr) {
      store.addNote({
        noteId: noteData.noteId ?? crypto.randomUUID(),
        text: noteData.text ?? '',
        color: noteData.color ?? '#fff3bf',
        x: noteData.x ?? 100,
        y: noteData.y ?? 100,
        width: noteData.width ?? 180,
        height: noteData.height ?? 100,
      });
    }
  }

  // ── Areas ──────────────────────────────────────────────────────────────────
  const areasArr = json['areas'];
  if (Array.isArray(areasArr)) {
    for (const areaData of areasArr) {
      store.addArea({
        areaId: areaData.areaId ?? crypto.randomUUID(),
        name: areaData.name ?? 'Area',
        color: areaData.color ?? 'rgba(51,154,240,0.08)',
        x: areaData.x ?? 50,
        y: areaData.y ?? 50,
        width: areaData.width ?? 400,
        height: areaData.height ?? 300,
      });
    }
  }

  return { schema, warnings };
}
