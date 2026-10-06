/**
 * SQL DDL Import — parses CREATE TABLE / CREATE INDEX / ALTER TABLE statements
 * and populates the AcDbStore with tables, columns, indexes, and relationships.
 *
 * This is a lightweight regex-based parser, NOT a full SQL parser.
 * It handles the most common DDL patterns from MySQL, PostgreSQL, SQLite, and MSSQL.
 *
 * Supported:
 *  - CREATE TABLE with columns, inline constraints (PK, UNIQUE, NOT NULL, DEFAULT)
 *  - PRIMARY KEY (col, ...) table constraint
 *  - FOREIGN KEY ... REFERENCES ... ON DELETE/UPDATE
 *  - CREATE INDEX / CREATE UNIQUE INDEX
 *  - ALTER TABLE ADD CONSTRAINT ... FOREIGN KEY
 *  - AUTO_INCREMENT / SERIAL / IDENTITY
 *  - CHECK constraints
 *  - Basic type mapping to AcEnumDbColumnType
 */

import { AcDbStore } from '../store/ac-db-store';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcEnumDbFkAction } from '../enums/ac-enum-db-fk-action';
import { AcEnumDbRelationType } from '../enums/ac-enum-db-relation-type';

export interface AcDbImportResult {
  tables: number;
  columns: number;
  relationships: number;
  indexes: number;
  errors: string[];
}

/** Map SQL type names to AcEnumDbColumnType. Case-insensitive. */
function mapSqlType(rawType: string): { type: AcEnumDbColumnType; length: number | null; precision: number | null; scale: number | null; enumValues: string[] } {
  const upper = rawType.toUpperCase().trim();
  let length: number | null = null;
  let precision: number | null = null;
  let scale: number | null = null;
  let enumValues: string[] = [];

  // Extract (N) or (N,M) from type
  const parenMatch = upper.match(/^([A-Z_ ]+)\((.+)\)$/);
  let baseName = upper;
  if (parenMatch) {
    baseName = parenMatch[1].trim();
    const args = parenMatch[2];
    // Check for enum values: ENUM('a','b')
    if (baseName === 'ENUM' || baseName === 'SET') {
      enumValues = args.split(',').map(v => v.trim().replace(/^'|'$/g, ''));
    } else if (args.includes(',')) {
      const parts = args.split(',');
      precision = parseInt(parts[0], 10) || null;
      scale = parseInt(parts[1], 10) || null;
    } else {
      length = parseInt(args, 10) || null;
    }
  }

  const typeMap: Record<string, AcEnumDbColumnType> = {
    'INT': AcEnumDbColumnType.Integer,
    'INTEGER': AcEnumDbColumnType.Integer,
    'TINYINT': AcEnumDbColumnType.Integer,
    'SMALLINT': AcEnumDbColumnType.Integer,
    'MEDIUMINT': AcEnumDbColumnType.Integer,
    'BIGINT': AcEnumDbColumnType.BigInteger,
    'SERIAL': AcEnumDbColumnType.Integer,
    'BIGSERIAL': AcEnumDbColumnType.BigInteger,
    'FLOAT': AcEnumDbColumnType.Float,
    'REAL': AcEnumDbColumnType.Float,
    'DOUBLE': AcEnumDbColumnType.Double,
    'DOUBLE PRECISION': AcEnumDbColumnType.Double,
    'DECIMAL': AcEnumDbColumnType.Decimal,
    'NUMERIC': AcEnumDbColumnType.Decimal,
    'MONEY': AcEnumDbColumnType.Decimal,
    'BOOLEAN': AcEnumDbColumnType.Boolean,
    'BOOL': AcEnumDbColumnType.Boolean,
    'BIT': AcEnumDbColumnType.Boolean,
    'CHAR': AcEnumDbColumnType.String,
    'CHARACTER': AcEnumDbColumnType.String,
    'VARCHAR': AcEnumDbColumnType.String,
    'CHARACTER VARYING': AcEnumDbColumnType.String,
    'NVARCHAR': AcEnumDbColumnType.String,
    'NCHAR': AcEnumDbColumnType.String,
    'TEXT': AcEnumDbColumnType.Text,
    'TINYTEXT': AcEnumDbColumnType.Text,
    'MEDIUMTEXT': AcEnumDbColumnType.Text,
    'LONGTEXT': AcEnumDbColumnType.Text,
    'CLOB': AcEnumDbColumnType.Text,
    'DATE': AcEnumDbColumnType.Date,
    'DATETIME': AcEnumDbColumnType.Datetime,
    'DATETIME2': AcEnumDbColumnType.Datetime,
    'SMALLDATETIME': AcEnumDbColumnType.Datetime,
    'TIMESTAMP': AcEnumDbColumnType.Timestamp,
    'TIMESTAMPTZ': AcEnumDbColumnType.Timestamp,
    'TIMESTAMP WITHOUT TIME ZONE': AcEnumDbColumnType.Timestamp,
    'TIMESTAMP WITH TIME ZONE': AcEnumDbColumnType.Timestamp,
    'TIME': AcEnumDbColumnType.Time,
    'TIMETZ': AcEnumDbColumnType.Time,
    'UUID': AcEnumDbColumnType.Uuid,
    'UNIQUEIDENTIFIER': AcEnumDbColumnType.Uuid,
    'JSON': AcEnumDbColumnType.Json,
    'JSONB': AcEnumDbColumnType.Jsonb,
    'BLOB': AcEnumDbColumnType.Blob,
    'TINYBLOB': AcEnumDbColumnType.Blob,
    'MEDIUMBLOB': AcEnumDbColumnType.Blob,
    'LONGBLOB': AcEnumDbColumnType.Blob,
    'BYTEA': AcEnumDbColumnType.Blob,
    'BINARY': AcEnumDbColumnType.Blob,
    'VARBINARY': AcEnumDbColumnType.Blob,
    'IMAGE': AcEnumDbColumnType.Blob,
    'XML': AcEnumDbColumnType.Xml,
    'ENUM': AcEnumDbColumnType.Enum,
    'SET': AcEnumDbColumnType.Enum,
  };

  const mapped = typeMap[baseName] ?? AcEnumDbColumnType.String;

  // SERIAL implies auto-increment
  return { type: mapped, length, precision, scale, enumValues };
}

