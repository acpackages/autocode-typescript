/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-prototype-builtins */
// ac-mysql-dao.ts

import { Connection, ConnectionOptions, createConnection } from 'mysql2/promise';
import { AcBaseSqlDao, AcSqlDaoResult } from "@autocode-ts/ac-sql";
import { AcDDFunction, AcDDStoredProcedure, AcDDTable, AcDDTableColumn, AcDDTrigger, AcDDView, AcDDViewColumn, AcEnumDDColumnFormat, AcEnumDDColumnProperty, AcEnumDDRowOperation, AcEnumDDSelectMode } from '@autocode-ts/ac-data-dictionary';
import { AcEncryption, AcResult } from '@autocode-ts/autocode';

export class AcMysqlDao extends AcBaseSqlDao {
  private async _getConnection(): Promise<Connection> {
    const config: ConnectionOptions = {
      host: this.sqlConnection.hostname,
      port: this.sqlConnection.port,
      user: this.sqlConnection.username,
      password: this.sqlConnection.password,
      database: this.sqlConnection.database,
      namedPlaceholders: true
    };
    const conn = await createConnection(config);
    return conn;
  }

  private async _getConnectionWithoutDatabase(): Promise<Connection> {
    const config: ConnectionOptions = {
      host: this.sqlConnection.hostname,
      port: this.sqlConnection.port,
      user: this.sqlConnection.username,
      password: this.sqlConnection.password
    };
    const conn = await createConnection(config);
    return conn;
  }

