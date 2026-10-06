import { AcEnumDbDialect } from '../enums/ac-enum-db-dialect';
import { AcDbSqlBase } from './ac-db-sql-base';
import { AcDbSqlMysql } from './ac-db-sql-mysql';
import { AcDbSqlPostgres } from './ac-db-sql-postgres';
import { AcDbSqlSqlite } from './ac-db-sql-sqlite';
import { AcDbSqlMssql } from './ac-db-sql-mssql';
import { AcDbSqlOracle } from './ac-db-sql-oracle';

const _generators = new Map<AcEnumDbDialect, AcDbSqlBase>([
  [AcEnumDbDialect.MySQL,      new AcDbSqlMysql()],
  [AcEnumDbDialect.PostgreSQL, new AcDbSqlPostgres()],
  [AcEnumDbDialect.SQLite,     new AcDbSqlSqlite()],
  [AcEnumDbDialect.MSSQL,      new AcDbSqlMssql()],
  [AcEnumDbDialect.Oracle,     new AcDbSqlOracle()],
]);

export function getSqlGenerator(dialect: AcEnumDbDialect): AcDbSqlBase {
  return _generators.get(dialect) ?? _generators.get(AcEnumDbDialect.MySQL)!;
}
