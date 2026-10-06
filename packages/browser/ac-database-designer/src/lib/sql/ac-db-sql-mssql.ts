import { AcDbSqlBase } from './ac-db-sql-base';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcDbColumn } from '../models/ac-db-column.model';

export class AcDbSqlMssql extends AcDbSqlBase {
  readonly dialect = AcEnumDbDialect.MSSQL;

  readonly columnTypeMap: Partial<Record<AcEnumDbColumnType, string>> = {
    [AcEnumDbColumnType.AutoIncrement]: 'INT',
    [AcEnumDbColumnType.AutoNumber]:    'VARCHAR(50)',
    [AcEnumDbColumnType.AutoIndex]:     'INT',
    [AcEnumDbColumnType.Blob]:          'VARBINARY(MAX)',
    [AcEnumDbColumnType.Boolean]:       'BIT',
    [AcEnumDbColumnType.Char]:          'CHAR',
    [AcEnumDbColumnType.Date]:          'DATE',
    [AcEnumDbColumnType.Datetime]:      'DATETIME2',
    [AcEnumDbColumnType.Decimal]:       'DECIMAL',
    [AcEnumDbColumnType.Double]:        'FLOAT',
    [AcEnumDbColumnType.Encrypted]:     'NVARCHAR(MAX)',
    [AcEnumDbColumnType.Float]:         'REAL',
    [AcEnumDbColumnType.Integer]:       'INT',
    [AcEnumDbColumnType.BigInteger]:    'BIGINT',
    [AcEnumDbColumnType.SmallInteger]:  'SMALLINT',
    [AcEnumDbColumnType.Json]:          'NVARCHAR(MAX)',
    [AcEnumDbColumnType.Jsonb]:         'NVARCHAR(MAX)',
    [AcEnumDbColumnType.Password]:      'NVARCHAR(255)',
    [AcEnumDbColumnType.String]:        'NVARCHAR',
    [AcEnumDbColumnType.Text]:          'NVARCHAR(MAX)',
    [AcEnumDbColumnType.Time]:          'TIME',
    [AcEnumDbColumnType.Timestamp]:     'DATETIME2',
    [AcEnumDbColumnType.Uuid]:          'UNIQUEIDENTIFIER',
    [AcEnumDbColumnType.VarChar]:       'NVARCHAR',
    [AcEnumDbColumnType.YesNo]:         'BIT',
    [AcEnumDbColumnType.Binary]:        'BINARY',
    [AcEnumDbColumnType.Xml]:           'XML',
    [AcEnumDbColumnType.Unknown]:       'NVARCHAR(MAX)',
  };

  protected override quoteIdentifier(name: string): string { return `[${name}]`; }

  override columnDef(col: AcDbColumn): string {
    const parts: string[] = [this.q(col.columnName), this.mapColumnType(col)];
    if (col.autoIncrement) parts.push('IDENTITY(1,1)');
    if (!col.nullable || col.primaryKey) parts.push('NOT NULL');
    if (col.defaultValue !== null && col.defaultValue !== undefined && !col.autoIncrement) {
      parts.push(`DEFAULT ${col.defaultValue}`);
    }
    if (col.unique && !col.primaryKey) parts.push('UNIQUE');
    return parts.join(' ');
  }

  override generateCreateView(view: import('../models/ac-db-view.model').AcDbView): string {
    return `CREATE OR ALTER VIEW ${this.q(view.viewName)} AS\n${view.viewQuery};`;
  }

  override generateCreateIndex(index: import('../models/ac-db-index.model').AcDbIndex, table: import('../models/ac-db-table.model').AcDbTable, allColumns: import('../models/ac-db-column.model').AcDbColumn[]): string {
    const cols = index.columnIds.map(id => {
      const col = allColumns.find(c => c.columnId === id);
      return col ? this.q(col.columnName) : id;
    });
    const unique = index.unique ? 'UNIQUE ' : '';
    return `CREATE ${unique}NONCLUSTERED INDEX ${this.q(index.indexName)} ON ${this.q(table.tableName)} (${cols.join(', ')});`;
  }
}