  override async checkDatabaseExist(): Promise<AcResult> {
    const result = new AcResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnectionWithoutDatabase();
      const statement = 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?';
      const [rows] = await db.execute(statement, [this.sqlConnection.database]);
      const exists = Array.isArray(rows) && rows.length > 0;
      result.setSuccess({ value: exists, message: exists ? 'Database exists' : 'Database does not exist' });
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.end();
    }
    return result;
  }

  override async checkTableExist({ tableName }: { tableName: string }): Promise<AcResult> {
    const result = new AcResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = 'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?';
      const [rows] = await db.execute(statement, [this.sqlConnection.database, tableName]);
      const exists = Array.isArray(rows) && rows.length > 0;
      result.setSuccess({ value: exists, message: exists ? 'Table exists' : 'Table does not exist' });
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.end();
    }
    return result;
  }

  override async createDatabase(): Promise<AcResult> {
    const result = new AcResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnectionWithoutDatabase();
      const statement = `CREATE DATABASE IF NOT EXISTS \`${this.sqlConnection.database}\``;
      await db.execute(statement);
      result.setSuccess({ value: true, message: 'Database created' });
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.end();
    }
    return result;
  }

  override async deleteRows({
    tableName,
    condition = '',
    parameters = {},
  }: {
    tableName: string;
    condition?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Delete });
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const whereClause = condition ? `WHERE ${condition}` : '';
      const statement = `DELETE FROM \`${tableName}\` ${whereClause}`;
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: parameters,
      });
      const [res] = await db.execute(updatedStatement, statementParametersMap!);
      result.affectedRowsCount = (res as any).affectedRows;
      result.setSuccess();
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.end();
    }
    return result;
  }

  override async executeMultipleSqlStatements({
    statements,
    parameters = {},
  }: {
    statements: string[];
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      await db.beginTransaction();
      for (const statement of statements) {
        const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
          statement,
          passedParameters: parameters,
        });
        await db.execute(updatedStatement, statementParametersMap!);
      }
      await db.commit();
      result.setSuccess();
    } catch (ex) {
      if (db) await db.rollback();
      result.setException({ exception: ex });
    } finally {
      if (db) await db.end();
    }
    return result;
  }

  override async executeStatement({
    statement,
    operation = AcEnumDDRowOperation.Unknown,
    parameters = {},
  }: {
    statement: string;
    operation?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation });
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: parameters,
      });
      await db.execute(updatedStatement, statementParametersMap!);
      result.setSuccess();
    } catch (ex) {
      result.setException({ exception: ex });
    } finally {
      if (db) await db.end();
    }
    return result;
  }

  override formatRow({
    row,
    columnFormats = {},
  }: {
    row: Record<string, any>;
    columnFormats?: Record<string, string[]>;
  }): Record<string, any> {
    const formattedRow = { ...row };
    for (const key in columnFormats) {
      const formats = columnFormats[key];
      if (formattedRow.hasOwnProperty(key)) {
        let value = formattedRow[key];
        if (typeof value === 'string') {
          if (formats.includes(AcEnumDDColumnFormat.Encrypt)) {
            value = AcEncryption.decrypt({ encryptedText: value });
          }
          if (formats.includes(AcEnumDDColumnFormat.Json)) {
            try {
              value = JSON.parse(value);
            } catch {
              value = null;
            }
          }
        }
        if (formats.includes(AcEnumDDColumnFormat.HideColumn)) {
          delete formattedRow[key];
        } else {
          formattedRow[key] = value;
        }
      }
    }
    return formattedRow;
  }

  override async getConnectionObject({ includeDatabase = true }: { includeDatabase?: boolean }): Promise<any> {
    return includeDatabase ? await this._getConnection() : await this._getConnectionWithoutDatabase();
  }

  override async getDatabaseFunctions(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = "SELECT ROUTINE_NAME, DATA_TYPE, CREATED, DEFINER FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = @databaseName AND ROUTINE_TYPE = 'Function'";
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@databaseName': this.sqlConnection.database },
      });
      const [results] = await db.execute(updatedStatement, statementParametersMap!);
      for (const row of results as any[]) {
        result.rows.push({
          [AcDDFunction.KeyFunctionName]: row['ROUTINE_NAME'],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getDatabaseStoredProcedures(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = "SELECT ROUTINE_NAME, CREATED, DEFINER FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = @databaseName AND ROUTINE_TYPE = 'PROCEDURE'";
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@databaseName': this.sqlConnection.database },
      });
      const [results] = await db.execute(updatedStatement, statementParametersMap!);
      for (const row of results as any[]) {
        result.rows.push({
          [AcDDStoredProcedure.KeyStoredProcedureName]: row['ROUTINE_NAME'],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getDatabaseTables(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = @databaseName AND TABLE_TYPE='BASE Table'";
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@databaseName': this.sqlConnection.database },
      });
      const [results] = await db.execute(updatedStatement, statementParametersMap!);
      for (const row of results as any[]) {
        result.rows.push({
          [AcDDTable.KeyTableName]: row['TABLE_NAME'],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getDatabaseTriggers(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = "SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_STATEMENT, ACTION_TIMING FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = @databaseName";
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@databaseName': this.sqlConnection.database },
      });
      const [results] = await db.execute(updatedStatement, statementParametersMap!);
      for (const row of results as any[]) {
        result.rows.push({
          [AcDDTrigger.KeyTriggerName]: row['TRIGGER_NAME'],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getDatabaseViews(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = @databaseName";
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@databaseName': this.sqlConnection.database },
      });
      const [results] = await db.execute(updatedStatement, statementParametersMap!);
      for (const row of results as any[]) {
        result.rows.push({
          [AcDDView.KeyViewName]: row['TABLE_NAME'],
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getRows({ statement, condition = "", parameters = {}, mode = AcEnumDDSelectMode.List, columnFormats = {} }: {
    statement: string;
    condition?: string;
    parameters?: Record<string, any>;
    mode?: string;
    columnFormats?: Record<string, string[]>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    let db: Connection | null = null;
    let updatedStatement:string = "";
    try {
      db = await this._getConnection();
      updatedStatement = statement;
      if (mode === AcEnumDDSelectMode.Count) {
        updatedStatement = `SELECT COUNT(*) AS records_count FROM (${statement}) AS records_list`;
      }
      if (condition) {
        updatedStatement += ` WHERE ${condition}`;
      }
      const { statement: finalStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement: updatedStatement,
        passedParameters: parameters,
      });
      const [results]:any = await db.execute(finalStatement, statementParametersMap!);
      if (mode === AcEnumDDSelectMode.Count) {
        const row = results[0];
        result.totalRows = row['records_count'];
      } else {
        for (const row of results as any[]) {
          result.rows.push(this.formatRow({ row, columnFormats }));
        }
      }
      result.setSuccess();
    } catch (ex: any) {
      console.error(updatedStatement,ex);
      result.setException({ exception: ex, stackTrace: ex.stack });
      result.value = updatedStatement;
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getTableColumns({ tableName }: { tableName: string }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = `DESCRIBE ${tableName};`;
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@tableName': tableName },
      });
      const [results] = await db.execute(statement);
      for (const row of results as any[]) {
        const properties: Record<string, any> = {};
        if (row['Null'] !== 'YES') {
          properties[AcEnumDDColumnProperty.NotNull] = false;
        }
        if (row['Key'] === 'PRI') {
          properties[AcEnumDDColumnProperty.PrimaryKey] = true;
        }
        if (row['Default'] !== null) {
          properties[AcEnumDDColumnProperty.DefaultValue] = row['Default'];
        }
        result.rows.push({
          [AcDDTableColumn.KeyColumnName]: row['Field'],
          [AcDDTableColumn.KeyColumnType]: row['Type'],
          [AcDDTableColumn.KeyColumnProperties]: properties,
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async getViewColumns({ viewName }: { viewName: string }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Select });
    let db: Connection | null = null;
    try {
      db = await this._getConnection();
      const statement = "DESCRIBE `@viewName`";
      const { statement: updatedStatement, statementParametersMap } = this.setSqlStatementParameters({
        statement,
        passedParameters: { '@viewName': viewName },
      });
      const [results] = await db.execute(updatedStatement, statementParametersMap!);
      for (const row of results as any[]) {
        const properties: Record<string, any> = {};
        if (row['Null'] !== 'YES') {
          properties[AcEnumDDColumnProperty.NotNull] = false;
        }
        if (row['Key'] === 'PRI') {
          properties[AcEnumDDColumnProperty.PrimaryKey] = true;
        }
        if (row['Default'] !== null) {
          properties[AcEnumDDColumnProperty.DefaultValue] = row['Default'];
        }
        result.rows.push({
          [AcDDViewColumn.KeyColumnName]: row['Field'],
          [AcDDViewColumn.KeyColumnType]: row['Type'],
          [AcDDViewColumn.KeyColumnProperties]: properties,
        });
      }
      result.setSuccess();
    } catch (ex: any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async insertRow({
    tableName,
    row,
  }: {
    tableName: string;
    row: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Insert });
    let db: Connection | undefined;
    try {
      db = await this._getConnection();
      const columns = Object.keys(row);
      const placeholders = columns.map((_, i) => `@p${i}`).join(', ');
      const statement = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const params: Record<string, any> = {};
      for (let i = 0; i < columns.length; i++) {
        params[`@p${i}`] = row[columns[i]];
      }
      const setParametersResult = this.setSqlStatementParameters({
        statement,
        passedParameters: params,
      });
      const updatedStatement = setParametersResult['statement'];
      const updatedParameterValues = setParametersResult['statementParametersMap'];
      const [insertResult]: any = await db.execute(updatedStatement, updatedParameterValues!);
      result.lastInsertedId = parseInt(insertResult.insertId);
      result.setSuccess();
    } catch (ex:any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async insertRows({
    tableName,
    rows,
  }: {
    tableName: string;
    rows: Array<Record<string, any>>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Insert });
    let db: Connection | undefined;
    try {
      db = await this._getConnection();
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((_, i) => `@p${i}`).join(', ');
        const statement = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        db.beginTransaction();
        for (const data of rows) {
          const params: Record<string, any> = {};
          for (let i = 0; i < columns.length; i++) {
            params[`@p${i}`] = data[columns[i]];
          }
          const setParametersResult = this.setSqlStatementParameters({
            statement,
            passedParameters: params,
          });
          const updatedStatement = setParametersResult['statement'];
          const updatedParameterValues = setParametersResult['statementParametersMap'];
          await db.execute(updatedStatement, updatedParameterValues!);
        }
        db.commit();
        result.setSuccess();
      } else {
        result.setSuccess({ value: true, message: 'No rows to insert.' });
      }
    } catch (ex:any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async updateRow({
    tableName,
    row,
    condition = "",
    parameters = {},
  }: {
    tableName: string;
    row: Record<string, any>;
    condition?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Update });
    let db: Connection | undefined;
    try {
      db = await this._getConnection();
      const columns = Object.keys(row);
      const setValues = columns.map((key, i) => `${key} = @p${i}`).join(", ");
      const statement = `UPDATE ${tableName} SET ${setValues} ${condition ? "WHERE " + condition : ""}`;

      const params: Record<string, any> = { ...parameters };
      for (let i = 0; i < columns.length; i++) {
        params[`@p${i}`] = row[columns[i]];
      }

      const setParametersResult = this.setSqlStatementParameters({
        statement,
        passedParameters: params,
      });
      const updatedStatement = setParametersResult['statement'];
      const updatedParameterValues = setParametersResult['statementParametersMap'];
      const [updateResult]: any = await db.execute(updatedStatement, updatedParameterValues!);
      result.affectedRowsCount = parseInt(updateResult.affectedRows);
      result.setSuccess();
    } catch (ex:any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }

  override async updateRows({
    tableName,
    rowsWithConditions,
  }: {
    tableName: string;
    rowsWithConditions: Array<Record<string, any>>;
  }): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult({ operation: AcEnumDDRowOperation.Update });
    let db: Connection | undefined;
    try {
      db = await this._getConnection();
      await db.beginTransaction();
      for (const rowWithCondition of rowsWithConditions) {
        if ('row' in rowWithCondition && 'condition' in rowWithCondition) {
          const row = rowWithCondition['row'] as Record<string, any>;
          const condition = rowWithCondition['condition'] as string;
          const conditionParameters = rowWithCondition['parameters'] ?? {};

          const columns = Object.keys(row);
          const setValues = columns.map((key, i) => `${key} = @p${i}`).join(", ");
          const statement = `UPDATE ${tableName} SET ${setValues} WHERE ${condition}`;

          const params: Record<string, any> = { ...conditionParameters };
          for (let i = 0; i < columns.length; i++) {
            params[`@p${i}`] = row[columns[i]];
          }

          const setParametersResult = this.setSqlStatementParameters({
            statement,
            passedParameters: params,
          });
          const updatedStatement = setParametersResult['statement'];
          const updatedParameterValues = setParametersResult['statementParametersMap'];
          const [updateResult]: any = await db.execute(updatedStatement, updatedParameterValues!);
          result.affectedRowsCount = (result.affectedRowsCount ?? 0) + parseInt(updateResult.affectedRows);
        }
      }
      result.setSuccess();
    } catch (ex:any) {
      result.setException({ exception: ex, stackTrace: ex.stack });
    } finally {
      await db!.end();
    }
    return result;
  }
}
