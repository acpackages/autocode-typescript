/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-prototype-builtins */
import { AcEnumLogType, AcLogger, AcResult } from "@autocode-ts/autocode";
import { AcEnumDDRowOperation, AcEnumDDSelectMode } from "@autocode-ts/ac-data-dictionary";
import { AcSqlCallbackArgs } from "../models/ac-sql-callback-args.model";
import { AcSqlConnection } from "../models/ac-sql-connection.model";
import { AcSqlDaoResult } from "../models/ac-sql-dao-result.model";
import { AcSqlOperation } from "../models/ac-sql-operation.model";
export class AcBaseSqlDao {
  logger: AcLogger;
  sqlConnection: AcSqlConnection;

  constructor() {
    this.logger = new AcLogger({ logType: AcEnumLogType.Print, logMessages: true });
    this.sqlConnection = new AcSqlConnection();
  }

  async checkDatabaseExist(): Promise<AcResult> {
    return new AcResult();
  }

  async checkFunctionExist({ functionName }: { functionName: string }): Promise<AcResult> {
    return new AcResult();
  }

  async checkStoredProcedureExist({ storedProcedureName }: { storedProcedureName: string }): Promise<AcResult> {
    return new AcResult();
  }

  async checkTableExist({ tableName }: { tableName: string }): Promise<AcResult> {
    return new AcResult();
  }

  async checkTriggerExist({ triggerName }: { triggerName: string }): Promise<AcResult> {
    return new AcResult();
  }

  async checkViewExist({ viewName }: { viewName: string }): Promise<AcResult> {
    return new AcResult();
  }

  async createDatabase(): Promise<AcResult> {
    return new AcResult();
  }

