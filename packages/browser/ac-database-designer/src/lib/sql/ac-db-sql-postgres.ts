import { AcDbSqlBase } from './ac-db-sql-base';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcDbColumn } from '../models/ac-db-column.model';

export class AcDbSqlPostgres extends AcDbSqlBase {
  readonly dialect = AcEnumDbDialect.PostgreSQL;

  readonly columnTypeMap: Partial<Record<AcEnumDbColumnType, string>> = {
    [AcEnumDbColumnType.AutoIncrement]: 'SERIAL',
    [AcEnumDbColumnType.AutoNumber]:    'VARCHAR(50)',
    [AcEnumDbColumnType.AutoIndex]:     'SERIAL',
    [AcEnumDbColumnType.Blob]:          'BYTEA',
    [AcEnumDbColumnType.Boolean]:       'BOOLEAN',
    [AcEnumDbColumnType.Char]:          'CHAR',
    [AcEnumDbColumnType.Date]:          'DATE',
    [AcEnumDbColumnType.Datetime]:      'TIMESTAMP',
    [AcEnumDbColumnType.Decimal]:       'NUMERIC',
    [AcEnumDbColumnType.Double]:        'DOUBLE PRECISION',
    [AcEnumDbColumnType.Encrypted]:     'TEXT',
    [AcEnumDbColumnType.Float]:         'REAL',
    [AcEnumDbColumnType.Integer]:       'INTEGER',
    [AcEnumDbColumnType.BigInteger]:    'BIGINT',
    [AcEnumDbColumnType.SmallInteger]:  'SMALLINT',
    [AcEnumDbColumnType.Json]:          'JSON',
    [AcEnumDbColumnType.Jsonb]:         'JSONB',
    [AcEnumDbColumnType.Password]:      'VARCHAR(255)',
    [AcEnumDbColumnType.String]:        'VARCHAR',
    [AcEnumDbColumnType.Text]:          'TEXT',
    [AcEnumDbColumnType.Time]:          'TIME',
    [AcEnumDbColumnType.Timestamp]:     'TIMESTAMPTZ',
    [AcEnumDbColumnType.Uuid]:          'UUID',
    [AcEnumDbColumnType.VarChar]:       'VARCHAR',
    [AcEnumDbColumnType.YesNo]:         'BOOLEAN',
    [AcEnumDbColumnType.Binary]:        'BYTEA',
    [AcEnumDbColumnType.Xml]:           'XML',
    [AcEnumDbColumnType.Unknown]:       'TEXT',
  };

  protected override quoteIdentifier(name: string): string { return `"${name}"`; }
  protected override autoIncrementClause(): string { return ''; } // SERIAL handles it

  override columnDef(col: AcDbColumn): string {
    // For SERIAL types, don't add AUTO_INCREMENT clause - the type itself handles it
    const isSerial = col.autoIncrement &&
      (col.columnType === AcEnumDbColumnType.AutoIncrement || col.columnType === AcEnumDbColumnType.Integer);
    const typeStr = isSerial ? 'SERIAL' : this.mapColumnType(col);
    const parts: string[] = [this.q(col.columnName), typeStr];
    if (!col.nullable || col.primaryKey) parts.push('NOT NULL');
    if (col.defaultValue !== null && col.defaultValue !== undefined && !isSerial) {
      parts.push(`DEFAULT ${col.defaultValue}`);
    }
    if (col.unique && !col.primaryKey) parts.push('UNIQUE');
    return parts.join(' ');
  }

  override generateCreateView(view: import('../models/ac-db-view.model').AcDbView): string {
    return `CREATE OR REPLACE VIEW ${this.q(view.viewName)} AS\n${view.viewQuery};`;
  }

  override generateCreateTrigger(trigger: import('../models/ac-db-trigger.model').AcDbTrigger, tableName: string): string {
    return [
      `CREATE OR REPLACE FUNCTION ${this.q(`fn_${trigger.triggerName}`)}() RETURNS TRIGGER AS $$`,
      `BEGIN`,
      trigger.triggerCode,
      `  RETURN NEW;`,
      `END;`,
      `$$ LANGUAGE plpgsql;`,
      ``,
      `CREATE TRIGGER ${this.q(trigger.triggerName)}`,
      `${trigger.timing} ${trigger.event} ON ${this.q(tableName)}`,
      `FOR EACH ROW EXECUTE PROCEDURE ${this.q(`fn_${trigger.triggerName}`)}();`,
    ].join('\n');
  }
}
