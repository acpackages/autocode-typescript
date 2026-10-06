import { AcDbSqlBase } from './ac-db-sql-base';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';

export class AcDbSqlMysql extends AcDbSqlBase {
  readonly dialect = AcEnumDbDialect.MySQL;

  readonly columnTypeMap: Partial<Record<AcEnumDbColumnType, string>> = {
    [AcEnumDbColumnType.AutoIncrement]: 'INT',
    [AcEnumDbColumnType.AutoNumber]:    'VARCHAR(50)',
    [AcEnumDbColumnType.AutoIndex]:     'INT',
    [AcEnumDbColumnType.Blob]:          'LONGBLOB',
    [AcEnumDbColumnType.Boolean]:       'TINYINT(1)',
    [AcEnumDbColumnType.Char]:          'CHAR',
    [AcEnumDbColumnType.Date]:          'DATE',
    [AcEnumDbColumnType.Datetime]:      'DATETIME',
    [AcEnumDbColumnType.Decimal]:       'DECIMAL',
    [AcEnumDbColumnType.Double]:        'DOUBLE',
    [AcEnumDbColumnType.Encrypted]:     'TEXT',
    [AcEnumDbColumnType.Enum]:          'ENUM',
    [AcEnumDbColumnType.Float]:         'FLOAT',
    [AcEnumDbColumnType.Integer]:       'INT',
    [AcEnumDbColumnType.BigInteger]:    'BIGINT',
    [AcEnumDbColumnType.SmallInteger]:  'SMALLINT',
    [AcEnumDbColumnType.Json]:          'JSON',
    [AcEnumDbColumnType.Jsonb]:         'JSON',
    [AcEnumDbColumnType.Password]:      'VARCHAR(255)',
    [AcEnumDbColumnType.String]:        'VARCHAR',
    [AcEnumDbColumnType.Text]:          'TEXT',
    [AcEnumDbColumnType.Time]:          'TIME',
    [AcEnumDbColumnType.Timestamp]:     'TIMESTAMP',
    [AcEnumDbColumnType.Uuid]:          'CHAR(36)',
    [AcEnumDbColumnType.VarChar]:       'VARCHAR',
    [AcEnumDbColumnType.YesNo]:         'TINYINT(1)',
    [AcEnumDbColumnType.Binary]:        'BINARY',
    [AcEnumDbColumnType.Xml]:           'TEXT',
    [AcEnumDbColumnType.Unknown]:       'TEXT',
  };

  protected override quoteIdentifier(name: string): string { return `\`${name}\``; }
  protected override autoIncrementClause(): string { return 'AUTO_INCREMENT'; }

  override columnDef(col: import('../models/ac-db-column.model').AcDbColumn): string {
    const base = super.columnDef(col);
    // For AUTO_INCREMENT columns, MySQL requires NOT NULL + AUTO_INCREMENT in correct order
    // base class handles this correctly already
    return base;
  }
}