  async deleteRows({
    tableName,
    condition = '',
    parameters = {},
  }: {
    tableName: string;
    condition?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async dropExistingRelationships(): Promise<AcResult> {
    return new AcResult();
  }

  async executeMultipleSqlStatements({
    statements,
    parameters = {},
    perStatementCallback,
  }: {
    statements: string[];
    parameters?: Record<string, any>;
    perStatementCallback?: (args: AcSqlCallbackArgs) => void;
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async executeSqlOperations({
    operations,
    perOperationCallback,
  }: {
    operations: AcSqlOperation[];
    perOperationCallback?: (args: AcSqlCallbackArgs) => void;
  }): Promise<AcResult> {
    return new AcResult();
  }

  async executeStatement({
    statement,
    operation = AcEnumDDRowOperation.Unknown,
    parameters = {},
  }: {
    statement: string;
    operation?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  formatRow({
    row,
    columnFormats = {},
  }: {
    row: Record<string, any>;
    columnFormats?: Record<string, string[]>;
  }): Record<string, any> {
    return row;
  }

  getConnectionObject({ includeDatabase = true }: { includeDatabase?: boolean }): any {
    try {
      // Normally returns a connection object
    } catch (ex: any) {
      this.logger.log(`Error in getConnectionObject: ${ex.toString()}`);
    }
    return null;
  }

  async getDatabaseFunctions(): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async getDatabaseStoredProcedures(): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async getDatabaseTables(): Promise<AcSqlDaoResult> {
    const result = new AcSqlDaoResult();
    try {
      // Implement actual logic
    } catch (ex: any) {
      result.setException({ exception: ex });
    }
    return result;
  }

  async getDatabaseTriggers(): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async getDatabaseViews(): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async getRows({
    statement,
    condition = '',
    parameters = {},
    mode = AcEnumDDSelectMode.List,
    columnFormats = {},
  }: {
    statement: string;
    condition?: string;
    parameters?: Record<string, any>;
    mode?: string;
    columnFormats?: Record<string, string[]>;
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async getTableColumns({ tableName }: { tableName: string }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async getViewColumns({ viewName }: { viewName: string }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async insertRow({
    tableName,
    row,
  }: {
    tableName: string;
    row: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async insertRows({
    tableName,
    rows,
  }: {
    tableName: string;
    rows: Record<string, any>[];
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async setSqlConnection({ sqlConnection }: { sqlConnection: AcSqlConnection }): Promise<AcResult> {
    this.sqlConnection = sqlConnection;
    const result = new AcResult();
    result.setSuccess();
    return result;
  }

  async setSqlConnectionFromJson({ jsonData }: { jsonData: Record<string, any> }): Promise<AcResult> {
    this.sqlConnection = AcSqlConnection.instanceFromJson({ jsonData });
    return new AcResult();
  }

  setSqlStatementParameters({
    statement,
    statementParametersList,
    statementParametersMap,
    passedParameters,
    returnMap = true,
  }: {
    statement: string;
    statementParametersList?: any[];
    statementParametersMap?: Record<string, any>;
    passedParameters: Record<string, any>;
    returnMap?: boolean;
  }): {
    statement: string;
    statementParametersList?: any[];
    statementParametersMap?: Record<string, any>;
    passedParameters: Record<string, any>;
  } {
    if (returnMap) {
      statementParametersMap = statementParametersMap ?? {};
    } else {
      statementParametersList = statementParametersList ?? [];
    }

    const keys = Object.keys(passedParameters);
    for (const key of keys) {
      const value = passedParameters[key];
      if (!returnMap) {
        while (statement.includes(key)) {
          this.logger.log(`Searching For Key : ${key}`);
          this.logger.log(`SQL Statement : ${statement}`);
          this.logger.log(`Key Value: ${value?.toString()}`);
          const beforeQueryString = statement.substring(0, statement.indexOf(key));
          this.logger.log(`Before String in Statement Where Key is found: ${beforeQueryString}`);
          const parameterIndex = this._countOccurrences(beforeQueryString, '?');
          this.logger.log(`Parameter Index: ${parameterIndex}`);
          this.logger.log(`Values Before: ${JSON.stringify(statementParametersList)}`);
          if (Array.isArray(value)) {
            this.logger.log(`Value is array`);
            const replacement = new Array(value.length).fill('?').join(',');
            statement = statement.replace(new RegExp(this._escapeRegExp(key)), replacement);
            statementParametersList!.splice(parameterIndex, 0, ...value);
          } else {
            this.logger.log(`Value is not array`);
            statement = statement.replace(new RegExp(this._escapeRegExp(key)), '?');
            statementParametersList!.splice(parameterIndex, 0, value);
          }
          this.logger.log(`Statement : ${statement}`);
          this.logger.log(`Values After: ${JSON.stringify(statementParametersList)}`);
        }
      } else {
        let index = Object.keys(statementParametersMap!).length;
        let parameterKey = `parameter${index}`;
        while (statementParametersMap!.hasOwnProperty(parameterKey)) {
          index++;
          parameterKey = `parameter${index}`;
        }
        if (Array.isArray(value)) {
          this.logger.log(`Value is not array`);
          const placeholders: string[] = [];
          index--;
          for (const v of value) {
            index++;
            parameterKey = `parameter${index}`;
            placeholders.push(`:${parameterKey}`);
            statementParametersMap![parameterKey] = v;
          }
          statement = statement.replace(key, placeholders.join(","));
        } else {
          this.logger.log(`Value is not array`);
          statement = statement.replace(key, `:${parameterKey}`);
          statementParametersMap![parameterKey] = value;
        }

      }
    }

    return {
      statement,
      statementParametersList,
      statementParametersMap,
      passedParameters,
    };
  }

  async updateRow({
    tableName,
    row,
    condition = '',
    parameters = {},
  }: {
    tableName: string;
    row: Record<string, any>;
    condition?: string;
    parameters?: Record<string, any>;
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  async updateRows({
    tableName,
    rowsWithConditions,
  }: {
    tableName: string;
    rowsWithConditions: Record<string, any>[];
  }): Promise<AcSqlDaoResult> {
    return new AcSqlDaoResult();
  }

  private _countOccurrences(source: string, pattern: string): number {
    return (source.match(new RegExp(this._escapeRegExp(pattern), 'g')) || []).length;
  }

  private _escapeRegExp(string: string): string {
    // Escape special characters for regex usage
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
