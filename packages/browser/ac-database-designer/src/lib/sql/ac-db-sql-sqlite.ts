import { AcDbSqlBase } from './ac-db-sql-base';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcDbColumn } from '../models/ac-db-column.model';

export class AcDbSqlSqlite extends AcDbSqlBase {
  readonly dialect = AcEnumDbDialect.SQLite;

  readonly columnTypeMap: Partial<Record<AcEnumDbColumnType, string>> = {
    [AcEnumDbColumnType.AutoIncrement]: 'INTEGER',
    [AcEnumDbColumnType.AutoNumber]:    'TEXT',
    [AcEnumDbColumnType.AutoIndex]:     'INTEGER',
    [AcEnumDbColumnType.Blob]:          'BLOB',
    [AcEnumDbColumnType.Boolean]:       'INTEGER',
    [AcEnumDbColumnType.Char]:          'TEXT',
    [AcEnumDbColumnType.Date]:          'TEXT',
    [AcEnumDbColumnType.Datetime]:      'TEXT',
    [AcEnumDbColumnType.Decimal]:       'REAL',
    [AcEnumDbColumnType.Double]:        'REAL',
    [AcEnumDbColumnType.Encrypted]:     'TEXT',
    [AcEnumDbColumnType.Float]:         'REAL',
    [AcEnumDbColumnType.Integer]:       'INTEGER',
    [AcEnumDbColumnType.BigInteger]:    'INTEGER',
    [AcEnumDbColumnType.SmallInteger]:  'INTEGER',
    [AcEnumDbColumnType.Json]:          'TEXT',
    [AcEnumDbColumnType.Jsonb]:         'TEXT',
    [AcEnumDbColumnType.Password]:      'TEXT',
    [AcEnumDbColumnType.String]:        'TEXT',
    [AcEnumDbColumnType.Text]:          'TEXT',
    [AcEnumDbColumnType.Time]:          'TEXT',
    [AcEnumDbColumnType.Timestamp]:     'TEXT',
    [AcEnumDbColumnType.Uuid]:          'TEXT',
    [AcEnumDbColumnType.VarChar]:       'TEXT',
    [AcEnumDbColumnType.YesNo]:         'INTEGER',
    [AcEnumDbColumnType.Binary]:        'BLOB',
    [AcEnumDbColumnType.Xml]:           'TEXT',
    [AcEnumDbColumnType.Unknown]:       'TEXT',
  };

  protected override quoteIdentifier(name: string): string { return `"${name}"`; }

  override columnDef(col: AcDbColumn): string {
    const parts: string[] = [this.q(col.columnName), this.mapColumnType(col)];
    // SQLite: INTEGER PRIMARY KEY is the rowid alias (auto-increment)
    if (col.primaryKey && col.autoIncrement) {
      parts.push('PRIMARY KEY AUTOINCREMENT');
      if (!col.nullable) parts.push('NOT NULL');
      return parts.join(' ');
    }
    if (!col.nullable || col.primaryKey) parts.push('NOT NULL');
    if (col.defaultValue !== null && col.defaultValue !== undefined) {
      parts.push(`DEFAULT ${col.defaultValue}`);
    }
    if (col.unique && !col.primaryKey) parts.push('UNIQUE');
    return parts.join(' ');
  }

  // SQLite doesn't support CREATE OR REPLACE VIEW
  override generateCreateView(view: import('../models/ac-db-view.model').AcDbView): string {
    return `DROP VIEW IF EXISTS ${this.q(view.viewName)};\nCREATE VIEW ${this.q(view.viewName)} AS\n${view.viewQuery};`;
  }

  // SQLite doesn't have inline FK by default — FK pragma needed
  override generateFullScript(schema: import('../models/ac-db-schema.model').AcDbSchema, store: import('../store/ac-db-store').AcDbStore): string {
    return `PRAGMA foreign_keys = ON;\n\n` + super.generateFullScript(schema, store);
  }
}
