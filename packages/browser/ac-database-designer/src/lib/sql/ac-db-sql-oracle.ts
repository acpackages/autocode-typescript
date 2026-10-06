import { AcDbSqlBase } from './ac-db-sql-base';
import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcEnumDbColumnType } from '../enums/ac-enum-db-column-type';
import { AcDbColumn } from '../models/ac-db-column.model';

export class AcDbSqlOracle extends AcDbSqlBase {
  readonly dialect = AcEnumDbDialect.Oracle;

  readonly columnTypeMap: Partial<Record<AcEnumDbColumnType, string>> = {
    [AcEnumDbColumnType.AutoIncrement]: 'NUMBER',
    [AcEnumDbColumnType.AutoNumber]:    'VARCHAR2(50)',
    [AcEnumDbColumnType.AutoIndex]:     'NUMBER',
    [AcEnumDbColumnType.Blob]:          'BLOB',
    [AcEnumDbColumnType.Boolean]:       'NUMBER(1)',
    [AcEnumDbColumnType.Char]:          'CHAR',
    [AcEnumDbColumnType.Date]:          'DATE',
    [AcEnumDbColumnType.Datetime]:      'TIMESTAMP',
    [AcEnumDbColumnType.Decimal]:       'NUMBER',
    [AcEnumDbColumnType.Double]:        'BINARY_DOUBLE',
    [AcEnumDbColumnType.Encrypted]:     'VARCHAR2(4000)',
    [AcEnumDbColumnType.Float]:         'BINARY_FLOAT',
    [AcEnumDbColumnType.Integer]:       'NUMBER(10)',
    [AcEnumDbColumnType.BigInteger]:    'NUMBER(19)',
    [AcEnumDbColumnType.SmallInteger]:  'NUMBER(5)',
    [AcEnumDbColumnType.Json]:          'CLOB',
    [AcEnumDbColumnType.Jsonb]:         'CLOB',
    [AcEnumDbColumnType.Password]:      'VARCHAR2(255)',
    [AcEnumDbColumnType.String]:        'VARCHAR2',
    [AcEnumDbColumnType.Text]:          'CLOB',
    [AcEnumDbColumnType.Time]:          'TIMESTAMP',
    [AcEnumDbColumnType.Timestamp]:     'TIMESTAMP WITH TIME ZONE',
    [AcEnumDbColumnType.Uuid]:          'RAW(16)',
    [AcEnumDbColumnType.VarChar]:       'VARCHAR2',
    [AcEnumDbColumnType.YesNo]:         'NUMBER(1)',
    [AcEnumDbColumnType.Binary]:        'RAW',
    [AcEnumDbColumnType.Xml]:           'XMLTYPE',
    [AcEnumDbColumnType.Enum]:          'VARCHAR2(255)',
    [AcEnumDbColumnType.Unknown]:       'VARCHAR2(4000)',
  };

  protected override quoteIdentifier(name: string): string { return `"${name}"`; }
  protected override autoIncrementClause(): string { return 'GENERATED ALWAYS AS IDENTITY'; }

  override columnDef(col: AcDbColumn): string {
    const typeStr = this.mapColumnType(col);
    const parts: string[] = [this.q(col.columnName), typeStr];
    if (col.defaultValue !== null && col.defaultValue !== undefined) {
      parts.push(`DEFAULT ${col.defaultValue}`);
    }
    if (!col.nullable || col.primaryKey) parts.push('NOT NULL');
    if (col.autoIncrement) parts.push(this.autoIncrementClause());
    if (col.unique && !col.primaryKey) parts.push('UNIQUE');
    return parts.join(' ');
  }

  override generateCreateView(view: import('../models/ac-db-view.model').AcDbView): string {
    return `CREATE OR REPLACE VIEW ${this.q(view.viewName)} AS\n${view.viewQuery};`;
  }

  override generateCreateTrigger(trigger: import('../models/ac-db-trigger.model').AcDbTrigger, tableName: string): string {
    return [
      `CREATE OR REPLACE TRIGGER ${this.q(trigger.triggerName)}`,
      `${trigger.timing} ${trigger.event} ON ${this.q(tableName)}`,
      `FOR EACH ROW`,
      `BEGIN`,
      trigger.triggerCode,
      `END;`,
      `/`,
    ].join('\n');
  }

  override generateCreateStoredProcedure(sp: import('../models/ac-db-stored-procedure.model').AcDbStoredProcedure): string {
    return [
      `CREATE OR REPLACE PROCEDURE ${this.q(sp.spName)}`,
      `AS`,
      `BEGIN`,
      sp.spCode,
      `END;`,
      `/`,
    ].join('\n');
  }

  override generateCreateFunction(fn: import('../models/ac-db-function.model').AcDbFunction): string {
    return [
      `CREATE OR REPLACE FUNCTION ${this.q(fn.functionName)}`,
      `RETURN ${fn.returnsType || 'VARCHAR2'}`,
      `AS`,
      `BEGIN`,
      fn.functionCode,
      `END;`,
      `/`,
    ].join('\n');
  }
}