function parseFkAction(action: string | undefined): AcEnumDbFkAction {
  if (!action) return AcEnumDbFkAction.NoAction;
  const upper = action.toUpperCase().trim();
  if (upper.includes('CASCADE')) return AcEnumDbFkAction.Cascade;
  if (upper.includes('SET NULL')) return AcEnumDbFkAction.SetNull;
  if (upper.includes('SET DEFAULT')) return AcEnumDbFkAction.SetDefault;
  if (upper.includes('RESTRICT')) return AcEnumDbFkAction.Restrict;
  return AcEnumDbFkAction.NoAction;
}

/** Unquote identifier: `name`, "name", [name] → name */
function unquote(id: string): string {
  return id.replace(/^[`"\[]+|[`"\]]+$/g, '').trim();
}

/**
 * Import SQL DDL into the store.
 * @param sql       the DDL SQL text
 * @param store     target store to populate
 * @param schemaId  schema to assign tables to
 */
export function importSqlDdl(sql: string, store: AcDbStore, schemaId: string): AcDbImportResult {
  const result: AcDbImportResult = { tables: 0, columns: 0, relationships: 0, indexes: 0, errors: [] };

  // Normalize: remove comments, collapse whitespace
  const cleaned = sql
    .replace(/--[^\n]*/g, '')          // line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
    .replace(/\r\n/g, '\n');

  // Track created tables for FK resolution: tableName (lowercase) → tableId
  const tableMap = new Map<string, string>();
  // Track columns: tableName.columnName (lowercase) → columnId
  const colMap = new Map<string, string>();
  // Deferred FK storage (resolved after all tables are parsed)
  const deferredFKs: { fromTable: string; fromCol: string; toTable: string; toCol: string; onDelete?: string; onUpdate?: string }[] = [];

  // ── Parse CREATE TABLE ─────────────────────────────────────────────────────
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"\[\w.]+)\s*\(([\s\S]*?)\)\s*;/gi;
  let match: RegExpExecArray | null;

  while ((match = createTableRegex.exec(cleaned)) !== null) {
    const rawTableName = unquote(match[1].replace(/^[\w.]+\./, '')); // strip schema prefix
    const tableId = crypto.randomUUID();
    const body = match[2];

    const table = store.addTable({
      tableId,
      schemaId,
      tableName: rawTableName,
    });
    tableMap.set(rawTableName.toLowerCase(), tableId);
    result.tables++;

    // Split body by commas, but respect parentheses
    const lines = splitByTopLevelComma(body);
    let ordinal = 0;
    const pkCols: string[] = [];
    const checks: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Table-level PRIMARY KEY
      const pkMatch = trimmed.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkCols.push(...pkMatch[1].split(',').map(c => unquote(c.trim())));
        continue;
      }

      // Table-level UNIQUE
      if (/^UNIQUE\s+(KEY|INDEX|CONSTRAINT)?\s*/i.test(trimmed)) continue;

      // Table-level FOREIGN KEY
      const fkMatch = trimmed.match(
        /(?:CONSTRAINT\s+[`"\[\w]+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([`"\[\w.]+)\s*\(([^)]+)\)(?:\s+ON\s+DELETE\s+(\w+(?:\s+\w+)?))?(?:\s+ON\s+UPDATE\s+(\w+(?:\s+\w+)?))?/i
      );
      if (fkMatch) {
        const fkColName = unquote(fkMatch[1].trim());
        const refTable = unquote(fkMatch[2].replace(/^[\w.]+\./, ''));
        const refCol = unquote(fkMatch[3].trim());
        // Defer FK creation until all tables are parsed
        deferredFKs.push({ fromTable: rawTableName, fromCol: fkColName, toTable: refTable, toCol: refCol, onDelete: fkMatch[4], onUpdate: fkMatch[5] });
        continue;
      }

      // Table-level CHECK
      const checkMatch = trimmed.match(/^CHECK\s*\((.+)\)\s*$/i);
      if (checkMatch) {
        checks.push(checkMatch[1]);
        continue;
      }

      // Skip other constraints
      if (/^(CONSTRAINT|KEY|INDEX|UNIQUE)/i.test(trimmed)) continue;

      // Column definition
      const colMatch = trimmed.match(/^([`"\[\w]+)\s+(.+)$/);
      if (!colMatch) continue;

      const colName = unquote(colMatch[1]);
      const rest = colMatch[2];

      // Extract type (first word or first word with parens)
      const typeMatch = rest.match(/^([A-Za-z_ ]+(?:\([^)]*\))?)/);
      if (!typeMatch) continue;

      const rawColType = typeMatch[1].trim();
      const afterType = rest.slice(typeMatch[0].length).toUpperCase();

      const { type, length, precision, scale, enumValues } = mapSqlType(rawColType);

      const isPk = afterType.includes('PRIMARY KEY');
      const isAutoInc = afterType.includes('AUTO_INCREMENT') || afterType.includes('AUTOINCREMENT') ||
                        /SERIAL/i.test(rawColType) || afterType.includes('IDENTITY');
      const isNullable = !afterType.includes('NOT NULL') && !isPk;
      const isUnique = afterType.includes('UNIQUE');

      // Extract DEFAULT value
      let defaultValue: string | null = null;
      const defMatch = rest.match(/DEFAULT\s+('(?:[^'\\]|\\.)*'|[^\s,]+)/i);
      if (defMatch) defaultValue = defMatch[1];

      const columnId = crypto.randomUUID();
      store.addColumn({
        columnId,
        tableId,
        columnName: colName,
        columnType: type,
        length,
        precision,
        scale,
        primaryKey: isPk,
        autoIncrement: isAutoInc,
        nullable: isNullable,
        unique: isUnique,
        defaultValue,
        ordinalPosition: ordinal++,
        enumValues,
      });
      colMap.set(`${rawTableName.toLowerCase()}.${colName.toLowerCase()}`, columnId);
      result.columns++;
    }

    // Apply table-level PKs
    for (const pkCol of pkCols) {
      const key = `${rawTableName.toLowerCase()}.${pkCol.toLowerCase()}`;
      const colId = colMap.get(key);
      if (colId) {
        store.updateColumn(colId, { primaryKey: true });
      }
    }

    // Apply checks
    if (checks.length) {
      store.updateTable(tableId, { checks } as any);
    }
  }

  // ── Deferred FK resolution ───────────────────────────────────────────────────
  for (const fk of deferredFKs) {
    const fromTableId = tableMap.get(fk.fromTable.toLowerCase());
    const toTableId = tableMap.get(fk.toTable.toLowerCase());
    if (!fromTableId || !toTableId) {
      result.errors.push(`FK: cannot resolve table "${fk.fromTable}" → "${fk.toTable}"`);
      continue;
    }
    const fromColId = colMap.get(`${fk.fromTable.toLowerCase()}.${fk.fromCol.toLowerCase()}`);
    const toColId = colMap.get(`${fk.toTable.toLowerCase()}.${fk.toCol.toLowerCase()}`);
    if (!fromColId || !toColId) {
      result.errors.push(`FK: cannot resolve column "${fk.fromCol}" → "${fk.toCol}"`);
      continue;
    }
    store.addRelationship({
      relationshipId: crypto.randomUUID(),
      schemaId,
      label: '',
      type: AcEnumDbRelationType.OneToMany,
      fromTableId,
      fromColumnId: fromColId,
      toTableId,
      toColumnId: toColId,
      onDelete: parseFkAction(fk.onDelete),
      onUpdate: parseFkAction(fk.onUpdate),
    });
    // Mark the FK column
    store.updateColumn(fromColId, { foreignKeyTableId: toTableId, foreignKeyColumnId: toColId });
    result.relationships++;
  }

  // ── Parse CREATE INDEX ───────────────────────────────────────────────────────
  const createIndexRegex = /CREATE\s+(UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"\[\w]+)\s+ON\s+([`"\[\w.]+)\s*\(([^)]+)\)/gi;
  while ((match = createIndexRegex.exec(cleaned)) !== null) {
    const isUnique = !!match[1];
    const idxName = unquote(match[2]);
    const tblName = unquote(match[3].replace(/^[\w.]+\./, ''));
    const colNames = match[4].split(',').map(c => unquote(c.trim().replace(/\s+(ASC|DESC)$/i, '')));

    const tblId = tableMap.get(tblName.toLowerCase());
    if (!tblId) {
      result.errors.push(`INDEX: cannot find table "${tblName}"`);
      continue;
    }
    const colIds = colNames.map(cn => colMap.get(`${tblName.toLowerCase()}.${cn.toLowerCase()}`)).filter(Boolean) as string[];
    if (colIds.length) {
      store.addIndex({
        indexId: crypto.randomUUID(),
        tableId: tblId,
        indexName: idxName,
        unique: isUnique,
        columnIds: colIds,
      });
      result.indexes++;
    }
  }

  // ── Parse ALTER TABLE ADD CONSTRAINT FK ──────────────────────────────────────
  const alterFkRegex = /ALTER\s+TABLE\s+([`"\[\w.]+)\s+ADD\s+(?:CONSTRAINT\s+[`"\[\w]+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([`"\[\w.]+)\s*\(([^)]+)\)(?:\s+ON\s+DELETE\s+(\w+(?:\s+\w+)?))?(?:\s+ON\s+UPDATE\s+(\w+(?:\s+\w+)?))?/gi;
  while ((match = alterFkRegex.exec(cleaned)) !== null) {
    const fromTbl = unquote(match[1].replace(/^[\w.]+\./, ''));
    const fromCol = unquote(match[2].trim());
    const toTbl = unquote(match[3].replace(/^[\w.]+\./, ''));
    const toCol = unquote(match[4].trim());

    const fromTableId = tableMap.get(fromTbl.toLowerCase());
    const toTableId = tableMap.get(toTbl.toLowerCase());
    const fromColId = fromTableId ? colMap.get(`${fromTbl.toLowerCase()}.${fromCol.toLowerCase()}`) : undefined;
    const toColId = toTableId ? colMap.get(`${toTbl.toLowerCase()}.${toCol.toLowerCase()}`) : undefined;

    if (fromTableId && toTableId && fromColId && toColId) {
      store.addRelationship({
        relationshipId: crypto.randomUUID(),
        schemaId,
        label: '',
        type: AcEnumDbRelationType.OneToMany,
        fromTableId,
        fromColumnId: fromColId,
        toTableId,
        toColumnId: toColId,
        onDelete: parseFkAction(match[5]),
        onUpdate: parseFkAction(match[6]),
      });
      store.updateColumn(fromColId, { foreignKeyTableId: toTableId, foreignKeyColumnId: toColId });
      result.relationships++;
    } else {
      result.errors.push(`ALTER FK: cannot resolve "${fromTbl}.${fromCol}" → "${toTbl}.${toCol}"`);
    }
  }

  return result;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Split a string by commas, but respect parentheses depth. */
function splitByTopLevelComma(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}
